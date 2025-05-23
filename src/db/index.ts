import { drizzle } from 'drizzle-orm/d1'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq, lt, ne, like, and } from 'drizzle-orm'
import { tasks, labels, taskLabels, taskLinks } from './schema'

// Cloudflare環境の型定義
interface Env {
  DB: D1Database
}

// Cloudflareの環境変数を拡張
declare global {
  // eslint-disable-next-line no-var
  var __env__: Partial<Env> | undefined
}

// Utility function to get the D1 binding safely
function getD1Binding(): D1Database {
  try {
    // For Pages Functions, use getRequestContext
    const context = getRequestContext()
    const env = context?.env as Env | undefined
    if (env?.DB) {
      return env.DB
    }
  } catch {
    // Ignore errors if not in a Pages Function context
  }

  // Fallback for local development or other environments
  // Ensure 'wrangler dev --local' provides the binding or use process.env
  // IMPORTANT: Replace 'DB' with your actual D1 binding name in wrangler.toml
  //            and ensure it's accessible in your dev environment.
  if (process.env.NODE_ENV === 'development' && globalThis.__env__?.DB) {
    // Accessing bindings provided by 'wrangler dev --local' via globalThis
    return globalThis.__env__.DB as D1Database
  }

  // If running outside of Cloudflare Pages/Workers context during build or locally without wrangler dev
  // you might need a different way to connect or mock the DB.
  // Throwing an error might be appropriate if DB access is critical here.
  console.warn("D1 binding 'DB' not found. Using placeholder.")
  // Return a placeholder or throw an error depending on requirements
  // This placeholder will likely cause runtime errors if used.
  return {
    prepare: () => ({ bind: () => ({ all: async () => ({ results: [] }) }) }),
    dump: async () => new ArrayBuffer(0),
    batch: async () => [],
    exec: async () => ({ count: 0, duration: 0 }),
  } as unknown as D1Database
}

export const db = drizzle(getD1Binding())

// Re-export schema items if needed elsewhere
export * from './schema'

// タスク関連のクエリ関数
export const taskQueries = {
  // 全タスクを取得
  getAllTasks: async () => {
    return await db.select().from(tasks)
  },

  // IDによるタスク取得
  getTaskById: async (id: string) => {
    return await db.select().from(tasks).where(eq(tasks.id, id)).get()
  },

  // タスク検索
  searchTasks: async (searchTerm: string) => {
    return await db
      .select()
      .from(tasks)
      .where(like(tasks.title, `%${searchTerm}%`))
  },

  // ステータスによるタスクフィルタリング
  getTasksByStatus: async (
    status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  ) => {
    return await db.select().from(tasks).where(eq(tasks.state, status))
  },

  // 期限切れのタスク取得
  getOverdueTasks: async () => {
    const now = new Date()
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          lt(tasks.dueAt, now),
          ne(tasks.state, 'done'),
          ne(tasks.state, 'cancelled')
        )
      )
  },

  // タスク作成
  createTask: async (taskData: typeof tasks.$inferInsert) => {
    await db.insert(tasks).values(taskData)
    return taskData
  },

  // タスク更新
  updateTask: async (
    id: string,
    updateData: Partial<typeof tasks.$inferInsert>
  ) => {
    await db.update(tasks).set(updateData).where(eq(tasks.id, id))
    return await db.select().from(tasks).where(eq(tasks.id, id)).get()
  },

  // タスク削除
  deleteTask: async (id: string) => {
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).get()
    if (!task) return null

    await db.delete(tasks).where(eq(tasks.id, id))
    return id
  },
}

// ラベル関連のクエリ関数
export const labelQueries = {
  // 全ラベルを取得
  getAllLabels: async () => {
    return await db.select().from(labels)
  },

  // IDによるラベル取得
  getLabelById: async (id: number) => {
    return await db.select().from(labels).where(eq(labels.id, id)).get()
  },

  // タスクに関連付けられたラベルを取得
  getLabelsByTaskId: async (taskId: string) => {
    const labelLinks = await db
      .select({ labelId: taskLabels.labelId })
      .from(taskLabels)
      .where(eq(taskLabels.taskId, taskId))

    if (!labelLinks.length) return []

    const labelIds = labelLinks.map((link) => link.labelId)
    const labelsData = await Promise.all(
      labelIds.map((id) =>
        db.select().from(labels).where(eq(labels.id, id)).get()
      )
    )

    return labelsData.filter(Boolean)
  },
}

// タスクリンク関連のクエリ関数
export const taskLinkQueries = {
  // 親タスクIDによる子タスク取得
  getChildTasks: async (parentId: string) => {
    const childLinks = await db
      .select({ childId: taskLinks.childId })
      .from(taskLinks)
      .where(
        and(eq(taskLinks.parentId, parentId), eq(taskLinks.relation, 'subtask'))
      )

    if (!childLinks.length) return []

    const childIds = childLinks.map((link: { childId: string }) => link.childId)
    const childTasks = await Promise.all(
      childIds.map((id) =>
        db.select().from(tasks).where(eq(tasks.id, id)).get()
      )
    )

    return childTasks.filter(Boolean)
  },

  // 子タスクIDによる親タスク取得
  getParentTask: async (childId: string) => {
    const parentLink = await db
      .select({ parentId: taskLinks.parentId })
      .from(taskLinks)
      .where(
        and(eq(taskLinks.childId, childId), eq(taskLinks.relation, 'subtask'))
      )
      .get()

    if (!parentLink) return null

    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parentLink.parentId))
      .get()
  },

  // タスクリンク作成（親子関係の作成）
  createTaskLink: async (
    parentId: string,
    childId: string,
    relation: string = 'subtask'
  ) => {
    await db.insert(taskLinks).values({
      parentId,
      childId,
      relation,
    })
  },

  // タスクリンク削除（親子関係の削除）
  deleteTaskLink: async (childId: string, relation: string = 'subtask') => {
    await db
      .delete(taskLinks)
      .where(
        and(eq(taskLinks.childId, childId), eq(taskLinks.relation, relation))
      )
  },

  // 親子関係の更新
  updateParent: async (childId: string, newParentId: string | null) => {
    // 既存の親子関係を削除
    await db
      .delete(taskLinks)
      .where(
        and(eq(taskLinks.childId, childId), eq(taskLinks.relation, 'subtask'))
      )

    // 新しい親が指定されていれば追加
    if (newParentId) {
      await db.insert(taskLinks).values({
        parentId: newParentId,
        childId,
        relation: 'subtask',
      })
    }
  },
}

// Note: Accessing environment variables or bindings directly at the top level
// can be problematic in edge environments. The getD1Binding function attempts
// to retrieve the binding dynamically when needed. Ensure your D1 binding
// is named 'DB' in your wrangler.toml or adjust the code accordingly.
