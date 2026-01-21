'use client';

import React, { useState } from 'react';
import ReaderContent from './ReaderContent';
import WordDefinitionPanel from './WordDefinitionPanel';

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
};

export default function InteractiveReader({ articleId }: InteractiveReaderProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // TODO: Fetch article data from Supabase using articleId
  // For now, using mock data
  const mockArticle = {
    id: articleId,
    title: 'Don Quijote - Introducción',
    source: 'Don Quijote - Easy Spanish',
    thumbnail: '/placeholder-thumbnail.jpg',
    content: `Hola, mundo. Esta es una introducción a Don Quijote, una obra escrita por Miguel de Cervantes en 1605. Es la historia de un caballero valiente que no está completamente cuerdo. En esta pequeña introducción, haremos algunas aclaraciones para estructurar mejor la definición. Tengo muchas cosas que decir sobre esta obra maestra de la literatura española.`,
    progress: 20,
  };

  return (
    <div style={styles.Container}>
      <div style={styles.MainContent}>
        <ReaderContent
          article={mockArticle}
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
