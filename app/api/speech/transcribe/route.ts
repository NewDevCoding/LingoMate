import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/speech/transcribe
 * 
 * Transcribes audio to text using Google Cloud Speech-to-Text API
 * 
 * Request: FormData with:
 * - audio: Blob/File (audio recording)
 * - language: string (optional, e.g., "es", "en")
 * 
 * Response:
 * {
 *   text: string,
 *   language: string,
 *   confidence?: number
 * }
 */

/**
 * Get language code for Google Speech-to-Text API
 */
function getLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'es': 'es-ES',
    'en': 'en-US',
    'fr': 'fr-FR',
    'de': 'de-DE',
  };
  
  return languageMap[language] || 'es-ES';
}

/**
 * Detect audio encoding from MIME type
 */
function getAudioEncoding(mimeType: string): string {
  if (mimeType.includes('webm')) {
    return 'WEBM_OPUS';
  } else if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
    return 'MP4';
  } else if (mimeType.includes('ogg')) {
    return 'OGG_OPUS';
  } else if (mimeType.includes('wav')) {
    return 'LINEAR16';
  } else if (mimeType.includes('flac')) {
    return 'FLAC';
  }
  // Default to webm opus (most common from MediaRecorder)
  return 'WEBM_OPUS';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'es';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Get API key (reuse TTS key or use dedicated STT key)
    const apiKey = process.env.GOOGLE_STT_API_KEY || process.env.GOOGLE_TTS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Google Speech-to-Text API key not configured',
          message: 'Please set GOOGLE_STT_API_KEY or GOOGLE_TTS_API_KEY in .env.local'
        },
        { status: 500 }
      );
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    // Get language code and audio encoding
    const languageCode = getLanguageCode(language);
    const encoding = getAudioEncoding(audioFile.type || 'audio/webm');

    // Prepare request body for Google Speech-to-Text API
    const requestBody = {
      config: {
        encoding: encoding,
        sampleRateHertz: 48000, // Common sample rate for web audio
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
        model: 'latest_long', // Use latest long model for better accuracy
      },
      audio: {
        content: base64Audio,
      },
    };

    // Call Google Speech-to-Text API
    // Note: Make sure Cloud Speech-to-Text API is enabled in Google Cloud Console
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Log response for debugging
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google STT API response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Google STT API error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to transcribe audio',
          message: error.error?.message || 'Google Speech-to-Text API error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract transcription from response
    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { 
          error: 'No transcription results',
          message: 'The audio could not be transcribed. Please try again.'
        },
        { status: 400 }
      );
    }

    // Get the best transcription result
    const result = data.results[0];
    const alternative = result.alternatives?.[0];
    
    if (!alternative || !alternative.transcript) {
      return NextResponse.json(
        { 
          error: 'No transcript found',
          message: 'The audio could not be transcribed. Please try again.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: alternative.transcript.trim(),
      language: language,
      confidence: alternative.confidence || undefined,
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', message: error.message },
      { status: 500 }
    );
  }
}
