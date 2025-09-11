import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { useBoardContext } from '../context/BoardContext';

/**
 * DragProvider component that wraps the application with drag and drop functionality
 * Uses @dnd-kit for smooth, accessible drag and drop interactions
 * Integrates with Board Context for task management
 */
function DragProvider({ 
  children, 
  collisionDetection = closestCenter,
  modifiers = [restrictToWindowEdges],
  disabled = false,
  onDragStart,
  onDragEnd,
  onDragOver,
}) {
  // State for tracking active drag item
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // Get Board Context for task management
  const {
    state,
    moveTask,
  } = useBoardContext();

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);

    // Find the active item from tasks
    const activeTask = state.tasks?.find(task => task.id === active.id);
    setActiveItem(activeTask);

    // Call custom onDragStart handler if provided
    if (onDragStart) {
      onDragStart(event);
    }
  }, [state.tasks, onDragStart]);

  // Handle drag over (while dragging)
  const handleDragOver = useCallback((event) => {
    // Call custom onDragOver handler if provided
    if (onDragOver) {
      onDragOver(event);
    }
  }, [onDragOver]);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    // Reset active state
    setActiveId(null);
    setActiveItem(null);

    // If no valid drop target, exit early
    if (!over) {
      if (onDragEnd) {
        onDragEnd(event);
      }
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // If dropped on itself, no action needed
    if (activeId === overId) {
      if (onDragEnd) {
        onDragEnd(event);
      }
      return;
    }

    try {
      // Find the active task
      const activeTask = state.tasks?.find(task => task.id === activeId);
      if (!activeTask) {
        console.warn('Active task not found:', activeId);
        if (onDragEnd) {
          onDragEnd(event);
        }
        return;
      }

      // Check if we're dropping on a task
      const isDroppedOnTask = state.tasks?.some(task => task.id === overId);
      
      if (!isDroppedOnTask) {
        // Dropped on a column (overId should be the column key directly)
        const targetColumn = overId;
        
        // Get existing tasks in target column (excluding the moving task)
        const tasksInColumn = state.tasks.filter(
          task => task.column === targetColumn && task.id !== activeId
        );
        
        // Sort tasks by order to determine the correct insertion position
        tasksInColumn.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Add to the end of the column
        const newOrder = tasksInColumn.length;
        
        // Move task to different column at the end
        if (moveTask) {
          moveTask(activeId, targetColumn, newOrder);
        }
      } else if (isDroppedOnTask) {
        // Find the target task to determine its position and column
        const overTask = state.tasks.find(task => task.id === overId);
        if (!overTask) {
          console.warn('Target task not found:', overId);
          if (onDragEnd) {
            onDragEnd(event);
          }
          return;
        }

        const targetColumn = overTask.column;
        
        // Get all tasks in target column (excluding the moving task)
        const tasksInColumn = state.tasks.filter(
          task => task.column === targetColumn && task.id !== activeId
        );
        
        // Sort tasks by order
        tasksInColumn.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Find the position of the task we're dropping on
        const overTaskIndex = tasksInColumn.findIndex(task => task.id === overId);
        
        let targetOrder;
        
        if (activeTask.column === targetColumn) {
          // Same column - reordering within column
          // Get all tasks in the column including the moving task to determine original position
          const allTasksInColumn = state.tasks.filter(task => task.column === targetColumn);
          allTasksInColumn.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          const activeTaskOriginalIndex = allTasksInColumn.findIndex(task => task.id === activeId);
          const overTaskOriginalIndex = allTasksInColumn.findIndex(task => task.id === overId);
          
          if (activeTaskOriginalIndex < overTaskOriginalIndex) {
            // Moving down - when moving down, we want to insert AFTER the target task
            // because visually we're dropping "between" the target and the next item
            targetOrder = overTaskIndex + 1;
          } else {
            // Moving up - insert at the target task's position (before it)
            // This matches the visual expectation of replacing the target's position
            targetOrder = overTaskIndex;
          }
        } else {
          // Different column - insert at the target task's position (before it)
          targetOrder = overTaskIndex;
        }
        
        if (moveTask) {
          moveTask(activeId, targetColumn, targetOrder);
        }
      }
    } catch (error) {
      console.error('Error handling drag end:', error);
    }

    // Call custom onDragEnd handler if provided
    if (onDragEnd) {
      onDragEnd(event);
    }
  }, [state.tasks, moveTask, onDragEnd]);

  // Get tasks for sortable context (grouped by date/column)
  const getTasksByDate = useCallback((date) => {
    return state.tasks?.filter(task => task.date === date) || [];
  }, [state.tasks]);

  // Get all unique dates from tasks
  const getUniqueDates = useCallback(() => {
    const dates = state.tasks?.map(task => task.date) || [];
    return [...new Set(dates)];
  }, [state.tasks]);

  // Render drag overlay content
  const renderDragOverlay = () => {
    if (!activeItem) return null;

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg opacity-95 transform rotate-3">
        <div className="text-sm font-medium text-gray-900">
          {activeItem.title || 'Untitled Task'}
        </div>
        {activeItem.description && (
          <div className="text-xs text-gray-600 mt-1 line-clamp-2">
            {activeItem.description}
          </div>
        )}
      </div>
    );
  };

  // If disabled, just render children without drag functionality
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      {/* Render children with sortable contexts */}
      <SortableContextWrapper
        dates={getUniqueDates()}
        getTasksByDate={getTasksByDate}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContextWrapper>

      {/* Drag overlay for better visual feedback */}
      <DragOverlay>
        {renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Wrapper component to provide SortableContext for each column/date
 * This ensures proper sortable behavior within each column
 */
function SortableContextWrapper({ children, dates, getTasksByDate, strategy }) {
  // For now, we'll provide a global sortable context
  // In a more advanced implementation, this could be split per column
  const allTaskIds = dates.flatMap(date => 
    getTasksByDate(date).map(task => task.id)
  );

  return (
    <SortableContext items={allTaskIds} strategy={strategy}>
      {children}
    </SortableContext>
  );
}

SortableContextWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  dates: PropTypes.arrayOf(PropTypes.string).isRequired,
  getTasksByDate: PropTypes.func.isRequired,
  strategy: PropTypes.object,
};

DragProvider.propTypes = {
  children: PropTypes.node.isRequired,
  collisionDetection: PropTypes.func,
  modifiers: PropTypes.arrayOf(PropTypes.func),
  disabled: PropTypes.bool,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragOver: PropTypes.func,
};

export default DragProvider;
