'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const styles = {
  // Main Sidebar Container
  SidebarContainer: {
    width: '279px',
    height: '100vh',
    backgroundColor: '#161616',
    borderRadius: '24px',
    border: '1px solid #313131',
    boxSizing: 'border-box' as const,
    boxShadow: '0px 0px 10px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
    gap: '16px',
    overflowY: 'auto' as const,
  } as React.CSSProperties,

  // Logo
  Logo: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '31px',
    marginBottom: '8px',
  } as React.CSSProperties,

  // Navigation Container
  NavContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    flex: 1,
  } as React.CSSProperties,

  // Nav Item (inactive)
  NavItem: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: '31px',
    padding: '12px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.2s',
    textDecoration: 'none',
  } as React.CSSProperties,

  // Nav Item (active - Dashboard)
  NavItemActive: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: '31px',
    padding: '12px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#26c541',
    transition: 'background-color 0.2s',
    textDecoration: 'none',
  } as React.CSSProperties,

  // Upgrade Card Container
  UpgradeCard: {
    width: '100%',
    backgroundColor: '#161616',
    borderRadius: '24px',
    border: '1px solid #313131',
    boxSizing: 'border-box' as const,
    boxShadow: '0px 0px 10px rgba(0,0,0,0.08)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: 'auto',
  } as React.CSSProperties,

  // Crown Icon Container
  CrownContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  } as React.CSSProperties,

  // Upgrade Title
  UpgradeTitle: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: '24px',
  } as React.CSSProperties,

  // Upgrade Description
  UpgradeDescription: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    opacity: 0.8,
  } as React.CSSProperties,

  // Green Button
  Button: {
    cursor: 'pointer',
    width: '100%',
    height: '43px',
    padding: '0px 8px',
    border: '0',
    boxSizing: 'border-box' as const,
    borderRadius: '24px',
    backgroundColor: '#26c541',
    color: '#000000',
    fontSize: '14px',
    fontWeight: 800,
    lineHeight: '21px',
    outline: 'none',
    marginTop: '8px',
  } as React.CSSProperties,
};

const Sidebar = () => {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Reader', href: '/reader' },
    { name: 'Vocabulary', href: '/vocabulary' },
  ];

  return (
    <div style={styles.SidebarContainer}>
      {/* Logo */}
      <div style={styles.Logo}>LingoMate</div>

      {/* Navigation Items */}
      <nav style={styles.NavContainer}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={isActive ? styles.NavItemActive : styles.NavItem}
            >
              {/* Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {item.name === 'Dashboard' && (
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                )}
                {item.name === 'Reader' && (
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                )}
                {item.name === 'Vocabulary' && (
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                )}
              </svg>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro Card */}
      <div style={styles.UpgradeCard}>
        <div style={styles.CrownContainer}>
          {/* Crown Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <div style={styles.UpgradeTitle}>Upgrade to Pro</div>
        <div style={styles.UpgradeDescription}>
          Unlock unlimited hearts & more !
        </div>
        <button style={styles.Button}>
          GET SUPER
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
