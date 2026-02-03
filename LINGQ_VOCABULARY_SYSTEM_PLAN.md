# LingQ-Style Vocabulary System Implementation Plan

## Overview
This document outlines the plan to implement a LingQ-style vocabulary system where words are automatically added to vocabulary through visual status indicators and seamless interactions, rather than requiring explicit button clicks.

---

## Current System Analysis

### Current Implementation
- **Location**: `features/reader/WordDefinitionPanel.tsx`
- **Current Flow**:
  1. User clicks a word in the text
  2. Word definition panel opens on the right
  3. User must click one of 5 comprehension level buttons (1-4 or checkmark) to add word to vocabulary
  4. Translation is auto-fetched but word is not saved until button click

### Current Data Model
- **Comprehension Levels**: 1-5 (where 5 = "known")
- **Storage**: Supabase `vocabulary` table
- **Fields**: `word`, `translation`, `language`, `comprehension`, `created_at`, `updated_at`

---

## LingQ System Analysis

### Key Features of LingQ's Vocabulary System

#### 1. **Visual Word Status Indicators (Color Coding)**
Words in the text are color-coded based on their vocabulary status:
- **Blue/Uncolored (Default)**: Unknown/New words (not in vocabulary)
- **Yellow**: Learning words (in vocabulary, actively studying - comprehension 1-3)
- **Green**: Known words (mastered - comprehension 4-5 or "known" status)
- **Gray/Underlined**: Words being hovered or selected

#### 2. **Automatic Vocabulary Addition**
- **First Click = Auto-Add**: When a user clicks an unknown word, it's automatically added to vocabulary with status "Learning" (comprehension level 1)
- **No Explicit Save Button**: The act of clicking a word IS the act of adding it
- **Immediate Visual Feedback**: Word color changes immediately upon click

#### 3. **Progressive Status System**
- **Unknown → Learning → Known**: Words progress through states
- **Status Persistence**: Word status is remembered across all articles
- **Context-Aware**: Same word in different contexts maintains its status

#### 4. **Definition Panel Behavior**
- **Opens on Click**: Clicking any word opens definition panel
- **Shows Current Status**: Panel displays word's current comprehension level
- **Quick Status Change**: User can change status directly from panel
- **Translation Display**: Shows translation and allows editing

#### 5. **Smart Word Recognition**
- **Case-Insensitive**: "Hello" and "hello" are treated as same word
- **Inflection Handling**: Basic handling of word variations (future enhancement)
- **Context Preservation**: Word status tied to base word form

---

## Implementation Plan

### Phase 1: Visual Status System (Word Color Coding)

#### 1.1 Update `InteractiveText.tsx`
**Goal**: Add color coding to words based on vocabulary status

