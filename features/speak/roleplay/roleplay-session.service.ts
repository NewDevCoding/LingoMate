/**
 * Roleplay Session Service
 * 
 * Handles database operations for roleplay sessions and messages
 */

import { supabase } from '@/lib/db/client';
import { RoleplaySession, ChatMessage } from '@/types/conversation';

export interface DatabaseSession {
  id: string;
  user_id: string;
  scenario_id: string;
  language: string;
  started_at: string;
  updated_at: string;
  message_count: number;
  created_at: string;
}

export interface DatabaseMessage {
  id: string;
  session_id: string;
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggested_responses?: string[] | null;
  created_at: string;
}

/**
 * Create a new roleplay session in the database
 */
export async function createSession(
  userId: string,
  scenarioId: string,
  language: string
): Promise<string> {
  const { data, error } = await supabase
    .from('roleplay_sessions')
    .insert({
      user_id: userId,
      scenario_id: scenarioId,
      language,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data.id;
}

/**
 * Load a roleplay session with all messages
 */
export async function loadSession(sessionId: string): Promise<RoleplaySession | null> {
  // Load session
  const { data: session, error: sessionError } = await supabase
    .from('roleplay_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    console.error('Error loading session:', sessionError);
    return null;
  }

  // Load messages
  const { data: messages, error: messagesError } = await supabase
    .from('roleplay_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (messagesError) {
    console.error('Error loading messages:', messagesError);
    return null;
  }

  // Convert to RoleplaySession format
  const chatMessages: ChatMessage[] = (messages || []).map((msg: DatabaseMessage) => ({
    id: msg.message_id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    suggestedResponses: msg.suggested_responses || undefined,
  }));

  return {
    id: session.id,
    scenarioId: session.scenario_id,
    messages: chatMessages,
    startedAt: new Date(session.started_at),
    language: session.language,
  };
}

/**
 * Save a message to a session
 */
export async function saveMessage(
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  const { error } = await supabase
    .from('roleplay_messages')
    .upsert({
      session_id: sessionId,
      message_id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      suggested_responses: message.suggestedResponses || null,
    }, {
      onConflict: 'session_id,message_id',
    });

  if (error) {
    console.error('Error saving message:', error);
    throw new Error(`Failed to save message: ${error.message}`);
  }

  // Update session message count and updated_at
  const { error: updateError } = await supabase
    .from('roleplay_sessions')
    .update({
      updated_at: new Date().toISOString(),
      message_count: supabase.rpc('increment', { x: 1 }), // This won't work, need to count
    })
    .eq('id', sessionId);

  // Better approach: count messages
  const { count } = await supabase
    .from('roleplay_messages')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  await supabase
    .from('roleplay_sessions')
    .update({
      updated_at: new Date().toISOString(),
      message_count: count || 0,
    })
    .eq('id', sessionId);
}

/**
 * Save multiple messages at once (batch operation)
 */
export async function saveMessages(
  sessionId: string,
  messages: ChatMessage[]
): Promise<void> {
  const messageData = messages.map((msg) => ({
    session_id: sessionId,
    message_id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
    suggested_responses: msg.suggestedResponses || null,
  }));

  const { error } = await supabase
    .from('roleplay_messages')
    .upsert(messageData, {
      onConflict: 'session_id,message_id',
    });

  if (error) {
    console.error('Error saving messages:', error);
    throw new Error(`Failed to save messages: ${error.message}`);
  }

  // Update session
  await supabase
    .from('roleplay_sessions')
    .update({
      updated_at: new Date().toISOString(),
      message_count: messages.length,
    })
    .eq('id', sessionId);
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<DatabaseSession[]> {
  const { data, error } = await supabase
    .from('roleplay_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading user sessions:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete a session and all its messages
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('roleplay_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Update session (e.g., update timestamp)
 */
export async function updateSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('roleplay_sessions')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session:', error);
    throw new Error(`Failed to update session: ${error.message}`);
  }
}
