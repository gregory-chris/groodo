/**
 * Storage module for persisting application state to localStorage
 * Handles versioning and migration of stored data
 */

export const STORAGE_KEY = 'groodo-task-board';
export const CURRENT_VERSION = 2;

/**
 * Save application state to localStorage with versioning
 * @param {Object} state - The application state to save
 */
export function saveState(state) {
  try {
    const dataToStore = {
      version: CURRENT_VERSION,
      data: state,
      timestamp: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    // Handle quota exceeded error and other localStorage errors
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('localStorage quota exceeded. Could not save state.');
      // Could implement cleanup strategy here (remove old data, etc.)
    } else {
      console.warn('Failed to save state to localStorage:', error.message);
    }
  }
}

/**
 * Load application state from localStorage with migration support
 * @returns {Object|null} The loaded state or null if no valid data exists
 */
export function loadState() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      return null;
    }
    
    const parsed = JSON.parse(storedData);
    
    // Handle legacy data without version (treat as version 1)
    if (!parsed.version) {
      const migratedData = migrateFromVersion1(parsed);
      // Save migrated data back to storage
      saveState(migratedData);
      return migratedData;
    }
    
    // Handle versioned data
    if (parsed.version < CURRENT_VERSION) {
      const migratedData = migrateData(parsed);
      // Save migrated data back to storage
      saveState(migratedData);
      return migratedData;
    }
    
    // Current version - return data as-is
    return parsed.data;
    
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error.message);
    return null;
  }
}

/**
 * Migrate data from older versions to current version
 * @param {Object} oldData - The old versioned data
 * @returns {Object} The migrated data
 */
function migrateData(oldData) {
  let data = oldData.data;
  
  // Migrate from version 1 to version 2
  if (oldData.version === 1) {
    data = migrateFromVersion1(data);
  }
  
  // Future migrations would go here
  // if (oldData.version === 2) {
  //   data = migrateFromVersion2(data);
  // }
  
  return data;
}

/**
 * Migrate from version 1 (or legacy unversioned) data structure
 * @param {Object} v1Data - Version 1 data structure
 * @returns {Object} Migrated data structure
 */
function migrateFromVersion1(v1Data) {
  // Version 1 migration logic
  // For now, just ensure required fields exist
  const migrated = {
    ...v1Data,
    // Add any new required fields for version 2
    tasks: v1Data.tasks || [],
    // Ensure task structure is consistent
  };
  
  // Ensure all tasks have required fields
  if (migrated.tasks) {
    migrated.tasks = migrated.tasks.map(task => ({
      ...task,
      // Add any missing fields that were added in version 2
      id: task.id || Date.now() + Math.random(),
      title: task.title || '',
      completed: task.completed || false,
      column: task.column || 'general',
      order: task.order || 0,
      createdAt: task.createdAt || Date.now(),
      description: task.description || ''
    }));
  }
  
  return migrated;
}
