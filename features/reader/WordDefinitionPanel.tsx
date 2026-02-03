'use client';

import React, { useState, useEffect } from 'react';
import { getVocabularyByWord, upsertVocabulary } from '@/features/vocabulary/vocabulary.service';
import { Vocabulary } from '@/types/word';
import { getTranslation } from '@/lib/translation/translation.service';

interface WordDefinitionPanelProps {
  word: string | null;
  onClose: () => void;
  vocabularyMap?: Map<string, Vocabulary>;
  onVocabularyUpdate?: (word: string, vocabulary: Vocabulary | null) => void;
}

const styles = {
  Container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden' as const,
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
    flexShrink: 0,
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

  ScrollableContent: {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
    // Custom scrollbar styling
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#404040 #1f1f1f',
  } as React.CSSProperties & {
    scrollbarWidth?: 'thin' | 'auto' | 'none';
    scrollbarColor?: string;
  },

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
    minHeight: '44px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    lineHeight: '1.5',
    flexShrink: 0,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#262626',
    borderRadius: '8px',
    border: '1px solid #313131',
    gap: '12px',
  } as React.CSSProperties,

  MeaningText: {
    color: '#ffffff',
    fontSize: '14px',
    flex: 1,
    wordWrap: 'break-word' as const,
    overflowWrap: 'break-word' as const,
  } as React.CSSProperties,

  AddButton: {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    minHeight: '24px',
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
    flexShrink: 0,
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
    display: 'flex',
    gap: '8px',
    paddingTop: '16px',
    flexShrink: 0,
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

export default function WordDefinitionPanel({ word, onClose, vocabularyMap, onVocabularyUpdate }: WordDefinitionPanelProps) {
  const [selectedRating, setSelectedRating] = useState<number | 'check' | null>(1);
  const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState('');
  const [meanings, setMeanings] = useState<string[]>([]);
  
  // Calculate textarea rows based on content
  const calculateTextareaRows = (text: string): number => {
    if (!text) return 1;
    const lines = text.split('\n').length;
    const estimatedRows = Math.ceil(text.length / 40); // Rough estimate: 40 chars per line
    return Math.max(1, Math.min(Math.max(lines, estimatedRows), 10)); // Min 1, max 10 rows
  };

  // Load vocabulary and translation when word changes
  useEffect(() => {
    if (!word) {
      setVocabulary(null);
      setSelectedRating(0);
      setTranslation('');
      setMeanings([]);
      return;
    }

    async function loadVocabularyAndTranslation() {
      setIsLoading(true);
      try {
        // First check if word is in the vocabulary map (might be recently auto-added)
        const normalizedWord = word.toLowerCase();
        const mapVocab = vocabularyMap?.get(normalizedWord);
        
        if (mapVocab) {
          // Word is in the map (either from auto-add or recent update)
          setVocabulary(mapVocab);
          setSelectedRating(mapVocab.comprehension === 5 ? 'check' : mapVocab.comprehension);
          setTranslation(mapVocab.translation);
          } else {
            // Try to load from database
            const vocab = await getVocabularyByWord(word);
            if (vocab) {
              setVocabulary(vocab);
              setSelectedRating(vocab.comprehension === 5 ? 'check' : vocab.comprehension);
              setTranslation(vocab.translation);
            } else {
              // No vocabulary entry found - word is unknown (comprehension 0)
              // When clicked, it will be auto-added with level 1
              setVocabulary(null);
              setSelectedRating(0); // Show as level 0 in panel (not yet clicked)
              setTranslation('');
              
              // Fetch translation and meanings from API
              setIsTranslating(true);
              try {
                const translationResult = await getTranslation(word, {
                  sourceLang: 'es', // TODO: Get from article or user settings
                  targetLang: 'en',
                });
                
                if (translationResult) {
                  if (translationResult.translation) {
                    setTranslation(translationResult.translation);
                  }
                  // Set multiple meanings if available
                  if (translationResult.meanings && translationResult.meanings.length > 0) {
                    setMeanings(translationResult.meanings);
                  } else if (translationResult.translation) {
                    // If no meanings array, use translation as single meaning
                    setMeanings([translationResult.translation]);
                  }
                }
              } catch (error) {
                console.error('Error fetching translation:', error);
                // Translation failed, but don't block UI - user can still enter manually
                setMeanings([]);
              } finally {
                setIsTranslating(false);
              }
            }
          }
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadVocabularyAndTranslation();
  }, [word]);

  // Use actual meanings from API, fallback to mock if needed
  const displayMeanings = meanings.length > 0 
    ? meanings 
    : (word ? (mockDefinitions[word]?.meanings || ['No definition available']) : []);
  
  const definition = word ? (mockDefinitions[word] || {
    types: ['unknown'],
    meanings: displayMeanings,
  }) : null;

  const handleRatingClick = async (rating: number | 'check') => {
    if (!word) return;

    const comprehension = rating === 'check' ? 5 : rating;
    
    // Optimistic update - update UI immediately
    setSelectedRating(rating);
    
    // Create optimistic vocabulary object for immediate visual update
    const optimisticVocabulary: Vocabulary = vocabulary ? {
      ...vocabulary,
      comprehension,
      updatedAt: new Date().toISOString(),
    } : {
      id: 'temp-' + Date.now(), // Temporary ID for optimistic update
      word: word.toLowerCase(),
      translation: translation || 'Translation placeholder',
      language: 'placeholder',
      comprehension,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Immediately notify parent component for instant visual update
    onVocabularyUpdate?.(word, optimisticVocabulary);
    
    // Update in database
    try {
      const updated = await upsertVocabulary(word, comprehension, translation || undefined);
      if (updated) {
        setVocabulary(updated);
        setTranslation(updated.translation);
        // Notify parent component with confirmed update (in case there are differences)
        onVocabularyUpdate?.(word, updated);
      } else {
        // If update failed, revert optimistic update
        if (vocabulary) {
          setSelectedRating(vocabulary.comprehension === 5 ? 'check' : vocabulary.comprehension);
          onVocabularyUpdate?.(word, vocabulary);
        } else {
          setSelectedRating(1);
          onVocabularyUpdate?.(word, null);
        }
      }
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      // Revert optimistic update on error
      if (vocabulary) {
        setSelectedRating(vocabulary.comprehension === 5 ? 'check' : vocabulary.comprehension);
        onVocabularyUpdate?.(word, vocabulary);
      } else {
        setSelectedRating(1);
        onVocabularyUpdate?.(word, null);
      }
    }
  };

  const handleTranslationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranslation(e.target.value);
  };

  const handleTranslationBlur = async () => {
    if (!word || !translation.trim()) return;

    const comprehension = selectedRating === 'check' ? 5 : (selectedRating ?? 0);
    try {
      const updated = await upsertVocabulary(word, comprehension, translation);
      if (updated) {
        setVocabulary(updated);
        // Notify parent component of vocabulary update
        onVocabularyUpdate?.(word, updated);
      }
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  };

  if (!word) {
    return (
      <div style={styles.Container}>
        <div style={styles.EmptyState}>
          <p>Select a word to see its definition</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={styles.Container}>
        <div style={styles.EmptyState}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show translation loading indicator in input field
  const translationPlaceholder = isTranslating 
    ? 'Translating...' 
    : 'Enter a new meaning';

  return (
    <>
      <style>{`
        .word-panel-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        .word-panel-scrollable::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 3px;
        }
        .word-panel-scrollable::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 3px;
        }
        .word-panel-scrollable::-webkit-scrollbar-thumb:hover {
          background: #505050;
        }
      `}</style>
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

      <div className="word-panel-scrollable" style={styles.ScrollableContent}>
        <textarea
          placeholder={translationPlaceholder}
          style={styles.InputField}
          value={translation}
          onChange={handleTranslationChange}
          onBlur={handleTranslationBlur}
          disabled={isTranslating}
          rows={calculateTextareaRows(translation)}
        />

        <div>
          <div style={styles.SectionTitle}>Popular Meanings</div>
          <div style={styles.MeaningList}>
            {displayMeanings.length > 0 ? (
              displayMeanings.slice(0, 10).map((meaning, index) => (
              <div key={index} style={styles.MeaningItem}>
                <span style={styles.MeaningText}>{meaning}</span>
                <button 
                  style={styles.AddButton}
                  onClick={async () => {
                    if (!word) return;
                    
                    // Set this meaning as the translation in the text box
                    setTranslation(meaning);
                    
                    // Get current comprehension level (default to 2 if new word, or current level if exists)
                    const comprehension = vocabulary 
                      ? (selectedRating === 'check' ? 5 : (selectedRating || vocabulary.comprehension))
                      : 2; // New words start at level 2
                    
                    // Update vocabulary with the selected meaning
                    try {
                      const updated = await upsertVocabulary(word, comprehension, meaning);
                      if (updated) {
                        setVocabulary(updated);
                        // Notify parent component of vocabulary update
                        onVocabularyUpdate?.(word, updated);
                      }
                    } catch (error) {
                      console.error('Error updating vocabulary with selected meaning:', error);
                    }
                  }}
                  title="Use this meaning"
                >
                  +
                </button>
              </div>
            ))
          ) : (
            <div style={styles.MeaningItem}>
              <span style={styles.MeaningText}>No meanings available</span>
            </div>
          )}
        </div>
        </div>
      </div>

      <div style={styles.Footer}>
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
    </>
  );
}
