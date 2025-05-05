import { GraphQLContext, Task, CreateTaskInput, UpdateTaskInput } from '../types'
import { tasks, taskLabels, taskLinks, labels } from '@/db/schema'
import { db, taskQueries, taskLinkQueries, labelQueries } from '@/db'
import { and, eq, like, or, SQL, asc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { validateCreateTaskInput, validateUpdateTaskInput, ValidationError } from '../validators'

import { Task as DbTaskType } from '@/db/schema'

// DB層のタスク型（数値型のtimestamp）
type DbTaskData = {
  id: string;
  title: string;
  description: string | null;
  state: 'todo' | 'done' | 'in_progress' | 'cancelled';
  dueAt: number | null | Date;
  createdAt: number | Date;
  updatedAt: number | Date;
  closedAt: number | null | Date;
}

// すべてのDB型（DbTaskTypeとその他のAPIレスポンス）をGraphQL型に変換するマッピング関数
const mapDbTaskToGraphQLTask = (dbTask: any): Task => {
  // 入力されたオブジェクトがundefinedやnullでないことを確認
  if (!dbTask) {
    throw new Error('Cannot map undefined or null task object');
  }
  return {
    ...dbTask,
    status: dbTask.state, // stateフィールドをstatusに変換
    description: dbTask.description || null,
    createdAt: dbTask.createdAt ? new Date(dbTask.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: dbTask.updatedAt ? new Date(dbTask.updatedAt).toISOString() : new Date().toISOString(),
    dueAt: dbTask.dueAt ? new Date(dbTask.dueAt).toISOString() : null,
  }
}

export const taskResolvers = {
  Query: {
    tasks: async (_: unknown, args: { search?: string, parentId?: string, labelId?: number }, ctx: GraphQLContext) => {
      // 検索条件がない場合は全件取得
      if (!args.search && !args.parentId && !args.labelId) {
        const allTasks = await taskQueries.getAllTasks();
        return allTasks.map(mapDbTaskToGraphQLTask);
      }
      
      // 検索条件による取得
      if (args.search) {
        const searchResults = await taskQueries.searchTasks(args.search);
        return searchResults.map(mapDbTaskToGraphQLTask);
      }
      
      // 親タスクによるフィルタリング
      if (args.parentId) {
        const childTasks = await taskLinkQueries.getChildTasks(args.parentId);
        return childTasks.map(mapDbTaskToGraphQLTask);
      }
      
      // ラベルによるフィルタリング
      if (args.labelId) {
        // 既存のコードを使用（専用クエリ関数がまだないため）
        const tasksWithLabel = await ctx.db
          .select({ taskId: taskLabels.taskId })
          .from(taskLabels)
          .where(eq(taskLabels.labelId, args.labelId));
        
        if (tasksWithLabel.length === 0) {
          return [];
        }
        
        const taskIds = tasksWithLabel.map((item: { taskId: string }) => item.taskId);
        const tasksData = await Promise.all(
          taskIds.map(id => taskQueries.getTaskById(id))
        );
        
        return tasksData.filter(Boolean).map(mapDbTaskToGraphQLTask);
      }
      
      return [];
    },
    
    task: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const task = await taskQueries.getTaskById(args.id);
      return task ? mapDbTaskToGraphQLTask(task) : null;
    }
  },
  
  Mutation: {
    createTask: async (_: unknown, args: { input: CreateTaskInput }, ctx: GraphQLContext) => {
      const { title, description, status, parentId, dueAt } = args.input
      
      // 型安全性を確保するための検証
      const validStates = ['todo', 'done', 'in_progress', 'cancelled'] as const
      const taskState = status
        ? (validStates.includes(status as any) 
            ? status as 'todo' | 'done' | 'in_progress' | 'cancelled'
            : 'todo')
        : 'todo'
      
      const newTask: DbTaskData = {
        id: uuidv4(),
        title,
        description: description || null,
        state: taskState,
        dueAt: dueAt ? new Date(dueAt).getTime() : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        closedAt: null
      }
      
      // タスクをDBに挿入
      // タスクオブジェクトをDB型に変換して保存
      await taskQueries.createTask({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        state: newTask.state,
        dueAt: newTask.dueAt ? new Date(newTask.dueAt) : null,
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt),
        closedAt: newTask.closedAt ? new Date(newTask.closedAt) : null
      })
      
      // 親子関係の処理
      if (parentId) {
        await taskLinkQueries.createTaskLink(parentId, newTask.id)
      }
      
      return mapDbTaskToGraphQLTask(newTask)
    },
    
    updateTask: async (_: unknown, args: { id: string, input: UpdateTaskInput }, ctx: GraphQLContext) => {
      const { id } = args
      const { title, description, status, parentId, dueAt } = args.input
      
      // 更新用データの作成
      const updates: Partial<DbTaskData> = {
        updatedAt: Date.now()
      }
      
      if (title !== undefined) updates.title = title
      if (description !== undefined) updates.description = description
      if (status !== undefined) {
        // 型安全性を確保するための検証
        const validStates = ['todo', 'done', 'in_progress', 'cancelled'] as const
        const validState = validStates.includes(status as any) 
          ? status as 'todo' | 'done' | 'in_progress' | 'cancelled'
          : 'todo'
        updates.state = validState
      }
      if (dueAt !== undefined) updates.dueAt = dueAt ? new Date(dueAt).getTime() : null
      
      // タスク更新用のデータ変換 - updatesをDB型に変換する
      const dbUpdates: Partial<typeof tasks.$inferInsert> = {};
      
      if (updates.updatedAt !== undefined) 
        dbUpdates.updatedAt = new Date(updates.updatedAt);
      if (updates.title !== undefined) 
        dbUpdates.title = updates.title;
      if (updates.description !== undefined) 
        dbUpdates.description = updates.description;
      if (updates.state !== undefined) 
        dbUpdates.state = updates.state;
      if (updates.dueAt !== undefined) 
        dbUpdates.dueAt = updates.dueAt ? new Date(updates.dueAt) : null;
      
      // タスク更新
      const updatedTask = await taskQueries.updateTask(id, dbUpdates)
      
      // 親子関係の更新処理
      if (parentId !== undefined) {
        await taskLinkQueries.updateParent(id, parentId)
      }
      
      return updatedTask ? mapDbTaskToGraphQLTask(updatedTask) : null
    },
    
    deleteTask: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      // タスク削除とIDの取得
      const deletedId = await taskQueries.deleteTask(args.id)
      
      if (!deletedId) return null
      
      // 関連する親子関係も削除
      // 子タスクとしての関係
      await taskLinkQueries.deleteTaskLink(args.id)
      
      // 親タスクとしての関係（子タスクがある場合）
      await db
        .delete(taskLinks)
        .where(eq(taskLinks.parentId, args.id))
      
      return deletedId
    }
  },
  
  Task: {
    // 親タスクの取得
    parent: async (parent: Task, _: unknown, ctx: GraphQLContext) => {
      const parentTask = await taskLinkQueries.getParentTask(parent.id);
      return parentTask ? mapDbTaskToGraphQLTask(parentTask) : null;
    },
    
    // 子タスクの取得
    children: async (parent: Task, _: unknown, ctx: GraphQLContext) => {
      const childTasks = await taskLinkQueries.getChildTasks(parent.id);
      return childTasks.map(task => mapDbTaskToGraphQLTask(task));
    },
    
    // タスクに関連付けられたラベルの取得
    labels: async (parent: Task, _: unknown, ctx: GraphQLContext) => {
      const labels = await labelQueries.getLabelsByTaskId(parent.id);
      return labels;
    },
    
    // タスクに関連付けられたコメントの取得
    comments: async (parent: Task, _: unknown, ctx: GraphQLContext) => {
      // コメントテーブルがまだ実装されていないため、空の配列を返す
      return []
    }
  }
}