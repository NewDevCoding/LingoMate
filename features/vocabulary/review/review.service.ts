import { VocabularyReview, VocabularyReviewDB, VocabularyWithReview, ReviewQuality } from '@/types/word';
import { supabase } from '@/lib/db/client';
import {
  calculateNextReview,
  updateReviewStats,
  initializeReview as initReview,
  isDueForReview,
  daysUntilReview,
} from '@/lib/learning/srs.engine';

/**
 * Get the current user ID from Supabase auth or localStorage
 */
async function getUserId(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
  } catch (error) {
    console.log('No authenticated user found');
  }

  if (typeof window !== 'undefined') {
    let tempUserId = localStorage.getItem('lingomate_temp_user_id');
    if (!tempUserId) {
      tempUserId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      localStorage.setItem('lingomate_temp_user_id', tempUserId);
    }
    return tempUserId;
  }

  return '00000000-0000-0000-0000-000000000000';
}

/**
 * Transform database review to UI review
 */
function transformReview(dbReview: VocabularyReviewDB): VocabularyReview {
  return {
    id: dbReview.id,
    vocabularyId: dbReview.vocabulary_id,
    userId: dbReview.user_id,
    intervalDays: dbReview.interval_days,
    easeFactor: Number(dbReview.ease_factor),
    repetitions: dbReview.repetitions,
    nextReviewDate: dbReview.next_review_date,
    lastReviewedAt: dbReview.last_reviewed_at,
    reviewCount: dbReview.review_count,
    consecutiveCorrect: dbReview.consecutive_correct,
    consecutiveIncorrect: dbReview.consecutive_incorrect,
    createdAt: dbReview.created_at,
    updatedAt: dbReview.updated_at,
  };
}

/**
 * Get review entry for a vocabulary word
 */
export async function getReviewByVocabularyId(
  vocabularyId: string
): Promise<VocabularyReview | null> {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('vocabulary_reviews')
      .select('*')
      .eq('vocabulary_id', vocabularyId)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching review:', error);
      return null;
    }

    return data ? transformReview(data) : null;
  } catch (error) {
    console.error('Error fetching review:', error);
    return null;
  }
}

/**
 * Initialize a review entry for a vocabulary word
 * Creates a new review entry if one doesn't exist
 */
