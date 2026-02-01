'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import ChatWindow from '@/features/reader/ChatWindow';
import TopHeader from './TopHeader';
import { SidebarProvider, useSidebar } from './SidebarContext';

const styles = {
  Screen: {
    backgroundColor: '#161616',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'row' as const,
    overflowX: 'hidden' as const,
  } as React.CSSProperties,
  
  SidebarWrapper: {
    flexShrink: 0,
    position: 'relative' as const,
  } as React.CSSProperties,
  
  MainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowX: 'hidden' as const,
    minWidth: 0, // Prevents flex items from overflowing
    paddingTop: '100px', // Accommodate top header
  } as React.CSSProperties,

  MainContentWithFixedSidebar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowX: 'hidden' as const,
    minWidth: 0,
    paddingTop: '100px',
    marginLeft: '279px', // Sidebar width when expanded
    transition: 'margin-left 0.3s ease',
  } as React.CSSProperties,
};

const chatBubbleStyles = {
  ChatBubble: {
    position: 'fixed' as const,
    bottom: '100px',
    right: '24px',
    width: '56px',
    height: '56px',
    backgroundColor: '#8b5cf6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    zIndex: 1001,
  } as React.CSSProperties,
};

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();
  
  // Pages where sidebar should be fixed
  const fixedSidebarPages = ['/reader', '/vocabulary', '/speak/roleplay'];
  const isFixedSidebar = fixedSidebarPages.some(page => pathname?.startsWith(page));

  return (
    <>
      <TopHeader />
      <div style={styles.Screen}>
        <div style={styles.SidebarWrapper}>
          <Sidebar 
            isCollapsed={isCollapsed} 
            onToggle={() => setIsCollapsed(!isCollapsed)}
            isFixed={isFixedSidebar}
          />
        </div>
        <div style={isFixedSidebar ? {
          ...styles.MainContentWithFixedSidebar,
          marginLeft: isCollapsed ? '80px' : '279px',
        } : styles.MainContent}>
          {children}
        </div>
      </div>

      <div
        style={chatBubbleStyles.ChatBubble}
        onClick={() => setIsChatOpen(!isChatOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
        }}
      >
        {isChatOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </div>

      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
