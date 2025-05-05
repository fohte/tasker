import { GraphQLContext, Task, CreateTaskInput, UpdateTaskInput } from '../types'
import { tasks, taskLabels, taskLinks, labels } from '@/db/schema'
import { db, taskQueries, taskLinkQueries, labelQueries } from '@/db'
import { and, eq, like, or, SQL, asc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { validateCreateTaskInput, validateUpdateTaskInput, ValidationError } from '../validators'

// 簡易的なタスクデータ変換関数（実際の実装ではDB型からGraphQL型への変換処理を追加）
const mapDbTaskToGraphQLTask = (dbTask: any): Task => {
  return {
    ...dbTask,
    status: dbTask.state, // stateフィールドをstatusに変換
    createdAt: dbTask.createdAt ? new Date(dbTask.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: dbTask.updatedAt ? new Date(dbTask.updatedAt).toISOString() : new Date().toISOString(),
    dueAt: dbTask.dueAt ? new Date(dbTask.dueAt).toISOString() : null,
  }
}

export const taskResolvers = {
  Query: {
    tasks: async (_: any, args: { search?: string, parentId?: string, labelId?: number }, ctx: GraphQLContext) => {
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
        
        const taskIds = tasksWithLabel.map(item => item.taskId);
        const tasksData = await Promise.all(
          taskIds.map(id => taskQueries.getTaskById(id))
        );
        
        return tasksData.filter(Boolean).map(mapDbTaskToGraphQLTask);
      }
      
      return [];
    },
    
    task: async (_: any, args: { id: string }, ctx: GraphQLContext) => {
      const task = await taskQueries.getTaskById(args.id);
      return task ? mapDbTaskToGraphQLTask(task) : null;
    }
  },
  
  Mutation: {
    createTask: async (_: any, args: { input: CreateTaskInput }, ctx: GraphQLContext) => {
      const { title, description, status, parentId, dueAt } = args.input
      
      const newTask = {
        id: uuidv4(),
        title,
        description: description || null,
        state: status || 'todo',
        dueAt: dueAt ? new Date(dueAt).getTime() : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        closedAt: null
      }
      
      // タスクをDBに挿入
      await taskQueries.createTask(newTask)
      
      // 親子関係の処理
      if (parentId) {
        await taskLinkQueries.createTaskLink(parentId, newTask.id)
      }
      
      return mapDbTaskToGraphQLTask(newTask)
    },
    
    updateTask: async (_: any, args: { id: string, input: UpdateTaskInput }, ctx: GraphQLContext) => {
      const { id } = args
      const { title, description, status, parentId, dueAt } = args.input
      
      // 更新用データの作成
      const updates: any = {
        updatedAt: Date.now()
      }
      
      if (title !== undefined) updates.title = title
      if (description !== undefined) updates.description = description
      if (status !== undefined) updates.state = status
      if (dueAt !== undefined) updates.dueAt = dueAt ? new Date(dueAt).getTime() : null
      
      // タスク更新
      const updatedTask = await taskQueries.updateTask(id, updates)
      
      // 親子関係の更新処理
      if (parentId !== undefined) {
        await taskLinkQueries.updateParent(id, parentId)
      }
      
      return updatedTask ? mapDbTaskToGraphQLTask(updatedTask) : null
    },
    
    deleteTask: async (_: any, args: { id: string }, ctx: GraphQLContext) => {
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
    parent: async (parent: Task, _: any, ctx: GraphQLContext) => {
      const parentTask = await taskLinkQueries.getParentTask(parent.id);
      return parentTask ? mapDbTaskToGraphQLTask(parentTask) : null;
    },
    
    // 子タスクの取得
    children: async (parent: Task, _: any, ctx: GraphQLContext) => {
      const childTasks = await taskLinkQueries.getChildTasks(parent.id);
      return childTasks.map(task => mapDbTaskToGraphQLTask(task));
    },
    
    // タスクに関連付けられたラベルの取得
    labels: async (parent: Task, _: any, ctx: GraphQLContext) => {
      const labels = await labelQueries.getLabelsByTaskId(parent.id);
      return labels;
    },
    
    // タスクに関連付けられたコメントの取得
    comments: async (parent: Task, _: any, ctx: GraphQLContext) => {
      // コメントテーブルがまだ実装されていないため、空の配列を返す
      return []
    }
  }
}