export async function initializeReview(vocabularyId: string): Promise<VocabularyReview | null> {
  try {
    const userId = await getUserId();
    
    // Check if review already exists
    const existing = await getReviewByVocabularyId(vocabularyId);
    if (existing) {
      return existing;
    }

    // Create new review entry
    const reviewData = initReview(vocabularyId, userId);
    const { data, error } = await supabase
      .from('vocabulary_reviews')
      .insert({
        vocabulary_id: reviewData.vocabularyId,
        user_id: reviewData.userId,
        interval_days: reviewData.intervalDays,
        ease_factor: reviewData.easeFactor,
        repetitions: reviewData.repetitions,
        next_review_date: reviewData.nextReviewDate,
        last_reviewed_at: reviewData.lastReviewedAt,
        review_count: reviewData.reviewCount,
        consecutive_correct: reviewData.consecutiveCorrect,
        consecutive_incorrect: reviewData.consecutiveIncorrect,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error initializing review:', error);
      return null;
    }

    return data ? transformReview(data) : null;
  } catch (error) {
    console.error('Error initializing review:', error);
    return null;
  }
}

/**
 * Record a review result and update SRS state
 */
export async function recordReview(
  vocabularyId: string,
  quality: ReviewQuality
): Promise<VocabularyReview | null> {
  try {
    const userId = await getUserId();
    
    // Get existing review or create one
    let review = await getReviewByVocabularyId(vocabularyId);
    if (!review) {
      review = await initializeReview(vocabularyId);
      if (!review) {
        console.error('Failed to initialize review');
        return null;
      }
    }

    // Calculate new SRS state
    const currentState = {
      intervalDays: review.intervalDays,
      easeFactor: review.easeFactor,
      repetitions: review.repetitions,
    };
    const newState = calculateNextReview(quality, currentState);

    // Update statistics
    const updates = updateReviewStats(review, quality, newState);

    // Update in database
    const { data, error } = await supabase
      .from('vocabulary_reviews')
      .update({
        interval_days: updates.intervalDays,
        ease_factor: updates.easeFactor,
        repetitions: updates.repetitions,
        next_review_date: updates.nextReviewDate,
        last_reviewed_at: updates.lastReviewedAt,
        review_count: updates.reviewCount,
        consecutive_correct: updates.consecutiveCorrect,
        consecutive_incorrect: updates.consecutiveIncorrect,
        updated_at: updates.updatedAt,
      })
      .eq('id', review.id)
      .select()
      .single();

    if (error) {
      console.error('Error recording review:', error);
      return null;
    }

    return data ? transformReview(data) : null;
  } catch (error) {
    console.error('Error recording review:', error);
    return null;
  }
}

/**
 * Get all vocabulary words that are due for review
 */
export async function getDueWords(limit?: number): Promise<VocabularyWithReview[]> {
  try {
    const userId = await getUserId();
    const now = new Date();

    // First, get all vocabulary for the user
    const { data: vocabData, error: vocabError } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('user_id', userId);

    if (vocabError) {
      console.error('Error fetching vocabulary:', vocabError);
      return [];
    }

    if (!vocabData || vocabData.length === 0) {
      return [];
    }

    // Get all reviews for these vocabulary words
    const vocabIds = vocabData.map(v => v.id);
    const { data: reviewData, error: reviewError } = await supabase
      .from('vocabulary_reviews')
      .select('*')
      .eq('user_id', userId)
      .in('vocabulary_id', vocabIds);

    if (reviewError) {
      console.error('Error fetching reviews:', reviewError);
      // Continue without reviews - words without reviews are due
    }

    // Create a map of vocabulary_id -> review for quick lookup
    const reviewMap = new Map<string, VocabularyReviewDB>();
    if (reviewData) {
      for (const review of reviewData) {
        reviewMap.set(review.vocabulary_id, review);
      }
    }

    // Filter vocabulary to only those that are due
    const dueWords: VocabularyWithReview[] = [];

    for (const vocab of vocabData) {
      const review = reviewMap.get(vocab.id);
      const reviewObj = review ? transformReview(review) : null;
      
      // Check if due: no review OR next_review_date is null OR next_review_date <= now
      const isDue = !review || 
                    !review.next_review_date || 
                    new Date(review.next_review_date) <= now;

      if (isDue) {
        const vocabObj = {
          id: vocab.id,
          word: vocab.word,
          translation: vocab.translation,
          language: vocab.language,
          comprehension: vocab.comprehension,
          createdAt: vocab.created_at,
          updatedAt: vocab.updated_at,
        };

        const daysUntil = daysUntilReview(reviewObj, now);

        dueWords.push({
          ...vocabObj,
          review: reviewObj || undefined,
          isDueForReview: true,
          daysUntilReview: daysUntil,
        });
      }
    }

    // Sort by next_review_date (nulls first, then by date)
    dueWords.sort((a, b) => {
      if (!a.review?.nextReviewDate && !b.review?.nextReviewDate) return 0;
      if (!a.review?.nextReviewDate) return -1;
      if (!b.review?.nextReviewDate) return 1;
      return new Date(a.review.nextReviewDate).getTime() - new Date(b.review.nextReviewDate).getTime();
    });

    // Apply limit if specified
    if (limit && limit > 0) {
      return dueWords.slice(0, limit);
    }

    return dueWords;
  } catch (error) {
    console.error('Error fetching due words:', error);
    return [];
  }
}

/**
 * Get count of words due for review
 */
export async function getDueWordsCount(): Promise<number> {
  try {
    const words = await getDueWords();
    return words.length;
  } catch (error) {
    console.error('Error getting due words count:', error);
    return 0;
  }
}

/**
 * Initialize reviews for all vocabulary words that don't have reviews yet
 * This is used for migration/initialization
 */
export async function initializeAllReviews(): Promise<number> {
  try {
    const userId = await getUserId();
    
    // Get all vocabulary without reviews
    const { data: vocabData, error: vocabError } = await supabase
      .from('vocabulary')
      .select('id')
      .eq('user_id', userId);

    if (vocabError) {
      console.error('Error fetching vocabulary:', vocabError);
      return 0;
    }

    if (!vocabData || vocabData.length === 0) {
      return 0;
    }

    // Get existing reviews
    const { data: reviewData, error: reviewError } = await supabase
      .from('vocabulary_reviews')
      .select('vocabulary_id')
      .eq('user_id', userId);

    if (reviewError) {
      console.error('Error fetching reviews:', reviewError);
      return 0;
    }

    const existingReviewIds = new Set(
      (reviewData || []).map((r: any) => r.vocabulary_id)
    );

    // Find vocabulary without reviews
    const vocabWithoutReviews = vocabData.filter(
      (v: any) => !existingReviewIds.has(v.id)
    );

    if (vocabWithoutReviews.length === 0) {
      return 0;
    }

    // Initialize reviews for all vocabulary without reviews
    const reviewsToCreate = vocabWithoutReviews.map((v: any) => {
      const reviewData = initReview(v.id, userId);
      return {
        vocabulary_id: reviewData.vocabularyId,
        user_id: reviewData.userId,
        interval_days: reviewData.intervalDays,
        ease_factor: reviewData.easeFactor,
        repetitions: reviewData.repetitions,
        next_review_date: reviewData.nextReviewDate,
        last_reviewed_at: reviewData.lastReviewedAt,
        review_count: reviewData.reviewCount,
        consecutive_correct: reviewData.consecutiveCorrect,
        consecutive_incorrect: reviewData.consecutiveIncorrect,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const { error: insertError } = await supabase
      .from('vocabulary_reviews')
      .insert(reviewsToCreate);

    if (insertError) {
      console.error('Error initializing reviews:', insertError);
      return 0;
    }

    return reviewsToCreate.length;
  } catch (error) {
    console.error('Error initializing all reviews:', error);
    return 0;
  }
}
