import { GraphQLContext, Comment, CreateCommentInput, UpdateCommentInput } from '../types'
import { tasks } from '@/db/schema'
import { eq } from 'drizzle-orm'

// コメントテーブルはまだ作成されていないため、仮のリゾルバーを実装

export const commentResolvers = {
  Query: {
    comments: async (_: any, args: { taskId: string }, ctx: GraphQLContext) => {
      // コメントテーブルがまだ存在しないため、空の配列を返す
      return []
    }
  },
  
  Mutation: {
    createComment: async (_: any, args: { input: CreateCommentInput }, ctx: GraphQLContext) => {
      const { taskId, content } = args.input
      
      // タスクの存在確認
      const task = await ctx.db.select().from(tasks).where(eq(tasks.id, taskId)).get()
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`)
      }
      
      // コメントテーブルがまだないため、仮の実装
      const newComment = {
        id: Math.floor(Math.random() * 1000), // 仮のID
        content,
        createdAt: new Date().toISOString(),
        task: {
          ...task,
          status: task.state,
          createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : new Date().toISOString(),
        }
      }
      
      return newComment
    },
    
    updateComment: async (_: any, args: { id: number, input: UpdateCommentInput }, ctx: GraphQLContext) => {
      // コメントテーブルがまだないため、null を返す
      return null
    },
    
    deleteComment: async (_: any, args: { id: number }, ctx: GraphQLContext) => {
      // コメントテーブルがまだないため、null を返す
      return null
    }
  },
  
  Comment: {
    task: async (parent: Comment, _: any, ctx: GraphQLContext) => {
      if (parent.task) return parent.task
      
      // タスクの取得
      const task = await ctx.db.select().from(tasks).where(eq(tasks.id, parent.task.id)).get()
      
      if (!task) return null
      
      return {
        ...task,
        status: task.state,
        createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : new Date().toISOString(),
      }
    }
  }
}