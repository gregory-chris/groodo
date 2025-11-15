import { ProjectStorageClient } from '../projectStorageClient.js';

const PROJECTS_STORAGE_KEY = 'groodo_projects';

/**
 * LocalStorageProjectsClient - Implements project storage using browser localStorage
 * For guest users or when not authenticated
 */
export class LocalStorageProjectsClient extends ProjectStorageClient {
  /**
   * List all projects from localStorage
   * @returns {Promise<Array>} Array of project objects
   */
  async listProjects() {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      const projects = stored ? JSON.parse(stored) : [];
      return projects;
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a single project by ID
   * @param {number|string} projectId - Project ID
   * @returns {Promise<Object>} Project object
   */
  async getProject(projectId) {
    try {
      const projects = await this.listProjects();
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      return project;
    } catch (error) {
      console.error('Failed to get project from localStorage:', error);
      throw new Error('Failed to get project locally');
    }
  }

  /**
   * Create a new project in localStorage
   * @param {Object} project - Project object to create
   * @returns {Promise<Object>} Created project with generated ID
   */
  async createProject(project) {
    try {
      const projects = await this.listProjects();
      
      // Generate ID if not provided
      const newProject = {
        ...project,
        id: project.id || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
      };
      
      // Add to projects array
      const updatedProjects = [...projects, newProject];
      
      // Save to localStorage
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
      
      return newProject;
    } catch (error) {
      console.error('Failed to create project in localStorage:', error);
      throw new Error('Failed to save project locally');
    }
  }

  /**
   * Update an existing project in localStorage
   * @param {number|string} projectId - ID of project to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated project object
   */
  async updateProject(projectId, updates) {
    try {
      const projects = await this.listProjects();
      
      // Find and update the project
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      
      const updatedProject = { 
        ...projects[projectIndex], 
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
      
      // Save to localStorage
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
      
      return updatedProject;
    } catch (error) {
      console.error('Failed to update project in localStorage:', error);
      throw new Error('Failed to update project locally');
    }
  }

  /**
   * Delete a project from localStorage
   * @param {number|string} projectId - ID of project to delete
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    try {
      const projects = await this.listProjects();
      
      // Remove the project
      const updatedProjects = projects.filter(p => p.id !== projectId);
      
      // Save to localStorage
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('Failed to delete project from localStorage:', error);
      throw new Error('Failed to delete project locally');
    }
  }

  /**
   * Get all tasks for a specific project
   * Note: Tasks are stored separately in the main tasks storage
   * This method returns an empty array as tasks are managed by TaskStorageClient
   * @param {number|string} projectId - Project ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of task objects
   */
  async getProjectTasks(projectId, options = {}) {
    // For localStorage, tasks are managed by the TaskStorageClient
    // This method is a placeholder - tasks should be filtered from the main tasks list
    return [];
  }
}

