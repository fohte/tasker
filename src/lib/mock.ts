// テスト用のモックデータを定義するファイル

import { Task } from '@/graphql/types'

// モックタスクデータ
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'テストタスク1',
    description: 'これはテスト用のタスク1です',
    status: 'todo',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    dueAt: '2025-12-31T00:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'テストタスク2',
    description: 'これはテスト用のタスク2です',
    status: 'in_progress',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    dueAt: null,
  },
  {
    id: 'task-3',
    title: 'テストタスク3',
    description: 'これはテスト用のタスク3です',
    status: 'done',
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
    dueAt: '2025-06-30T00:00:00.000Z',
  },
]

// モックラベルデータ
export const mockLabels = [
  { id: 'label-1', name: '重要', color: 'red' },
  { id: 'label-2', name: '仕事', color: 'blue' },
  { id: 'label-3', name: '個人', color: 'green' },
]

// GraphQLクエリ結果のモック
export const mockTasksQueryResult = {
  tasks: mockTasks,
}

export const mockTaskQueryResult = {
  task: mockTasks[0],
}

// GraphQLミューテーション結果のモック
export const mockCreateTaskResult = {
  createTask: {
    id: 'new-task',
    title: '新しいタスク',
    status: 'todo',
  },
}

export const mockUpdateTaskResult = {
  updateTask: {
    id: 'task-1',
    title: '更新されたタスク',
    status: 'in_progress',
  },
}

export const mockDeleteTaskResult = {
  deleteTask: 'task-1',
}
