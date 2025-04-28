# TODO - Detailed Breakdown

## 1. Phase 1: Core Setup & Task List

### 1.1. Infrastructure & Project Setup
- [x] 1.1.1. Configure Cloudflare D1 database instance.
- [x] 1.1.2. Set up Drizzle ORM configuration (`drizzle.config.ts`, connection setup).
- [x] 1.1.3. Define initial database schema (`schema.ts`) for `tasks` table (id, title, description, status, created_at, updated_at).
- [x] 1.1.4. Run initial Drizzle migration to create the `tasks` table in D1.
- [ ] 1.1.5. Configure Cloudflare Access for authentication (basic setup).
- [ ] 1.1.6. Set up basic API structure (decide between Next.js API Routes or Cloudflare Workers for the backend logic).

### 1.2. Task List Feature (MVP)
- **1.2.1. Backend:**
  - [ ] 1.2.1.1. Implement GraphQL query resolver (`Query.tasks`) to fetch all tasks.
  - [ ] 1.2.1.2. Implement Drizzle query to select tasks.
- **1.2.2. Frontend:**
  - [ ] 1.2.2.1. Create Next.js page component (`app/page.tsx` or `app/tasks/page.tsx`) for the task list.
  - [ ] 1.2.2.2. Implement data fetching logic (e.g., using a GraphQL client) to execute `Query.tasks`.
  - [ ] 1.2.2.3. Create a basic Task Item component (`src/components/TaskItem.tsx`) to display individual task details (title, status).
  - [ ] 1.2.2.4. Use the Task Item component to render the list of tasks.
  - [ ] 1.2.2.5. Style the task list and items using Tailwind CSS and shadcn/ui components (e.g., `Card`).

### 1.3. Task Creation (Basic)
- **1.3.1. Backend:**
  - [ ] 1.3.1.1. Implement GraphQL mutation resolver (`Mutation.createTask`) to create a new task.
  - [ ] 1.3.1.2. Implement Drizzle query to insert a new task.
  - [ ] 1.3.1.3. Add basic input validation.
- **1.3.2. Frontend:**
  - [ ] 1.3.2.1. Add an input form (e.g., using `Input` and `Button` from shadcn/ui) to the task list page for adding new tasks.
  - [ ] 1.3.2.2. Implement form submission logic to execute `Mutation.createTask`.
  - [ ] 1.3.2.3. Update the task list UI after successful creation (e.g., re-fetch or optimistic update).

## 2. Phase 2: Task Details & Enhancements

### 2.1. Task Detail View
- **2.1.1. Backend:**
  - [ ] 2.1.1.1. Implement GraphQL query resolver (`Query.task`) to fetch a single task by ID.
  - [ ] 2.1.1.2. Implement GraphQL mutation resolver (`Mutation.updateTask`) to update a task.
  - [ ] 2.1.1.3. Implement GraphQL mutation resolver (`Mutation.deleteTask`) to delete a task.
- **2.1.2. Frontend:**
  - [ ] 2.1.2.1. Create dynamic route page (`app/tasks/[id]/page.tsx`) for task details.
  - [ ] 2.1.2.2. Fetch data for the specific task executing `Query.task`.
  - [ ] 2.1.2.3. Display detailed task information.
  - [ ] 2.1.2.4. Add functionality to update task details (e.g., mark as complete, edit title/description).
  - [ ] 2.1.2.5. Add functionality to delete a task.
  - [ ] 2.1.2.6. Add navigation/link from the task list items to their respective detail pages.

### 2.2. Task Search
- **2.2.1. Backend:**
  - [ ] 2.2.1.1. Enhance `Query.tasks` resolver to accept a `search` argument.
  - [ ] 2.2.1.2. Update Drizzle query to filter tasks based on the search term (e.g., search in title and description).
