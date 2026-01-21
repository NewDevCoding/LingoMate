'use client';

import React, { useState } from 'react';

interface WordDefinitionPanelProps {
  word: string | null;
  onClose: () => void;
}

const styles = {
  Container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  } as React.CSSProperties,

  Header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  } as React.CSSProperties,

  LanguageToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: '#262626',
    border: '1px solid #313131',
    borderRadius: '8px',
    cursor: 'pointer',
  } as React.CSSProperties,

  ToggleLeft: {
    padding: '4px 8px',
    backgroundColor: '#26c541',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  } as React.CSSProperties,

  ToggleRight: {
    padding: '4px 8px',
    color: '#a0a0a0',
    fontSize: '12px',
  } as React.CSSProperties,

  WordDisplay: {
    backgroundColor: '#262626',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  } as React.CSSProperties,

  Word: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '12px',
  } as React.CSSProperties,

  WordTypes: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  WordType: {
    padding: '4px 12px',
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '6px',
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 500,
  } as React.CSSProperties,

  InputField: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#161616',
    border: '1px solid #313131',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '24px',
    outline: 'none',
  } as React.CSSProperties,

  SectionTitle: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '12px',
  } as React.CSSProperties,

  MeaningList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,

  MeaningItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#262626',
    borderRadius: '8px',
    border: '1px solid #313131',
  } as React.CSSProperties,

  MeaningText: {
    color: '#ffffff',
    fontSize: '14px',
  } as React.CSSProperties,

  AddButton: {
    width: '24px',
    height: '24px',
    backgroundColor: '#26c541',
    border: 'none',
    borderRadius: '4px',
    color: '#000000',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  EmptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666666',
    fontSize: '14px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  Footer: {
    marginTop: 'auto',
    display: 'flex',
    gap: '8px',
    paddingTop: '16px',
  } as React.CSSProperties,

  FooterButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#262626',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
  } as React.CSSProperties,

  FooterButtonActive: {
    backgroundColor: '#26c541',
    color: '#000000',
  } as React.CSSProperties,
};

// Mock word definitions
const mockDefinitions: Record<string, { types: string[]; meanings: string[] }> = {
  'pues': {
    types: ['adverb', 'noun'],
    meanings: ['well', 'since', 'because'],
  },
  'hola': {
    types: ['interjection'],
    meanings: ['hello', 'hi'],
  },
  'mundo': {
    types: ['noun'],
    meanings: ['world'],
  },
};

export default function WordDefinitionPanel({ word, onClose }: WordDefinitionPanelProps) {
  const [selectedRating, setSelectedRating] = useState<number | 'check' | null>(1);

  if (!word) {
    return (
      <div style={styles.Container}>
        <div style={styles.EmptyState}>
          <p>Select a word to see its definition</p>
        </div>
      </div>
    );
  }

  const definition = mockDefinitions[word] || {
    types: ['unknown'],
    meanings: ['No definition available'],
  };

  const handleRatingClick = (rating: number | 'check') => {
    setSelectedRating(rating);
  };

  return (
    <div style={styles.Container}>
      <div style={styles.Header}>
        <div style={styles.LanguageToggle}>
          <span style={styles.ToggleLeft}>ES</span>
          <span style={styles.ToggleRight}>IS</span>
        </div>
      </div>

      <div style={styles.WordDisplay}>
        <div style={styles.Word}>{word}</div>
        <div style={styles.WordTypes}>
          {definition.types.map((type, index) => (
            <span key={index} style={styles.WordType}>
              {type}
            </span>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder="Type a new meaning here"
        style={styles.InputField}
      />

      <div>
        <div style={styles.SectionTitle}>Popular Meanings</div>
        <div style={styles.MeaningList}>
          {definition.meanings.map((meaning, index) => (
            <div key={index} style={styles.MeaningItem}>
              <span style={styles.MeaningText}>{meaning}</span>
              <button style={styles.AddButton}>+</button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.Footer}>
        <button style={styles.FooterButton} title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        <button
          style={{
            ...styles.FooterButton,
            ...(selectedRating === 1 ? styles.FooterButtonActive : {}),
          }}
          title="Level 1"
          onClick={() => handleRatingClick(1)}
        >
          1
        </button>
        <button
          style={{
            ...styles.FooterButton,
            ...(selectedRating === 2 ? styles.FooterButtonActive : {}),
          }}
          title="Level 2"
          onClick={() => handleRatingClick(2)}
        >
          2
        </button>
        <button
          style={{
            ...styles.FooterButton,
            ...(selectedRating === 3 ? styles.FooterButtonActive : {}),
          }}
          title="Level 3"
          onClick={() => handleRatingClick(3)}
        >
          3
        </button>
        <button
          style={{
            ...styles.FooterButton,
            ...(selectedRating === 4 ? styles.FooterButtonActive : {}),
          }}
          title="Level 4"
          onClick={() => handleRatingClick(4)}
        >
          4
        </button>
        <button
          style={{
            ...styles.FooterButton,
            ...(selectedRating === 'check' ? styles.FooterButtonActive : {}),
          }}
          title="Known"
          onClick={() => handleRatingClick('check')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
