'use client';

import React, { useState, useEffect } from 'react';
import { getVocabulary } from '@/features/vocabulary/vocabulary.service';
import { getReviewByVocabularyId, getDueWords } from '@/features/vocabulary/review/review.service';
import { Vocabulary } from '@/types/word';
import { supabase } from '@/lib/db/client';

export default function DebugReviewsPage() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [dueWords, setDueWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDetails, setReviewDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const vocab = await getVocabulary();
        setVocabulary(vocab);

        const due = await getDueWords();
        setDueWords(due);

        // Load review details for all vocabulary
        const details: Record<string, any> = {};
        for (const v of vocab) {
          const review = await getReviewByVocabularyId(v.id);
          if (review) {
            details[v.id] = review;
          }
        }
        setReviewDetails(details);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const styles = {
    Container: {
      minHeight: '100vh',
      backgroundColor: '#161616',
      padding: '48px 32px',
    },
    Card: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #313131',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    },
    Title: {
      color: '#ffffff',
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '16px',
    },
    Stat: {
      color: '#a0a0a0',
      fontSize: '14px',
      marginBottom: '8px',
    },
    StatValue: {
      color: '#ffffff',
      fontWeight: 600,
    },
    Table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '16px',
    },
    TableHeader: {
      color: '#a0a0a0',
      fontSize: '12px',
      textAlign: 'left' as const,
      padding: '8px',
      borderBottom: '1px solid #313131',
    },
    TableCell: {
      color: '#ffffff',
      fontSize: '14px',
      padding: '8px',
      borderBottom: '1px solid #313131',
    },
    DueBadge: {
      backgroundColor: '#26c541',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
    },
    NotDueBadge: {
      backgroundColor: '#2a2a2a',
      color: '#a0a0a0',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
    },
  };

  if (loading) {
    return (
      <div style={styles.Container}>
        <div style={styles.Card}>
          <div style={styles.Stat}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.Container}>
      <div style={styles.Card}>
        <h2 style={styles.Title}>Review Debug Information</h2>
        <div style={styles.Stat}>
          Total Vocabulary: <span style={styles.StatValue}>{vocabulary.length}</span>
        </div>
        <div style={styles.Stat}>
          Words with Reviews: <span style={styles.StatValue}>{Object.keys(reviewDetails).length}</span>
        </div>
        <div style={styles.Stat}>
          Words Due for Review: <span style={styles.StatValue}>{dueWords.length}</span>
        </div>
      </div>

      <div style={styles.Card}>
        <h2 style={styles.Title}>Due Words ({dueWords.length})</h2>
        {dueWords.length === 0 ? (
          <div style={styles.Stat}>No words are currently due for review.</div>
        ) : (
          <table style={styles.Table}>
            <thead>
              <tr>
                <th style={styles.TableHeader}>Word</th>
                <th style={styles.TableHeader}>Next Review Date</th>
                <th style={styles.TableHeader}>Days Until</th>
                <th style={styles.TableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dueWords.map((word) => (
                <tr key={word.id}>
                  <td style={styles.TableCell}>{word.word}</td>
                  <td style={styles.TableCell}>
                    {word.review?.nextReviewDate
                      ? new Date(word.review.nextReviewDate).toLocaleString()
                      : 'No review date'}
                  </td>
                  <td style={styles.TableCell}>{word.daysUntilReview}</td>
                  <td style={styles.TableCell}>
                    <span style={word.isDueForReview ? styles.DueBadge : styles.NotDueBadge}>
                      {word.isDueForReview ? 'Due' : 'Not Due'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.Card}>
        <h2 style={styles.Title}>All Vocabulary Reviews</h2>
        <table style={styles.Table}>
          <thead>
            <tr>
              <th style={styles.TableHeader}>Word</th>
              <th style={styles.TableHeader}>Has Review</th>
              <th style={styles.TableHeader}>Next Review Date</th>
              <th style={styles.TableHeader}>Interval Days</th>
              <th style={styles.TableHeader}>Repetitions</th>
            </tr>
          </thead>
          <tbody>
            {vocabulary.map((vocab) => {
              const review = reviewDetails[vocab.id];
              return (
                <tr key={vocab.id}>
                  <td style={styles.TableCell}>{vocab.word}</td>
                  <td style={styles.TableCell}>
                    {review ? '✓' : '✗'}
                  </td>
                  <td style={styles.TableCell}>
                    {review?.nextReviewDate
                      ? new Date(review.nextReviewDate).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td style={styles.TableCell}>
                    {review?.intervalDays ?? 'N/A'}
                  </td>
                  <td style={styles.TableCell}>
                    {review?.repetitions ?? 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
