import { NextRequest, NextResponse } from 'next/server';

interface TranslateRequest {
  text: string;
  sourceLang?: string;
  targetLang?: string;
}

/**
 * POST /api/roleplay/translate
 * Translates a message using Google Cloud Translation API
 */
export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, sourceLang = 'es', targetLang = 'en' } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_TRANSLATE_API_KEY is not set in .env.local');
      return NextResponse.json(
        { error: 'Translation service not configured. Please set GOOGLE_TRANSLATE_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Call Google Cloud Translation API
    const translateUrl = new URL('https://translation.googleapis.com/language/translate/v2');
    translateUrl.searchParams.append('key', apiKey);
    translateUrl.searchParams.append('q', text);
    translateUrl.searchParams.append('source', sourceLang);
    translateUrl.searchParams.append('target', targetLang);
    translateUrl.searchParams.append('format', 'text');

    const response = await fetch(translateUrl.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Translate API error:', errorText);
      return NextResponse.json(
        { error: 'Translation service error', details: errorText },
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

    const translation = data.data.translations[0].translatedText;

    return NextResponse.json({
      originalText: text,
      translatedText: translation.trim(),
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
