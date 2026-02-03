-- ============================================
-- LingoMate Roleplay Conversations Migration
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================
-- VERSION: Anonymous Access (for testing without auth)
-- ============================================

-- Create roleplay_sessions table
-- NOTE: user_id is TEXT to allow "anonymous" for testing
CREATE TABLE IF NOT EXISTS roleplay_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  scenario_id TEXT NOT NULL,
  language TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for roleplay_sessions
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_user_id ON roleplay_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_scenario_id ON roleplay_sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_updated_at ON roleplay_sessions(updated_at DESC);

-- Create roleplay_messages table
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

-- Create indexes for roleplay_messages
CREATE INDEX IF NOT EXISTS idx_roleplay_messages_session_id ON roleplay_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_messages_timestamp ON roleplay_messages(session_id, timestamp);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- DEVELOPMENT MODE: Allow anonymous access
-- ============================================

-- Enable Row Level Security
ALTER TABLE roleplay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to access sessions (for testing without auth)
CREATE POLICY "Allow anonymous session access"
  ON roleplay_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anyone to access messages (for testing without auth)
CREATE POLICY "Allow anonymous message access"
  ON roleplay_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Migration Complete!
-- ============================================
-- You should now see two tables in Supabase:
-- 1. roleplay_sessions
-- 2. roleplay_messages
-- ============================================
