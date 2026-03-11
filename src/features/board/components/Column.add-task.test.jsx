import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Column from './Column.jsx';
import { useBoardContext } from '../context/BoardContext.jsx';

vi.mock('../context/BoardContext.jsx', () => ({
  useBoardContext: vi.fn()
}));

vi.mock('../../../lib/date.js', () => ({
  isToday: vi.fn(() => false),
  getDayName: vi.fn(() => 'Wednesday'),
  formatDate: vi.fn(() => 'Wed, Mar 11'),
  getDateKey: vi.fn(() => '2026-03-11'),
  getCurrentWeek: vi.fn(() => ({
    start: new Date('2026-03-08T00:00:00.000Z'),
    end: new Date('2026-03-12T00:00:00.000Z')
  }))
}));

vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false
  }))
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => children,
  verticalListSortingStrategy: {},
}));

vi.mock('./TaskCard.jsx', () => ({
  default: () => null
}));

describe('Column quick add', () => {
  const addTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useBoardContext.mockReturnValue({
      state: { tasks: [] },
      addTask,
      deleteTask: vi.fn(),
      toggleTaskComplete: vi.fn(),
      duplicateTask: vi.fn(),
      moveTask: vi.fn(),
      openTaskModal: vi.fn()
    });
  });

  it('keeps the typed task title when create fails', async () => {
    addTask.mockResolvedValue(null);

    render(<Column date={new Date('2026-03-11T00:00:00.000Z')} />);

    const input = screen.getByTestId('add-task-input');
    fireEvent.change(input, { target: { value: 'Very long task title that should not disappear' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(addTask).toHaveBeenCalled();
    });
    expect(screen.getByTestId('add-task-input')).toHaveValue('Very long task title that should not disappear');
  });

  it('clears the typed task title after create succeeds', async () => {
    addTask.mockResolvedValue({ id: 'task-1' });

    render(<Column date={new Date('2026-03-11T00:00:00.000Z')} />);

    const input = screen.getByTestId('add-task-input');
    fireEvent.change(input, { target: { value: 'Task that should clear on success' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByTestId('add-task-input')).toHaveValue('');
    });
  });
});