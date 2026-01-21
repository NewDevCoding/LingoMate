'use client';

import React from 'react';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = {
  Wrapper: {
    position: 'fixed' as const,
    bottom: '100px',
    right: '24px',
    width: '400px',
    height: '600px',
    zIndex: 1000,
    pointerEvents: 'none' as const,
  } as React.CSSProperties,

  Container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1f1f1f',
    borderRadius: '16px',
    border: '1px solid #313131',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column' as const,
    opacity: 1,
    transform: 'translateY(0) scale(1)',
    transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
    pointerEvents: 'auto' as const,
  } as React.CSSProperties,

  ContainerHidden: {
    opacity: 0,
    transform: 'translateY(20px) scale(0.95)',
    pointerEvents: 'none' as const,
  } as React.CSSProperties,

  Header: {
    padding: '20px',
    borderBottom: '1px solid #313131',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  HeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  Logo: {
    width: '32px',
    height: '32px',
    backgroundColor: '#26c541',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
  } as React.CSSProperties,

  HeaderTitle: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 600,
  } as React.CSSProperties,

  MenuButton: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  Content: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  } as React.CSSProperties,

  MessageBubble: {
    backgroundColor: '#262626',
    borderRadius: '12px',
    padding: '12px 16px',
    maxWidth: '85%',
    alignSelf: 'flex-start',
  } as React.CSSProperties,

  MessageText: {
    color: '#ffffff',
    fontSize: '14px',
    lineHeight: '20px',
    margin: 0,
  } as React.CSSProperties,

  QuickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  } as React.CSSProperties,

  QuickActionButton: {
    backgroundColor: '#262626',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  InputContainer: {
    padding: '16px 20px',
    borderTop: '1px solid #313131',
  } as React.CSSProperties,

  InputWrapper: {
    position: 'relative' as const,
    marginBottom: '8px',
  } as React.CSSProperties,

  Input: {
    width: '100%',
    backgroundColor: '#161616',
    border: '1px solid #313131',
    borderRadius: '8px',
    padding: '12px 16px 12px 40px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  SearchIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a0a0a0',
    pointerEvents: 'none' as const,
  } as React.CSSProperties,

  InputIcons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
  } as React.CSSProperties,

  IconButton: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  GreenIcon: {
    width: '24px',
    height: '24px',
    backgroundColor: '#26c541',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
  } as React.CSSProperties,

  Footer: {
    padding: '12px 20px',
    borderTop: '1px solid #313131',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  } as React.CSSProperties,

  FooterText: {
    color: '#a0a0a0',
    fontSize: '11px',
  } as React.CSSProperties,

  FooterLogo: {
    color: '#a0a0a0',
    fontSize: '11px',
    fontWeight: 600,
  } as React.CSSProperties,

};

const quickActions = [
  'Knowledge Base',
  'Help Videos',
  'Community Forum',
  'Request a Feature',
  'Share Feedback',
  "What's New",
];

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  return (
    <>
      <style>{`
        input::placeholder {
          color: #666666;
        }
      `}</style>
      <div style={styles.Wrapper}>
      <div
        style={{
          ...styles.Container,
          ...(isOpen ? {} : styles.ContainerHidden),
        }}
      >
        <div style={styles.Header}>
          <div style={styles.HeaderLeft}>
            <div style={styles.Logo}>LM</div>
            <h3 style={styles.HeaderTitle}>LingoMate Support</h3>
          </div>
          <button
            style={styles.MenuButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>

        <div style={styles.Content}>
          <div style={styles.MessageBubble}>
            <p style={styles.MessageText}>Hi there! How can we help? 👋</p>
          </div>

          <div style={styles.QuickActionsGrid}>
            {quickActions.map((action) => (
              <button
                key={action}
                style={styles.QuickActionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#313131';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#262626';
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.InputContainer}>
          <div style={styles.InputWrapper}>
            <svg
              style={styles.SearchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Ask us anything..."
              style={styles.Input}
              disabled
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <div style={styles.GreenIcon}>G</div>
            </div>
          </div>
          <div style={styles.InputIcons}>
            <button style={styles.IconButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-6 0v4" />
                <rect x="2" y="9" width="20" height="12" rx="2" />
                <path d="M12 15v.01" />
              </svg>
            </button>
            <button style={styles.IconButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div style={styles.Footer}>
          <span style={styles.FooterText}>Powered by</span>
          <span style={styles.FooterLogo}>Helply</span>
        </div>
      </div>
    </div>
    </>
  );
}
