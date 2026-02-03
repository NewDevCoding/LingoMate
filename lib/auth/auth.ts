import { createClientSupabase } from '@/lib/db/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const supabase = createClientSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const supabase = createClientSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClientSupabase();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current user session
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createClientSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current authenticated user
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClientSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Reset password via email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const supabase = createClientSupabase();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });
  return { error };
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const supabase = createClientSupabase();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

/**
 * Resend email confirmation
 */
export async function resendConfirmationEmail(email: string): Promise<{ error: AuthError | null }> {
  const supabase = createClientSupabase();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${origin}/auth/login`,
    },
  });
  return { error };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const supabase = createClientSupabase();
  return supabase.auth.onAuthStateChange(callback);
}