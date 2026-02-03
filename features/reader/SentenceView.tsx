'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Vocabulary } from '@/types/word';
import { getTranslation } from '@/lib/translation/translation.service';
import { upsertVocabulary } from '@/features/vocabulary/vocabulary.service';

interface SentenceViewProps {
  text: string;
  selectedWord: string | null;
  onWordClick: (word: string) => void;
  vocabularyMap: Map<string, Vocabulary>;
  onVocabularyUpdate?: (word: string, vocabulary: Vocabulary | null) => void;
}

interface WordInfo {
  word: string;
  cleanWord: string;
  vocabulary?: Vocabulary;
  translation?: string;
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

  SentenceDisplay: {
    marginBottom: '32px',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '1.6',
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

  WordList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    maxHeight: 'calc(100% - 200px)',
    overflowY: 'auto' as const,
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#404040 #1f1f1f',
    paddingRight: '8px',
  } as React.CSSProperties & {
    scrollbarWidth?: 'thin' | 'auto' | 'none';
    scrollbarColor?: string;
  },

  WordListItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #2a2a2a',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  WordListItemClickable: {
    cursor: 'pointer',
  } as React.CSSProperties,

  ComprehensionBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#262626',
    border: '1px solid #313131',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color: '#ffffff',
    flexShrink: 0,
  } as React.CSSProperties,

  ComprehensionBadgeActive: {
    backgroundColor: '#FFD54F',
    color: '#000000',
    borderColor: '#FFD54F',
  } as React.CSSProperties,

  ComprehensionBadgeNew: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
  } as React.CSSProperties,

  WordContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  } as React.CSSProperties,

  WordRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,

  WordText: {
    color: '#ffffff',
    fontWeight: 500,
    fontSize: '14px',
  } as React.CSSProperties,

  TranslationText: {
    color: '#a0a0a0',
    fontSize: '14px',
  } as React.CSSProperties,

  SpeakerIcon: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    color: '#a0a0a0',
    flexShrink: 0,
  } as React.CSSProperties,

  NavigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '16px',
    gap: '12px',
  } as React.CSSProperties,

  NavButton: {
    padding: '8px 16px',
    backgroundColor: '#262626',
    border: '1px solid #313131',
    borderRadius: '6px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  } as React.CSSProperties,

  NavButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  } as React.CSSProperties,
};

function getWordStyle(vocabulary: Vocabulary | undefined, isSelected: boolean, isPunctuation: boolean): React.CSSProperties {
  if (isSelected) {
    return styles.WordSelected;
  }

  if (isPunctuation) {
    return {};
  }

  if (vocabulary) {
    if (vocabulary.comprehension === 5) {
      return {};
    } else if (vocabulary.comprehension === 3 || vocabulary.comprehension === 4) {
      // Learning (comprehension 3-4): Light yellow
      return styles.WordLearningLight;
    } else if (vocabulary.comprehension === 2) {
      // Learning (comprehension 2): Yellow
      return styles.WordLearning;
    } else if (vocabulary.comprehension === 1) {
      return styles.WordUnknown;
    } else if (vocabulary.comprehension === 0) {
      return {};
    }
  }

  return {};
}

