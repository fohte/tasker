# GraphQL Schema

```graphql
# Represents a Task item
type Task {
  id: ID!
  title: String!
  description: String
  # Consider using an Enum like: PENDING, IN_PROGRESS, DONE
  status: String!
  # Consider ISO 8601 String or Timestamp scalar
  createdAt: String!
  updatedAt: String!
  # Relationships
  parent: Task
  children: [Task!]
  labels: [Label!]
  comments: [Comment!]
}

# Represents a Label for categorizing tasks
type Label {
  id: ID!
  name: String!
  color: String
  # Tasks associated with this label
  tasks: [Task!]
}

# Represents a Comment on a task
type Comment {
  id: ID!
  content: String!
  # Consider ISO 8601 String or Timestamp scalar
  createdAt: String!
  # Task this comment belongs to
  task: Task!
}

# --- Input Types for Mutations ---

input CreateTaskInput {
  title: String!
  description: String
  status: String # Default status can be handled in resolver
  parentId: ID
}

input UpdateTaskInput {
  title: String
  description: String
  status: String
  parentId: ID # Allow changing/clearing parent
}

input CreateLabelInput {
  name: String!
  color: String
}

input UpdateLabelInput {
  name: String
  color: String
}

input CreateCommentInput {
  taskId: ID!
  content: String!
}

input UpdateCommentInput {
  content: String!
}

# --- Root Query Type ---

type Query {
  # Fetch multiple tasks with optional filters
  tasks(search: String, parentId: ID, labelId: ID): [Task!]!
  # Fetch a single task by its ID
  task(id: ID!): Task

  # Fetch all labels
  labels: [Label!]!
  # Fetch a single label by its ID
  label(id: ID!): Label

  # Fetch comments for a specific task
  comments(taskId: ID!): [Comment!]!
}

# --- Root Mutation Type ---

type Mutation {
  # Task Mutations
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task # Returns updated task or null if not found
  deleteTask(id: ID!): ID # Returns ID of deleted task or null

  # Label Mutations
  createLabel(input: CreateLabelInput!): Label!
  updateLabel(id: ID!, input: UpdateLabelInput!): Label
  deleteLabel(id: ID!): ID

  # Task <-> Label Association
  addTaskLabel(taskId: ID!, labelId: ID!): Task # Returns updated task
  removeTaskLabel(taskId: ID!, labelId: ID!): Task # Returns updated task

  # Comment Mutations
  createComment(input: CreateCommentInput!): Comment!
  updateComment(id: ID!, input: UpdateCommentInput!): Comment
  deleteComment(id: ID!): ID
}
```