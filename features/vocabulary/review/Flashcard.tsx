'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWithReview } from '@/types/word';
import { generateExampleSentence, getSimpleExampleSentence } from './example-sentences.service';
import { AudioManager } from '@/lib/speech/audio.manager';
import { BrowserTTSManager } from '@/lib/speech/audio.manager';

interface FlashcardProps {
  vocabulary: VocabularyWithReview;
  isFlipped: boolean;
  onFlip: () => void;
}

const styles = {
  CardContainer: {
    perspective: '1000px' as const,
    width: '100%',
    maxWidth: '600px',
    height: '400px',
    margin: '0 auto',
  } as React.CSSProperties,

  CardInner: (isFlipped: boolean) => ({
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d' as const,
    transition: 'transform 0.6s',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  } as React.CSSProperties),

  CardFace: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    cursor: 'pointer',
    userSelect: 'none' as const,
  } as React.CSSProperties,

  CardFront: {
    backgroundColor: '#1f1f1f',
    border: '2px solid #313131',
  } as React.CSSProperties,

  CardBack: {
    backgroundColor: '#2a2a2a',
    border: '2px solid #404040',
    transform: 'rotateY(180deg)',
  } as React.CSSProperties,

  Word: {
    fontSize: '48px',
    fontWeight: 600,
    color: '#ffffff',
    textAlign: 'center' as const,
    marginBottom: '16px',
    lineHeight: '1.2',
  } as React.CSSProperties,

  Translation: {
    fontSize: '32px',
    fontWeight: 400,
    color: '#a0a0a0',
    textAlign: 'center' as const,
    marginBottom: '16px',
    lineHeight: '1.3',
  } as React.CSSProperties,

  ExampleSentence: {
    fontSize: '16px',
    fontStyle: 'italic' as const,
    color: '#808080',
    textAlign: 'center' as const,
    marginTop: '16px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#1f1f1f',
    borderRadius: '8px',
    lineHeight: '1.5',
    maxWidth: '90%',
  } as React.CSSProperties,

  Language: {
    fontSize: '14px',
    color: '#666666',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginTop: '16px',
  } as React.CSSProperties,

  FlipHint: {
    position: 'absolute' as const,
    bottom: '24px',
    fontSize: '12px',
    color: '#666666',
    textAlign: 'center' as const,
    width: '100%',
  } as React.CSSProperties,

  AudioButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#2a2a2a',
    border: '1px solid #404040',
    color: '#a0a0a0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
    marginRight: '16px',
  } as React.CSSProperties,

  WordContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  } as React.CSSProperties,
};

