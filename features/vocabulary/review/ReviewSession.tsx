'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VocabularyWithReview, ReviewQuality } from '@/types/word';
import Flashcard from './Flashcard';
import ReviewStats from './ReviewStats';
import ReviewComplete from './ReviewComplete';
import { recordReview } from '@/features/vocabulary/review/review.service';

interface ReviewSessionProps {
  words: VocabularyWithReview[];
  onComplete?: () => void;
}

const styles = {
  Container: {
    backgroundColor: '#161616',
    minHeight: '100vh',
    padding: '32px',
    paddingTop: '48px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    maxWidth: '100%',
    width: '100%',
  } as React.CSSProperties,

  Header: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,

  Title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#ffffff',
  } as React.CSSProperties,

  ExitButton: {
    backgroundColor: 'transparent',
    border: '1px solid #313131',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#a0a0a0',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  } as React.CSSProperties,

  Content: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
  } as React.CSSProperties,

  QualityButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  QualityButton: (quality: ReviewQuality, isActive: boolean) => ({
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    outline: 'none',
    minWidth: '120px',
    ...(quality === 0 && {
      backgroundColor: isActive ? '#ef4444' : '#3a1a1a',
      color: '#ffffff',
      border: '1px solid #ef4444',
    }),
    ...(quality === 1 && {
      backgroundColor: isActive ? '#f59e0b' : '#3a2a1a',
      color: '#ffffff',
      border: '1px solid #f59e0b',
    }),
    ...(quality === 3 && {
      backgroundColor: isActive ? '#26c541' : '#1a3a1a',
      color: '#ffffff',
      border: '1px solid #26c541',
    }),
    ...(quality === 4 && {
      backgroundColor: isActive ? '#3b82f6' : '#1a2a3a',
      color: '#ffffff',
      border: '1px solid #3b82f6',
    }),
  } as React.CSSProperties),

  KeyboardHint: {
    fontSize: '12px',
    color: '#666666',
    textAlign: 'center' as const,
    marginTop: '8px',
  } as React.CSSProperties,
};

export default function ReviewSession({ words, onComplete }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);

  const currentWord = words[currentIndex];
  const isComplete = currentIndex >= words.length;

  const handleQuality = useCallback(async (quality: ReviewQuality) => {
    if (isLoading || !currentWord) return;

    setIsLoading(true);

    try {
      // Record review
      await recordReview(currentWord.id, quality);

      // Update counts
      if (quality >= 3) {
        setCorrectCount(prev => prev + 1);
      } else {
        setIncorrectCount(prev => prev + 1);
      }

      // Move to next card
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        // Session complete
        setIsFlipped(false);
      }
    } catch (error) {
      console.error('Error recording review:', error);
      // Still move to next card even if save fails
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentWord, currentIndex, words.length]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (isComplete) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default if we're handling the key
      if (e.key === ' ' || ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
      }

      // Spacebar to flip
      if (e.key === ' ' && !isFlipped) {
        setIsFlipped(true);
        return;
      }

      // Quality rating (only when flipped)
      if (isFlipped && !isLoading) {
        if (e.key === '1') handleQuality(0); // Again
        if (e.key === '2') handleQuality(1); // Hard
        if (e.key === '3') handleQuality(3); // Good
        if (e.key === '4') handleQuality(4); // Easy
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, isComplete, isLoading, handleQuality]);

  const handleFlip = useCallback(() => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  }, [isFlipped]);

  const handleExit = () => {
    onComplete?.();
    window.history.back();
  };

  if (isComplete) {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    return (
      <ReviewComplete
        total={words.length}
        correct={correctCount}
        incorrect={incorrectCount}
        timeSpent={timeSpent}
      />
    );
  }

  if (!currentWord) {
    return (
      <div style={styles.Container}>
        <div style={{ color: '#a0a0a0' }}>No words to review</div>
      </div>
    );
  }

  return (
    <div style={styles.Container}>
      <div style={styles.Header}>
        <div style={styles.Title}>Review Session</div>
        <button
          style={styles.ExitButton}
          onClick={handleExit}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2a2a';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#a0a0a0';
          }}
        >
          Exit
        </button>
      </div>

      <div style={styles.Content}>
        <ReviewStats
          current={currentIndex + 1}
          total={words.length}
          correct={correctCount}
          incorrect={incorrectCount}
        />

        <Flashcard
          vocabulary={currentWord}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />

        {isFlipped && (
          <div>
            <div style={styles.QualityButtons}>
              <button
                style={styles.QualityButton(0, false)}
                onClick={() => handleQuality(0)}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Again
              </button>
              <button
                style={styles.QualityButton(1, false)}
                onClick={() => handleQuality(1)}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Hard
              </button>
              <button
                style={styles.QualityButton(3, false)}
                onClick={() => handleQuality(3)}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Good
              </button>
              <button
                style={styles.QualityButton(4, false)}
                onClick={() => handleQuality(4)}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Easy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
