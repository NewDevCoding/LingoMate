'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleRow from '@/features/reader/ArticleRow';
import { getArticles, searchArticles } from '@/features/reader/article.service';
import { Article } from '@/types/article';
import { useSidebar } from '@/components/SidebarContext';

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

  TopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '40px',
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

  ImportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    padding: '12px 20px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
  } as React.CSSProperties,

  ContentArea: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
};

export default function ReaderPage() {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      try {
        const fetchedArticles = searchQuery
          ? await searchArticles(searchQuery)
          : await getArticles();
        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error loading articles:', error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadArticles();
  }, [searchQuery]);

  // Split articles into two rows (first 6, then rest)
  const firstRowArticles = articles.slice(0, 6);
  const secondRowArticles = articles.slice(6);

  const handleArticleClick = (article: Article) => {
    // Navigate to interactive reader page
    router.push(`/reader/${article.id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div style={styles.PageContainer(isCollapsed)}>
        <div style={styles.TopBar}>
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
              placeholder="Search Library"
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
            style={styles.ImportButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#262626';
              e.currentTarget.style.borderColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
              e.currentTarget.style.borderColor = '#313131';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </button>
        </div>

        <div style={styles.ContentArea}>
          {isLoading ? (
            <div style={{ color: '#ffffff', textAlign: 'center', padding: '40px' }}>
              Loading articles...
            </div>
          ) : articles.length === 0 ? (
            <div style={{ color: '#a0a0a0', textAlign: 'center', padding: '40px' }}>
              No articles found
            </div>
          ) : (
            <>
              {firstRowArticles.length > 0 && (
                <ArticleRow
                  title="Continue Learning"
                  articles={firstRowArticles}
                  onArticleClick={handleArticleClick}
                />
              )}
              {secondRowArticles.length > 0 && (
                <ArticleRow
                  title="Your Library"
                  articles={secondRowArticles}
                  onArticleClick={handleArticleClick}
                />
              )}
            </>
          )}
        </div>
      </div>
  );
}
