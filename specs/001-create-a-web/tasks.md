# Implementation Tasks: Weekly Task Management Web App

**Branch**: `001-create-a-web` | **Date**: September 10, 2025

## Overview

Tasks are organized into phases with clear dependencies. Tasks marked with [P] can be executed in parallel with other [P] tasks in the same phase.

Each task includes:
- Clear acceptance criteria
- Files to modify/create
- Test requirements
- Dependencies on other tasks

## Phase 1: Project Setup

### T001: Initialize Project [P]
**Files**: `/`
**Dependencies**: None
```bash
npm create vite@latest groodo -- --template react
cd groodo
git init
git checkout -b 001-create-a-web
```
✓ When:
- [x] Project created with Vite + React
- [x] Git initialized with correct branch

### T002: Install Dependencies [P]
**Files**: `package.json`
**Dependencies**: T001
```bash
npm i react-router-dom@6 @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers \
      lucide-react react-markdown remark-gfm dompurify

npm i -D tailwindcss postcss autoprefixer \
         vitest jsdom @testing-library/react @testing-library/jest-dom \
         eslint eslint-plugin-react eslint-plugin-react-hooks \
         eslint-plugin-react-refresh prettier
```
✓ When:
- [x] All dependencies install successfully
- [x] package.json includes correct versions

### T003: Configure Development Tools [P]
**Files**: 
- `tailwind.config.js`
- `postcss.config.js`
- `.eslintrc.cjs`
- `.prettierrc`
- `vite.config.js`
**Dependencies**: T002
✓ When:
- [x] Tailwind configured with content paths
- [x] ESLint set up with React plugins
- [x] Prettier configured
- [x] Vitest configured in Vite

## Phase 2: Core Utils & Models

### T004: Implement Storage Module [P]
**Files**:
- `src/lib/storage.js`
- `src/lib/storage.test.js`
**Dependencies**: T001
✓ When:
- [x] Tests written first (RED)
- [x] saveState/loadState implemented
- [x] Version migration handling
- [x] Quota error handling
- [x] Tests passing (GREEN)

### T005: Implement Date Utils [P]
**Files**:
- `src/lib/date.js`
- `src/lib/date.test.js`
**Dependencies**: T001
✓ When:
- [x] Tests written first (RED)
- [x] Week calculation for Sun-Thu
- [x] Today highlighting logic
- [x] Timezone handling
- [x] Tests passing (GREEN)

### T006: Create Board Context [P]
**Files**:
- `src/features/board/context/BoardContext.jsx`
- `src/features/board/context/BoardContext.test.jsx`
**Dependencies**: T004, T005
✓ When:
- [x] Tests written first (RED)
- [x] Context provider created
- [x] State management implemented
- [x] Action handlers defined
- [x] Tests passing (GREEN)

## Phase 3: UI Components - Basic Structure

### T007: Create Layout Components [P]
**Files**:
- `src/components/Layout/index.jsx`
- `src/components/Layout/Header.jsx`
- `src/components/Layout/Footer.jsx`
**Dependencies**: T003
✓ When:
- [x] Layout structure implemented
- [x] Header/Footer styled with Tailwind
- [x] Responsive design working

### T008: Implement Week Navigation [P]
**Files**:
- `src/features/board/components/WeekNav.jsx`
- `src/features/board/components/WeekNav.test.jsx`
**Dependencies**: T005, T006
✓ When:
- [x] Tests written first (RED)
- [x] Previous/Next week buttons
- [x] Today button
- [x] Week range display
- [x] Tests passing (GREEN)

### T009: Create Column Component [P]
**Files**:
- `src/features/board/components/Column.jsx`
- `src/features/board/components/Column.test.jsx`
**Dependencies**: T003, T006
✓ When:
- [x] Tests written first (RED)
- [x] Column layout implemented
- [x] Date/title display working
- [x] Today highlighting
- [x] Tests passing (GREEN)

## Phase 4: Task Management Components

### T010: Create Task Card Component [P]
**Files**:
- `src/features/board/components/TaskCard.jsx`
- `src/features/board/components/TaskCard.test.jsx`
**Dependencies**: T003, T006
✓ When:
- [ ] Tests written first (RED)
- [ ] Card layout with Tailwind
- [ ] Checkbox implementation
- [ ] Delete button
- [ ] Double-click handler
- [ ] Tests passing (GREEN)

