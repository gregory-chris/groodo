You are planning implementation for the feature:
"Weekly Task Management Web App" with Sunday–Thursday columns, draggable tasks, markdown descriptions, and persistence in localStorage.

Use the attached spec (or the repo file) as the source of truth.
If available, read: @file:specs/001-create-a-web.md

Stack constraints (HARD):
- React 18, **JavaScript only** (no TypeScript)
- Vite for builds/dev/preview
- Tailwind CSS for styling
- Icons: prefer `lucide-react`; fallback `@heroicons/react` if needed
- Drag & drop: `@dnd-kit` (core + sortable + modifiers)
- Markdown rendering: `react-markdown` + `remark-gfm`
- Sanitize markdown: `dompurify`
- Routing: `react-router-dom`
- Test: Vitest + @testing-library/react + jsdom
- Lint/format: ESLint + Prettier

Non-goals:
- No TypeScript, no server-side rendering, no backend APIs, no DB (use localStorage only).

Deliverables (format exactly as below):

## Overview
- Summarize architecture: App shell, Router, Layout (Header/Footer), Week view with 6 columns (General + Sun–Thu), Task Card, Modal Editor, localStorage sync, and utilities (date/week calc, storage).
- Map each Functional Requirement **FR-001 … FR-013** from the spec to the planned component(s)/module(s).

## Milestones
Create M1–M6 with estimates (S=0.5d, M=1–2d):
- M1 Scaffold & Tooling
- M2 Tailwind & Design Tokens
- M3 Data model & localStorage
- M4 UI & DnD interactions
- M5 Markdown modal & sanitization
- M6 QA, a11y/perf, and Deploy
For each milestone: list dependencies and completion criteria tied to FR-ids.

## Work Breakdown (Tasks)
Enumerate tasks T-001…T-0XX. Each task must:
- Reference the spec FR it satisfies (e.g., “T-004 implements FR-008 drag/sort”)
- Include acceptance checks (bullet list)
- Suggest a small PR scope (≤ 200 LOC diff)

## Commands (Bash)
Provide a single copy-paste block covering:
- Vite scaffold (React + JS)
- Tailwind install & init (`tailwind.config.js`, `postcss.config.js`)
- Router, icons, DnD kit, markdown & sanitize libs
- Testing stack, ESLint + Prettier
- Useful npm scripts (dev/build/preview/lint/test)

## File/Folder Structure
Output a tree under `src/` and explain each item in 1–2 sentences:
- `src/main.jsx`, `src/App.jsx`, `src/routes/`, `src/components/`, `src/features/board/`, `src/lib/` (storage/date), `src/styles/`, etc.
Include the “General” column alongside Sun–Thu.

## Critical File Stubs (Code Blocks)
Provide minimal contents (JavaScript, not TS) for:
- `index.css` with Tailwind directives
- `tailwind.config.js` with correct content globs
- `src/App.jsx` with Router + Layout
- `src/features/board/WeekBoard.jsx` rendering 6 columns (General + Sun–Thu) with today’s column highlighted
- `src/features/board/TaskCard.jsx` and DnD integration using `@dnd-kit/sortable`
- `src/features/board/TaskModal.jsx` with textarea + live preview using `react-markdown` (sanitized via `dompurify`)
- `src/lib/storage.js` (`loadState`, `saveState`, versioned key)
- `src/lib/date.js` (helpers to compute current ISO week, start on **Sunday**, handle timezone)
- Example of importing an icon from `lucide-react`

## Data Model
Document plain JS shapes:
- Task: `{ id, title, descriptionMd, completed, columnId, order }`
- Column: `{ id, label, date? }` // `general` has no date
- Board: `{ weekStartISO, columns: Record<columnId, taskIds[]> , tasks: Record<id, Task> }`
Note: persist in localStorage; define a single storage key and a `schemaVersion`.

## localStorage & Sync Strategy
- Autosave on any mutation (debounced)
- Load on app start; migrate if `schemaVersion` differs
- Handle storage full: surface non-blocking toast and prevent further writes (ties to Edge Case in spec)

## a11y & Performance Checklist
- Landmarks, focus trap in modal, keyboard DnD fallback (arrow keys as stretch)
- Color contrast, visible focus
- Code-split route(s) if any, requestIdleCallback for initial migration
- Prefers-reduced-motion handling for drag animations

## Testing Plan
- Unit: date utils, storage
- Component: WeekBoard (renders Sun–Thu + General; highlights today)
- Interaction: DnD move persists order; modal open/close; markdown render sanitized
- Add CI commands and thresholds

## Risks & Mitigations
List 5–8 succinct items, including:
- localStorage quota (mitigate with compression or size warnings)
- Timezone/locale shifts (compute Sunday start robustly)
- Markdown XSS (sanitization + allow-list)
- DnD accessibility trade-offs
- Large descriptions affecting layout (clamp, overflow handling)

## Deployment
- Vercel and Netlify steps (SPA fallback/redirects)
- Build artifact expectations (`dist/`), environment variables (if any), cache headers

## Acceptance Criteria (Traceability)
Create a checklist that mirrors the spec’s Acceptance Scenarios (1–5) and FR-001…FR-013. Each item must link to tasks (e.g., “FR-009 ✅ via T-014, T-019”).

Constraints:
- Do NOT introduce TypeScript or server code.
- Prefer small PRs (1–3 tasks each).
- If something is ambiguous, add a “[NEEDS CLARIFICATION]” note at the top and proceed with a sensible default, clearly labeled.

Now produce the complete plan in the structure above.