import { NextRequest, NextResponse } from 'next/server';
import { getDueWordsCount } from '@/features/vocabulary/review/review.service';

/**
 * GET /api/vocabulary/reviews/count
 * Get count of words due for review
 */
export async function GET(request: NextRequest) {
  try {
    const count = await getDueWordsCount();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting due words count:', error);
    return NextResponse.json(
      { error: 'Failed to get due words count' },
      { status: 500 }
    );
  }
}
