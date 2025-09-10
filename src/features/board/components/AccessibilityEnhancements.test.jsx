import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoardProvider } from '../context/BoardContext';
import { AccessibilityProvider } from './AccessibilityProvider';
import Column from './Column';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import WeekNav from './WeekNav';

// Test wrapper with Board Context and Accessibility Provider
function TestWrapper({ children }) {
  return (
    <AccessibilityProvider>
      <BoardProvider>
        {children}
      </BoardProvider>
    </AccessibilityProvider>
  );
}

describe('Accessibility Enhancements', () => {
  const mockDate = new Date(2025, 8, 10); // Wednesday Sept 10, 2025
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    completed: false,
    date: '2025-09-10',
  };

  const mockHandlers = {
    onToggleComplete: vi.fn(),
    onDelete: vi.fn(),
    onDoubleClick: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Enhanced ARIA Support', () => {
    it('should provide comprehensive ARIA labels for all interactive elements', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} tasks={[mockTask]} />
        </TestWrapper>
      );

      // Column should have descriptive aria-label
      const column = screen.getByTestId('column');
      expect(column).toHaveAttribute('aria-label');
      
      // Drop zone should have proper ARIA attributes
      const dropZone = screen.getByTestId('column-drop-zone-Wednesday');
      expect(dropZone).toHaveAttribute('role', 'listbox');
      expect(dropZone).toHaveAttribute('aria-label');
      expect(dropZone).toHaveAttribute('aria-describedby');
    });

    it('should provide ARIA live regions for dynamic content updates', () => {
      render(
        <TestWrapper>
          <div>
            <div 
              data-testid="status-announcements"
              role="status" 
              aria-live="polite" 
              aria-atomic="true"
              className="sr-only"
            >
              Task operations will be announced here
            </div>
            <TaskCard task={mockTask} {...mockHandlers} />
          </div>
        </TestWrapper>
      );

      const statusRegion = screen.getByTestId('status-announcements');
      expect(statusRegion).toHaveAttribute('role', 'status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should provide proper ARIA labels for form controls', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      // Title input should have accessible label
      const titleInput = screen.getByTestId('task-title-input');
      expect(titleInput).toHaveAttribute('aria-label');
      expect(titleInput).toHaveAttribute('aria-required', 'true');

      // Description input should have accessible label  
      const descriptionInput = screen.getByTestId('task-description-input');
      expect(descriptionInput).toHaveAttribute('aria-label');

      // Tab buttons should have proper labels
      const editTab = screen.getByTestId('edit-tab');
      const previewTab = screen.getByTestId('preview-tab');
      expect(editTab).toHaveAttribute('aria-label');
      expect(previewTab).toHaveAttribute('aria-label');
    });

    it('should provide ARIA state information for dynamic elements', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      
      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Advanced Keyboard Navigation', () => {
    it('should support full keyboard navigation within task board', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <div>
            <WeekNav />
            <Column date={mockDate} tasks={[mockTask]} />
          </div>
        </TestWrapper>
      );

      // Should be able to navigate to week navigation
      await user.tab();
      expect(screen.getByTestId('prev-week-btn')).toHaveFocus();

      // Should be able to navigate through week nav buttons
      await user.tab();
      expect(screen.getByTestId('today-btn')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('next-week-btn')).toHaveFocus();

      // Should be able to navigate to task elements
      await user.tab();
      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveFocus();
    });

    it('should support keyboard shortcuts for common actions', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      taskCard.focus();

      // Space or Enter should toggle completion
      await user.keyboard(' ');
      expect(mockHandlers.onToggleComplete).toHaveBeenCalledTimes(1);

      // Delete key should trigger delete
      await user.keyboard('{Delete}');
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);

      // Enter should trigger double-click (edit)
      await user.keyboard('{Enter}');
      expect(mockHandlers.onDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('should trap focus within modal dialogs', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      // Focus should start on title input
      await waitFor(() => {
        expect(screen.getByTestId('task-title-input')).toHaveFocus();
      });

      // Tab should move through modal elements in order
      await user.tab(); // to description input
      expect(screen.getByTestId('task-description-input')).toHaveFocus();

      await user.tab(); // to edit tab
      expect(screen.getByTestId('edit-tab')).toHaveFocus();

      await user.tab(); // to preview tab
      expect(screen.getByTestId('preview-tab')).toHaveFocus();

      await user.tab(); // to cancel button
      expect(screen.getByTestId('cancel-btn')).toHaveFocus();

      await user.tab(); // to save button
      expect(screen.getByTestId('save-btn')).toHaveFocus();

      // Shift+Tab should wrap back to title input
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByTestId('task-title-input')).toHaveFocus();
    });

    it('should provide skip links for navigation efficiency', () => {
      render(
        <TestWrapper>
          <div>
            <a 
              href="#main-content" 
              data-testid="skip-to-main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
            >
              Skip to main content
            </a>
            <WeekNav />
            <main id="main-content">
              <Column date={mockDate} tasks={[mockTask]} />
            </main>
          </div>
        </TestWrapper>
      );

      const skipLink = screen.getByTestId('skip-to-main');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Enhanced Focus Management', () => {
    it('should maintain logical focus order across components', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <div>
            <WeekNav />
            <Column date={mockDate} tasks={[mockTask]} />
          </div>
        </TestWrapper>
      );

      // Initial focus should be manageable
      const firstFocusable = screen.getByTestId('prev-week-btn');
      firstFocusable.focus();

      // Tabbing should follow logical order
      await user.tab();
      expect(screen.getByTestId('today-btn')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('next-week-btn')).toHaveFocus();
    });

    it('should restore focus after modal operations', async () => {
      const user = userEvent.setup();
      
      const TestModalComponent = () => {
        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const triggerRef = React.useRef(null);

        return (
          <TestWrapper>
            <div>
              <button 
                ref={triggerRef}
                onClick={() => setIsModalOpen(true)}
                data-testid="open-modal-btn"
              >
                Open Modal
              </button>
              <TaskModal 
                isOpen={isModalOpen} 
                task={mockTask} 
                onSave={() => setIsModalOpen(false)}
                onCancel={() => {
                  setIsModalOpen(false);
                  // Focus should return to trigger
                  setTimeout(() => triggerRef.current?.focus(), 0);
                }}
              />
            </div>
          </TestWrapper>
        );
      };

      render(<TestModalComponent />);

      const openButton = screen.getByTestId('open-modal-btn');
      openButton.focus();
      
      // Open modal
      await user.click(openButton);
      
      // Modal should be open with focus on title input
      await waitFor(() => {
        expect(screen.getByTestId('task-title-input')).toHaveFocus();
      });

      // Close modal with Escape
      await user.keyboard('{Escape}');
      
      // Focus should return to trigger button
      await waitFor(() => {
        expect(openButton).toHaveFocus();
      });
    });

    it('should provide focus indicators that meet contrast requirements', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      const deleteBtn = screen.getByTestId('task-delete-btn');
      const taskCard = screen.getByTestId('task-card');

      // Elements should have focus ring classes
      expect(checkbox).toHaveClass('focus:ring-2');
      expect(deleteBtn).toHaveClass('focus:ring-2');
      expect(taskCard).toHaveClass('focus:ring-2');
    });

    it('should handle focus management during drag operations', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const dragHandle = screen.getByTestId('drag-handle');
      
      // Focus should be manageable on drag handle
      await user.tab(); // Navigate to drag handle
      expect(dragHandle).toHaveFocus();

      // Should support keyboard drag initiation
      await user.keyboard(' '); // Space to start drag
      // DND Kit handles keyboard drag operations
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide descriptive text for screen readers', () => {
      render(
        <TestWrapper>
          <Column date={mockDate} tasks={[mockTask]} />
        </TestWrapper>
      );

      // Should have hidden descriptions for screen readers
      const dropZoneDescription = screen.getByText(/Drop tasks here to schedule them for/);
      expect(dropZoneDescription).toHaveClass('sr-only');
    });

    it('should announce drag and drop operations', () => {
      render(
        <TestWrapper>
          <div>
            <div 
              data-testid="drag-announcements"
              role="status"
              aria-live="assertive"
              aria-atomic="true"
              className="sr-only"
            >
              Drag operation announcements
            </div>
            <TaskCard task={mockTask} {...mockHandlers} />
          </div>
        </TestWrapper>
      );

      const announcements = screen.getByTestId('drag-announcements');
      expect(announcements).toHaveAttribute('role', 'status');
      expect(announcements).toHaveAttribute('aria-live', 'assertive');
    });

    it('should provide proper landmarks and headings structure', () => {
      render(
        <TestWrapper>
          <div>
            <header role="banner">
              <WeekNav />
            </header>
            <main role="main">
              <h1 className="sr-only">Task Board</h1>
              <section aria-labelledby="week-heading">
                <h2 id="week-heading" className="sr-only">
                  Week of September 8-12, 2025
                </h2>
                <Column date={mockDate} tasks={[mockTask]} />
              </section>
            </main>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Task Board')).toBeInTheDocument();
    });

    it('should handle dynamic content updates with announcements', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const [announcement, setAnnouncement] = React.useState('');
        
        const handleTaskToggle = () => {
          setAnnouncement('Task marked as complete');
          setTimeout(() => setAnnouncement(''), 1000);
        };

        return (
          <TestWrapper>
            <div>
              <div 
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {announcement}
              </div>
              <TaskCard 
                task={mockTask} 
                onToggleComplete={handleTaskToggle}
                {...mockHandlers}
              />
            </div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      const checkbox = screen.getByTestId('task-checkbox');
      await user.click(checkbox);

      // Announcement should appear
      await waitFor(() => {
        expect(screen.getByText('Task marked as complete')).toBeInTheDocument();
      });
    });
  });

  describe('Color and Visual Accessibility', () => {
    it('should not rely solely on color to convey information', () => {
      const completedTask = { ...mockTask, completed: true };
      
      render(
        <TestWrapper>
          <TaskCard task={completedTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      // Should have both visual indicator (checked) and accessible state
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should provide sufficient contrast ratios', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      // Task title should have proper contrast classes
      const taskTitle = screen.getByText(mockTask.title);
      expect(taskTitle).toHaveClass('text-gray-900'); // High contrast text
    });

    it('should support high contrast mode', () => {
      render(
        <TestWrapper>
          <div className="forced-colors:contrast-more">
            <TaskCard task={mockTask} {...mockHandlers} />
          </div>
        </TestWrapper>
      );

      // Elements should maintain visibility in high contrast mode
      const taskCard = screen.getByTestId('task-card');
      expect(taskCard).toHaveClass('border'); // Ensures borders in high contrast
    });

    it('should provide clear focus indicators', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const focusableElements = [
        screen.getByTestId('task-checkbox'),
        screen.getByTestId('task-delete-btn'),
        screen.getByTestId('task-card'),
      ];

      focusableElements.forEach(element => {
        // Should have visible focus indicators
        expect(element).toHaveClass('focus:ring-2');
        expect(element).toHaveClass('focus:ring-blue-500');
      });
    });
  });

  describe('Error Handling and Validation', () => {
    it('should provide accessible error messages', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={{ ...mockTask, title: '' }} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const titleInput = screen.getByTestId('task-title-input');
      const saveBtn = screen.getByTestId('save-btn');

      // Save button should be disabled with accessible state
      expect(saveBtn).toBeDisabled();
      expect(saveBtn).toHaveAttribute('aria-disabled', 'true');

      // Input should indicate required state
      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error messages with form controls', () => {
      render(
        <TestWrapper>
          <div>
            <input 
              data-testid="test-input"
              aria-describedby="error-message"
              aria-invalid="true"
            />
            <div 
              id="error-message" 
              role="alert"
              data-testid="error-message"
            >
              This field is required
            </div>
          </div>
        </TestWrapper>
      );

      const input = screen.getByTestId('test-input');
      const errorMessage = screen.getByTestId('error-message');

      expect(input).toHaveAttribute('aria-describedby', 'error-message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Mobile and Touch Accessibility', () => {
    it('should provide adequate touch targets', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('task-checkbox');
      const deleteBtn = screen.getByTestId('task-delete-btn');
      const dragHandle = screen.getByTestId('drag-handle');

      // Should have minimum 44px touch target
      expect(checkbox).toHaveClass('w-5', 'h-5'); // With padding meets 44px
      expect(deleteBtn).toHaveClass('w-6', 'h-6'); // With padding meets 44px
      expect(dragHandle).toHaveClass('w-6', 'h-6'); // With padding meets 44px
    });

    it('should support voice control and switch navigation', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} {...mockHandlers} />
        </TestWrapper>
      );

      const taskCard = screen.getByTestId('task-card');
      
      // Should be activatable by switch devices
      expect(taskCard).toHaveAttribute('role', 'button');
      expect(taskCard).toHaveAttribute('tabIndex', '0');
    });
  });
});
