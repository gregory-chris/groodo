import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BoardProvider, useBoardContext } from './BoardContext.jsx';
import WeekNav from '../components/WeekNav.jsx';
import Column from '../components/Column.jsx';
import { usePersistence } from '../hooks/usePersistence.js';
import * as dateUtils from '../../../lib/date.js';

vi.mock('../hooks/usePersistence.js', () => ({
  usePersistence: vi.fn()
}));

vi.mock('../../../lib/date.js', async () => {
  const actual = await vi.importActual('../../../lib/date.js');
  return {
    ...actual,
    getCurrentWeek: vi.fn(),
    getNextWeek: vi.fn(),
    getPreviousWeek: vi.fn(),
  };
});

function TestControls() {
  const { goToNextWeek } = useBoardContext();

  return (
    <button data-testid="next-week" onClick={goToNextWeek}>
      Next Week
    </button>
  );
}

describe('BoardContext week loading', () => {
  const mockCurrentWeek = {
    start: new Date(2025, 8, 7),
    end: new Date(2025, 8, 11)
  };

  const mockNextWeek = {
    start: new Date(2025, 8, 14),
    end: new Date(2025, 8, 18)
  };

  const basePersistence = {
    isLoading: false,
    isWeekLoading: false,
    isSaving: false,
    error: null,
    saveData: vi.fn(),
    loadData: vi.fn(),
    loadWeekTasks: vi.fn().mockResolvedValue([]),
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
    dateUtils.getCurrentWeek.mockReturnValue(mockCurrentWeek);
    dateUtils.getNextWeek.mockReturnValue(mockNextWeek);
    dateUtils.getPreviousWeek.mockReturnValue(mockCurrentWeek);
    usePersistence.mockReturnValue(basePersistence);
  });

  it('loads the current week on startup and the target week after navigation', async () => {
    render(
      <BoardProvider>
        <TestControls />
      </BoardProvider>
    );

    await waitFor(() => {
      expect(basePersistence.loadWeekTasks).toHaveBeenCalledWith(mockCurrentWeek);
    });

    fireEvent.click(screen.getByTestId('next-week'));

    await waitFor(() => {
      expect(basePersistence.loadWeekTasks).toHaveBeenCalledWith(mockNextWeek);
    });
  });

  it('keeps the board read-only and shows loading feedback while a week is loading', () => {
    usePersistence.mockReturnValue({
      ...basePersistence,
      isLoading: true,
      isWeekLoading: true,
    });

    render(
      <BoardProvider>
        <WeekNav />
        <Column date={mockCurrentWeek.start} />
      </BoardProvider>
    );

    expect(screen.getByTestId('prev-week-btn')).toBeDisabled();
    expect(screen.getByTestId('today-btn')).toBeDisabled();
    expect(screen.getByTestId('next-week-btn')).toBeDisabled();
    expect(screen.getByTestId('add-task-input')).toBeDisabled();
    expect(screen.getByTestId('week-loading-indicator')).toBeInTheDocument();
  });
});