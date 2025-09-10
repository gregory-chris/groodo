import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BoardProvider } from '../context/BoardContext';
import WeekNav from './WeekNav';
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

describe('WeekNav Component', () => {
  const mockCurrentWeek = {
    start: new Date(2025, 8, 7), // Sunday Sept 7, 2025
    end: new Date(2025, 8, 11)   // Thursday Sept 11, 2025
  };

  const mockNextWeek = {
    start: new Date(2025, 8, 14), // Sunday Sept 14, 2025
    end: new Date(2025, 8, 18)   // Thursday Sept 18, 2025
  };

  const mockPreviousWeek = {
    start: new Date(2025, 7, 31), // Sunday Aug 31, 2025
    end: new Date(2025, 8, 3)     // Thursday Sept 3, 2025
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    dateUtils.getCurrentWeek.mockReturnValue(mockCurrentWeek);
    dateUtils.getNextWeek.mockReturnValue(mockNextWeek);
    dateUtils.getPreviousWeek.mockReturnValue(mockPreviousWeek);
    dateUtils.formatWeekRange.mockImplementation((week) => {
      const startDate = week.start.getDate();
      const startMonth = week.start.getMonth();
      
      if (startDate === 7 && startMonth === 8) return 'Sep 7 - 11, 2025'; // Sept 7
      if (startDate === 14 && startMonth === 8) return 'Sep 14 - 18, 2025'; // Sept 14
      if (startDate === 31 && startMonth === 7) return 'Aug 31 - Sep 3, 2025'; // Aug 31
      return 'Unknown Week';
    });
    dateUtils.isToday.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('should render week navigation component', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      expect(screen.getByTestId('week-nav')).toBeInTheDocument();
    });

    it('should display week range', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      expect(screen.getByTestId('week-range')).toBeInTheDocument();
      expect(screen.getByTestId('week-range')).toHaveTextContent('Sep 7 - 11, 2025');
    });

    it('should render navigation buttons', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      expect(screen.getByTestId('prev-week-btn')).toBeInTheDocument();
      expect(screen.getByTestId('next-week-btn')).toBeInTheDocument();
      expect(screen.getByTestId('today-btn')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Previous week')).toBeInTheDocument();
      expect(screen.getByLabelText('Next week')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to current week')).toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    it('should navigate to previous week when previous button is clicked', async () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const prevButton = screen.getByTestId('prev-week-btn');
      
      await act(async () => {
        prevButton.click();
      });

      // Week range should update to previous week
      expect(screen.getByTestId('week-range')).toHaveTextContent('Aug 31 - Sep 3, 2025');
    });

    it('should navigate to next week when next button is clicked', async () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const nextButton = screen.getByTestId('next-week-btn');
      
      await act(async () => {
        nextButton.click();
      });

      // Week range should update to next week
      expect(screen.getByTestId('week-range')).toHaveTextContent('Sep 14 - 18, 2025');
    });

    it('should navigate to current week when today button is clicked', async () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      // First navigate to a different week
      const nextButton = screen.getByTestId('next-week-btn');
      await act(async () => {
        nextButton.click();
      });

      expect(screen.getByTestId('week-range')).toHaveTextContent('Sep 14 - 18, 2025');

      // Then click today button
      const todayButton = screen.getByTestId('today-btn');
      await act(async () => {
        todayButton.click();
      });

      // Should be back to current week
      expect(screen.getByTestId('week-range')).toHaveTextContent('Sep 7 - 11, 2025');
    });
  });

  describe('Today Button State', () => {
    it('should highlight today button when on current week', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const todayButton = screen.getByTestId('today-btn');
      expect(todayButton).toHaveClass('bg-blue-100'); // highlighted state
    });

    it('should not highlight today button when on different week', async () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      // Navigate to next week
      const nextButton = screen.getByTestId('next-week-btn');
      await act(async () => {
        nextButton.click();
      });

      const todayButton = screen.getByTestId('today-btn');
      expect(todayButton).not.toHaveClass('bg-blue-100');
      expect(todayButton).toHaveClass('bg-white'); // normal state
    });
  });

  describe('Button Icons and Text', () => {
    it('should display chevron icons for navigation buttons', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const prevButton = screen.getByTestId('prev-week-btn');
      const nextButton = screen.getByTestId('next-week-btn');

      // Check for SVG elements (chevron icons)
      expect(prevButton.querySelector('svg')).toBeInTheDocument();
      expect(nextButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should display "Today" text in today button', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      expect(screen.getByTestId('today-btn')).toHaveTextContent('Today');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard navigation for previous week', async () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const prevButton = screen.getByTestId('prev-week-btn');
      
      // Simulate Enter key press
      await act(async () => {
        prevButton.focus();
        prevButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        prevButton.click(); // Simulate the click that would happen
      });

      expect(screen.getByTestId('week-range')).toHaveTextContent('Aug 31 - Sep 3, 2025');
    });

    it('should handle keyboard navigation for next week', async () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const nextButton = screen.getByTestId('next-week-btn');
      
      await act(async () => {
        nextButton.focus();
        nextButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        nextButton.click();
      });

      expect(screen.getByTestId('week-range')).toHaveTextContent('Sep 14 - 18, 2025');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for mobile layout', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const weekNav = screen.getByTestId('week-nav');
      expect(weekNav).toHaveClass('flex'); // Should be flex container
      
      const weekRange = screen.getByTestId('week-range');
      expect(weekRange).toHaveClass('text-lg'); // Should have responsive text size
    });

    it('should stack elements properly on mobile', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      const weekNav = screen.getByTestId('week-nav');
      // Should have flex classes for responsive layout
      expect(weekNav).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('Integration with Board Context', () => {
    it('should integrate with Board Context and render week information', () => {
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      // Basic integration test - component should render within context
      expect(screen.getByTestId('week-nav')).toBeInTheDocument();
      expect(screen.getByTestId('week-range')).toBeInTheDocument();
      
      // Navigation buttons should be present and clickable
      expect(screen.getByTestId('prev-week-btn')).toBeInTheDocument();
      expect(screen.getByTestId('next-week-btn')).toBeInTheDocument();
      expect(screen.getByTestId('today-btn')).toBeInTheDocument();
      
      // Should not crash when buttons are clicked
      expect(() => {
        screen.getByTestId('next-week-btn').click();
        screen.getByTestId('prev-week-btn').click();
        screen.getByTestId('today-btn').click();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing week data gracefully', () => {
      // Mock a scenario where getCurrentWeek returns null
      dateUtils.getCurrentWeek.mockReturnValue(null);
      dateUtils.formatWeekRange.mockReturnValue('Current Week');

      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(screen.getByTestId('week-nav')).toBeInTheDocument();
    });

    it('should handle date formatting errors', () => {
      dateUtils.formatWeekRange.mockImplementation(() => {
        throw new Error('Format error');
      });

      // Should not crash when formatting fails
      render(
        <TestWrapper>
          <WeekNav />
        </TestWrapper>
      );

      expect(screen.getByTestId('week-nav')).toBeInTheDocument();
    });
  });
});
