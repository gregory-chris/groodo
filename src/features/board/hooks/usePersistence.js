import { useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState } from '../../../lib/storage.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getCurrentWeek } from '../../../lib/date.js';
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

        // Track created tasks to update their IDs
        const createdTasks = [];

        // Upsert local tasks
        for (const t of tasks) {
          // Transform task to API format - include ALL fields that might change
          const apiTask = {
            title: t.title || '',
            description: t.content || '',
            date: t.column || new Date().toISOString().split('T')[0],
            order: typeof t.order === 'number' ? t.order : 0,
            completed: !!t.completed,
          };
          
          // Check if this is a temporary client-side ID
          const isTemporaryId = typeof t.id === 'string' && t.id.startsWith('task-');
          
          if (!isTemporaryId && remoteById.has(t.id)) {
            // Update if changed - compare ALL API fields
            const r = remoteById.get(t.id);
            const changed = 
              (r?.title !== apiTask.title) ||
              (r?.description !== apiTask.description) ||
              (r?.date !== apiTask.date) ||
              (r?.order !== apiTask.order) ||
              (r?.completed !== apiTask.completed);
            if (changed) {
              console.log('🔄 Updating task', t.id, '- detected changes:', {
                title: r?.title !== apiTask.title ? `"${r?.title}" -> "${apiTask.title}"` : 'same',
                description: r?.description !== apiTask.description ? 'changed' : 'same',
                date: r?.date !== apiTask.date ? `${r?.date} -> ${apiTask.date}` : 'same',
                order: r?.order !== apiTask.order ? `${r?.order} -> ${apiTask.order}` : 'same',
                completed: r?.completed !== apiTask.completed ? `${r?.completed} -> ${apiTask.completed}` : 'same',
              });
              await remoteTasks.updateTask(t.id, apiTask);
            }
          } else if (isTemporaryId) {
            // New task with temporary ID - create on server
            console.log('➕ Creating new task:', apiTask);
            const createdTask = await remoteTasks.createTask(apiTask);
            if (createdTask && createdTask.id) {
              console.log('✅ Task created with server ID:', createdTask.id, '(was:', t.id, ')');
              createdTasks.push({ oldId: t.id, newId: createdTask.id, task: createdTask });
            }
          }
        }

        // Update local state with server IDs for newly created tasks
        if (createdTasks.length > 0) {
          console.log('🔄 Updating local IDs with server IDs...');
          for (const { oldId, newId, task } of createdTasks) {
            dispatch({
              type: 'UPDATE_TASK',
              payload: { 
                taskId: oldId, 
                updates: { 
                  id: newId,
                  // Also update any other fields that might have been modified by server
                  createdAt: task.createdAt || Date.now()
                } 
              }
            });
          }
        }

        // Delete remote tasks that are not present locally
        // Only delete if they have server IDs (numeric), not temporary IDs
        const localIds = new Set(tasks.map(t => t.id));
        for (const r of remote) {
          // Only delete if it's a server task (numeric ID) and not found in local state
          const isServerTask = typeof r.id === 'number';
          if (isServerTask && !localIds.has(r.id)) {
            console.log('🗑️ Deleting task from server:', r.id, r.title);
            await remoteTasks.deleteTask(r.id).catch((err) => {
              console.error('Failed to delete task:', err);
            });
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
  }, [state, status, user, dispatch]);

  /**
   * Load data from storage with error handling and migration
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let savedState = null;
      // Skip loading if status is still 'idle' or 'loading' - wait for auth to initialize
      if (status === 'idle' || status === 'loading') {
        console.log('⏳ Waiting for auth to initialize, status:', status);
        setIsLoading(false);
        return;
      }
      
      if (status === 'authenticated' && user) {
        console.log('📥 Loading from remote API...');
        // Load from server
        const remote = await remoteTasks.listTasks();
        console.log('📦 Received tasks from API:', remote.length, 'tasks');
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
        console.log('✅ Loaded state from API with currentWeek:', savedState.currentWeek);
      } else {
        console.log('💾 Loading from localStorage...');
        savedState = await loadState();
        console.log('✅ Loaded state from localStorage:', savedState ? 'success' : 'no data');
      }
      
      if (savedState) {
        // Migrate data if needed and dispatch to state
        const migratedState = migrateDataIfNeeded(savedState);
        console.log('📋 Dispatching LOAD_STATE with', migratedState.tasks?.length || 0, 'tasks');
        dispatch({
          type: 'LOAD_STATE',
          payload: migratedState,
        });

        // Save migrated data back if migration occurred
        if (migratedState !== savedState) {
          console.log('⚠️ Data was migrated, syncing to remote...');
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
              
              if (remoteById.has(t.id)) {
                console.log('🔄 Migrating task to API:', t.id);
                await remoteTasks.updateTask(t.id, apiTask);
              } else {
                console.log('➕ Creating migrated task:', apiTask);
                await remoteTasks.createTask(apiTask);
              }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, status, user]); // migrateDataIfNeeded is stable (empty deps)

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
      if (!Object.hasOwn(data, 'tasks') && !Object.hasOwn(data, 'currentWeek')) {
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
        currentWeek: getCurrentWeek(),
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

    console.log('⏱️ State changed, scheduling auto-save in 500ms...');

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounced)
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (isInitializedRef.current && state) {
        console.log('💾 Auto-save triggered');
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
   * Load data on hook initialization and when auth status changes
   */
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔄 Loading data, status:', status, 'user:', user?.username || user?.email || 'none');
      await loadData();
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]); // Only depend on status and user, not loadData

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
