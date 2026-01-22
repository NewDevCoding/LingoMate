'use client';

import React, { useState } from 'react';
import { useSidebar } from '@/components/SidebarContext';

interface VocabularyItem {
  id: string;
  term: string;
  meaning: string;
  status: number; // 0-4, where 0 = not learned, 1-4 = learning stages, 5 = mastered
  isPhrase: boolean;
  dueForReview: boolean;
}

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
    flexDirection: 'column' as const,
    gap: '24px',
    marginBottom: '32px',
  } as React.CSSProperties,

  TabsContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
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
    gap: '16px',
  } as React.CSSProperties,

  ReviewButton: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    padding: '12px 24px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
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

// Mock data - replace with actual data fetching
const mockVocabulary: VocabularyItem[] = [
  {
    id: '1',
    term: 'abandoné',
    meaning: 'I left, abandoned',
    status: 2,
    isPhrase: false,
    dueForReview: false,
  },
  {
    id: '2',
    term: 'Text',
    meaning: '',
    status: 2,
    isPhrase: false,
    dueForReview: true,
  },
  {
    id: '3',
    term: 'Text',
    meaning: '',
    status: 0,
    isPhrase: false,
    dueForReview: false,
  },
  {
    id: '4',
    term: 'Text',
    meaning: '',
    status: 0,
    isPhrase: false,
    dueForReview: false,
  },
];

export default function VocabularyPage() {
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<'all' | 'phrases' | 'due'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(mockVocabulary);

  const handleTabClick = (tab: 'all' | 'phrases' | 'due') => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusClick = (itemId: string, status: number) => {
    setVocabulary((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status } : item
      )
    );
  };

  const handleDelete = (itemId: string) => {
    setVocabulary((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleMaster = (itemId: string) => {
    setVocabulary((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: 5 } : item
      )
    );
  };

  // Filter vocabulary based on active tab and search
  const filteredVocabulary = vocabulary.filter((item) => {
    // Tab filter
    if (activeTab === 'phrases' && !item.isPhrase) return false;
    if (activeTab === 'due' && !item.dueForReview) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.term.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div style={styles.PageContainer(isCollapsed)}>
      <div style={styles.TopSection}>
        <div style={styles.TopBar}>
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
          <button
            style={styles.ReviewButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#262626';
              e.currentTarget.style.borderColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
              e.currentTarget.style.borderColor = '#313131';
            }}
          >
            Review
          </button>
        </div>

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
      </div>

      <div>
        <div style={styles.TableHeader}>
          <div style={styles.TableHeaderCell}>Term</div>
          <div style={styles.TableHeaderCell}>Meaning</div>
          <div style={styles.TableHeaderCellRight}>Status</div>
        </div>
        <div style={styles.VocabularyList}>
          {filteredVocabulary.length === 0 ? (
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
                <div style={styles.TermCell}>{item.term}</div>
                <div style={styles.TableCell}>{item.meaning || ''}</div>
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
                      style={styles.NumberCircle(item.status === num)}
                      onClick={() => handleStatusClick(item.id, num)}
                      onMouseEnter={(e) => {
                        if (item.status !== num) {
                          e.currentTarget.style.backgroundColor = '#3a3a3a';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (item.status !== num) {
                          e.currentTarget.style.backgroundColor = '#2a2a2a';
                        }
                      }}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    style={styles.CheckmarkButton(item.status === 5)}
                    onClick={() => handleMaster(item.id)}
                    onMouseEnter={(e) => {
                      if (item.status !== 5) {
                        e.currentTarget.style.color = '#26c541';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.status !== 5) {
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
