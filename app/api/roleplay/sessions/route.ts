import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSession, getUserSessions, getLatestSessionForScenario } from '@/features/speak/roleplay/roleplay-session.service';

/**
 * GET /api/roleplay/sessions
 * Get all sessions for the current user, or get latest session for a scenario
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Check if scenarioId is provided in query params
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');
    
    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // If scenarioId is provided, get latest session for that scenario
      if (scenarioId) {
        const latestSession = await getLatestSessionForScenario(user.id, scenarioId);
        return NextResponse.json({ session: latestSession });
      }

      // Otherwise, get all sessions
      const sessions = await getUserSessions(user.id);
      return NextResponse.json({ sessions });
    }

    // For anonymous users, we can't check for existing sessions server-side
    // The client will need to handle this differently
    // For now, return null for scenario lookup
    if (scenarioId) {
      return NextResponse.json({ session: null });
    }
    return NextResponse.json({ sessions: [] });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/roleplay/sessions
 * Create a new session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId, language } = body;

    if (!scenarioId || !language) {
      return NextResponse.json(
        { error: 'scenarioId and language are required' },
        { status: 400 }
      );
    }

    // Get user from Supabase auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      // For development, allow creating sessions without auth
      // Generate a proper UUID for anonymous users
      // Note: This requires the database schema to allow NULL user_id or remove the foreign key constraint
      const { randomUUID } = await import('crypto');
      const anonymousUserId = randomUUID();
      const sessionId = await createSession(anonymousUserId, scenarioId, language);
      return NextResponse.json({ sessionId });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionId = await createSession(user.id, scenarioId, language);
    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
