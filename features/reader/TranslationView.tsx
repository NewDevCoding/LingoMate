'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Vocabulary } from '@/types/word';
import { getTranslation } from '@/lib/translation/translation.service';

// Approximate words per page - reduced to account for translations taking up space
// Since each sentence has both original and translation, we need to fit roughly half the content
const WORDS_PER_PAGE = 140; // Reduced from 280 to account for translations

interface TranslationViewProps {
  text: string;
  selectedWord: string | null;
  onWordClick: (word: string) => void;
  vocabularyMap: Map<string, Vocabulary>;
}

const styles = {
  Wrapper: {
    width: '100%',
    maxWidth: '950px',
    margin: '0 auto',
    position: 'relative' as const,
    height: '100%',
    paddingLeft: '40px',
    paddingRight: '40px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'visible' as const,
  } as React.CSSProperties,

  ProgressBar: {
    height: '4px',
    backgroundColor: '#262626',
    width: '100%',
    borderRadius: '2px',
    marginBottom: '16px',
    flexShrink: 0,
  } as React.CSSProperties,

  ProgressFill: (progress: number) => ({
    height: '100%',
    backgroundColor: '#26c541',
    width: `${progress}%`,
    transition: 'width 0.3s ease',
    borderRadius: '2px',
  } as React.CSSProperties),

  Container: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '1.6',
    flex: 1,
    textAlign: 'left' as const,
    maxWidth: '100%',
    wordWrap: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
    height: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  TextBlock: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    height: '100%',
    overflow: 'hidden' as const,
    gap: '1.2em',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  SentencePair: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginBottom: '0',
  } as React.CSSProperties,

  OriginalSentence: {
    display: 'block' as const,
    marginBottom: '0',
    lineHeight: '1.6',
  } as React.CSSProperties,

  TranslationSentence: {
    display: 'block' as const,
    marginBottom: '0',
    lineHeight: '1.6',
    fontStyle: 'italic' as const,
    color: '#a0a0a0',
  } as React.CSSProperties,

  Word: {
    cursor: 'pointer',
    padding: '0',
    marginRight: '0.25em',
    borderRadius: '2px',
    transition: 'background-color 0.2s',
    display: 'inline',
  } as React.CSSProperties,

  WordSelected: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  } as React.CSSProperties,

  WordUnknown: {
    textDecoration: 'underline',
    textDecorationColor: '#60a5fa',
    textDecorationThickness: '1px',
    textUnderlineOffset: '2px',
  } as React.CSSProperties,

  WordLearning: {
    backgroundColor: '#FFD54F',
    color: '#000000',
  } as React.CSSProperties,

  WordLearningLight: {
    backgroundColor: '#FFF9C4',
    color: '#000000',
  } as React.CSSProperties,

  ChevronButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1px solid #313131',
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    transition: 'all 0.2s',
    zIndex: 10,
  } as React.CSSProperties,

  ChevronButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  ChevronLeft: {
    left: '-70px',
  } as React.CSSProperties,

  ChevronRight: {
    right: '-70px',
  } as React.CSSProperties,
};

/**
 * Get word color style based on vocabulary status
 */
function getWordStyle(vocabulary: Vocabulary | undefined, isSelected: boolean, isPunctuation: boolean): React.CSSProperties {
  // Selected word always shows blue highlight
  if (isSelected) {
    return styles.WordSelected;
  }

  // Punctuation never gets styling
  if (isPunctuation) {
    return {};
  }

  if (!vocabulary) {
    // Unknown word (comprehension 0): No styling
    return {};
  }

  const comprehension = vocabulary.comprehension || 0;

  // Level 1: Blue underline
  if (comprehension === 1) {
    return styles.WordUnknown;
  }

  // Level 2: Yellow highlight
  if (comprehension === 2) {
    return styles.WordLearning;
  }

  // Levels 3-4: Light yellow highlight
  if (comprehension === 3 || comprehension === 4) {
    return styles.WordLearningLight;
  }

  // Level 5 (Known): No styling
  if (comprehension === 5) {
    return {};
  }

  // Unknown word (comprehension 0): No styling
  return {};
}

