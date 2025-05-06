import { GraphQLClient } from 'graphql-request'

// GraphQLクライアントのインスタンスを作成
// API URLは環境に応じて変更
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/graphql'

export const graphqlClient = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
})

// クエリとミューテーションの型を定義するためのユーティリティ
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}

// GraphQLのクエリやミューテーションの結果型
export interface TasksQueryResult {
  tasks: Array<{
    id: string
    title: string
    description?: string | null
    status: string
    createdAt: string
    updatedAt: string
    dueAt?: string | null
  }>
}

export interface TaskQueryResult {
  task: {
    id: string
    title: string
    description?: string | null
    status: string
    createdAt: string
    updatedAt: string
    dueAt?: string | null
    parent?: {
      id: string
      title: string
    } | null
    children?: Array<{
      id: string
      title: string
      status: string
    }> | null
    labels?: Array<{
      id: string
      name: string
      color?: string | null
    }> | null
  } | null
}

export interface CreateTaskMutationResult {
  createTask: {
    id: string
    title: string
    status: string
  }
}

export interface UpdateTaskMutationResult {
  updateTask: {
    id: string
    title: string
    status: string
  } | null
}

export interface DeleteTaskMutationResult {
  deleteTask: string | null
}

// GraphQLのクエリ
export const queries = {
  // タスク一覧を取得するクエリ
  TASKS_QUERY: `
    query GetTasks($search: String, $parentId: ID, $labelId: ID) {
      tasks(search: $search, parentId: $parentId, labelId: $labelId) {
        id
        title
        description
        status
        createdAt
        updatedAt
        dueAt
      }
    }
  `,

  // 特定のタスクを取得するクエリ
  TASK_QUERY: `
    query GetTask($id: ID!) {
      task(id: $id) {
        id
        title
        description
        status
        createdAt
        updatedAt
        dueAt
        parent {
          id
          title
        }
        children {
          id
          title
          status
        }
        labels {
          id
          name
          color
        }
      }
    }
  `,

  // ラベル一覧を取得するクエリ
  LABELS_QUERY: `
    query GetLabels {
      labels {
        id
        name
        color
      }
    }
  `,
}

// GraphQLのミューテーション
export const mutations = {
  // タスクを作成するミューテーション
  CREATE_TASK_MUTATION: `
    mutation CreateTask($input: CreateTaskInput!) {
      createTask(input: $input) {
        id
        title
        status
      }
    }
  `,

  // タスクを更新するミューテーション
  UPDATE_TASK_MUTATION: `
    mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
      updateTask(id: $id, input: $input) {
        id
        title
        status
      }
    }
  `,

  // タスクを削除するミューテーション
  DELETE_TASK_MUTATION: `
    mutation DeleteTask($id: ID!) {
      deleteTask(id: $id)
    }
  `,
}
