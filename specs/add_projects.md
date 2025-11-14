# Projects feature

## Brief

The objective is to implement project-based task management. 
This feature should introduce a dedicated page (or an optional floating modal window) where users can view a list of projects alongside their associated tasks.
The projects interface must support full CRUD (Create, Read, Update, Delete) operations for projects. Upon selecting a project, users should be able to manage its tasks.
Each project should support a hierarchical structure of tasks, allowing tasks to have nested sub-tasks. This hierarchy should be flexible and similar to structures such as story, epic, task, and sub-task, but without fixed task type definitions.

## Feature description

### The top bar

The top navigation bar must include two links: "Tasks" and "Projects." 
- The "Tasks" link routes to the existing calendar-like interface where users manage their weekly tasks.
- The "Projects" link routes to the new projects page for project-based task management, allowing users to access and organize projects and their associated tasks.

The link corresponding to the currently active page must be visually indicated as active and must not be clickable. For example, when the user is on the "Projects" page, the "Projects" link should appear active and be disabled or otherwise unclickable.

### The projects management page 

**Layout**

The page layout consists of three main sections: 
1. The list of projects (projects sidebar).
2. The tasks associated with the selected project (task hierarchy panel).
3. The details and properties of the currently selected entity, which can be either a project or a task (details/properties panel).

**projects sidebar**

The projects sidebar must support full CRUD functionality—allowing users to Create, Read, Update, and Delete projects.

When a new project is created, it should be added to the end of the project list in the sidebar and become the selected project automatically.

When a project is selected, its details should appear in the details panel. These details include:
- The project title (entered previously during creation)
- A description field implemented as a textarea:
    - The textarea should show at least 5 lines by default
    - It should automatically grow taller as the user enters more lines or pastes text exceeding 5 lines
- "Save" and "Delete" buttons

When the "Delete" button is clicked, deletion must require a custom confirmation dialog to help prevent accidental removal.



