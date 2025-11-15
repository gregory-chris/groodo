# Projects feature

## Brief

The objective is to implement project-based task management. 
This feature should introduce a dedicated page (or an optional floating modal window) where users can view a list of projects alongside their associated tasks.
The projects interface must support full CRUD (Create, Read, Update, Delete) operations for projects. Upon selecting a project, users should be able to manage its tasks.
Each project should support a hierarchical structure of tasks, allowing tasks to have nested sub-tasks. This hierarchy should be flexible and similar to structures such as story, epic, task, and sub-task, but without fixed task type definitions.

## Feature description

### The top bar

The top navigation bar must include two links: "Weekly tasks" and "Projects." 
- The "Weekly tasks" link routes to the existing calendar-like interface where users manage their weekly tasks.
- The "Projects" link routes to the new projects page for project-based task management, allowing users to access and organize projects and their associated tasks.

The link corresponding to the currently active page must be visually indicated as active and must not be clickable. For example, when the user is on the "Projects" page, the "Projects" link should appear active and be disabled or otherwise unclickable.

### The projects management page 

**Layout**

The page layout consists of three main sections: 
1. The list of projects (projects sidebar).
2. The tasks associated with the selected project (tasks panel).
3. The details and properties of the currently selected entity, which can be either a project or a task (details/properties panel).

**projects sidebar**

The projects sidebar must support full CRUD functionality—allowing users to Create, Read, Update, and Delete projects.

When a new project is created, it should be added to the end of the project list in the sidebar and become the selected project automatically.

When a project is selected
- The tasks panel will display tasks tree associated with this project
- Its details of the project should appear in the details panel with these details include:
    - The project title (entered previously during creation)
    - A description field implemented as a textarea:
        - The textarea should show at least 5 lines by default
        - It should automatically grow taller as the user enters more lines or pastes text exceeding 5 lines
    - "Save" and "Delete" buttons

When the "Delete" button is clicked, deletion must require a custom confirmation dialog to help prevent accidental removal.

**Tasks panel**

The tasks panel displays the list of tasks for the currently selected project.

This panel must fully support CRUD operations: users should be able to Create, Read, Update, and Delete any task related to the selected project.

For each task:
- There is a checkbox allowing users to mark the task as completed.
    * A task can only be marked as completed if all its sub-tasks are also completed.
    * When a task is completed, it should be visually grayed out and have a strikethrough applied (matching the style of the weekly tasks manager).
- There is a "+" icon next to each task to add sub-tasks.
    * Newly created sub-tasks are appended at the bottom of their parent’s sub-task list.
    * Sub-tasks are displayed directly after their parent task and are indented for clarity.
    * Upon creation, a sub-task is automatically selected, and its details appear in the details panel.
- Tasks can be reordered within their project using drag-and-drop interactions. 
- Sub-tasks can also be nested further, displaying their hierarchy visually.
- Tasks can have at most 3 nesting levels parent->child->grandchild
- The panel should efficiently update to reflect any changes and provide a responsive, user-friendly experience.

At the top of each tasks list—whether it is for main tasks or any level of sub-tasks—display a text input that allows users to add a new task at that level. The behavior and appearance of this input should closely match how new tasks are added on the weekly tasks page.

The operation buttons/links on every task should have similar behavior as the current weekly tasks page's.

### Layout and behavior

- When the projects page loads, automatically select the project or task that the user last selected, as saved in the browser's localStorage. If there is no previous selection, default to selecting the first project in the list.
- The projects page layout must be fully responsive and optimized for mobile devices.
- Both the projects sidebar and the tasks panel should have fixed, equal widths, while the details panel should be the primary area and take up the most space. Don't make the projects sidebar and the tasks panel too narrow. 
- The sub tasks can be collapsed and expanded. By default everything is expanded.
- completed tasks go to the end of the list, in their level. similar behavior as in the weekly-tasks page.
- Tasks can be either related to a project or to a date in the weekly tasks
- Tasks that have sub-tasks cannot be deleted.
- Projects that have tasks not in "completed" state cannot be deleted

## Projects API

### Endpoints
Here are the projects management endpoints:

| Endpoint                   | Method | Description                    |
|----------------------------|--------|--------------------------------|
| /api/projects              | GET    | List user's projects           |
| /api/projects              | POST   | Create a new project           |
| /api/project/:id           | GET    | Get specific project details   |
| /api/project/:id           | PUT    | Update project (full update)   |
| /api/project/:id           | PATCH  | Update project (partial update)|
| /api/project/:id           | DELETE | Delete project                 |
| /api/project/:id/tasks     | GET    | Get all tasks for a project    |

