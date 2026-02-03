'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/SidebarContext';
import { getVocabulary, updateVocabularyComprehension, deleteVocabulary } from '@/features/vocabulary/vocabulary.service';
import { getDueWordsCount, getDueWords } from '@/features/vocabulary/review/review.service';
import { Vocabulary, VocabularyWithReview } from '@/types/word';
import { AudioManager } from '@/lib/speech/audio.manager';
import { BrowserTTSManager } from '@/lib/speech/audio.manager';

const styles = {
  PageContainer: (isCollapsed: boolean) => ({
    backgroundColor: '#161616',
    minHeight: '100vh',
    padding: '32px',
    paddingTop: '48px',
    maxWidth: '100%',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box' as const,
    overflowX: 'hidden' as const,
    transition: 'padding 0.3s ease',
  } as React.CSSProperties),

  TopSection: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '32px',
  } as React.CSSProperties,

  TabsContainer: {
    display: 'flex',
    gap: '0',
    alignItems: 'center',
    margin: '0',
    padding: '0',
    lineHeight: 'normal',
    fontSize: '14px',
  } as React.CSSProperties,

  Tab: (isActive: boolean) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? '#2a2a2a' : '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  } as React.CSSProperties),

  TopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0',
    margin: '0',
    marginBottom: '0',
    padding: '0',
    paddingBottom: '0',
    lineHeight: '1',
  } as React.CSSProperties,

  ReviewButton: {
    backgroundColor: '#26c541',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    outline: 'none',
  } as React.CSSProperties,

  SearchContainer: {
    position: 'relative' as const,
    flex: 1,
    maxWidth: '400px',
  } as React.CSSProperties,

  SearchInput: {
    width: '100%',
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    padding: '12px 16px 12px 44px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  SearchIcon: {
    position: 'absolute' as const,
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a0a0a0',
    pointerEvents: 'none' as const,
  } as React.CSSProperties,

  MainContainer: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    padding: '16px',
    paddingTop: '0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    margin: '0',
    marginTop: '0',
  } as React.CSSProperties,

  VocabularyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,

  TableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr',
    gap: '24px',
    padding: '16px 24px',
    paddingTop: '16px',
    backgroundColor: 'transparent',
    marginBottom: '8px',
  } as React.CSSProperties,

  TableHeaderCell: {
    textAlign: 'left' as const,
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  TableHeaderCellRight: {
    textAlign: 'right' as const,
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  VocabularyCard: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr',
    gap: '24px',
    padding: '20px 24px',
    transition: 'all 0.2s',
    alignItems: 'center',
  } as React.CSSProperties,

  TableCell: {
    color: '#ffffff',
    fontSize: '15px',
    lineHeight: '1.5',
  } as React.CSSProperties,

  TermCell: {
    color: '#ffffff',
    fontSize: '15px',
    textDecoration: 'underline',
    cursor: 'pointer',
    lineHeight: '1.5',
    fontWeight: 500,
  } as React.CSSProperties,

  StatusCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
  } as React.CSSProperties,

  IconButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a0a0a0',
    transition: 'color 0.2s',
    borderRadius: '4px',
  } as React.CSSProperties,

  NumberCircle: (isActive: boolean) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: isActive ? '#fbbf24' : '#2a2a2a',
    border: isActive ? 'none' : '1px solid #313131',
    color: isActive ? '#000000' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties),

  CheckmarkButton: (isActive: boolean) => ({
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isActive ? '#26c541' : '#a0a0a0',
    transition: 'color 0.2s',
    borderRadius: '4px',
  } as React.CSSProperties),
};

