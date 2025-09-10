# Quickstart Guide

## Prerequisites
- Node.js 18+
- npm 9+

## Setup

1. Clone and install:
```bash
git clone <repo-url>
cd groodo
git checkout 001-create-a-web
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser:
```
http://localhost:5173
```

## Development Workflow

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch
```

### Linting/Formatting
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Building for Production
```bash
# Create production build
npm run build

# Preview build
npm run preview
```

## Key Files

### Main Entry Points
- `src/main.jsx`: App bootstrap
- `src/App.jsx`: Router setup
- `src/features/board/components/WeekBoard.jsx`: Main board

### State Management
- `src/features/board/context/BoardContext.jsx`: Board state
- `src/lib/storage.js`: localStorage handling

### Components
- `src/features/board/components/TaskCard.jsx`: Task item
- `src/features/board/components/TaskModal.jsx`: Editor
- `src/features/board/components/Column.jsx`: Board column

## Testing

### Component Tests
```bash
# Example test
import { render, screen } from '@testing-library/react'
import { TaskCard } from './TaskCard'

test('renders task card', () => {
  render(<TaskCard title="Test" />)
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

### Integration Tests
```bash
# Example test
import { render, screen, fireEvent } from '@testing-library/react'
import { BoardProvider } from '../context/BoardContext'
import { WeekBoard } from './WeekBoard'

test('adds new task', async () => {
  render(
    <BoardProvider>
      <WeekBoard />
    </BoardProvider>
  )
  
  fireEvent.click(screen.getByText('Add Task'))
  // ... complete the test
})
```

## Deployment

### Vercel
1. Connect repository
2. Use following settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Netlify
1. Connect repository
2. Use following settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add `_redirects` file:
     ```
     /* /index.html 200
     ```
