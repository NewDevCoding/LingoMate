'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Don't auto-redirect - user needs to confirm email first
        // They'll be redirected after confirming and logging in
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
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
          Create Account
        </h1>
        <p style={{
          color: '#888',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          Start your language learning journey
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
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#1f3f1f',
            border: '1px solid #44ff44',
            color: '#88ff88',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            Account created! Please check your email to confirm your account before signing in.
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

          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            disabled={loading || success}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading || success ? '#555' : '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || success ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '20px',
            }}
          >
            {loading ? 'Creating account...' : success ? 'Account created!' : 'Sign Up'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#888',
        }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{
            color: '#8b5cf6',
            textDecoration: 'none',
            fontWeight: '500',
          }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}