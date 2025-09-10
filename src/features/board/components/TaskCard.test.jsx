import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BoardProvider } from '../context/BoardContext';
import TaskCard from './TaskCard';

// Test wrapper with Board Context
function TestWrapper({ children }) {
  return (
    <BoardProvider>
      {children}
    </BoardProvider>
  );
}

describe('TaskCard Component', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Complete project documentation',
    completed: false,
    createdAt: new Date('2025-09-10T10:00:00Z'),
  };

  const mockCompletedTask = {
    id: 'task-2',
    title: 'Review pull request',
    completed: true,
    createdAt: new Date('2025-09-10T09:00:00Z'),
  };

  const mockHandlers = {
    onToggleComplete: vi.fn(),
    onDelete: vi.fn(),
    onDoubleClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task card component', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-card')).toBeInTheDocument();
    });

    it('should display task title', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-title')).toBeInTheDocument();
      expect(screen.getByTestId('task-title')).toHaveTextContent('Complete project documentation');
    });

    it('should render checkbox', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('task-checkbox')).toHaveAttribute('type', 'checkbox');
    });

    it('should render delete button', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-delete-btn')).toBeInTheDocument();
    });
  });

  describe('Checkbox Functionality', () => {
    it('should show unchecked checkbox for incomplete task', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should show checked checkbox for completed task', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockCompletedTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should call onToggleComplete when checkbox is clicked', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      fireEvent.click(checkbox);

      expect(mockHandlers.onToggleComplete).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith(mockTask.id);
    });

    it('should prevent event propagation when checkbox is clicked', () => {
      const mockStopPropagation = vi.fn();
      
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      
      // Create a custom event with stopPropagation mock
      const clickEvent = new MouseEvent('click', { bubbles: true });
      clickEvent.stopPropagation = mockStopPropagation;
      
      fireEvent(checkbox, clickEvent);
      
      expect(mockStopPropagation).toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    it('should call onDelete when delete button is clicked', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const deleteBtn = screen.getByTestId('task-delete-btn');
      fireEvent.click(deleteBtn);

      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTask.id);
    });

    it('should prevent event propagation when delete button is clicked', () => {
      const mockStopPropagation = vi.fn();
      
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const deleteBtn = screen.getByTestId('task-delete-btn');
      
      const clickEvent = new MouseEvent('click', { bubbles: true });
      clickEvent.stopPropagation = mockStopPropagation;
      
      fireEvent(deleteBtn, clickEvent);
      
      expect(mockStopPropagation).toHaveBeenCalled();
    });

    it('should show trash icon in delete button', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const deleteBtn = screen.getByTestId('task-delete-btn');
      const trashIcon = deleteBtn.querySelector('svg');
      
      expect(trashIcon).toBeInTheDocument();
    });
  });

  describe('Double-click Functionality', () => {
    it('should call onDoubleClick when task card is double-clicked', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      fireEvent.doubleClick(taskCard);

      expect(mockHandlers.onDoubleClick).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onDoubleClick).toHaveBeenCalledWith(mockTask.id);
    });

    it('should handle optional onDoubleClick handler', () => {
      // Test without onDoubleClick handler
      render(
        <TestWrapper>
          <TaskCard 
            task={mockTask} 
            onToggleComplete={mockHandlers.onToggleComplete}
            onDelete={mockHandlers.onDelete}
          />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      
      expect(() => {
        fireEvent.doubleClick(taskCard);
      }).not.toThrow();
    });
  });

  describe('Task Status Styling', () => {
    it('should apply completed styling for completed tasks', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockCompletedTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskTitle = screen.getByTestId('task-title');
      expect(taskTitle).toHaveClass('line-through'); // Strikethrough for completed
      expect(taskTitle).toHaveClass('text-gray-500'); // Muted color for completed
    });

    it('should apply normal styling for incomplete tasks', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskTitle = screen.getByTestId('task-title');
      expect(taskTitle).not.toHaveClass('line-through');
      expect(taskTitle).toHaveClass('text-gray-900'); // Normal color for incomplete
    });

    it('should apply completed card styling for completed tasks', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockCompletedTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('bg-gray-50'); // Muted background for completed
    });

    it('should apply normal card styling for incomplete tasks', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('bg-white'); // Normal background for incomplete
    });
  });

  describe('Layout and Structure', () => {
    it('should have proper card structure', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      const checkbox = screen.getByTestId('task-checkbox');
      const title = screen.getByTestId('task-title');
      const deleteBtn = screen.getByTestId('task-delete-btn');

      expect(taskCard).toContainElement(checkbox);
      expect(taskCard).toContainElement(title);
      expect(taskCard).toContainElement(deleteBtn);
    });

    it('should have responsive flex layout', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('flex'); // Flex layout
      expect(taskCard).toHaveClass('items-center'); // Vertical centering
    });

    it('should have proper spacing and padding', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('p-3'); // Padding
      expect(taskCard).toHaveClass('space-x-3'); // Space between elements
    });
  });

  describe('Accessibility', () => {
    it('should have accessible checkbox label', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Mark task as complete');
    });

    it('should have accessible delete button label', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const deleteBtn = screen.getByTestId('task-delete-btn');
      expect(deleteBtn).toHaveAttribute('aria-label', 'Delete task');
    });

    it('should have accessible task card role', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveAttribute('role', 'listitem');
    });

    it('should be keyboard navigable', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      const deleteBtn = screen.getByTestId('task-delete-btn');

      expect(checkbox).toHaveAttribute('tabIndex', '0');
      expect(deleteBtn).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Visual Design', () => {
    it('should have proper border radius', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('rounded-lg'); // Rounded corners
    });

    it('should have border styling', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('border'); // Has border
      expect(taskCard).toHaveClass('border-gray-200'); // Border color
    });

    it('should have hover effects', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('hover:shadow-sm'); // Hover shadow
    });

    it('should have transition effects', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('transition-shadow'); // Smooth transitions
    });
  });

  describe('Props Validation', () => {
    it('should handle missing task prop gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <TaskCard {...mockHandlers} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle missing handlers gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <TaskCard task={mockTask} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should accept custom className prop', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} className="custom-class" />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long task titles', () => {
      const longTitleTask = {
        ...mockTask,
        title: 'This is a very long task title that should be handled gracefully and not break the layout or cause overflow issues',
      };

      render(
        <TestWrapper>
          <TaskCard task={longTitleTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskTitle = screen.getByTestId('task-title');
      expect(taskTitle).toBeInTheDocument();
      expect(taskTitle).toHaveTextContent(longTitleTask.title);
    });

    it('should handle empty task title', () => {
      const emptyTitleTask = {
        ...mockTask,
        title: '',
      };

      render(
        <TestWrapper>
          <TaskCard task={emptyTitleTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskTitle = screen.getByTestId('task-title');
      expect(taskTitle).toBeInTheDocument();
    });

    it('should handle missing task properties', () => {
      const incompleteTask = {
        id: 'incomplete-task',
        title: 'Incomplete task data',
        // Missing completed and createdAt
      };

      expect(() => {
        render(
          <TestWrapper>
            <TaskCard task={incompleteTask} {...mockHandlers} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Interactive States', () => {
    it('should have focus styles for keyboard navigation', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      const deleteBtn = screen.getByTestId('task-delete-btn');

      expect(checkbox).toHaveClass('focus:ring-2'); // Focus ring
      expect(deleteBtn).toHaveClass('focus:ring-2'); // Focus ring
    });

    it('should handle rapid clicks gracefully', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      
      // Rapid clicks
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(mockHandlers.onToggleComplete).toHaveBeenCalledTimes(3);
    });
  });
});