- **2.2.2. Frontend:**
  - [ ] 2.2.2.1. Add a search input field (`Input` component) to the task list page.
  - [ ] 2.2.2.2. Update data fetching logic to include the `search` argument when executing `Query.tasks`.
  - [ ] 2.2.2.3. Update the UI dynamically as the user types in the search field (consider debouncing).

## 3. Phase 3: Advanced Features

### 3.1. Labels
- **3.1.1. Backend:**
  - [ ] 3.1.1.1. Define `labels` table schema (id, name, color).
  - [ ] 3.1.1.2. Define `task_labels` join table schema (task_id, label_id).
  - [ ] 3.1.1.3. Run Drizzle migrations for new tables.
  - [ ] 3.1.1.4. Implement GraphQL resolvers for Label CRUD (`Query.labels`, `Query.label`, `Mutation.createLabel`, `Mutation.updateLabel`, `Mutation.deleteLabel`).
  - [ ] 3.1.1.5. Implement GraphQL mutations for Task-Label association (`Mutation.addTaskLabel`, `Mutation.removeTaskLabel`).
  - [ ] 3.1.1.6. Ensure `Query.tasks` and `Query.task` resolvers can include associated labels.
- **3.1.2. Frontend:**
  - [ ] 3.1.2.1. Create UI components for managing labels (creating, editing, deleting).
  - [ ] 3.1.2.2. Create UI components to display labels on task items and task detail page.
  - [ ] 3.1.2.3. Add functionality to add/remove labels from a task on the detail page.
  - [ ] 3.1.2.4. (Optional) Add filtering by label on the task list page.

### 3.2. Parent/Child Relationships
- **3.2.1. Backend:**
  - [ ] 3.2.1.1. Add `parent_id` (nullable foreign key to `tasks.id`) to the `tasks` table schema.
  - [ ] 3.2.1.2. Run Drizzle migration.
  - [ ] 3.2.1.3. Ensure `Mutation.createTask` and `Mutation.updateTask` resolvers handle setting the `parent_id`.
  - [ ] 3.2.1.4. Ensure `Query.tasks` and `Query.task` resolvers can potentially fetch related tasks (parent/children).
- **3.2.2. Frontend:**
  - [ ] 3.2.2.1. Update task detail page UI to display parent task (if any) and list child tasks.
  - [ ] 3.2.2.2. Add UI functionality to set/change the parent of a task.

### 3.3. Comments/Notes
- **3.3.1. Backend:**
  - [ ] 3.3.1.1. Define `comments` table schema (id, task_id, content, created_at).
  - [ ] 3.3.1.2. Run Drizzle migration.
  - [ ] 3.3.1.3. Implement GraphQL resolvers for Comment CRUD (`Query.comments`, `Mutation.createComment`, `Mutation.updateComment`, `Mutation.deleteComment`), associated with a task.
- **3.3.2. Frontend:**
  - [ ] 3.3.2.1. Add a comments section to the task detail page.
  - [ ] 3.3.2.2. Fetch and display comments for the task.
  - [ ] 3.3.2.3. Add a form to submit new comments.
  - [ ] 3.3.2.4. Display comments chronologically.

## 4. Phase 4: Polish & Optional Features

### 4.1. UX/UI Enhancements
- [ ] 4.1.1. Improve mobile responsiveness.
- [ ] 4.1.2. Implement optimistic updates for faster UI feedback.
- [ ] 4.1.3. Add loading states and error handling.
- [ ] 4.1.4. Refine styling to feel more like a native app.

### 4.2. (Optional) Schedule Management
- [ ] 4.2.1. Investigate Todoist API integration.
- [ ] 4.2.2. Design how schedule information would be displayed/managed if implemented natively.
- [ ] 4.2.3. Implement native scheduling features (if decided against integration).

## 5. Deployment & Maintenance
- [ ] 5.1. Configure Next.js deployment (e.g., to Cloudflare Pages).
- [ ] 5.2. Set up monitoring and logging.
- [ ] 5.3. Regular dependency updates.