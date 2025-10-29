# Add Workspace Switcher Sidebar

## Overview
Add a persistent left sidebar (Workspace Switcher) to enable navigation between different workspace modes: Calendar (current view), Projects, and Notes. The sidebar is icon-based, narrow (~60px), and expandable to show labels.

## Current Layout Structure
The app currently uses a vertical flexbox layout:
- `<div>` with `height: 100vh`, `display: flex`, `flexDirection: column`
- Header at top (fixed height)
- Week Navigation
- Main content (flex-1, calendar view)

## Design Specifications

### Visual Design
- **Width**: Fixed 60px (permanent, no collapse/expand)
- **Position**: Fixed left side, full height
- **Background**: Light background (#FAFAFA) with border-right (#E5E7EB)
- **Icons Only**: No text labels (icons are self-explanatory)
- **Icons**: Use lucide-react icons for consistency
  - 🗓 Calendar → `Calendar` icon
  - 📁 Projects → `FolderKanban` or `Folders` icon
  - 📝 Notes → `FileText` or `StickyNote` icon
- **Active State**: Highlight with brand color (#701E2E) background + 3px left border
- **Hover State**: Subtle background change (#F3F4F6)

### Responsive Behavior
- **Desktop (>1024px)**: Always visible, 60px wide
- **Tablet (768-1024px)**: Collapsible with hamburger toggle
- **Mobile (<768px)**: Hidden by default, overlay when toggled

### Accessibility
- Semantic HTML (`<nav>`, `<ul>`, `<li>`)
- ARIA labels for each button
- Keyboard navigation (Tab, Arrow keys)
- Focus indicators
- Screen reader friendly

## Implementation Steps

### 1. Create WorkspaceSwitcher Component
**File**: `src/components/WorkspaceSwitcher.jsx` (new file)

Create a component that:
- Renders a fixed-position sidebar on the left (60px wide, permanent)
- Contains navigation buttons for each workspace mode
- Shows icons only (no text labels)
- Supports active state (currently always "Calendar")
- Includes smooth transitions for hover effects
- Uses Tailwind + custom CSS for styling
- Includes proper ARIA attributes and tooltips

**Props**:
- `activeWorkspace` (string): 'calendar' | 'projects' | 'notes'
- `onWorkspaceChange` (function): Callback when clicking (currently no-op)

### 2. Update Board Layout
**File**: `src/features/board/components/Board.jsx`

Modify the layout structure:
- Change main container from `flexDirection: column` to add sidebar
- Add horizontal layout wrapper for sidebar + main content
- Adjust main content to account for sidebar width
- Import and render WorkspaceSwitcher component
- Pass `activeWorkspace='calendar'` prop

**Layout structure**:
```
<div style={{ height: '100vh', display: 'flex' }}>
  <WorkspaceSwitcher activeWorkspace="calendar" onWorkspaceChange={() => {}} />
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    {/* Existing header, week nav, main content */}
  </div>
</div>
```

### 3. Add CSS Styles
**File**: `src/index.css`

Add styles for:
- `.workspace-switcher` - Base sidebar styles
- `.workspace-switcher-item` - Navigation button styles
- `.workspace-switcher-item.active` - Active state
- `.workspace-switcher-item:hover` - Hover effects
- `.workspace-switcher-label` - Text labels (shown on hover/expand)
- Smooth transitions for all interactive elements
- Z-index management

### 4. Responsive Adjustments
**File**: `src/components/WorkspaceSwitcher.jsx` and `src/index.css`

Add responsive behavior:
- Media queries for tablet/mobile
- Toggle button for mobile view
- Overlay mode for small screens
- Adjust main content padding/margin

## Visual Design Details

### Color Scheme (Light Theme - Recommended)
- **Background**: #FAFAFA (very light gray)
- **Border**: #E5E7EB (gray-200)
- **Icon (inactive)**: #6B7280 (gray-500)
- **Icon (hover)**: #374151 (gray-700)
- **Icon (active)**: #701E2E (brand primary)
- **Active indicator**: 3px left border in #701E2E
- **Hover background**: #F3F4F6 (gray-100)

### Typography
- **Labels**: 0.875rem (14px), font-weight: 500
- **Font**: System font stack (matches app)

### Spacing & Layout
- **Item height**: 56px (3.5rem)
- **Icon size**: 24px (1.5rem)
- **Padding**: 1rem vertical, 0.75rem horizontal
- **Gap between items**: 0.25rem (4px)
- **Top padding**: 1rem (align with header)

### Transitions
- All transitions: 200ms ease-in-out
- Transform for expand/collapse
- Opacity for labels
- Background color for hover

## Component Structure

### WorkspaceSwitcher Component
```jsx
<nav className="workspace-switcher" aria-label="Workspace navigation">
  <ul>
    <li>
      <button
        className="workspace-switcher-item active"
        aria-label="Calendar view"
        aria-current="page"
        title="Calendar"
      >
        <Calendar className="workspace-icon" />
      </button>
    </li>
    <li>
      <button
        className="workspace-switcher-item"
        aria-label="Projects view"
        title="Projects"
      >
        <FolderKanban className="workspace-icon" />
      </button>
    </li>
    <li>
      <button
        className="workspace-switcher-item"
        aria-label="Notes view"
        title="Notes"
      >
        <FileText className="workspace-icon" />
      </button>
    </li>
  </ul>
</nav>
```

## Files to Create/Modify

### Create:
- `src/components/WorkspaceSwitcher.jsx` - New sidebar component

### Modify:
- `src/features/board/components/Board.jsx` - Update layout structure
- `src/index.css` - Add sidebar styles and responsive CSS

## Future Enhancements (Not Implemented Now)
- Badge/notification indicators
- Drag to reorder workspace items
- Settings/preferences at bottom of sidebar
- Custom workspace creation
- Actual navigation functionality (currently non-functional)

## Testing Checklist
- [ ] Sidebar renders correctly on desktop
- [ ] Icons are properly displayed
- [ ] Active state shows for Calendar
- [ ] Hover effects work smoothly
- [ ] No layout shifts when sidebar appears
- [ ] Main content adjusts properly
- [ ] Responsive behavior on tablet/mobile
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] No console errors or warnings

