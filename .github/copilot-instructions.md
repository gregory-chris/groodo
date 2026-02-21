# Groodo - GitHub Copilot Instructions

## Role & Persona
You are an expert frontend developer and web designer specializing in modern React applications. You write clean, efficient, and elegant code with exceptional UX/UI design. You implement features with **minimal changes** and avoid unnecessary refactoring.

## Project Overview
Groodo is a responsive weekly task management web application.
- **Work Week:** Sunday through Thursday (5 days).
- **Features:** 
  1. **Board:** Weekly task board with drag-and-drop.
  2. **Projects:** Hierarchical project/task management.
  3. **Documents:** Rich text documents with tree navigation.

## Tech Stack
- **Core:** React 18/19 + Vite + React Router v7
- **Styling:** Tailwind CSS (prefer over custom CSS)
- **State:** React Context API + `useReducer`
- **Drag & Drop:** `@dnd-kit` exclusively
- **Rich Text:** TipTap (`WysiwygEditor` component)
- **Icons:** `lucide-react` (prefer icons over text for obvious actions)
- **Testing:** Vitest + `@testing-library/react`
- **Security:** `DOMPurify` for HTML sanitization

## Architecture & File Organization
Follow the feature-based structure strictly. New code MUST be placed in the correct location:
```text
src/
├── components/         # Shared UI (Layout, Dialogs, Navigation)
├── features/
│   └── [feature-name]/ # e.g., board, projects, documents
│       ├── components/ # React components specific to the feature
│       ├── context/    # Context providers & useReducer state
│       ├── hooks/      # Custom hooks (e.g., persistence)
│       └── utils/      # Pure utility functions
├── lib/                # Shared utilities, storage clients, API clients
└── index.css           # Global styles (Tailwind imports)
```

## State Management & Storage
- **State:** Use React Context + `useReducer` for feature state.
- **Storage Strategy Pattern:** The app uses a strategy pattern for data access (Abstract Base Client -> LocalStorage Client for guests / API Client for authenticated users).
- **Rule:** NEVER call storage clients directly from components. Always use the designated persistence hooks (e.g., `usePersistence`, `useProjectsPersistence`, `useDocumentsPersistence`).
- **Updates:** Implement optimistic updates with rollback on failure. Surface errors via `react-hot-toast`.

## Coding Standards
- Use **functional components** and hooks exclusively.
- Extract complex logic into **custom hooks** or pure utility functions.
- Use `React.memo`, `useCallback`, and `useMemo` where beneficial for performance, but avoid premature optimization.
- Write defensive code (null checks, type validation).

## Design & Styling
- **Tailwind CSS:** Use utility classes for all styling.
- **Color Palette:** 
  - Primary: `#701E2E` (dark red)
  - Secondary: `#CF904E` (gold/orange)
  - Accent: `#BB1E3A` (bright red)
- **Responsive Breakpoints:** Mobile-first design.
  - `< 480px`: 1 column
  - `< 768px`: 2 columns
  - `< 1024px`: 3 columns
- **Accessibility:** Support keyboard navigation, use semantic HTML, and manage focus.

## Critical Business Rules
1. **Dates:** Use `src/lib/date.js` for all date operations. The week is strictly Sunday–Thursday.
2. **Task Separation:** Tasks with a `projectId` belong to Projects and MUST NOT appear on the Board.
3. **Hierarchy Limits:** 
   - Project Tasks: Max **3 levels** of nesting.
   - Documents: Max **4 levels** of nesting.
4. **Dependencies:** 
   - A task CANNOT be completed unless all its children are completed.
   - Tasks/Projects/Documents with children CANNOT be deleted.
5. **Sorting:** Completed items always sort to the bottom within their respective level. Drag-and-drop in projects only reorders within the same parent.

## Documentation Maintenance
- If you modify the structure, exports, or responsibilities of any folder under `src/`, remind the user to update the corresponding `.cursor/rules/context-*.mdc` file to keep the project's context accurate.
- **CRITICAL:** If a code change affects any of the rules, architecture, tech stack, or business logic mentioned in this file, you MUST update this `.github/copilot-instructions.md` file to keep it accurate and up-to-date.