import React, { createContext, useContext, useReducer, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useProjectsPersistence } from '../hooks/useProjectsPersistence.js';

// Action types
const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SELECT_PROJECT: 'SELECT_PROJECT',
  SELECT_TASK: 'SELECT_TASK',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  MOVE_TASK: 'MOVE_TASK',
  TOGGLE_TASK_COMPLETE: 'TOGGLE_TASK_COMPLETE',
};

// Initial state
const initialState = {
  projects: [],
  tasks: [], // All tasks (will filter by projectId)
  selectedProjectId: null,
  selectedTaskId: null,
  loading: false,
  error: null,
};

// Reducer function
function projectsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_STATE:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };

    case ACTIONS.ADD_PROJECT: {
      const newProject = {
        id: action.payload.id || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: action.payload.name || 'Untitled Project',
        description: action.payload.description || '',
        url: action.payload.url || '',
        githubUrl: action.payload.githubUrl || '',
        color: action.payload.color || '',
        customFields: action.payload.customFields || {},
        createdAt: action.payload.createdAt || new Date().toISOString(),
        updatedAt: action.payload.updatedAt || new Date().toISOString(),
        ...action.payload,
      };

      return {
        ...state,
        projects: [...state.projects, newProject],
      };
    }

    case ACTIONS.UPDATE_PROJECT: {
      const { projectId, updates } = action.payload;
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === projectId
            ? { ...project, ...updates, updatedAt: new Date().toISOString() }
            : project
        ),
      };
    }

    case ACTIONS.DELETE_PROJECT: {
      const { projectId } = action.payload;
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== projectId),
        selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
      };
    }

    case ACTIONS.SELECT_PROJECT:
      return {
        ...state,
        selectedProjectId: action.payload,
        selectedTaskId: null, // Clear task selection when project changes
      };

    case ACTIONS.SELECT_TASK:
      return {
        ...state,
        selectedTaskId: action.payload,
      };

    case ACTIONS.ADD_TASK: {
      const newTask = {
        id: action.payload.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: action.payload.title || '',
        content: action.payload.content || '',
        projectId: action.payload.projectId,
        parentId: action.payload.parentId || null,
        completed: false,
        createdAt: Date.now(),
        order: action.payload.order ?? 0,
        ...action.payload,
      };

      return {
        ...state,
        tasks: [...state.tasks, newTask],
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
        ),
      };
    }

    case ACTIONS.DELETE_TASK: {
      const { taskId } = action.payload;
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskId),
        selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
      };
    }

    case ACTIONS.MOVE_TASK: {
      const { taskId, newParentId, newOrder } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, parentId: newParentId, order: newOrder }
            : task
        ),
      };
    }

    case ACTIONS.TOGGLE_TASK_COMPLETE: {
      const { taskId } = action.payload;
      const targetTask = state.tasks.find(task => task.id === taskId);
      if (!targetTask) return state;

      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    }

    default:
      return state;
  }
}

// Create context
const ProjectsContext = createContext(null);

