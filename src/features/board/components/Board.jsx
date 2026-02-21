import React from 'react';
import { BoardProvider } from '../context/BoardContext';
import { AccessibilityProvider } from './AccessibilityProvider';
import DragProvider from './DragProvider';
import WeekNav from './WeekNav';
import Column from './Column';
import TaskModal from './TaskModal';
import Header from '../../../components/Header';
import { useBoardContext } from '../context/BoardContext';
import { getWeekDates } from '../../../lib/date';
import Navigation from '../../../components/Navigation';

/**
 * Main Board component that integrates all task management features
 */
function BoardContent() {
  const { state, isLoading } = useBoardContext();

  // Get week dates from the current week in state
  const weekDates = state.currentWeek ? getWeekDates(state.currentWeek.start) : [];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white'
    }}>
      {/* Header */}
      <Header isLoading={isLoading} subtitle="Weekly task management" />

      {/* Navigation Bar */}
      <div className="px-6 bg-white border-b border-gray-200">
        <Navigation />
      </div>

      {/* Week Navigation */}
      <div className="py-4 flex-shrink-0 w-full">
        <div className="w-full px-6">
          <WeekNav />
        </div>
      </div>

      {/* Main Content - Task Board */}
      <main id="main-content" className="w-full px-6 pb-8 flex-1 overflow-y-auto sm:overflow-hidden flex flex-col md:px-4 sm:px-3">
        <h2 className="sr-only">Task Board</h2>

        {/* Task Columns */}
        <div className="grid grid-cols-1 gap-4 w-full justify-center sm:grid-cols-2 md:grid-cols-3 min-[1200px]:grid-cols-5 sm:flex-1 sm:overflow-hidden sm:min-h-0">
          {weekDates
            .filter(date => date instanceof Date && !isNaN(date.getTime()))
            .map((date, index) => (
              <Column
                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${index}`}
                date={date}
              />
            ))}
        </div>

        {/* Empty state when no dates */}
        {weekDates.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 0',
            color: '#cbd5e1',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>📅</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              No dates available
            </h3>
            <p>Please check your week navigation or try refreshing the page.</p>
          </div>
        )}
      </main>

      {/* Task Modal (controlled by BoardContext) */}
      <TaskModal />
    </div>
  );
}

/**
 * Main Board component with all providers
 */
function Board() {
  return (
    <AccessibilityProvider>
      <BoardProvider>
        <DragProvider>
          <BoardContent />
        </DragProvider>
      </BoardProvider>
    </AccessibilityProvider>
  );
}

export default Board;
