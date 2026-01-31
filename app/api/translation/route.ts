import { NextRequest, NextResponse } from 'next/server';

interface TranslationRequest {
  word: string;
  sourceLang?: string;
  targetLang?: string;
  context?: string;
}

interface TranslationResponse {
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  word: string;
}

/**
 * POST /api/translation
 * Translates a word using Google Cloud Translation API
 */
export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { word, sourceLang = 'es', targetLang = 'en', context } = body;

    if (!word || !word.trim()) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_TRANSLATE_API_KEY is not set');
      return NextResponse.json(
        { error: 'Translation service not configured' },
        { status: 500 }
      );
    }

    // Build text to translate (word with optional context)
    const textToTranslate = context ? `${context} [${word}]` : word;

    // Call Google Cloud Translation API
    const translateUrl = new URL('https://translation.googleapis.com/language/translate/v2');
    translateUrl.searchParams.append('key', apiKey);
    translateUrl.searchParams.append('q', textToTranslate);
    translateUrl.searchParams.append('source', sourceLang);
    translateUrl.searchParams.append('target', targetLang);
    translateUrl.searchParams.append('format', 'text');

    const response = await fetch(translateUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Translate API error:', errorText);
      return NextResponse.json(
        { error: 'Translation service error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.data || !data.data.translations || data.data.translations.length === 0) {
      return NextResponse.json(
        { error: 'No translation found' },
        { status: 404 }
      );
    }

    // Extract translation (remove context if present)
    let translation = data.data.translations[0].translatedText;
    
    // If context was provided, extract just the word translation
    // The API might return the full sentence, so we try to extract just the word
    if (context) {
      // Simple heuristic: if translation contains brackets, extract content
      const bracketMatch = translation.match(/\[([^\]]+)\]/);
      if (bracketMatch) {
        translation = bracketMatch[1];
      } else {
        // Otherwise, try to find the word in the translated context
        // For now, just use the full translation and let the client handle it
        // In a more sophisticated version, we could use NLP to extract just the word
      }
    }

    const result: TranslationResponse = {
      translation: translation.trim(),
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      word: word.trim(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
