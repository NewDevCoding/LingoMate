import { Article } from '@/types/article';

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Biodiesel: La segunda vida del aceite - Natascia Rodice...',
    progress: 0,
    category: 'TED Ed Español',
    duration: '04:54',
    difficulty: 'Advanced 1',
  },
  {
    id: '2',
    title: 'Don Quijote - Introducción',
    progress: 12,
    category: 'Don Quijote - Easy Spanish',
  },
  {
    id: '3',
    title: 'El Reino de las Sombras',
    progress: 29,
    category: 'Short stories',
    hasNotification: true,
  },
  {
    id: '4',
    title: 'Cómo Sobrevivir Soltero Si: El Dumped2',
    progress: 30,
    category: 'primevideo.com',
    hasNotification: true,
  },
  {
    id: '5',
    title: '1b - Miguel es cocinero, parte 2',
    progress: 2,
    category: 'LingQ Mini Stories Latin American...',
  },
  {
    id: '6',
    title: 'El toque de la caracola (1)',
    progress: 30,
    category: 'El señor de los moscos William...',
    hasNotification: true,
  },
  {
    id: '7',
    title: 'La Nave',
    progress: 34,
    category: 'Short stories',
    views: 13,
    hasNotification: true,
  },
  {
    id: '8',
    title: 'El señor de los moscos William Goulding (Lord of the Flies)',
    progress: 67,
    category: 'Short stories',
    views: 36,
  },
  {
    id: '9',
    title: 'El Principito (adaptado) Antoine de Saint-Exupéry',
    progress: 31,
    category: 'Short stories',
    views: 12,
  },
  {
    id: '10',
    title: 'Short stories',
    progress: 29,
    category: 'Short stories',
  },
  {
    id: '11',
    title: 'Short stories',
    progress: 29,
    category: 'Short stories',
  },
  {
    id: '12',
    title: 'Short stories',
    progress: 29,
    category: 'Short stories',
  },
];

export const getArticlesByCategory = (category?: string): Article[] => {
  if (!category) return mockArticles;
  return mockArticles.filter(article => article.category === category);
};

export const searchArticles = (query: string): Article[] => {
  const lowerQuery = query.toLowerCase();
  return mockArticles.filter(
    article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.category.toLowerCase().includes(lowerQuery)
  );
};
