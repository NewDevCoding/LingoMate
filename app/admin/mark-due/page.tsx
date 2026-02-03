'use client';

import React, { useState, useEffect } from 'react';
import { getVocabulary } from '@/features/vocabulary/vocabulary.service';
import { getReviewByVocabularyId, initializeReview } from '@/features/vocabulary/review/review.service';
import { Vocabulary } from '@/types/word';
import { supabase } from '@/lib/db/client';

/**
 * Test utility to mark words as due for review
 * This sets next_review_date to the past so words appear as due
 */
export default function MarkDuePage() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  useEffect(() => {
    async function loadVocabulary() {
      try {
        const vocab = await getVocabulary();
        setVocabulary(vocab);
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      } finally {
        setLoading(false);
      }
    }
    loadVocabulary();
  }, []);

  const markAllAsDue = async () => {
    if (!confirm('Mark all words as due for review? This will set their next_review_date to the past.')) {
      return;
    }

    setProcessing('all');
    setResults({ success: 0, failed: 0 });

    let success = 0;
    let failed = 0;

    for (const vocab of vocabulary) {
      try {
        // Get or create review entry
        let review = await getReviewByVocabularyId(vocab.id);
        if (!review) {
          review = await initializeReview(vocab.id);
        }

        if (review) {
          // Set next_review_date to yesterday (makes it due)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          const { error } = await supabase
            .from('vocabulary_reviews')
            .update({
              next_review_date: yesterday.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', review.id);

          if (error) {
            console.error(`Error updating review for ${vocab.word}:`, error);
            failed++;
          } else {
            success++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error processing ${vocab.word}:`, error);
        failed++;
      }
    }

    setResults({ success, failed });
    setProcessing(null);
  };

  const markRandomAsDue = async (count: number = 5) => {
    if (!confirm(`Mark ${count} random words as due for review?`)) {
      return;
    }

    setProcessing('random');
    setResults({ success: 0, failed: 0 });

    // Get random words
    const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, vocabulary.length));

    let success = 0;
    let failed = 0;

    for (const vocab of selected) {
      try {
        // Get or create review entry
        let review = await getReviewByVocabularyId(vocab.id);
        if (!review) {
          review = await initializeReview(vocab.id);
        }

        if (review) {
          // Set next_review_date to yesterday (makes it due)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          const { error } = await supabase
            .from('vocabulary_reviews')
            .update({
              next_review_date: yesterday.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', review.id);

          if (error) {
            console.error(`Error updating review for ${vocab.word}:`, error);
            failed++;
          } else {
            success++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error processing ${vocab.word}:`, error);
        failed++;
      }
    }

    setResults({ success, failed });
    setProcessing(null);
  };

  const styles = {
    Container: {
      minHeight: '100vh',
      backgroundColor: '#161616',
      padding: '48px 32px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    Card: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #313131',
      borderRadius: '12px',
      padding: '32px',
      maxWidth: '600px',
      width: '100%',
    },
    Title: {
      color: '#ffffff',
      fontSize: '24px',
      fontWeight: 600,
      marginBottom: '8px',
    },
    Description: {
      color: '#a0a0a0',
      fontSize: '14px',
      marginBottom: '24px',
    },
    Button: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
      outline: 'none',
      marginRight: '12px',
      marginBottom: '12px',
    },
    PrimaryButton: {
      backgroundColor: '#26c541',
      color: '#ffffff',
    },
    SecondaryButton: {
      backgroundColor: '#1f1f1f',
      color: '#ffffff',
      border: '1px solid #313131',
    },
    Stats: {
      marginTop: '24px',
      padding: '16px',
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#a0a0a0',
    },
    Loading: {
      color: '#a0a0a0',
      fontSize: '14px',
      marginTop: '16px',
    },
  };

  if (loading) {
    return (
      <div style={styles.Container}>
        <div style={styles.Card}>
          <div style={styles.Loading}>Loading vocabulary...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.Container}>
      <div style={styles.Card}>
        <h1 style={styles.Title}>Mark Words as Due for Review</h1>
        <p style={styles.Description}>
          This utility marks words as due for review by setting their next_review_date to the past.
          Use this to test the review system.
        </p>

        <div>
          <button
            style={{ ...styles.Button, ...styles.PrimaryButton }}
            onClick={() => markRandomAsDue(5)}
            disabled={!!processing || vocabulary.length === 0}
            onMouseEnter={(e) => {
              if (!processing) e.currentTarget.style.backgroundColor = '#22b03a';
            }}
            onMouseLeave={(e) => {
              if (!processing) e.currentTarget.style.backgroundColor = '#26c541';
            }}
          >
            {processing === 'random' ? 'Processing...' : 'Mark 5 Random Words as Due'}
          </button>

          <button
            style={{ ...styles.Button, ...styles.PrimaryButton }}
            onClick={() => markRandomAsDue(10)}
            disabled={!!processing || vocabulary.length === 0}
            onMouseEnter={(e) => {
              if (!processing) e.currentTarget.style.backgroundColor = '#22b03a';
            }}
            onMouseLeave={(e) => {
              if (!processing) e.currentTarget.style.backgroundColor = '#26c541';
            }}
          >
            {processing === 'random' ? 'Processing...' : 'Mark 10 Random Words as Due'}
          </button>

          <button
            style={{ ...styles.Button, ...styles.SecondaryButton }}
            onClick={markAllAsDue}
            disabled={!!processing || vocabulary.length === 0}
            onMouseEnter={(e) => {
              if (!processing) e.currentTarget.style.backgroundColor = '#2a2a2a';
            }}
            onMouseLeave={(e) => {
              if (!processing) e.currentTarget.style.backgroundColor = '#1f1f1f';
            }}
          >
            {processing === 'all' ? 'Processing...' : `Mark All ${vocabulary.length} Words as Due`}
          </button>
        </div>

        {results.success > 0 || results.failed > 0 ? (
          <div style={styles.Stats}>
            <div style={{ color: '#26c541', marginBottom: '4px' }}>
              ✓ Successfully marked {results.success} words as due
            </div>
            {results.failed > 0 && (
              <div style={{ color: '#ef4444' }}>
                ✗ Failed to mark {results.failed} words
              </div>
            )}
            <div style={{ marginTop: '12px', fontSize: '12px' }}>
              <a
                href="/review"
                style={{ color: '#26c541', textDecoration: 'underline' }}
              >
                Go to Review Page →
              </a>
            </div>
          </div>
        ) : null}

        {vocabulary.length === 0 && (
          <div style={{ ...styles.Stats, color: '#f59e0b' }}>
            No vocabulary found. Add some words first!
          </div>
        )}
      </div>
    </div>
  );
}