**Changes Needed**:
- Load vocabulary status for all words in the current page
- Map word status to color:
  - Unknown (not in vocab): Default text color or light blue underline
  - Learning (comprehension 1-3): Yellow background (#FFD700 or #FFA500)
  - Known (comprehension 4-5): Green background (#26c541 - matches current accent)
- Apply colors to word spans dynamically

**Implementation Steps**:
1. Add `vocabularyStatus` prop to `InteractiveText` component
2. Create function to get word status from vocabulary map
3. Update word span styling to include status-based colors
4. Add hover states that don't override status colors

**Files to Modify**:
- `features/reader/InteractiveText.tsx`

---

### Phase 2: Automatic Vocabulary Addition

#### 2.1 Update Word Click Handler
**Goal**: Automatically add word to vocabulary on first click

**Changes Needed**:
- Modify `handleWordClick` in `InteractiveText.tsx` to:
  - Check if word exists in vocabulary
  - If not, automatically create vocabulary entry with comprehension = 1
  - Update word color immediately (optimistic update)
- Remove requirement for explicit button click to save

**Implementation Steps**:
1. Update `InteractiveReader.tsx` to handle auto-add logic
2. Create `addWordToVocabulary` function that:
   - Checks if word exists
   - If new, creates entry with comprehension = 1
   - Returns updated vocabulary status
3. Update word status map after auto-add
4. Trigger re-render of `InteractiveText` with new status

**Files to Modify**:
- `features/reader/InteractiveReader.tsx`
- `features/reader/InteractiveText.tsx`

---

### Phase 3: Vocabulary Status Loading

#### 3.1 Batch Vocabulary Loading
**Goal**: Load vocabulary status for all words in article efficiently

**Changes Needed**:
- Create function to fetch vocabulary for all words in current page
- Build a vocabulary status map: `Map<word, Vocabulary>`
- Pass this map to `InteractiveText` component
- Cache vocabulary status to avoid repeated API calls

**Implementation Steps**:
1. Create `getVocabularyForWords(words: string[])` in vocabulary service
2. Load vocabulary when article loads or page changes
3. Store vocabulary map in `InteractiveReader` state
4. Pass map to `InteractiveText` as prop

**Files to Modify**:
- `features/vocabulary/vocabulary.service.ts` (add batch fetch function)
- `features/reader/InteractiveReader.tsx` (load and manage vocabulary map)

---

### Phase 4: Definition Panel Updates

#### 4.1 Update Panel to Reflect Auto-Add
**Goal**: Panel should show word is already added and allow status changes

**Changes Needed**:
- Panel opens with word already in vocabulary (if auto-added)
- Show current comprehension level
- Allow quick status changes
- Remove "add to vocabulary" step (it's automatic)

**Implementation Steps**:
1. Update `WordDefinitionPanel` to handle auto-added words
2. Show current status immediately (not defaulting to level 1)
3. Update status change buttons to work with existing vocabulary
4. Add visual indicator that word is "Learning" or "Known"

**Files to Modify**:
- `features/reader/WordDefinitionPanel.tsx`

---

### Phase 5: Status Progression System

#### 5.1 Implement Status Progression Logic
**Goal**: Allow users to easily progress words through statuses

**Changes Needed**:
- Quick status change buttons in definition panel
- Keyboard shortcuts for status changes (optional)
- Visual feedback when status changes
- Update word color in text immediately

**Status Levels**:
- **Level 1**: Newly added, just learning (Yellow)
- **Level 2**: Getting familiar (Yellow)
- **Level 3**: Mostly understood (Yellow)
- **Level 4**: Well known (Green)
- **Level 5/Check**: Mastered/Known (Green)

**Implementation Steps**:
1. Update status change handler to update vocabulary map
2. Trigger re-render of word in text with new color
3. Add smooth transitions for color changes
4. Persist changes to database

**Files to Modify**:
- `features/reader/WordDefinitionPanel.tsx`
- `features/reader/InteractiveReader.tsx`

---

## Technical Implementation Details

### Data Flow

```
User clicks word
    ↓
Check vocabulary status map
    ↓
If not in map:
    - Auto-add to vocabulary (comprehension = 1)
    - Update vocabulary map
    - Change word color to yellow
    ↓
Open definition panel
    ↓
Show current status
    ↓
User can change status
    ↓
Update vocabulary map + database
    ↓
Update word color in text
```

### Vocabulary Status Map Structure

```typescript
// In InteractiveReader state
const [vocabularyMap, setVocabularyMap] = useState<Map<string, Vocabulary>>(new Map());

// Usage in InteractiveText
const wordStatus = vocabularyMap.get(cleanWord);
const wordColor = getWordColor(wordStatus);
```

### Color Scheme

```typescript
const WORD_COLORS = {
  unknown: '#ffffff',      // Default text color
  learning: '#FFD700',     // Yellow for learning (comprehension 1-3)
  known: '#26c541',        // Green for known (comprehension 4-5)
  selected: '#ffff00',     // Yellow highlight when selected
  hover: 'rgba(255, 255, 255, 0.1)', // Subtle hover
};
```

### API Changes Needed

**New Function in `vocabulary.service.ts`**:
```typescript
/**
 * Batch fetch vocabulary for multiple words
 * Returns a Map<word, Vocabulary> for efficient lookup
 */
export async function getVocabularyForWords(
  words: string[]
): Promise<Map<string, Vocabulary>> {
  // Implementation: fetch all words in one query
  // Return as Map for O(1) lookup
}
```

---

## User Experience Flow

### Scenario 1: New Word (First Encounter)
1. User sees word in text (default color)
2. User clicks word
3. **Word automatically added to vocabulary** (comprehension = 1)
4. Word color changes to yellow immediately
5. Definition panel opens showing word is "Learning"
6. User can see translation and change status if needed

### Scenario 2: Learning Word (Already in Vocabulary)
1. User sees word in text (yellow color - already learning)
2. User clicks word
3. Definition panel opens showing current status
4. User can change status or just read definition
5. If status changes, word color updates immediately

### Scenario 3: Known Word
1. User sees word in text (green color - known)
2. User clicks word
3. Definition panel opens showing word is "Known"
4. User can review or change status if needed

---

## Benefits of This System

1. **Reduced Friction**: No need to click buttons to add words
2. **Visual Feedback**: Immediate color coding shows learning progress
3. **Contextual Learning**: Words are added in context of reading
4. **Progress Tracking**: Visual representation of vocabulary growth
5. **Intuitive UX**: Matches industry-standard language learning app patterns

---

## Migration Strategy

### Step 1: Add Vocabulary Status Loading
- Implement batch vocabulary fetching
- Add vocabulary map to InteractiveReader
- No UI changes yet

### Step 2: Add Color Coding
- Update InteractiveText to show word colors
- Test with existing vocabulary

### Step 3: Implement Auto-Add
- Modify click handler to auto-add words
- Update definition panel to reflect auto-add

### Step 4: Polish & Optimize
- Add transitions
- Optimize performance
- Add loading states

---

## Testing Checklist

- [ ] Unknown words show default color
- [ ] Clicking unknown word auto-adds to vocabulary
- [ ] Word color changes to yellow after auto-add
- [ ] Learning words (1-3) show yellow
- [ ] Known words (4-5) show green
- [ ] Status changes update word color immediately
- [ ] Vocabulary persists across page navigation
- [ ] Batch vocabulary loading works efficiently
- [ ] Definition panel shows correct status
- [ ] Status changes persist to database

---

## Future Enhancements

1. **Word Inflection Handling**: Recognize "run", "runs", "running" as same word
2. **Keyboard Shortcuts**: Quick status changes with number keys
3. **Statistics**: Show vocabulary growth per article
4. **Spaced Repetition**: Integrate with review system
5. **Word Frequency**: Highlight common words differently
6. **Custom Colors**: Allow users to customize status colors

---

## Files Summary

### Files to Create
- None (using existing structure)

### Files to Modify
1. `features/reader/InteractiveText.tsx` - Add color coding
2. `features/reader/InteractiveReader.tsx` - Add vocabulary map and auto-add logic
3. `features/reader/WordDefinitionPanel.tsx` - Update to reflect auto-add
4. `features/vocabulary/vocabulary.service.ts` - Add batch fetch function

### Estimated Complexity
- **Phase 1**: Medium (color coding logic)
- **Phase 2**: Medium (auto-add logic)
- **Phase 3**: Low (batch loading)
- **Phase 4**: Low (panel updates)
- **Phase 5**: Low (status progression)

**Total Estimated Time**: 4-6 hours of development

---

*Last Updated: Based on LingQ vocabulary system analysis and current codebase structure*
