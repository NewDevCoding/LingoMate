// Database schema from Supabase
export interface VocabularyDB {
  id: string;
  user_id: string;
  word: string;
  translation: string;
  language: string;
  created_at: string;
  updated_at: string;
  comprehension: number; // 1-5
}

// UI-friendly Vocabulary interface
export interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  language: string;
  comprehension: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

