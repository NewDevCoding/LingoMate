/**
 * Audio Manager
 * 
 * Manages audio playback for TTS, including:
 * - Queue management (prevents overlapping audio)
 * - Play/pause/stop controls
 * - Cleanup on unmount
 */

export class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private playbackQueue: string[] = [];
  private onPlaybackEnd?: () => void;
  private onPlaybackError?: (error: Error) => void;

  /**
   * Play audio from a URL
   */
  async playAudio(audioUrl: string): Promise<void> {
    // Stop any currently playing audio
    this.stop();

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onloadeddata = () => {
        this.currentAudio = audio;
        this.isPlaying = true;
        
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          this.isPlaying = false;
          this.currentAudio = null;
          reject(error);
        });
      };

      audio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        this.onPlaybackEnd?.();
        resolve();
      };

      audio.onerror = (event) => {
        const error = new Error('Audio playback failed');
        console.error('Audio error:', event);
        this.isPlaying = false;
        this.currentAudio = null;
        this.onPlaybackError?.(error);
        reject(error);
      };

      audio.onpause = () => {
        this.isPlaying = false;
      };

      audio.onplay = () => {
        this.isPlaying = true;
      };
    });
  }

  /**
   * Play audio from a blob URL
   */
  async playAudioFromBlob(blob: Blob): Promise<void> {
    const url = URL.createObjectURL(blob);
    
    try {
      await this.playAudio(url);
    } finally {
      // Clean up the blob URL after a delay to ensure playback started
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  }

  /**
   * Play audio from ArrayBuffer
   */
  async playAudioFromBuffer(buffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): Promise<void> {
    const blob = new Blob([buffer], { type: mimeType });
    return this.playAudioFromBlob(blob);
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.playbackQueue = [];
  }

  /**
   * Pause current playback
   */
  pause(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume paused playback
   */
  resume(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play().catch((error) => {
        console.error('Error resuming audio:', error);
      });
    }
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set callback for when playback ends
   */
  setOnPlaybackEnd(callback: () => void): void {
    this.onPlaybackEnd = callback;
  }

  /**
   * Set callback for when playback errors
   */
  setOnPlaybackError(callback: (error: Error) => void): void {
    this.onPlaybackError = callback;
  }

  /**
   * Cleanup - call this when component unmounts
   */
  cleanup(): void {
    this.stop();
    this.onPlaybackEnd = undefined;
    this.onPlaybackError = undefined;
  }
}

/**
 * Browser TTS Manager (for fallback)
 */
export class BrowserTTSManager {
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Speak text using browser TTS
   */
  speak(text: string, language: string = 'es', options?: {
    rate?: number;
    pitch?: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        reject(new Error('Browser TTS not available'));
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Map language codes
      const browserLangMap: Record<string, string> = {
        'es': 'es-ES',
        'en': 'en-US',
        'fr': 'fr-FR',
        'de': 'de-DE',
      };
      
      utterance.lang = browserLangMap[language] || 'es-ES';
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = 1.0 + (options?.pitch ?? 0.0) / 20.0;
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
        this.isSpeaking = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        reject(new Error(`Browser TTS error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stop();
  }
}
