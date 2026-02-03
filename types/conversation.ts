export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedResponses?: string[]; // Only for assistant messages
}

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  theme: string; // e.g., "coffee_shop", "restaurant", "airport"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string; // target language code (e.g., "fr", "es", "de")
  initialMessage: string; // preloaded greeting from AI
  systemPrompt: string; // instructions for AI to stay on theme
  icon?: string; // optional icon/emoji for the scenario
}

export interface RoleplaySession {
  id: string;
  scenarioId: string;
  messages: ChatMessage[];
  startedAt: Date;
  language: string;
}
