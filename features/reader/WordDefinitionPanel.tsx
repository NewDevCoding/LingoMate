'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getVocabularyByWord, upsertVocabulary } from '@/features/vocabulary/vocabulary.service';
import { Vocabulary } from '@/types/word';
import { getTranslation } from '@/lib/translation/translation.service';
import { AudioManager, BrowserTTSManager } from '@/lib/speech/audio.manager';

interface WordDefinitionPanelProps {
  word: string | null;
  onClose: () => void;
  vocabularyMap?: Map<string, Vocabulary>;
  onVocabularyUpdate?: (word: string, vocabulary: Vocabulary | null) => void;
  articleContent?: string;
  onWordSelect?: (word: string) => void;
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
    overflow: 'hidden' as const,
  } as React.CSSProperties,

  Word: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
  } as React.CSSProperties,

  WordText: (fontSize: number) => ({
    fontSize: `${fontSize}px`,
    minWidth: 0,
    flex: 1,
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    lineHeight: '1.2',
  } as React.CSSProperties),

  SpeakerButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  } as React.CSSProperties,

  SpeakerButtonActive: {
    backgroundColor: '#26c541',
    borderColor: '#26c541',
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

  ComprehensionBadgeNew: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
  } as React.CSSProperties,

  ComprehensionBadgeActive: {
    backgroundColor: '#FFD54F',
    color: '#000000',
    borderColor: '#FFD54F',
  } as React.CSSProperties,

  TabContainer: {
    display: 'flex',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #313131',
    flexShrink: 0,
  } as React.CSSProperties,

  TabButton: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: '#262626',
    border: '1px solid #313131',
    borderRadius: '6px',
    color: '#a0a0a0',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.2s',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  TabButtonActive: {
    backgroundColor: '#26c541',
    color: '#000000',
    borderColor: '#26c541',
  } as React.CSSProperties,

  WordListContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    minHeight: 0,
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#404040 #1f1f1f',
    paddingRight: '8px',
  } as React.CSSProperties & {
    scrollbarWidth?: 'thin' | 'auto' | 'none';
    scrollbarColor?: string;
  },

  WordListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderBottom: '1px solid #2a2a2a',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  WordListItemText: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
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

