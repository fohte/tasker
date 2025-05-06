import { taskResolvers } from './task'
import { labelResolvers } from './label'
import { commentResolvers } from './comment'

// すべてのリゾルバーをマージ
export const resolvers = {
  Query: {
    ...taskResolvers.Query,
    ...labelResolvers.Query,
    ...commentResolvers.Query,
  },
  Mutation: {
    ...taskResolvers.Mutation,
    ...labelResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
  // 型リゾルバー
  Task: taskResolvers.Task,
  Label: labelResolvers.Label,
  Comment: commentResolvers.Comment,
}
