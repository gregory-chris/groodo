import React, { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * WorkspaceContext - Manages workspace state and switching logic
 * Provides smooth vertical slide animations with Apple-like easing
 */

const WorkspaceContext = createContext();

// Workspace types
export const WORKSPACE_TYPES = {
  CALENDAR: 'calendar',
  PROJECTS: 'projects',
  NOTES: 'notes'
};

// Action types
const WORKSPACE_ACTIONS = {
  SWITCH_WORKSPACE: 'SWITCH_WORKSPACE',
  SET_ANIMATION_STATE: 'SET_ANIMATION_STATE'
};

// Initial state
const initialState = {
  activeWorkspace: WORKSPACE_TYPES.CALENDAR,
  previousWorkspace: null,
  isAnimating: false,
  animationDirection: null // 'up' or 'down'
};

// Workspace order for animation calculations
const WORKSPACE_ORDER = [
  WORKSPACE_TYPES.CALENDAR,
  WORKSPACE_TYPES.PROJECTS,
  WORKSPACE_TYPES.NOTES
];

/**
 * Reducer for workspace state management
 */
function workspaceReducer(state, action) {
  switch (action.type) {
    case WORKSPACE_ACTIONS.SWITCH_WORKSPACE:
      if (action.payload === state.activeWorkspace) {
        return state; // No change needed
      }

      const currentIndex = WORKSPACE_ORDER.indexOf(state.activeWorkspace);
      const newIndex = WORKSPACE_ORDER.indexOf(action.payload);
      const direction = newIndex > currentIndex ? 'down' : 'up';

      return {
        ...state,
        previousWorkspace: state.activeWorkspace,
        activeWorkspace: action.payload,
        isAnimating: true,
        animationDirection: direction
      };

    case WORKSPACE_ACTIONS.SET_ANIMATION_STATE:
      return {
        ...state,
        isAnimating: action.payload
      };

    default:
      return state;
  }
}

/**
 * WorkspaceProvider component
 */
export function WorkspaceProvider({ children }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  /**
   * Switch to a different workspace with animation
   */
  const switchWorkspace = useCallback((workspaceId) => {
    if (!Object.values(WORKSPACE_TYPES).includes(workspaceId)) {
      console.warn(`Invalid workspace ID: ${workspaceId}`);
      return;
    }

    dispatch({
      type: WORKSPACE_ACTIONS.SWITCH_WORKSPACE,
      payload: workspaceId
    });

    // Reset animation state after transition completes
    setTimeout(() => {
      dispatch({
        type: WORKSPACE_ACTIONS.SET_ANIMATION_STATE,
        payload: false
      });
    }, 600); // Match CSS transition duration
  }, []);

  /**
   * Get the translateY value for workspace positioning
   */
  const getWorkspaceTransform = useCallback((workspaceId) => {
    const activeIndex = WORKSPACE_ORDER.indexOf(state.activeWorkspace);
    const workspaceIndex = WORKSPACE_ORDER.indexOf(workspaceId);
    const offset = workspaceIndex - activeIndex;
    
    return `translateY(${offset * 100}vh)`;
  }, [state.activeWorkspace]);

  /**
   * Check if a workspace is currently visible
   */
  const isWorkspaceVisible = useCallback((workspaceId) => {
    return state.activeWorkspace === workspaceId;
  }, [state.activeWorkspace]);

  const contextValue = {
    // State
    activeWorkspace: state.activeWorkspace,
    previousWorkspace: state.previousWorkspace,
    isAnimating: state.isAnimating,
    animationDirection: state.animationDirection,
    
    // Actions
    switchWorkspace,
    
    // Utilities
    getWorkspaceTransform,
    isWorkspaceVisible,
    
    // Constants
    WORKSPACE_TYPES,
    WORKSPACE_ORDER
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

WorkspaceProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to use workspace context
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
}

export default WorkspaceContext;
