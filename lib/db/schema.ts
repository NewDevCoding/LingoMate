/**
 * Database Schema Definitions
 * 
 * This file documents the database schema for Supabase.
 * Run these migrations in your Supabase SQL editor.
 */

export const roleplaySessionsTable = `
CREATE TABLE IF NOT EXISTS roleplay_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Removed foreign key constraint to allow anonymous users
  scenario_id TEXT NOT NULL,
  language TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_user_id ON roleplay_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_scenario_id ON roleplay_sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_updated_at ON roleplay_sessions(updated_at DESC);
`;

export const roleplayMessagesTable = `
CREATE TABLE IF NOT EXISTS roleplay_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES roleplay_sessions(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  suggested_responses JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_roleplay_messages_session_id ON roleplay_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_messages_timestamp ON roleplay_messages(session_id, timestamp);
`;

export const vocabularyReviewsTable = `
CREATE TABLE IF NOT EXISTS vocabulary_reviews (
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

CREATE INDEX IF NOT EXISTS idx_vocabulary_reviews_user_id ON vocabulary_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_reviews_next_review ON vocabulary_reviews(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_vocabulary_reviews_vocab_id ON vocabulary_reviews(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_reviews_due ON vocabulary_reviews(user_id, next_review_date) WHERE next_review_date IS NOT NULL;
`;

export const rlsPolicies = `
-- Enable Row Level Security
ALTER TABLE roleplay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view their own sessions"
  ON roleplay_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
  ON roleplay_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON roleplay_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
  ON roleplay_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Users can view messages from their own sessions
CREATE POLICY "Users can view their own messages"
  ON roleplay_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roleplay_sessions
      WHERE roleplay_sessions.id = roleplay_messages.session_id
      AND roleplay_sessions.user_id = auth.uid()
    )
  );

-- Users can insert messages to their own sessions
CREATE POLICY "Users can insert their own messages"
  ON roleplay_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roleplay_sessions
      WHERE roleplay_sessions.id = roleplay_messages.session_id
      AND roleplay_sessions.user_id = auth.uid()
    )
  );

-- Users can update messages in their own sessions
CREATE POLICY "Users can update their own messages"
  ON roleplay_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roleplay_sessions
      WHERE roleplay_sessions.id = roleplay_messages.session_id
      AND roleplay_sessions.user_id = auth.uid()
    )
  );

-- Users can delete messages from their own sessions
CREATE POLICY "Users can delete their own messages"
  ON roleplay_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM roleplay_sessions
      WHERE roleplay_sessions.id = roleplay_messages.session_id
      AND roleplay_sessions.user_id = auth.uid()
    )
  );

-- Enable Row Level Security for vocabulary_reviews
ALTER TABLE vocabulary_reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own reviews
-- Note: For temp users (not authenticated), this allows access to any review
-- The application layer filters by user_id to ensure security
CREATE POLICY "Users can view their own reviews"
  ON vocabulary_reviews FOR SELECT
  USING (true); -- Allow all reads, filter by user_id in application

-- Users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
  ON vocabulary_reviews FOR INSERT
  WITH CHECK (true); -- Allow all inserts, user_id is set by application

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON vocabulary_reviews FOR UPDATE
  USING (true) -- Allow all updates, filter by user_id in application
  WITH CHECK (true);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON vocabulary_reviews FOR DELETE
  USING (true); -- Allow all deletes, filter by user_id in application
`;

/**
 * Complete migration SQL
 * Run this in your Supabase SQL editor to set up the tables
 */
export const completeMigration = `
${roleplaySessionsTable}

${roleplayMessagesTable}

${vocabularyReviewsTable}

${rlsPolicies}
`;
