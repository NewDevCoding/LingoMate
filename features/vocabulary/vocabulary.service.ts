import { Vocabulary, VocabularyDB } from '@/types/word';
import { supabase } from '@/lib/db/client';
import { initializeReview } from '@/features/vocabulary/review/review.service';

/**
 * Get the current user ID from Supabase auth or localStorage
 * Returns a consistent user ID for the session
 */
async function getUserId(): Promise<string> {
  // Try to get authenticated user from Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
  } catch (error) {
    console.log('No authenticated user found');
  }

  // If no auth user, use localStorage to store a temporary user ID
  if (typeof window !== 'undefined') {
    let tempUserId = localStorage.getItem('lingomate_temp_user_id');
    if (!tempUserId) {
      // Generate a UUID v4
      tempUserId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      localStorage.setItem('lingomate_temp_user_id', tempUserId);
    }
    return tempUserId;
  }

  // Fallback for server-side (shouldn't happen in client components)
  return '00000000-0000-0000-0000-000000000000';
}

/**
 * Transform database vocabulary to UI vocabulary
 */
function transformVocabulary(dbVocab: VocabularyDB): Vocabulary {
  return {
    id: dbVocab.id,
    word: dbVocab.word,
    translation: dbVocab.translation,
    language: dbVocab.language,
    comprehension: dbVocab.comprehension,
    createdAt: dbVocab.created_at,
    updatedAt: dbVocab.updated_at,
  };
}

/**
 * Fetch all vocabulary for the current user
 */
export async function getVocabulary(): Promise<Vocabulary[]> {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vocabulary:', error);
      return [];
    }

    return (data || []).map(transformVocabulary);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return [];
  }
}

/**
 * Get vocabulary by word (case-insensitive)
 */
export async function getVocabularyByWord(word: string): Promise<Vocabulary | null> {
  try {
    const userId = await getUserId();
    const normalizedWord = word.toLowerCase().trim();
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('user_id', userId)
      .eq('word', normalizedWord)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching vocabulary by word:', error);
      return null;
    }

    return data ? transformVocabulary(data) : null;
  } catch (error) {
    console.error('Error fetching vocabulary by word:', error);
    return null;
  }
}

/**
 * Create or update vocabulary entry
 */
export async function upsertVocabulary(
  word: string,
  comprehension: number,
  translation?: string
): Promise<Vocabulary | null> {
  try {
    const userId = await getUserId();
    // Check if word already exists
    const existing = await getVocabularyByWord(word);

    const vocabularyData = {
      user_id: userId,
      word: word.toLowerCase().trim(),
      translation: translation || 'Translation placeholder',
      language: 'placeholder', // Will be replaced with actual language later
      comprehension,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      // Update existing entry
      const { data, error } = await supabase
        .from('vocabulary')
        .update({
          comprehension,
          translation: translation || existing.translation,
          updated_at: vocabularyData.updated_at,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vocabulary:', error);
        return null;
      }

      return data ? transformVocabulary(data) : null;
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('vocabulary')
        .insert({
          ...vocabularyData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating vocabulary:', error);
        return null;
      }

      const newVocabulary = data ? transformVocabulary(data) : null;
      
      // Auto-initialize review entry for new vocabulary
      if (newVocabulary) {
        initializeReview(newVocabulary.id).catch((err) => {
          console.error('Error auto-initializing review:', err);
          // Don't fail vocabulary creation if review init fails
        });
      }

      return newVocabulary;
    }
  } catch (error) {
    console.error('Error upserting vocabulary:', error);
    return null;
  }
}

/**
 * Update vocabulary comprehension status
 */
export async function updateVocabularyComprehension(
  id: string,
  comprehension: number
): Promise<Vocabulary | null> {
  try {
    const { data, error } = await supabase
      .from('vocabulary')
      .update({
        comprehension,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vocabulary comprehension:', error);
      return null;
    }

    return data ? transformVocabulary(data) : null;
  } catch (error) {
    console.error('Error updating vocabulary comprehension:', error);
    return null;
  }
}

/**
 * Batch fetch vocabulary for multiple words
 * Returns a Map<word, Vocabulary> for efficient O(1) lookup
 * Normalizes words to lowercase for consistent matching
 */
export async function getVocabularyForWords(
  words: string[]
): Promise<Map<string, Vocabulary>> {
  try {
    const userId = await getUserId();
    
    // Normalize words to lowercase and remove duplicates
    const normalizedWords = Array.from(
      new Set(words.map(word => word.toLowerCase().trim()).filter(word => word.length > 0))
    );

    if (normalizedWords.length === 0) {
      return new Map();
    }

    // Fetch all matching vocabulary entries in one query
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('user_id', userId)
      .in('word', normalizedWords);

    if (error) {
      console.error('Error fetching vocabulary for words:', error);
      return new Map();
    }

    // Build a Map for O(1) lookup
    const vocabularyMap = new Map<string, Vocabulary>();
    
    if (data) {
      for (const dbVocab of data) {
        const vocab = transformVocabulary(dbVocab);
        vocabularyMap.set(vocab.word.toLowerCase(), vocab);
      }
    }

    return vocabularyMap;
  } catch (error) {
    console.error('Error fetching vocabulary for words:', error);
    return new Map();
  }
}

/**
 * Delete vocabulary entry
 */
export async function deleteVocabulary(id: string): Promise<boolean> {
  try {
    const userId = await getUserId();
    const { error } = await supabase
      .from('vocabulary')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting vocabulary:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return false;
  }
}

