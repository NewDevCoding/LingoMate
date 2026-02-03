'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InteractiveText from './InteractiveText';
import SentenceView from './SentenceView';
import { Article } from '@/types/article';
import { Vocabulary } from '@/types/word';

interface ReaderContentProps {
  article: Article & { source: string; thumbnail?: string; progress: number };
  selectedWord: string | null;
  onWordSelect: (word: string | null) => void;
  vocabularyMap: Map<string, Vocabulary>;
  onVocabularyUpdate?: (word: string, vocabulary: Vocabulary | null) => void;
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
    padding: '16px 32px',
    borderBottom: '1px solid #313131',
    backgroundColor: '#161616',
  } as React.CSSProperties,

  HeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  BackButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#262626',
    border: '1px solid #313131',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
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
    padding: '24px 380px 60px 60px', // Reduced top padding to match LingQ
    position: 'relative' as const,
    overflow: 'hidden' as const,
    minHeight: 0, // Allows flex child to shrink
    height: '100%', // Ensure full height for absolute positioning
  } as React.CSSProperties,

  Footer: {
    padding: '16px 32px',
    borderTop: 'none',
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

export default function ReaderContent({ article, selectedWord, onWordSelect, vocabularyMap, onVocabularyUpdate }: ReaderContentProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'page' | 'sentence'>('page');

  const handleBack = () => {
    router.push('/reader');
  };

  return (
    <div style={styles.Container}>
      <div style={styles.ProgressBar}>
        <div style={styles.ProgressFill(article.progress)} />
      </div>

      <div style={styles.Header}>
        <div style={styles.HeaderContent}>
          <button
            style={styles.BackButton}
            onClick={handleBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#313131';
              e.currentTarget.style.borderColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#262626';
              e.currentTarget.style.borderColor = '#313131';
            }}
            title="Back to Library"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          {article.thumbnail ? (
            <img
              src={article.thumbnail}
              alt={article.title}
              style={{
                ...styles.Thumbnail,
                objectFit: 'cover' as const,
              }}
            />
          ) : (
            <div style={styles.Thumbnail} />
          )}
          <div style={styles.HeaderText}>
            <div style={styles.Title}>{article.title}</div>
            <div style={styles.Source}>{article.source}</div>
          </div>
        </div>
      </div>

      <div style={styles.ContentArea}>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'visible' }}>
          {viewMode === 'page' ? (
            <InteractiveText
              text={article.content}
              selectedWord={selectedWord}
              onWordClick={onWordSelect}
              vocabularyMap={vocabularyMap}
            />
          ) : (
            <SentenceView
              text={article.content}
              selectedWord={selectedWord}
              onWordClick={onWordSelect}
              vocabularyMap={vocabularyMap}
              onVocabularyUpdate={onVocabularyUpdate}
            />
          )}
        </div>
      </div>

      <div style={styles.Footer}>
        <button
          style={{
            ...styles.SentenceViewButton,
            ...(viewMode === 'sentence' ? { color: '#26c541' } : {}),
          }}
          onClick={() => setViewMode(viewMode === 'page' ? 'sentence' : 'page')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>{viewMode === 'page' ? 'Sentence View' : 'Page View'}</span>
        </button>
      </div>
    </div>
  );
}
