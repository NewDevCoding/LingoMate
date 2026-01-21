import React from 'react';

/**
 * Component Template
 * 
 * Copy this file and rename it to your component name.
 * Replace the content with code exported from Uizard.
 * 
 * Choose one approach below:
 */

// ============================================
// APPROACH 1: Tailwind CSS (Recommended)
// ============================================
export default function ComponentTemplate() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Component Title</h2>
      <p className="text-gray-600">Component content goes here</p>
    </div>
  );
}

// ============================================
// APPROACH 2: Inline Styles (Current pattern)
// ============================================
/*
const styles = {
  Container: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  Title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
  } as React.CSSProperties,
  Content: {
    color: '#666666',
  } as React.CSSProperties,
};

export default function ComponentTemplate() {
  return (
    <div style={styles.Container}>
      <h2 style={styles.Title}>Component Title</h2>
      <p style={styles.Content}>Component content goes here</p>
    </div>
  );
}
*/
