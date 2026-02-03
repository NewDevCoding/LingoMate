# Flashcard SRS (Spaced Repetition System) Review System - Implementation Plan

## Overview
This document outlines the design and implementation plan for a flashcard-based Spaced Repetition System (SRS) that allows users to review their saved vocabulary words efficiently.

---

## Current System Analysis

### Existing Vocabulary System
- **Storage**: Supabase `vocabulary` table
- **Fields**: `id`, `user_id`, `word`, `translation`, `language`, `comprehension` (1-5), `created_at`, `updated_at`
- **Current State**: Words are saved with comprehension levels, but no review scheduling exists
- **UI**: Vocabulary page has a "Review" button and "Due for review" tab (not yet implemented)

### What's Missing
- Review scheduling algorithm
- Next review date tracking
- Review history/statistics
- Flashcard review interface
- Difficulty/ease factor tracking

---

## SRS Algorithm Options

### Option 1: SM-2 Algorithm (Anki-style)
**Pros:**
- Proven, widely-used algorithm
- Simple to implement
- Good balance of review frequency
- Uses ease factor to adjust intervals

**How it works:**
- Each card has: `interval`, `ease_factor`, `repetitions`, `next_review_date`
- Quality of recall (0-5) determines next interval
- Successful reviews increase interval exponentially
- Failed reviews reset interval and decrease ease factor

**Interval Calculation:**
```
If quality >= 3 (pass):
  if repetitions == 0: interval = 1 day
  else if repetitions == 1: interval = 6 days
  else: interval = previous_interval * ease_factor
  
  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  repetitions = repetitions + 1

If quality < 3 (fail):
  repetitions = 0
  interval = 1 day
  ease_factor = max(1.3, ease_factor - 0.2)
```

### Option 2: Simplified SRS (LingQ-style)
**Pros:**
- Simpler implementation
- Less data to track
- Good for vocabulary-focused learning

**How it works:**
- Fixed interval multipliers based on comprehension level
- No ease factor tracking
- Simpler scheduling logic

**Interval Calculation:**
```
Comprehension 1: Review in 1 day
Comprehension 2: Review in 3 days
Comprehension 3: Review in 7 days
Comprehension 4: Review in 14 days
Comprehension 5: Review in 30 days (or mark as mastered, no more reviews)
```

### Option 3: FSRS (Free Spaced Repetition Scheduler)
**Pros:**
- Modern, optimized algorithm
- Better than SM-2 for long-term retention
- More sophisticated

**Cons:**
- More complex to implement
- Requires more parameters

**Recommendation: Start with Option 1 (SM-2) or Option 2 (Simplified)**

---

## Database Schema Design

### Option A: Extend Existing Vocabulary Table
Add SRS fields directly to `vocabulary` table:

```sql
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS:
  -- SRS tracking fields
  interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  consecutive_incorrect INTEGER DEFAULT 0;
```

**Pros:**
- Simple, all data in one place
- Easy queries for "due for review"
- No joins needed

**Cons:**
- Mixes vocabulary data with review data
- Harder to track review history

### Option B: Separate Review Table
Create `vocabulary_reviews` table:

```sql
CREATE TABLE vocabulary_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- SRS state
  interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  
  -- Statistics
  review_count INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  consecutive_incorrect INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(vocabulary_id, user_id)
);

CREATE INDEX idx_vocabulary_reviews_user_id ON vocabulary_reviews(user_id);
CREATE INDEX idx_vocabulary_reviews_next_review ON vocabulary_reviews(user_id, next_review_date);
CREATE INDEX idx_vocabulary_reviews_vocab_id ON vocabulary_reviews(vocabulary_id);
```

**Pros:**
- Clean separation of concerns
- Can track full review history (if we add a history table later)
- Easier to query "due for review"
- Can have multiple review schedules per word (if needed)

**Cons:**
- Requires joins for common queries
- More complex queries

**Recommendation: Option B (Separate table) for better architecture**

---

## Data Model Design

### TypeScript Interfaces

