import { TaskStorageClient } from '../taskStorageClient.js';
import * as groodoApi from '../groodoApiTasksClient.js';

/**
 * GroodoApiClient - Implements task storage using Groodo API server
 * For authenticated users
 */
export class GroodoApiClient extends TaskStorageClient {
  /**
   * List all tasks from Groodo API
   * @returns {Promise<Array>} Array of task objects
   */
  async listTasks() {
    try {
      const tasks = await groodoApi.listTasks();
      
      // Transform API format to internal format
      return tasks.map(task => this._transformFromApi(task));
    } catch (error) {
      console.error('Failed to load tasks from Groodo API:', error);
      throw new Error(error.message || 'Failed to load tasks from server');
    }
  }

  /**
   * Create a new task in Groodo API
   * @param {Object} task - Task object to create
   * @returns {Promise<Object>} Created task with server ID
   */
  async createTask(task) {
    try {
      // Transform to API format
      const apiTask = this._transformToApi(task);
      
      // Send to server
      const createdTask = await groodoApi.createTask(apiTask);
      
      // Transform back to internal format
      return this._transformFromApi(createdTask);
    } catch (error) {
      console.error('Failed to create task on Groodo API:', error);
      throw new Error(error.message || 'Failed to create task on server');
    }
  }

  /**
   * Update an existing task in Groodo API
   * @param {string|number} taskId - ID of task to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated task object
   */
  async updateTask(taskId, updates) {
    try {
      // Transform to API format
      const apiUpdates = this._transformToApi(updates);
      
      // Send to server
      const updatedTask = await groodoApi.updateTask(taskId, apiUpdates);
      
      // Transform back to internal format
      return this._transformFromApi(updatedTask);
    } catch (error) {
      console.error('Failed to update task on Groodo API:', error);
      throw new Error(error.message || 'Failed to update task on server');
    }
  }

  /**
   * Delete a task from Groodo API
   * @param {string|number} taskId - ID of task to delete
   * @returns {Promise<void>}
   */
  async deleteTask(taskId) {
    try {
      await groodoApi.deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task from Groodo API:', error);
      throw new Error(error.message || 'Failed to delete task from server');
    }
  }

  /**
   * Transform task from API format to internal format
   * API format: { id, title, description, date, order, completed, createdAt, projectId, parentId }
   * Internal format: { id, title, content, column, order, completed, createdAt, projectId, parentId }
   * @private
   */
  _transformFromApi(apiTask) {
    return {
      id: apiTask.id,
      title: apiTask.title || '',
      content: apiTask.description || '',
      column: apiTask.date || new Date().toISOString().split('T')[0],
      order: typeof apiTask.order === 'number' ? apiTask.order : 0,
      completed: !!apiTask.completed,
      createdAt: apiTask.createdAt || Date.now(),
      projectId: apiTask.projectId || null,
      parentId: apiTask.parentId || null,
    };
  }

  /**
   * Transform task from internal format to API format
   * @private
   */
  _transformToApi(task) {
    const apiTask = {};
    
    if (task.title !== undefined) apiTask.title = task.title;
    if (task.content !== undefined) apiTask.description = task.content;
    if (task.column !== undefined) apiTask.date = task.column;
    if (task.order !== undefined) apiTask.order = task.order;
    if (task.completed !== undefined) apiTask.completed = task.completed;
    if (task.projectId !== undefined) apiTask.projectId = task.projectId;
    if (task.parentId !== undefined) apiTask.parentId = task.parentId;
    
    return apiTask;
  }

  // Project management methods

  /**
   * List all projects from Groodo API
   * @returns {Promise<Array>} Array of project objects
   */
  async listProjects() {
    try {
      const projects = await groodoApi.listProjects();
      
      // Transform API format to internal format
      return projects.map(project => this._transformProjectFromApi(project));
    } catch (error) {
      console.error('Failed to load projects from Groodo API:', error);
      throw new Error(error.message || 'Failed to load projects from server');
    }
  }

  /**
   * Create a new project in Groodo API
   * @param {Object} project - Project object to create
   * @returns {Promise<Object>} Created project with server ID
   */
  async createProject(project) {
    try {
      // Transform to API format
      const apiProject = this._transformProjectToApi(project);
      
      // Send to server
      const createdProject = await groodoApi.createProject(apiProject);
      
      // Transform back to internal format
      return this._transformProjectFromApi(createdProject);
    } catch (error) {
      console.error('Failed to create project on Groodo API:', error);
      throw new Error(error.message || 'Failed to create project on server');
    }
  }

  /**
   * Get a specific project from Groodo API
   * @param {string|number} projectId - ID of project to fetch
   * @returns {Promise<Object>} Project object
   */
  async getProject(projectId) {
    try {
      const project = await groodoApi.getProject(projectId);
      
      // Transform API format to internal format
      return this._transformProjectFromApi(project);
    } catch (error) {
      console.error('Failed to load project from Groodo API:', error);
      throw new Error(error.message || 'Failed to load project from server');
    }
  }

  /**
   * Update an existing project in Groodo API
   * @param {string|number} projectId - ID of project to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated project object
   */
  async updateProject(projectId, updates) {
    try {
      // Transform to API format
      const apiUpdates = this._transformProjectToApi(updates);
      
      // Send to server
      const updatedProject = await groodoApi.updateProject(projectId, apiUpdates);
      
      // Transform back to internal format
      return this._transformProjectFromApi(updatedProject);
    } catch (error) {
      console.error('Failed to update project on Groodo API:', error);
      throw new Error(error.message || 'Failed to update project on server');
    }
  }

  /**
   * Delete a project from Groodo API
   * @param {string|number} projectId - ID of project to delete
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    try {
      await groodoApi.deleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project from Groodo API:', error);
      throw new Error(error.message || 'Failed to delete project from server');
    }
  }

  /**
   * List all tasks for a specific project from Groodo API
   * @param {string|number} projectId - ID of project to fetch tasks for
   * @returns {Promise<Array>} Array of task objects
   */
  async listProjectTasks(projectId) {
    try {
      const tasks = await groodoApi.listProjectTasks(projectId);
      
      // Transform API format to internal format
      return tasks.map(task => this._transformFromApi(task));
    } catch (error) {
      console.error('Failed to load project tasks from Groodo API:', error);
      throw new Error(error.message || 'Failed to load project tasks from server');
    }
  }

  /**
   * Transform project from API format to internal format
   * @private
   */
  _transformProjectFromApi(apiProject) {
    return {
      id: apiProject.id,
      name: apiProject.name || '',
      description: apiProject.description || '',
      createdAt: apiProject.createdAt || Date.now(),
      updatedAt: apiProject.updatedAt || Date.now(),
    };
  }

  /**
   * Transform project from internal format to API format
   * @private
   */
  _transformProjectToApi(project) {
    const apiProject = {};
    
    if (project.name !== undefined) apiProject.name = project.name;
    if (project.description !== undefined) apiProject.description = project.description;
    
    return apiProject;
  }
}

