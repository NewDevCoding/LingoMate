'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const styles = {
  Container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,

  Logo: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '24px',
  } as React.CSSProperties,

  NavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  NavItemActive: {
    backgroundColor: '#262626',
  } as React.CSSProperties,

  NavIcon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  ActiveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#26c541',
    marginLeft: 'auto',
  } as React.CSSProperties,

  UpgradeSection: {
    marginTop: 'auto',
    padding: '20px',
    backgroundColor: '#262626',
    borderRadius: '12px',
    border: '1px solid #313131',
  } as React.CSSProperties,

  UpgradeIcon: {
    width: '32px',
    height: '32px',
    marginBottom: '12px',
  } as React.CSSProperties,

  UpgradeTitle: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
  } as React.CSSProperties,

  UpgradeDescription: {
    color: '#a0a0a0',
    fontSize: '12px',
    marginBottom: '16px',
  } as React.CSSProperties,

  UpgradeButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#26c541',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,
};

const navItems = [
  { name: 'Dashboard', href: '/', icon: 'home' },
  { name: 'My Courses', href: '/learn', icon: 'book' },
  { name: 'Vocabulary', href: '/vocabulary', icon: 'vocab' },
  { name: 'Tutors', href: '/tutors', icon: 'tutor' },
  { name: 'Community', href: '/community', icon: 'community' },
  { name: 'Shop', href: '/shop', icon: 'shop' },
];

export default function ReaderNavigation() {
  const pathname = usePathname();

  return (
    <div style={styles.Container}>
      <div style={styles.Logo}>LingoMate</div>

      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            style={{
              ...styles.NavItem,
              ...(isActive ? styles.NavItemActive : {}),
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#262626';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={styles.NavIcon}>
              {/* Icon placeholder - replace with actual icons */}
              <div style={{ width: '20px', height: '20px', backgroundColor: '#666', borderRadius: '4px' }} />
            </div>
            <span>{item.name}</span>
            {isActive && <div style={styles.ActiveDot} />}
          </Link>
        );
      })}

      <div style={styles.UpgradeSection}>
        <div style={styles.UpgradeIcon}>
          {/* Crown/Star icon placeholder */}
          <div style={{ width: '32px', height: '32px', backgroundColor: '#26c541', borderRadius: '50%' }} />
        </div>
        <div style={styles.UpgradeTitle}>Upgrade to Pro</div>
        <div style={styles.UpgradeDescription}>Unlock unlimited hearts & more !</div>
        <button
          style={styles.UpgradeButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          GET SUPER
        </button>
      </div>
    </div>
  );
}