export default function VocabularyPage() {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'phrases' | 'due'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [dueWords, setDueWords] = useState<VocabularyWithReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const browserTTSRef = useRef<BrowserTTSManager | null>(null);

  // Initialize audio managers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioManagerRef.current = new AudioManager();
      browserTTSRef.current = new BrowserTTSManager();
    }

    return () => {
      audioManagerRef.current?.cleanup();
      browserTTSRef.current?.cleanup();
    };
  }, []);

  // Load vocabulary from database
  useEffect(() => {
    async function loadVocabulary() {
      setIsLoading(true);
      try {
        const vocab = await getVocabulary();
        setVocabulary(vocab);
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadVocabulary();
  }, []);

  // Load due words count and list
  useEffect(() => {
    async function loadDueData() {
      try {
        const count = await getDueWordsCount();
        setDueCount(count);
        
        // Load due words if on due tab
        if (activeTab === 'due') {
          const due = await getDueWords();
          setDueWords(due);
        }
      } catch (error) {
        console.error('Error loading due data:', error);
      }
    }

    loadDueData();
    // Refresh count periodically
    const interval = setInterval(loadDueData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabClick = async (tab: 'all' | 'phrases' | 'due') => {
    setActiveTab(tab);
    
    // Load due words when switching to due tab
    if (tab === 'due') {
      try {
        const due = await getDueWords();
        setDueWords(due);
      } catch (error) {
        console.error('Error loading due words:', error);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusClick = async (itemId: string, status: number) => {
    // Optimistic update
    setVocabulary((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, comprehension: status } : item
      )
    );

    // Update in database
    try {
      const updated = await updateVocabularyComprehension(itemId, status);
      if (updated) {
        setVocabulary((prev) =>
          prev.map((item) =>
            item.id === itemId ? updated : item
          )
        );
      } else {
        // Revert on error
        const vocab = await getVocabulary();
        setVocabulary(vocab);
      }
    } catch (error) {
      console.error('Error updating vocabulary status:', error);
      // Revert on error
      const vocab = await getVocabulary();
      setVocabulary(vocab);
    }
  };

  const handleDelete = async (itemId: string) => {
    // Optimistic update
    const previousVocabulary = [...vocabulary];
    setVocabulary((prev) => prev.filter((item) => item.id !== itemId));

    // Delete from database
    try {
      const success = await deleteVocabulary(itemId);
      if (!success) {
        // Revert on error
        setVocabulary(previousVocabulary);
      }
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      // Revert on error
      setVocabulary(previousVocabulary);
    }
  };

  const handleMaster = async (itemId: string) => {
    await handleStatusClick(itemId, 5);
  };

  const playWordAudio = async (word: string, language: string = 'es') => {
    if (!word || playingWord === word) return;

    // Stop any currently playing audio
    audioManagerRef.current?.stop();
    browserTTSRef.current?.stop();
    setPlayingWord(word);

    try {
      // Fetch TTS audio from API
      const response = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: word,
          language: language,
          speakingRate: 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If browser TTS fallback is suggested
        if (errorData.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(word, language);
          setPlayingWord(null);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Check if response is JSON (browser TTS fallback)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(word, language);
          setPlayingWord(null);
          return;
        }
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      if (audioManagerRef.current) {
        // Set up cleanup after playback
        const cleanup = () => {
          setPlayingWord(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        // Set callback for when playback ends
        audioManagerRef.current.setOnPlaybackEnd(cleanup);
        
        // Play and wait for completion
        try {
          await audioManagerRef.current.playAudio(audioUrl);
        } catch (error) {
          cleanup();
          throw error;
        }
      }
    } catch (error) {
      console.error('Error playing word audio:', error);
      setPlayingWord(null);
    }
  };

  // Filter vocabulary based on active tab and search
  const filteredVocabulary = (() => {
    // Get the base list based on tab
    let baseList: Vocabulary[];
    if (activeTab === 'due') {
      // Convert VocabularyWithReview to Vocabulary for display
      baseList = dueWords.map(dw => ({
        id: dw.id,
        word: dw.word,
        translation: dw.translation,
        language: dw.language,
        comprehension: dw.comprehension,
        createdAt: dw.createdAt,
        updatedAt: dw.updatedAt,
      }));
    } else {
      baseList = vocabulary;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return baseList.filter(item =>
        item.word.toLowerCase().includes(query) ||
        item.translation.toLowerCase().includes(query)
      );
    }

    return baseList;
  })();

  return (
    <div style={styles.PageContainer(isCollapsed)}>
      <div style={styles.TopSection}>
        <div style={styles.SearchContainer}>
          <svg
            style={styles.SearchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            style={styles.SearchInput}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#26c541';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#313131';
            }}
          />
        </div>
        <button
          style={styles.ReviewButton}
          onClick={() => router.push('/review')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#22b03a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#26c541';
          }}
        >
          Review{dueCount !== null && dueCount > 0 ? ` (${dueCount})` : ''}
        </button>
      </div>

      <div style={styles.TabsContainer}>
        <button
          style={styles.Tab(activeTab === 'all')}
          onClick={() => handleTabClick('all')}
          onMouseEnter={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.backgroundColor = '#262626';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }
          }}
        >
          All
        </button>
        <button
          style={styles.Tab(activeTab === 'phrases')}
          onClick={() => handleTabClick('phrases')}
          onMouseEnter={(e) => {
            if (activeTab !== 'phrases') {
              e.currentTarget.style.backgroundColor = '#262626';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'phrases') {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }
          }}
        >
          Phrases
        </button>
        <button
          style={styles.Tab(activeTab === 'due')}
          onClick={() => handleTabClick('due')}
          onMouseEnter={(e) => {
            if (activeTab !== 'due') {
              e.currentTarget.style.backgroundColor = '#262626';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'due') {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }
          }}
        >
          Due for review
        </button>
      </div>
      <div style={styles.MainContainer}>
        <div style={styles.TableHeader}>
          <div style={styles.TableHeaderCell}>Term</div>
          <div style={styles.TableHeaderCell}>Meaning</div>
          <div style={styles.TableHeaderCellRight}>Status</div>
        </div>
        <div style={styles.VocabularyList}>
          {isLoading ? (
            <div style={{ ...styles.VocabularyCard, textAlign: 'center', padding: '40px', gridTemplateColumns: '1fr' }}>
              <div style={{ color: '#a0a0a0' }}>Loading vocabulary...</div>
            </div>
          ) : filteredVocabulary.length === 0 ? (
            <div style={{ ...styles.VocabularyCard, textAlign: 'center', padding: '40px', gridTemplateColumns: '1fr' }}>
              <div style={{ color: '#a0a0a0' }}>No vocabulary items found</div>
            </div>
          ) : (
            filteredVocabulary.map((item) => (
              <div
                key={item.id}
                style={styles.VocabularyCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#262626';
                  e.currentTarget.style.borderColor = '#404040';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f1f1f';
                  e.currentTarget.style.borderColor = '#313131';
                }}
              >
                <div style={{ 
                  ...styles.TermCell, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  textDecoration: 'none',
                  position: 'relative' as const,
                }}>
                  <span style={{ textDecoration: 'underline', flex: '0 0 auto' }}>{item.word}</span>
                  <button
                    style={{
                      ...styles.IconButton,
                      color: playingWord === item.word ? '#26c541' : '#808080',
                      backgroundColor: playingWord === item.word ? '#1a3a1a' : 'transparent',
                      minWidth: '28px',
                      minHeight: '28px',
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      opacity: 1,
                      visibility: 'visible' as const,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playWordAudio(item.word, item.language);
                    }}
                    onMouseEnter={(e) => {
                      if (playingWord !== item.word) {
                        e.currentTarget.style.color = '#26c541';
                        e.currentTarget.style.backgroundColor = '#1a2a1a';
                        e.currentTarget.style.borderColor = '#26c541';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (playingWord !== item.word) {
                        e.currentTarget.style.color = '#808080';
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = '#404040';
                      }
                    }}
                    aria-label="Play pronunciation"
                    title="Play pronunciation"
                  >
                    {playingWord === item.word ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div style={styles.TableCell}>{item.translation || ''}</div>
                <div style={styles.StatusCell}>
                  <button
                    style={styles.IconButton}
                    onClick={() => handleDelete(item.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#a0a0a0';
                    }}
                    aria-label="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      style={styles.NumberCircle(item.comprehension === num)}
                      onClick={() => handleStatusClick(item.id, num)}
                      onMouseEnter={(e) => {
                        if (item.comprehension !== num) {
                          e.currentTarget.style.backgroundColor = '#3a3a3a';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (item.comprehension !== num) {
                          e.currentTarget.style.backgroundColor = '#2a2a2a';
                        }
                      }}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    style={styles.CheckmarkButton(item.comprehension === 5)}
                    onClick={() => handleMaster(item.id)}
                    onMouseEnter={(e) => {
                      if (item.comprehension !== 5) {
                        e.currentTarget.style.color = '#26c541';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.comprehension !== 5) {
                        e.currentTarget.style.color = '#a0a0a0';
                      }
                    }}
                    aria-label="Mark as mastered"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
