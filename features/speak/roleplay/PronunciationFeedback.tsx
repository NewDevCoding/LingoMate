'use client';

import React from 'react';
import { PronunciationAssessment, WordAssessment } from '@/types/assessment';

interface PronunciationFeedbackProps {
  assessment: PronunciationAssessment;
  onClose?: () => void;
  isPremium?: boolean;
}

const styles = {
  Container: {
    backgroundColor: '#1f1f1f',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '16px',
    border: '1px solid #313131',
  } as React.CSSProperties,

  Header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  } as React.CSSProperties,

  Title: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  } as React.CSSProperties,

  CloseButton: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  ScoresContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  ScoreCard: {
    flex: '1 1 120px',
    minWidth: '120px',
    backgroundColor: '#161616',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #313131',
  } as React.CSSProperties,

  ScoreLabel: {
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  ScoreValue: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: 1,
  } as React.CSSProperties,

  OverallScore: {
    color: '#8b5cf6',
  } as React.CSSProperties,

  TranscriptionSection: {
    marginBottom: '20px',
  } as React.CSSProperties,

  SectionTitle: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '12px',
  } as React.CSSProperties,

  TranscriptionText: {
    color: '#e0e0e0',
    fontSize: '15px',
    lineHeight: '1.6',
    padding: '12px',
    backgroundColor: '#161616',
    borderRadius: '8px',
    border: '1px solid #313131',
  } as React.CSSProperties,

  WordContainer: {
    display: 'inline-block',
    margin: '0 2px',
    padding: '2px 4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  WordGood: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
  } as React.CSSProperties,

  WordNeedsWork: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    color: '#eab308',
  } as React.CSSProperties,

  WordPoor: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  } as React.CSSProperties,

  SuggestionsSection: {
    marginTop: '20px',
  } as React.CSSProperties,

  SuggestionsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  } as React.CSSProperties,

  SuggestionItem: {
    color: '#e0e0e0',
    fontSize: '14px',
    padding: '8px 0',
    paddingLeft: '20px',
    position: 'relative' as const,
  } as React.CSSProperties,

  SuggestionBullet: {
    position: 'absolute' as const,
    left: '0',
    top: '10px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
  } as React.CSSProperties,
};

export default function PronunciationFeedback({
  assessment,
  onClose,
  isPremium = false,
}: PronunciationFeedbackProps) {
  const getWordStyle = (wordAssessment: WordAssessment): React.CSSProperties => {
    const score = wordAssessment.accuracyScore;
    if (score >= 80) {
      return { ...styles.WordContainer, ...styles.WordGood };
    } else if (score >= 60) {
      return { ...styles.WordContainer, ...styles.WordNeedsWork };
    } else {
      return { ...styles.WordContainer, ...styles.WordPoor };
    }
  };

  const renderTranscriptionWithHighlights = () => {
    if (!assessment.words || assessment.words.length === 0) {
      return <span style={styles.TranscriptionText}>{assessment.transcription}</span>;
    }

    const words = assessment.transcription.split(/\s+/);
    const wordAssessmentsMap = new Map<string, WordAssessment>();
    
    assessment.words.forEach((wordAssessment) => {
      wordAssessmentsMap.set(wordAssessment.word.toLowerCase(), wordAssessment);
    });

    return (
      <div style={styles.TranscriptionText}>
        {words.map((word, index) => {
          const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
          const wordAssessment = wordAssessmentsMap.get(cleanWord);
          
          if (wordAssessment && isPremium) {
            const wordStyle = getWordStyle(wordAssessment);
            return (
              <span key={index} style={wordStyle} title={`Accuracy: ${wordAssessment.accuracyScore}%`}>
                {word}{' '}
              </span>
            );
          }
          
          return <span key={index}>{word} </span>;
        })}
      </div>
    );
  };

  return (
    <div style={styles.Container}>
      <div style={styles.Header}>
        <h3 style={styles.Title}>Pronunciation Assessment</h3>
        {onClose && (
          <button
            style={styles.CloseButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#313131';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Scores */}
      <div style={styles.ScoresContainer}>
        <div style={styles.ScoreCard}>
          <div style={styles.ScoreLabel}>Overall</div>
          <div style={{ ...styles.ScoreValue, ...styles.OverallScore }}>
            {assessment.overallScore}
          </div>
        </div>
        <div style={styles.ScoreCard}>
          <div style={styles.ScoreLabel}>Accuracy</div>
          <div style={styles.ScoreValue}>{assessment.accuracyScore}</div>
        </div>
        <div style={styles.ScoreCard}>
          <div style={styles.ScoreLabel}>Fluency</div>
          <div style={styles.ScoreValue}>{assessment.fluencyScore}</div>
        </div>
        <div style={styles.ScoreCard}>
          <div style={styles.ScoreLabel}>Completeness</div>
          <div style={styles.ScoreValue}>{assessment.completenessScore}</div>
        </div>
      </div>

      {/* Transcription with word highlights (Premium only) */}
      {isPremium && (
        <div style={styles.TranscriptionSection}>
          <div style={styles.SectionTitle}>Your Pronunciation</div>
          {renderTranscriptionWithHighlights()}
          <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '8px' }}>
            <span style={{ color: '#22c55e' }}>●</span> Good &nbsp;
            <span style={{ color: '#eab308' }}>●</span> Needs Work &nbsp;
            <span style={{ color: '#ef4444' }}>●</span> Poor
          </div>
        </div>
      )}

      {/* Basic transcription for free users */}
      {!isPremium && (
        <div style={styles.TranscriptionSection}>
          <div style={styles.SectionTitle}>Transcription</div>
          <div style={styles.TranscriptionText}>{assessment.transcription}</div>
        </div>
      )}

      {/* Suggestions */}
      {assessment.suggestions && assessment.suggestions.length > 0 && (
        <div style={styles.SuggestionsSection}>
          <div style={styles.SectionTitle}>Improvement Suggestions</div>
          <ul style={styles.SuggestionsList}>
            {assessment.suggestions.map((suggestion, index) => (
              <li key={index} style={styles.SuggestionItem}>
                <span style={styles.SuggestionBullet} />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
