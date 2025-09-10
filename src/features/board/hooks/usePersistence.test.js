import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistence } from './usePersistence';

// Mock the storage module
vi.mock('../../../lib/storage.js', () => ({
  saveState: vi.fn(),
  loadState: vi.fn(),
  clearState: vi.fn(),
}));

describe('usePersistence Hook', () => {
  const mockState = {
    tasks: [
      { id: '1', title: 'Test Task 1', completed: false, date: '2025-09-10' },
      { id: '2', title: 'Test Task 2', completed: true, date: '2025-09-11' },
    ],
    currentWeek: new Date(2025, 8, 8), // Sept 8, 2025 (Sunday)
    loading: false,
    error: null,
  };

  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Auto-save functionality', () => {
    it('should save state automatically when state changes', async () => {
      const { saveState } = await vi.importMock('../../../lib/storage.js');
      
      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      // Trigger auto-save by calling saveData
      await act(async () => {
        await result.current.saveData();
      });

      expect(saveState).toHaveBeenCalledWith(mockState);
    });

    it('should debounce auto-save calls to prevent excessive saving', async () => {
      const { saveState } = await vi.importMock('../../../lib/storage.js');
      
      const { result, rerender } = renderHook(
        ({ state }) => usePersistence(state, mockDispatch),
        { initialProps: { state: mockState } }
      );

      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Clear any calls from initialization
      saveState.mockClear();

      // Multiple rapid state changes
      const updatedState1 = { ...mockState, tasks: [...mockState.tasks, { id: '3', title: 'New Task' }] };
      const updatedState2 = { ...updatedState1, tasks: [...updatedState1.tasks, { id: '4', title: 'Another Task' }] };

      act(() => {
        rerender({ state: updatedState1 });
      });
      act(() => {
        rerender({ state: updatedState2 });
      });

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // Should only save once after debounce period
      expect(saveState).toHaveBeenCalledTimes(1);
      expect(saveState).toHaveBeenCalledWith(updatedState2);
    });

    it('should handle auto-save errors gracefully', async () => {
      const { saveState } = await vi.importMock('../../../lib/storage.js');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      saveState.mockRejectedValue(new Error('Storage quota exceeded'));

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await result.current.saveData();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save state:', expect.any(Error));
      expect(result.current.error).toBe('Failed to save data. Please try again.');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Load on startup functionality', () => {
    it('should load state on hook initialization', async () => {
      const { loadState } = await vi.importMock('../../../lib/storage.js');
      const savedState = {
        tasks: [{ id: 'saved-1', title: 'Saved Task', completed: false }],
        currentWeek: new Date(2025, 8, 15),
      };
      
      loadState.mockResolvedValue(savedState);

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      // Wait for async load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(loadState).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'LOAD_STATE',
        payload: savedState,
      });
    });

    it('should handle missing saved state gracefully', async () => {
      const { loadState } = await vi.importMock('../../../lib/storage.js');
      loadState.mockResolvedValue(null);

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(loadState).toHaveBeenCalled();
      // Should not dispatch LOAD_STATE if no saved state
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'LOAD_STATE' })
      );
    });

    it('should handle load errors gracefully', async () => {
      const { loadState } = await vi.importMock('../../../lib/storage.js');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      loadState.mockRejectedValue(new Error('Storage corrupted'));

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load state:', expect.any(Error));
      expect(result.current.error).toBe('Failed to load saved data. Starting fresh.');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should clear errors when clearError is called', () => {
      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      // Set an error first
      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should expose loading states correctly', async () => {
      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it('should handle network errors during save', async () => {
      const { saveState } = await vi.importMock('../../../lib/storage.js');
      saveState.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await result.current.saveData();
      });

      expect(result.current.error).toBe('Failed to save data. Please try again.');
    });
  });

  describe('Migration functionality', () => {
    it('should migrate old data format to new format', async () => {
      const { loadState } = await vi.importMock('../../../lib/storage.js');
      const oldFormatData = {
        // Old format might have different structure
        taskList: [{ taskId: 'old-1', taskTitle: 'Old Task', isDone: false }],
        week: '2025-09-08',
      };
      
      loadState.mockResolvedValue(oldFormatData);

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should migrate and dispatch the migrated state
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'LOAD_STATE',
        payload: expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({
              id: 'old-1',
              title: 'Old Task',
              completed: false,
            })
          ])
        }),
      });
    });

    it('should handle migration errors gracefully', async () => {
      const { loadState } = await vi.importMock('../../../lib/storage.js');
      const corruptedData = { invalid: 'data structure' };
      
      loadState.mockResolvedValue(corruptedData);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(consoleSpy).toHaveBeenCalledWith('Data migration failed, starting fresh:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should save migrated data in new format', async () => {
      const { loadState, saveState } = await vi.importMock('../../../lib/storage.js');
      const oldFormatData = {
        taskList: [{ taskId: 'old-1', taskTitle: 'Old Task', isDone: false }],
        week: '2025-09-08',
      };
      
      loadState.mockResolvedValue(oldFormatData);

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should save the migrated data in new format
      expect(saveState).toHaveBeenCalledWith(
        expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({
              id: 'old-1',
              title: 'Old Task',
              completed: false,
            })
          ])
        })
      );
    });
  });

  describe('Manual save and load operations', () => {
    it('should provide manual save functionality', async () => {
      const { saveState } = await vi.importMock('../../../lib/storage.js');
      
      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await result.current.saveData();
      });

      expect(saveState).toHaveBeenCalledWith(mockState);
    });

    it('should provide manual load functionality', async () => {
      const { loadState } = await vi.importMock('../../../lib/storage.js');
      const savedState = { tasks: [], currentWeek: new Date() };
      loadState.mockResolvedValue(savedState);

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await result.current.loadData();
      });

      expect(loadState).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'LOAD_STATE',
        payload: savedState,
      });
    });

    it('should provide export functionality', () => {
      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      const exportedData = result.current.exportData();

      expect(exportedData).toEqual(JSON.stringify(mockState, null, 2));
    });

    it('should provide import functionality', async () => {
      const importData = JSON.stringify({
        tasks: [{ id: 'imported-1', title: 'Imported Task', completed: false }],
        currentWeek: new Date(2025, 9, 1),
      });

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await result.current.importData(importData);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'LOAD_STATE',
        payload: expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({
              id: 'imported-1',
              title: 'Imported Task',
              completed: false,
            })
          ])
        }),
      });
    });

    it('should handle invalid import data', async () => {
      const invalidData = 'invalid json';

      const { result } = renderHook(() => 
        usePersistence(mockState, mockDispatch)
      );

      await act(async () => {
        await result.current.importData(invalidData);
      });

      expect(result.current.error).toBe('Invalid import data format.');
    });
  });
});
