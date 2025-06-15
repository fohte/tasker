import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Placeholder table for foreign key reference
export const labels = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

// --- Main Tables ---

// Todoist-like Task table (Project concept removed)
export const tasks = sqliteTable('tasks', {
  // Use text for UUIDs in SQLite. Generation should be handled by the application.
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  state: text('state', { enum: ['todo', 'in_progress', 'done', 'cancelled'] })
    .notNull()
    .default('todo'),
  dueAt: integer('due_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
})

// Link table for Task Labels (Many-to-Many)
export const taskLabels = sqliteTable('task_labels', {
  id: integer('id').primaryKey({ autoIncrement: true }), // Added primary key
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  labelId: integer('label_id')
    .notNull()
    .references(() => labels.id, { onDelete: 'cascade' }),
})

// GitHub Issue like extension (1:1 to tasks, simplified)
export const issues = sqliteTable('issues', {
  // Added human-readable sequential ID as primary key
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  body: text('body'),
})

// Task Links (Many-to-Many for subtasks, blocking, etc.)
export const taskLinks = sqliteTable('task_links', {
  id: integer('id').primaryKey({ autoIncrement: true }), // Added primary key
  parentId: text('parent_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  childId: text('child_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  // Relation type, e.g., 'subtask', 'blocks', 'duplicates', 'related'
  // Consider text enum: { enum: ['subtask', 'blocks', 'duplicates', 'related'] } if needed
  relation: text('relation').notNull(),
})

// --- Type Exports ---

export type Task = typeof tasks.$inferSelect // return type when queried
export type NewTask = typeof tasks.$inferInsert // insert type

export type Issue = typeof issues.$inferSelect
export type NewIssue = typeof issues.$inferInsert

export type TaskLink = typeof taskLinks.$inferSelect
export type NewTaskLink = typeof taskLinks.$inferInsert
