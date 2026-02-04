# LingoMate Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Routes (Pages)](#routes-pages)
4. [API Endpoints](#api-endpoints)
5. [Features Folder](#features-folder)
6. [Components](#components)
7. [State Management (Stores)](#state-management-stores)
8. [Type Definitions](#type-definitions)
9. [Schemas](#schemas)
10. [Libraries & Utilities](#libraries--utilities)
11. [Important Details](#important-details)

---

## Project Overview

**LingoMate** is a language learning platform built with Next.js 16 (beta), React 19, and TypeScript. The application follows a feature-based architecture where each learning mode is organized as a self-contained folder with its own UI components and services.

### Tech Stack
- **Framework**: Next.js 16 (beta) with App Router
- **Language**: TypeScript
- **UI**: React 19 with inline styles (dark theme)
- **Styling**: Tailwind CSS 4 (configured but primarily using inline styles)
- **State Management**: Client-side stores (Zustand pattern)

---

## Architecture

### Design Principles
- **Feature-based organization**: Each learning mode = a folder
- **Colocated services**: Services are placed alongside UI components
- **Modular structure**: Easy to delete, add, or replace modes later
- **Dark theme**: Consistent dark color scheme (`#161616` background, `#1f1f1f` cards, `#313131` borders)

### Directory Structure
```
LingoMate/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   └── [routes]/          # Page routes
├── components/            # Shared UI components
├── features/              # Feature-specific code (organized by learning mode)
├── lib/                   # Core libraries and utilities
├── store/                 # Global state management
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

---

## Routes (Pages)

All routes are located in the `app/` directory using Next.js App Router.

### `/` (Home/Dashboard)
- **File**: `app/page.tsx`
- **Purpose**: Main dashboard/home page
- **Status**: Placeholder (content to be implemented)
- **Layout**: Uses `AppLayout` wrapper

### `/dashboard`
- **File**: `app/dashboard/page.tsx`
- **Purpose**: User dashboard with learning overview
- **Status**: Placeholder
- **Features**: Will display user stats, progress, and quick actions

### `/reader`
- **File**: `app/reader/page.tsx`
- **Purpose**: Article library for reading practice
- **Status**: ✅ Implemented
- **Features**:
  - Search library functionality
  - Import articles button
  - Horizontal scrollable article rows
  - Article cards with progress tracking
  - Categories: "Continue Learning" and "Your Library"
- **Components Used**: `ArticleRow`, `ArticleCard`
- **Data**: Mock articles from `features/reader/article.service.ts`

### `/learn`
- **File**: `app/learn/page.tsx`
- **Purpose**: Structured learning courses and lessons
- **Status**: Placeholder
- **Planned Features**: Course maps, lesson views, vocabulary practice

### `/speak`
- **File**: `app/speak/page.tsx`
- **Purpose**: Speaking practice and conversation
- **Status**: Placeholder
- **Planned Features**: Chat sessions, roleplay, debates, character conversations

### `/practice`
- **File**: `app/practice/page.tsx`
- **Purpose**: Various practice exercises
- **Status**: Placeholder
- **Planned Features**: Photo scenarios, practice scenarios

### `/vocabulary`
- **File**: `app/vocabulary/page.tsx`
- **Purpose**: Vocabulary management and review
- **Status**: Placeholder
- **Planned Features**: Word lists, flashcards, spaced repetition

### `/progress`
- **File**: `app/progress/page.tsx`
- **Purpose**: Learning progress tracking and analytics
- **Status**: Placeholder
- **Planned Features**: Charts, statistics, learning streaks

### `/tutors`
- **File**: `app/tutors/page.tsx`
- **Purpose**: AI tutor sessions
- **Status**: Placeholder

### `/settings`
- **File**: `app/settings/page.tsx`
- **Purpose**: User settings and preferences
- **Status**: Placeholder

---

## API Endpoints

All API routes are located in `app/api/` and follow Next.js Route Handler pattern.

### `/api/chat`
- **File**: `app/api/chat/route.ts`
- **Purpose**: AI chat/conversation endpoints
- **Status**: Placeholder (to be implemented)
- **Planned**: Handle chat messages, AI responses, conversation history

### `/api/progress`
- **File**: `app/api/progress/route.ts`
- **Purpose**: Learning progress tracking
- **Status**: Placeholder (to be implemented)
- **Planned**: Track user progress, update statistics, retrieve analytics

### `/api/speech`
- **File**: `app/api/speech/route.ts`
- **Purpose**: Speech-to-text and text-to-speech processing
- **Status**: Placeholder (to be implemented)
- **Planned**: STT transcription, TTS audio generation, pronunciation feedback

### `/api/vocabulary`
- **File**: `app/api/vocabulary/route.ts`
- **Purpose**: Vocabulary management
- **Status**: Placeholder (to be implemented)
- **Planned**: CRUD operations for vocabulary words, spaced repetition scheduling

---

## Features Folder

The `features/` directory contains feature-specific code organized by learning mode. Each feature folder typically contains:
- UI components (`.tsx` files)
- Service files (`.service.ts`) for data/business logic
- Store files (`.store.ts`) for local state management

### `/features/dashboard`
Dashboard-specific components and features.

**Components**:
- `ChatButton.tsx` - Chat button component (legacy, replaced by global chat)
- `ContinueLearning.tsx` - Continue learning section
- `CurrentLesson.tsx` - Current lesson display
- `DashboardHeader.tsx` - Dashboard header component
- `DashboardOverview.tsx` - Overview section
- `LearningTools.tsx` - Learning tools display
- `QuickActions.tsx` - Quick action buttons
- `Sidebar.tsx` - Dashboard-specific sidebar (different from main sidebar)
- `StatsPanel.tsx` - Statistics panel

### `/features/learn`
Structured learning features (courses, sentences, words).

**Subfolders**:
- **`courses/`**
  - `course.service.ts` - Course data service
  - `CourseMap.tsx` - Course navigation map
  - `LessonView.tsx` - Individual lesson view

- **`sentences/`**
  - `sentence.service.ts` - Sentence practice service
  - `SentencePractice.tsx` - Sentence practice component

- **`words/`**
  - `vocabulary.service.ts` - Word/vocabulary service
  - `WordCard.tsx` - Word flashcard component
  - `WordPractice.tsx` - Word practice component

### `/features/practice`
Practice exercises and scenarios.

**Files**:
- `practice.service.ts` - Practice session service
- `photo/` - Photo-based practice scenarios (folder exists, empty)
- `scenarios/` - Practice scenarios (folder exists, empty)

### `/features/progress`
Progress tracking and analytics.

**Files**:
- `progress.service.ts` - Progress data service
- `Charts.tsx` - Progress charts component
- `StatsOverview.tsx` - Statistics overview component

### `/features/reader`
Article reading and library features.

**Files**:
- `article.service.ts` - Article data service (currently uses mock data)
  - `mockArticles` - Array of mock articles
  - `getArticlesByCategory()` - Filter articles by category
  - `searchArticles()` - Search articles by query
- `ArticleCard.tsx` - Individual article card component
- `ArticleRow.tsx` - Horizontal scrollable row of articles
- `ChatWindow.tsx` - AI chat support window (dark mode, support-style UI)

### `/features/speak`
Speaking practice features.

**Subfolders**:
- **`call/`**
  - `call.service.ts` - Call session service
  - `CallView.tsx` - Call interface component

- **`characters/`**
  - `character.service.ts` - Character conversation service

- **`chat/`**
  - `chat.service.ts` - Chat session service
  - `ChatTranscript.tsx` - Chat transcript display
  - `ChatView.tsx` - Chat interface component

- **`debate/`**
  - `debate.service.ts` - Debate session service

- **`roleplay/`**
  - `roleplay.service.ts` - Roleplay session service
  - `RoleplaySelector.tsx` - Roleplay scenario selector
  - `RoleplaySession.tsx` - Active roleplay session

### `/features/vocabulary`
Vocabulary management features.

**Files**:
- `vocabulary.store.ts` - Vocabulary state management
- `WordDetail.tsx` - Detailed word view component
- `WordList.tsx` - Word list component

---

## Components

Shared UI components located in `components/`.

### `AppLayout.tsx`
- **Purpose**: Main application layout wrapper
- **Features**:
  - Sidebar integration (collapsible)
  - Global chat bubble (purple, bottom-right)
  - Chat window integration
  - Dark theme background (`#161616`)
- **State**: Manages sidebar collapse and chat window open/close

### `Sidebar.tsx`
- **Purpose**: Main navigation sidebar
- **Features**:
  - Collapsible sidebar (expands/collapses)
  - Navigation items: Dashboard, Reader, Vocabulary
  - Active route highlighting (green `#26c541`)
  - "Upgrade to Pro" card (when expanded)
- **Routes**:
  - `/` - Dashboard
  - `/reader` - Reader
  - `/vocabulary` - Vocabulary

---

## State Management (Stores)

Client-side state management files in `store/` directory. These appear to follow a Zustand-like pattern (though implementation may vary).

### `user.store.ts`
- **Purpose**: User data and authentication state
- **Status**: Placeholder

### `progress.store.ts`
- **Purpose**: Learning progress tracking state
- **Status**: Placeholder

### `session.store.ts`
- **Purpose**: Current learning session state
- **Status**: Placeholder

### `settings.store.ts`
- **Purpose**: User settings and preferences
- **Status**: Placeholder

### `language.store.ts`
- **Purpose**: Current learning language and language settings
- **Status**: Placeholder

---

## Type Definitions

TypeScript type definitions in `types/` directory.

### `article.ts`
```typescript
interface Article {
  id: string;
  title: string;
  progress: number; // percentage of new words (0-100)
  category: string;
  duration?: string;
  difficulty?: string;
  newWordsCount?: number;
  views?: number;
  hasNotification?: boolean;
}
```

### `conversation.ts`
- **Status**: Empty (to be defined)

### `language.ts`
- **Status**: Empty (to be defined)

### `lesson.ts`
- **Status**: Empty (to be defined)

### `progress.ts`
- **Status**: Empty (to be defined)

### `speech.ts`
- **Status**: Empty (to be defined)

### `user.ts`
- **Status**: Empty (to be defined)

### `word.ts`
- **Status**: Empty (to be defined)

---

## Schemas

Details of how the data in our database is organized in tables.

### Articles
Long-form bodies of example content to be read in the interactive reader

| Column name | Type                        | Nullable | Description                                                    |
| ----------- | --------------------------- | -------- | -------------------------------------------------------------- |
| id          | uuid                        | No       | Primary key                                                    |
| title       | text                        | Yes      | The title of the article                                       |
| url         | text                        | No       | The external webpage the article was sourced from              |
| date        | date                        | Yes      | The date the article was created on its original platform      |
| description | text                        | Yes      | A brief description of what the article is about               |
| content     | text                        | Yes      | The text of the article in the target language                 |
| inserted_at | timestamptz                 | Yes      | When the article was first imported to LingoMate               |
| image       | text                        | Yes      | A URL to an image that will serve as the cover for the article |

### roleplay_messages
Individual messages sent in roleplay sessions

| Column name         | Type                     | Nullable | Description                                                            |
| ------------------- | ------------------------ | -------- | -----------                                                            |
| id                  | uuid                     | No       | Primary key                                                            |
| session_id          | uuid                     | Yes      | Primary key of the related entry of the roleplay_sessions table        |
| message_id          | text                     | No       |                                                                        |
| role                | text                     | No       | Who sent the message: either "assistant" or "user"                     |
| content             | text                     | No       | The text content of the message                                        |
| timestamp           | timestamptz              | No       | When the message was sent                                              |
| suggested_responses | jsonb                    | Yes      | Possible ways to respond to this message, given as an array of strings |
| created_at          | timestamptz              | No       | When the message was created                                           |

### roleplay_sessions
Individual sessions with the chat roleplay feature

| Column name   | Type        | Nullable | Description                                                |
| ------------- | ----------- | -------- | ---------------------------------------------------------- |
| id            | uuid        | No       | Primary key                                                |
| user_id       | uuid        | Yes      | The primary key of the related user                        |
| scenario_id   | text        | No       | The identifier for the related scenario                    |
| language      | text        | No       | The 2-letter ISO code for the language                     |
| started_at    | timestamptz | No       | When the first message in the session was sent             |
| updated_at    | timestamptz | No       | When the roleplay session was last interacted with/updated |
| message_count | integer     | Yes      | The total number of messages in the session                |
| created_at    | timestamptz | No       | When the roleplay session was created                      |

### vocabulary
Vocabulary words being tracked and learned by a user

| Column name   | Type                     | Nullable | Description                                             |
| ------------- | ------------------------ | -------- | ------------------------------------------------------- |
| id            | uuid                     | No       | Primary key                                             |
| user_id       | text                     | No       | The user's username                                     |
| word          | text                     | No       | The word in the target language                         |
| translation   | text                     | No       | The word in English                                     |
| language      | text                     | No       | The 2-letter ISO code for the language                  |
| comprehension | int4                     | No       | An integer (1-5) for the word's stage in the SRS system |
| updated_at    | timestamptz              | No       | When the word was last updated                          |
| created_at    | timestamptz              | No       | When the word was created                               |

### vocabulary_reviews
Description here

| Column name   | Type                     | Nullable | Description |
| ------------- | ------------------------ | -------- | ----------- |
| id            | uuid                     | No       | Primary key |
| vocabulary_id | uuid                     | Yes      |             |
| user_id       | uuid                     | Yes      |             |
| interval_days | int4                     | Yes      |             |
| ease_factor   | numeric                  | Yes      |             |
| repetitions   | int4                     | Yes      |             |
| next_review_date | timestamptz           | Yes      |             |
| last_reviewed_at | timestamptz           | Yes      |             |
| review_count  | int4                     | Yes      |             |
| consecutive_correct | int4               | Yes      |             |
| consecutive_incorrect | int4             | Yes      |             |
| created_at    | timestamptz              | Yes      |             |
| uploaded_at   | timestamptz              | Yes      |             |



## Libraries & Utilities

Core libraries and utilities in `lib/` directory.

### `/lib/ai`
AI and LLM integration.

- **`llm.client.ts`** - LLM client for AI interactions (placeholder)
- **`prompt.builder.ts`** - Prompt construction utilities
- **`feedback.engine.ts`** - AI feedback generation engine

### `/lib/auth`
Authentication utilities.

- **`auth.ts`** - Authentication logic (placeholder)

### `/lib/db`
Database client and schema.

- **`client.ts`** - Database client (placeholder)
- **`schema.ts`** - Database schema definitions (empty)

### `/lib/learning`
Learning algorithms and utilities.

- **`adaptive.engine.ts`** - Adaptive learning engine
- **`difficulty.ts`** - Difficulty calculation utilities
- **`scoring.ts`** - Scoring and assessment utilities

### `/lib/speech`
Speech processing utilities.

- **`stt.ts`** - Speech-to-text service (placeholder)
- **`tts.ts`** - Text-to-speech service (placeholder)
- **`audio.manager.ts`** - Audio playback management

### `/lib/utils`
General utility functions.

- **`language.ts`** - Language utility functions
- **`text.ts`** - Text processing utilities
- **`time.ts`** - Time/date utilities

---

## Important Details

### Global Chat Feature
- **Location**: Available on all pages via `AppLayout`
- **Component**: `features/reader/ChatWindow.tsx`
- **Trigger**: Purple chat bubble (bottom-right, fixed position)
- **Behavior**: 
  - Opens/closes on click
  - Transforms bubble to X icon when open
  - Dark mode support window
  - Positioned above the chat bubble (not full screen)

### Styling Approach
- **Primary**: Inline styles with React.CSSProperties
- **Theme**: Dark mode (`#161616`, `#1f1f1f`, `#313131`)
- **Accent Color**: Green (`#26c541`) for active states
- **Chat Bubble**: Purple (`#8b5cf6`)
- **Tailwind**: Configured but not actively used (inline styles preferred)

### Data Management
- **Current State**: Mostly mock data
- **Reader**: Uses mock articles in `features/reader/article.service.ts`
- **Database**: Schema and client placeholders exist but not implemented
- **API Routes**: All API endpoints are placeholders

### Development Status
- **Implemented**: Reader page with article library, global chat window, sidebar navigation
- **In Progress**: Most features are placeholders
- **Architecture**: Feature-based structure is established and ready for implementation

### Key Patterns
1. **Feature Colocation**: Services live alongside UI components
2. **Service Pattern**: `.service.ts` files handle data/business logic
3. **Store Pattern**: `.store.ts` files for local state (when needed)
4. **Type Safety**: TypeScript types defined in `types/` directory
5. **Component Organization**: Features organized by learning mode

### Next Steps for Implementation
1. Implement database schema and client
2. Connect API routes to database/services
3. Implement authentication system
4. Build out remaining feature pages
5. Integrate AI/LLM services
6. Implement speech processing (STT/TTS)
7. Add real data fetching and state management

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `ArticleCard.tsx`)
- **Services**: camelCase with `.service.ts` suffix (e.g., `article.service.ts`)
- **Stores**: camelCase with `.store.ts` suffix (e.g., `vocabulary.store.ts`)
- **Types**: camelCase (e.g., `article.ts`)
- **Pages**: Next.js App Router convention (`page.tsx`)

---

*Last Updated: Based on current codebase structure*
*Documentation Version: 1.0*