```typescript
// types/word.ts additions
export interface VocabularyReview {
  id: string;
  vocabularyId: string;
  userId: string;
  
  // SRS state
  intervalDays: number;
  easeFactor: number; // typically 1.3 - 2.5
  repetitions: number;
  nextReviewDate: string | null;
  lastReviewedAt: string | null;
  
  // Statistics
  reviewCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyWithReview extends Vocabulary {
  review?: VocabularyReview;
  isDueForReview: boolean;
  daysUntilReview?: number;
}

export interface ReviewSession {
  id: string;
  userId: string;
  startedAt: string;
  completedAt: string | null;
  totalCards: number;
  reviewedCards: number;
  correctCount: number;
  incorrectCount: number;
}

export interface ReviewResult {
  vocabularyId: string;
  quality: number; // 0-5 (0=forgot, 1=hard, 2=difficult, 3=good, 4=easy, 5=very easy)
  responseTime?: number; // milliseconds
  reviewedAt: string;
}
```

---

## Core Features

### 1. Review Scheduling Engine
**Location**: `lib/learning/srs.engine.ts`

**Functions:**
- `calculateNextReview(quality: number, currentState: VocabularyReview): VocabularyReview`
- `getDueWords(userId: string, limit?: number): Promise<VocabularyWithReview[]>`
- `initializeReview(vocabularyId: string): Promise<VocabularyReview>`
- `recordReview(vocabularyId: string, quality: number): Promise<VocabularyReview>`

### 2. Review Session Management
**Location**: `features/vocabulary/review/`

**Components:**
- `ReviewSession.tsx` - Main review interface
- `Flashcard.tsx` - Individual flashcard component
- `ReviewStats.tsx` - Session statistics
- `ReviewComplete.tsx` - Completion screen

**Services:**
- `review.service.ts` - API calls for reviews

### 3. Review Interface Design

#### Flashcard UI
- **Front**: Show word (target language)
- **Back**: Show translation, example sentence (if available)
- **Actions**: Quality buttons (0-5) or simplified (Again, Hard, Good, Easy)
- **Progress**: Show "X of Y" cards reviewed
- **Timer**: Optional response time tracking

#### Review Flow
1. User clicks "Review" button
2. Load due words (or all words if none due)
3. Show first flashcard (front side)
4. User clicks to flip or presses spacebar
5. User rates their recall (quality 0-5)
6. Show next card
7. Repeat until all cards reviewed
8. Show completion screen with stats

### 4. Integration Points

#### Vocabulary Page
- "Review" button should:
  - Check for due words
  - Show count: "Review (12 due)"
  - Navigate to review session
  - If no words due, offer to review all or random selection

#### "Due for review" Tab
- Filter vocabulary list to show only due words
- Show days until review or "Due now"
- Allow starting review from this tab

---

## Implementation Phases

### Phase 1: Database & Core Engine
**Goal**: Set up database schema and SRS calculation engine

**Tasks:**
1. Create `vocabulary_reviews` table migration
2. Add TypeScript interfaces
3. Implement SRS algorithm in `srs.engine.ts`
4. Create review service functions
5. Add API routes for review operations

**Files to Create:**
- `lib/learning/srs.engine.ts`
- `features/vocabulary/review/review.service.ts`
- `app/api/vocabulary/reviews/route.ts`
- `app/api/vocabulary/reviews/[id]/route.ts`

**Files to Modify:**
- `lib/db/schema.ts` (add review table)
- `types/word.ts` (add review interfaces)

### Phase 2: Review Session UI
**Goal**: Build flashcard review interface

**Tasks:**
1. Create `ReviewSession` component
2. Create `Flashcard` component with flip animation
3. Implement quality rating buttons
4. Add progress tracking
5. Create completion screen

**Files to Create:**
- `features/vocabulary/review/ReviewSession.tsx`
- `features/vocabulary/review/Flashcard.tsx`
- `features/vocabulary/review/ReviewStats.tsx`
- `features/vocabulary/review/ReviewComplete.tsx`
- `app/review/page.tsx` (review session page)

### Phase 3: Integration & Polish
**Goal**: Connect review system to vocabulary page and add features

**Tasks:**
1. Update "Review" button to show due count
2. Implement "Due for review" tab filter
3. Add review statistics to vocabulary cards
4. Add keyboard shortcuts (spacebar to flip, 1-5 for quality)
5. Add review history tracking (optional)

