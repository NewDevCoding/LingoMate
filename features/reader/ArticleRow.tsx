'use client';

import React from 'react';
import ArticleCard from './ArticleCard';
import { Article } from '@/types/article';

interface ArticleRowProps {
  title: string;
  articles: Article[];
  onArticleClick?: (article: Article) => void;
}

const styles = {
  RowContainer: {
    marginBottom: '32px',
  } as React.CSSProperties,

  RowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingRight: '24px',
  } as React.CSSProperties,

  RowTitle: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '28px',
  } as React.CSSProperties,

  ViewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#26c541',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,

  ScrollContainer: {
    display: 'flex',
    gap: '16px',
    overflowX: 'auto' as const,
    overflowY: 'hidden' as const,
    paddingRight: '24px',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#313131 transparent',
  } as React.CSSProperties,
};

export default function ArticleRow({ title, articles, onArticleClick }: ArticleRowProps) {
  return (
    <div style={styles.RowContainer}>
      <div style={styles.RowHeader}>
        <h2 style={styles.RowTitle}>{title}</h2>
        <a
          style={styles.ViewAllLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <div style={styles.ScrollContainer}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick?.(article)}
          />
        ))}
      </div>
    </div>
  );
}
