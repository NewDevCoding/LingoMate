'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

const styles = {
  Screen: {
    backgroundColor: '#161616',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'row' as const,
  } as React.CSSProperties,
  
  SidebarWrapper: {
    flexShrink: 0,
    position: 'relative' as const,
  } as React.CSSProperties,
  
  MainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={styles.Screen}>
      <div style={styles.SidebarWrapper}>
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>
      <div style={styles.MainContent}>
        {children}
      </div>
    </div>
  );
}
