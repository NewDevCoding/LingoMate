'use client';

import React, { useState } from 'react';
import ArticleRow from '@/features/reader/ArticleRow';
import ChatWindow from '@/features/reader/ChatWindow';
import { mockArticles } from '@/features/reader/article.service';
import { Article } from '@/types/article';

const styles = {
  PageContainer: {
    backgroundColor: '#161616',
    minHeight: '100vh',
    padding: '32px',
    paddingTop: '48px',
  } as React.CSSProperties,

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

  ChatBubble: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    backgroundColor: '#8b5cf6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    zIndex: 1001,
  } as React.CSSProperties,
};

export default function ReaderPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Split articles into two rows (first 6, then rest)
  const firstRowArticles = mockArticles.slice(0, 6);
  const secondRowArticles = mockArticles.slice(6);

  const handleArticleClick = (article: Article) => {
    // Placeholder for article navigation
    console.log('Article clicked:', article.title);
  };

  return (
    <>
      <div style={styles.PageContainer}>
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
          <ArticleRow
            title="Continue Learning"
            articles={firstRowArticles}
            onArticleClick={handleArticleClick}
          />
          <ArticleRow
            title="Your Library"
            articles={secondRowArticles}
            onArticleClick={handleArticleClick}
          />
        </div>

        <div
          style={styles.ChatBubble}
          onClick={() => setIsChatOpen(!isChatOpen)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
          }}
        >
          {isChatOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </div>
      </div>

      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
