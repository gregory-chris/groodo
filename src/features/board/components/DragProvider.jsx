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
    reorderTasks,
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

      // Determine if we're dropping on a column or another task
      const isDroppedOnColumn = overId.startsWith('column-');
      const isDroppedOnTask = state.tasks?.some(task => task.id === overId);

      if (isDroppedOnColumn) {
        // Extract column date from overId (assuming format like 'column-2025-09-10')
        const columnDate = overId.replace('column-', '');
        
        // Move task to different column
        if (moveTask) {
          moveTask(activeId, columnDate);
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

        // If tasks are in same column, reorder them
        if (activeTask.date === overTask.date) {
          if (reorderTasks) {
            // Get all tasks in the same column
            const columnTasks = state.tasks.filter(task => task.date === activeTask.date);
            const activeIndex = columnTasks.findIndex(task => task.id === activeId);
            const overIndex = columnTasks.findIndex(task => task.id === overId);
            
            if (activeIndex !== -1 && overIndex !== -1) {
              reorderTasks(activeTask.date, activeIndex, overIndex);
            }
          }
        } else {
          // Move task to different column at specific position
          if (moveTask) {
            moveTask(activeId, overTask.date);
          }
        }
      }
    } catch (error) {
      console.error('Error handling drag end:', error);
    }

    // Call custom onDragEnd handler if provided
    if (onDragEnd) {
      onDragEnd(event);
    }
  }, [state.tasks, moveTask, reorderTasks, onDragEnd]);

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
