import { DocumentStorageClient } from '../documentStorageClient.js';

const DOCUMENTS_STORAGE_KEY = 'groodo_documents';
const DOCUMENT_COUNTER_KEY = 'groodo_document_counter';

/**
 * LocalStorageDocumentsClient - Implements document storage using browser localStorage
 * For guest users or when not authenticated
 */
export class LocalStorageDocumentsClient extends DocumentStorageClient {
  /**
   * Get the next document number for "Untitled N" naming
   * @returns {number} Next document number
   */
  _getNextDocumentNumber() {
    const counter = parseInt(localStorage.getItem(DOCUMENT_COUNTER_KEY) || '0', 10);
    const nextNumber = counter + 1;
    localStorage.setItem(DOCUMENT_COUNTER_KEY, String(nextNumber));
    return nextNumber;
  }

  /**
   * List all documents from localStorage
   * @param {Object} options - Query options (parentId)
   * @returns {Promise<Array>} Array of document objects
   */
  async listDocuments(options = {}) {
    try {
      const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
      let documents = stored ? JSON.parse(stored) : [];
      
      // Filter by parentId if provided
      if (options.parentId !== undefined) {
        documents = documents.filter(d => d.parentId === options.parentId);
      }
      
      return documents;
    } catch (error) {
      console.error('Failed to load documents from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a single document by ID
   * @param {number|string} documentId - Document ID
   * @returns {Promise<Object>} Document object
   */
  async getDocument(documentId) {
    try {
      const documents = await this.listDocuments();
      const document = documents.find(d => d.id === documentId);
      if (!document) {
        throw new Error(`Document with id ${documentId} not found`);
      }
      return document;
    } catch (error) {
      console.error('Failed to get document from localStorage:', error);
      throw new Error('Failed to get document locally');
    }
  }

  /**
   * Create a new document in localStorage
   * @param {Object} document - Document object to create
   * @returns {Promise<Object>} Created document with generated ID
   */
  async createDocument(document) {
    try {
      const documents = await this.listDocuments();
      
      // Generate ID if not provided
      const newDocument = {
        ...document,
        id: document.id || `document-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: document.createdAt || new Date().toISOString(),
        updatedAt: document.updatedAt || new Date().toISOString(),
      };
      
      // Add to documents array
      const updatedDocuments = [...documents, newDocument];
      
      // Save to localStorage
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocuments));
      
      return newDocument;
    } catch (error) {
      console.error('Failed to create document in localStorage:', error);
      throw new Error('Failed to save document locally');
    }
  }

  /**
   * Update an existing document in localStorage
   * @param {number|string} documentId - ID of document to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated document object
   */
  async updateDocument(documentId, updates) {
    try {
      const documents = await this.listDocuments();
      
      // Find and update the document
      const documentIndex = documents.findIndex(d => d.id === documentId);
      if (documentIndex === -1) {
        throw new Error(`Document with id ${documentId} not found`);
      }
      
      const updatedDocument = { 
        ...documents[documentIndex], 
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const updatedDocuments = [...documents];
      updatedDocuments[documentIndex] = updatedDocument;
      
      // Save to localStorage
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocuments));
      
      return updatedDocument;
    } catch (error) {
      console.error('Failed to update document in localStorage:', error);
      throw new Error('Failed to update document locally');
    }
  }

  /**
   * Delete a document from localStorage
   * @param {number|string} documentId - ID of document to delete
   * @returns {Promise<void>}
   */
  async deleteDocument(documentId) {
    try {
      const documents = await this.listDocuments();
      
      // Check if document has children
      const hasChildren = documents.some(d => d.parentId === documentId);
      if (hasChildren) {
        throw new Error('Cannot delete document with children');
      }
      
      // Remove the document
      const updatedDocuments = documents.filter(d => d.id !== documentId);
      
      // Save to localStorage
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocuments));
    } catch (error) {
      console.error('Failed to delete document from localStorage:', error);
      throw new Error(error.message || 'Failed to delete document locally');
    }
  }

  /**
   * Get the next "Untitled N" title
   * @returns {string} Next untitled document name
   */
  getNextUntitledName() {
    const number = this._getNextDocumentNumber();
    return `Untitled ${number}`;
  }
}
