import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { saveState, loadState } from '../../../lib/storage.js';
import { getCurrentWeek, getNextWeek, getPreviousWeek } from '../../../lib/date.js';
import { usePersistence } from '../hooks/usePersistence.js';
import TaskModal from '../components/TaskModal';

// Action types
const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
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
      const newTask = {
        id: action.payload.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: action.payload.title || '',
        content: action.payload.content || '',
        column: action.payload.column || 'general',
        completed: false,
        createdAt: Date.now(),
        order: action.payload.order ?? state.tasks.filter(t => t.column === action.payload.column).length,
        ...action.payload
      };

      return {
        ...state,
        tasks: [...state.tasks, newTask]
      };
    }

    case ACTIONS.UPDATE_TASK: {
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
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
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
      targetColumnTasks.splice(targetOrder, 0, { ...movingTask, column: targetColumn });
      
      // Reassign order values to all tasks in the target column
      const reorderedTargetTasks = targetColumnTasks.map((task, index) => ({
        ...task,
        order: index
      }));
      
      // Create the final updated tasks array
      const updatedTasks = state.tasks.map(task => {
        if (task.id === taskId) {
          // This is the moving task - find it in the reordered array
          const reorderedTask = reorderedTargetTasks.find(t => t.id === task.id);
          return reorderedTask || { ...task, column: targetColumn, order: targetOrder };
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

  // Action creators
  const addTask = useCallback((titleOrData, column, content = '') => {
    const taskData = typeof titleOrData === 'string' 
      ? { title: titleOrData, column, content }
      : titleOrData;
    dispatch({
      type: ACTIONS.ADD_TASK,
      payload: taskData
    });
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_TASK,
      payload: { taskId, updates }
    });
  }, []);

  const deleteTask = useCallback((taskId) => {
    dispatch({
      type: ACTIONS.DELETE_TASK,
      payload: { taskId }
    });
  }, []);

  const toggleTaskComplete = useCallback((taskId) => {
    dispatch({
      type: ACTIONS.TOGGLE_TASK_COMPLETE,
      payload: { taskId }
    });
  }, []);

  const moveTask = useCallback((taskId, targetColumn, targetOrder) => {
    dispatch({
      type: ACTIONS.MOVE_TASK,
      payload: { taskId, targetColumn, targetOrder }
    });
  }, []);

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

  const handleModalSave = useCallback((taskIdOrData, updates) => {
    if (modalState.mode === 'edit') {
      // Edit existing task
      updateTask(taskIdOrData, updates);
    } else {
      // Create new task
      addTask(taskIdOrData.title, modalState.column, taskIdOrData.content);
    }
    handleModalClose();
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

// Hook to use the board context
export function useBoardContext() {
  const context = useContext(BoardContext);
  
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  
  return context;
}

// Helper functions for working with tasks
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
  getTasksForWeek: (tasks, week) => {
    // For now, return all tasks - in future versions this could filter by date
    return tasks;
  }
};

export default BoardContext;
