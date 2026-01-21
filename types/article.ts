// Database schema from Supabase
export interface ArticleDB {
  id: string;
  title: string;
  url: string;
  date: string;
  description: string;
  content: string;
  inserted_at: string;
  image: string;
}

// UI-friendly Article interface (extends DB schema with computed/UI fields)
export interface Article {
  id: string;
  title: string;
  url: string;
  date: string;
  description: string;
  content: string;
  inserted_at: string;
  image: string;
  // Computed/UI fields (can be calculated from user progress data)
  progress?: number; // percentage of new words (0-100)
  category?: string; // e.g., "TED Ed Español", "Short stories"
  duration?: string; // e.g., "04:54"
  difficulty?: string; // e.g., "Advanced 1"
  newWordsCount?: number;
  views?: number;
  hasNotification?: boolean; // for blue dot icon
}
