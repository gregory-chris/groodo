Spec: Authentication & Remote Task Storage

1. Project Goal
Evolve the to-do app from a client-only, localStorage-based application to a full-stack application. This involves adding user authentication and storing tasks on a remote server, allowing user data to persist across sessions and devices.

2. Core User Stories
As a Guest, I want to be able to add, edit, and delete tasks, with my data saved locally so I can use the app without an account.

As a User, I want to be able to create an account and sign in, so that my data is secure and accessible from anywhere.

As a Logged-In User, I want my tasks to be automatically saved to the server, so they sync across all my devices.

As a Logged-In User, I want to be able to log out to secure my account on a shared device.

3. Technical Implementation Details
3.1. Configuration Management
Objective: Isolate environment-specific variables and keep secrets out of version control.

File Structure:

/config/config.template.js: A template file checked into git, showing the required structure.

/config/config.development.js: For local development.

/config/config.production.js: For the live environment.

Config Loader:

Create a module /src/config.js that determines the environment (e.g., by checking window.location.hostname) and exports the corresponding configuration object.

The app will import its configuration from this single module.

Environment Variables:

The configuration objects will contain:

apiBaseUrl: http://localhost:8000 (development) or https://groodo-api.greq.me (production).

storageType: 'local' or 'remote'. This will be determined dynamically, not hardcoded.

.gitignore:

Add /config/config.development.js and /config/config.production.js to .gitignore.

3.2. Authentication
Objective: Implement a complete and secure authentication flow using JWT.

3.2.1. UI/UX Flow
User Icon (Top Bar):

A user/profile icon will be displayed in the top-right corner.

Dropdown Menu:

Guest State: Clicking the icon shows a dropdown with "Sign In" and "Sign Up" links.

Authenticated State: Clicking the icon shows the user's username (e.g., "Logged in as john.doe") and a "Logout" link.

Authentication Modal:

Clicking "Sign In" or "Sign Up" opens a clean, well-designed modal window.

The modal will contain a form with fields for username and password. The Sign Up form will include a password confirmation field.

The submit button should have a loading state (e.g., shows a spinner) while an API request is in progress.

Error Handling:

API errors (e.g., "User already exists," "Invalid credentials") should be displayed clearly within the modal, near the form fields or submit button. The message should be user-friendly.

3.2.2. Token Management & State
JWT Storage: Upon successful login, the received JWT will be stored in localStorage under the key authToken.

Global Auth State:

The application needs a global, reactive state to track the user's authentication status (e.g., user: null or user: { username: '...' }).

On application startup, the app must check localStorage for authToken. If a token exists, it should be validated (e.g., by making a lightweight API call to a /me endpoint if available, or by simply decoding it to get the username) to initialize the authenticated state.

Authenticated API Calls: The authToken must be included in the Authorization header for all protected API requests (e.g., Authorization: Bearer <token>). A central API client or wrapper should handle this automatically.

3.3. Task Storage & Synchronization
Objective: Create an abstract storage layer that can seamlessly switch between localStorage and the remote server.

3.3.1. Storage Client Abstraction
Define a Storage Interface: Create a standard interface that both storage clients will implement.

// src/services/storageInterface.js
const StorageInterface = {
  getTasks: async () => {},
  addTask: async (taskData) => {},
  updateTask: async (taskId, updates) => {},
  deleteTask: async (taskId) => {},
  // Optional: for batch operations
  syncTasks: async (tasks) => {},
};

Implement Two Clients:

LocalStorageClient: Implements the StorageInterface using the existing localStorage logic.

ApiStorageClient: Implements the StorageInterface by making fetch calls to the API endpoints defined in the documentation. It must handle adding the auth token to headers.

3.3.2. Dynamic Storage Strategy
The application will decide which storage client to use based on the user's authentication state.

When the user is logged out, the app uses LocalStorageClient.

When the user is logged in, the app uses ApiStorageClient.

3.3.3. CRITICAL: One-Time Sync on Login
This is the most critical part of the data flow to prevent data loss.

When a user successfully logs in:

Check Local State: Immediately check if there are any tasks in localStorage. If localStorage is empty, proceed to step 4.

Merge Data: If local tasks exist, fetch all tasks from the remote server.

Merge the local and remote task lists. A simple strategy is to combine both arrays and send the full, merged list to a batch update/sync endpoint on the server.

(Alternative strategy: a more complex diffing algorithm to only upload new/changed local tasks).

Upload Merged Tasks: Send the complete, consistent list of tasks to the server to ensure both client and server are perfectly in sync.

Clear Local Storage: After the server confirms the sync was successful, delete all tasks from localStorage.

Switch to API: The application now exclusively uses the ApiStorageClient for all subsequent task operations.

On Logout:

Clear the authToken from localStorage.

Clear any user data from the global state.

Reload the application or switch the storage client back to LocalStorageClient. The user will now have an empty local task list, preventing data from the previous user from leaking.