'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { resendConfirmationEmail } from '@/lib/auth/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Check if it's an email confirmation error
        if (error.message.includes('email') && error.message.includes('confirm')) {
          setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
        } else {
          setError(error.message);
        }
      } else {
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#161616',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#1f1f1f',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          Welcome Back
        </h1>
        <p style={{
          color: '#888',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          Sign in to continue learning
        </p>

        {error && (
          <div style={{
            backgroundColor: '#3f1f1f',
            border: '1px solid #ff4444',
            color: '#ff8888',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
            {error.includes('confirm') && (
              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending || resendSuccess}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #8b5cf6',
                    color: '#8b5cf6',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: resending || resendSuccess ? 'not-allowed' : 'pointer',
                    opacity: resending || resendSuccess ? 0.6 : 1,
                  }}
                >
                  {resending ? 'Sending...' : resendSuccess ? 'Email sent!' : 'Resend confirmation email'}
                </button>
              </div>
            )}
          </div>
        )}

        {resendSuccess && !error && (
          <div style={{
            backgroundColor: '#1f3f1f',
            border: '1px solid #44ff44',
            color: '#88ff88',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            Confirmation email sent! Please check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#555' : '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '20px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#888',
        }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{
            color: '#8b5cf6',
            textDecoration: 'none',
            fontWeight: '500',
          }}>
            Sign up
          </Link>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '16px',
        }}>
          <Link href="/auth/forgot-password" style={{
            color: '#888',
            textDecoration: 'none',
            fontSize: '14px',
          }}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}