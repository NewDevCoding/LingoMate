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
    position: 'fixed' as const,
    top: '116px', // Start below TopHeader with 16px margin
    right: '16px', // 16px margin from right edge
    width: '320px',
    height: 'calc(100vh - 132px)', // Full height minus TopHeader and margins (100px + 16px top + 16px bottom)
    backgroundColor: '#1a1a1a',
    borderLeft: '2px solid #2a2a2a',
    borderRadius: '8px',
    boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 100,
    marginBottom: '16px', // Bottom margin
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

  /**
   * Auto-add word to vocabulary with level 2 comprehension
   * This is called when a user clicks on an unknown word (level 1)
   * Clicking advances it to level 2 (yellow highlighting)
   */
  const autoAddWordToVocabulary = async (word: string): Promise<void> => {
    const normalizedWord = word.toLowerCase().trim();
    
    // Validate word
    if (!normalizedWord || normalizedWord.length === 0) {
      return;
    }

    // Check if word already exists in vocabulary map
    if (vocabularyMap.has(normalizedWord)) {
      return; // Word already added, no need to add again
    }

    try {
      // Fetch translation automatically (non-blocking)
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
        // Continue even if translation fails - user can add it manually
      }
      
      // Create optimistic vocabulary entry with level 2 (clicking advances from unknown/level 1 to level 2)
      const newVocabulary: Vocabulary = {
        id: 'temp-' + Date.now(),
        word: normalizedWord,
        translation: translation || 'Translation placeholder',
        language: 'placeholder', // TODO: Get from article or user settings
        comprehension: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Optimistically update the map immediately for instant visual feedback
      setVocabularyMap(prev => {
        const newMap = new Map(prev);
        newMap.set(normalizedWord, newVocabulary);
        return newMap;
      });
      
      // Save to database in background (non-blocking)
      upsertVocabulary(word, 2, translation)
        .then(updated => {
          if (updated) {
            // Update with real database entry (replaces temp ID)
            setVocabularyMap(prev => {
              const newMap = new Map(prev);
              newMap.set(normalizedWord, updated);
              return newMap;
            });
          } else {
            // If save failed, remove from map (revert optimistic update)
            console.error('Failed to save vocabulary to database');
            setVocabularyMap(prev => {
              const newMap = new Map(prev);
              newMap.delete(normalizedWord);
              return newMap;
            });
          }
        })
        .catch(error => {
          console.error('Error saving vocabulary:', error);
          // Revert optimistic update on error
          setVocabularyMap(prev => {
            const newMap = new Map(prev);
            newMap.delete(normalizedWord);
            return newMap;
          });
        });
    } catch (error) {
      console.error('Error auto-adding word to vocabulary:', error);
      // Don't update map if there's an error
    }
  };

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
          onWordSelect={(word: string) => {
            setSelectedWord(word);
            
            // Auto-add word to vocabulary with level 1 if it doesn't exist
            // This happens automatically when clicking any unknown word
            autoAddWordToVocabulary(word);
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
