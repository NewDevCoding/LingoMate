import { NextRequest, NextResponse } from 'next/server';
import { initializeAllReviews } from '@/features/vocabulary/review/review.service';

/**
 * POST /api/vocabulary/reviews/initialize
 * Initialize review entries for all vocabulary words that don't have reviews yet
 * This is used for migration/initialization
 */
export async function POST(request: NextRequest) {
  try {
    const count = await initializeAllReviews();

    return NextResponse.json({
      message: `Initialized ${count} review entries`,
      count,
    });
  } catch (error) {
    console.error('Error initializing reviews:', error);
    return NextResponse.json(
      { error: 'Failed to initialize reviews' },
      { status: 500 }
    );
  }
}