**Files to Modify:**
- `app/vocabulary/page.tsx`
- `features/vocabulary/vocabulary.service.ts`
- `features/vocabulary/review/ReviewSession.tsx`

### Phase 4: Advanced Features (Future)
**Goal**: Enhance review experience

**Tasks:**
1. Add audio pronunciation to flashcards
2. Add example sentences from articles
3. Add review streaks and achievements
4. Add review analytics/charts
5. Add custom review decks/filters
6. Add mobile-optimized swipe gestures

---

## API Endpoints

### Review Management
```
GET    /api/vocabulary/reviews/due          - Get words due for review
POST   /api/vocabulary/reviews              - Initialize review for a word
PUT    /api/vocabulary/reviews/[id]         - Record a review result
GET    /api/vocabulary/reviews/stats        - Get review statistics
```

### Review Session
```
POST   /api/vocabulary/reviews/session      - Start a review session
PUT    /api/vocabulary/reviews/session/[id] - Update session progress
POST   /api/vocabulary/reviews/session/[id]/complete - Complete session
```

---

## User Experience Flow

### Starting a Review Session
1. User navigates to Vocabulary page
2. Sees "Review (12 due)" button
3. Clicks button → navigates to `/review`
4. Review session loads with due words
5. First flashcard appears

### During Review
1. Flashcard shows word (front)
2. User thinks/recalls translation
3. User clicks card or presses spacebar → flips to show translation
4. User rates their recall:
   - **Again (0)**: Didn't remember
   - **Hard (1)**: Remembered with difficulty
   - **Good (3)**: Remembered correctly
   - **Easy (4)**: Very easy to remember
5. Card flips to next card
6. Progress bar updates
7. Repeat until all cards reviewed

### After Review
1. Completion screen shows:
   - Total cards reviewed
   - Correct/incorrect count
   - Time taken
   - Next review date for reviewed words
2. Option to review more or return to vocabulary page

---

## Algorithm Implementation Details

### SM-2 Algorithm (Recommended)

```typescript
interface SRSState {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

function calculateNextReview(quality: number, state: SRSState): SRSState {
  // Quality: 0=forgot, 1=hard, 2=difficult, 3=good, 4=easy, 5=very easy
  
  if (quality < 3) {
    // Failed - reset
    return {
      intervalDays: 1,
      easeFactor: Math.max(1.3, state.easeFactor - 0.2),
      repetitions: 0,
    };
  }
  
  // Passed - calculate new interval
  let newInterval: number;
  if (state.repetitions === 0) {
    newInterval = 1;
  } else if (state.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(state.intervalDays * state.easeFactor);
  }
  
  // Update ease factor
  const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEaseFactor = Math.max(1.3, state.easeFactor + easeChange);
  
  return {
    intervalDays: newInterval,
    easeFactor: newEaseFactor,
    repetitions: state.repetitions + 1,
  };
}
```

### Simplified Algorithm (Alternative)

```typescript
function calculateNextReviewSimple(comprehension: number): number {
  // Returns days until next review
  const intervals = {
    1: 1,   // Review tomorrow
    2: 3,   // Review in 3 days
    3: 7,   // Review in 1 week
    4: 14,  // Review in 2 weeks
    5: 30,  // Review in 1 month (or mark mastered)
  };
  
  return intervals[comprehension] || 1;
}
```

---

## UI/UX Considerations

### Flashcard Design
- **Minimalist**: Focus on word and translation
- **Large text**: Easy to read
- **Smooth animations**: Card flip, fade transitions
- **Dark theme**: Match existing app design
- **Responsive**: Works on mobile and desktop

### Quality Rating Buttons
**Option 1: Full SM-2 (0-5)**
- Again (0), Hard (1), Difficult (2), Good (3), Easy (4), Very Easy (5)
- More granular control

**Option 2: Simplified (4 buttons)**
- Again, Hard, Good, Easy
- Simpler, faster decisions
- Map to SM-2: Again=0, Hard=1, Good=3, Easy=4

**Recommendation: Start with Option 2, allow switching to Option 1 in settings**

