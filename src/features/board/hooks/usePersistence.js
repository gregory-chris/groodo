import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getCurrentWeek } from '../../../lib/date.js';
import { LocalStorageClient } from '../../../lib/clients/LocalStorageClient.js';
import { GroodoApiClient } from '../../../lib/clients/GroodoApiClient.js';
import toast from 'react-hot-toast';

/**
 * Custom hook for handling data persistence with immediate optimistic updates
 * @param {Object} state - Current application state
 * @param {Function} dispatch - State dispatch function
 * @returns {Object} Persistence utilities and state
 */
export function usePersistence(state, dispatch) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, status } = useAuth();
  
  const isInitializedRef = useRef(false);
  const prevStatusRef = useRef(status);

  /**
   * Select the appropriate storage client based on authentication status
   */
  const client = useMemo(() => {
    return status === 'authenticated' && user 
      ? new GroodoApiClient()
      : new LocalStorageClient();
  }, [status, user]);

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
   * Load data from storage with error handling
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tasks = await client.listTasks();
      dispatch({ 
        type: 'LOAD_STATE', 
        payload: { 
          tasks, 
          currentWeek: getCurrentWeek() 
        }
      });
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load tasks: ' + (err.message || 'Unknown error'));
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [client, dispatch]);

  /**
   * Handle creating a task with optimistic update and rollback on failure
   */
  const handleCreateTask = useCallback(async (task, taskDispatch) => {
    try {
      const createdTask = await client.createTask(task);
      
      // Update temp ID with server/storage ID
      taskDispatch({ 
        type: 'UPDATE_TASK', 
        payload: { 
          taskId: task.id, 
          updates: { 
            id: createdTask.id,
            createdAt: createdTask.createdAt || Date.now()
          } 
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to create task:', error);
      
      // Rollback: remove the task
      taskDispatch({ 
        type: 'DELETE_TASK', 
        payload: { taskId: task.id }
      });
      
      toast.error('Failed to create task: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [client]);

  /**
   * Handle updating a task with rollback on failure
   */
  const handleUpdateTask = useCallback(async (taskId, updates, previousTask, taskDispatch) => {
    try {
      await client.updateTask(taskId, updates);
      return { success: true };
    } catch (error) {
      console.error('Failed to update task:', error);
      
      // Rollback: restore previous values
      taskDispatch({ 
        type: 'UPDATE_TASK', 
        payload: { 
          taskId, 
          updates: previousTask 
        }
      });
      
      toast.error('Failed to update task: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [client]);

  /**
   * Handle deleting a task with rollback on failure
   */
  const handleDeleteTask = useCallback(async (taskId, deletedTask, taskDispatch) => {
    try {
      await client.deleteTask(taskId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete task:', error);
      
      // Rollback: restore the task
      taskDispatch({ 
        type: 'ADD_TASK', 
        payload: deletedTask 
      });
      
      toast.error('Failed to delete task: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [client]);

  /**
   * Handle toggle task completion with rollback on failure
   */
  const handleToggleComplete = useCallback(async (taskId, previousState, taskDispatch) => {
    try {
      await client.updateTask(taskId, { completed: !previousState.completed });
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      
      // Rollback: restore previous state
      taskDispatch({ 
        type: 'UPDATE_TASK', 
        payload: { 
          taskId, 
          updates: previousState 
        }
      });
      
      toast.error('Failed to update task: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [client]);

  /**
   * Export data for backup
   */
  const exportData = useCallback(() => {
    if (!state) return null;
    
    const exportObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: state.tasks || [],
      currentWeek: state.currentWeek,
    };
    
    return JSON.stringify(exportObj, null, 2);
  }, [state]);

  /**
   * Import data from backup
   */
  const importData = useCallback(async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid data format: tasks array not found');
      }
      
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          tasks: data.tasks,
          currentWeek: data.currentWeek || getCurrentWeek()
        }
      });
      
      // Save imported data
      const tasks = data.tasks;
      for (const task of tasks) {
        await client.createTask(task);
      }
      
      toast.success('Data imported successfully');
      setError(null);
    } catch (err) {
      console.error('Failed to import data:', err);
      toast.error('Failed to import data: ' + (err.message || 'Invalid format'));
      setError('Invalid import data format.');
    }
  }, [dispatch, client]);

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

    // Reload data when auth status changes
    if (prevStatusRef.current !== status && isInitializedRef.current) {
      console.log('🔄 Auth status changed, reloading data...');
      initializeData();
    } else if (!isInitializedRef.current) {
      // Initial load
      initializeData();
    }
    
    prevStatusRef.current = status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  return {
    // State
    isLoading,
    error,
    
    // Actions
    loadData,
    clearError,
    setError: setErrorMessage,
    exportData,
    importData,
    
    // Immediate operation handlers
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleComplete,
  };
}
