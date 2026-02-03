/**
 * Text-to-Speech Service
 * 
 * Provides TTS functionality using Google Cloud TTS API (primary)
 * and browser Web Speech API (fallback)
 */

export interface TTSOptions {
  language?: string;
  voiceName?: string;
  speakingRate?: number; // 0.25 to 4.0, default 1.0
  pitch?: number; // -20.0 to 20.0, default 0.0
  volumeGainDb?: number; // -96.0 to 16.0, default 0.0
}

export interface TTSResult {
  audioUrl: string;
  method: 'google' | 'browser';
}

/**
 * Get the best voice for a given language
 */
function getVoiceForLanguage(language: string): string {
  const voices: Record<string, string> = {
    'es': 'es-ES-Neural2-A', // Best quality Spanish female voice
    'es-ES': 'es-ES-Neural2-A',
    'es-MX': 'es-MX-Neural2-A',
    'es-US': 'es-US-Neural2-A',
    'en': 'en-US-Neural2-F',
    'en-US': 'en-US-Neural2-F',
    'fr': 'fr-FR-Neural2-A',
    'de': 'de-DE-Neural2-A',
  };
  
  return voices[language] || voices['es'] || 'es-ES-Neural2-A';
}

/**
 * Get language code for Google TTS API
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
 * Synthesize speech using Google Cloud TTS API
 */
async function synthesizeWithGoogle(
  text: string,
  options: TTSOptions = {}
): Promise<ArrayBuffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_TTS_API_KEY not configured');
  }

  const language = options.language || 'es';
  const languageCode = getLanguageCode(language);
  const voiceName = options.voiceName || getVoiceForLanguage(language);
  
  const requestBody = {
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate: options.speakingRate ?? 1.0,
      pitch: options.pitch ?? 0.0,
      volumeGainDb: options.volumeGainDb ?? 0.0,
    },
  };

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Google TTS API error: ${error.error?.message || 'Failed to synthesize speech'}`);
  }

  const data = await response.json();
  
  // Decode base64 audio content
  const audioBuffer = Buffer.from(data.audioContent, 'base64');
  return audioBuffer.buffer;
}

/**
 * Synthesize speech using browser Web Speech API (fallback)
 */
function synthesizeWithBrowser(
  text: string,
  options: TTSOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not available'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const language = options.language || 'es';
    
    // Map language codes to browser language codes
    const browserLangMap: Record<string, string> = {
      'es': 'es-ES',
      'en': 'en-US',
      'fr': 'fr-FR',
      'de': 'de-DE',
    };
    
    utterance.lang = browserLangMap[language] || 'es-ES';
    utterance.rate = options.speakingRate ?? 1.0;
    utterance.pitch = 1.0 + (options.pitch ?? 0.0) / 20.0; // Convert semitones to pitch multiplier
    utterance.volume = 1.0;

    // Try to find a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith('es') && v.name.includes('Spanish')
    ) || voices.find((v) => v.lang.startsWith('es'));
    
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => {
      resolve('completed');
    };

    utterance.onerror = (event) => {
      reject(new Error(`Browser TTS error: ${event.error}`));
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Main TTS function - server-side only, uses Google TTS
 * Returns the audio buffer directly
 */
export async function synthesizeSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<ArrayBuffer> {
  // This function is server-side only
  // Try Google TTS first if API key is available
  const hasGoogleKey = !!process.env.GOOGLE_TTS_API_KEY;
  
  if (hasGoogleKey) {
    try {
      return await synthesizeWithGoogle(text, options);
    } catch (error) {
      console.warn('Google TTS failed:', error);
      throw error;
    }
  }

  throw new Error('Google TTS API key not configured');
}

/**
 * Check if Google TTS is available
 */
export function isGoogleTTSAvailable(): boolean {
  return !!process.env.GOOGLE_TTS_API_KEY;
}

/**
 * Check if browser TTS is available
 */
export function isBrowserTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