Please note that tasks API has also slightly changed.

### Full API reference

The full documentation of the API is [here](https://github.com/gregory-chris/groodo-api/blob/master/docs/api-reference.md)
Fetch the documentation and update the client SDKs and the parts in the code that are responsible for syncing with the server


#### API models

Endpoint: POST /api/projects
Authentication: Required

Request Body
```JSON
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "url": "https://example.com/project",
  "githubUrl": "https://github.com/user/project",
  "color": "#FF5733",
  "customFields": {
    "priority": "high",
    "status": "active",
    "team": "frontend"
  }
}
```

Response (201 Created)
```JSON
{
  "result": "success",
  "data": {
    "id": 5,
    "userId": 1,
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "url": "https://example.com/project",
    "githubUrl": "https://github.com/user/project",
    "color": "#FF5733",
    "customFields": {
      "priority": "high",
      "status": "active",
      "team": "frontend"
    },
    "createdAt": "2025-09-01T08:00:00+00:00",
    "updatedAt": "2025-09-01T08:00:00+00:00"
  }
}
```

====

Get Single Project
Retrieve a specific project by ID (must belong to authenticated user).

Endpoint: GET /api/project/{projectId}

Response (200 OK)
```JSON
{
  "result": "success",
  "data": {
    "id": 5,
    "userId": 1,
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "url": "https://example.com/project",
    "githubUrl": "https://github.com/user/project",
    "color": "#FF5733",
    "customFields": {
      "priority": "high",
      "status": "active",
      "team": "frontend"
    },
    "createdAt": "2025-09-01T08:00:00+00:00",
    "updatedAt": "2025-09-28T08:00:00+00:00"
  }
}
```

====

Update Project
Update an existing project (must belong to authenticated user). Supports both full (PUT) and partial (PATCH) updates.

Endpoint: PUT /api/project/{projectId} or PATCH /api/project/{projectId}
Authentication: Required

Path Parameters
projectId: Integer ID of the project
Request Body (PUT - Full Update)
```JSON
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "url": "https://example.com/updated",
  "githubUrl": "https://github.com/user/updated",
  "color": "#00FF00",
  "customFields": {
    "priority": "low",
    "status": "completed"
  }
}
```

====

Delete Project
Delete a project (must belong to authenticated user). All tasks associated with the project will be automatically unassigned (cascade behavior).

Endpoint: DELETE /api/project/{projectId}
Authentication: Required

Path Parameters
projectId: Integer ID of the project
Response (200 OK)
```JSON
{
  "result": "success",
  "data": {
    "message": "Project deleted successfully",
    "deletedProject": {
      "id": 5,
      "name": "Website Redesign"
    }
  }
}
```

====

Get Project Tasks
Retrieve all tasks associated with a specific project.

Endpoint: GET /api/project/{projectId}/tasks
Authentication: Required

Path Parameters
projectId: Integer ID of the project
Query Parameters
limit (optional): Number of tasks to return (default: 100, max: 100)
offset (optional): Number of tasks to skip (default: 0)
Example Request
GET /api/project/5/tasks?limit=20&offset=0


Response (200 OK)
```JSON
{
  "result": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Design homepage",
      "description": "Create new homepage design",
      "date": "2025-09-28",
      "order": 1,
      "completed": false,
      "projectId": 5,
      "parentId": null,
      "createdAt": "2025-09-28T08:00:00+00:00",
      "updatedAt": "2025-09-28T08:00:00+00:00"
    },
    {
      "id": 2,
      "userId": 1,
      "title": "Implement responsive layout",
      "description": "Make design responsive",
      "date": "2025-09-29",
      "order": 1,
      "completed": false,
      "projectId": 5,
      "parentId": 1,
      "createdAt": "2025-09-28T08:00:00+00:00",
      "updatedAt": "2025-09-28T08:00:00+00:00"
    }
  ]
}
```

#### Tasks API modifications

List Tasks
Retrieve tasks for the authenticated user with optional filtering and pagination.

Endpoint: GET /api/tasks

```JSON
{
  "result": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "date": "2025-09-28",
      "order": 1,
      "completed": false,
      "projectId": 5,
      "parentId": null,
      "createdAt": "2025-09-28T08:00:00+00:00",
      "updatedAt": "2025-09-28T08:00:00+00:00"
    }
  ]
}
```

Note the "projectId" and "parentId" properties

====


