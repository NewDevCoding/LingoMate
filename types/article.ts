export interface Article {
  id: string;
  title: string;
  progress: number; // percentage of new words (0-100)
  category: string; // e.g., "TED Ed Español", "Short stories"
  duration?: string; // e.g., "04:54"
  difficulty?: string; // e.g., "Advanced 1"
  newWordsCount?: number;
  views?: number;
  hasNotification?: boolean; // for blue dot icon
}
