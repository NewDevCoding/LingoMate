/**
 * Translation Service
 * Client-side service for fetching word translations
 */

export interface TranslationResult {
  word: string;
  translation: string;
  meanings?: string[]; // Multiple meanings/definitions
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationOptions {
  sourceLang?: string;
  targetLang?: string;
  context?: string;
  useCache?: boolean;
}

// Simple in-memory cache (can be enhanced with localStorage)
const translationCache = new Map<string, TranslationResult>();

/**
 * Get translation for a word
 * @param word - The word to translate
 * @param options - Translation options (sourceLang, targetLang, context)
 * @returns Translation result or null if error
 */
export async function getTranslation(
  word: string,
  options: TranslationOptions = {}
): Promise<TranslationResult | null> {
  const {
    sourceLang = 'es',
    targetLang = 'en',
    context,
    useCache = true,
  } = options;

  // Normalize word for caching
  const normalizedWord = word.toLowerCase().trim();
  const cacheKey = `${normalizedWord}:${sourceLang}:${targetLang}`;

  // Check cache first
  if (useCache && translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey)!;
    return cached;
  }

  try {
    const response = await fetch('/api/translation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: normalizedWord,
        sourceLang,
        targetLang,
        context,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Translation API error:', error);
      return null;
    }

    const result: TranslationResult = await response.json();

    // Cache the result
    if (useCache) {
      translationCache.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error('Error fetching translation:', error);
    return null;
  }
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cached translation (if available)
 */
export function getCachedTranslation(
  word: string,
  sourceLang: string = 'es',
  targetLang: string = 'en'
): TranslationResult | null {
  const normalizedWord = word.toLowerCase().trim();
  const cacheKey = `${normalizedWord}:${sourceLang}:${targetLang}`;
  return translationCache.get(cacheKey) || null;
}
