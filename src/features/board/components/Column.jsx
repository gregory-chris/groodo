import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardContext } from '../context/BoardContext';
import { isToday, getDayName, formatDate, getDateKey } from '../../../lib/date.js';
import TaskCard from './TaskCard';

/**
 * Column component for displaying tasks for a specific date
 * Features drag and drop functionality and task management
 */
function Column({ date, className = '', ...props }) {
  const { state, addTask, deleteTask, toggleTaskComplete, openTaskModal } = useBoardContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
  const tasks = state.tasks
    .filter(task => task.column === columnKey)
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
  const handleAddTask = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        column: columnKey,
        description: '',
        order: tasks.length
      });
      setNewTaskTitle('');
    }
  };

  const handleEditTask = (task) => {
    openTaskModal('edit', task);
  };

  return (
    <div 
      className={`flex flex-col rounded-xl shadow-lg border transition-all duration-200 overflow-hidden min-w-[180px] w-full ${
        isTodayColumn 
          ? 'bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20 shadow-secondary/15' 
          : 'bg-white border-gray-100 hover:shadow-xl hover:border-gray-200'
      } ${className}`.trim()}
      data-testid="column"
      aria-label={`${getDayName(date)} tasks`}
      {...props}
    >
      {/* Column Header */}
      <div 
        className={`px-4 py-3 border-b flex-shrink-0 ${
          isTodayColumn 
            ? 'border-secondary/10 bg-gradient-to-br from-secondary/8 to-accent/8' 
            : 'border-gray-50 bg-gray-50/80'
        }`} 
        role="banner"
      >
        <div 
          className={`text-xs font-semibold tracking-wide ${
            isTodayColumn ? 'text-primary' : 'text-gray-600'
          }`} 
          data-testid="column-day"
        >
          {getDayName(date)}, {formatDate(date, 'MMM d')}
        </div>
      </div>

      {/* Tasks Container - Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 flex flex-col gap-3 overflow-y-auto scroll-smooth transition-colors duration-200 ${
          isOver ? 'bg-secondary/5' : ''
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
          className="w-full p-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors duration-200"
          data-testid="add-task-input"
        />

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task}
              onEdit={handleEditTask}
              onDelete={deleteTask}
              onToggleComplete={toggleTaskComplete}
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