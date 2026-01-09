import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDocumentsPersistence } from '../hooks/useDocumentsPersistence.js';

// Action types
const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  SELECT_DOCUMENT: 'SELECT_DOCUMENT',
  SET_DELETING: 'SET_DELETING',
};

// Initial state
const initialState = {
  documents: [],
  selectedDocumentId: null,
  deletingDocumentIds: [], // Track documents being deleted (for blur effect)
};

// Reducer function
function documentsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_STATE:
      return {
        ...state,
        ...action.payload,
      };

    case ACTIONS.ADD_DOCUMENT: {
      const newDocument = {
        id: action.payload.id || `document-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: action.payload.title || 'Untitled',
        content: action.payload.content || '',
        parentId: action.payload.parentId || null,
        order: action.payload.order ?? 0,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        updatedAt: action.payload.updatedAt || new Date().toISOString(),
        ...action.payload,
      };

      return {
        ...state,
        documents: [...state.documents, newDocument],
      };
    }

    case ACTIONS.UPDATE_DOCUMENT: {
      const { documentId, updates } = action.payload;
      
      // Update selectedDocumentId if the ID of the selected document changed
      const newSelectedDocumentId = 
        state.selectedDocumentId === documentId && updates.id 
          ? updates.id 
          : state.selectedDocumentId;

      return {
        ...state,
        selectedDocumentId: newSelectedDocumentId,
        documents: state.documents.map(doc =>
          doc.id === documentId
            ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
            : doc
        ),
      };
    }

    case ACTIONS.DELETE_DOCUMENT: {
      const { documentId } = action.payload;
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== documentId),
        selectedDocumentId: state.selectedDocumentId === documentId ? null : state.selectedDocumentId,
        deletingDocumentIds: state.deletingDocumentIds.filter(id => id !== documentId),
      };
    }

    case ACTIONS.SELECT_DOCUMENT:
      return {
        ...state,
        selectedDocumentId: action.payload,
      };

    case ACTIONS.SET_DELETING: {
      const { documentId, isDeleting } = action.payload;
      if (isDeleting) {
        return {
          ...state,
          deletingDocumentIds: [...state.deletingDocumentIds, documentId],
        };
      } else {
        return {
          ...state,
          deletingDocumentIds: state.deletingDocumentIds.filter(id => id !== documentId),
        };
      }
    }

    default:
      return state;
  }
}

// Create context
const DocumentsContext = createContext(null);

// Provider component
export function DocumentsProvider({ children }) {
  const [state, dispatch] = useReducer(documentsReducer, initialState);
  
  // Initialize persistence hook for auto-save, load, error handling
  const persistence = useDocumentsPersistence(state, dispatch);

  // Sync selection to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (persistence.isLoaded) {
      if (state.selectedDocumentId) {
        localStorage.setItem('groodo_selected_document', state.selectedDocumentId);
      } else {
        localStorage.removeItem('groodo_selected_document');
      }
    }
  }, [state.selectedDocumentId, persistence.isLoaded]);

  // Action creators with immediate persistence
  const addDocument = useCallback((documentData) => {
    const tempId = `document-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDocument = { 
      ...documentData, 
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Optimistic update
    dispatch({
      type: ACTIONS.ADD_DOCUMENT,
      payload: newDocument,
    });
    
    // Async sync
    persistence.handleCreateDocument(newDocument, dispatch);
    
    return tempId;
  }, [persistence]);

  const updateDocument = useCallback((documentId, updates) => {
    const previousDocument = state.documents.find(d => d.id === documentId);
    
    // Optimistic update
    dispatch({
      type: ACTIONS.UPDATE_DOCUMENT,
      payload: { documentId, updates },
    });
    
    // Async sync with rollback
    if (previousDocument) {
      persistence.handleUpdateDocument(documentId, updates, previousDocument, dispatch);
    }
  }, [persistence, state.documents]);

  const deleteDocument = useCallback(async (documentId) => {
    const documentToDelete = state.documents.find(d => d.id === documentId);
    if (!documentToDelete) return { success: false };
    
    // Check if document has children
    const hasChildren = state.documents.some(d => d.parentId === documentId);
    if (hasChildren) {
      return { success: false, error: 'Cannot delete document with children' };
    }
    
    // Set deleting state (for blur effect)
    dispatch({
      type: ACTIONS.SET_DELETING,
      payload: { documentId, isDeleting: true },
    });
    
    // Async delete with proper error handling
    const result = await persistence.handleDeleteDocument(documentId, documentToDelete, dispatch);
    
    if (result.success) {
      // Remove from state
      dispatch({
        type: ACTIONS.DELETE_DOCUMENT,
        payload: { documentId },
      });
    } else {
      // Remove deleting state on failure
      dispatch({
        type: ACTIONS.SET_DELETING,
        payload: { documentId, isDeleting: false },
      });
    }
    
    return result;
  }, [persistence, state.documents]);

  const selectDocument = useCallback((documentId) => {
    dispatch({
      type: ACTIONS.SELECT_DOCUMENT,
      payload: documentId,
    });
  }, []);

  // Helper to get next untitled name
  const getNextUntitledName = useCallback(() => {
    return persistence.getNextUntitledName();
  }, [persistence]);

  const value = {
    state,
    isLoading: persistence.isLoading,
    isLoaded: persistence.isLoaded,
    error: persistence.error,
    // Document actions
    addDocument,
    updateDocument,
    deleteDocument,
    selectDocument,
    getNextUntitledName,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

DocumentsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the DocumentsContext
export function useDocumentsContext() {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocumentsContext must be used within a DocumentsProvider');
  }
  return context;
}

export { ACTIONS };
