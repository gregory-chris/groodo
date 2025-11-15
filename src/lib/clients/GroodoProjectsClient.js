import { ProjectStorageClient } from '../projectStorageClient.js';
import * as groodoProjectsApi from '../groodoApiProjectsClient.js';

/**
 * GroodoProjectsClient - Implements project storage using Groodo API server
 * For authenticated users
 */
export class GroodoProjectsClient extends ProjectStorageClient {
  /**
   * List all projects from Groodo API
   * @returns {Promise<Array>} Array of project objects
   */
  async listProjects() {
    try {
      const projects = await groodoProjectsApi.listProjects();
      return projects.map(project => this._transformFromApi(project));
    } catch (error) {
      console.error('Failed to load projects from Groodo API:', error);
      throw new Error(error.message || 'Failed to load projects from server');
    }
  }

  /**
   * Get a single project by ID
   * @param {number|string} projectId - Project ID
   * @returns {Promise<Object>} Project object
   */
  async getProject(projectId) {
    try {
      const project = await groodoProjectsApi.getProject(projectId);
      return this._transformFromApi(project);
    } catch (error) {
      console.error('Failed to get project from Groodo API:', error);
      throw new Error(error.message || 'Failed to get project from server');
    }
  }

  /**
   * Create a new project in Groodo API
   * @param {Object} project - Project object to create
   * @returns {Promise<Object>} Created project with server ID
   */
  async createProject(project) {
    try {
      const apiProject = this._transformToApi(project);
      const createdProject = await groodoProjectsApi.createProject(apiProject);
      return this._transformFromApi(createdProject);
    } catch (error) {
      console.error('Failed to create project on Groodo API:', error);
      throw new Error(error.message || 'Failed to create project on server');
    }
  }

  /**
   * Update an existing project in Groodo API
   * @param {number|string} projectId - ID of project to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated project object
   */
  async updateProject(projectId, updates) {
    try {
      const apiUpdates = this._transformToApi(updates);
      const updatedProject = await groodoProjectsApi.patchProject(projectId, apiUpdates);
      return this._transformFromApi(updatedProject);
    } catch (error) {
      console.error('Failed to update project on Groodo API:', error);
      throw new Error(error.message || 'Failed to update project on server');
    }
  }

  /**
   * Delete a project from Groodo API
   * @param {number|string} projectId - ID of project to delete
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    try {
      await groodoProjectsApi.deleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project from Groodo API:', error);
      throw new Error(error.message || 'Failed to delete project from server');
    }
  }

  /**
   * Get all tasks for a specific project
   * @param {number|string} projectId - Project ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of task objects
   */
  async getProjectTasks(projectId, options = {}) {
    try {
      const tasks = await groodoProjectsApi.getProjectTasks(projectId, options);
      // Tasks are already transformed by the task client
      return tasks;
    } catch (error) {
      console.error('Failed to get project tasks from Groodo API:', error);
      throw new Error(error.message || 'Failed to get project tasks from server');
    }
  }

  /**
   * Transform project from API format to internal format
   * @private
   */
  _transformFromApi(apiProject) {
    return {
      id: apiProject.id,
      name: apiProject.name || '',
      description: apiProject.description || '',
      url: apiProject.url || '',
      githubUrl: apiProject.githubUrl || '',
      color: apiProject.color || '',
      customFields: apiProject.customFields || {},
      createdAt: apiProject.createdAt || Date.now(),
      updatedAt: apiProject.updatedAt || Date.now(),
    };
  }

  /**
   * Transform project from internal format to API format
   * @private
   */
  _transformToApi(project) {
    const apiProject = {};
    
    if (project.name !== undefined) apiProject.name = project.name;
    if (project.description !== undefined) apiProject.description = project.description;
    if (project.url !== undefined) apiProject.url = project.url;
    if (project.githubUrl !== undefined) apiProject.githubUrl = project.githubUrl;
    if (project.color !== undefined) apiProject.color = project.color;
    if (project.customFields !== undefined) apiProject.customFields = project.customFields;
    
    return apiProject;
  }
}

