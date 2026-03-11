import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardProvider, useBoardContext } from './BoardContext.jsx';
import { usePersistence } from '../hooks/usePersistence.js';

vi.mock('../hooks/usePersistence.js', () => ({
  usePersistence: vi.fn()
}));

function DeferredCreateTestComponent() {
  const { state, addTask } = useBoardContext();

  return (
    <div>
      <div data-testid="tasks-count">{state.tasks.length}</div>
      <button
        data-testid="create-task"
        onClick={() => {
          void addTask({
            title: 'Long server-backed task',
            column: '2026-03-11',
            content: 'Preserve me until the server confirms'
          });
        }}
      >
        Create
      </button>
      {state.tasks.map((task) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          {task.title}
        </div>
      ))}
    </div>
  );
}

describe('BoardContext task creation', () => {
  const persistenceValue = {
    isLoading: false,
    isSaving: false,
    error: null,
    saveData: vi.fn(),
    loadData: vi.fn(),
    clearError: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    handleCreateTask: vi.fn(),
    handleUpdateTask: vi.fn(),
    handleDeleteTask: vi.fn(),
    handleToggleComplete: vi.fn(),
    handleBulkUpdateTasks: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    usePersistence.mockReturnValue(persistenceValue);
  });

  it('waits for persistence success before adding a new task to state', async () => {
    let resolveCreate;

    persistenceValue.handleCreateTask.mockImplementation(
      (task, dispatch) => new Promise((resolve) => {
        resolveCreate = () => {
          dispatch({
            type: 'ADD_TASK',
            payload: {
              ...task,
              id: 'server-task-1'
            }
          });

          resolve({
            success: true,
            task: {
              ...task,
              id: 'server-task-1'
            }
          });
        };
      })
    );

    render(
      <BoardProvider>
        <DeferredCreateTestComponent />
      </BoardProvider>
    );

    fireEvent.click(screen.getByTestId('create-task'));

    expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
    expect(persistenceValue.handleCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Long server-backed task',
        column: '2026-03-11',
        content: 'Preserve me until the server confirms'
      }),
      expect.any(Function),
      { optimistic: false }
    );

    await act(async () => {
      resolveCreate();
    });

    await waitFor(() => {
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
    });
    expect(screen.getByTestId('task-server-task-1')).toHaveTextContent('Long server-backed task');
  });
});