import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardContext } from '../context/BoardContext';
import { isToday, getDayName, getDateKey, getCurrentWeek } from '../../../lib/date.js';
import TaskCard from './TaskCard';

/**
 * Column component for displaying tasks for a specific date
 * Features drag and drop functionality and task management
 */
function Column({ date, className = '', ...props }) {
  const { state, addTask, deleteTask, toggleTaskComplete, duplicateTask, moveTask, openTaskModal, isReadonly } = useBoardContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Get day name for drop zone ID - must be before any conditional returns
  const columnKey = date instanceof Date && !isNaN(date.getTime()) ? getDateKey(date) : 'invalid';
  const dropZoneId = columnKey;

  // Set up drop zone functionality - must be called before any conditional returns
  const { setNodeRef, isOver } = useDroppable({
    id: dropZoneId,
  });

  // Validate date prop
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return (
      <div className="column" data-testid="column">
        <div className="column-header">
          <div className="column-day">Invalid Date</div>
        </div>
        <div className="column-tasks">
          <div className="empty-state">
            <p>Invalid date provided</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if this column represents today
  const isTodayColumn = isToday(date);

  // Get tasks for this column and sort by completion status, then by order
  // Incomplete tasks first, then completed tasks at the bottom
  // Filter out tasks that belong to projects (projectId !== null)
  const tasks = state.tasks
    .filter(task => task.column === columnKey && !task.projectId)
    .sort((a, b) => {
      // If completion status is different, incomplete tasks come first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // If same completion status, sort by order
      return (a.order || 0) - (b.order || 0);
    });

  // Create array of task IDs for sortable context
  const taskIds = tasks.map(task => task.id);

  // Handle adding new task via input
  const handleAddTask = async (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim() && !isAddingTask) {
      setIsAddingTask(true);

      try {
        const createdTask = await addTask({
          title: newTaskTitle.trim(),
          column: columnKey,
          content: '',
          order: tasks.length
        });

        if (createdTask) {
          setNewTaskTitle('');
        }
      } finally {
        setIsAddingTask(false);
      }
    }
  };

  const handleEditTask = (task) => {
    openTaskModal('edit', task);
  };

  // Check if this column is in the current week
  const currentWeekBounds = getCurrentWeek();
  const isCurrentWeek = date >= currentWeekBounds.start && date <= currentWeekBounds.end;

  const handleDuplicateTask = async (task) => {
    const newTask = await duplicateTask(task, isCurrentWeek);
    if (newTask) {
      openTaskModal('edit', newTask);
    }
  };

  return (
    <div
      className={`flex flex-col rounded-xl shadow-lg border transition-all duration-200 overflow-hidden min-w-[180px] w-full min-h-[400px] sm:min-h-0 ${isTodayColumn
        ? 'bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20 shadow-secondary/15'
        : 'bg-white border-gray-100 hover:shadow-xl hover:border-gray-200'
        } ${className}`.trim()}
      data-testid="column"
      aria-label={`${getDayName(date)} tasks`}
      {...props}
    >
      {/* Column Header */}
      <div
        className={`px-4 py-3 border-b flex-shrink-0 ${isTodayColumn
          ? 'border-secondary/10 bg-gradient-to-br from-secondary/8 to-accent/8'
          : 'border-gray-50 bg-gray-50/80'
          }`}
        role="banner"
      >
        <div className="flex items-center gap-3" data-testid="column-day">
          {/* Calendar Icon Day Number */}
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-sm border font-bold text-lg ${isTodayColumn
              ? 'bg-white text-primary border-secondary/20'
              : 'bg-white text-gray-700 border-gray-200'
              }`}
          >
            {date.getDate()}
          </div>

          {/* Day Name and Month */}
          <div className="flex flex-col">
            <span
              className={`text-base font-bold leading-tight ${isTodayColumn ? 'text-primary' : 'text-gray-900'
                }`}
            >
              {getDayName(date)}
            </span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {date.toLocaleDateString('en-US', { month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks Container - Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 flex flex-col gap-2 overflow-y-auto scroll-smooth transition-colors duration-200 ${isOver ? 'bg-secondary/5' : ''
          }`}
        data-testid="column-tasks"
        role="listbox"
        aria-label={`Drop zone for ${getDayName(date)} tasks`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#e2e8f0 #f8fafc'
        }}
      >
        {/* Add Task Input - Now at the top */}
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleAddTask}
          disabled={isReadonly || isAddingTask}
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors duration-200"
          data-testid="add-task-input"
        />

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._stableKey || task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={deleteTask}
              onToggleComplete={toggleTaskComplete}
              onDuplicate={handleDuplicateTask}
              onMoveNext={(task) => {
                const nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 1);

                // Skip Friday (5) and Saturday (6) to get to Sunday (0)
                while (nextDate.getDay() === 5 || nextDate.getDay() === 6) {
                  nextDate.setDate(nextDate.getDate() + 1);
                }

                const targetColumn = getDateKey(nextDate);

                // Calculate order: last in target column
                const targetTasks = state.tasks.filter(t => t.column === targetColumn);
                const maxOrder = targetTasks.length > 0
                  ? Math.max(...targetTasks.map(t => t.order || 0))
                  : -1;

                moveTask(task.id, targetColumn, maxOrder + 1);
              }}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-gray-300 text-xs text-center py-4 px-2 opacity-60">
            <p>No tasks for this day</p>
          </div>
        )}
      </div>
    </div>
  );
}

Column.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  className: PropTypes.string,
};

export default Column;