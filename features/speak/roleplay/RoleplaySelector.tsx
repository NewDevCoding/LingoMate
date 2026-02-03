'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleplayScenario } from '@/types/conversation';

const styles = {
  Container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#161616',
    padding: '40px 24px',
  } as React.CSSProperties,

  Header: {
    marginBottom: '32px',
  } as React.CSSProperties,

  Title: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
  } as React.CSSProperties,

  Subtitle: {
    color: '#a0a0a0',
    fontSize: '16px',
    fontWeight: 400,
  } as React.CSSProperties,

  Grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,

  Card: {
    backgroundColor: '#1f1f1f',
    borderRadius: '16px',
    border: '1px solid #313131',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,

  CardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  Icon: {
    fontSize: '32px',
  } as React.CSSProperties,

  CardTitle: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 600,
    flex: 1,
  } as React.CSSProperties,

  Description: {
    color: '#a0a0a0',
    fontSize: '14px',
    lineHeight: '20px',
    marginTop: '4px',
  } as React.CSSProperties,

  Footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid #313131',
  } as React.CSSProperties,

  Difficulty: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,

  DifficultyBeginner: {
    backgroundColor: '#26c541',
    color: '#000000',
  } as React.CSSProperties,

  DifficultyIntermediate: {
    backgroundColor: '#fbbf24',
    color: '#000000',
  } as React.CSSProperties,

  DifficultyAdvanced: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  } as React.CSSProperties,

  Arrow: {
    color: '#a0a0a0',
    fontSize: '20px',
  } as React.CSSProperties,

  Loading: {
    color: '#ffffff',
    fontSize: '18px',
    textAlign: 'center' as const,
    padding: '40px',
  } as React.CSSProperties,

  Error: {
    color: '#ef4444',
    fontSize: '16px',
    textAlign: 'center' as const,
    padding: '40px',
  } as React.CSSProperties,
};

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return { ...styles.Difficulty, ...styles.DifficultyBeginner };
    case 'intermediate':
      return { ...styles.Difficulty, ...styles.DifficultyIntermediate };
    case 'advanced':
      return { ...styles.Difficulty, ...styles.DifficultyAdvanced };
    default:
      return { ...styles.Difficulty, ...styles.DifficultyBeginner };
  }
};

export default function RoleplaySelector() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<RoleplayScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roleplay/scenarios');
      if (!response.ok) {
        throw new Error('Failed to fetch scenarios');
      }
      const data = await response.json();
      setScenarios(data.scenarios || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioClick = (scenarioId: string) => {
    router.push(`/speak/roleplay/${scenarioId}`);
  };

  if (loading) {
    return (
      <div style={styles.Container}>
        <div style={styles.Loading}>Loading scenarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.Container}>
        <div style={styles.Error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={styles.Container}>
      <div style={styles.Header}>
        <h1 style={styles.Title}>Roleplay Scenarios</h1>
        <p style={styles.Subtitle}>
          Practice real-world conversations in your target language
        </p>
      </div>

      <div style={styles.Grid}>
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            style={styles.Card}
            onClick={() => handleScenarioClick(scenario.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#262626';
              e.currentTarget.style.borderColor = '#26c541';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
              e.currentTarget.style.borderColor = '#313131';
            }}
          >
            <div style={styles.CardHeader}>
              {scenario.icon && <span style={styles.Icon}>{scenario.icon}</span>}
              <h3 style={styles.CardTitle}>{scenario.title}</h3>
            </div>
            <p style={styles.Description}>{scenario.description}</p>
            <div style={styles.Footer}>
              <span style={getDifficultyStyle(scenario.difficulty)}>
                {scenario.difficulty}
              </span>
              <span style={styles.Arrow}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
