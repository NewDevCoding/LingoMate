import { NextRequest, NextResponse } from 'next/server';
import {
  initializeReview,
  recordReview,
  getReviewByVocabularyId,
} from '@/features/vocabulary/review/review.service';
import { ReviewQuality } from '@/types/word';

/**
 * POST /api/vocabulary/reviews
 * Initialize a review entry for a vocabulary word
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vocabularyId } = body;

    if (!vocabularyId || typeof vocabularyId !== 'string') {
      return NextResponse.json(
        { error: 'vocabularyId is required' },
        { status: 400 }
      );
    }

    const review = await initializeReview(vocabularyId);

    if (!review) {
      return NextResponse.json(
        { error: 'Failed to initialize review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error initializing review:', error);
    return NextResponse.json(
      { error: 'Failed to initialize review' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vocabulary/reviews
 * Record a review result and update SRS state
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { vocabularyId, quality } = body;

    if (!vocabularyId || typeof vocabularyId !== 'string') {
      return NextResponse.json(
        { error: 'vocabularyId is required' },
        { status: 400 }
      );
    }

    if (quality === undefined || typeof quality !== 'number') {
      return NextResponse.json(
        { error: 'quality is required (0, 1, 3, or 4)' },
        { status: 400 }
      );
    }

    // Validate quality value
    const validQualities: ReviewQuality[] = [0, 1, 3, 4];
    if (!validQualities.includes(quality as ReviewQuality)) {
      return NextResponse.json(
        { error: 'quality must be 0, 1, 3, or 4' },
        { status: 400 }
      );
    }

    const review = await recordReview(vocabularyId, quality as ReviewQuality);

    if (!review) {
      return NextResponse.json(
        { error: 'Failed to record review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error recording review:', error);
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vocabulary/reviews?vocabularyId=xxx
 * Get review entry for a vocabulary word
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vocabularyId = searchParams.get('vocabularyId');

    if (!vocabularyId) {
      return NextResponse.json(
        { error: 'vocabularyId query parameter is required' },
        { status: 400 }
      );
    }

    const review = await getReviewByVocabularyId(vocabularyId);

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}
