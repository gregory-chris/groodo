/**
 * Base class defining the interface for document storage clients.
 * Both LocalStorageDocumentsClient and GroodoDocumentsClient implement this interface.
 */
export class DocumentStorageClient {
  /**
   * List all documents from storage
   * @param {Object} options - Query options (parentId)
   * @returns {Promise<Array>} Array of document objects
   */
  async listDocuments(options = {}) {
    throw new Error('listDocuments() must be implemented by subclass');
  }

  /**
   * Get a single document by ID
   * @param {number|string} documentId - Document ID
   * @returns {Promise<Object>} Document object
   */
  async getDocument(documentId) {
    throw new Error('getDocument() must be implemented by subclass');
  }

  /**
   * Create a new document in storage
   * @param {Object} document - Document object to create
   * @returns {Promise<Object>} Created document with server/storage ID
   */
  async createDocument(document) {
    throw new Error('createDocument() must be implemented by subclass');
  }

  /**
   * Update an existing document in storage
   * @param {number|string} documentId - ID of document to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated document object
   */
  async updateDocument(documentId, updates) {
    throw new Error('updateDocument() must be implemented by subclass');
  }

  /**
   * Delete a document from storage
   * @param {number|string} documentId - ID of document to delete
   * @returns {Promise<void>}
   */
  async deleteDocument(documentId) {
    throw new Error('deleteDocument() must be implemented by subclass');
  }
}
