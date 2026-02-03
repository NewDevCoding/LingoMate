'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReaderContent from './ReaderContent';
import WordDefinitionPanel from './WordDefinitionPanel';
import { getArticleById } from '@/features/reader/article.service';
import { getVocabularyForWords, upsertVocabulary } from '@/features/vocabulary/vocabulary.service';
import { getTranslation } from '@/lib/translation/translation.service';
import { Article } from '@/types/article';
import { Vocabulary } from '@/types/word';

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
  const [vocabularyMap, setVocabularyMap] = useState<Map<string, Vocabulary>>(new Map());

  // Extract unique words from article content
  const articleWords = useMemo(() => {
    if (!article?.content) return [];
    
    // Split text into words, normalize, and remove duplicates
    const words = article.content
      .split(/(\s+|[.,!?;:])/)
      .map(token => token.replace(/[.,!?;:]/g, '').toLowerCase().trim())
      .filter(word => word.length > 0);
    
    return Array.from(new Set(words));
  }, [article?.content]);

  // Load vocabulary when article words change
  useEffect(() => {
    async function loadVocabulary() {
      if (articleWords.length === 0) {
        setVocabularyMap(new Map());
        return;
      }

      try {
        const vocabMap = await getVocabularyForWords(articleWords);
        setVocabularyMap(vocabMap);
      } catch (err) {
        console.error('Error loading vocabulary:', err);
        setVocabularyMap(new Map());
      }
    }

    loadVocabulary();
  }, [articleWords]);

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
          onWordSelect={async (word: string) => {
            setSelectedWord(word);
            
            // Auto-add word to vocabulary with level 1 if it doesn't exist
            const normalizedWord = word.toLowerCase();
            if (!vocabularyMap.has(normalizedWord)) {
              try {
                // Fetch translation automatically
                let translation = '';
                try {
                  const translationResult = await getTranslation(word, {
                    sourceLang: 'es', // TODO: Get from article or user settings
                    targetLang: 'en',
                  });
                  if (translationResult?.translation) {
                    translation = translationResult.translation;
                  }
                } catch (error) {
                  console.error('Error fetching translation:', error);
                }
                
                // Create vocabulary entry with level 1
                const newVocabulary: Vocabulary = {
                  id: 'temp-' + Date.now(),
                  word: normalizedWord,
                  translation: translation || 'Translation placeholder',
                  language: 'placeholder',
                  comprehension: 1,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                
                // Optimistically update the map immediately
                setVocabularyMap(prev => {
                  const newMap = new Map(prev);
                  newMap.set(normalizedWord, newVocabulary);
                  return newMap;
                });
                
                // Save to database in background
                upsertVocabulary(word, 1, translation).then(updated => {
                  if (updated) {
                    setVocabularyMap(prev => {
                      const newMap = new Map(prev);
                      newMap.set(normalizedWord, updated);
                      return newMap;
                    });
                  }
                }).catch(error => {
                  console.error('Error saving vocabulary:', error);
                  // Revert optimistic update on error
                  setVocabularyMap(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(normalizedWord);
                    return newMap;
                  });
                });
              } catch (error) {
                console.error('Error auto-adding word:', error);
              }
            }
          }}
          vocabularyMap={vocabularyMap}
        />
      </div>

      <div style={styles.RightSidebar}>
        <WordDefinitionPanel
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          vocabularyMap={vocabularyMap}
          onVocabularyUpdate={(word, vocabulary) => {
            // Update vocabulary map when word is added or updated
            if (vocabulary) {
              setVocabularyMap(prev => {
                const newMap = new Map(prev);
                newMap.set(word.toLowerCase(), vocabulary);
                return newMap;
              });
            } else {
              // If vocabulary is deleted, remove from map
              setVocabularyMap(prev => {
                const newMap = new Map(prev);
                newMap.delete(word.toLowerCase());
                return newMap;
              });
            }
          }}
        />
      </div>
    </div>
  );
}
