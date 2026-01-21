'use client';

import React from 'react';
import { Article } from '@/types/article';

interface ArticleCardProps {
  article: Article;
  onClick?: () => void;
}

const styles = {
  Card: {
    minWidth: '280px',
    width: '280px',
    backgroundColor: '#1f1f1f',
    borderRadius: '12px',
    overflow: 'hidden' as const,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #313131',
  } as React.CSSProperties,

  Thumbnail: {
    width: '100%',
    height: '160px',
    backgroundColor: '#d4e4a0',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, #f5f8e8 2px, transparent 2px),
      radial-gradient(circle at 60% 70%, #f5f8e8 1.5px, transparent 1.5px),
      radial-gradient(ellipse at 40% 50%, #f5f8e8 3px, transparent 3px),
      radial-gradient(ellipse at 80% 20%, #f5f8e8 2px, transparent 2px)
    `,
    backgroundSize: '40px 40px, 30px 30px, 50px 50px, 35px 35px',
    backgroundPosition: '0 0, 20px 20px, 10px 10px, 30px 30px',
  } as React.CSSProperties,

  Content: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,

  Title: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  MetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  ProgressBadge: {
    backgroundColor: '#26c541',
    color: '#000000',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  Category: {
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 400,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  Duration: {
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 400,
  } as React.CSSProperties,

  NotificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    flexShrink: 0,
  } as React.CSSProperties,

  ViewsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#a0a0a0',
    fontSize: '12px',
  } as React.CSSProperties,
};

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <div
      style={styles.Card}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={styles.Thumbnail} />
      <div style={styles.Content}>
        <div style={styles.Title}>{article.title}</div>
        <div style={styles.MetaRow}>
          {article.hasNotification && <div style={styles.NotificationDot} />}
          <span style={styles.ProgressBadge}>
            {article.progress}% New Words
            {article.difficulty && ` ${article.difficulty}`}
          </span>
          {article.duration && <span style={styles.Duration}>{article.duration}</span>}
        </div>
        <div style={styles.MetaRow}>
          <span style={styles.Category}>{article.category}</span>
          {article.views !== undefined && (
            <div style={styles.ViewsContainer}>
              <span>{article.views}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
