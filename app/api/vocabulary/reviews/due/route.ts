import { NextRequest, NextResponse } from 'next/server';
import { getDueWords } from '@/features/vocabulary/review/review.service';

/**
 * GET /api/vocabulary/reviews/due
 * Get all vocabulary words that are due for review
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    if (limit && (isNaN(limit) || limit < 1)) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 }
      );
    }

    const dueWords = await getDueWords(limit);

    return NextResponse.json({
      words: dueWords,
      count: dueWords.length,
    });
  } catch (error) {
    console.error('Error fetching due words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due words' },
      { status: 500 }
    );
  }
}
