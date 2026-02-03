'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReviewSession from '@/features/vocabulary/review/ReviewSession';
import { VocabularyWithReview } from '@/types/word';
import { getDueWords } from '@/features/vocabulary/review/review.service';

const styles = {
  Container: {
    backgroundColor: '#161616',
    minHeight: '100vh',
    padding: '32px',
    paddingTop: '48px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  LoadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  LoadingText: {
    color: '#a0a0a0',
    fontSize: '16px',
  } as React.CSSProperties,

  ErrorContainer: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  ErrorTitle: {
    color: '#ef4444',
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '8px',
  } as React.CSSProperties,

  ErrorMessage: {
    color: '#a0a0a0',
    fontSize: '14px',
    marginBottom: '16px',
  } as React.CSSProperties,

  EmptyContainer: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    padding: '48px',
    maxWidth: '500px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  EmptyTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '16px',
  } as React.CSSProperties,

  EmptyMessage: {
    color: '#a0a0a0',
    fontSize: '16px',
    marginBottom: '24px',
  } as React.CSSProperties,

  Button: {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    outline: 'none',
  } as React.CSSProperties,

  PrimaryButton: {
    backgroundColor: '#26c541',
    color: '#ffffff',
  } as React.CSSProperties,

  SecondaryButton: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    border: '1px solid #313131',
    marginLeft: '12px',
  } as React.CSSProperties,
};

export default function ReviewPage() {
  const router = useRouter();
  const [words, setWords] = useState<VocabularyWithReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDueWords() {
      setIsLoading(true);
      setError(null);

      try {
        const dueWords = await getDueWords();
        setWords(dueWords);
      } catch (err) {
        console.error('Error loading due words:', err);
        setError('Failed to load words for review');
      } finally {
        setIsLoading(false);
      }
    }

    loadDueWords();
  }, []);

  if (isLoading) {
    return (
      <div style={styles.Container}>
        <div style={styles.LoadingContainer}>
          <div style={styles.LoadingText}>Loading words for review...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.Container}>
        <div style={styles.ErrorContainer}>
          <div style={styles.ErrorTitle}>Error</div>
          <div style={styles.ErrorMessage}>{error}</div>
          <button
            style={{ ...styles.Button, ...styles.SecondaryButton }}
            onClick={() => router.push('/vocabulary')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }}
          >
            Back to Vocabulary
          </button>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div style={styles.Container}>
        <div style={styles.EmptyContainer}>
          <div style={styles.EmptyTitle}>No Words Due for Review</div>
          <div style={styles.EmptyMessage}>
            Great job! You're all caught up. Check back later for more reviews.
          </div>
          <button
            style={{ ...styles.Button, ...styles.PrimaryButton }}
            onClick={() => router.push('/vocabulary')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#22b03a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#26c541';
            }}
          >
            Back to Vocabulary
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReviewSession
      words={words}
      onComplete={() => router.push('/vocabulary')}
    />
  );
}