export default function SentenceView({ text, selectedWord, onWordClick, vocabularyMap, onVocabularyUpdate }: SentenceViewProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [wordTranslations, setWordTranslations] = useState<Map<string, string>>(new Map());

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

  const currentSentence = sentences[currentSentenceIndex] || '';

  // Extract words from current sentence
  const wordsInSentence = useMemo(() => {
    if (!currentSentence) return [];

    const tokens = currentSentence.split(/(\s+|[.,!?;:])/);
    const words: WordInfo[] = [];

    for (const token of tokens) {
      const trimmed = token.trim();
      if (!trimmed) continue;

      // Check if it's punctuation
      if (/^[.,!?;:]+$/.test(trimmed)) {
        continue; // Skip punctuation in word list
      }

      const cleanWord = trimmed.replace(/[.,!?;:]/g, '').toLowerCase();
      if (cleanWord.length === 0) continue;

      const vocabulary = vocabularyMap.get(cleanWord);
      words.push({
        word: trimmed,
        cleanWord,
        vocabulary,
      });
    }

    return words;
  }, [currentSentence, vocabularyMap]);

  // Fetch translations for all words
  useEffect(() => {
    const fetchTranslations = async () => {
      const newTranslations = new Map<string, string>();

      // First, set vocabulary translations (saved meanings take priority)
      for (const wordInfo of wordsInSentence) {
        if (wordInfo.vocabulary?.translation) {
          newTranslations.set(wordInfo.cleanWord, wordInfo.vocabulary.translation);
        }
      }

      // Then fetch translations for ALL words that don't have vocabulary translations
      // This ensures every word gets a translation, even if not in saved vocab
      const translationPromises = wordsInSentence
        .filter(wordInfo => {
          // Only fetch if we don't already have a translation from vocabulary
          return !newTranslations.has(wordInfo.cleanWord);
        })
        .map(async (wordInfo) => {
          try {
            const result = await getTranslation(wordInfo.cleanWord, {
              sourceLang: 'es',
              targetLang: 'en',
            });
            if (result?.translation) {
              newTranslations.set(wordInfo.cleanWord, result.translation);
            }
          } catch (error) {
            console.error(`Error fetching translation for ${wordInfo.cleanWord}:`, error);
          }
        });

      // Wait for all translations to be fetched
      await Promise.all(translationPromises);
      
      // Update state with all translations
      setWordTranslations(newTranslations);
    };

    if (wordsInSentence.length > 0) {
      fetchTranslations();
    }
  }, [wordsInSentence, vocabularyMap]);

  const handlePrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
    }
  };

  // Render sentence with highlighting
  const renderSentence = () => {
    const tokens = currentSentence.split(/(\s+|[.,!?;:])/);
    
    return tokens.map((token, index) => {
      const trimmed = token.trim();
      if (!trimmed) return <span key={index}>{token}</span>;

      const isPunctuation = /^[.,!?;:]+$/.test(trimmed);
      const cleanWord = trimmed.replace(/[.,!?;:]/g, '').toLowerCase();
      const vocabulary = vocabularyMap.get(cleanWord);
      const isSelected = selectedWord === cleanWord;

      const wordStyle = getWordStyle(vocabulary, isSelected, isPunctuation);

      if (isPunctuation) {
        return <span key={index}>{token}</span>;
      }

      return (
        <span
          key={index}
          style={{
            ...styles.Word,
            ...wordStyle,
          }}
          onClick={() => onWordClick(cleanWord)}
        >
          {token}
        </span>
      );
    });
  };

  const hasPrevious = currentSentenceIndex > 0;
  const hasNext = currentSentenceIndex < sentences.length - 1;

  // Handle adding word to vocabulary when clicked
  const handleAddWordToVocabulary = async (wordInfo: WordInfo) => {
    // Only allow adding words that aren't already in vocabulary
    if (wordInfo.vocabulary) return;

    const translation = wordTranslations.get(wordInfo.cleanWord) || '';
    
    try {
      // Create optimistic vocabulary entry with level 1 (first click)
      const optimisticVocabulary: Vocabulary = {
        id: 'temp-' + Date.now(),
        word: wordInfo.cleanWord,
        translation: translation || 'Translation placeholder',
        language: 'placeholder',
        comprehension: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Immediately notify parent component for instant visual update
      onVocabularyUpdate?.(wordInfo.cleanWord, optimisticVocabulary);

      // Save to database in background
      const savedVocabulary = await upsertVocabulary(
        wordInfo.cleanWord,
        1,
        translation || undefined
      );

      if (savedVocabulary) {
        // Update with confirmed vocabulary from database
        onVocabularyUpdate?.(wordInfo.cleanWord, savedVocabulary);
      } else {
        // If save failed, revert optimistic update
        onVocabularyUpdate?.(wordInfo.cleanWord, null);
      }
    } catch (error) {
      console.error('Error adding word to vocabulary:', error);
      // Revert optimistic update on error
      onVocabularyUpdate?.(wordInfo.cleanWord, null);
    }
  };

  return (
    <>
      <style>{`
        .sentence-view-word-list::-webkit-scrollbar {
          width: 6px;
        }
        .sentence-view-word-list::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 3px;
        }
        .sentence-view-word-list::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 3px;
        }
        .sentence-view-word-list::-webkit-scrollbar-thumb:hover {
          background: #505050;
        }
      `}</style>
      <div style={styles.Wrapper}>
        <div style={styles.Container}>
        {/* Sentence Display */}
        <div style={styles.SentenceDisplay}>
          {renderSentence()}
        </div>

        {/* Word List */}
        <div className="sentence-view-word-list" style={styles.WordList}>
          {wordsInSentence.map((wordInfo, index) => {
            const comprehension = wordInfo.vocabulary?.comprehension ?? 0;
            // Prioritize vocabulary translation (saved meaning), then fetched translation
            const translation = wordInfo.vocabulary?.translation || wordTranslations.get(wordInfo.cleanWord) || '';
            const isNew = !wordInfo.vocabulary || wordInfo.vocabulary.comprehension === 0;

            return (
              <div
                key={index}
                style={{
                  ...styles.WordListItem,
                  ...(isNew ? styles.WordListItemClickable : {}),
                }}
                onClick={() => {
                  if (isNew) {
                    handleAddWordToVocabulary(wordInfo);
                  }
                }}
                onMouseEnter={(e) => {
                  if (isNew) {
                    e.currentTarget.style.backgroundColor = '#262626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isNew) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    ...styles.ComprehensionBadge,
                    ...(isNew ? styles.ComprehensionBadgeNew : {}),
                    ...(comprehension === 2 ? styles.ComprehensionBadgeActive : {}),
                    ...(comprehension === 3 || comprehension === 4 ? { backgroundColor: '#FFF9C4', color: '#000000', borderColor: '#FFF9C4' } : {}),
                  }}
                >
                  {isNew ? '+' : (comprehension === 5 ? '✓' : (comprehension === 0 ? '+' : comprehension))}
                </div>
                <div style={styles.WordContent}>
                  <div style={styles.WordRow}>
                    <span style={styles.WordText}>{wordInfo.word}</span>
                    <svg
                      style={styles.SpeakerIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </div>
                  <span style={styles.TranslationText}>{translation || '—'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={styles.NavigationButtons}>
          <button
            style={{
              ...styles.NavButton,
              ...(!hasPrevious ? styles.NavButtonDisabled : {}),
            }}
            onClick={handlePrevious}
            disabled={!hasPrevious}
          >
            ← Previous
          </button>
          <span style={{ color: '#a0a0a0', fontSize: '14px', alignSelf: 'center' }}>
            {currentSentenceIndex + 1} / {sentences.length}
          </span>
          <button
            style={{
              ...styles.NavButton,
              ...(!hasNext ? styles.NavButtonDisabled : {}),
            }}
            onClick={handleNext}
            disabled={!hasNext}
          >
            Next →
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
