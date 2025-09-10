# Data Model Specification

## Entities

### Task
```javascript
interface Task {
  id: string;           // UUID v4
  title: string;        // Required, max 200 chars
  descriptionMd: string;// Optional markdown content
  completed: boolean;   // Completion status
  columnId: string;     // Column ID (date or 'general')
  order: number;       // Sort position in column
}
```

### Column
```javascript
interface Column {
  id: string;          // Date ISO string or 'general'
  label: string;       // Display name
  date?: string;       // ISO date (omitted for general)
}
```

### Board
```javascript
interface Board {
  weekStartISO: string;                    // Sunday's date
  columns: Record<string, string[]>;       // columnId -> taskIds
  tasks: Record<string, Task>;             // id -> Task
  schemaVersion: number;                   // For migrations
}
```

## Persistence

### Storage Key
```javascript
const STORAGE_KEY = 'groodo-board-v1';
```

### Schema Version
```javascript
const SCHEMA_VERSION = 1;
```

### Example Data
```javascript
{
  "weekStartISO": "2025-09-07",
  "columns": {
    "general": ["task1", "task2"],
    "2025-09-07": ["task3"],
    "2025-09-08": ["task4", "task5"],
    "2025-09-09": [],
    "2025-09-10": ["task6"],
    "2025-09-11": []
  },
  "tasks": {
    "task1": {
      "id": "task1",
      "title": "General todo",
      "descriptionMd": "Priority task",
      "completed": false,
      "columnId": "general",
      "order": 0
    },
    "task2": {
      "id": "task2",
      "title": "Another general item",
      "descriptionMd": null,
      "completed": true,
      "columnId": "general",
      "order": 1
    }
  },
  "schemaVersion": 1
}
```

## Validation Rules

### Task
- `id`: UUID v4 format
- `title`: Required, trimmed, max 200 chars
- `descriptionMd`: Optional, max 10000 chars
- `completed`: Boolean
- `columnId`: Must match existing column
- `order`: Non-negative integer

### Column
- `id`: Either 'general' or valid ISO date
- `label`: Required, trimmed, max 50 chars
- `date`: Must match id if present

### Board
- `weekStartISO`: Valid ISO date string
- `columns`: Must include 'general' and 5 date columns
- `tasks`: All referenced task IDs must exist
- `schemaVersion`: Must match current version

## Migration Strategy

### Version 1 (Initial)
```javascript
function migrateToV1(oldState) {
  return {
    weekStartISO: getStartOfWeek(),
    columns: {
      general: [],
      ...generateWeekColumns()
    },
    tasks: {},
    schemaVersion: 1
  };
}
```

## Storage Management

### Quota Handling
- Check available space before writes
- Implement compression if needed
- Clean up old data when near quota
- Surface warnings to user
