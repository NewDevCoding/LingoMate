import { VocabularyReview, ReviewQuality } from '@/types/word';

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm used by Anki and other SRS systems
 */

export interface SRSState {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

/**
 * Default initial state for a new review entry
 */
export const DEFAULT_SRS_STATE: SRSState = {
  intervalDays: 1,
  easeFactor: 2.5,
  repetitions: 0,
};

/**
 * Calculate the next review state based on quality rating
 * 
 * Quality mapping (4-button system):
 * - 0 = Again (forgot) - maps to SM-2 quality 0
 * - 1 = Hard (remembered with difficulty) - maps to SM-2 quality 1
 * - 3 = Good (remembered correctly) - maps to SM-2 quality 3
 * - 4 = Easy (very easy) - maps to SM-2 quality 4
 * 
 * @param quality - Review quality (0, 1, 3, or 4)
 * @param currentState - Current SRS state
 * @returns New SRS state after review
 */
export function calculateNextReview(
  quality: ReviewQuality,
  currentState: SRSState
): SRSState {
  // Quality < 3 means the user failed to recall
  if (quality < 3) {
    // Failed - reset interval and decrease ease factor
    return {
      intervalDays: 1,
      easeFactor: Math.max(1.3, currentState.easeFactor - 0.2),
      repetitions: 0,
    };
  }

  // Passed - calculate new interval
  let newInterval: number;
  
  if (currentState.repetitions === 0) {
    // First successful review
    newInterval = 1;
  } else if (currentState.repetitions === 1) {
    // Second successful review
    newInterval = 6;
  } else {
    // Subsequent reviews: multiply previous interval by ease factor
    newInterval = Math.round(currentState.intervalDays * currentState.easeFactor);
  }

  // Update ease factor based on quality
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Where q is quality (0-5), but we use 0, 1, 3, 4
  const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEaseFactor = Math.max(1.3, currentState.easeFactor + easeChange);

  return {
    intervalDays: newInterval,
    easeFactor: newEaseFactor,
    repetitions: currentState.repetitions + 1,
  };
}

/**
 * Calculate next review date based on interval
 * 
 * @param intervalDays - Number of days until next review
 * @param fromDate - Date to calculate from (defaults to now)
 * @returns ISO string of next review date
 */
export function calculateNextReviewDate(
  intervalDays: number,
  fromDate: Date = new Date()
): string {
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate.toISOString();
}

/**
 * Check if a word is due for review
 * 
 * @param review - Review entry to check
 * @param currentDate - Current date (defaults to now)
 * @returns true if word is due for review
 */
export function isDueForReview(
  review: VocabularyReview | null,
  currentDate: Date = new Date()
): boolean {
  if (!review || !review.nextReviewDate) {
    // No review entry or no next review date means it's due (new word)
    return true;
  }

  const nextReview = new Date(review.nextReviewDate);
  return currentDate >= nextReview;
}

/**
 * Calculate days until review (can be negative if overdue)
 * 
 * @param review - Review entry
 * @param currentDate - Current date (defaults to now)
 * @returns Number of days until review (negative if overdue)
 */
export function daysUntilReview(
  review: VocabularyReview | null,
  currentDate: Date = new Date()
): number {
  if (!review || !review.nextReviewDate) {
    return 0; // Due now
  }

  const nextReview = new Date(review.nextReviewDate);
  const diffTime = nextReview.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Update review statistics after a review
 * 
 * @param review - Current review entry
 * @param quality - Quality rating
 * @param newState - New SRS state after calculation
 * @returns Updated review statistics
 */
export function updateReviewStats(
  review: VocabularyReview,
  quality: ReviewQuality,
  newState: SRSState
): Partial<VocabularyReview> {
  const passed = quality >= 3;
  
  return {
    intervalDays: newState.intervalDays,
    easeFactor: newState.easeFactor,
    repetitions: newState.repetitions,
    nextReviewDate: calculateNextReviewDate(newState.intervalDays),
    lastReviewedAt: new Date().toISOString(),
    reviewCount: review.reviewCount + 1,
    consecutiveCorrect: passed ? review.consecutiveCorrect + 1 : 0,
    consecutiveIncorrect: passed ? 0 : review.consecutiveIncorrect + 1,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Initialize a new review entry for a vocabulary word
 * 
 * @param vocabularyId - ID of the vocabulary word
 * @param userId - ID of the user
 * @returns Initial review data
 */
export function initializeReview(
  vocabularyId: string,
  userId: string
): Omit<VocabularyReview, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date();
  const nextReviewDate = calculateNextReviewDate(DEFAULT_SRS_STATE.intervalDays, now);

  return {
    vocabularyId,
    userId,
    intervalDays: DEFAULT_SRS_STATE.intervalDays,
    easeFactor: DEFAULT_SRS_STATE.easeFactor,
    repetitions: DEFAULT_SRS_STATE.repetitions,
    nextReviewDate,
    lastReviewedAt: null,
    reviewCount: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
  };
}
