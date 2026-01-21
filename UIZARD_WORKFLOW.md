# Uizard to React Component Workflow

## The Challenge
Uizard exports code for **individual pieces** (buttons, text, icons, etc.), not complete components. You need to assemble multiple pieces into full components.

## Step-by-Step Assembly Process

### 1. Export Individual Pieces from Uizard
For each piece in your design:
- Select the element (button, text, icon, container, etc.)
- Use **Handoff** → **React**
- Copy the code
- Note what piece it is (e.g., "Header Button", "Card Title", "Sidebar Icon")

### 2. Create a Component Structure
Create a main component file that will contain all the pieces:

```tsx
// components/MyComponent.tsx
import React from 'react';

// Piece 1: Import or define here
// Piece 2: Import or define here
// etc.

export default function MyComponent() {
  return (
    <div>
      {/* Piece 1 */}
      {/* Piece 2 */}
      {/* Piece 3 */}
    </div>
  );
}
```

### 3. Two Approaches to Organize Pieces

#### Approach A: All Pieces in One File (Simple)
Put all Uizard exports directly in one component file:

```tsx
// components/Card.tsx
import React from 'react';

// Piece 1: Card Container (from Uizard)
const cardStyles = { /* from Uizard */ } as React.CSSProperties;

// Piece 2: Card Title (from Uizard)
const titleStyles = { /* from Uizard */ } as React.CSSProperties;

// Piece 3: Card Button (from Uizard)
const buttonStyles = { /* from Uizard */ } as React.CSSProperties;

export default function Card() {
  return (
    <div style={cardStyles}>
      <h2 style={titleStyles}>Title</h2>
      <button style={buttonStyles}>Click</button>
    </div>
  );
}
```

#### Approach B: Separate Piece Files (Organized)
Create sub-components for each piece, then compose:

```
components/
  Card/
    Card.tsx          (main component)
    CardContainer.tsx (piece 1 from Uizard)
    CardTitle.tsx     (piece 2 from Uizard)
    CardButton.tsx    (piece 3 from Uizard)
```

### 4. Assembly Workflow

1. **List all pieces** you need from your Uizard design
   - Example: Sidebar needs: Container, Logo, Nav Items, Upgrade Card

2. **Export each piece** from Uizard one by one

3. **Create the main component file**

4. **Paste each piece** into the component, maintaining the structure:
   ```tsx
   export default function Sidebar() {
     return (
       <div style={containerStyles}>  {/* Piece 1: Container */}
         <div style={logoStyles}>      {/* Piece 2: Logo */}
           Logo
         </div>
         <div style={navStyles}>       {/* Piece 3: Nav */}
           {/* nav items */}
         </div>
         <div style={cardStyles}>      {/* Piece 4: Upgrade Card */}
           Card content
         </div>
       </div>
     );
   }
   ```

5. **Adjust positioning/layout** - Uizard exports might need spacing adjustments

6. **Connect pieces together** - Make sure nested elements are properly structured

## Example: Building a Sidebar from Pieces

Let's say Uizard gives you these pieces:
- Sidebar Container
- Logo Text
- Nav Item (one item)
- Upgrade Card

```tsx
// components/Sidebar.tsx
import React from 'react';

// Piece 1: Container (from Uizard export)
const containerStyles = {
  width: '279px',
  height: '900px',
  backgroundColor: '#161616',
  // ... rest from Uizard
} as React.CSSProperties;

// Piece 2: Logo (from Uizard export)
const logoStyles = {
  fontSize: '24px',
  fontWeight: 'bold',
  // ... rest from Uizard
} as React.CSSProperties;

// Piece 3: Nav Item (from Uizard export - you'll repeat this)
const navItemStyles = {
  padding: '12px',
  // ... rest from Uizard
} as React.CSSProperties;

// Piece 4: Upgrade Card (from Uizard export)
const cardStyles = {
  backgroundColor: '#10B981',
  // ... rest from Uizard
} as React.CSSProperties;

export default function Sidebar() {
  return (
    <div style={containerStyles}>
      {/* Logo piece */}
      <div style={logoStyles}>LingoMate</div>
      
      {/* Nav items - repeat the nav item piece */}
      <div style={navItemStyles}>Dashboard</div>
      <div style={navItemStyles}>Reader</div>
      <div style={navItemStyles}>Vocabulary</div>
      
      {/* Upgrade card piece */}
      <div style={cardStyles}>
        Upgrade to Pro
      </div>
    </div>
  );
}
```

## Tips for Assembly

1. **Export in order**: Start with the outermost container, then work inward
2. **Keep Uizard open**: Reference the design to see how pieces relate
3. **Note positioning**: Uizard exports include positioning - you may need to adjust for flexbox/grid
4. **Reuse pieces**: If you have multiple buttons, export one and reuse it
5. **Test incrementally**: Add one piece at a time and check it renders

## Quick Checklist

- [ ] List all pieces needed from Uizard design
- [ ] Export each piece from Uizard (Handoff → React)
- [ ] Create main component file
- [ ] Paste container piece first
- [ ] Add child pieces in correct order
- [ ] Adjust spacing/positioning
- [ ] Convert to Tailwind (optional) or keep inline styles
- [ ] Test the assembled component