### T011: Implement Task Modal [P]
**Files**:
- `src/features/board/components/TaskModal.jsx`
- `src/features/board/components/TaskModal.test.jsx`
**Dependencies**: T003, T006
✓ When:
- [ ] Tests written first (RED)
- [ ] Modal with form fields
- [ ] Markdown editor
- [ ] Preview with sanitization
- [ ] Save/cancel handlers
- [ ] Tests passing (GREEN)

## Phase 5: Drag and Drop Integration

### T012: Set Up DND Context
**Files**:
- `src/features/board/components/DragProvider.jsx`
- `src/features/board/components/DragProvider.test.jsx`
**Dependencies**: T006, T009, T010
✓ When:
- [ ] Tests written first (RED)
- [ ] DndContext configured
- [ ] Sortable context added
- [ ] Drop handlers implemented
- [ ] Tests passing (GREEN)

### T013: Add Drag to TaskCard
**Files**: `src/features/board/components/TaskCard.jsx`
**Dependencies**: T010, T012
✓ When:
- [ ] useSortable hook integrated
- [ ] Drag handle added
- [ ] Animation working
- [ ] A11y attributes added

### T014: Column Drop Zones
**Files**: `src/features/board/components/Column.jsx`
**Dependencies**: T009, T012
✓ When:
- [ ] Drop zone configured
- [ ] Visual feedback on drag
- [ ] Order persistence
- [ ] A11y announcements

## Phase 6: Data Integration

### T015: Persistence Integration
**Files**: 
- `src/features/board/context/BoardContext.jsx`
- `src/features/board/hooks/usePersistence.js`
**Dependencies**: T004, T006
✓ When:
- [ ] Auto-save implemented
- [ ] Load on startup
- [ ] Error handling
- [ ] Migration working

### T016: Week Navigation Logic
**Files**: `src/features/board/hooks/useWeekNavigation.js`
**Dependencies**: T005, T008
✓ When:
- [ ] Week calculations correct
- [ ] Navigation working
- [ ] Today detection accurate
- [ ] Timezone handling verified

## Phase 7: Polish & Deploy

### T017: Accessibility Improvements [P]
**Files**: Various
**Dependencies**: All UI components
✓ When:
- [ ] ARIA labels added
- [ ] Keyboard navigation working
- [ ] Focus management fixed
- [ ] Screen reader tested

### T018: Performance Optimization [P]
**Files**: Various
**Dependencies**: All components
✓ When:
- [ ] Code splitting implemented
- [ ] Memoization added
- [ ] Storage debounced
- [ ] Lighthouse score >90

### T019: Error Boundaries [P]
**Files**: 
- `src/components/ErrorBoundary.jsx`
- `src/features/board/components/BoardErrorBoundary.jsx`
**Dependencies**: All components
✓ When:
- [ ] Error boundaries added
- [ ] Storage errors handled
- [ ] Recovery working
- [ ] User feedback clear

### T020: Deployment Setup [P]
**Files**:
- `vercel.json` or `netlify.toml`
- `README.md`
**Dependencies**: None
✓ When:
- [ ] Build process verified
- [ ] Redirects configured
- [ ] Documentation complete
- [ ] Deploy successful

## Parallel Execution Groups

Group 1 [P]:
- T001: Initialize Project
- T002: Install Dependencies
- T003: Configure Tools

Group 2 [P]:
- T004: Storage Module
- T005: Date Utils
- T006: Board Context

Group 3 [P]:
- T007: Layout Components
- T008: Week Navigation
- T009: Column Component
- T010: Task Card
- T011: Task Modal

Group 4 [P]:
- T017: A11y Improvements
- T018: Performance Optimization
- T019: Error Boundaries
- T020: Deployment Setup

## Critical Path (Sequential)
T001 → T004 → T006 → T012 → T013 → T014 → T015 → T016

## Getting Started

1. Begin with T001-T003 in parallel
2. Then tackle T004-T006 in parallel
3. UI components T007-T011 can be built in parallel
4. DND integration must follow sequence T012 → T013 → T014
5. Complete data integration T015-T016
6. Polish tasks T017-T020 can be done in parallel
