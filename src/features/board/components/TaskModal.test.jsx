import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { BoardProvider } from '../context/BoardContext';
import TaskModal from './TaskModal';

// Test wrapper with Board Context
function TestWrapper({ children }) {
  return (
    <BoardProvider>
      {children}
    </BoardProvider>
  );
}

describe('TaskModal Component', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation including:\n- API specs\n- User guide\n- Installation instructions',
    completed: false,
    createdAt: new Date('2025-09-10T10:00:00Z'),
  };

  const mockNewTask = {
    title: '',
    description: '',
  };

  const mockHandlers = {
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={false} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
    });

    it('should render modal backdrop', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument();
    });

    it('should render modal content container', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render title input field', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
      expect(screen.getByTestId('task-title-input')).toHaveValue(mockTask.title);
    });

    it('should render description textarea', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-description-input')).toBeInTheDocument();
      expect(screen.getByTestId('task-description-input')).toHaveValue(mockTask.description);
    });

    it('should handle empty task for new task creation', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockNewTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-title-input')).toHaveValue('');
      expect(screen.getByTestId('task-description-input')).toHaveValue('');
    });

    it('should update title when input changes', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockNewTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const titleInput = screen.getByTestId('task-title-input');
      fireEvent.change(titleInput, { target: { value: 'New task title' } });

      expect(titleInput).toHaveValue('New task title');
    });

    it('should update description when textarea changes', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockNewTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const descriptionInput = screen.getByTestId('task-description-input');
      fireEvent.change(descriptionInput, { target: { value: 'New description' } });

      expect(descriptionInput).toHaveValue('New description');
    });
  });

  describe('Markdown Editor and Preview', () => {
    it('should render preview tab button', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('preview-tab-btn')).toBeInTheDocument();
    });

    it('should render edit tab button', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('edit-tab-btn')).toBeInTheDocument();
    });

    it('should switch to preview mode when preview tab is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const previewTab = screen.getByTestId('preview-tab-btn');
      fireEvent.click(previewTab);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
      expect(screen.queryByTestId('task-description-input')).not.toBeInTheDocument();
    });

    it('should switch back to edit mode when edit tab is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      // Switch to preview first
      const previewTab = screen.getByTestId('preview-tab-btn');
      fireEvent.click(previewTab);

      // Then switch back to edit
      const editTab = screen.getByTestId('edit-tab-btn');
      fireEvent.click(editTab);

      expect(screen.getByTestId('task-description-input')).toBeInTheDocument();
      expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
    });

    it('should render markdown preview content', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const previewTab = screen.getByTestId('preview-tab-btn');
      fireEvent.click(previewTab);

      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toBeInTheDocument();
      // Should contain rendered markdown content
      expect(preview).toHaveTextContent('Write comprehensive documentation including:');
    });

    it('should highlight active tab', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const editTab = screen.getByTestId('edit-tab-btn');
      const previewTab = screen.getByTestId('preview-tab-btn');

      // Edit tab should be active by default
      expect(editTab).toHaveClass('bg-white', 'border-b-white');
      expect(previewTab).toHaveClass('bg-gray-50');

      // Switch to preview
      fireEvent.click(previewTab);

      expect(previewTab).toHaveClass('bg-white', 'border-b-white');
      expect(editTab).toHaveClass('bg-gray-50');
    });
  });

  describe('Action Buttons', () => {
    it('should render save button', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('save-btn')).toBeInTheDocument();
      expect(screen.getByTestId('save-btn')).toHaveTextContent('Save');
    });

    it('should render cancel button', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-btn')).toHaveTextContent('Cancel');
    });

    it('should call onSave when save button is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const saveBtn = screen.getByTestId('save-btn');
      fireEvent.click(saveBtn);

      expect(mockHandlers.onSave).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onSave).toHaveBeenCalledWith({
        title: mockTask.title,
        description: mockTask.description,
      });
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const cancelBtn = screen.getByTestId('cancel-btn');
      fireEvent.click(cancelBtn);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should save updated form data when save is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockNewTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      // Update form fields
      const titleInput = screen.getByTestId('task-title-input');
      const descriptionInput = screen.getByTestId('task-description-input');
      
      fireEvent.change(titleInput, { target: { value: 'Updated title' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

      // Save
      const saveBtn = screen.getByTestId('save-btn');
      fireEvent.click(saveBtn);

      expect(mockHandlers.onSave).toHaveBeenCalledWith({
        title: 'Updated title',
        description: 'Updated description',
      });
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    it('should close modal when Escape key is pressed', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should close modal when backdrop is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when modal content is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);

      expect(mockHandlers.onCancel).not.toHaveBeenCalled();
    });

    it('should have accessible modal attributes', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const modal = screen.getByTestId('task-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should have accessible form labels', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should focus title input when modal opens', async () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('task-title-input')).toHaveFocus();
      });
    });
  });

  describe('Form Validation', () => {
    it('should disable save button when title is empty', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockNewTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const saveBtn = screen.getByTestId('save-btn');
      expect(saveBtn).toBeDisabled();
    });

    it('should enable save button when title is provided', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const saveBtn = screen.getByTestId('save-btn');
      expect(saveBtn).not.toBeDisabled();
    });

    it('should show validation message when title is empty', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockNewTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      // Try to save without title
      const saveBtn = screen.getByTestId('save-btn');
      fireEvent.click(saveBtn);

      // Should not call onSave and button should remain disabled
      expect(mockHandlers.onSave).not.toHaveBeenCalled();
      expect(saveBtn).toBeDisabled();
    });
  });

  describe('Modal Header', () => {
    it('should display correct title for editing existing task', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Edit Task');
    });

    it('should display correct title for creating new task', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockNewTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New Task');
    });

    it('should render close button in header', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('modal-close-btn')).toBeInTheDocument();
    });

    it('should call onCancel when close button is clicked', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const closeBtn = screen.getByTestId('modal-close-btn');
      fireEvent.click(closeBtn);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing task prop gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <TaskModal 
              isOpen={true} 
              {...mockHandlers} 
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle missing handlers gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <TaskModal 
              isOpen={true} 
              task={mockTask} 
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle very long title and description', () => {
      const longTask = {
        title: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
      };

      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={longTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-title-input')).toHaveValue(longTask.title);
      expect(screen.getByTestId('task-description-input')).toHaveValue(longTask.description);
    });

    it('should sanitize markdown content in preview', () => {
      const taskWithHtml = {
        title: 'Test Task',
        description: 'This contains <script>alert("xss")</script> and **bold** text',
      };

      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={taskWithHtml} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const previewTab = screen.getByTestId('preview-tab-btn');
      fireEvent.click(previewTab);

      const preview = screen.getByTestId('markdown-preview');
      // Should not contain script tag but should contain bold text
      expect(preview.innerHTML).not.toContain('<script>');
      expect(preview.innerHTML).toContain('bold</strong>'); // Check for the closing tag and content
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive modal classes', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent).toHaveClass('max-w-2xl'); // Responsive max width
    });

    it('should have responsive padding and margins', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true} 
            task={mockTask} 
            {...mockHandlers} 
          />
        </TestWrapper>
      );

      const modal = screen.getByTestId('task-modal');
      expect(modal).toHaveClass('p-4'); // Responsive padding
    });
  });
});
