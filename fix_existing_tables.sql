-- ============================================
-- Fix Existing Tables for Anonymous Access
-- ============================================
-- If you already ran the migration with UUID user_id,
-- run this to fix it for anonymous access
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON roleplay_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON roleplay_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON roleplay_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON roleplay_sessions;
DROP POLICY IF EXISTS "Users can view their own messages" ON roleplay_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON roleplay_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON roleplay_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON roleplay_messages;

-- Change user_id column from UUID to TEXT
-- This allows storing "anonymous" string
ALTER TABLE roleplay_sessions 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Remove the foreign key constraint if it exists
ALTER TABLE roleplay_sessions 
  DROP CONSTRAINT IF EXISTS roleplay_sessions_user_id_fkey;

-- Set default value
ALTER TABLE roleplay_sessions 
  ALTER COLUMN user_id SET DEFAULT 'anonymous';

-- Create anonymous access policies
CREATE POLICY "Allow anonymous session access"
  ON roleplay_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous message access"
  ON roleplay_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Fix Complete!
-- ============================================
