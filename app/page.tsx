import React from 'react';
import Sidebar from '../components/Sidebar';

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
  } as React.CSSProperties,
  
  MainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
};

const Screen = () => {
  return (
    <div style={styles.Screen}>
      <div style={styles.SidebarWrapper}>
        <Sidebar />
      </div>
      <div style={styles.MainContent}>
        {/* Main content will go here */}
      </div>
    </div>
  );
};

export default Screen;
