import { TaskStorageClient } from '../taskStorageClient.js';
import { saveState, loadState } from '../storage.js';

/**
 * LocalStorageClient - Implements task storage using browser localStorage
 * For guest users or when not authenticated
 */
export class LocalStorageClient extends TaskStorageClient {
  /**
   * List all tasks from localStorage
   * @returns {Promise<Array>} Array of task objects
   */
  async listTasks() {
    try {
      const state = await loadState();
      return state?.tasks || [];
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
      return [];
    }
  }

  /**
   * Create a new task in localStorage
   * @param {Object} task - Task object to create
   * @returns {Promise<Object>} Created task with generated ID
   */
  async createTask(task) {
    try {
      const state = await loadState();
      const tasks = state?.tasks || [];
      
      // Generate ID if not provided
      const newTask = {
        ...task,
        id: task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: task.createdAt || Date.now(),
      };
      
      // Add to tasks array
      const updatedTasks = [...tasks, newTask];
      
      // Save to localStorage
      await saveState({ ...state, tasks: updatedTasks });
      
      return newTask;
    } catch (error) {
      console.error('Failed to create task in localStorage:', error);
      throw new Error('Failed to save task locally');
    }
  }

  /**
   * Update an existing task in localStorage
   * @param {string|number} taskId - ID of task to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated task object
   */
  async updateTask(taskId, updates) {
    try {
      const state = await loadState();
      const tasks = state?.tasks || [];
      
      // Find and update the task
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error(`Task with id ${taskId} not found`);
      }
      
      const updatedTask = { ...tasks[taskIndex], ...updates };
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      
      // Save to localStorage
      await saveState({ ...state, tasks: updatedTasks });
      
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task in localStorage:', error);
      throw new Error('Failed to update task locally');
    }
  }

  /**
   * Delete a task from localStorage
   * @param {string|number} taskId - ID of task to delete
   * @returns {Promise<void>}
   */
  async deleteTask(taskId) {
    try {
      const state = await loadState();
      const tasks = state?.tasks || [];
      
      // Remove the task
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      
      // Save to localStorage
      await saveState({ ...state, tasks: updatedTasks });
    } catch (error) {
      console.error('Failed to delete task from localStorage:', error);
      throw new Error('Failed to delete task locally');
    }
  }
}

