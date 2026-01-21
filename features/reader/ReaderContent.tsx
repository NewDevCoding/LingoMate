'use client';

import React, { useState } from 'react';
import InteractiveText from './InteractiveText';

interface Article {
  id: string;
  title: string;
  source: string;
  thumbnail?: string;
  content: string;
  progress: number;
}

interface ReaderContentProps {
  article: Article;
  selectedWord: string | null;
  onWordSelect: (word: string | null) => void;
}

const styles = {
  Container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden' as const,
  } as React.CSSProperties,

  ProgressBar: {
    height: '4px',
    backgroundColor: '#262626',
    width: '100%',
  } as React.CSSProperties,

  ProgressFill: (progress: number) => ({
    height: '100%',
    backgroundColor: '#26c541',
    width: `${progress}%`,
    transition: 'width 0.3s ease',
  } as React.CSSProperties),

  Header: {
    padding: '24px 32px',
    borderBottom: '1px solid #313131',
  } as React.CSSProperties,

  HeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  Thumbnail: {
    width: '60px',
    height: '60px',
    backgroundColor: '#262626',
    borderRadius: '8px',
    flexShrink: 0,
  } as React.CSSProperties,

  HeaderText: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  } as React.CSSProperties,

  Title: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 600,
  } as React.CSSProperties,

  Source: {
    color: '#a0a0a0',
    fontSize: '14px',
  } as React.CSSProperties,

  ContentArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 80px 60px 80px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    minHeight: 0, // Allows flex child to shrink
  } as React.CSSProperties,

  Footer: {
    padding: '16px 32px',
    borderTop: '1px solid #313131',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  SentenceViewButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    fontSize: '12px',
  } as React.CSSProperties,
};

export default function ReaderContent({ article, selectedWord, onWordSelect }: ReaderContentProps) {
  return (
    <div style={styles.Container}>
      <div style={styles.ProgressBar}>
        <div style={styles.ProgressFill(article.progress)} />
      </div>

      <div style={styles.Header}>
        <div style={styles.HeaderContent}>
          <div style={styles.Thumbnail} />
          <div style={styles.HeaderText}>
            <div style={styles.Title}>{article.title}</div>
            <div style={styles.Source}>{article.source}</div>
          </div>
        </div>
      </div>

      <div style={styles.ContentArea}>
        <InteractiveText
          text={article.content}
          selectedWord={selectedWord}
          onWordClick={onWordSelect}
        />
      </div>

      <div style={styles.Footer}>
        <button style={styles.SentenceViewButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Sentence View</span>
        </button>
      </div>
    </div>
  );
}
