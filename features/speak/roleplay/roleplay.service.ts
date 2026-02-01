import { RoleplayScenario, ChatMessage, RoleplaySession } from '@/types/conversation';

/**
 * Mock scenarios - In production, these would come from a database
 */
const MOCK_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'coffee-shop',
    title: 'Pedir Café en una Cafetería',
    description: 'Practica pidiendo tu café y pasteles favoritos',
    theme: 'coffee_shop',
    difficulty: 'beginner',
    language: 'es',
    initialMessage: '¡Hola! Soy Emma, tu profesora de idiomas personal con IA. Pregúntame lo que quieras o haz clic en uno de los temas a continuación:',
    systemPrompt: 'You are a friendly barista at a Spanish coffee shop. Help the customer order coffee and pastries. Keep the conversation focused on ordering, asking about preferences, and making recommendations. Use simple, beginner-friendly Spanish.',
    icon: '☕',
  },
  {
    id: 'restaurant',
    title: 'Cenar en un Restaurante',
    description: 'Ordena comida, pregunta sobre el menú y maneja situaciones en restaurantes',
    theme: 'restaurant',
    difficulty: 'intermediate',
    language: 'es',
    initialMessage: '¡Buenas noches! Bienvenido al restaurante. Soy su mesero. ¿Qué desea ordenar?',
    systemPrompt: 'You are a professional waiter at a Spanish restaurant. Help the customer with the menu, take their order, answer questions about dishes, and handle typical restaurant interactions. Use intermediate-level Spanish.',
    icon: '🍽️',
  },
  {
    id: 'airport',
    title: 'En el Aeropuerto',
    description: 'Navega por el check-in, seguridad y procedimientos de embarque',
    theme: 'airport',
    difficulty: 'intermediate',
    language: 'es',
    initialMessage: '¡Buenos días! Puedo ayudarle con su registro. ¿Tiene su pasaporte?',
    systemPrompt: 'You are an airport staff member helping passengers. Guide them through check-in, security questions, finding gates, and boarding. Use intermediate-level Spanish with travel-related vocabulary.',
    icon: '✈️',
  },
  {
    id: 'hotel',
    title: 'Check-in en el Hotel',
    description: 'Haz el check-in, pregunta sobre las comodidades y maneja solicitudes del hotel',
    theme: 'hotel',
    difficulty: 'beginner',
    language: 'es',
    initialMessage: '¡Buenos días! Bienvenido a nuestro hotel. ¿Tiene una reserva?',
    systemPrompt: 'You are a hotel receptionist. Help guests check in, explain hotel amenities, answer questions about the room, and handle requests. Use beginner-friendly Spanish.',
    icon: '🏨',
  },
  {
    id: 'shopping',
    title: 'Comprar Ropa',
    description: 'Navega, prueba y compra artículos de ropa',
    theme: 'shopping',
    difficulty: 'intermediate',
    language: 'es',
    initialMessage: '¡Buenos días! Bienvenido a nuestra tienda. ¿Busca algo en particular?',
    systemPrompt: 'You are a friendly salesperson at a clothing store. Help the customer find clothes, suggest sizes, handle try-ons, and complete purchases. Use intermediate-level Spanish with fashion vocabulary.',
    icon: '🛍️',
  },
  {
    id: 'doctor',
    title: 'Cita con el Médico',
    description: 'Describe síntomas, entiende diagnósticos y discute tratamientos',
    theme: 'doctor',
    difficulty: 'advanced',
    language: 'es',
    initialMessage: 'Buenos días, siéntese por favor. ¿Qué le trae por aquí hoy?',
    systemPrompt: 'You are a doctor conducting a medical consultation. Ask about symptoms, provide diagnoses, explain treatments, and give medical advice. Use advanced Spanish with medical terminology.',
    icon: '🏥',
  },
];

/**
 * Get all available roleplay scenarios
 */
export async function getScenarios(): Promise<RoleplayScenario[]> {
  // In production, this would fetch from database
  // For now, return mock data
  return Promise.resolve(MOCK_SCENARIOS);
}

/**
 * Get a specific scenario by ID
 */
export async function getScenarioById(id: string): Promise<RoleplayScenario | null> {
  const scenarios = await getScenarios();
  return scenarios.find(s => s.id === id) || null;
}

/**
 * Create a new roleplay session
 */
export function createSession(scenarioId: string, language: string): RoleplaySession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    scenarioId,
    messages: [],
    startedAt: new Date(),
    language,
  };
}

/**
 * Add a message to a session
 */
export function addMessage(
  session: RoleplaySession,
  role: 'user' | 'assistant',
  content: string,
  suggestedResponses?: string[]
): RoleplaySession {
  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
    ...(suggestedResponses && { suggestedResponses }),
  };

  return {
    ...session,
    messages: [...session.messages, newMessage],
  };
}
