/**
 * Base class defining the interface for task storage clients.
 * Both LocalStorageClient and GroodoApiClient implement this interface.
 */
export class TaskStorageClient {
  /**
   * List all tasks from storage
   * @returns {Promise<Array>} Array of task objects
   */
  async listTasks() {
    throw new Error('listTasks() must be implemented by subclass');
  }

  /**
   * Create a new task in storage
   * @param {Object} task - Task object to create
   * @returns {Promise<Object>} Created task with server/storage ID
   */
  async createTask(task) {
    throw new Error('createTask() must be implemented by subclass');
  }

  /**
   * Update an existing task in storage
   * @param {string|number} taskId - ID of task to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated task object
   */
  async updateTask(taskId, updates) {
    throw new Error('updateTask() must be implemented by subclass');
  }

  /**
   * Delete a task from storage
   * @param {string|number} taskId - ID of task to delete
   * @returns {Promise<void>}
   */
  async deleteTask(taskId) {
    throw new Error('deleteTask() must be implemented by subclass');
  }
}

