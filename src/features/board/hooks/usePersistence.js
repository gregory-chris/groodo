import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getCurrentWeek, getDateKey, getWeekBounds } from '../../../lib/date.js';
import { LocalStorageClient } from '../../../lib/clients/LocalStorageClient.js';
import { GroodoApiClient } from '../../../lib/clients/GroodoApiClient.js';
import toast from 'react-hot-toast';

function getWeekKey(week) {
  if (!week?.start) {
    return null;
  }

  return getDateKey(new Date(week.start));
}

function getWeekKeyFromColumn(column) {
  if (!column) {
    return null;
  }

  const date = new Date(`${column}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return getWeekKey(getWeekBounds(date));
}

/**
 * Custom hook for handling week-scoped board persistence with in-memory caching.
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
  const currentWeekRef = useRef(state.currentWeek);
  const loadedWeeksRef = useRef(new Map());
  const activeLoadRef = useRef(0);

  const client = useMemo(() => {
    return status === 'authenticated' && user
      ? new GroodoApiClient()
      : new LocalStorageClient();
  }, [status, user]);

  useEffect(() => {
    currentWeekRef.current = state.currentWeek;
  }, [state.currentWeek]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setErrorMessage = useCallback((message) => {
    setError(message);
  }, []);

  const syncVisibleWeekFromCache = useCallback((weekKey) => {
    if (!weekKey || getWeekKey(currentWeekRef.current) !== weekKey) {
      return;
    }

    const cachedTasks = loadedWeeksRef.current.get(weekKey);
    if (!cachedTasks) {
      return;
    }

    dispatch({
      type: 'LOAD_STATE',
      payload: {
        tasks: cachedTasks.map((task) => ({ ...task }))
      }
    });
  }, [dispatch]);

  const setCachedWeekTasks = useCallback((weekKey, tasks) => {
    if (!weekKey) {
      return;
    }

    loadedWeeksRef.current.set(
      weekKey,
      tasks.map((task) => ({ ...task }))
    );
  }, []);

  const mutateWeekCache = useCallback((weekKey, mutate) => {
    if (!weekKey || !loadedWeeksRef.current.has(weekKey)) {
      return;
    }

    const currentTasks = loadedWeeksRef.current.get(weekKey) || [];
    const nextTasks = mutate(currentTasks.map((task) => ({ ...task })));
    setCachedWeekTasks(weekKey, nextTasks);
  }, [setCachedWeekTasks]);

  const upsertCachedTask = useCallback((task) => {
    const weekKey = getWeekKeyFromColumn(task?.column);
    if (!weekKey) {
      return;
    }

    mutateWeekCache(weekKey, (tasks) => {
      const existingIndex = tasks.findIndex((entry) => entry.id === task.id);

      if (existingIndex >= 0) {
        const nextTasks = [...tasks];
        nextTasks[existingIndex] = { ...tasks[existingIndex], ...task };
        return nextTasks;
      }

      return [...tasks, { ...task }];
    });

    syncVisibleWeekFromCache(weekKey);
  }, [mutateWeekCache, syncVisibleWeekFromCache]);

  const removeCachedTask = useCallback((task) => {
    const weekKey = getWeekKeyFromColumn(task?.column);
    if (!weekKey) {
      return;
    }

    mutateWeekCache(weekKey, (tasks) => tasks.filter((entry) => entry.id !== task.id));
    syncVisibleWeekFromCache(weekKey);
  }, [mutateWeekCache, syncVisibleWeekFromCache]);

  const replaceCachedTask = useCallback((previousTask, nextTask) => {
    const previousWeekKey = getWeekKeyFromColumn(previousTask?.column);
    const nextWeekKey = getWeekKeyFromColumn(nextTask?.column);

    if (previousWeekKey && previousWeekKey !== nextWeekKey) {
      mutateWeekCache(previousWeekKey, (tasks) => tasks.filter((entry) => entry.id !== previousTask.id));
      syncVisibleWeekFromCache(previousWeekKey);
    }

    if (!nextWeekKey) {
      return;
    }

    mutateWeekCache(nextWeekKey, (tasks) => {
      const existingIndex = tasks.findIndex((entry) => entry.id === previousTask.id || entry.id === nextTask.id);

      if (existingIndex >= 0) {
        const nextTasks = [...tasks];
        nextTasks[existingIndex] = { ...tasks[existingIndex], ...nextTask };
        return nextTasks;
      }

      return [...tasks, { ...nextTask }];
    });

    syncVisibleWeekFromCache(nextWeekKey);
  }, [mutateWeekCache, syncVisibleWeekFromCache]);

  const loadWeekTasks = useCallback(async (week, options = {}) => {
    const targetWeek = week || currentWeekRef.current || getCurrentWeek();
    const weekKey = getWeekKey(targetWeek);

    if (!weekKey) {
      return [];
    }

    if (!options.force && loadedWeeksRef.current.has(weekKey)) {
      syncVisibleWeekFromCache(weekKey);
      return loadedWeeksRef.current.get(weekKey);
    }

    const loadId = activeLoadRef.current + 1;
    activeLoadRef.current = loadId;

    setIsLoading(true);
    setError(null);

    try {
      const tasks = await client.listTasks({ week: targetWeek });
      setCachedWeekTasks(weekKey, tasks);

      if (activeLoadRef.current === loadId) {
        syncVisibleWeekFromCache(weekKey);
      }

      return tasks;
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load tasks: ' + (err.message || 'Unknown error'));
      setError(err.message || 'Failed to load data');

      if (activeLoadRef.current === loadId && getWeekKey(currentWeekRef.current) === weekKey) {
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            tasks: []
          }
        });
      }

      return [];
    } finally {
      if (activeLoadRef.current === loadId) {
        setIsLoading(false);
      }
    }
  }, [client, setCachedWeekTasks, syncVisibleWeekFromCache]);

  const loadData = useCallback(async (week = currentWeekRef.current || getCurrentWeek(), options = {}) => {
    return loadWeekTasks(week, options);
  }, [loadWeekTasks]);

  const handleCreateTask = useCallback(async (task, taskDispatch, options = {}) => {
    const { optimistic = true } = options;

    try {
      const createdTask = await client.createTask(task);

      if (optimistic) {
        taskDispatch({
          type: 'RECONCILE_TASK',
          payload: {
            taskId: task.id,
            updates: {
              id: createdTask.id,
              createdAt: createdTask.createdAt || Date.now()
            }
          }
        });
      } else {
        taskDispatch({
          type: 'ADD_TASK',
          payload: {
            ...task,
            ...createdTask,
            id: createdTask.id || task.id,
            createdAt: createdTask.createdAt || task.createdAt || Date.now()
          }
        });
      }

      upsertCachedTask({
        ...task,
        ...createdTask,
        id: createdTask.id || task.id,
        createdAt: createdTask.createdAt || task.createdAt || Date.now()
      });

      return { success: true, task: createdTask };
    } catch (operationError) {
      console.error('Failed to create task:', operationError);

      if (optimistic) {
        taskDispatch({
          type: 'DELETE_TASK',
          payload: { taskId: task.id }
        });
      }

      toast.error('Failed to create task: ' + (operationError.message || 'Unknown error'));
      return { success: false, error: operationError };
    }
  }, [client, upsertCachedTask]);

  const handleUpdateTask = useCallback(async (taskId, updates, previousTask, taskDispatch) => {
    try {
      await client.updateTask(taskId, updates);
      replaceCachedTask(previousTask, { ...previousTask, ...updates });
      return { success: true };
    } catch (operationError) {
      console.error('Failed to update task:', operationError);

      taskDispatch({
        type: 'RECONCILE_TASK',
        payload: {
          taskId,
          updates: previousTask
        }
      });

      toast.error('Failed to update task: ' + (operationError.message || 'Unknown error'));
      return { success: false, error: operationError };
    }
  }, [client, replaceCachedTask]);

  const handleDeleteTask = useCallback(async (taskId, deletedTask, taskDispatch) => {
    try {
      await client.deleteTask(taskId);
      removeCachedTask(deletedTask);
      return { success: true };
    } catch (operationError) {
      console.error('Failed to delete task:', operationError);

      taskDispatch({
        type: 'ADD_TASK',
        payload: deletedTask
      });

      toast.error('Failed to delete task: ' + (operationError.message || 'Unknown error'));
      return { success: false, error: operationError };
    }
  }, [client, removeCachedTask]);

  const handleToggleComplete = useCallback(async (taskId, previousState, taskDispatch) => {
    try {
      await client.updateTask(taskId, { completed: !previousState.completed });
      replaceCachedTask(previousState, {
        ...previousState,
        completed: !previousState.completed
      });
      return { success: true };
    } catch (operationError) {
      console.error('Failed to toggle task completion:', operationError);

      taskDispatch({
        type: 'RECONCILE_TASK',
        payload: {
          taskId,
          updates: previousState
        }
      });

      toast.error('Failed to update task: ' + (operationError.message || 'Unknown error'));
      return { success: false, error: operationError };
    }
  }, [client, replaceCachedTask]);

  const handleBulkUpdateTasks = useCallback(async (taskUpdates, taskDispatch) => {
    try {
      const updatePromises = taskUpdates.map(({ taskId, updates }) => client.updateTask(taskId, updates));
      await Promise.all(updatePromises);

      taskUpdates.forEach(({ updates, previousTask }) => {
        replaceCachedTask(previousTask, { ...previousTask, ...updates });
      });

      return { success: true };
    } catch (operationError) {
      console.error('Failed to bulk update tasks:', operationError);

      taskUpdates.forEach(({ taskId, previousTask }) => {
        taskDispatch({
          type: 'RECONCILE_TASK',
          payload: {
            taskId,
            updates: previousTask
          }
        });
      });

      toast.error('Failed to update task order: ' + (operationError.message || 'Unknown error'));
      return { success: false, error: operationError };
    }
  }, [client, replaceCachedTask]);

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

      for (const task of data.tasks) {
        await client.createTask(task);
      }

      loadedWeeksRef.current = new Map();
      toast.success('Data imported successfully');
      setError(null);
    } catch (operationError) {
      console.error('Failed to import data:', operationError);
      toast.error('Failed to import data: ' + (operationError.message || 'Invalid format'));
      setError('Invalid import data format.');
    }
  }, [client, dispatch]);

  useEffect(() => {
    const authChanged = prevStatusRef.current !== status && isInitializedRef.current;

    loadedWeeksRef.current = new Map();

    if (authChanged && currentWeekRef.current) {
      void loadWeekTasks(currentWeekRef.current, { force: true });
    }

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }

    prevStatusRef.current = status;
  }, [loadWeekTasks, status, user]);

  return {
    isLoading,
    isWeekLoading: isLoading,
    isSaving: false,
    error,
    loadData,
    loadWeekTasks,
    clearError,
    setError: setErrorMessage,
    exportData,
    importData,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleComplete,
    handleBulkUpdateTasks,
  };
}
