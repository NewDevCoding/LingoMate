'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Vocabulary } from '@/types/word';

interface InteractiveTextProps {
  text: string;
  selectedWord: string | null;
  onWordClick: (word: string) => void;
  vocabularyMap: Map<string, Vocabulary>;
}

const styles = {
  Wrapper: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative' as const,
    height: '100%',
    paddingLeft: '64px',
    paddingRight: '64px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
  } as React.CSSProperties,

  Container: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '1.8',
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
    gap: '1.07em', // Reduced by 1/3 from 1.6em
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  Sentence: {
    display: 'block' as const,
    marginBottom: '0',
    lineHeight: '1.8',
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
    transition: 'all 0.2s',
    flexShrink: 0,
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
  } as React.CSSProperties,

  ChevronLeft: {
    left: '8px',
  } as React.CSSProperties,

  ChevronRight: {
    right: '8px',
  } as React.CSSProperties,

  ChevronButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  Word: {
    cursor: 'pointer',
    padding: '0',
    marginRight: '0.25em',
    borderRadius: '2px',
    transition: 'background-color 0.2s',
    display: 'inline',
  } as React.CSSProperties,

  WordHighlighted: {
    backgroundColor: '#ffff00',
    color: '#000000',
  } as React.CSSProperties,

  WordSelected: {
    backgroundColor: '#26c541',
    color: '#000000',
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

  WordKnown: {
    backgroundColor: '#26c541',
    color: '#000000',
  } as React.CSSProperties,
};

// Approximate words per page - calculated to fit viewport without overflow
// Based on: ~18px font, 1.8 line height, ~1.6em gap between sentences
// Balanced to fill page while preventing overflow
const WORDS_PER_PAGE = 160;

/**
 * Get word color style based on vocabulary status
 */
function getWordStyle(vocabulary: Vocabulary | undefined, isSelected: boolean, isPunctuation: boolean): React.CSSProperties {
  // Selected word always shows green highlight
  if (isSelected) {
    return styles.WordSelected;
  }

  // Punctuation never gets styling
  if (isPunctuation) {
    return {};
  }

  // If word is in vocabulary, color based on comprehension level
  if (vocabulary) {
    if (vocabulary.comprehension === 5) {
      // Known (comprehension 5): No highlighting - default text color
      return {};
    } else if (vocabulary.comprehension >= 2 && vocabulary.comprehension <= 4) {
      // Learning (comprehension 2-4): Yellow
      return styles.WordLearning;
    } else if (vocabulary.comprehension === 1) {
      // Level 1: Underlined (same as unknown)
      return styles.WordUnknown;
    }
  }

  // Unknown word (treated as level 1): Underlined
  return styles.WordUnknown;
}

export default function InteractiveText({ text, selectedWord, onWordClick, vocabularyMap }: InteractiveTextProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Split text into sentences first
  const sentences = useMemo(() => {
    // Split by sentence endings (. ! ?) but keep the punctuation
    // This regex splits on sentence endings while preserving them
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
    
    // If no sentence endings found, return the whole text as one sentence
    return result.length > 0 ? result : [text];
  }, [text]);

  // Split sentences into pages based on word count
  // Each page should contain as many sentences as possible without overflowing
  // Uses a threshold slightly below max to account for spacing and prevent overflow
  const pages = useMemo(() => {
    const pages: string[][] = [];
    let currentPageSentences: string[] = [];
    let wordCount = 0;

    // Use 95% of max to account for sentence spacing and prevent overflow
    const threshold = Math.floor(WORDS_PER_PAGE * 0.95);

    for (const sentence of sentences) {
      // Count words in this sentence
      const sentenceWords = sentence.split(/\s+/).filter(w => w.trim().length > 0);
      const sentenceWordCount = sentenceWords.length;

      // If adding this sentence would exceed the threshold, start a new page
      // Only split if we already have sentences on the current page
      // This ensures we fit as many sentences as possible per page
      if (wordCount + sentenceWordCount > threshold && currentPageSentences.length > 0) {
        pages.push([...currentPageSentences]);
        currentPageSentences = [sentence]; // Start new page with this sentence
        wordCount = sentenceWordCount;
      } else {
        // Add sentence to current page
        currentPageSentences.push(sentence);
        wordCount += sentenceWordCount;
      }
    }

    // Add remaining sentences as the last page
    if (currentPageSentences.length > 0) {
      pages.push(currentPageSentences);
    }

    return pages.length > 0 ? pages : [sentences];
  }, [sentences]);

  // Reset to first page when text changes
  useEffect(() => {
    setCurrentPage(0);
  }, [text]);

  const currentPageWords = pages[currentPage] || [];
  const hasPrevious = currentPage > 0;
  const hasNext = currentPage < pages.length - 1;

  const handleWordClick = (word: string) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
    if (cleanWord) {
      onWordClick(cleanWord);
    }
  };

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
          {currentPageWords.map((sentence, sentenceIndex) => {
            // Split sentence into words and punctuation, preserving spaces
            const sentenceTokens = sentence.split(/(\s+|[.,!?;:])/).filter(token => token.trim() !== '');
            
            return (
              <div key={sentenceIndex} style={styles.Sentence}>
                {sentenceTokens.map((word, wordIndex) => {
                  const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
                  const isPunctuation = /^[.,!?;:]+$/.test(word.trim());
                  const isSelected = selectedWord === cleanWord;
                  const vocabulary = vocabularyMap.get(cleanWord);
                  const wordStyle = getWordStyle(vocabulary, isSelected, isPunctuation);

                  if (word.trim() === '') {
                    return <span key={wordIndex}>{word}</span>;
                  }

                  // Don't make punctuation clickable
                  if (isPunctuation) {
                    return <span key={wordIndex}>{word}</span>;
                  }

                  return (
                    <span
                      key={wordIndex}
                      style={{
                        ...styles.Word,
                        ...wordStyle,
                      }}
                      onClick={() => handleWordClick(word)}
                      onMouseEnter={(e) => {
                        // Hover effects for different word statuses
                        if (!isSelected && !isPunctuation) {
                          const comprehension = vocabulary?.comprehension || 1;
                          if (comprehension === 1 || !vocabulary) {
                            // Level 1 or unknown: slightly brighter underline on hover
                            e.currentTarget.style.textDecorationColor = '#3b82f6';
                          } else if (comprehension >= 2 && comprehension <= 4) {
                            // Learning words (2-4): slightly brighter yellow on hover
                            e.currentTarget.style.backgroundColor = '#FFE082';
                          }
                          // Known words (5) have no hover effect
                        }
                      }}
                      onMouseLeave={(e) => {
                        // Restore original styling
                        if (!isSelected && !isPunctuation) {
                          const comprehension = vocabulary?.comprehension || 1;
                          if (comprehension === 1 || !vocabulary) {
                            // Level 1 or unknown: restore subtle blue underline
                            e.currentTarget.style.textDecorationColor = '#60a5fa';
                          } else if (comprehension === 5) {
                            // Known words have no background
                            e.currentTarget.style.backgroundColor = 'transparent';
                          } else if (comprehension >= 2 && comprehension <= 4) {
                            // Learning words have yellow background
                            e.currentTarget.style.backgroundColor = '#FFD54F';
                          }
                        }
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
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
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
