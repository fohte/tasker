import { GraphQLContext, Label, CreateLabelInput, UpdateLabelInput } from '../types'
import { labels, taskLabels, tasks } from '@/db/schema'
import { eq } from 'drizzle-orm'

// ラベルデータの変換
const mapDbLabelToGraphQLLabel = (dbLabel: any): Label => {
  return {
    ...dbLabel
  }
}

export const labelResolvers = {
  Query: {
    labels: async (_: any, args: {}, ctx: GraphQLContext) => {
      const allLabels = await ctx.db.select().from(labels)
      return allLabels.map(mapDbLabelToGraphQLLabel)
    },
    
    label: async (_: any, args: { id: number }, ctx: GraphQLContext) => {
      const label = await ctx.db.select().from(labels).where(eq(labels.id, args.id)).get()
      return label ? mapDbLabelToGraphQLLabel(label) : null
    }
  },
  
  Mutation: {
    createLabel: async (_: any, args: { input: CreateLabelInput }, ctx: GraphQLContext) => {
      const { name, color } = args.input
      
      const newLabel = {
        name,
        color: color || null,
        createdAt: Date.now()
      }
      
      // ラベルをDBに挿入
      const result = await ctx.db.insert(labels).values(newLabel)
      
      // 生成されたIDを取得してラベルオブジェクトに追加
      const id = result.lastInsertId
      
      return mapDbLabelToGraphQLLabel({ ...newLabel, id })
    },
    
    updateLabel: async (_: any, args: { id: number, input: UpdateLabelInput }, ctx: GraphQLContext) => {
      const { id } = args
      const { name, color } = args.input
      
      // 更新用データの作成
      const updates: any = {}
      
      if (name !== undefined) updates.name = name
      if (color !== undefined) updates.color = color
      
      // ラベル更新
      await ctx.db.update(labels).set(updates).where(eq(labels.id, id))
      
      // 更新後のラベルを取得
      const updatedLabel = await ctx.db.select().from(labels).where(eq(labels.id, id)).get()
      
      return updatedLabel ? mapDbLabelToGraphQLLabel(updatedLabel) : null
    },
    
    deleteLabel: async (_: any, args: { id: number }, ctx: GraphQLContext) => {
      // ラベルの存在確認
      const labelExists = await ctx.db.select().from(labels).where(eq(labels.id, args.id)).get()
      
      if (!labelExists) return null
      
      // ラベル削除
      await ctx.db.delete(labels).where(eq(labels.id, args.id))
      
      return args.id.toString()
    },
    
    addTaskLabel: async (_: any, args: { taskId: string, labelId: number }, ctx: GraphQLContext) => {
      const { taskId, labelId } = args
      
      // タスクとラベルの存在確認
      const task = await ctx.db.select().from(tasks).where(eq(tasks.id, taskId)).get()
      const label = await ctx.db.select().from(labels).where(eq(labels.id, labelId)).get()
      
      if (!task || !label) return null
      
      // 既存の関連があるか確認
      const existingLink = await ctx.db
        .select()
        .from(taskLabels)
        .where(eq(taskLabels.taskId, taskId))
        .where(eq(taskLabels.labelId, labelId))
        .get()
      
      // 存在しない場合のみ追加
      if (!existingLink) {
        await ctx.db.insert(taskLabels).values({
          taskId,
          labelId
        })
      }
      
      // 更新後のタスクを返す
      return {
        ...task,
        status: task.state
      }
    },
    
    removeTaskLabel: async (_: any, args: { taskId: string, labelId: number }, ctx: GraphQLContext) => {
      const { taskId, labelId } = args
      
      // タスクの存在確認
      const task = await ctx.db.select().from(tasks).where(eq(tasks.id, taskId)).get()
      
      if (!task) return null
      
      // 関連削除
      await ctx.db
        .delete(taskLabels)
        .where(eq(taskLabels.taskId, taskId))
        .where(eq(taskLabels.labelId, labelId))
      
      // 更新後のタスクを返す
      return {
        ...task,
        status: task.state
      }
    }
  },
  
  Label: {
    tasks: async (parent: Label, _: any, ctx: GraphQLContext) => {
      // ラベルに関連するタスクを取得
      const taskRelations = await ctx.db
        .select()
        .from(taskLabels)
        .where(eq(taskLabels.labelId, parent.id))
      
      if (!taskRelations.length) return []
      
      const taskIds = taskRelations.map(rel => rel.taskId)
      
      // 複数のIDを一度に取得するための適切なクエリが必要
      // 簡易的な実装として個別取得をマップで行っている
      const tasksData = await Promise.all(
        taskIds.map(id => ctx.db.select().from(tasks).where(eq(tasks.id, id)).get())
      )
      
      // nullを除外して返す
      return tasksData
        .filter(Boolean)
        .map(task => ({
          ...task,
          status: task.state,
          createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : new Date().toISOString(),
          dueAt: task.dueAt ? new Date(task.dueAt).toISOString() : null,
        }))
    }
  }
}