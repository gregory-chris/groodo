import React from 'react';
import { BoardProvider } from '../context/BoardContext';
import { AccessibilityProvider } from './AccessibilityProvider';
import DragProvider from './DragProvider';
import WeekNav from './WeekNav';
import Column from './Column';
import TaskModal from './TaskModal';
import { useBoardContext } from '../context/BoardContext';
import { getWeekDates } from '../../../lib/date';

/**
 * Main Board component that integrates all task management features
 */
function BoardContent() {
  const { state } = useBoardContext();
  
  // Get week dates from the current week in state
  const weekDates = state.currentWeek ? getWeekDates(state.currentWeek.start) : [];
  
  // Check if we're viewing current week (will be handled by WeekNav)
  const isCurrentWeek = false; // This will be managed by WeekNav component
  

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'white'
    }}>
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#701E2E',
          color: 'white',
          padding: '0.5rem',
          zIndex: 50,
          borderRadius: '0 0 0.5rem 0'
        }}
      >
        Skip to main content
      </a>

      {/* Header with app title */}
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1>GrooDo</h1>
              <span>Weekly task management</span>
            </div>
            <div style={{ color: '#CF904E', fontWeight: 600, fontSize: '1.25rem' }}
              title='Groodo - Task Management'>
              <img 
                src="/groodo_logo_2.png" 
                alt="Groodo Logo" 
                style={{ 
                  height: '2rem', 
                  width: 'auto' 
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Week Navigation */}
      <div className="py-4 flex-shrink-0 w-full">
        <div className="w-full px-6">
          <WeekNav />
        </div>
      </div>

      {/* Main Content - Task Board */}
      <main id="main-content" className="w-full px-6 pb-8 flex-1 overflow-hidden flex flex-col md:px-4 sm:px-3">
        <h2 className="sr-only">Task Board</h2>
        
        {/* Task Columns */}
        <div className="grid grid-cols-1 gap-4 flex-1 overflow-hidden min-h-0 w-full justify-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
