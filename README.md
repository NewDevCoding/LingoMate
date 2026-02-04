# LingoMate Features Documentation

This document provides detailed information about each main feature in LingoMate, including which files contribute to each feature, what technologies are used, and how functionality is implemented.

## Table of Contents

1. [Reader Feature](#reader-feature)
2. [Vocabulary Management Feature](#vocabulary-management-feature)
3. [Spaced Repetition Review Feature](#spaced-repetition-review-feature)
4. [Roleplay/Speaking Practice Feature](#roleplayspeaking-practice-feature)
5. [Speech Processing Features](#speech-processing-features)
6. [AI/LLM Integration](#aillm-integration)
7. [Translation Services](#translation-services)
8. [Authentication & User Management](#authentication--user-management)

---

## Reader Feature

### Overview
The Reader feature allows users to read articles in their target language with interactive word lookup, translation, and vocabulary building capabilities.

### Route
- **Page Route**: `/reader` (library view) and `/reader/[id]` (interactive reader)
- **Page Files**: 
  - `app/reader/page.tsx` - Article library page
  - `app/reader/[id]/page.tsx` - Individual article reader page

### Core Components

#### Library View (`app/reader/page.tsx`)
- **Purpose**: Displays a searchable library of articles
- **Technologies**: 
  - React 19 with client-side state (`useState`, `useEffect`)
  - Next.js App Router for navigation
  - Inline CSS styles (dark theme)
- **Key Functionality**:
  - Article search via `searchArticles()` service
  - Article filtering and categorization
  - Navigation to interactive reader on article click
- **Dependencies**: 
  - `features/reader/article.service.ts` for data fetching
  - `features/reader/ArticleRow.tsx` and `ArticleCard.tsx` for UI

#### Interactive Reader (`app/reader/[id]/page.tsx` + `features/reader/InteractiveReader.tsx`)
- **Purpose**: Provides interactive reading experience with word selection, definitions, and vocabulary integration
- **Technologies**:
  - React hooks for state management (`useState`, `useEffect`, `useMemo`)
  - Real-time vocabulary lookup and updates
  - Optimistic UI updates for instant feedback
- **Key Functionality**:
  - Word click detection and highlighting
  - Automatic vocabulary addition on word click
  - Word definition panel with translation
  - Sentence context display
  - Vocabulary status tracking (comprehension levels 0-5)

### Supporting Files

#### `features/reader/article.service.ts`
- **Purpose**: Article data management and fetching
- **Technologies**:
  - Supabase client (`@supabase/supabase-js`) for database queries
  - PostgreSQL database via Supabase
- **Key Functions**:
  - `getArticles()` - Fetch all articles from database
  - `getArticleById(id)` - Fetch single article
  - `searchArticles(query)` - Full-text search across title, description, content
- **Database Schema**: Uses `articles` table (id, title, url, content, description, image, inserted_at)

#### `features/reader/ArticleCard.tsx`
- **Purpose**: Individual article card component for library display
- **Technologies**: React component with inline styles
- **Displays**: Article title, progress indicator, category, thumbnail

#### `features/reader/ArticleRow.tsx`
- **Purpose**: Horizontal scrollable row container for article cards
- **Technologies**: React component with CSS flexbox
- **Features**: Horizontal scrolling, category title

#### `features/reader/InteractiveText.tsx`
- **Purpose**: Renders article text with clickable words
- **Technologies**: 
  - Text parsing and word boundary detection
  - Click event handling for word selection
- **Features**: 
  - Word highlighting based on vocabulary comprehension level
  - Color coding: unknown (no underline), level 1-4 (blue/yellow/orange), mastered (green)

#### `features/reader/WordDefinitionPanel.tsx`
- **Purpose**: Sidebar panel showing word definitions and vocabulary controls
- **Technologies**: 
  - Translation API integration
  - Vocabulary service integration
- **Features**:
  - Word translation display
  - Comprehension level selector (1-5)
  - Example sentences from article context
  - Add/update vocabulary functionality

#### `features/reader/SentenceView.tsx`
- **Purpose**: Displays sentence context for selected words
- **Technologies**: React component with text parsing

#### `features/reader/TranslationView.tsx`
- **Purpose**: Shows translation of selected text segments
- **Technologies**: Translation service integration

#### `features/reader/ReaderContent.tsx`
- **Purpose**: Main content area wrapper for article display
- **Technologies**: Layout component with navigation

#### `features/reader/ReaderNavigation.tsx`
- **Purpose**: Navigation controls for article reading
- **Technologies**: React component

### Data Flow

1. **Article Loading**: 
   - User navigates to `/reader/[id]`
   - `InteractiveReader` calls `getArticleById()` from `article.service.ts`
   - Service queries Supabase `articles` table
   - Article content is parsed and displayed

2. **Word Selection**:
   - User clicks a word in `InteractiveText`
   - Word is normalized (lowercase, trimmed)
   - `InteractiveReader` checks `vocabularyMap` for existing vocabulary
   - If not found, word is auto-added to vocabulary with level 1
   - Translation is fetched via `getTranslation()` service
   - Optimistic UI update shows word as "known" immediately

3. **Vocabulary Integration**:
   - On article load, all unique words are extracted
   - `getVocabularyForWords()` batch-fetches vocabulary status
   - Words are highlighted based on comprehension level
   - Vocabulary updates are saved to database via `upsertVocabulary()`

### Technologies Used

- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks (local component state)
- **Styling**: Inline CSS styles (dark theme: `#161616` background)
- **API**: Supabase REST API via JavaScript client

---

## Vocabulary Management Feature

### Overview
The Vocabulary feature allows users to manage their word collection, track comprehension levels, and organize vocabulary for review.

### Route
- **Page Route**: `/vocabulary`
- **Page File**: `app/vocabulary/page.tsx`

### Core Components

#### Vocabulary Page (`app/vocabulary/page.tsx`)
- **Purpose**: Main vocabulary management interface
- **Technologies**:
  - React 19 with client-side state
  - Real-time vocabulary updates
  - Optimistic UI updates
- **Key Functionality**:
  - Display vocabulary list with search
  - Tab filtering (All, Phrases, Due for Review)
  - Comprehension level management (1-5)
  - Vocabulary deletion
  - Text-to-speech playback for words
  - Navigation to review session

### Supporting Files

#### `features/vocabulary/vocabulary.service.ts`
- **Purpose**: Vocabulary CRUD operations
- **Technologies**:
  - Supabase client for database operations
  - User ID resolution (authenticated or temporary)
- **Key Functions**:
  - `getVocabulary()` - Fetch all user vocabulary
  - `getVocabularyByWord(word)` - Find vocabulary by word
  - `upsertVocabulary(word, comprehension, translation)` - Create or update entry
  - `updateVocabularyComprehension(id, level)` - Update comprehension status
  - `deleteVocabulary(id)` - Remove vocabulary entry
  - `getVocabularyForWords(words[])` - Batch fetch for multiple words (returns Map)
- **Database Schema**: Uses `vocabulary` table (id, user_id, word, translation, language, comprehension, created_at, updated_at, gender, notes, ex_sentences, ex_translations, ex_positive)

#### `features/vocabulary/WordList.tsx`
- **Purpose**: Displays vocabulary list with filtering
- **Technologies**: React component

#### `features/vocabulary/WordDetail.tsx`
- **Purpose**: Detailed view of individual vocabulary word
- **Technologies**: React component

#### `features/vocabulary/vocabulary.store.ts`
- **Purpose**: Client-side state management for vocabulary (if needed)
- **Technologies**: Zustand-like pattern (implementation may vary)

### Text-to-Speech Integration

- **API Endpoint**: `/api/speech/tts`
- **Implementation**: 
  - Uses `AudioManager` and `BrowserTTSManager` from `lib/speech/audio.manager.ts`
  - Primary: Google Cloud TTS API (server-side)
  - Fallback: Browser Web Speech API (client-side)
- **Usage**: Click speaker icon next to word to hear pronunciation

### Data Flow

1. **Vocabulary Loading**:
   - Page loads and calls `getVocabulary()` from service
   - Service queries Supabase `vocabulary` table filtered by `user_id`
   - Results are displayed in table format

2. **Comprehension Updates**:
   - User clicks comprehension level button (1-4) or mastery checkmark (5)
   - Optimistic UI update changes button appearance immediately
   - `updateVocabularyComprehension()` is called
   - Database is updated via Supabase
   - On error, UI reverts to previous state

3. **Due Words Count**:
   - Page periodically calls `getDueWordsCount()` from review service
   - Count is displayed in "Review" button
   - Updates every 30 seconds

### Technologies Used

- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks with optimistic updates
- **Audio**: Google Cloud TTS API + Browser Web Speech API fallback
- **Styling**: Inline CSS styles

---

## Spaced Repetition Review Feature

### Overview
The Review feature implements a spaced repetition system (SRS) for vocabulary review using the SM-2 algorithm (similar to Anki).

### Route
- **Page Route**: `/review`
- **Page File**: `app/review/page.tsx`

### Core Components

#### Review Page (`app/review/page.tsx`)
- **Purpose**: Entry point for review sessions
- **Technologies**: React with loading states and error handling
- **Key Functionality**:
  - Loads due words from database
  - Handles empty state (no words due)
  - Passes words to `ReviewSession` component

#### Review Session (`features/vocabulary/review/ReviewSession.tsx`)
- **Purpose**: Main flashcard review interface
- **Technologies**:
  - React state management
  - Keyboard shortcuts (Space to flip, 1-4 for quality)
  - Progress tracking
- **Key Functionality**:
  - Flashcard display (front/back)
  - Quality rating buttons (Again, Hard, Good, Easy)
  - Progress statistics
  - Session completion screen

### Supporting Files

#### `features/vocabulary/review/review.service.ts`
- **Purpose**: SRS algorithm implementation and review data management
- **Technologies**:
  - Supabase for database operations
  - SRS engine integration (`lib/learning/srs.engine.ts`)
- **Key Functions**:
  - `getReviewByVocabularyId(vocabId)` - Get review entry for word
  - `initializeReview(vocabId)` - Create new review entry
  - `recordReview(vocabId, quality)` - Record review result and update SRS state
  - `getDueWords(limit?)` - Get all words due for review
  - `getDueWordsCount()` - Get count of due words
  - `initializeAllReviews()` - Batch initialize reviews for migration
- **Database Schema**: Uses `vocabulary_reviews` table (id, vocabulary_id, user_id, interval_days, ease_factor, repetitions, next_review_date, last_reviewed_at, review_count, consecutive_correct, consecutive_incorrect)

#### `lib/learning/srs.engine.ts`
- **Purpose**: SM-2 spaced repetition algorithm implementation
- **Technologies**: Pure TypeScript algorithm (no external dependencies)
- **Key Functions**:
  - `calculateNextReview(quality, currentState)` - Calculate new SRS state
  - `calculateNextReviewDate(intervalDays)` - Calculate next review date
  - `isDueForReview(review)` - Check if word is due
  - `daysUntilReview(review)` - Calculate days until next review
  - `updateReviewStats(review, quality, newState)` - Update review statistics
  - `initializeReview(vocabId, userId)` - Create initial review state
- **Algorithm Details**:
  - **Quality Mapping**: 0=Again, 1=Hard, 3=Good, 4=Easy
  - **Interval Calculation**: 
    - First review: 1 day
    - Second review: 6 days
    - Subsequent: previous interval × ease factor
  - **Ease Factor**: Starts at 2.5, adjusts based on performance
  - **Failure Handling**: Resets interval to 1 day, decreases ease factor

#### `features/vocabulary/review/Flashcard.tsx`
- **Purpose**: Individual flashcard component
- **Technologies**: React component with flip animation
- **Features**: Front shows word, back shows translation and details

#### `features/vocabulary/review/ReviewStats.tsx`
- **Purpose**: Progress statistics display
- **Technologies**: React component
- **Displays**: Current card number, total cards, correct/incorrect counts

#### `features/vocabulary/review/ReviewComplete.tsx`
- **Purpose**: Session completion screen
- **Technologies**: React component
- **Displays**: Final statistics, time spent, completion message

#### `features/vocabulary/review/example-sentences.service.ts`
- **Purpose**: Fetch example sentences for vocabulary words
- **Technologies**: Service for example sentence data

### API Endpoints

#### `/api/vocabulary/reviews` (POST, PUT, GET)
- **POST**: Initialize a review entry for a vocabulary word
- **PUT**: Record a review result and update SRS state
- **GET**: Get review entry for a vocabulary word
- **Implementation**: `app/api/vocabulary/reviews/route.ts`

#### `/api/vocabulary/reviews/due` (GET)
- **Purpose**: Get words due for review
- **Implementation**: `app/api/vocabulary/reviews/due/route.ts`

#### `/api/vocabulary/reviews/count` (GET)
- **Purpose**: Get count of words due for review
- **Implementation**: `app/api/vocabulary/reviews/count/route.ts`

#### `/api/vocabulary/reviews/initialize` (POST)
- **Purpose**: Initialize reviews for all vocabulary (admin/migration)
- **Implementation**: `app/api/vocabulary/reviews/initialize/route.ts`

### Data Flow

1. **Review Session Start**:
   - User clicks "Review" button on vocabulary page
   - `getDueWords()` is called from review service
   - Service queries `vocabulary` and `vocabulary_reviews` tables
   - Filters words where `next_review_date <= now` or no review exists
   - Returns `VocabularyWithReview[]` with review metadata

2. **Review Process**:
   - User sees flashcard with word
   - User flips card (Space or click) to see translation
   - User rates quality (Again/Hard/Good/Easy)
   - `recordReview()` is called with vocabulary ID and quality
   - SRS engine calculates new interval and ease factor
   - Database is updated with new review state
   - Next card is shown

3. **SRS Calculation**:
   - `calculateNextReview()` receives quality (0, 1, 3, or 4)
   - If quality < 3: Reset interval to 1, decrease ease factor
   - If quality >= 3: Calculate new interval based on repetitions and ease factor
   - Update ease factor based on quality rating
   - Calculate next review date

### Technologies Used

- **Algorithm**: SM-2 Spaced Repetition System (SuperMemo 2)
- **Database**: Supabase (PostgreSQL) with `vocabulary_reviews` table
- **State Management**: React hooks
- **Keyboard Shortcuts**: Browser keyboard event listeners

---

## Roleplay/Speaking Practice Feature

### Overview
The Roleplay feature provides AI-powered conversation practice in various scenarios (coffee shop, restaurant, airport, etc.) with real-time translation, pronunciation assessment, and voice input/output.

### Route
- **Page Routes**: 
  - `/speak/roleplay` - Scenario selector
  - `/speak/roleplay/[id]` - Active roleplay session
- **Page Files**:
  - `app/speak/roleplay/page.tsx` - Scenario selection page
  - `app/speak/roleplay/[id]/page.tsx` - Session page (server component)

### Core Components

#### Scenario Selector (`app/speak/roleplay/page.tsx`)
- **Purpose**: Display available roleplay scenarios
- **Technologies**: Server component that renders `RoleplaySelector`
- **Implementation**: Simple wrapper that renders `RoleplaySelector` component

#### Roleplay Selector (`features/speak/roleplay/RoleplaySelector.tsx`)
- **Purpose**: Grid/list of available scenarios
- **Technologies**: React component
- **Features**: Scenario cards with title, description, difficulty, icon

#### Roleplay Session (`features/speak/roleplay/RoleplaySession.tsx`)
- **Purpose**: Main conversation interface
- **Technologies**:
  - React with extensive state management
  - Real-time audio recording (MediaRecorder API)
  - Audio playback (AudioManager)
  - WebSocket-like message flow
- **Key Functionality**:
  - Chat interface with AI responses
  - Voice input (microphone recording)
  - Voice output (TTS for AI messages)
  - Real-time translation panel
  - Pronunciation assessment
  - Suggested responses
  - Session persistence

### Supporting Files

#### `features/speak/roleplay/roleplay.service.ts`
- **Purpose**: Scenario data and session management
- **Technologies**: Mock data (can be replaced with database)
- **Key Functions**:
  - `getScenarios()` - Get all available scenarios
  - `getScenarioById(id)` - Get specific scenario
  - `createSession(scenarioId, language)` - Create new session object
  - `addMessage(session, role, content)` - Add message to session
- **Scenario Structure**: Includes id, title, description, theme, difficulty, language, initialMessage, systemPrompt, icon

#### `features/speak/roleplay/roleplay-session.service.ts`
- **Purpose**: Database operations for roleplay sessions
- **Technologies**: Supabase integration
- **Key Functions**: Session CRUD operations, message persistence

#### `features/speak/roleplay/PronunciationFeedback.tsx`
- **Purpose**: Display pronunciation assessment results
- **Technologies**: React component
- **Features**: Score display, word-level feedback, suggestions

### API Endpoints

#### `/api/roleplay/scenarios` (GET)
- **Purpose**: Get all available scenarios
- **Implementation**: `app/api/roleplay/scenarios/route.ts`

#### `/api/roleplay/sessions` (POST, GET)
- **POST**: Create new roleplay session
- **GET**: Get latest session for scenario
- **Implementation**: `app/api/roleplay/sessions/route.ts`

#### `/api/roleplay/sessions/[id]` (GET, DELETE)
- **GET**: Get session by ID
- **DELETE**: Delete session
- **Implementation**: `app/api/roleplay/sessions/[id]/route.ts`

#### `/api/roleplay/sessions/[id]/messages` (POST)
- **Purpose**: Save messages to session
- **Implementation**: `app/api/roleplay/sessions/[id]/messages/route.ts`

#### `/api/roleplay/message` (POST)
- **Purpose**: Send user message and get AI response
- **Technologies**: 
  - OpenAI API integration via `llm.client.ts`
  - System prompt injection for scenario context
- **Implementation**: `app/api/roleplay/message/route.ts`
- **Request Body**: `{ scenarioId, conversationHistory, userMessage, language }`
- **Response**: `{ aiMessage, suggestedResponses: [] }`

#### `/api/roleplay/suggestions` (POST)
- **Purpose**: Generate suggested responses for user
- **Technologies**: OpenAI API with specialized prompt
- **Implementation**: `app/api/roleplay/suggestions/route.ts`
- **Response**: Array of suggested response strings

#### `/api/roleplay/translate` (POST)
- **Purpose**: Translate message text
- **Technologies**: Translation service integration
- **Implementation**: `app/api/roleplay/translate/route.ts`

### Data Flow

1. **Session Initialization**:
   - User selects scenario from selector
   - Navigates to `/speak/roleplay/[id]`
   - Server component fetches scenario via `getScenarioById()`
   - `RoleplaySession` component initializes
   - Checks for existing session (localStorage or database)
   - Creates new session if none exists
   - Displays initial message with suggested responses

2. **Message Flow**:
   - User types or records voice message
   - Voice is transcribed via `/api/speech/transcribe`
   - User message is sent to `/api/roleplay/message`
   - API calls OpenAI with scenario system prompt
   - AI response is received and displayed
   - TTS audio is generated and played automatically
   - Messages are saved to database

3. **Voice Input**:
   - User clicks microphone button
   - `startRecording()` requests microphone access
   - `MediaRecorder` API captures audio chunks
   - Volume visualization shows recording activity
   - User stops recording
   - Audio blob is sent to `/api/speech/transcribe`
   - Transcribed text appears in input field
   - User can edit or send directly

4. **Pronunciation Assessment**:
   - After recording, user can click "Assess Pronunciation"
   - Audio blob is sent to `/api/speech/assess`
   - Azure Speech SDK analyzes pronunciation
   - Scores and feedback are displayed in `PronunciationFeedback` component

5. **Translation**:
   - User clicks "Translate" on any message
   - Translation panel expands
   - `/api/roleplay/translate` is called
   - Original and translated text are displayed side-by-side

### Technologies Used

- **AI/LLM**: OpenAI API (GPT-4o-mini) via `llm.client.ts`
- **Speech Recognition**: Azure Speech-to-Text (via `/api/speech/transcribe`)
- **Speech Synthesis**: Google Cloud TTS + Browser Web Speech API fallback
- **Pronunciation Assessment**: Azure Speech Pronunciation Assessment API
- **Audio Recording**: Browser MediaRecorder API
- **Audio Playback**: Custom `AudioManager` class
- **Database**: Supabase for session persistence
- **State Management**: React hooks with complex state

---

## Speech Processing Features

### Overview
Speech processing includes text-to-speech (TTS), speech-to-text (STT), and pronunciation assessment capabilities.

### TTS (Text-to-Speech)

#### Implementation Files
- **Service**: `lib/speech/tts.ts`
- **API Route**: `app/api/speech/tts/route.ts`
- **Client Manager**: `lib/speech/audio.manager.ts`

#### Technologies
- **Primary**: Google Cloud Text-to-Speech API
  - Uses `GOOGLE_TTS_API_KEY` environment variable
  - Supports multiple languages (es, en, fr, de)
  - Neural voices (es-ES-Neural2-A, etc.)
  - Configurable speaking rate, pitch, volume
- **Fallback**: Browser Web Speech API (`speechSynthesis`)
  - Used when Google TTS API key not configured
  - Client-side only
  - Limited voice quality but no API costs

#### Usage Flow
1. Client calls `/api/speech/tts` with text and language
2. Server attempts Google TTS
3. If successful, returns MP3 audio blob
4. If fails, returns JSON indicating browser fallback
5. Client uses `BrowserTTSManager` for fallback

#### Audio Manager (`lib/speech/audio.manager.ts`)
- **Purpose**: Client-side audio playback management
- **Features**:
  - Play audio from URL or blob
  - Stop currently playing audio
  - Cleanup on unmount
  - Callback support for playback end

### STT (Speech-to-Text)

#### Implementation Files
- **API Route**: `app/api/speech/transcribe/route.ts`

#### Technologies
- **Azure Speech-to-Text API**
  - Uses `microsoft-cognitiveservices-speech-sdk` npm package
  - Requires `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` environment variables
  - Supports multiple languages
  - Real-time transcription

#### Usage Flow
1. Client records audio using MediaRecorder API
2. Audio blob is sent to `/api/speech/transcribe` as FormData
3. Server uses Azure Speech SDK to transcribe
4. Transcribed text is returned to client

### Pronunciation Assessment

#### Implementation Files
- **API Route**: `app/api/speech/assess/route.ts`
- **Component**: `features/speak/roleplay/PronunciationFeedback.tsx`

#### Technologies
- **Azure Speech Pronunciation Assessment API**
  - Uses `microsoft-cognitiveservices-speech-sdk`
  - Provides accuracy, fluency, and completeness scores
  - Word-level assessment with error types
  - Phoneme-level granularity

#### Assessment Scores
- **Accuracy Score**: How correctly words are pronounced (0-100)
- **Fluency Score**: How smoothly speech flows (0-100)
- **Completeness Score**: How much of reference text was spoken (0-100)
- **Overall Score**: Weighted average (accuracy 50%, fluency 30%, completeness 20%)

#### Usage Flow
1. User records audio in roleplay session
2. User clicks "Assess Pronunciation"
3. Audio blob + reference text sent to `/api/speech/assess`
4. Azure SDK analyzes pronunciation
5. Scores and word-level feedback returned
6. `PronunciationFeedback` component displays results

### Audio Recording (Client-Side)

#### Implementation
- **Location**: `features/speak/roleplay/RoleplaySession.tsx`
- **Technologies**: 
  - Browser MediaRecorder API
  - AudioContext API for volume visualization
  - AnalyserNode for frequency analysis

#### Features
- Real-time volume visualization (WhatsApp-style bars)
- Recording duration timer
- Auto-stop at 60 seconds
- Support for multiple audio formats (webm, mp4, ogg)
- Error handling for microphone permissions

---

## AI/LLM Integration

### Overview
LingoMate uses OpenAI's GPT models for AI-powered conversations, response suggestions, and language learning assistance.

### Implementation Files
- **Client**: `lib/ai/llm.client.ts`
- **Prompt Builder**: `lib/ai/prompt.builder.ts` (if exists)
- **Feedback Engine**: `lib/ai/feedback.engine.ts` (if exists)

### LLM Client (`lib/ai/llm.client.ts`)

#### Technologies
- **Provider**: OpenAI API
- **Model**: GPT-4o-mini (configurable via `OPENAI_MODEL` env var)
- **API**: REST API (`https://api.openai.com/v1/chat/completions`)
- **Authentication**: Bearer token (`OPENAI_API_KEY`)

#### Key Functions

##### `chat(messages: ChatMessage[])`
- **Purpose**: Generate AI response in conversation
- **Input**: Array of messages with roles (system, user, assistant)
- **Output**: `{ content: string, usage?: { promptTokens, completionTokens } }`
- **Usage**: Roleplay conversations, general chat

##### `generateSuggestions(conversationHistory, count, options)`
- **Purpose**: Generate suggested responses for language learners
- **Input**: Conversation history, number of suggestions, language/scenario context
- **Output**: Array of short response strings (2-8 words)
- **Special Prompt**: Uses JSON response format, higher temperature (0.9) for variety
- **Usage**: Initial message suggestions, "Suggest a response" button

#### Configuration
- **Environment Variables**:
  - `OPENAI_API_KEY` - Required for API access
  - `OPENAI_MODEL` - Optional, defaults to 'gpt-4o-mini'
- **Singleton Pattern**: Exported as `llmClient` instance

### Usage in Features

#### Roleplay Conversations
- **Location**: `app/api/roleplay/message/route.ts`
- **Flow**:
  1. Receives user message and conversation history
  2. Fetches scenario to get system prompt
  3. Builds message array: [system prompt, ...history, user message]
  4. Calls `llmClient.chat(messages)`
  5. Returns AI response

#### Response Suggestions
- **Location**: `app/api/roleplay/suggestions/route.ts`
- **Flow**:
  1. Receives conversation history and AI message
  2. Builds specialized prompt for suggestions
  3. Calls `llmClient.generateSuggestions()`
  4. Returns array of suggested responses

### Error Handling
- **API Key Missing**: Returns error message prompting configuration
- **API Errors**: Catches and returns user-friendly error messages
- **Fallback**: Mock responses when API unavailable (development)

---

## Translation Services

### Overview
Translation services provide word and text translation capabilities throughout the application.

### Implementation Files
- **Service**: `lib/translation/translation.service.ts`
- **API Route**: `app/api/translation/route.ts`

### Translation Service (`lib/translation/translation.service.ts`)

#### Technologies
- **Client-side service** with caching
- **API Integration**: Calls `/api/translation` endpoint
- **Caching**: In-memory Map for translation cache

#### Key Functions

##### `getTranslation(word, options)`
- **Purpose**: Translate a single word
- **Input**: Word string, options (sourceLang, targetLang, context)
- **Output**: `TranslationResult` with word, translation, meanings, languages
- **Caching**: Checks cache before API call
- **Usage**: Reader word lookup, vocabulary creation

##### `getCachedTranslation(word, sourceLang, targetLang)`
- **Purpose**: Get translation from cache without API call
- **Usage**: Fast lookup for previously translated words

##### `clearTranslationCache()`
- **Purpose**: Clear in-memory translation cache

### API Endpoint (`app/api/translation/route.ts`)

#### Implementation
- **Status**: Placeholder/To be implemented
- **Expected**: Integration with translation API (Google Translate, DeepL, etc.)
- **Request**: `{ word, sourceLang, targetLang, context? }`
- **Response**: `{ word, translation, meanings?, sourceLanguage, targetLanguage }`

### Usage in Features

#### Reader Feature
- **Location**: `features/reader/InteractiveReader.tsx`
- **Flow**: 
  1. User clicks unknown word
  2. `getTranslation()` is called automatically
  3. Translation is used to create vocabulary entry
  4. Translation is displayed in `WordDefinitionPanel`

#### Roleplay Feature
- **Location**: `app/api/roleplay/translate/route.ts`
- **Flow**:
  1. User clicks "Translate" on message
  2. Message content is sent to translation API
  3. Original and translated text are returned
  4. Displayed in translation panel

---

## Authentication & User Management

### Overview
LingoMate uses Supabase Auth for user authentication and user ID management.

### Implementation Files
- **Auth Provider**: `components/AuthProvider.tsx`
- **Server Auth**: `lib/auth/server.ts`
- **Client Auth**: `lib/auth/auth.ts`
- **Database Client**: `lib/db/client.ts`

### Technologies
- **Supabase Auth**: 
  - Email/password authentication
  - Session management
  - User metadata
- **Database**: Supabase PostgreSQL
- **User ID Resolution**: 
  - Authenticated users: Supabase user ID
  - Anonymous users: Temporary UUID stored in localStorage

### User ID Management

#### Pattern Used Throughout Codebase
```typescript
async function getUserId(): Promise<string> {
  // Try authenticated user first
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;
  
  // Fallback to temporary ID for anonymous users
  if (typeof window !== 'undefined') {
    let tempUserId = localStorage.getItem('lingomate_temp_user_id');
    if (!tempUserId) {
      tempUserId = generateUUID();
      localStorage.setItem('lingomate_temp_user_id', tempUserId);
    }
    return tempUserId;
  }
  
  return '00000000-0000-0000-0000-000000000000';
}
```

#### Usage
- **Vocabulary Service**: Uses `getUserId()` for all vocabulary queries
- **Review Service**: Uses `getUserId()` for review data
- **Roleplay Sessions**: Stores session ID in localStorage for anonymous users

### Database Client (`lib/db/client.ts`)

#### Technologies
- **Supabase Client**: `@supabase/supabase-js`
- **SSR Support**: `@supabase/ssr` for server-side rendering
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Functions
- `createClientSupabase()` - Creates browser client with SSR support
- `supabase` - Legacy singleton client (deprecated)

### Auth Routes
- **Login**: `/auth/login` - `app/auth/login/page.tsx`
- **Signup**: `/auth/signup` - `app/auth/signup/page.tsx`
- **Forgot Password**: `/auth/forgot-password` - `app/auth/forgot-password/page.tsx`
- **Reset Password**: `/auth/reset-password` - `app/auth/reset-password/page.tsx`

---

## Summary of Technologies Used

### Frontend
- **Framework**: Next.js 16 (beta) with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Inline CSS styles (dark theme)
- **State Management**: React hooks (local component state)

### Backend
- **Runtime**: Node.js (via Next.js API routes)
- **API Framework**: Next.js Route Handlers
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### External Services
- **AI/LLM**: OpenAI API (GPT-4o-mini)
- **Text-to-Speech**: Google Cloud TTS API (primary) + Browser Web Speech API (fallback)
- **Speech-to-Text**: Azure Speech-to-Text API
- **Pronunciation Assessment**: Azure Speech Pronunciation Assessment API
- **Translation**: (To be implemented - placeholder exists)

### Algorithms
- **Spaced Repetition**: SM-2 algorithm (SuperMemo 2)
- **SRS State Management**: Custom implementation in `lib/learning/srs.engine.ts`

### Browser APIs Used
- **MediaRecorder API**: Audio recording
- **AudioContext API**: Audio analysis and visualization
- **Web Speech API**: Browser TTS fallback
- **localStorage**: Temporary user ID and session storage

---

*Last Updated: Based on current codebase structure*
*Documentation Version: 1.0*
