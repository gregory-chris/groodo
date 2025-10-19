import { useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState } from '../../../lib/storage.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import * as remoteTasks from '../../../lib/remoteTasksClient.js';

/**
 * Custom hook for handling data persistence with auto-save, error handling, and migration
 * @param {Object} state - Current application state
 * @param {Function} dispatch - State dispatch function
 * @returns {Object} Persistence utilities and state
 */
export function usePersistence(state, dispatch) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const { user, status } = useAuth();
  
  // Use refs to track debounce timers and prevent memory leaks
  const autoSaveTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  /**
   * Clear any error messages
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Set error message
   */
  const setErrorMessage = useCallback((message) => {
    setError(message);
  }, []);

  /**
   * Save data to storage with error handling
   */
  const saveData = useCallback(async () => {
    if (!state) return;

    setIsSaving(true);
    setError(null);

    try {
      if (status === 'authenticated' && user) {
        // Push delta to server: naive approach, upsert all tasks
        // In a real app, track changes; here we sync all tasks
        const tasks = state.tasks || [];
        // Fetch remote tasks to compute upserts/deletes
        const remote = await remoteTasks.listTasks().catch(() => []);
        const remoteById = new Map(remote.map(t => [t.id, t]));

        // Upsert local tasks
        for (const t of tasks) {
          // Transform task to API format
          const apiTask = {
            title: t.title || '',
            description: t.content || '',
            date: t.column || new Date().toISOString().split('T')[0],
          };
          
          if (remoteById.has(t.id)) {
            // Update if changed
            const r = remoteById.get(t.id);
            const changed = ['title','content','column','completed','order','createdAt']
              .some(k => (r?.[k] ?? null) !== (t?.[k] ?? null));
            if (changed) await remoteTasks.updateTask(t.id, apiTask);
          } else {
            await remoteTasks.createTask(apiTask);
          }
        }

        // Delete remote tasks not present locally
        const localIds = new Set(tasks.map(t => t.id));
        for (const r of remote) {
          if (!localIds.has(r.id)) {
            await remoteTasks.deleteTask(r.id).catch(() => {});
          }
        }
      } else {
        await saveState(state);
      }
    } catch (err) {
      console.error('Failed to save state:', err);
      setError('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [state, status, user]);

  /**
   * Load data from storage with error handling and migration
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let savedState = null;
      if (status === 'authenticated' && user) {
        // Load from server
        const remote = await remoteTasks.listTasks();
        savedState = {
          tasks: Array.isArray(remote) ? remote.map((t, idx) => ({
            id: t.id,
            title: t.title ?? '',
            content: t.description ?? '', // API uses 'description' field
            date: t.date, // Preserve date from API
            column: t.date || 'general', // Use date as column key (YYYY-MM-DD format)
            completed: !!t.completed,
            createdAt: t.createdAt ?? Date.now(),
            order: typeof t.order === 'number' ? t.order : idx,
          })) : [],
          currentWeek: getCurrentWeek(),
        };
      } else {
        savedState = await loadState();
      }
      
      if (savedState) {
        // Migrate data if needed and dispatch to state
        const migratedState = migrateDataIfNeeded(savedState);
        dispatch({
          type: 'LOAD_STATE',
          payload: migratedState,
        });

        // Save migrated data back if migration occurred
        if (migratedState !== savedState) {
          if (status === 'authenticated' && user) {
            // Push migrated to remote
            const tasks = migratedState.tasks || [];
            const remote = await remoteTasks.listTasks().catch(() => []);
            const remoteById = new Map(remote.map(t => [t.id, t]));
            for (const t of tasks) {
              // Transform task to API format
              const apiTask = {
                title: t.title || '',
                description: t.content || '',
                date: t.column || new Date().toISOString().split('T')[0],
              };
              
              if (remoteById.has(t.id)) await remoteTasks.updateTask(t.id, apiTask);
              else await remoteTasks.createTask(apiTask);
            }
          } else {
            await saveState(migratedState);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load state:', err);
      setError('Failed to load saved data. Starting fresh.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, status, user]);

  /**
   * Migrate data from old formats to current format
   */
  const migrateDataIfNeeded = useCallback((data) => {
    try {
      // Validate that data is an object and has expected structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure - not an object');
      }

      // Check if data needs migration based on structure
      if (data.taskList || data.week) {
        // Old format detected
        const migrated = {
          tasks: (data.taskList || []).map(task => ({
            id: task.taskId || task.id || `task-${Date.now()}-${Math.random()}`,
            title: task.taskTitle || task.title || '',
            completed: task.isDone !== undefined ? task.isDone : (task.completed || false),
            date: task.date || new Date().toISOString().split('T')[0],
            createdAt: task.createdAt || Date.now(),
            description: task.description || '',
            column: task.column || 'general',
            order: task.order || 0,
          })),
          currentWeek: data.week ? new Date(data.week) : new Date(),
        };
        return migrated;
      }

      // Check if data has expected fields for new format
      if (!data.hasOwnProperty('tasks') && !data.hasOwnProperty('currentWeek')) {
        // If it doesn't have expected fields and isn't clearly old format, it might be corrupted
        if (Object.keys(data).length > 0 && !Object.keys(data).some(key => ['tasks', 'currentWeek', 'loading', 'error'].includes(key))) {
          throw new Error('Unrecognized data structure');
        }
      }

      // Data is already in new format - return as-is
      return data;
    } catch (error) {
      console.warn('Data migration failed, starting fresh:', error);
      return {
        tasks: [],
        currentWeek: new Date(),
      };
    }
  }, []);

  /**
   * Export data as JSON string
   */
  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  /**
   * Import data from JSON string
   */
  const importData = useCallback(async (jsonData) => {
    try {
      const parsedData = JSON.parse(jsonData);
      const migratedData = migrateDataIfNeeded(parsedData);
      
      dispatch({
        type: 'LOAD_STATE',
        payload: migratedData,
      });

      // Save imported data
      await saveState(migratedData);
      setError(null);
    } catch (err) {
      console.error('Failed to import data:', err);
      setError('Invalid import data format.');
    }
  }, [dispatch, migrateDataIfNeeded]);

  /**
   * Debounced auto-save effect
   */
  useEffect(() => {
    // Don't auto-save on initial load or if state is empty
    if (!isInitializedRef.current || !state) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounced)
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (isInitializedRef.current && state) {
        saveData();
      }
    }, 500); // 500ms debounce

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state, saveData]);

  /**
   * Load data on hook initialization
   */
  useEffect(() => {
    const initializeData = async () => {
      await loadData();
      isInitializedRef.current = true;
    };

    initializeData();
  }, [loadData]);

  // Reload tasks when auth status changes (guest <-> authenticated)
  useEffect(() => {
    if (isInitializedRef.current) {
      loadData();
    }
  }, [status, user, loadData]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isLoading,
    isSaving,
    error,
    
    // Actions
    saveData,
    loadData,
    clearError,
    setError: setErrorMessage,
    exportData,
    importData,
  };
}
