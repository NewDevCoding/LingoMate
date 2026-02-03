'use client';

import React from 'react';

interface ReviewStatsProps {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
}

const styles = {
  Container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '32px',
  } as React.CSSProperties,

  ProgressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#1f1f1f',
    borderRadius: '4px',
    overflow: 'hidden' as const,
  } as React.CSSProperties,

  ProgressFill: (percentage: number) => ({
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: '#26c541',
    transition: 'width 0.3s ease',
  } as React.CSSProperties),

  StatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#a0a0a0',
  } as React.CSSProperties,

  Count: {
    color: '#ffffff',
    fontWeight: 600,
  } as React.CSSProperties,

  CorrectCount: {
    color: '#26c541',
    fontWeight: 600,
  } as React.CSSProperties,

  IncorrectCount: {
    color: '#ef4444',
    fontWeight: 600,
  } as React.CSSProperties,
};

export default function ReviewStats({ current, total, correct, incorrect }: ReviewStatsProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div style={styles.Container}>
      <div style={styles.ProgressBar}>
        <div style={styles.ProgressFill(percentage)} />
      </div>
      <div style={styles.StatsRow}>
        <span>
          Card <span style={styles.Count}>{current}</span> of <span style={styles.Count}>{total}</span>
        </span>
        <span>
          <span style={styles.CorrectCount}>✓ {correct}</span>
          {' '}
          <span style={styles.IncorrectCount}>✗ {incorrect}</span>
        </span>
      </div>
    </div>
  );
}
