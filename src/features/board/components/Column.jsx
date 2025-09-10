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
  
  // Get day name for drop zone ID
  const columnKey = getDateKey(date);
  const dropZoneId = columnKey;

  // Set up drop zone functionality
  const { setNodeRef, isOver } = useDroppable({
    id: dropZoneId,
  });

  // Get tasks for this column and sort by order
  const tasks = state.tasks
    .filter(task => task.column === columnKey)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
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

  // Open modal functions
  const openCreateModal = () => {
    openTaskModal('create', { column: columnKey });
  };

  const openEditModal = (task) => {
    openTaskModal('edit', task);
  };

  return (
    <div 
      className={`column ${isTodayColumn ? 'column-today' : ''} ${className}`.trim()}
      data-testid="column"
      aria-label={`${getDayName(date)} tasks`}
      {...props}
    >
      {/* Column Header */}
      <div className="column-header" role="banner">
        <div className="column-day" data-testid="column-day">
          {getDayName(date)}
        </div>
      </div>

      {/* Tasks Container - Drop Zone */}
      <div
        ref={setNodeRef}
        className="column-tasks"
        data-testid="column-tasks"
        role="listbox"
        aria-label={`Drop zone for ${getDayName(date)} tasks`}
        style={{
          backgroundColor: isOver ? 'rgba(207, 144, 78, 0.05)' : 'transparent'
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task}
              onEdit={openEditModal}
              onDelete={deleteTask}
              onToggleComplete={toggleTaskComplete}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="empty-state">
            <p>No tasks for this day</p>
          </div>
        )}

        {/* Add Task Input */}
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleAddTask}
          className="add-task-input"
          data-testid="add-task-input"
        />
      </div>
    </div>
  );
}

Column.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  className: PropTypes.string,
};

export default Column;