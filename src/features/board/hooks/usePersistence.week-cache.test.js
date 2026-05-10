import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistence } from './usePersistence.js';

const listTasksMock = vi.fn();
const createTaskMock = vi.fn();
const updateTaskMock = vi.fn();
const deleteTaskMock = vi.fn();

vi.mock('../../auth/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: null,
    status: 'guest'
  })
}));

vi.mock('../../../lib/clients/LocalStorageClient.js', () => ({
  LocalStorageClient: vi.fn().mockImplementation(() => ({
    listTasks: listTasksMock,
    createTask: createTaskMock,
    updateTask: updateTaskMock,
    deleteTask: deleteTaskMock,
  }))
}));

vi.mock('../../../lib/clients/GroodoApiClient.js', () => ({
  GroodoApiClient: vi.fn().mockImplementation(() => ({
    listTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }))
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

function getLastLoadStatePayload(dispatch) {
  const loadCalls = dispatch.mock.calls.filter(([action]) => action.type === 'LOAD_STATE');
  return loadCalls.at(-1)?.[0]?.payload;
}

describe('usePersistence week cache', () => {
  const currentWeek = {
    start: new Date(2025, 8, 7),
    end: new Date(2025, 8, 11)
  };

  const nextWeek = {
    start: new Date(2025, 8, 14),
    end: new Date(2025, 8, 18)
  };

  const currentWeekTasks = [
    { id: 'task-1', title: 'Current Week Task', column: '2025-09-07', completed: false, order: 0 }
  ];

  const nextWeekTasks = [
    { id: 'task-2', title: 'Next Week Task', column: '2025-09-14', completed: false, order: 0 }
  ];

  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a week once and serves subsequent loads from the in-memory cache', async () => {
    listTasksMock
      .mockResolvedValueOnce(currentWeekTasks)
      .mockResolvedValueOnce(nextWeekTasks);

    const { result } = renderHook(() => usePersistence({ tasks: [], currentWeek }, mockDispatch));

    await act(async () => {
      await result.current.loadWeekTasks(currentWeek);
    });

    expect(listTasksMock).toHaveBeenCalledWith({ week: currentWeek });
    expect(getLastLoadStatePayload(mockDispatch)).toEqual({ tasks: currentWeekTasks });

    mockDispatch.mockClear();

    await act(async () => {
      await result.current.loadWeekTasks(currentWeek);
    });

    expect(listTasksMock).toHaveBeenCalledTimes(1);
    expect(getLastLoadStatePayload(mockDispatch)).toEqual({ tasks: currentWeekTasks });

    await act(async () => {
      await result.current.loadWeekTasks(nextWeek);
    });

    expect(listTasksMock).toHaveBeenCalledTimes(2);
    expect(listTasksMock).toHaveBeenLastCalledWith({ week: nextWeek });
  });

  it('keeps cached weeks in sync after create, update, and delete operations', async () => {
    listTasksMock.mockResolvedValueOnce(currentWeekTasks);
    createTaskMock.mockResolvedValue({ id: 'task-3', title: 'Created', column: '2025-09-08', completed: false, order: 1 });
    updateTaskMock.mockResolvedValue({});
    deleteTaskMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePersistence({ tasks: currentWeekTasks, currentWeek }, mockDispatch));

    await act(async () => {
      await result.current.loadWeekTasks(currentWeek);
    });

    mockDispatch.mockClear();

    await act(async () => {
      await result.current.handleCreateTask(
        { title: 'Created', column: '2025-09-08', completed: false, order: 1 },
        mockDispatch,
        { optimistic: false }
      );
    });

    expect(getLastLoadStatePayload(mockDispatch).tasks).toEqual([
      currentWeekTasks[0],
      expect.objectContaining({ id: 'task-3', title: 'Created' })
    ]);

    mockDispatch.mockClear();

    await act(async () => {
      await result.current.handleUpdateTask(
        'task-1',
        { title: 'Updated Title' },
        currentWeekTasks[0],
        mockDispatch
      );
    });

    expect(getLastLoadStatePayload(mockDispatch).tasks).toEqual([
      expect.objectContaining({ id: 'task-1', title: 'Updated Title' }),
      expect.objectContaining({ id: 'task-3', title: 'Created' })
    ]);

    mockDispatch.mockClear();

    await act(async () => {
      await result.current.handleDeleteTask('task-1', currentWeekTasks[0], mockDispatch);
    });

    expect(getLastLoadStatePayload(mockDispatch).tasks).toEqual([
      expect.objectContaining({ id: 'task-3', title: 'Created' })
    ]);
  });
});