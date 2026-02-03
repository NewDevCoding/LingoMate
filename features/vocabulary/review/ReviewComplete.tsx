'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ReviewCompleteProps {
  total: number;
  correct: number;
  incorrect: number;
  timeSpent?: number; // in seconds
}

const styles = {
  Container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  Title: {
    fontSize: '32px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
  } as React.CSSProperties,

  Message: {
    fontSize: '16px',
    color: '#a0a0a0',
    marginBottom: '32px',
  } as React.CSSProperties,

  StatsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginBottom: '32px',
    width: '100%',
    maxWidth: '400px',
  } as React.CSSProperties,

  StatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '8px',
  } as React.CSSProperties,

  StatLabel: {
    fontSize: '14px',
    color: '#a0a0a0',
  } as React.CSSProperties,

  StatValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
  } as React.CSSProperties,

  CorrectValue: {
    color: '#26c541',
  } as React.CSSProperties,

  IncorrectValue: {
    color: '#ef4444',
  } as React.CSSProperties,

  ButtonContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
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
  } as React.CSSProperties,
};

export default function ReviewComplete({ total, correct, incorrect, timeSpent }: ReviewCompleteProps) {
  const router = useRouter();
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.Container}>
      <div style={styles.Title}>Review Complete! 🎉</div>
      <div style={styles.Message}>Great job reviewing your vocabulary!</div>

      <div style={styles.StatsContainer}>
        <div style={styles.StatRow}>
          <span style={styles.StatLabel}>Total Cards</span>
          <span style={styles.StatValue}>{total}</span>
        </div>
        <div style={styles.StatRow}>
          <span style={styles.StatLabel}>Correct</span>
          <span style={{ ...styles.StatValue, ...styles.CorrectValue }}>{correct}</span>
        </div>
        <div style={styles.StatRow}>
          <span style={styles.StatLabel}>Incorrect</span>
          <span style={{ ...styles.StatValue, ...styles.IncorrectValue }}>{incorrect}</span>
        </div>
        <div style={styles.StatRow}>
          <span style={styles.StatLabel}>Accuracy</span>
          <span style={styles.StatValue}>{accuracy}%</span>
        </div>
        {timeSpent && (
          <div style={styles.StatRow}>
            <span style={styles.StatLabel}>Time Spent</span>
            <span style={styles.StatValue}>{formatTime(timeSpent)}</span>
          </div>
        )}
      </div>

      <div style={styles.ButtonContainer}>
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
        <button
          style={{ ...styles.Button, ...styles.PrimaryButton }}
          onClick={() => router.push('/review')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#22b03a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#26c541';
          }}
        >
          Review More
        </button>
      </div>
    </div>
  );
}
