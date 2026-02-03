'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

const styles = {
  HeaderContainer: {
    position: 'fixed' as const,
    top: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1000,
  } as React.CSSProperties,

  HeaderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    outline: 'none',
  } as React.CSSProperties,

  FlagIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(to bottom, #aa151b 0%, #aa151b 25%, #f1bf00 25%, #f1bf00 50%, #aa151b 50%, #aa151b 75%, #f1bf00 75%, #f1bf00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  } as React.CSSProperties,

  ResourceIcon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  ProfilePicture: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    flexShrink: 0,
  } as React.CSSProperties,
};

export default function TopHeader() {
  const [selectedLanguage, setSelectedLanguage] = useState('ES');
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div style={styles.HeaderContainer}>
      {/* Language Selector */}
      <button
        style={styles.HeaderButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#262626';
          e.currentTarget.style.borderColor = '#404040';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1f1f1f';
          e.currentTarget.style.borderColor = '#313131';
        }}
      >
        <div style={styles.FlagIcon}>
          🇪🇸
        </div>
        <span>{selectedLanguage}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Resource 1 - Diamonds */}
      <button
        style={styles.HeaderButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#262626';
          e.currentTarget.style.borderColor = '#404040';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1f1f1f';
          e.currentTarget.style.borderColor = '#313131';
        }}
      >
        <div style={styles.ResourceIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#60a5fa" stroke="#60a5fa" strokeWidth="1.5">
            <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            <path d="M6 3l6 6-6 6" />
            <path d="M18 3l-6 6 6 6" />
          </svg>
        </div>
        <span>450</span>
      </button>

      {/* Resource 2 - Flames */}
      <button
        style={styles.HeaderButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#262626';
          e.currentTarget.style.borderColor = '#404040';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1f1f1f';
          e.currentTarget.style.borderColor = '#313131';
        }}
      >
        <div style={styles.ResourceIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fb923c" stroke="#fb923c" strokeWidth="1.5">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </div>
        <span>12</span>
      </button>

      {/* Profile Picture / Auth */}
      {loading ? (
        <div style={{ ...styles.ProfilePicture, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid #888', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : user ? (
        <div style={{ position: 'relative' }}>
          <div
            style={styles.ProfilePicture}
            onClick={() => setShowMenu(!showMenu)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ color: '#161616', fontSize: '18px', fontWeight: 'bold' }}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {showMenu && (
            <>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1000,
                }}
                onClick={() => setShowMenu(false)}
              />
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                backgroundColor: '#1f1f1f',
                border: '1px solid #313131',
                borderRadius: '8px',
                padding: '8px',
                minWidth: '200px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 1001,
              }}>
                <div style={{ padding: '8px 12px', color: '#ffffff', fontSize: '14px', borderBottom: '1px solid #313131', marginBottom: '4px' }}>
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ff8888',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => router.push('/auth/login')}
          style={{
            ...styles.HeaderButton,
            backgroundColor: '#8b5cf6',
            borderColor: '#8b5cf6',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed';
            e.currentTarget.style.borderColor = '#7c3aed';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#8b5cf6';
            e.currentTarget.style.borderColor = '#8b5cf6';
          }}
        >
          Sign In
        </button>
      )}
    </div>
  );
}
