import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { saveState, loadState } from '../../../lib/storage.js';
import { getCurrentWeek, getNextWeek, getPreviousWeek } from '../../../lib/date.js';

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
        description: action.payload.description || '',
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
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, column: targetColumn, order: targetOrder }
            : task
        )
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

  // Load initial state from storage and set current week
  useEffect(() => {
    try {
      const savedState = loadState();
      let currentWeek;
      
      if (savedState && savedState.currentWeek && savedState.currentWeek.start && savedState.currentWeek.end) {
        // Ensure currentWeek is a proper object with Date instances
        currentWeek = {
          start: new Date(savedState.currentWeek.start),
          end: new Date(savedState.currentWeek.end)
        };
      } else {
        currentWeek = getCurrentWeek();
      }

      if (savedState) {
        dispatch({
          type: ACTIONS.LOAD_STATE,
          payload: {
            ...savedState,
            currentWeek,
            tasks: savedState.tasks || []
          }
        });
      } else {
        // No saved state, just set the current week
        dispatch({
          type: ACTIONS.SET_CURRENT_WEEK,
          payload: currentWeek
        });
      }
    } catch (error) {
      console.warn('Failed to load saved state:', error);
      // Set current week as fallback
      dispatch({
        type: ACTIONS.SET_CURRENT_WEEK,
        payload: getCurrentWeek()
      });
    }
  }, []);

  // Save state to storage whenever it changes (but only after currentWeek is initialized)
  useEffect(() => {
    if (state.currentWeek) {
      try {
        saveState({
          tasks: state.tasks,
          currentWeek: state.currentWeek
        });
      } catch (error) {
        console.warn('Failed to save state:', error);
        // Continue operation even if saving fails
      }
    }
  }, [state.tasks, state.currentWeek]);

  // Action creators
  const addTask = useCallback((taskData) => {
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
    goToCurrentWeek
  };

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
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
