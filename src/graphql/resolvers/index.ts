import { commentResolvers } from '@/graphql/resolvers/comment'
import { labelResolvers } from '@/graphql/resolvers/label'
import { taskResolvers } from '@/graphql/resolvers/task'

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
