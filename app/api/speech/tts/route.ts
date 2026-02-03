import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech, TTSOptions } from '@/lib/speech/tts';

interface TTSRequest {
  text: string;
  language?: string;
  voiceName?: string;
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
}

/**
 * POST /api/speech/tts
 * 
 * Synthesizes speech from text using Google Cloud TTS or browser fallback
 * 
 * Request body:
 * {
 *   text: string,
 *   language?: string (default: 'es'),
 *   voiceName?: string,
 *   speakingRate?: number (0.25-4.0, default: 1.0),
 *   pitch?: number (-20.0 to 20.0, default: 0.0),
 *   volumeGainDb?: number (-96.0 to 16.0, default: 0.0)
 * }
 * 
 * Response:
 * - If Google TTS: Returns audio blob (MP3)
 * - If browser TTS: Returns JSON with instructions to use browser API
 */
export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (body.text.length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse
    if (body.text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    const options: TTSOptions = {
      language: body.language || 'es',
      voiceName: body.voiceName,
      speakingRate: body.speakingRate,
      pitch: body.pitch,
      volumeGainDb: body.volumeGainDb,
    };

    try {
      const audioBuffer = await synthesizeSpeech(body.text, options);

      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (ttsError) {
      // If Google TTS fails (e.g., no API key), return JSON indicating browser fallback
      if (ttsError instanceof Error && ttsError.message.includes('not configured')) {
        return NextResponse.json({
          method: 'browser',
          text: body.text,
          options,
          message: 'Google TTS not configured, use browser TTS on client side',
        }, {
          status: 200, // Still return 200, but with JSON indicating fallback
        });
      }
      throw ttsError;
    }
  } catch (error) {
    console.error('TTS API error:', error);
    
    if (error instanceof Error) {
      // Check if it's a configuration error
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { 
            error: 'TTS service not configured',
            message: 'Google TTS API key not found. Using browser TTS fallback.',
            method: 'browser',
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
