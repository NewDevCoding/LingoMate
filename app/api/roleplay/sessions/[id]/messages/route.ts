import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { saveMessage, saveMessages } from '@/features/speak/roleplay/roleplay-session.service';
import { ChatMessage } from '@/types/conversation';

/**
 * POST /api/roleplay/sessions/[id]/messages
 * Save a message or multiple messages to a session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    
    // Support both single message and array of messages
    if (body.message) {
      // Single message
      const message: ChatMessage = {
        id: body.message.id,
        role: body.message.role,
        content: body.message.content,
        timestamp: new Date(body.message.timestamp),
        suggestedResponses: body.message.suggestedResponses,
      };
      
      await saveMessage(sessionId, message);
      return NextResponse.json({ success: true });
    } else if (Array.isArray(body.messages)) {
      // Multiple messages
      const messages: ChatMessage[] = body.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        suggestedResponses: msg.suggestedResponses,
      }));
      
      await saveMessages(sessionId, messages);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid request body. Expected "message" or "messages" array' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
