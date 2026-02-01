import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/lib/ai/llm.client';
import type { ChatMessage } from '@/types/conversation';

interface RequestBody {
  conversationHistory: ChatMessage[];
  aiMessage: string;
  count?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { conversationHistory, aiMessage, count = 3 } = body;

    // Build conversation history for LLM
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      })),
      {
        role: 'assistant' as const,
        content: aiMessage,
      },
    ];

    // Generate suggested responses
    const suggestedResponses = await llmClient.generateSuggestions(messages, count);

    return NextResponse.json({
      suggestedResponses,
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's an API key error
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local file.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: errorMessage },
      { status: 500 }
    );
  }
}
