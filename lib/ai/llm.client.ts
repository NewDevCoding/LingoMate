/**
 * LLM Client for AI interactions
 * Supports OpenAI and other providers
 */

interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig = { provider: 'openai' }) {
    this.config = config;
  }

  /**
   * Generate a chat completion
   */
  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    // For now, return a mock response
    // In production, this would call the actual LLM API
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (this.config.provider === 'openai') {
      return this.callOpenAI(messages);
    }
    
    // Fallback mock response
    return {
      content: `I understand you said: "${lastUserMessage?.content || 'Hello'}". This is a mock response. Please configure your LLM API key.`,
    };
  }

  /**
   * Generate multiple response suggestions
   */
  async generateSuggestions(
    conversationHistory: ChatMessage[],
    count: number = 3
  ): Promise<string[]> {
    // For now, return mock suggestions
    // In production, this would call the LLM with a specific prompt for suggestions
    
    if (this.config.provider === 'openai') {
      return this.callOpenAISuggestions(conversationHistory, count);
    }
    
    // Fallback mock suggestions
    return [
      'That sounds good!',
      'I see what you mean.',
      'Let me think about that.',
    ];
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in .env.local file.');
    }

    const model = this.config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('LLM API error:', error);
      throw error;
    }
  }

  private async callOpenAISuggestions(
    conversationHistory: ChatMessage[],
    count: number
  ): Promise<string[]> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Return mock suggestions if API key not configured
      return [
        'That sounds interesting!',
        'I understand.',
        'Tell me more.',
      ];
    }

    const model = this.config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';

    // Create a prompt specifically for generating response suggestions
    const suggestionPrompt = `Based on the conversation history, generate exactly ${count} short, natural response suggestions (2-8 words each) that a language learner might use to continue this conversation. Return ONLY a JSON array of strings, no other text.

Conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Return format: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates short, natural conversation responses in JSON format.' },
            { role: 'user', content: suggestionPrompt },
          ],
          temperature: 0.8,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        // Fallback to mock suggestions
        return [
          'That sounds interesting!',
          'I understand.',
          'Tell me more.',
        ];
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(content);
        // Handle both { suggestions: [...] } and [...] formats
        const suggestions = parsed.suggestions || parsed;
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return suggestions.slice(0, count).filter((s: any) => typeof s === 'string');
        }
      } catch {
        // If parsing fails, try to extract array from text
        const arrayMatch = content.match(/\[.*\]/);
        if (arrayMatch) {
          try {
            const parsed = JSON.parse(arrayMatch[0]);
            return parsed.slice(0, count).filter((s: any) => typeof s === 'string');
          } catch {
            // Fall through to mock suggestions
          }
        }
      }

      // Fallback to mock suggestions
      return [
        'That sounds interesting!',
        'I understand.',
        'Tell me more.',
      ];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [
        'That sounds interesting!',
        'I understand.',
        'Tell me more.',
      ];
    }
  }
}

// Export singleton instance
// Reads OPENAI_API_KEY and OPENAI_MODEL from environment variables
export const llmClient = new LLMClient({
  provider: 'openai',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
});

export default LLMClient;
