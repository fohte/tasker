import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }), // Use autoIncrement for D1
  title: text('title').notNull(),
  description: text('description'),
  // Define status options, e.g., 'todo', 'in_progress', 'done'
  status: text('status', { enum: ['todo', 'in_progress', 'done'] }).notNull().default('todo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Example of how you might define types for inference
export type Task = typeof tasks.$inferSelect; // return type when queried
export type NewTask = typeof tasks.$inferInsert; // insert type