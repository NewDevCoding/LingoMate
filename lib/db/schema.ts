/**
 * Database Schema Definitions
 * 
 * This file documents the database schema for Supabase.
 * Run these migrations in your Supabase SQL editor.
 */

export const roleplaySessionsTable = `
CREATE TABLE IF NOT EXISTS roleplay_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
`;

/**
 * Complete migration SQL
 * Run this in your Supabase SQL editor to set up the tables
 */
export const completeMigration = `
${roleplaySessionsTable}

${roleplayMessagesTable}

${rlsPolicies}
`;
