'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isFixed?: boolean;
}

const styles = {
  // Main Sidebar Container
  SidebarContainer: (isCollapsed: boolean) => ({
    width: isCollapsed ? '80px' : '279px',
    height: '100vh',
    backgroundColor: '#161616',
    borderRadius: '24px',
    border: '1px solid #313131',
    boxSizing: 'border-box' as const,
    boxShadow: '0px 0px 10px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: isCollapsed ? '24px 12px' : '24px',
    gap: '16px',
    overflowY: 'auto' as const,
    transition: 'width 0.3s ease, padding 0.3s ease',
    position: 'relative' as const,
    alignItems: isCollapsed ? 'center' : 'stretch',
  } as React.CSSProperties),

  // Header with Logo and Toggle
  Header: (isCollapsed: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    marginBottom: '8px',
  } as React.CSSProperties),

  // Logo
  Logo: (isCollapsed: boolean) => ({
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '31px',
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 0.3s ease',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
  } as React.CSSProperties),

  // Toggle Button
  ToggleButton: {
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  // Navigation Container
  NavContainer: (isCollapsed: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    flex: 1,
    alignItems: isCollapsed ? 'center' : 'stretch',
  } as React.CSSProperties),

  // Nav Item (inactive)
  NavItem: (isCollapsed: boolean) => ({
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: '31px',
    padding: isCollapsed ? '12px' : '12px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    gap: isCollapsed ? '0' : '12px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    minWidth: isCollapsed ? '56px' : 'auto',
    width: isCollapsed ? '56px' : 'auto',
  } as React.CSSProperties),

  // Nav Item (active)
  NavItemActive: (isCollapsed: boolean) => ({
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: '31px',
    padding: isCollapsed ? '12px' : '12px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    gap: isCollapsed ? '0' : '12px',
    backgroundColor: '#26c541',
    transition: 'all 0.2s',
    textDecoration: 'none',
    minWidth: isCollapsed ? '56px' : 'auto',
    width: isCollapsed ? '56px' : 'auto',
  } as React.CSSProperties),

  // Nav Text
  NavText: (isCollapsed: boolean) => ({
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 0.3s ease',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
  } as React.CSSProperties),

  // Upgrade Card Container
  UpgradeCard: (isCollapsed: boolean) => ({
    width: '100%',
    backgroundColor: '#161616',
    borderRadius: '24px',
    border: '1px solid #313131',
    boxSizing: 'border-box' as const,
    boxShadow: '0px 0px 10px rgba(0,0,0,0.08)',
    padding: isCollapsed ? '16px 8px' : '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: isCollapsed ? 'center' : 'flex-start',
    gap: '12px',
    marginTop: 'auto',
  } as React.CSSProperties),

  // Crown Icon Container
  CrownContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '4px',
  } as React.CSSProperties,

  // Upgrade Title
  UpgradeTitle: (isCollapsed: boolean) => ({
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: '24px',
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 0.3s ease',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textAlign: 'center' as const,
  } as React.CSSProperties),

  // Upgrade Description
  UpgradeDescription: (isCollapsed: boolean) => ({
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    opacity: isCollapsed ? 0 : 0.8,
    transition: 'opacity 0.3s ease',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textAlign: 'center' as const,
  } as React.CSSProperties),

  // Green Button
  Button: (isCollapsed: boolean) => ({
    cursor: 'pointer',
    width: '100%',
    height: '43px',
    padding: '0px 8px',
    border: '0',
    boxSizing: 'border-box' as const,
    borderRadius: '24px',
    backgroundColor: '#26c541',
    color: '#000000',
    fontSize: isCollapsed ? '10px' : '14px',
    fontWeight: 800,
    lineHeight: '21px',
    outline: 'none',
    marginTop: '8px',
    transition: 'all 0.3s ease',
  } as React.CSSProperties),
};

const Sidebar = ({ isCollapsed, onToggle, isFixed = false }: SidebarProps) => {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Reader', href: '/reader' },
    { name: 'Vocabulary', href: '/vocabulary' },
    { name: 'Roleplay', href: '/speak/roleplay' },
  ];

  return (
    <div style={{
      ...styles.SidebarContainer(isCollapsed),
      ...(isFixed ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        zIndex: 999,
      } : {})
    }}>
      {/* Header with Logo and Toggle */}
      <div style={styles.Header(isCollapsed)}>
        {!isCollapsed && <div style={styles.Logo(isCollapsed)}>LingoMate</div>}
        <button
          style={styles.ToggleButton}
          onClick={onToggle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isCollapsed ? (
              // Pointing right when collapsed (to expand)
              <path d="M9 18l6-6-6-6" />
            ) : (
              // Pointing left when expanded (to collapse)
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={styles.NavContainer(isCollapsed)}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={isActive ? styles.NavItemActive(isCollapsed) : styles.NavItem(isCollapsed)}
              title={isCollapsed ? item.name : undefined}
            >
              {/* Icon */}
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                {item.name === 'Dashboard' && (
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                )}
                {item.name === 'Reader' && (
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                )}
                {item.name === 'Vocabulary' && (
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                )}
                {item.name === 'Roleplay' && (
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                )}
              </svg>
              <span style={styles.NavText(isCollapsed)}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro Card - Hidden when collapsed */}
      {!isCollapsed && (
        <div style={styles.UpgradeCard(isCollapsed)}>
          <div style={styles.CrownContainer}>
            {/* Crown Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div style={styles.UpgradeTitle(isCollapsed)}>Upgrade to Pro</div>
          <div style={styles.UpgradeDescription(isCollapsed)}>
            Unlock unlimited hearts & more !
          </div>
          <button style={styles.Button(isCollapsed)}>
            GET SUPER
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
