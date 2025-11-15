import React from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useProjectsContext } from '../context/ProjectsContext';

/**
 * TasksDragProvider - Provides drag and drop context for project tasks
 * Handles reordering of tasks within the same parent
 */
function TasksDragProvider({ children, projectId }) {
  const { state, moveTask } = useProjectsContext();
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    // Get the tasks for the current project
    const projectTasks = state.tasks.filter(t => t.projectId === projectId);
    const activeTask = projectTasks.find(t => t.id === active.id);
    const overTask = projectTasks.find(t => t.id === over.id);

    if (!activeTask || !overTask) {
      return;
    }

    // Only allow reordering within the same parent
    if (activeTask.parentId !== overTask.parentId) {
      return;
    }

    // Get siblings (tasks with the same parent)
    const siblings = projectTasks
      .filter(t => t.parentId === activeTask.parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = siblings.findIndex(t => t.id === active.id);
    const newIndex = siblings.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Update order for all affected siblings
      const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);
      
      // Update each sibling's order
      reorderedSiblings.forEach((task, index) => {
        if (task.order !== index) {
          moveTask(task.id, task.parentId, index);
        }
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-lg rounded-md p-3 border-2 border-[#701E2E] opacity-90">
            <span className="text-sm text-gray-900">
              {state.tasks.find(t => t.id === activeId)?.title || 'Task'}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

TasksDragProvider.propTypes = {
  children: PropTypes.node.isRequired,
  projectId: PropTypes.string,
};

export default TasksDragProvider;

