import { Article, ArticleDB } from '@/types/article';
import { supabase } from '@/lib/db/client';

/**
 * Fetch all articles from Supabase
 */
export async function getArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('inserted_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    // Transform DB articles to UI articles
    return (data || []).map((article: ArticleDB) => ({
      ...article,
      // TODO: Calculate progress, category, etc. from user progress data
      progress: 0,
      category: extractCategoryFromUrl(article.url),
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Fetch a single article by ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }

    return {
      ...data,
      progress: 0,
      category: extractCategoryFromUrl(data.url),
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

/**
 * Search articles by query
 */
export async function searchArticles(query: string): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
      .order('inserted_at', { ascending: false });

    if (error) {
      console.error('Error searching articles:', error);
      return [];
    }

    return (data || []).map((article: ArticleDB) => ({
      ...article,
      progress: 0,
      category: extractCategoryFromUrl(article.url),
    }));
  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
}

/**
 * Extract category from URL (helper function)
 * Can be enhanced to extract from URL patterns or add a category field to DB
 */
function extractCategoryFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Extract category from common patterns
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'YouTube';
    }
    if (hostname.includes('ted.com')) {
      return 'TED';
    }
    if (hostname.includes('netflix.com')) {
      return 'Netflix';
    }
    
    return hostname.replace('www.', '');
  } catch {
    return 'Article';
  }
}

// Legacy mock data functions (for fallback/development)
export const mockArticles: Article[] = [];
