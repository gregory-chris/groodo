import { describe, it, expect } from 'vitest';
import {
  buildTaskTree,
  getTaskLevel,
  canAddSubTask,
  areAllChildrenCompleted,
  canCompleteTask,
  hasChildren,
  canDeleteTask,
  getAllDescendants,
  moveCompletedToEnd,
  canDeleteProject,
  getTasksByParent,
  reorderTasks,
} from './taskHierarchy';

describe('taskHierarchy utilities', () => {
  describe('buildTaskTree', () => {
    it('should build a tree from flat tasks', () => {
      const tasks = [
        { id: '1', parentId: null, order: 0, completed: false },
        { id: '2', parentId: '1', order: 0, completed: false },
        { id: '3', parentId: '1', order: 1, completed: false },
        { id: '4', parentId: null, order: 1, completed: false },
      ];

      const tree = buildTaskTree(tasks);

      expect(tree).toHaveLength(2);
      expect(tree[0].id).toBe('1');
      expect(tree[0].children).toHaveLength(2);
      expect(tree[0].children[0].id).toBe('2');
      expect(tree[0].children[1].id).toBe('3');
      expect(tree[1].id).toBe('4');
    });

    it('should handle orphaned tasks', () => {
      const tasks = [
        { id: '1', parentId: 'nonexistent', order: 0, completed: false },
      ];

      const tree = buildTaskTree(tasks);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('1');
    });

    it('should sort tasks by completion status and order', () => {
      const tasks = [
        { id: '1', parentId: null, order: 1, completed: false },
        { id: '2', parentId: null, order: 0, completed: true },
        { id: '3', parentId: null, order: 0, completed: false },
      ];

      const tree = buildTaskTree(tasks);

      expect(tree[0].id).toBe('3'); // Incomplete, lower order
      expect(tree[1].id).toBe('1'); // Incomplete, higher order
      expect(tree[2].id).toBe('2'); // Completed, goes last
    });

    it('should return empty array for invalid input', () => {
      expect(buildTaskTree(null)).toEqual([]);
      expect(buildTaskTree(undefined)).toEqual([]);
      expect(buildTaskTree('not an array')).toEqual([]);
    });
  });

  describe('getTaskLevel', () => {
    it('should return 0 for root tasks', () => {
      const task = { id: '1', parentId: null };
      const allTasks = [task];

      expect(getTaskLevel(task, allTasks)).toBe(0);
    });

    it('should return 1 for direct children', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1' },
      ];

      expect(getTaskLevel(tasks[1], tasks)).toBe(1);
    });

    it('should return 2 for grandchildren', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1' },
        { id: '3', parentId: '2' },
      ];

      expect(getTaskLevel(tasks[2], tasks)).toBe(2);
    });

    it('should handle circular references', () => {
      const tasks = [
        { id: '1', parentId: '2' },
        { id: '2', parentId: '1' },
      ];

      // Should not infinite loop
      const level = getTaskLevel(tasks[0], tasks);
      expect(level).toBeGreaterThanOrEqual(0);
    });
  });

  describe('canAddSubTask', () => {
    it('should allow adding subtask at level 0', () => {
      const task = { id: '1', parentId: null };
      const allTasks = [task];

      expect(canAddSubTask(task, allTasks)).toBe(true);
    });

    it('should allow adding subtask at level 1', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1' },
      ];

      expect(canAddSubTask(tasks[1], tasks)).toBe(true);
    });

    it('should not allow adding subtask at level 2 (max depth)', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1' },
        { id: '3', parentId: '2' },
      ];

      expect(canAddSubTask(tasks[2], tasks)).toBe(false);
    });
  });

  describe('areAllChildrenCompleted', () => {
    it('should return true for task with no children', () => {
      const task = { id: '1', parentId: null };
      const allTasks = [task];

      expect(areAllChildrenCompleted(task, allTasks)).toBe(true);
    });

    it('should return true when all children are completed', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1', completed: true },
        { id: '3', parentId: '1', completed: true },
      ];

      expect(areAllChildrenCompleted(tasks[0], tasks)).toBe(true);
    });

    it('should return false when some children are incomplete', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1', completed: true },
        { id: '3', parentId: '1', completed: false },
      ];

      expect(areAllChildrenCompleted(tasks[0], tasks)).toBe(false);
    });

    it('should check grandchildren recursively', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1', completed: true },
        { id: '3', parentId: '2', completed: false },
      ];

      expect(areAllChildrenCompleted(tasks[0], tasks)).toBe(false);
    });
  });

  describe('canCompleteTask', () => {
    it('should allow completing task with no children', () => {
      const task = { id: '1', parentId: null, completed: false };
      const allTasks = [task];

      expect(canCompleteTask(task, allTasks)).toBe(true);
    });

    it('should allow completing already completed task', () => {
      const task = { id: '1', parentId: null, completed: true };
      const allTasks = [task];

      expect(canCompleteTask(task, allTasks)).toBe(true);
    });

    it('should not allow completing task with incomplete children', () => {
      const tasks = [
        { id: '1', parentId: null, completed: false },
        { id: '2', parentId: '1', completed: false },
      ];

      expect(canCompleteTask(tasks[0], tasks)).toBe(false);
    });

    it('should allow completing task when all children are complete', () => {
      const tasks = [
        { id: '1', parentId: null, completed: false },
        { id: '2', parentId: '1', completed: true },
      ];

      expect(canCompleteTask(tasks[0], tasks)).toBe(true);
    });
  });

  describe('hasChildren', () => {
    it('should return false for task with no children', () => {
      const task = { id: '1', parentId: null };
      const allTasks = [task];

      expect(hasChildren(task, allTasks)).toBe(false);
    });

    it('should return true for task with children', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1' },
      ];

      expect(hasChildren(tasks[0], tasks)).toBe(true);
    });
  });

  describe('canDeleteTask', () => {
    it('should allow deleting task with no children', () => {
      const task = { id: '1', parentId: null };
      const allTasks = [task];

      expect(canDeleteTask(task, allTasks)).toBe(true);
    });

    it('should not allow deleting task with children', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1' },
      ];

      expect(canDeleteTask(tasks[0], tasks)).toBe(false);
    });
  });

  describe('getAllDescendants', () => {
    it('should return empty array for task with no children', () => {
      const allTasks = [{ id: '1', parentId: null }];

      expect(getAllDescendants('1', allTasks)).toEqual([]);
    });

    it('should return all children and grandchildren', () => {
      const tasks = [
        { id: '1', parentId: null },
        { id: '2', parentId: '1' },
        { id: '3', parentId: '1' },
        { id: '4', parentId: '2' },
      ];

      const descendants = getAllDescendants('1', tasks);

      expect(descendants).toHaveLength(3);
      expect(descendants.map(t => t.id)).toContain('2');
      expect(descendants.map(t => t.id)).toContain('3');
      expect(descendants.map(t => t.id)).toContain('4');
    });
  });

  describe('moveCompletedToEnd', () => {
    it('should move completed tasks to the end', () => {
      const tasks = [
        { id: '1', parentId: null, completed: true, order: 0 },
        { id: '2', parentId: null, completed: false, order: 1 },
        { id: '3', parentId: null, completed: false, order: 2 },
      ];

      const sorted = moveCompletedToEnd(tasks);

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should keep siblings together', () => {
      const tasks = [
        { id: '1', parentId: 'a', completed: false, order: 0 },
        { id: '2', parentId: 'b', completed: false, order: 0 },
        { id: '3', parentId: 'a', completed: false, order: 1 },
      ];

      const sorted = moveCompletedToEnd(tasks);

      // Tasks with same parent should be together
      const task1Index = sorted.findIndex(t => t.id === '1');
      const task3Index = sorted.findIndex(t => t.id === '3');
      const task2Index = sorted.findIndex(t => t.id === '2');

      expect(Math.abs(task1Index - task3Index)).toBeLessThan(Math.abs(task1Index - task2Index));
    });
  });

  describe('canDeleteProject', () => {
    it('should allow deleting project with no tasks', () => {
      const allTasks = [];

      expect(canDeleteProject('project1', allTasks)).toBe(true);
    });

    it('should allow deleting project with all completed tasks', () => {
      const tasks = [
        { id: '1', projectId: 'project1', completed: true },
        { id: '2', projectId: 'project1', completed: true },
      ];

      expect(canDeleteProject('project1', tasks)).toBe(true);
    });

    it('should not allow deleting project with incomplete tasks', () => {
      const tasks = [
        { id: '1', projectId: 'project1', completed: true },
        { id: '2', projectId: 'project1', completed: false },
      ];

      expect(canDeleteProject('project1', tasks)).toBe(false);
    });
  });

  describe('getTasksByParent', () => {
    it('should return root tasks when parentId is null', () => {
      const tasks = [
        { id: '1', projectId: 'p1', parentId: null, order: 0, completed: false },
        { id: '2', projectId: 'p1', parentId: '1', order: 0, completed: false },
        { id: '3', projectId: 'p1', parentId: null, order: 1, completed: false },
      ];

      const rootTasks = getTasksByParent('p1', null, tasks);

      expect(rootTasks).toHaveLength(2);
      expect(rootTasks[0].id).toBe('1');
      expect(rootTasks[1].id).toBe('3');
    });

    it('should return children of specific parent', () => {
      const tasks = [
        { id: '1', projectId: 'p1', parentId: null, order: 0, completed: false },
        { id: '2', projectId: 'p1', parentId: '1', order: 0, completed: false },
        { id: '3', projectId: 'p1', parentId: '1', order: 1, completed: false },
      ];

      const children = getTasksByParent('p1', '1', tasks);

      expect(children).toHaveLength(2);
      expect(children[0].id).toBe('2');
      expect(children[1].id).toBe('3');
    });

    it('should sort with completed tasks at the end', () => {
      const tasks = [
        { id: '1', projectId: 'p1', parentId: null, order: 0, completed: true },
        { id: '2', projectId: 'p1', parentId: null, order: 1, completed: false },
      ];

      const sorted = getTasksByParent('p1', null, tasks);

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });
  });

  describe('reorderTasks', () => {
    it('should reorder tasks within same parent', () => {
      const tasks = [
        { id: '1', projectId: 'p1', parentId: null, order: 0 },
        { id: '2', projectId: 'p1', parentId: null, order: 1 },
        { id: '3', projectId: 'p1', parentId: null, order: 2 },
      ];

      const reordered = reorderTasks(tasks, '1', 2);

      const task1 = reordered.find(t => t.id === '1');
      const task2 = reordered.find(t => t.id === '2');
      const task3 = reordered.find(t => t.id === '3');

      expect(task2.order).toBe(0);
      expect(task3.order).toBe(1);
      expect(task1.order).toBe(2);
    });

    it('should not affect tasks with different parents', () => {
      const tasks = [
        { id: '1', projectId: 'p1', parentId: 'a', order: 0 },
        { id: '2', projectId: 'p1', parentId: 'b', order: 0 },
      ];

      const reordered = reorderTasks(tasks, '1', 1);

      const task2 = reordered.find(t => t.id === '2');
      expect(task2.order).toBe(0); // Should not change
    });

    it('should return original array if task not found', () => {
      const tasks = [
        { id: '1', projectId: 'p1', parentId: null, order: 0 },
      ];

      const reordered = reorderTasks(tasks, 'nonexistent', 0);

      expect(reordered).toEqual(tasks);
    });
  });
});

