# Component Assembler Guide

## Quick Reference: How to Combine Uizard Pieces

### Step 1: Export Checklist
Before starting, list what you need:
```
Component: Sidebar
Pieces needed:
  [ ] Container/Background
  [ ] Logo
  [ ] Nav Item (export one, reuse)
  [ ] Upgrade Card
  [ ] Any icons
```

### Step 2: Create Component File
```bash
# Create new component
touch components/YourComponent.tsx
```

### Step 3: Assembly Pattern

```tsx
import React from 'react';

// ============================================
// PIECE 1: Container (export from Uizard)
// ============================================
const containerStyles = {
  // Paste styles from Uizard export here
} as React.CSSProperties;

// ============================================
// PIECE 2: First Child Element
// ============================================
const child1Styles = {
  // Paste styles from Uizard export here
} as React.CSSProperties;

// ============================================
// PIECE 3: Second Child Element
// ============================================
const child2Styles = {
  // Paste styles from Uizard export here
} as React.CSSProperties;

// ============================================
// ASSEMBLED COMPONENT
// ============================================
export default function YourComponent() {
  return (
    <div style={containerStyles}>
      <div style={child1Styles}>
        {/* Content from Uizard */}
      </div>
      <div style={child2Styles}>
        {/* Content from Uizard */}
      </div>
    </div>
  );
}
```

### Step 4: Common Adjustments Needed

**Positioning**: Uizard may export `position: absolute` with `top/left`. You might need to:
- Remove absolute positioning if using flexbox/grid
- Adjust values for your layout

**Spacing**: Check margins/padding match the design

**Nesting**: Make sure child elements are properly nested

### Step 5: Reusing Pieces

If you have multiple similar items (like nav items):

```tsx
// Export ONE nav item from Uizard
const navItemStyles = { /* from Uizard */ } as React.CSSProperties;

// Reuse it multiple times
export default function Sidebar() {
  const navItems = ['Dashboard', 'Reader', 'Vocabulary'];
  
  return (
    <div style={containerStyles}>
      {navItems.map(item => (
        <div key={item} style={navItemStyles}>
          {item}
        </div>
      ))}
    </div>
  );
}
```