### Keyboard Shortcuts
- `Spacebar`: Flip card
- `1-4`: Rate quality (Again, Hard, Good, Easy)
- `Enter`: Next card (after rating)
- `Esc`: Exit review session

---

## Statistics & Analytics

### Per-Word Statistics
- Total reviews
- Success rate (%)
- Average response time
- Last reviewed date
- Next review date
- Streak (consecutive correct)

### Overall Statistics
- Total words in review system
- Words due for review
- Words mastered (comprehension 5, no more reviews)
- Daily review goal progress
- Review streak (days with reviews)

---

## Technical Considerations

### Performance
- **Batch loading**: Load all due words at once
- **Optimistic updates**: Update UI immediately, sync in background
- **Caching**: Cache review state to avoid repeated queries
- **Indexing**: Ensure proper database indexes for due date queries

### Data Consistency
- **Initialization**: Auto-create review entry when word is added to vocabulary
- **Cleanup**: Handle deleted vocabulary words (cascade delete reviews)
- **Migration**: Create review entries for existing vocabulary

### Error Handling
- Handle network failures gracefully
- Retry failed review submissions
- Show clear error messages
- Preserve review progress locally if possible

---

## Testing Strategy

### Unit Tests
- SRS algorithm calculations
- Review state transitions
- Date calculations

### Integration Tests
- Review session flow
- API endpoints
- Database operations

### Manual Testing
- Review session with various word counts
- Quality rating variations
- Edge cases (no words due, all words due, etc.)
- Keyboard shortcuts
- Mobile responsiveness

---

## Migration Strategy

### Step 1: Database Setup
1. Create `vocabulary_reviews` table
2. Add indexes
3. Set up RLS policies

### Step 2: Backend Implementation
1. Implement SRS engine
2. Create review service
3. Add API routes
4. Test with sample data

### Step 3: Frontend Implementation
1. Create review components
2. Build review session page
3. Integrate with vocabulary page
4. Add keyboard shortcuts

### Step 4: Data Migration
1. Create review entries for existing vocabulary
2. Initialize with default SRS state
3. Set next review date based on comprehension level

### Step 5: Polish & Launch
1. Add animations
2. Improve error handling
3. Add statistics
4. User testing

---

## Future Enhancements

1. **Adaptive Difficulty**: Adjust based on user performance
2. **Review Reminders**: Notifications for due reviews
3. **Custom Intervals**: User-configurable review schedules
4. **Review Modes**: 
   - Word → Translation
   - Translation → Word
   - Audio → Word
   - Sentence completion
5. **Spaced Repetition Variants**: FSRS, SuperMemo 17, etc.
6. **Review Analytics Dashboard**: Charts, trends, insights
7. **Export/Import**: Backup review data
8. **Multi-language Support**: Review words from different languages separately

---

## Files Summary

### Files to Create
1. `lib/learning/srs.engine.ts` - SRS algorithm
2. `features/vocabulary/review/review.service.ts` - Review API service
3. `features/vocabulary/review/ReviewSession.tsx` - Main review component
4. `features/vocabulary/review/Flashcard.tsx` - Flashcard component
5. `features/vocabulary/review/ReviewStats.tsx` - Statistics component
6. `features/vocabulary/review/ReviewComplete.tsx` - Completion screen
7. `app/review/page.tsx` - Review session page
8. `app/api/vocabulary/reviews/route.ts` - Review API
9. `app/api/vocabulary/reviews/[id]/route.ts` - Individual review API
10. `app/api/vocabulary/reviews/due/route.ts` - Due words API

### Files to Modify
1. `lib/db/schema.ts` - Add review table schema
2. `types/word.ts` - Add review interfaces
3. `app/vocabulary/page.tsx` - Integrate review button
4. `features/vocabulary/vocabulary.service.ts` - Add review-related functions

### Estimated Complexity
- **Phase 1**: Medium (database + algorithm)
- **Phase 2**: Medium-High (UI components)
- **Phase 3**: Low-Medium (integration)
- **Phase 4**: Low (polish)

**Total Estimated Time**: 8-12 hours of development

---

*Last Updated: Initial SRS system design and planning*
