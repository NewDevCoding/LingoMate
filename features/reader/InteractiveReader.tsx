'use client';

import React, { useState, useEffect } from 'react';
import ReaderContent from './ReaderContent';
import WordDefinitionPanel from './WordDefinitionPanel';
import { getArticleById } from '@/features/reader/article.service';
import { Article } from '@/types/article';

interface InteractiveReaderProps {
  articleId: string;
}

const styles = {
  Container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#161616',
    overflow: 'hidden' as const,
  } as React.CSSProperties,

  MainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
  } as React.CSSProperties,

  RightSidebar: {
    width: '320px',
    backgroundColor: '#1f1f1f',
    borderLeft: '1px solid #313131',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  LoadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#ffffff',
    fontSize: '18px',
  } as React.CSSProperties,

  ErrorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#a0a0a0',
    fontSize: '16px',
    gap: '16px',
  } as React.CSSProperties,
};

export default function InteractiveReader({ articleId }: InteractiveReaderProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedArticle = await getArticleById(articleId);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  if (isLoading) {
    return (
      <div style={styles.Container}>
        <div style={styles.LoadingContainer}>Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={styles.Container}>
        <div style={styles.ErrorContainer}>
          <div>{error || 'Article not found'}</div>
        </div>
      </div>
    );
  }

  // Extract source from URL or use description as fallback
  const source = article.url ? new URL(article.url).hostname.replace('www.', '') : article.description || 'Article';

  return (
    <div style={styles.Container}>
      <div style={styles.MainContent}>
        <ReaderContent
          article={{
            ...article,
            source,
            thumbnail: article.image,
            progress: article.progress || 0,
          }}
          selectedWord={selectedWord}
          onWordSelect={setSelectedWord}
        />
      </div>

      <div style={styles.RightSidebar}>
        <WordDefinitionPanel
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      </div>
    </div>
  );
}
