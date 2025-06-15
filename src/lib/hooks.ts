'use client'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import {
  graphqlClient,
  mutations,
  queries,
  TaskQueryResult,
  TasksQueryResult,
} from '@/lib/client'

// GraphQLのフェッチャー関数
const graphqlFetcher = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  return graphqlClient.request<T>(query, variables)
}

// タスク一覧取得フック
export function useTasks(
  params?: { search?: string; parentId?: string; labelId?: string },
  config?: SWRConfiguration
): SWRResponse<TasksQueryResult> {
  const { search, parentId, labelId } = params || {}

  return useSWR(
    [queries.TASKS_QUERY, { search, parentId, labelId }],
    ([query, variables]) => graphqlFetcher<TasksQueryResult>(query, variables),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      ...config,
    }
  )
}

// 単一タスク取得フック
export function useTask(
  id: string | null,
  config?: SWRConfiguration
): SWRResponse<TaskQueryResult> {
  return useSWR(
    id ? [queries.TASK_QUERY, { id }] : null,
    ([query, variables]) => graphqlFetcher<TaskQueryResult>(query, variables),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      ...config,
    }
  )
}

// データミューテーション用のユーティリティ
export const taskMutations = {
  // タスク作成
  createTask: async (input: {
    title: string
    description?: string
    status?: string
    parentId?: string
    dueAt?: string
  }) => {
    return graphqlClient.request(mutations.CREATE_TASK_MUTATION, { input })
  },

  // タスク更新
  updateTask: async (
    id: string,
    input: {
      title?: string
      description?: string
      status?: string
      parentId?: string
      dueAt?: string
    }
  ) => {
    return graphqlClient.request(mutations.UPDATE_TASK_MUTATION, { id, input })
  },

  // タスク削除
  deleteTask: async (id: string) => {
    return graphqlClient.request(mutations.DELETE_TASK_MUTATION, { id })
  },
}
