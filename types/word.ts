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

// Database schema for vocabulary_reviews table
export interface VocabularyReviewDB {
  id: string;
  vocabulary_id: string;
  user_id: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  next_review_date: string | null;
  last_reviewed_at: string | null;
  review_count: number;
  consecutive_correct: number;
  consecutive_incorrect: number;
  created_at: string;
  updated_at: string;
}

// UI-friendly VocabularyReview interface
export interface VocabularyReview {
  id: string;
  vocabularyId: string;
  userId: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  createdAt: string;
  updatedAt: string;
}

// Vocabulary with review information
export interface VocabularyWithReview extends Vocabulary {
  review?: VocabularyReview;
  isDueForReview: boolean;
  daysUntilReview?: number;
}

// Review quality rating (mapped to SM-2)
// 0 = Again (forgot)
// 1 = Hard (remembered with difficulty)
// 3 = Good (remembered correctly) - mapped from 2
// 4 = Easy (very easy to remember) - mapped from 3
export type ReviewQuality = 0 | 1 | 3 | 4;

// Review result for recording a review
export interface ReviewResult {
  vocabularyId: string;
  quality: ReviewQuality;
  responseTime?: number; // milliseconds
  reviewedAt: string;
}
