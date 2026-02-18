import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveState, loadState, STORAGE_KEY, CURRENT_VERSION } from './storage.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Storage Module', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('saveState', () => {
    it('should save state to localStorage with version', async () => {
      const state = { tasks: [], currentWeek: '2025-09-10' };
      
      await saveState(state);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"version":' + CURRENT_VERSION)
      );
      
      // Verify the stored data structure more precisely
      const [[key, storedValue]] = mockLocalStorage.setItem.mock.calls;
      expect(key).toBe(STORAGE_KEY);
      
      const parsed = JSON.parse(storedValue);
      expect(parsed.version).toBe(CURRENT_VERSION);
      expect(parsed.data).toEqual(state);
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('should handle localStorage quota exceeded error', async () => {
      const state = { tasks: [] };
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      // Should not throw, but should handle gracefully
      await expect(saveState(state)).resolves.not.toThrow();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle other localStorage errors gracefully', async () => {
      const state = { tasks: [] };
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Some other error');
      });

      await expect(saveState(state)).resolves.not.toThrow();
    });

    it('should return a Promise', () => {
      const state = { tasks: [] };
      const result = saveState(state);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('loadState', () => {
    it('should return null when no stored data exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = await loadState();
      
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return null when stored data is invalid JSON', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const result = await loadState();
      
      expect(result).toBeNull();
    });

    it('should load and return current version data', async () => {
      const storedData = {
        version: CURRENT_VERSION,
        data: { tasks: [], currentWeek: '2025-09-10' },
        timestamp: Date.now()
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedData));
      
      const result = await loadState();
      
      expect(result).toEqual(storedData.data);
    });

    it('should migrate data from older version', async () => {
      const oldData = {
        version: 1,
        data: { tasks: [{ id: 1, title: 'Test' }] },
        timestamp: Date.now()
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      const result = await loadState();
      
      // Should return migrated data
      expect(result).toBeDefined();
      // Should save migrated data back to storage
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle missing version field (treat as version 1)', async () => {
      const legacyData = {
        tasks: [{ id: 1, title: 'Legacy task' }]
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(legacyData));
      
      const result = await loadState();
      
      expect(result).toBeDefined();
      // Should save migrated data
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle localStorage access errors', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });
      
      const result = await loadState();
      
      expect(result).toBeNull();
    });

    it('should return a Promise', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = loadState();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Version Migration', () => {
    it('should migrate from version 1 to current version', async () => {
      const v1Data = {
        version: 1,
        data: { 
          tasks: [
            { id: 1, title: 'Task 1', completed: false },
            { id: 2, title: 'Task 2', completed: true }
          ]
        },
        timestamp: Date.now()
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(v1Data));
      
      const result = await loadState();
      
      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
      // Verify migration logic was applied — the migrated data is saved
      // synchronously inside loadState via _saveStateSync
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining(`"version":${CURRENT_VERSION}`)
      );
    });
  });

  describe('Constants', () => {
    it('should export required constants', () => {
      expect(STORAGE_KEY).toBeDefined();
      expect(typeof STORAGE_KEY).toBe('string');
      expect(CURRENT_VERSION).toBeDefined();
      expect(typeof CURRENT_VERSION).toBe('number');
    });
  });
});