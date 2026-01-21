'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import InteractiveReader from '@/features/reader/InteractiveReader';

export default function ArticleReaderPage() {
  const params = useParams();
  const articleId = params.id as string;

  return <InteractiveReader articleId={articleId} />;
}
