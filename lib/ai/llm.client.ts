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
    count: number = 3,
    options?: {
      language?: string;
      scenario?: {
        title: string;
        theme: string;
        difficulty: string;
      };
    }
  ): Promise<string[]> {
    // For now, return mock suggestions
    // In production, this would call the LLM with a specific prompt for suggestions
    
    if (this.config.provider === 'openai') {
      return this.callOpenAISuggestions(conversationHistory, count, options);
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
    count: number,
    options?: {
      language?: string;
      scenario?: {
        title: string;
        theme: string;
        difficulty: string;
      };
    }
  ): Promise<string[]> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Return mock suggestions if API key not configured
      const language = options?.language || 'es';
      const mockSuggestions: Record<string, string[]> = {
        'es': ['Eso suena interesante!', 'Entiendo.', 'Cuéntame más.'],
        'en': ['That sounds interesting!', 'I understand.', 'Tell me more.'],
        'fr': ['Cela semble intéressant!', 'Je comprends.', 'Dis-moi en plus.'],
      };
      return mockSuggestions[language] || mockSuggestions['es'];
    }

    const model = this.config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const language = options?.language || 'es';
    const languageName = language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'English';

    // Build scenario context if available
    let scenarioContext = '';
    if (options?.scenario) {
      scenarioContext = `\nSCENARIO: ${options.scenario.title} (${options.scenario.theme})\nDIFFICULTY: ${options.scenario.difficulty}\n`;
    }

    // Create a prompt specifically for generating response suggestions
    const suggestionPrompt = `You are helping a language learner practice ${languageName}. Based on the conversation history, generate exactly ${count} DIFFERENT, short, natural response suggestions (2-8 words each) in ${languageName} that a language learner might use to continue this conversation naturally.${scenarioContext}

IMPORTANT:
- All suggestions MUST be in ${languageName} (not English)
- Each suggestion should be DIFFERENT from the others
- Keep suggestions short and natural (2-8 words)
- Make them appropriate for the conversation context
- Vary the suggestions (don't repeat similar phrases)

Conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Return ONLY a JSON array of strings in ${languageName}, no other text.
Format: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

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
          temperature: 0.9, // Higher temperature for more variety in suggestions
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