export default function Flashcard({ vocabulary, isFlipped, onFlip }: FlashcardProps) {
  const [exampleSentence, setExampleSentence] = useState<string | null>(null);
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const browserTTSRef = useRef<BrowserTTSManager | null>(null);

  // Initialize audio managers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioManagerRef.current = new AudioManager();
      browserTTSRef.current = new BrowserTTSManager();
    }

    return () => {
      audioManagerRef.current?.cleanup();
      browserTTSRef.current?.cleanup();
    };
  }, []);

  const playWordAudio = async (word: string, language: string = 'es') => {
    if (!word || isPlayingAudio) return;

    // Stop any currently playing audio
    audioManagerRef.current?.stop();
    browserTTSRef.current?.stop();
    setIsPlayingAudio(true);

    try {
      // Fetch TTS audio from API
      const response = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: word,
          language: language,
          speakingRate: 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If browser TTS fallback is suggested
        if (errorData.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(word, language);
          setIsPlayingAudio(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Check if response is JSON (browser TTS fallback)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(word, language);
          setIsPlayingAudio(false);
          return;
        }
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      if (audioManagerRef.current) {
        // Set callback for when playback ends
        audioManagerRef.current.setOnPlaybackEnd(() => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        });
        
        await audioManagerRef.current.playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Error playing word audio:', error);
      setIsPlayingAudio(false);
    }
  };

  // Load example sentence when card is flipped
  useEffect(() => {
    if (isFlipped && !exampleSentence && !isLoadingExample) {
      setIsLoadingExample(true);
      
      // Try to generate example sentence
      generateExampleSentence(vocabulary.word, vocabulary.translation, vocabulary.language)
        .then((sentence) => {
          if (sentence) {
            setExampleSentence(sentence);
          } else {
            // Fallback to simple example
            setExampleSentence(getSimpleExampleSentence(vocabulary.word, vocabulary.translation, vocabulary.language));
          }
        })
        .catch(() => {
          // Fallback to simple example on error
          setExampleSentence(getSimpleExampleSentence(vocabulary.word, vocabulary.translation, vocabulary.language));
        })
        .finally(() => {
          setIsLoadingExample(false);
        });
    }
  }, [isFlipped, vocabulary.word, vocabulary.translation, vocabulary.language, exampleSentence, isLoadingExample]);

  return (
    <div style={styles.CardContainer}>
      <div style={styles.CardInner(isFlipped)} onClick={onFlip}>
        {/* Front of card - shows word */}
        <div style={{ ...styles.CardFace, ...styles.CardFront }}>
          <div style={styles.WordContainer}>
            <button
              style={{
                ...styles.AudioButton,
                color: isPlayingAudio ? '#26c541' : '#a0a0a0',
                backgroundColor: isPlayingAudio ? '#1a3a1a' : '#2a2a2a',
                borderColor: isPlayingAudio ? '#26c541' : '#404040',
              }}
              onClick={(e) => {
                e.stopPropagation();
                playWordAudio(vocabulary.word, vocabulary.language);
              }}
              onMouseEnter={(e) => {
                if (!isPlayingAudio) {
                  e.currentTarget.style.color = '#26c541';
                  e.currentTarget.style.backgroundColor = '#1a2a1a';
                  e.currentTarget.style.borderColor = '#26c541';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPlayingAudio) {
                  e.currentTarget.style.color = '#a0a0a0';
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                  e.currentTarget.style.borderColor = '#404040';
                }
              }}
              aria-label="Play pronunciation"
              title="Play pronunciation"
            >
              {isPlayingAudio ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
            </button>
            <div style={styles.Word}>{vocabulary.word}</div>
          </div>
          {vocabulary.language && vocabulary.language !== 'placeholder' && (
            <div style={styles.Language}>{vocabulary.language}</div>
          )}
          <div style={styles.FlipHint}>Click or press Spacebar to flip</div>
        </div>

        {/* Back of card - shows translation and example */}
        <div style={{ ...styles.CardFace, ...styles.CardBack }}>
          <div style={styles.WordContainer}>
            <button
              style={{
                ...styles.AudioButton,
                color: isPlayingAudio ? '#26c541' : '#a0a0a0',
                backgroundColor: isPlayingAudio ? '#1a3a1a' : '#2a2a2a',
                borderColor: isPlayingAudio ? '#26c541' : '#404040',
              }}
              onClick={(e) => {
                e.stopPropagation();
                playWordAudio(vocabulary.word, vocabulary.language);
              }}
              onMouseEnter={(e) => {
                if (!isPlayingAudio) {
                  e.currentTarget.style.color = '#26c541';
                  e.currentTarget.style.backgroundColor = '#1a2a1a';
                  e.currentTarget.style.borderColor = '#26c541';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPlayingAudio) {
                  e.currentTarget.style.color = '#a0a0a0';
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                  e.currentTarget.style.borderColor = '#404040';
                }
              }}
              aria-label="Play pronunciation"
              title="Play pronunciation"
            >
              {isPlayingAudio ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
            </button>
            <div style={styles.Translation}>{vocabulary.translation}</div>
          </div>
          {isFlipped && (
            <div style={styles.ExampleSentence}>
              {isLoadingExample ? (
                <span style={{ color: '#666666' }}>Loading example...</span>
              ) : exampleSentence ? (
                exampleSentence
              ) : null}
            </div>
          )}
          {vocabulary.language && vocabulary.language !== 'placeholder' && (
            <div style={styles.Language}>{vocabulary.language}</div>
          )}
          <div style={styles.FlipHint}>Click or press Spacebar to flip</div>
        </div>
      </div>
    </div>
  );
}
