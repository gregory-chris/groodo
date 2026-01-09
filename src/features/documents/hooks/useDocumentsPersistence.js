import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { GroodoDocumentsClient } from '../../../lib/clients/GroodoDocumentsClient.js';
import { LocalStorageDocumentsClient } from '../../../lib/clients/LocalStorageDocumentsClient.js';
import toast from 'react-hot-toast';

/**
 * Hook for persisting documents to storage (API or localStorage)
 * Handles automatic loading, saving, and error recovery
 */
export function useDocumentsPersistence(state, dispatch) {
  const { status } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Use ref to track if we're currently loading to prevent race conditions
  const isLoadingRef = useRef(false);

  // Determine which client to use based on auth status
  const documentsClient = useMemo(() => {
    return status === 'authenticated' 
      ? new GroodoDocumentsClient()
      : new LocalStorageDocumentsClient();
  }, [status]);

  /**
   * Load data from storage with error handling
   */
  const loadData = useCallback(async () => {
    // Prevent concurrent loads
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    setIsLoading(true);
    setIsLoaded(false);
    setError(null);

    try {
      // Load all documents
      const documents = await documentsClient.listDocuments();
      
      // Load last selected document from localStorage
      const savedDocumentId = localStorage.getItem('groodo_selected_document');
      
      // Validate that the saved document still exists
      let selectedDocumentId = null;
      if (savedDocumentId && documents.some(d => d.id === savedDocumentId)) {
        selectedDocumentId = savedDocumentId;
      }
      
      dispatch({ 
        type: 'LOAD_STATE', 
        payload: { 
          documents,
          selectedDocumentId,
        }
      });
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load documents:', err);
      toast.error('Failed to load documents: ' + (err.message || 'Unknown error'));
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [documentsClient, dispatch]);

  /**
   * Load data on mount and when auth status changes
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handle creating a document with optimistic update and rollback on failure
   */
  const handleCreateDocument = useCallback(async (document, documentDispatch) => {
    try {
      const createdDocument = await documentsClient.createDocument(document);
      
      // Update temp ID with server/storage ID
      documentDispatch({ 
        type: 'UPDATE_DOCUMENT', 
        payload: { 
          documentId: document.id, 
          updates: { 
            id: createdDocument.id,
            createdAt: createdDocument.createdAt,
            updatedAt: createdDocument.updatedAt,
          } 
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to create document:', error);
      
      // Rollback: remove the document
      documentDispatch({ 
        type: 'DELETE_DOCUMENT', 
        payload: { documentId: document.id }
      });
      
      toast.error('Failed to create document: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [documentsClient]);

  /**
   * Handle updating a document with rollback on failure
   */
  const handleUpdateDocument = useCallback(async (documentId, updates, previousDocument, documentDispatch) => {
    try {
      await documentsClient.updateDocument(documentId, updates);
      return { success: true };
    } catch (error) {
      console.error('Failed to update document:', error);
      
      // Rollback to previous values
      documentDispatch({ 
        type: 'UPDATE_DOCUMENT', 
        payload: { 
          documentId, 
          updates: previousDocument 
        }
      });
      
      toast.error('Failed to update document: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [documentsClient]);

  /**
   * Handle deleting a document with rollback on failure
   */
  const handleDeleteDocument = useCallback(async (documentId, document, documentDispatch) => {
    try {
      await documentsClient.deleteDocument(documentId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete document:', error);
      
      toast.error('Failed to delete document: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [documentsClient]);

  /**
   * Fetch a single document's full content from server
   */
  const handleFetchDocumentContent = useCallback(async (documentId) => {
    try {
      const document = await documentsClient.getDocument(documentId);
      return { success: true, document };
    } catch (error) {
      console.error('Failed to fetch document content:', error);
      toast.error('Failed to load document: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    }
  }, [documentsClient]);

  /**
   * Get the next "Untitled N" name
   */
  const getNextUntitledName = useCallback(() => {
    return documentsClient.getNextUntitledName();
  }, [documentsClient]);

  return {
    isLoading,
    isLoaded,
    error,
    handleCreateDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleFetchDocumentContent,
    getNextUntitledName,
  };
}
