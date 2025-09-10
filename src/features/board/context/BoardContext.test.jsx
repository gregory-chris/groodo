import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { BoardProvider, useBoardContext } from './BoardContext.jsx';
import * as storage from '../../../lib/storage.js';
import * as dateUtils from '../../../lib/date.js';

// Mock the storage and date utilities
vi.mock('../../../lib/storage.js');
vi.mock('../../../lib/date.js');

// Test component to access context
function TestComponent() {
  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleTaskComplete,
    setCurrentWeek,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek
  } = useBoardContext();

  return (
    <div data-testid="test-component">
      <div data-testid="tasks-count">{state.tasks.length}</div>
      <div data-testid="current-week">{state.currentWeek?.start?.toISOString() || 'loading'}</div>
      <button data-testid="add-task" onClick={() => addTask({
        title: 'Test Task',
        column: 'sunday',
        description: 'Test description'
      })}>
        Add Task
      </button>
      <button data-testid="next-week" onClick={goToNextWeek}>Next Week</button>
      <button data-testid="prev-week" onClick={goToPreviousWeek}>Previous Week</button>
      <button data-testid="current-week-btn" onClick={goToCurrentWeek}>Current Week</button>
      {state.tasks.map(task => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span data-testid={`task-title-${task.id}`}>{task.title}</span>
          <span data-testid={`task-column-${task.id}`}>{task.column}</span>
          <span data-testid={`task-completed-${task.id}`}>{task.completed.toString()}</span>
          <button 
            data-testid={`toggle-${task.id}`} 
            onClick={() => toggleTaskComplete(task.id)}
          >
            Toggle
          </button>
          <button 
            data-testid={`delete-${task.id}`} 
            onClick={() => deleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

describe('BoardContext', () => {
  const mockCurrentWeek = {
    start: new Date(2025, 8, 7), // Sunday Sept 7, 2025
    end: new Date(2025, 8, 11)   // Thursday Sept 11, 2025
  };

  const mockNextWeek = {
    start: new Date(2025, 8, 14), // Sunday Sept 14, 2025
    end: new Date(2025, 8, 18)   // Thursday Sept 18, 2025
  };

  const mockPreviousWeek = {
    start: new Date(2025, 8, 0), // Sunday Aug 31, 2025
    end: new Date(2025, 8, 4)    // Thursday Sept 4, 2025
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    dateUtils.getCurrentWeek.mockReturnValue(mockCurrentWeek);
    dateUtils.getNextWeek.mockReturnValue(mockNextWeek);
    dateUtils.getPreviousWeek.mockReturnValue(mockPreviousWeek);
    dateUtils.isToday.mockReturnValue(false);
    storage.loadState.mockReturnValue(null);
    storage.saveState.mockImplementation(() => {});
  });

  describe('Provider Setup', () => {
    it('should provide context to children', () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should throw error when useBoardContext is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useBoardContext must be used within a BoardProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty tasks and current week', () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      expect(screen.getByTestId('current-week')).toHaveTextContent(mockCurrentWeek.start.toISOString());
      expect(dateUtils.getCurrentWeek).toHaveBeenCalled();
    });

    it('should load saved state from storage on initialization', () => {
      const savedState = {
        tasks: [
          {
            id: '1',
            title: 'Saved Task',
            column: 'monday',
            completed: false,
            description: 'Saved description',
            createdAt: Date.now(),
            order: 0
          }
        ],
        currentWeek: mockCurrentWeek
      };
      
      storage.loadState.mockReturnValue(savedState);

      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      expect(screen.getByTestId('task-title-1')).toHaveTextContent('Saved Task');
      expect(storage.loadState).toHaveBeenCalled();
    });
  });

  describe('Task Management', () => {
    it('should add a new task', async () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      await act(async () => {
        screen.getByTestId('add-task').click();
      });

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      
      // Find the task by its title content
      const taskTitleElement = screen.getByText('Test Task');
      expect(taskTitleElement).toBeInTheDocument();
      
      // Get the task ID from the data-testid of title element
      const taskId = taskTitleElement.getAttribute('data-testid').replace('task-title-', '');
      
      expect(screen.getByTestId(`task-column-${taskId}`)).toHaveTextContent('sunday');
      expect(screen.getByTestId(`task-completed-${taskId}`)).toHaveTextContent('false');
    });

    it('should delete a task', async () => {
      const initialState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Task to Delete',
            column: 'monday',
            completed: false,
            description: '',
            createdAt: Date.now(),
            order: 0
          }
        ],
        currentWeek: mockCurrentWeek
      };
      
      storage.loadState.mockReturnValue(initialState);

      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');

      await act(async () => {
        screen.getByTestId('delete-task-1').click();
      });

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
    });

    it('should toggle task completion', async () => {
      const initialState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Task to Toggle',
            column: 'tuesday',
            completed: false,
            description: '',
            createdAt: Date.now(),
            order: 0
          }
        ],
        currentWeek: mockCurrentWeek
      };
      
      storage.loadState.mockReturnValue(initialState);

      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('task-completed-task-1')).toHaveTextContent('false');

      await act(async () => {
        screen.getByTestId('toggle-task-1').click();
      });

      expect(screen.getByTestId('task-completed-task-1')).toHaveTextContent('true');
    });

    it('should update task properties', async () => {
      const initialState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Original Title',
            column: 'wednesday',
            completed: false,
            description: 'Original description',
            createdAt: Date.now(),
            order: 0
          }
        ],
        currentWeek: mockCurrentWeek
      };
      
      storage.loadState.mockReturnValue(initialState);

      const TestUpdateComponent = () => {
        const { state, updateTask } = useBoardContext();
        return (
          <div>
            <div data-testid="task-title">{state.tasks[0]?.title}</div>
            <button 
              data-testid="update-task"
              onClick={() => updateTask('task-1', { title: 'Updated Title', description: 'Updated description' })}
            >
              Update
            </button>
          </div>
        );
      };

      render(
        <BoardProvider>
          <TestUpdateComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('task-title')).toHaveTextContent('Original Title');

      await act(async () => {
        screen.getByTestId('update-task').click();
      });

      expect(screen.getByTestId('task-title')).toHaveTextContent('Updated Title');
    });
  });

  describe('Week Navigation', () => {
    it('should navigate to next week', async () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('current-week')).toHaveTextContent(mockCurrentWeek.start.toISOString());

      await act(async () => {
        screen.getByTestId('next-week').click();
      });

      expect(screen.getByTestId('current-week')).toHaveTextContent(mockNextWeek.start.toISOString());
      expect(dateUtils.getNextWeek).toHaveBeenCalledWith(mockCurrentWeek);
    });

    it('should navigate to previous week', async () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      await act(async () => {
        screen.getByTestId('prev-week').click();
      });

      expect(screen.getByTestId('current-week')).toHaveTextContent(mockPreviousWeek.start.toISOString());
      expect(dateUtils.getPreviousWeek).toHaveBeenCalledWith(mockCurrentWeek);
    });

    it('should navigate back to current week', async () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      // Go to next week first
      await act(async () => {
        screen.getByTestId('next-week').click();
      });

      expect(screen.getByTestId('current-week')).toHaveTextContent(mockNextWeek.start.toISOString());

      // Then go back to current week
      await act(async () => {
        screen.getByTestId('current-week-btn').click();
      });

      expect(screen.getByTestId('current-week')).toHaveTextContent(mockCurrentWeek.start.toISOString());
    });
  });

  describe('Task Movement', () => {
    it('should move task between columns', async () => {
      const initialState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Movable Task',
            column: 'sunday',
            completed: false,
            description: '',
            createdAt: Date.now(),
            order: 0
          }
        ],
        currentWeek: mockCurrentWeek
      };
      
      storage.loadState.mockReturnValue(initialState);

      const TestMoveComponent = () => {
        const { state, moveTask } = useBoardContext();
        return (
          <div>
            <div data-testid="task-column">{state.tasks[0]?.column}</div>
            <button 
              data-testid="move-task"
              onClick={() => moveTask('task-1', 'thursday', 0)}
            >
              Move to Thursday
            </button>
          </div>
        );
      };

      render(
        <BoardProvider>
          <TestMoveComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('task-column')).toHaveTextContent('sunday');

      await act(async () => {
        screen.getByTestId('move-task').click();
      });

      expect(screen.getByTestId('task-column')).toHaveTextContent('thursday');
    });
  });

  describe('Storage Integration', () => {
    it('should save state to storage when tasks change', async () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      // Clear any initial calls from setup
      storage.saveState.mockClear();

      await act(async () => {
        screen.getByTestId('add-task').click();
      });

      // Wait for the save operation
      await waitFor(() => {
        expect(storage.saveState).toHaveBeenCalled();
      });

      const saveCall = storage.saveState.mock.calls[storage.saveState.mock.calls.length - 1][0];
      expect(saveCall).toHaveProperty('tasks');
      expect(saveCall).toHaveProperty('currentWeek');
      expect(saveCall.tasks).toHaveLength(1);
    });

    it('should save state when week changes', async () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      await act(async () => {
        screen.getByTestId('next-week').click();
      });

      await waitFor(() => {
        expect(storage.saveState).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', () => {
      storage.loadState.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw and should use default state
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      expect(screen.getByTestId('current-week')).toHaveTextContent(mockCurrentWeek.start.toISOString());
    });

    it('should handle save errors gracefully', async () => {
      storage.saveState.mockImplementation(() => {
        throw new Error('Save error');
      });

      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      // Should not throw when saving fails
      await act(async () => {
        screen.getByTestId('add-task').click();
      });

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
    });
  });
});