export default function WordDefinitionPanel({ word, onClose, vocabularyMap, onVocabularyUpdate, articleContent, onWordSelect }: WordDefinitionPanelProps) {
  const [selectedRating, setSelectedRating] = useState<number | 'check' | null>(1);
  const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState('');
  const [meanings, setMeanings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'familiar' | 'new' | 'all'>('familiar');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [wordFontSize, setWordFontSize] = useState<number>(32);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const browserTTSRef = useRef<BrowserTTSManager | null>(null);
  const wordTextRef = useRef<HTMLSpanElement | null>(null);
  
  // Initialize audio managers
  useEffect(() => {
    audioManagerRef.current = new AudioManager();
    browserTTSRef.current = new BrowserTTSManager();

    return () => {
      audioManagerRef.current?.cleanup();
      browserTTSRef.current?.cleanup();
    };
  }, []);

  // Adjust font size for long words
  useEffect(() => {
    if (!word || !wordTextRef.current) {
      setWordFontSize(32);
      return;
    }

    const adjustFontSize = () => {
      const element = wordTextRef.current;
      if (!element) return;

      const container = element.parentElement?.parentElement;
      if (!container) return;

      const containerWidth = container.offsetWidth - 40 - 32 - 12; // padding - button - gap
      element.style.fontSize = '32px';
      
      if (element.scrollWidth > containerWidth) {
        // Calculate appropriate font size
        const ratio = containerWidth / element.scrollWidth;
        const newSize = Math.max(18, Math.floor(32 * ratio * 0.95));
        setWordFontSize(newSize);
      } else {
        setWordFontSize(32);
      }
    };

    // Check after render
    const timeout = setTimeout(adjustFontSize, 0);
    
    // Also check on resize
    window.addEventListener('resize', adjustFontSize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', adjustFontSize);
    };
  }, [word]);

  // Calculate textarea rows based on content
  const calculateTextareaRows = (text: string): number => {
    if (!text) return 1;
    const lines = text.split('\n').length;
    const estimatedRows = Math.ceil(text.length / 40); // Rough estimate: 40 chars per line
    return Math.max(1, Math.min(Math.max(lines, estimatedRows), 10)); // Min 1, max 10 rows
  };

  // Play word audio using TTS
  const playWordAudio = async (wordText: string) => {
    if (!wordText || isPlayingAudio) return;

    // Stop any currently playing audio
    audioManagerRef.current?.stop();
    browserTTSRef.current?.stop();
    setIsPlayingAudio(true);

    try {
      // Fetch TTS audio from API
      const response = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wordText,
          language: 'es', // TODO: Get from article or user settings
          speakingRate: 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If browser TTS fallback is suggested
        if (errorData.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(wordText, 'es');
          setIsPlayingAudio(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Check if response is JSON (browser TTS fallback)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(wordText, 'es');
          setIsPlayingAudio(false);
          return;
        }
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      if (audioManagerRef.current) {
        // Set callback for when playback ends
        audioManagerRef.current.setOnPlaybackEnd(() => {
          URL.revokeObjectURL(audioUrl);
          setIsPlayingAudio(false);
        });
        
        // Set error callback
        audioManagerRef.current.setOnPlaybackError(() => {
          URL.revokeObjectURL(audioUrl);
          setIsPlayingAudio(false);
        });
        
        await audioManagerRef.current.playAudio(audioUrl);
      } else {
        setIsPlayingAudio(false);
      }
    } catch (error) {
      console.error('Error playing word audio:', error);
      // Fallback to browser TTS if available
      if (browserTTSRef.current) {
        try {
          await browserTTSRef.current.speak(wordText, 'es');
        } catch (browserError) {
          console.error('Browser TTS also failed:', browserError);
        }
      }
      setIsPlayingAudio(false);
    }
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

  // Extract unique words from article content
  const articleWords = React.useMemo(() => {
    if (!articleContent) return [];
    
    const words = articleContent
      .split(/(\s+|[.,!?;:])/)
      .map(token => token.replace(/[.,!?;:]/g, '').toLowerCase().trim())
      .filter(word => word.length > 0);
    
    return Array.from(new Set(words));
  }, [articleContent]);

  // Filter words by tab
  const filteredWords = React.useMemo(() => {
    if (!vocabularyMap) return [];
    
    return articleWords
      .map(word => ({
        word,
        vocabulary: vocabularyMap.get(word),
      }))
      .filter(({ vocabulary }) => {
        if (activeTab === 'familiar') {
          // All words that are in the user's vocabulary (any comprehension level)
          return !!vocabulary;
        } else if (activeTab === 'new') {
          return !vocabulary || vocabulary.comprehension === 0;
        } else {
          // 'all'
          return true;
        }
      })
      .sort((a, b) => a.word.localeCompare(b.word));
  }, [articleWords, vocabularyMap, activeTab]);

  if (!word) {
    return (
      <>
        <style>{`
          .word-panel-word-list::-webkit-scrollbar {
            width: 6px;
          }
          .word-panel-word-list::-webkit-scrollbar-track {
            background: #1f1f1f;
            border-radius: 3px;
          }
          .word-panel-word-list::-webkit-scrollbar-thumb {
            background: #404040;
            border-radius: 3px;
          }
          .word-panel-word-list::-webkit-scrollbar-thumb:hover {
            background: #505050;
          }
        `}</style>
        <div style={styles.Container}>
          <div className="word-panel-word-list" style={styles.WordListContainer}>
            {filteredWords.length > 0 ? (
              filteredWords.map(({ word, vocabulary }, index) => {
                const comprehension = vocabulary?.comprehension ?? 0;
                const translation = vocabulary?.translation || '';
                
                return (
                  <div
                    key={index}
                    style={styles.WordListItem}
                    onClick={() => onWordSelect?.(word)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#262626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        ...styles.ComprehensionBadge,
                        ...(comprehension === 0 ? styles.ComprehensionBadgeNew : {}),
                        ...(comprehension === 2 ? styles.ComprehensionBadgeActive : {}),
                        ...(comprehension === 3 || comprehension === 4 ? { backgroundColor: '#FFF9C4', color: '#000000', borderColor: '#FFF9C4' } : {}),
                      }}
                    >
                      {comprehension === 0 ? '+' : (comprehension === 5 ? '✓' : comprehension)}
                    </div>
                    <span style={styles.WordListItemText}>{word}</span>
                    {translation && (
                      <span style={{ color: '#a0a0a0', fontSize: '12px', marginLeft: 'auto' }}>{translation}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={styles.EmptyState}>
                <p>No {activeTab} words found</p>
              </div>
            )}
          </div>
          
          <div style={styles.TabContainer}>
            <button
              style={{
                ...styles.TabButton,
                ...(activeTab === 'familiar' ? styles.TabButtonActive : {}),
              }}
              onClick={() => setActiveTab('familiar')}
            >
              Familiar
            </button>
            <button
              style={{
                ...styles.TabButton,
                ...(activeTab === 'new' ? styles.TabButtonActive : {}),
              }}
              onClick={() => setActiveTab('new')}
            >
              New
            </button>
            <button
              style={{
                ...styles.TabButton,
                ...(activeTab === 'all' ? styles.TabButtonActive : {}),
              }}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
          </div>
        </div>
      </>
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
        <div style={styles.Word}>
          <button
            style={{
              ...styles.SpeakerButton,
              ...(isPlayingAudio ? styles.SpeakerButtonActive : {}),
            }}
            onClick={() => playWordAudio(word)}
            onMouseEnter={(e) => {
              if (!isPlayingAudio) {
                e.currentTarget.style.backgroundColor = '#262626';
                e.currentTarget.style.borderColor = '#404040';
              }
            }}
            onMouseLeave={(e) => {
              if (!isPlayingAudio) {
                e.currentTarget.style.backgroundColor = '#1f1f1f';
                e.currentTarget.style.borderColor = '#313131';
              }
            }}
            title="Listen to pronunciation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
          <span 
            ref={wordTextRef}
            style={styles.WordText(wordFontSize)}
          >
            {word}
          </span>
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
