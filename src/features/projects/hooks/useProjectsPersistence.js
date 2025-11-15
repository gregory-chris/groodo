import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { GroodoProjectsClient } from '../../../lib/clients/GroodoProjectsClient.js';
import { LocalStorageProjectsClient } from '../../../lib/clients/LocalStorageProjectsClient.js';
import { GroodoApiClient } from '../../../lib/clients/GroodoApiClient.js';
import { LocalStorageClient } from '../../../lib/clients/LocalStorageClient.js';
import toast from 'react-hot-toast';

/**
 * Hook for persisting projects and tasks to storage (API or localStorage)
 * Handles automatic loading, saving, and error recovery
 */
export function useProjectsPersistence(state, dispatch) {
  const { status } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine which client to use based on auth status
  const projectsClient = useMemo(() => {
    return status === 'authenticated' 
      ? new GroodoProjectsClient()
      : new LocalStorageProjectsClient();
  }, [status]);

  const tasksClient = useMemo(() => {
    return status === 'authenticated'
      ? new GroodoApiClient()
      : new LocalStorageClient();
  }, [status]);

  /**
   * Load data from storage with error handling
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load projects
      const projects = await projectsClient.listProjects();
      
      // Load all tasks (will filter by projectId in components)
      const tasks = await tasksClient.listTasks();
      
      // Load last selected project and task from localStorage
      const selectedProjectId = localStorage.getItem('groodo_selected_project');
      const selectedTaskId = localStorage.getItem('groodo_selected_task');
      
      dispatch({ 
        type: 'LOAD_STATE', 
        payload: { 
          projects,
          tasks,
          selectedProjectId: selectedProjectId || (projects.length > 0 ? projects[0].id : null),
          selectedTaskId: selectedTaskId || null,
        }
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load projects: ' + (err.message || 'Unknown error'));
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [projectsClient, tasksClient, dispatch]);

  /**
   * Load data on mount and when auth status changes
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handle creating a project with optimistic update and rollback on failure
   */
  const handleCreateProject = useCallback(async (project, projectDispatch) => {
    try {
      const createdProject = await projectsClient.createProject(project);
      
      // Update temp ID with server/storage ID
      projectDispatch({ 
        type: 'UPDATE_PROJECT', 
        payload: { 
          projectId: project.id, 
          updates: { 
            id: createdProject.id,
            createdAt: createdProject.createdAt,
            updatedAt: createdProject.updatedAt,
          } 
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to create project:', error);
      
      // Rollback: remove the project
      projectDispatch({ 
        type: 'DELETE_PROJECT', 
        payload: { projectId: project.id }
      });
      
      toast.error('Failed to create project: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [projectsClient]);

  /**
   * Handle updating a project with rollback on failure
   */
  const handleUpdateProject = useCallback(async (projectId, updates, previousProject, projectDispatch) => {
    try {
      await projectsClient.updateProject(projectId, updates);
      return { success: true };
    } catch (error) {
      console.error('Failed to update project:', error);
      
      // Rollback to previous values
      projectDispatch({ 
        type: 'UPDATE_PROJECT', 
        payload: { 
          projectId, 
          updates: previousProject 
        }
      });
      
      toast.error('Failed to update project: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [projectsClient]);

  /**
   * Handle deleting a project with rollback on failure
   */
  const handleDeleteProject = useCallback(async (projectId, project, projectDispatch) => {
    try {
      await projectsClient.deleteProject(projectId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete project:', error);
      
      // Rollback: restore the project
      projectDispatch({ 
        type: 'ADD_PROJECT', 
        payload: project 
      });
      
      toast.error('Failed to delete project: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [projectsClient]);

  /**
   * Handle creating a task with optimistic update and rollback on failure
   */
  const handleCreateTask = useCallback(async (task, taskDispatch) => {
    try {
      const createdTask = await tasksClient.createTask(task);
      
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
  }, [tasksClient]);

  /**
   * Handle updating a task with rollback on failure
   */
  const handleUpdateTask = useCallback(async (taskId, updates, previousTask, taskDispatch) => {
    try {
      await tasksClient.updateTask(taskId, updates);
      return { success: true };
    } catch (error) {
      console.error('Failed to update task:', error);
      
      // Rollback to previous values
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
  }, [tasksClient]);

  /**
   * Handle deleting a task with rollback on failure
   */
  const handleDeleteTask = useCallback(async (taskId, task, taskDispatch) => {
    try {
      await tasksClient.deleteTask(taskId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete task:', error);
      
      // Rollback: restore the task
      taskDispatch({ 
        type: 'ADD_TASK', 
        payload: task 
      });
      
      toast.error('Failed to delete task: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [tasksClient]);

  return {
    isLoading,
    error,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  };
}

