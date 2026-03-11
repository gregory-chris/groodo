import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { getCurrentWeek, getNextWeek, getPreviousWeek, getDateKey } from '../../../lib/date.js';
import { usePersistence } from '../hooks/usePersistence.js';
import TaskModal from '../components/TaskModal';

// Action types
const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  RECONCILE_TASK: 'RECONCILE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  MOVE_TASK: 'MOVE_TASK',
  TOGGLE_TASK_COMPLETE: 'TOGGLE_TASK_COMPLETE',
  SET_CURRENT_WEEK: 'SET_CURRENT_WEEK',
  GO_TO_NEXT_WEEK: 'GO_TO_NEXT_WEEK',
  GO_TO_PREVIOUS_WEEK: 'GO_TO_PREVIOUS_WEEK',
  GO_TO_CURRENT_WEEK: 'GO_TO_CURRENT_WEEK'
};

// Initial state - we'll set currentWeek in useEffect to avoid issues with mocking
const initialState = {
  tasks: [],
  currentWeek: null,
  loading: false,
  error: null
};

// Reducer function
function boardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_STATE:
      return {
        ...state,
        ...action.payload,
        loading: false
      };

    case ACTIONS.ADD_TASK: {
      const now = Date.now();
      const taskId = action.payload.id || `task-${now}-${Math.random().toString(36).substr(2, 9)}`;
      const newTask = {
        id: taskId,
        title: action.payload.title || '',
        content: action.payload.content || '',
        column: action.payload.column || 'general',
        completed: false,
        createdAt: now,
        updatedAt: now,
        order: action.payload.order ?? state.tasks.filter(t => t.column === action.payload.column).length,
        ...action.payload,
        // Stable key for React — survives ID swaps from persistence reconciliation
        _stableKey: taskId,
      };

      return {
        ...state,
        tasks: [...state.tasks, newTask]
      };
    }

    case ACTIONS.UPDATE_TASK: {
      const { taskId, updates } = action.payload;
      const now = Date.now();
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: now }
            : task
        )
      };
    }

    case ACTIONS.RECONCILE_TASK: {
      // Silent update for persistence bookkeeping (e.g. temp-id → server-id).
      // Does NOT touch updatedAt so it never re-triggers the highlight animation.
      const { taskId, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates }
            : task
        )
      };
    }

    case ACTIONS.DELETE_TASK: {
      const { taskId } = action.payload;
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskId)
      };
    }

    case ACTIONS.TOGGLE_TASK_COMPLETE: {
      const { taskId } = action.payload;
      const targetTask = state.tasks.find(task => task.id === taskId);
      if (!targetTask) return state;

      const willBeCompleted = !targetTask.completed;
      const updatedTask = { ...targetTask, completed: willBeCompleted };

      // If task is being uncompleted (marked as not done), move it to the end
      if (!willBeCompleted) {
        // Get all tasks in the same column, excluding the target task
        const otherTasksInColumn = state.tasks.filter(
          task => task.column === targetTask.column && task.id !== taskId
        );

        // Get the highest order in the column
        const maxOrder = Math.max(...otherTasksInColumn.map(task => task.order || 0), -1);

        // Update the target task with new order (last position)
        updatedTask.order = maxOrder + 1;
      }

      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      };
    }

    case ACTIONS.MOVE_TASK: {
      const { taskId, targetColumn, targetOrder } = action.payload;

      // Get the task being moved
      const movingTask = state.tasks.find(task => task.id === taskId);
      if (!movingTask) {
        return state;
      }

      // Get all tasks in the target column (excluding the moving task)
      const targetColumnTasks = state.tasks.filter(
        task => task.column === targetColumn && task.id !== taskId
      );

      // Sort target column tasks by order
      targetColumnTasks.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Insert the moving task at the target position
      const now = Date.now();
      targetColumnTasks.splice(targetOrder, 0, {
        ...movingTask,
        column: targetColumn,
        updatedAt: now
      });

      // Reassign order values to all tasks in the target column
      const reorderedTargetTasks = targetColumnTasks.map((task, index) => ({
        ...task,
        order: index
      }));

      // Create the final updated tasks array
      const updatedTasks = state.tasks.map(task => {
        if (task.id === taskId) {
          // This is the moving task - find it in the reordered array
          // It should already have the new updatedAt from the splice above if we preserve it
          const reorderedTask = reorderedTargetTasks.find(t => t.id === task.id);
          return reorderedTask || { ...task, column: targetColumn, order: targetOrder, updatedAt: now };
        } else if (task.column === targetColumn) {
          // Other tasks in the target column - find them in the reordered array
          const reorderedTask = reorderedTargetTasks.find(t => t.id === task.id);
          return reorderedTask || task;
        }
        return task;
      });

      return {
        ...state,
        tasks: updatedTasks
      };
    }

    case ACTIONS.SET_CURRENT_WEEK:
      return {
        ...state,
        currentWeek: action.payload
      };

    case ACTIONS.GO_TO_NEXT_WEEK: {
      const nextWeek = getNextWeek(state.currentWeek);
      return {
        ...state,
        currentWeek: nextWeek
      };
    }

    case ACTIONS.GO_TO_PREVIOUS_WEEK: {
      const previousWeek = getPreviousWeek(state.currentWeek);
      return {
        ...state,
        currentWeek: previousWeek
      };
    }

    case ACTIONS.GO_TO_CURRENT_WEEK: {
      const currentWeek = getCurrentWeek();
      return {
        ...state,
        currentWeek: currentWeek
      };
    }

    default:
      return state;
  }
}

