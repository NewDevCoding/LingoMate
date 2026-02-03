import { createServerSupabase } from '@/lib/db/server';
import type { User } from '@supabase/supabase-js';

/**
 * Get the authenticated user from server-side context (API routes, server components)
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Get the authenticated user from a request (for API routes)
 * Extracts the auth token from the Authorization header
 */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}