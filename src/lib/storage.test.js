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
    it('should save state to localStorage with version', () => {
      const state = { tasks: [], currentWeek: '2025-09-10' };
      
      saveState(state);
      
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

    it('should handle localStorage quota exceeded error', () => {
      const state = { tasks: [] };
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      // Should not throw, but should handle gracefully
      expect(() => saveState(state)).not.toThrow();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle other localStorage errors gracefully', () => {
      const state = { tasks: [] };
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Some other error');
      });

      expect(() => saveState(state)).not.toThrow();
    });
  });

  describe('loadState', () => {
    it('should return null when no stored data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = loadState();
      
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return null when stored data is invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const result = loadState();
      
      expect(result).toBeNull();
    });

    it('should load and return current version data', () => {
      const storedData = {
        version: CURRENT_VERSION,
        data: { tasks: [], currentWeek: '2025-09-10' },
        timestamp: Date.now()
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedData));
      
      const result = loadState();
      
      expect(result).toEqual(storedData.data);
    });

    it('should migrate data from older version', () => {
      const oldData = {
        version: 1,
        data: { tasks: [{ id: 1, title: 'Test' }] },
        timestamp: Date.now()
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      const result = loadState();
      
      // Should return migrated data
      expect(result).toBeDefined();
      // Should save migrated data back to storage
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle missing version field (treat as version 1)', () => {
      const legacyData = {
        tasks: [{ id: 1, title: 'Legacy task' }]
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(legacyData));
      
      const result = loadState();
      
      expect(result).toBeDefined();
      // Should save migrated data
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle localStorage access errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });
      
      const result = loadState();
      
      expect(result).toBeNull();
    });
  });

  describe('Version Migration', () => {
    it('should migrate from version 1 to current version', () => {
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
      
      const result = loadState();
      
      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
      // Verify migration logic was applied
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