// Provider component
export function ProjectsProvider({ children }) {
  const [state, dispatch] = useReducer(projectsReducer, initialState);
  
  // Initialize persistence hook for auto-save, load, error handling
  const persistence = useProjectsPersistence(state, dispatch);

  // Action creators with immediate persistence
  const addProject = useCallback((projectData) => {
    const tempId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newProject = { 
      ...projectData, 
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Optimistic update
    dispatch({
      type: ACTIONS.ADD_PROJECT,
      payload: newProject,
    });
    
    // Async sync
    persistence.handleCreateProject(newProject, dispatch);
    
    return tempId;
  }, [persistence]);

  const updateProject = useCallback((projectId, updates) => {
    const previousProject = state.projects.find(p => p.id === projectId);
    
    // Optimistic update
    dispatch({
      type: ACTIONS.UPDATE_PROJECT,
      payload: { projectId, updates },
    });
    
    // Async sync with rollback
    if (previousProject) {
      persistence.handleUpdateProject(projectId, updates, previousProject, dispatch);
    }
  }, [persistence, state.projects]);

  const deleteProject = useCallback((projectId) => {
    const projectToDelete = state.projects.find(p => p.id === projectId);
    
    // Optimistic delete
    dispatch({
      type: ACTIONS.DELETE_PROJECT,
      payload: { projectId },
    });
    
    // Async sync with rollback
    if (projectToDelete) {
      persistence.handleDeleteProject(projectId, projectToDelete, dispatch);
    }
  }, [persistence, state.projects]);

  const selectProject = useCallback((projectId) => {
    dispatch({
      type: ACTIONS.SELECT_PROJECT,
      payload: projectId,
    });
    
    // Save to localStorage for persistence
    if (projectId) {
      localStorage.setItem('groodo_selected_project', projectId);
    } else {
      localStorage.removeItem('groodo_selected_project');
    }
  }, []);

  const selectTask = useCallback((taskId) => {
    dispatch({
      type: ACTIONS.SELECT_TASK,
      payload: taskId,
    });
    
    // Save to localStorage for persistence
    if (taskId) {
      localStorage.setItem('groodo_selected_task', taskId);
    } else {
      localStorage.removeItem('groodo_selected_task');
    }
  }, []);

  const addTask = useCallback((taskData) => {
    const tempId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask = { 
      ...taskData, 
      id: tempId,
      completed: false,
      createdAt: Date.now(),
    };
    
    // Optimistic update
    dispatch({
      type: ACTIONS.ADD_TASK,
      payload: newTask,
    });
    
    // Async sync
    persistence.handleCreateTask(newTask, dispatch);
    
    return tempId;
  }, [persistence]);

  const updateTask = useCallback((taskId, updates) => {
    const previousTask = state.tasks.find(t => t.id === taskId);
    
    // Optimistic update
    dispatch({
      type: ACTIONS.UPDATE_TASK,
      payload: { taskId, updates },
    });
    
    // Async sync with rollback
    if (previousTask) {
      persistence.handleUpdateTask(taskId, updates, previousTask, dispatch);
    }
  }, [persistence, state.tasks]);

  const deleteTask = useCallback((taskId) => {
    const taskToDelete = state.tasks.find(t => t.id === taskId);
    
    // Optimistic delete
    dispatch({
      type: ACTIONS.DELETE_TASK,
      payload: { taskId },
    });
    
    // Async sync with rollback
    if (taskToDelete) {
      persistence.handleDeleteTask(taskId, taskToDelete, dispatch);
    }
  }, [persistence, state.tasks]);

  const toggleTaskComplete = useCallback((taskId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousTask = { ...task };
    
    // Optimistic update
    dispatch({
      type: ACTIONS.TOGGLE_TASK_COMPLETE,
      payload: { taskId },
    });
    
    // Async sync with rollback
    persistence.handleUpdateTask(taskId, { completed: !task.completed }, previousTask, dispatch);
  }, [persistence, state.tasks]);

  const moveTask = useCallback((taskId, newParentId, newOrder) => {
    const previousTask = state.tasks.find(t => t.id === taskId);
    
    // Optimistic update
    dispatch({
      type: ACTIONS.MOVE_TASK,
      payload: { taskId, newParentId, newOrder },
    });
    
    // Async sync with rollback
    if (previousTask) {
      persistence.handleUpdateTask(
        taskId, 
        { parentId: newParentId, order: newOrder }, 
        previousTask, 
        dispatch
      );
    }
  }, [persistence, state.tasks]);

  const value = {
    state,
    isLoading: persistence.isLoading,
    error: persistence.error,
    // Project actions
    addProject,
    updateProject,
    deleteProject,
    selectProject,
    // Task actions
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    moveTask,
    selectTask,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

ProjectsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the ProjectsContext
export function useProjectsContext() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
}

export { ACTIONS };

