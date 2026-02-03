'use client';

import React, { useState } from 'react';

export default function InitializeReviewsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/vocabulary/reviews/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize reviews');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#161616',
      padding: '48px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#1f1f1f',
        border: '1px solid #313131',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '8px',
        }}>
          Initialize Reviews
        </h1>
        <p style={{
          color: '#a0a0a0',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          This will create review entries for all vocabulary words that don't have reviews yet.
        </p>

        <button
          onClick={handleInitialize}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? '#2a2a2a' : '#26c541',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginBottom: '16px',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#22b03a';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#26c541';
            }
          }}
        >
          {loading ? 'Initializing...' : 'Initialize Reviews'}
        </button>

        {result && (
          <div style={{
            backgroundColor: '#1a3a1a',
            border: '1px solid #26c541',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px',
          }}>
            <p style={{
              color: '#26c541',
              fontSize: '14px',
              margin: 0,
            }}>
              ✅ {result.message}
            </p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#3a1a1a',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px',
          }}>
            <p style={{
              color: '#ef4444',
              fontSize: '14px',
              margin: 0,
            }}>
              ❌ {error}
            </p>
          </div>
        )}

        <p style={{
          color: '#666666',
          fontSize: '12px',
          marginTop: '24px',
          marginBottom: 0,
        }}>
          Note: This is safe to run multiple times. It will only create reviews for words that don't have them yet.
        </p>
      </div>
    </div>
  );
}
