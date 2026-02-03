import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

/**
 * Client-side Supabase client (for use in React components)
 * This client automatically handles auth state and cookies
 */
export function createClientSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Legacy client for backward compatibility
 * @deprecated Use createClientSupabase() for client-side or createServerSupabase() from '@/lib/db/server' for server-side
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