// Create context
const BoardContext = createContext(null);

// Provider component
export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'edit',
    task: null,
    column: null
  });

  // Initialize persistence hook for auto-save, load, error handling, and migration
  const persistence = usePersistence(state, dispatch);

  // Effect to set initial currentWeek if not loaded from persistence
  useEffect(() => {
    if (state.currentWeek === null && !persistence.isLoading) {
      dispatch({
        type: ACTIONS.SET_CURRENT_WEEK,
        payload: getCurrentWeek()
      });
    }
  }, [state.currentWeek, persistence.isLoading]);

  // Action creators with persistence
  const addTask = useCallback(async (titleOrData, column, content = '') => {
    const taskData = typeof titleOrData === 'string'
      ? { title: titleOrData, column, content }
      : titleOrData;

    const newTask = {
      ...taskData,
      completed: false,
      createdAt: Date.now(),
    };

    const result = await persistence.handleCreateTask(newTask, dispatch, {
      optimistic: false
    });

    if (result.success && result.task) {
      return result.task;
    }

    return null;
  }, [persistence]);

  const updateTask = useCallback((taskId, updates) => {
    // Store previous values for rollback
    const previousTask = state.tasks.find(t => t.id === taskId);

    // Optimistic update
    dispatch({
      type: ACTIONS.UPDATE_TASK,
      payload: { taskId, updates }
    });

    // Async sync with rollback
    if (previousTask) {
      persistence.handleUpdateTask(taskId, updates, previousTask, dispatch);
    }
  }, [persistence, state.tasks]);

  const deleteTask = useCallback((taskId) => {
    // Store task for potential rollback
    const taskToDelete = state.tasks.find(t => t.id === taskId);

    // Optimistic delete
    dispatch({
      type: ACTIONS.DELETE_TASK,
      payload: { taskId }
    });

    // Async sync with rollback
    if (taskToDelete) {
      persistence.handleDeleteTask(taskId, taskToDelete, dispatch);
    }
  }, [persistence, state.tasks]);

  const toggleTaskComplete = useCallback((taskId) => {
    // Store previous state for rollback
    const previousTask = state.tasks.find(t => t.id === taskId);

    // Optimistic toggle
    dispatch({
      type: ACTIONS.TOGGLE_TASK_COMPLETE,
      payload: { taskId }
    });

    // Async sync with rollback
    if (previousTask) {
      persistence.handleToggleComplete(taskId, previousTask, dispatch);
    }
  }, [persistence, state.tasks]);

  const duplicateTask = useCallback(async (task, isCurrentWeek) => {
    // If viewing the current week, put duplicate on today; otherwise same column
    const targetColumn = isCurrentWeek ? getDateKey(new Date()) : task.column;

    // Generate temp ID and create task data
    const tempId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask = {
      title: task.title,
      content: task.content || '',
      column: targetColumn,
      id: tempId,
      completed: false,
      createdAt: Date.now(),
    };

    // Optimistic update - task appears in the UI immediately
    dispatch({
      type: ACTIONS.ADD_TASK,
      payload: newTask
    });

    // Wait for persistence to complete and get the real ID
    const result = await persistence.handleCreateTask(newTask, dispatch);

    if (result.success && result.task) {
      // Return the task with the real persisted ID so the modal targets the correct task
      return { ...newTask, id: result.task.id };
    }

    // If persistence failed, the task was rolled back by handleCreateTask
    return null;
  }, [persistence, dispatch]);

  const moveTask = useCallback((taskId, targetColumn, targetOrder) => {
    // Helper function to calculate affected tasks from current state
    // This uses functional composition to ensure we're working with fresh data
    const calculateAffectedTasks = (currentTasks) => {
      // Get the task being moved
      const movingTask = currentTasks.find(t => t.id === taskId);
      if (!movingTask) return null;

      // Simulate the move to calculate which tasks will be affected
      // This mirrors the logic from the MOVE_TASK reducer
      const targetColumnTasks = currentTasks.filter(
        task => task.column === targetColumn && task.id !== taskId
      );

      // Sort target column tasks by order
      targetColumnTasks.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Insert the moving task at the target position
      targetColumnTasks.splice(targetOrder, 0, { ...movingTask, column: targetColumn });

      // Reassign order values to all tasks in the target column
      const reorderedTargetTasks = targetColumnTasks.map((task, index) => ({
        ...task,
        order: index
      }));

      // Identify which tasks have changed and need to be synced
      const affectedTasks = [];

      reorderedTargetTasks.forEach(newTask => {
        const originalTask = currentTasks.find(t => t.id === newTask.id);
        if (originalTask) {
          const orderChanged = originalTask.order !== newTask.order;
          const columnChanged = originalTask.column !== newTask.column;

          if (orderChanged || columnChanged) {
            affectedTasks.push({
              taskId: newTask.id,
              updates: {
                column: newTask.column,
                order: newTask.order,
                ...(newTask.id === taskId ? { updatedAt: Date.now() } : {})
              },
              previousTask: { ...originalTask }
            });
          }
        }
      });

      return affectedTasks;
    };

    // Calculate affected tasks using current state at call time
    const affectedTasks = calculateAffectedTasks(state.tasks);
    if (!affectedTasks) return;

    // Optimistic move
    dispatch({
      type: ACTIONS.MOVE_TASK,
      payload: { taskId, targetColumn, targetOrder }
    });

    // Send bulk updates for all affected tasks
    if (affectedTasks.length > 0) {
      persistence.handleBulkUpdateTasks(affectedTasks, dispatch);
    }
  }, [persistence, state.tasks]);

  const setCurrentWeek = useCallback((week) => {
    dispatch({
      type: ACTIONS.SET_CURRENT_WEEK,
      payload: week
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    dispatch({
      type: ACTIONS.GO_TO_NEXT_WEEK
    });
  }, []);

  const goToPreviousWeek = useCallback(() => {
    dispatch({
      type: ACTIONS.GO_TO_PREVIOUS_WEEK
    });
  }, []);

  const goToCurrentWeek = useCallback(() => {
    dispatch({
      type: ACTIONS.GO_TO_CURRENT_WEEK
    });
  }, []);

  // Context value
  const contextValue = {
    state,
    actions: {
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      duplicateTask,
      moveTask,
      setCurrentWeek,
      goToNextWeek,
      goToPreviousWeek,
      goToCurrentWeek
    },
    // Export individual actions for easier access
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    duplicateTask,
    moveTask,
    setCurrentWeek,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    // Mock function for openTaskModal
    openTaskModal: (mode, taskData) => {
      setModalState({
        isOpen: true,
        mode,
        task: mode === 'edit' ? taskData : null,
        column: mode === 'create' ? taskData?.column : null
      });
    },
    // Persistence functionality
    persistence: {
      isLoading: persistence.isLoading,
      isSaving: persistence.isSaving,
      error: persistence.error,
      saveData: persistence.saveData,
      loadData: persistence.loadData,
      clearError: persistence.clearError,
      exportData: persistence.exportData,
      importData: persistence.importData,
    }
  };

  // Modal handlers
  const handleModalClose = useCallback(() => {
    setModalState({
      isOpen: false,
      mode: 'edit',
      task: null,
      column: null
    });
  }, []);

  const handleModalSave = useCallback(async (taskIdOrData, updates) => {
    if (modalState.mode === 'edit') {
      // Edit existing task
      updateTask(taskIdOrData, updates);
      handleModalClose();
      return { success: true };
    } else {
      // Create new task
      const createdTask = await addTask(taskIdOrData.title, modalState.column, taskIdOrData.content);
      if (createdTask) {
        handleModalClose();
        return { success: true, task: createdTask };
      }

      return { success: false };
    }
  }, [modalState.mode, modalState.column, updateTask, addTask, handleModalClose]);

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
      <TaskModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        task={modalState.task}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </BoardContext.Provider>
  );
}

BoardProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Hook to use the Board context
// eslint-disable-next-line react-refresh/only-export-components
export function useBoardContext() {
  const context = useContext(BoardContext);

  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }

  return context;
}

// Helper functions for working with tasks
// eslint-disable-next-line react-refresh/only-export-components
export const boardHelpers = {
  /**
   * Get tasks for a specific column
   */
  getTasksForColumn: (tasks, column) => {
    return tasks
      .filter(task => task.column === column)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Get all columns that have tasks
   */
  getActiveColumns: (tasks) => {
    const columns = new Set(tasks.map(task => task.column));
    return Array.from(columns);
  },

  /**
   * Get task statistics
   */
  getTaskStats: (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },

  /**
   * Get tasks for the current week
   */
  getTasksForWeek: (tasks) => {
    // For now, return all tasks - in future versions this could filter by date
    return tasks;
  }
};

export default BoardContext;
