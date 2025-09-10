import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BoardProvider } from '../context/BoardContext';
import Column from './Column';
import * as dateUtils from '../../../lib/date.js';

// Mock the date utilities
vi.mock('../../../lib/date.js');

// Test wrapper with Board Context
function TestWrapper({ children }) {
  return (
    <BoardProvider>
      {children}
    </BoardProvider>
  );
}

describe('Column Component', () => {
  const mockDate = new Date(2025, 8, 10); // Wednesday Sept 10, 2025

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    dateUtils.isToday.mockReturnValue(false);
    dateUtils.getDayName.mockReturnValue('Wednesday');
    dateUtils.formatDate.mockReturnValue('Wed, Sep 10');
    dateUtils.isSameDay.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('should render column component', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      expect(screen.getByTestId('column')).toBeInTheDocument();
    });

    it('should display day of week in header', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      expect(screen.getByTestId('column-day')).toBeInTheDocument();
      expect(screen.getByTestId('column-day')).toHaveTextContent('Wednesday');
    });

    it('should display formatted date', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      expect(screen.getByTestId('column-date')).toBeInTheDocument();
      expect(screen.getByTestId('column-date')).toHaveTextContent('Wed, Sep 10');
    });

    it('should render tasks container', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      expect(screen.getByTestId('column-tasks')).toBeInTheDocument();
    });
  });

  describe('Today Highlighting', () => {
    it('should highlight column when date is today', () => {
      dateUtils.isToday.mockReturnValue(true);

      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('bg-blue-50'); // Today highlight class
      expect(column).toHaveClass('border-blue-200'); // Today border class
    });

    it('should not highlight column when date is not today', () => {
      dateUtils.isToday.mockReturnValue(false);

      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).not.toHaveClass('bg-blue-50');
      expect(column).toHaveClass('bg-white'); // Normal background
      expect(column).toHaveClass('border-gray-200'); // Normal border
    });

    it('should highlight day text when date is today', () => {
      dateUtils.isToday.mockReturnValue(true);

      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const dayText = screen.getByTestId('column-day');
      expect(dayText).toHaveClass('text-blue-700'); // Today text color
    });

    it('should use normal day text when date is not today', () => {
      dateUtils.isToday.mockReturnValue(false);

      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const dayText = screen.getByTestId('column-day');
      expect(dayText).toHaveClass('text-gray-900'); // Normal text color
    });
  });

  describe('Layout and Structure', () => {
    it('should have proper column structure', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      // Column should contain header and tasks area
      const column = screen.getByTestId('column');
      const header = screen.getByTestId('column-header');
      const tasks = screen.getByTestId('column-tasks');

      expect(column).toContainElement(header);
      expect(column).toContainElement(tasks);
    });

    it('should have responsive classes for mobile layout', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('flex', 'flex-col'); // Flex column layout
    });

    it('should have minimum height for tasks area', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const tasksArea = screen.getByTestId('column-tasks');
      expect(tasksArea).toHaveClass('min-h-96'); // Minimum height class
    });
  });

  describe('Header Styling', () => {
    it('should have proper header styling', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const header = screen.getByTestId('column-header');
      expect(header).toHaveClass('p-4'); // Proper padding
      expect(header).toHaveClass('border-b'); // Bottom border
    });

    it('should display day name prominently', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const dayText = screen.getByTestId('column-day');
      expect(dayText).toHaveClass('text-lg', 'font-semibold'); // Large, bold text
    });

    it('should display date with smaller text', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const dateText = screen.getByTestId('column-date');
      expect(dateText).toHaveClass('text-sm'); // Smaller text
    });
  });

  describe('Tasks Integration', () => {
    it('should render tasks for the given date', () => {
      const mockTasks = [
        { id: 'task1', title: 'Test Task 1', date: mockDate },
        { id: 'task2', title: 'Test Task 2', date: mockDate }
      ];

      render(
        <TestWrapper>
          <Column date={mockDate} tasks={mockTasks} />
        </TestWrapper>
      );

      // Tasks should be rendered in the tasks container
      expect(screen.getByTestId('column-tasks')).toBeInTheDocument();
      // Note: Actual task rendering will be handled by TaskItem components
    });

    it('should display empty state when no tasks', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} tasks={[]} />
        </TestWrapper>
      );

      const tasksArea = screen.getByTestId('column-tasks');
      expect(tasksArea).toBeInTheDocument();
      // Should render empty but not show any tasks
    });

    it('should accept optional tasks prop', () => {
      // Should not crash when tasks prop is not provided
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      expect(screen.getByTestId('column-tasks')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible column header', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const header = screen.getByTestId('column-header');
      expect(header).toHaveAttribute('role', 'banner');
    });

    it('should have accessible tasks area', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const tasksArea = screen.getByTestId('column-tasks');
      expect(tasksArea).toHaveAttribute('role', 'list');
    });

    it('should have descriptive aria-label for column', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveAttribute('aria-label', 'Wednesday, Wed, Sep 10 tasks');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing date prop gracefully', () => {
      // Should not crash when date is undefined
      expect(() => {
        render(
          <TestWrapper>
            <Column />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle invalid date prop', () => {
      const invalidDate = 'invalid-date';
      
      expect(() => {
        render(
          <TestWrapper>
            <Column date={invalidDate} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle date formatting errors', () => {
      dateUtils.getDayName.mockImplementation(() => {
        throw new Error('Format error');
      });
      dateUtils.formatDate.mockImplementation(() => {
        throw new Error('Format error');
      });

      expect(() => {
        render(
          <TestWrapper>
            <Column date={mockDate} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Props Validation', () => {
    it('should accept date prop as Date object', () => {
      render(
        <TestWrapper>
          <Column date={new Date()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('column')).toBeInTheDocument();
    });

    it('should accept optional tasks array prop', () => {
      const tasks = [{ id: '1', title: 'Test' }];
      
      render(
        <TestWrapper>
          <Column date={mockDate} tasks={tasks} />
        </TestWrapper>
      );

      expect(screen.getByTestId('column')).toBeInTheDocument();
    });

    it('should accept optional className prop', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} className="custom-class" />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('custom-class');
    });
  });

  describe('Responsive Design', () => {
    it('should have appropriate width classes', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('flex-1'); // Takes equal space in grid
    });

    it('should handle narrow screens properly', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('min-w-0'); // Allows shrinking on small screens
    });
  });

  describe('Visual Design', () => {
    it('should have proper border radius', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('rounded-lg'); // Rounded corners
    });

    it('should have shadow for depth', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('shadow-sm'); // Subtle shadow
    });

    it('should have proper border styling', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} />
        </TestWrapper>
      );

      const column = screen.getByTestId('column');
      expect(column).toHaveClass('border'); // Has border
    });
  });
});
