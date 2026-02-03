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
 * Google Speech-to-Text API encoding values:
 * - WEBM_OPUS: WebM container with Opus codec
 * - MP4: MP4 container
 * - OGG_OPUS: OGG container with Opus codec
 * - LINEAR16: Uncompressed 16-bit PCM WAV
 * - FLAC: Free Lossless Audio Codec
 */
function getAudioEncoding(mimeType: string): string {
  // Handle full MIME types like 'audio/webm;codecs=opus'
  const normalizedType = mimeType.toLowerCase().split(';')[0];
  
  if (normalizedType.includes('webm')) {
    // Check if it's specifically opus codec
    if (mimeType.toLowerCase().includes('opus')) {
      return 'WEBM_OPUS';
    }
    // Default webm might be vorbis, but we'll try opus
    return 'WEBM_OPUS';
  } else if (normalizedType.includes('mp4') || normalizedType.includes('m4a')) {
    return 'MP4';
  } else if (normalizedType.includes('ogg')) {
    if (mimeType.toLowerCase().includes('opus')) {
      return 'OGG_OPUS';
    }
    return 'OGG_OPUS'; // Default OGG to opus
  } else if (normalizedType.includes('wav')) {
    return 'LINEAR16';
  } else if (normalizedType.includes('flac')) {
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
    const keySource = process.env.GOOGLE_STT_API_KEY ? 'GOOGLE_STT_API_KEY' : 'GOOGLE_TTS_API_KEY';
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Google Speech-to-Text API key not configured',
          message: 'Please set GOOGLE_STT_API_KEY or GOOGLE_TTS_API_KEY in .env.local'
        },
        { status: 500 }
      );
    }
    
    console.log(`Using API key from: ${keySource}`);

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Validate audio file size (max 10MB for API)
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: 'Empty audio file' },
        { status: 400 }
      );
    }
    
    // Audio files that are too small (less than 1KB) are likely empty or corrupted
    if (buffer.length < 1024) {
      console.warn(`Audio file is very small: ${buffer.length} bytes. This might cause transcription to fail.`);
    }
    
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large (max 10MB)' },
        { status: 400 }
      );
    }
    
    const base64Audio = buffer.toString('base64');

    // Get language code and audio encoding
    const languageCode = getLanguageCode(language);
    const encoding = getAudioEncoding(audioFile.type || 'audio/webm');
    
    console.log(`Audio file type: ${audioFile.type}, encoding: ${encoding}, language: ${languageCode}`);

    // For container formats (WEBM_OPUS, MP4, OGG_OPUS), sampleRateHertz is not needed
    // It's only required for raw audio formats (LINEAR16, FLAC)
    const isContainerFormat = ['WEBM_OPUS', 'MP4', 'OGG_OPUS'].includes(encoding);
    
    // Prepare request body for Google Speech-to-Text API
    const config: any = {
      encoding: encoding,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
    };
    
    // Only include sampleRateHertz for raw audio formats
    if (!isContainerFormat) {
      config.sampleRateHertz = 48000; // Common sample rate for web audio
    }
    
    // Try using the latest_long model (may not be available for all encodings)
    // If this causes issues, we can remove it
    // config.model = 'latest_long';
    
    const requestBody = {
      config,
      audio: {
        content: base64Audio,
      },
    };

    // Log request details (without full audio content)
    console.log('Request config:', JSON.stringify(config, null, 2));
    console.log(`Audio size: ${buffer.length} bytes, base64 length: ${base64Audio.length}`);

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

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      try {
        if (errorText) {
          errorData = JSON.parse(errorText);
        }
      } catch (e) {
        errorData = { raw: errorText };
      }
      
      console.error('Google STT API error response:', {
        status: response.status,
        statusText: response.statusText,
        fullError: errorData,
        errorMessage: errorData.error?.message || errorData.message || 'Unknown error',
      });
      
      // Return a more descriptive error
      const errorMessage = errorData.error?.message || 
                          errorData.message || 
                          errorData.error || 
                          'Google Speech-to-Text API error';
      
      // Provide helpful guidance for common errors
      let helpfulMessage = errorMessage;
      if (response.status === 403) {
        if (errorMessage.includes('blocked') || errorMessage.includes('PERMISSION_DENIED')) {
          helpfulMessage = 'Speech-to-Text API access denied. Please ensure: 1) Speech-to-Text API is enabled in Google Cloud Console, 2) API key has proper permissions, 3) Billing is enabled for your project.';
        }
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to transcribe audio',
          message: helpfulMessage,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log the full response from Google for debugging
    console.log('Google STT API success response:', {
      hasResults: !!data.results,
      resultsLength: data.results?.length || 0,
      fullResponse: JSON.stringify(data, null, 2).substring(0, 1000), // First 1000 chars
    });

    // Extract transcription from response
    if (!data.results || data.results.length === 0) {
      console.warn('Google returned empty results. Full response:', JSON.stringify(data, null, 2));
      console.warn('Request details:', {
        encoding,
        languageCode,
        audioSize: buffer.length,
        audioType: audioFile.type,
      });
      
      // Check if there are any error messages in the response
      const errorHint = data.error?.message || data.error || '';
      
      return NextResponse.json(
        { 
          error: 'No transcription results',
          message: `The audio could not be transcribed. ${errorHint ? `Google API hint: ${errorHint}. ` : ''}Possible reasons: 1) Audio is too short or silent, 2) Audio format not supported, 3) Language code incorrect, 4) Audio encoding issue. Audio size: ${buffer.length} bytes, Type: ${audioFile.type}, Encoding: ${encoding}`,
          details: {
            audioSize: buffer.length,
            audioType: audioFile.type,
            encoding,
            languageCode,
            googleResponse: data
          }
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
