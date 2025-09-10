/**
 * Date utilities for Sunday-Thursday work week
 * Handles week calculations, today detection, and timezone considerations
 */

/**
 * Get the start and end dates of the work week (Sunday-Thursday) for a given date
 * @param {Date} date - The date to find the week for
 * @returns {Object} Object with start (Sunday) and end (Thursday) dates
 */
export function getWeekBounds(date) {
  const inputDate = new Date(date);
  
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = inputDate.getDay();
  
  // For Friday (5) and Saturday (6), we want the NEXT work week
  let daysToSunday;
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    // Friday or Saturday - go to next Sunday
    daysToSunday = 7 - dayOfWeek;
  } else {
    // Sunday through Thursday - go to this week's Sunday
    daysToSunday = -dayOfWeek;
  }
  
  // Calculate Sunday of the work week
  const sunday = new Date(inputDate);
  sunday.setDate(inputDate.getDate() + daysToSunday);
  sunday.setHours(0, 0, 0, 0); // Start of day
  
  // Calculate Thursday of the work week (4 days after Sunday)
  const thursday = new Date(sunday);
  thursday.setDate(sunday.getDate() + 4);
  thursday.setHours(23, 59, 59, 999); // End of day
  
  return {
    start: sunday,
    end: thursday
  };
}

/**
 * Check if a given date is today (same calendar day)
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
export function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  
  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
}

/**
 * Check if two dates are the same calendar day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are the same day
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Get the current work week bounds
 * @returns {Object} Object with start (Sunday) and end (Thursday) dates
 */
export function getCurrentWeek() {
  return getWeekBounds(new Date());
}

/**
 * Get the next work week bounds
 * @param {Object} currentWeek - Current week bounds {start, end}
 * @returns {Object} Next week bounds {start, end}
 */
export function getNextWeek(currentWeek) {
  const nextSunday = new Date(currentWeek.start);
  nextSunday.setDate(nextSunday.getDate() + 7);
  
  return getWeekBounds(nextSunday);
}

/**
 * Get the previous work week bounds
 * @param {Object} currentWeek - Current week bounds {start, end}
 * @returns {Object} Previous week bounds {start, end}
 */
export function getPreviousWeek(currentWeek) {
  const previousSunday = new Date(currentWeek.start);
  previousSunday.setDate(previousSunday.getDate() - 7);
  
  return getWeekBounds(previousSunday);
}

/**
 * Get an array of dates for the work week (Sunday through Thursday)
 * @param {Date} startDate - The Sunday start date
 * @returns {Date[]} Array of 5 dates from Sunday to Thursday
 */
export function getWeekDates(startDate) {
  if (!startDate) {
    console.error('Invalid startDate provided to getWeekDates:', startDate);
    return [];
  }
  
  const dates = [];
  const current = new Date(startDate);
  
  // Validate the date
  if (isNaN(current.getTime())) {
    console.error('Invalid date provided to getWeekDates:', startDate);
    return [];
  }
  
  current.setHours(0, 0, 0, 0);
  
  // Generate 5 dates: Sunday (0) through Thursday (4)
  for (let i = 0; i < 5; i++) {
    const newDate = new Date(current);
    if (isNaN(newDate.getTime())) {
      console.error('Generated invalid date at index', i);
      break;
    }
    dates.push(newDate);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Format a date for display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const options = {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date for display with full month name
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string with full month
 */
export function formatDateLong(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get the week range display string
 * @param {Object} week - Week bounds {start, end}
 * @returns {string} Week range string like "Sep 8 - Sep 12, 2025"
 */
export function formatWeekRange(week) {
  const startMonth = week.start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = week.start.getDate();
  const endMonth = week.end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = week.end.getDate();
  const year = week.end.getFullYear();
  
  if (week.start.getMonth() === week.end.getMonth()) {
    // Same month
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    // Different months
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

/**
 * Check if a date falls within the work week (Sunday-Thursday)
 * @param {Date} date - The date to check
 * @returns {boolean} True if date is within work week
 */
export function isWorkDay(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 0 && dayOfWeek <= 4; // Sunday (0) through Thursday (4)
}

/**
 * Get day name for display
 * @param {Date} date - The date
 * @returns {string} Day name (e.g., "Sunday", "Monday")
 */
export function getDayName(date) {
  const options = { weekday: 'long' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get short day name for display
 * @param {Date} date - The date
 * @returns {string} Short day name (e.g., "Sun", "Mon")
 */
export function getShortDayName(date) {
  const options = { weekday: 'short' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get a unique date key for storing tasks
 * @param {Date} date - The date
 * @returns {string} Date key in YYYY-MM-DD format
 */
export function getDateKey(date) {
  return date.toISOString().split('T')[0];
}