export default function TranslationView({ text, selectedWord, onWordClick, vocabularyMap }: TranslationViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sentenceTranslations, setSentenceTranslations] = useState<Map<number, string>>(new Map());
  const [loadingTranslations, setLoadingTranslations] = useState<Set<number>>(new Set());

  // Split text into sentences
  const sentences = useMemo(() => {
    const sentenceEndings = /([.!?]+)\s+/g;
    const parts = text.split(sentenceEndings);
    const result: string[] = [];
    
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i];
      const punctuation = parts[i + 1] || '';
      if (sentence.trim()) {
        result.push((sentence + punctuation).trim());
      }
    }
    
    return result.length > 0 ? result : [text];
  }, [text]);

  // Split sentences into pages based on word count
  // Account for translations taking up additional space
  const pages = useMemo(() => {
    const pages: number[][] = []; // Array of sentence indices per page
    let currentPageSentences: number[] = [];
    let wordCount = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      // Count words in this sentence (original + translation estimate)
      const sentenceWords = sentence.split(/\s+/).filter(w => w.trim().length > 0);
      // Estimate translation adds roughly similar word count
      const sentenceWordCount = sentenceWords.length * 1.5; // Account for translation

      // Use a threshold to maximize page filling
      const threshold = Math.floor(WORDS_PER_PAGE * 0.99);

      // If adding this sentence would exceed the threshold, start a new page
      if (wordCount + sentenceWordCount > threshold && currentPageSentences.length > 0) {
        pages.push([...currentPageSentences]);
        currentPageSentences = [i]; // Start new page with this sentence
        wordCount = sentenceWordCount;
      } else {
        // Add sentence to current page
        currentPageSentences.push(i);
        wordCount += sentenceWordCount;
      }
    }

    // Add remaining sentences as the last page
    if (currentPageSentences.length > 0) {
      pages.push(currentPageSentences);
    }

    return pages.length > 0 ? pages : [[0]];
  }, [sentences]);

  // Reset to first page when text changes
  useEffect(() => {
    setCurrentPage(0);
  }, [text]);

  // Fetch translations for all sentences
  useEffect(() => {
    const fetchTranslations = async () => {
      const newTranslations = new Map<number, string>();
      const loading = new Set<number>();

      // Fetch translations for all sentences
      const translationPromises = sentences.map(async (sentence, index) => {
        loading.add(index);
        setLoadingTranslations(new Set(loading));

        try {
          const result = await getTranslation(sentence, {
            sourceLang: 'es',
            targetLang: 'en',
          });
          if (result?.translation) {
            newTranslations.set(index, result.translation);
            setSentenceTranslations(prev => {
              const updated = new Map(prev);
              updated.set(index, result.translation);
              return updated;
            });
          }
        } catch (error) {
          console.error(`Error fetching translation for sentence ${index}:`, error);
        } finally {
          loading.delete(index);
          setLoadingTranslations(new Set(loading));
        }
      });

      await Promise.all(translationPromises);
    };

    if (sentences.length > 0) {
      fetchTranslations();
    }
  }, [sentences]);

  const handleWordClick = (word: string) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
    if (cleanWord) {
      onWordClick(cleanWord);
    }
  };

  // Render sentence with word highlighting
  const renderSentence = (sentence: string) => {
    const tokens = sentence.split(/(\s+|[.,!?;:])/);
    
    return tokens.map((token, index) => {
      const trimmed = token.trim();
      if (!trimmed) {
        return <span key={index}>{token}</span>;
      }

      // Check if it's punctuation
      const isPunctuation = /^[.,!?;:]+$/.test(trimmed);
      if (isPunctuation) {
        return <span key={index}>{token}</span>;
      }

      const cleanWord = trimmed.replace(/[.,!?;:]/g, '').toLowerCase();
      const vocabulary = vocabularyMap.get(cleanWord);
      const isSelected = selectedWord === cleanWord;
      const wordStyle = getWordStyle(vocabulary, isSelected, isPunctuation);

      return (
        <span
          key={index}
          style={{
            ...styles.Word,
            ...wordStyle,
          }}
          onClick={() => handleWordClick(trimmed)}
          onMouseEnter={(e) => {
            if (!isSelected && !vocabulary) {
              e.currentTarget.style.backgroundColor = '#404040';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected && !vocabulary) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {token}
        </span>
      );
    });
  };

  const currentPageSentenceIndices = pages[currentPage] || [];
  const hasPrevious = currentPage > 0;
  const hasNext = currentPage < pages.length - 1;
  const progress = pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div style={styles.Wrapper}>
      <div style={styles.ProgressBar}>
        <div style={styles.ProgressFill(progress)} />
      </div>
      <button
        style={{
          ...styles.ChevronButton,
          ...styles.ChevronLeft,
          ...(!hasPrevious ? styles.ChevronButtonDisabled : {}),
        }}
        onClick={handlePrevious}
        disabled={!hasPrevious}
        onMouseEnter={(e) => {
          if (hasPrevious) {
            e.currentTarget.style.backgroundColor = '#262626';
            e.currentTarget.style.borderColor = '#404040';
          }
        }}
        onMouseLeave={(e) => {
          if (hasPrevious) {
            e.currentTarget.style.backgroundColor = '#1f1f1f';
            e.currentTarget.style.borderColor = '#313131';
          }
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div style={styles.Container}>
        <div style={styles.TextBlock}>
          {currentPageSentenceIndices.map((sentenceIndex) => {
            const sentence = sentences[sentenceIndex];
            const translation = sentenceTranslations.get(sentenceIndex);
            const isLoading = loadingTranslations.has(sentenceIndex);

            return (
              <div key={sentenceIndex} style={styles.SentencePair}>
                <div style={styles.OriginalSentence}>
                  {renderSentence(sentence)}
                </div>
                <div style={styles.TranslationSentence}>
                  {isLoading ? 'Translating...' : (translation || '')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        style={{
          ...styles.ChevronButton,
          ...styles.ChevronRight,
          ...(!hasNext ? styles.ChevronButtonDisabled : {}),
        }}
        onClick={handleNext}
        disabled={!hasNext}
        onMouseEnter={(e) => {
          if (hasNext) {
            e.currentTarget.style.backgroundColor = '#262626';
            e.currentTarget.style.borderColor = '#404040';
          }
        }}
        onMouseLeave={(e) => {
          if (hasNext) {
            e.currentTarget.style.backgroundColor = '#1f1f1f';
            e.currentTarget.style.borderColor = '#313131';
          }
        }}
        title="Next page"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
