import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/lib/ai/llm.client';
import { getScenarioById } from '@/features/speak/roleplay/roleplay.service';
import type { ChatMessage } from '@/types/conversation';

interface RequestBody {
  scenarioId: string;
  conversationHistory: ChatMessage[];
  userMessage: string;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { scenarioId, conversationHistory, userMessage, language } = body;

    // Get scenario to access system prompt
    const scenario = await getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Build conversation history for LLM
    const messages = [
      {
        role: 'system' as const,
        content: scenario.systemPrompt,
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    // Get AI response
    const aiResponse = await llmClient.chat(messages);

    // Don't generate suggested responses - they should only appear on the initial message
    return NextResponse.json({
      aiMessage: aiResponse.content,
      suggestedResponses: [], // Always return empty array
    });
  } catch (error) {
    console.error('Error processing message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's an API key error
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local file.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process message', details: errorMessage },
      { status: 500 }
    );
  }
}
