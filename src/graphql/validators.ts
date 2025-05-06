import { CreateTaskInput, UpdateTaskInput } from './types'

// バリデーションエラー型
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// タスク作成入力のバリデーション
export const validateCreateTaskInput = (
  input: CreateTaskInput
): void | never => {
  // タイトルは必須かつ空でないこと
  if (!input.title || input.title.trim() === '') {
    throw new ValidationError('Task title is required and cannot be empty')
  }

  // タイトルの長さ制限
  if (input.title.length > 100) {
    throw new ValidationError('Task title cannot exceed 100 characters')
  }

  // 説明フィールドの長さ制限（存在する場合）
  if (input.description && input.description.length > 1000) {
    throw new ValidationError('Task description cannot exceed 1000 characters')
  }

  // ステータス値の検証（存在する場合）
  if (
    input.status &&
    !['todo', 'in_progress', 'done', 'cancelled'].includes(input.status)
  ) {
    throw new ValidationError(
      'Invalid task status. Must be one of: todo, in_progress, done, cancelled'
    )
  }

  // 期限日のフォーマット検証（存在する場合）
  if (input.dueAt) {
    try {
      const date = new Date(input.dueAt)
      if (isNaN(date.getTime())) {
        throw new Error()
      }
    } catch {
      throw new ValidationError(
        'Invalid due date format. Please use ISO 8601 format (e.g., "2023-05-01T12:00:00Z")'
      )
    }
  }
}

// タスク更新入力のバリデーション
export const validateUpdateTaskInput = (
  input: UpdateTaskInput
): void | never => {
  // 少なくとも1つのフィールドが指定されていること
  if (Object.keys(input).length === 0) {
    throw new ValidationError('At least one field must be provided for update')
  }

  // タイトルの長さ制限（存在する場合）
  if (input.title !== undefined) {
    if (input.title.trim() === '') {
      throw new ValidationError('Task title cannot be empty')
    }
    if (input.title.length > 100) {
      throw new ValidationError('Task title cannot exceed 100 characters')
    }
  }

  // 説明フィールドの長さ制限（存在する場合）
  if (
    input.description !== undefined &&
    input.description &&
    input.description.length > 1000
  ) {
    throw new ValidationError('Task description cannot exceed 1000 characters')
  }

  // ステータス値の検証（存在する場合）
  if (
    input.status !== undefined &&
    !['todo', 'in_progress', 'done', 'cancelled'].includes(input.status)
  ) {
    throw new ValidationError(
      'Invalid task status. Must be one of: todo, in_progress, done, cancelled'
    )
  }

  // 期限日のフォーマット検証（存在する場合）
  if (input.dueAt !== undefined && input.dueAt) {
    try {
      const date = new Date(input.dueAt)
      if (isNaN(date.getTime())) {
        throw new Error()
      }
    } catch {
      throw new ValidationError(
        'Invalid due date format. Please use ISO 8601 format (e.g., "2023-05-01T12:00:00Z")'
      )
    }
  }
}
