import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Plus, CheckSquare, Square, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectsContext } from '../context/ProjectsContext';
import { 
  buildTaskTree, 
  canAddSubTask, 
  canCompleteTask, 
  getTasksByParent 
} from '../utils/taskHierarchy';
import TasksDragProvider from './TasksDragProvider';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

/**
 * TaskItem - Renders a single task with its children recursively
 */
function TaskItem({ task, level = 0, allTasks }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const { toggleTaskComplete, addTask, selectTask, state } = useProjectsContext();
  const [isExpanded, setIsExpanded] = useState(() => {
    // Check localStorage for collapse state
    const key = `groodo_task_expanded_${task.id}`;
    const stored = localStorage.getItem(key);
    return stored !== 'false'; // Default to expanded
  });
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const hasSubTasks = task.children && task.children.length > 0;
  const canAddSub = canAddSubTask(task, allTasks);
  const canComplete = canCompleteTask(task, allTasks);
  const isSelected = state.selectedTaskId === task.id;

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    // Save to localStorage
    localStorage.setItem(`groodo_task_expanded_${task.id}`, String(newExpanded));
  };

  const handleToggleComplete = () => {
    if (canComplete || task.completed) {
      toggleTaskComplete(task.id);
    }
  };

  const handleAddSubTask = (e) => {
    if (e.key === 'Enter' && newSubTaskTitle.trim()) {
      const taskId = addTask({
        title: newSubTaskTitle.trim(),
        content: '',
        projectId: task.projectId,
        parentId: task.id,
        order: task.children ? task.children.length : 0,
      });
      setNewSubTaskTitle('');
      setIsAddingSubTask(false);
      // Select the new sub-task
      selectTask(taskId);
    } else if (e.key === 'Escape') {
      setNewSubTaskTitle('');
      setIsAddingSubTask(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `${level * 16 + 8}px`,
  };

  return (
    <div>
      {/* Task Item */}
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-center gap-1 py-1.5 pr-3 hover:bg-gray-50 border-l-2 ${
          isSelected ? 'bg-[#701E2E]/5 border-[#701E2E]' : 'border-transparent'
        } ${isDragging ? 'z-50' : ''}`}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded flex-shrink-0 transition-opacity cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-3 h-3 text-gray-400" />
        </button>
        
        {/* Expand/Collapse Button */}
        {hasSubTasks ? (
          <button
            onClick={handleToggleExpand}
            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>
        ) : (
          <span className="w-4"></span>
        )}

        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={!canComplete && !task.completed}
          className={`flex-shrink-0 ${
            (!canComplete && !task.completed) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          title={!canComplete && !task.completed ? 'Complete all sub-tasks first' : ''}
        >
          {task.completed ? (
            <CheckSquare className="w-4 h-4 text-[#701E2E]" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Task Title */}
        <button
          onClick={() => selectTask(task.id)}
          className={`flex-1 text-left text-sm min-w-0 ${
            task.completed ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}
        >
          {task.title || 'Untitled Task'}
        </button>

        {/* Add Sub-Task Button */}
        {canAddSub && (
          <button
            onClick={() => setIsAddingSubTask(true)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded flex-shrink-0 transition-opacity"
            title="Add sub-task"
            aria-label="Add sub-task"
          >
            <Plus className="w-3.5 h-3.5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Add Sub-Task Input */}
      {isAddingSubTask && (
        <div
          className="py-1 pr-3"
          style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
        >
          <input
            type="text"
            value={newSubTaskTitle}
            onChange={(e) => setNewSubTaskTitle(e.target.value)}
            onKeyDown={handleAddSubTask}
            onBlur={() => {
              if (!newSubTaskTitle.trim()) {
                setIsAddingSubTask(false);
              }
            }}
            placeholder="Sub-task title..."
            className="w-full px-2 py-1 text-sm border border-[#701E2E] rounded focus:outline-none focus:ring-1 focus:ring-[#701E2E]"
            autoFocus
          />
        </div>
      )}

      {/* Children */}
      {hasSubTasks && isExpanded && (
        <SortableContext
          items={task.children.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {task.children.map((child) => (
              <TaskItem
                key={child.id}
                task={child}
                level={level + 1}
                allTasks={allTasks}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

/**
 * TasksPanel - Shows hierarchical task tree for selected project
 */
function TasksPanel() {
  const { state, addTask, selectTask } = useProjectsContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const selectedProject = state.projects.find(p => p.id === state.selectedProjectId);
  
  // Get tasks for selected project and build tree
  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];
    return state.tasks.filter(t => t.projectId === selectedProject.id);
  }, [selectedProject, state.tasks]);

  const taskTree = useMemo(() => {
    return buildTaskTree(projectTasks);
  }, [projectTasks]);

  const handleAddTask = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim() && selectedProject) {
      const taskId = addTask({
        title: newTaskTitle.trim(),
        content: '',
        projectId: selectedProject.id,
        parentId: null,
        order: projectTasks.filter(t => !t.parentId).length,
      });
      setNewTaskTitle('');
      // Select the new task
      selectTask(taskId);
    }
  };

  if (!selectedProject) {
    return (
      <div className="h-full flex items-center justify-center bg-white border-r border-gray-200">
        <p className="text-gray-500 text-sm">Select a project to view tasks</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
      </div>

      {/* Add Task Input */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleAddTask}
          placeholder="Add a new task..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#701E2E] focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Press Enter to add</p>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto">
        {taskTree.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No tasks yet</p>
            <p className="text-xs text-gray-400 mt-2">Add a task above to get started</p>
          </div>
        ) : (
          <TasksDragProvider projectId={selectedProject?.id}>
            <SortableContext
              items={taskTree.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="py-2">
                {taskTree.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    level={0}
                    allTasks={projectTasks}
                  />
                ))}
              </div>
            </SortableContext>
          </TasksDragProvider>
        )}
      </div>
    </div>
  );
}

export default TasksPanel;

