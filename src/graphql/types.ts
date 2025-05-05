import { Task as DbTask } from '@/db/schema'

// GraphQLのリゾルバーで使用する型定義
export interface Task extends Omit<DbTask, 'state' | 'createdAt' | 'updatedAt' | 'dueAt' | 'closedAt'> {
  status: string
  description?: string | null
  createdAt: string
  updatedAt: string
  dueAt?: string | null
  parent?: Task | null
  children?: Task[]
  labels?: Label[]
  comments?: Comment[]
}

export interface Label {
  id: number
  name: string
  color?: string | null
  tasks?: Task[]
}

export interface Comment {
  id: number
  content: string
  createdAt: string
  task: Task
}

// Input型
export interface CreateTaskInput {
  title: string
  description?: string | null
  status?: string
  parentId?: string | null
  dueAt?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  status?: string
  parentId?: string | null
  dueAt?: string | null
}

export interface CreateLabelInput {
  name: string
  color?: string | null
}

export interface UpdateLabelInput {
  name?: string
  color?: string | null
}

export interface CreateCommentInput {
  taskId: string
  content: string
}

export interface UpdateCommentInput {
  content: string
}

// コンテキスト型
export interface GraphQLContext {
  db: any // drizzle-ormのDB型に置き換え
}