/**
 * Utility functions for managing hierarchical tasks
 */

const MAX_NESTING_LEVEL = 3;

/**
 * Build a tree structure from a flat list of tasks
 * @param {Array} flatTasks - Flat array of tasks with parentId references
 * @returns {Array} Array of root tasks with nested children
 */
export function buildTaskTree(flatTasks) {
  if (!Array.isArray(flatTasks)) return [];

  // Create a map for quick lookup
  const taskMap = new Map();
  flatTasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Build the tree
  const rootTasks = [];
  taskMap.forEach(task => {
    if (task.parentId === null || task.parentId === undefined) {
      rootTasks.push(task);
    } else {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.children.push(task);
      } else {
        // Orphaned task - treat as root
        rootTasks.push(task);
      }
    }
  });

  // Sort each level by completion status and order
  const sortTasks = (tasks) => {
    tasks.sort((a, b) => {
      // Completed tasks go to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Within same completion status, sort by order
      return (a.order || 0) - (b.order || 0);
    });
    
    // Recursively sort children
    tasks.forEach(task => {
      if (task.children && task.children.length > 0) {
        sortTasks(task.children);
      }
    });
  };

  sortTasks(rootTasks);
  return rootTasks;
}

/**
 * Get the nesting level of a task
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks to search for parents
 * @returns {number} Nesting level (0 for root, 1 for direct child, etc.)
 */
export function getTaskLevel(task, allTasks) {
  if (!task || task.parentId === null || task.parentId === undefined) {
    return 0;
  }

  let level = 0;
  let currentId = task.parentId;
  const visited = new Set(); // Prevent infinite loops

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const parent = allTasks.find(t => t.id === currentId);
    if (!parent) break;
    
    level++;
    currentId = parent.parentId;
  }

  return level;
}

/**
 * Check if a task can have sub-tasks added (not at max nesting level)
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks to check nesting level
 * @returns {boolean} True if sub-task can be added
 */
export function canAddSubTask(task, allTasks) {
  const level = getTaskLevel(task, allTasks);
  return level < MAX_NESTING_LEVEL - 1; // -1 because we're adding a child
}

/**
 * Check if all children of a task are completed
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks to check children
 * @returns {boolean} True if all children are completed
 */
export function areAllChildrenCompleted(task, allTasks) {
  const children = allTasks.filter(t => t.parentId === task.id);
  if (children.length === 0) return true;
  
  return children.every(child => {
    if (!child.completed) return false;
    // Recursively check grandchildren
    return areAllChildrenCompleted(child, allTasks);
  });
}

/**
 * Check if a task can be marked as completed
 * A task can only be completed if all its sub-tasks are completed
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks to check children
 * @returns {boolean} True if task can be completed
 */
export function canCompleteTask(task, allTasks) {
  if (task.completed) return true; // Already completed
  return areAllChildrenCompleted(task, allTasks);
}

/**
 * Check if a task has any children
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks to check
 * @returns {boolean} True if task has children
 */
export function hasChildren(task, allTasks) {
  return allTasks.some(t => t.parentId === task.id);
}

/**
 * Check if a task can be deleted
 * Tasks with children cannot be deleted
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks to check children
 * @returns {boolean} True if task can be deleted
 */
export function canDeleteTask(task, allTasks) {
  return !hasChildren(task, allTasks);
}

/**
 * Get all children (recursive) of a task
 * @param {string} taskId - Task ID
 * @param {Array} allTasks - All tasks
 * @returns {Array} Array of all descendant tasks
 */
export function getAllDescendants(taskId, allTasks) {
  const descendants = [];
  const children = allTasks.filter(t => t.parentId === taskId);
  
  children.forEach(child => {
    descendants.push(child);
    // Recursively get grandchildren
    const grandchildren = getAllDescendants(child.id, allTasks);
    descendants.push(...grandchildren);
  });
  
  return descendants;
}

/**
 * Move completed tasks to the end of their level
 * @param {Array} tasks - Flat array of tasks
 * @returns {Array} Sorted array of tasks
 */
export function moveCompletedToEnd(tasks) {
  return [...tasks].sort((a, b) => {
    // First, sort by parent (keep siblings together)
    const parentA = a.parentId || '';
    const parentB = b.parentId || '';
    if (parentA !== parentB) {
      return parentA.localeCompare(parentB);
    }
    
    // Within same parent, completed tasks go to the end
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Within same completion status, sort by order
    return (a.order || 0) - (b.order || 0);
  });
}

/**
 * Check if a project can be deleted
 * Projects with incomplete tasks cannot be deleted
 * @param {string} projectId - Project ID
 * @param {Array} allTasks - All tasks to check
 * @returns {boolean} True if project can be deleted
 */
export function canDeleteProject(projectId, allTasks) {
  const projectTasks = allTasks.filter(t => t.projectId === projectId);
  return projectTasks.every(t => t.completed);
}

/**
 * Get tasks for a specific project, filtered by parent
 * @param {string} projectId - Project ID
 * @param {string|null} parentId - Parent task ID (null for root tasks)
 * @param {Array} allTasks - All tasks
 * @returns {Array} Filtered and sorted tasks
 */
export function getTasksByParent(projectId, parentId, allTasks) {
  return allTasks
    .filter(t => 
      t.projectId === projectId && 
      (parentId === null ? (t.parentId === null || t.parentId === undefined) : t.parentId === parentId)
    )
    .sort((a, b) => {
      // Completed tasks go to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Within same completion status, sort by order
      return (a.order || 0) - (b.order || 0);
    });
}

/**
 * Reorder tasks within the same parent
 * @param {Array} tasks - All tasks
 * @param {string} taskId - Task being moved
 * @param {number} newIndex - New position
 * @returns {Array} Updated tasks with new order values
 */
export function reorderTasks(tasks, taskId, newIndex) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return tasks;

  // Get siblings (tasks with same parent)
  const siblings = tasks.filter(t => 
    t.projectId === task.projectId && 
    t.parentId === task.parentId
  );

  // Sort siblings by current order
  const sortedSiblings = siblings.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Remove the task from its current position
  const currentIndex = sortedSiblings.findIndex(t => t.id === taskId);
  if (currentIndex === -1) return tasks;
  
  sortedSiblings.splice(currentIndex, 1);
  sortedSiblings.splice(newIndex, 0, task);
  
  // Reassign order values
  const updatedTasks = tasks.map(t => {
    const siblingIndex = sortedSiblings.findIndex(s => s.id === t.id);
    if (siblingIndex !== -1) {
      return { ...t, order: siblingIndex };
    }
    return t;
  });

  return updatedTasks;
}

