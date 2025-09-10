# Research Phase: Weekly Task Management Web App

## Stack Analysis

### Core Stack (Given)
- React 18 + Vite
- JavaScript (no TypeScript)
- Tailwind CSS
- React Router DOM
- DnD Kit (@dnd-kit/*)
- React Markdown
- DOMPurify
- Testing: Vitest + RTL

### Investigated Areas

#### 1. Drag and Drop Implementation
- @dnd-kit/core: Base DnD functionality
- @dnd-kit/sortable: Reordering within lists
- @dnd-kit/modifiers: Grid snapping, constraints
- Key findings:
  - Built-in a11y support
  - Touch support included
  - Performance optimized
  - Coordinate transforms handled

#### 2. Markdown Security
- DOMPurify: Sanitization
- react-markdown: Rendering
- remark-gfm: GFM support
- Findings:
  - Need custom allowlist
  - GFM tables supported
  - Safe by default
  - Good performance

#### 3. localStorage Strategy
- Quota limits: ~5-10MB
- No expiry mechanism
- Versioning needed
- Findings:
  - Use schema version
  - Implement migrations
  - Handle quota errors
  - Consider compression

#### 4. Date Handling
- Israeli work week
- Timezone considerations
- Week navigation
- Findings:
  - Start week on Sunday
  - Store UTC dates
  - Use ISO strings
  - Handle DST

## Technical Decisions

1. Data Storage
   - Use single localStorage key
   - Schema versioning
   - JSON structure
   - Debounced saves

2. UI Architecture
   - Context for state
   - Grid for layout
   - Modals for editing
   - Optimistic updates

3. Performance
   - Code splitting
   - Memoization
   - Storage compression
   - Lazy loading

4. Testing Strategy
   - Unit: Utils
   - Component: UI
   - Integration: Features
   - E2E: User flows

## Open Questions [None]

## Next Steps
- Proceed with implementation
- Focus on data model first
- Then UI components
- Finally persistence
