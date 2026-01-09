import { DocumentStorageClient } from '../documentStorageClient.js';
import * as groodoDocumentsApi from '../groodoApiDocumentsClient.js';

const DOCUMENT_COUNTER_KEY = 'groodo_document_counter';

/**
 * GroodoDocumentsClient - Implements document storage using Groodo API server
 * For authenticated users
 */
export class GroodoDocumentsClient extends DocumentStorageClient {
  /**
   * Get the next document number for "Untitled N" naming
   * Uses localStorage counter even for authenticated users for simplicity
   * @returns {number} Next document number
   */
  _getNextDocumentNumber() {
    const counter = parseInt(localStorage.getItem(DOCUMENT_COUNTER_KEY) || '0', 10);
    const nextNumber = counter + 1;
    localStorage.setItem(DOCUMENT_COUNTER_KEY, String(nextNumber));
    return nextNumber;
  }

  /**
   * List all documents from Groodo API
   * @param {Object} options - Query options (parentId)
   * @returns {Promise<Array>} Array of document objects
   */
  async listDocuments(options = {}) {
    try {
      const documents = await groodoDocumentsApi.listDocuments(options);
      return documents.map(doc => this._transformFromApi(doc));
    } catch (error) {
      console.error('Failed to load documents from Groodo API:', error);
      throw new Error(error.message || 'Failed to load documents from server');
    }
  }

  /**
   * Get a single document by ID
   * @param {number|string} documentId - Document ID
   * @returns {Promise<Object>} Document object
   */
  async getDocument(documentId) {
    try {
      const document = await groodoDocumentsApi.getDocument(documentId);
      return this._transformFromApi(document);
    } catch (error) {
      console.error('Failed to get document from Groodo API:', error);
      throw new Error(error.message || 'Failed to get document from server');
    }
  }

  /**
   * Create a new document in Groodo API
   * @param {Object} document - Document object to create
   * @returns {Promise<Object>} Created document with server ID
   */
  async createDocument(document) {
    try {
      const apiDocument = this._transformToApi(document);
      const createdDocument = await groodoDocumentsApi.createDocument(apiDocument);
      return this._transformFromApi(createdDocument);
    } catch (error) {
      console.error('Failed to create document on Groodo API:', error);
      throw new Error(error.message || 'Failed to create document on server');
    }
  }

  /**
   * Update an existing document in Groodo API
   * @param {number|string} documentId - ID of document to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated document object
   */
  async updateDocument(documentId, updates) {
    try {
      const apiUpdates = this._transformToApi(updates);
      const updatedDocument = await groodoDocumentsApi.patchDocument(documentId, apiUpdates);
      return this._transformFromApi(updatedDocument);
    } catch (error) {
      console.error('Failed to update document on Groodo API:', error);
      throw new Error(error.message || 'Failed to update document on server');
    }
  }

  /**
   * Delete a document from Groodo API
   * @param {number|string} documentId - ID of document to delete
   * @returns {Promise<void>}
   */
  async deleteDocument(documentId) {
    try {
      await groodoDocumentsApi.deleteDocument(documentId);
    } catch (error) {
      console.error('Failed to delete document from Groodo API:', error);
      throw new Error(error.message || 'Failed to delete document from server');
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

  /**
   * Transform document from API format to internal format
   * @private
   */
  _transformFromApi(apiDocument) {
    return {
      id: apiDocument.id,
      title: apiDocument.title || '',
      content: apiDocument.content || '',
      parentId: apiDocument.parentId || null,
      order: apiDocument.order ?? 0,
      createdAt: apiDocument.createdAt || new Date().toISOString(),
      updatedAt: apiDocument.updatedAt || new Date().toISOString(),
    };
  }

  /**
   * Transform document from internal format to API format
   * @private
   */
  _transformToApi(document) {
    const apiDocument = {};
    
    if (document.title !== undefined) apiDocument.title = document.title;
    if (document.content !== undefined) apiDocument.content = document.content;
    if (document.parentId !== undefined) apiDocument.parentId = document.parentId;
    if (document.order !== undefined) apiDocument.order = document.order;
    
    return apiDocument;
  }
}
