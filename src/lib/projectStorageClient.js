/**
 * Base class defining the interface for project storage clients.
 * Both LocalStorageProjectsClient and GroodoProjectsClient implement this interface.
 */
export class ProjectStorageClient {
  /**
   * List all projects from storage
   * @returns {Promise<Array>} Array of project objects
   */
  async listProjects() {
    throw new Error('listProjects() must be implemented by subclass');
  }

  /**
   * Get a single project by ID
   * @param {number|string} projectId - Project ID
   * @returns {Promise<Object>} Project object
   */
  async getProject(projectId) {
    throw new Error('getProject() must be implemented by subclass');
  }

  /**
   * Create a new project in storage
   * @param {Object} project - Project object to create
   * @returns {Promise<Object>} Created project with server/storage ID
   */
  async createProject(project) {
    throw new Error('createProject() must be implemented by subclass');
  }

  /**
   * Update an existing project in storage
   * @param {number|string} projectId - ID of project to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated project object
   */
  async updateProject(projectId, updates) {
    throw new Error('updateProject() must be implemented by subclass');
  }

  /**
   * Delete a project from storage
   * @param {number|string} projectId - ID of project to delete
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    throw new Error('deleteProject() must be implemented by subclass');
  }

  /**
   * Get all tasks for a specific project
   * @param {number|string} projectId - Project ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of task objects
   */
  async getProjectTasks(projectId, options) {
    throw new Error('getProjectTasks() must be implemented by subclass');
  }
}

