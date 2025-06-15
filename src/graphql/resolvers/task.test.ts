import { assert, beforeEach, describe, expect, it, vi } from 'vitest'

// モジュールのインポートはvi.mockの後に行う必要があります
import { taskResolvers } from '@/graphql/resolvers/task'
import { Task } from '@/graphql/types'

// vi.hoisted() を使用してモック変数をトップレベルで宣言
// これにより、モックのホイスティングの問題を解決
const mockGetAllTasks = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve([]))
)
const mockGetTaskById = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(null))
)
const mockSearchTasks = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve([]))
)
const mockCreateTask = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(true))
)
const mockUpdateTask = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(null))
)
const mockDeleteTask = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(null))
)
const mockGetParentTask = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(null))
)
const mockGetChildTasks = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve([]))
)
const mockCreateTaskLink = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(true))
)
const mockUpdateParent = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(true))
)
const mockDeleteTaskLink = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve(true))
)
const mockGetLabelsByTaskId = vi.hoisted(() =>
  vi.fn().mockImplementation(() => Promise.resolve([]))
)
const mockSelect = vi.hoisted(() => vi.fn().mockReturnThis())
const mockFrom = vi.hoisted(() => vi.fn().mockReturnThis())
const mockWhere = vi.hoisted(() => vi.fn().mockReturnThis())
const mockDelete = vi.hoisted(() => vi.fn().mockReturnThis())

// vi.mockを使用してDBモジュールをモック
vi.mock('@/db', () => {
  return {
    taskQueries: {
      getAllTasks: mockGetAllTasks,
      getTaskById: mockGetTaskById,
      searchTasks: mockSearchTasks,
      createTask: mockCreateTask,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
    },
    taskLinkQueries: {
      getParentTask: mockGetParentTask,
      getChildTasks: mockGetChildTasks,
      createTaskLink: mockCreateTaskLink,
      updateParent: mockUpdateParent,
      deleteTaskLink: mockDeleteTaskLink,
    },
    labelQueries: {
      getLabelsByTaskId: mockGetLabelsByTaskId,
    },
    db: {
      select: mockSelect,
      from: mockFrom,
      where: mockWhere,
      delete: mockDelete,
    },
  }
})

// DBスキーマのモック
vi.mock('@/db/schema', () => {
  return {
    tasks: {},
    taskLabels: { taskId: 'taskId', labelId: 'labelId' },
    taskLinks: { parentId: 'parentId', childId: 'childId' },
    labels: {},
  }
})

// drizzle-ormのモック
vi.mock('drizzle-orm', () => {
  return {
    and: vi.fn().mockImplementation((a, b) => ({ and: [a, b] })),
    eq: vi.fn().mockImplementation((col, val) => ({ eq: [col, val] })),
    like: vi
      .fn()
      .mockImplementation((col, pattern) => ({ like: [col, pattern] })),
    or: vi.fn().mockImplementation((a, b) => ({ or: [a, b] })),
    asc: vi.fn().mockImplementation((col) => ({ asc: col })),
  }
})

// UUIDモック
vi.mock('uuid', () => {
  return {
    v4: vi.fn().mockReturnValue('test-uuid'),
  }
})

// バリデーターのモック
vi.mock('@/graphql/validators', () => {
  return {
    validateCreateTaskInput: vi.fn().mockImplementation((input) => input),
    validateUpdateTaskInput: vi.fn().mockImplementation((input) => input),
    ValidationError: class ValidationError extends Error {},
  }
})

describe('Task Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Query', () => {
    describe('tasks', () => {
      it('returns all tasks when no args are provided', async () => {
        const mockTasks = [
          {
            id: 'task1',
            title: 'Task 1',
            state: 'todo',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'task2',
            title: 'Task 2',
            state: 'done',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]

        // モック実装を直接設定
        mockGetAllTasks.mockImplementation(() => Promise.resolve(mockTasks))

        const result = await taskResolvers.Query.tasks({}, {})

        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('task1')
        expect(result[0].status).toBe('todo') // stateがstatusに変換されていることを確認
        expect(result[1].id).toBe('task2')
        expect(result[1].status).toBe('done')
      })

      it('returns search results when search arg is provided', async () => {
        const mockTasks = [
          {
            id: 'task1',
            title: 'Sample Task',
            state: 'todo',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]

        mockSearchTasks.mockImplementation((searchTerm) => {
          expect(searchTerm).toBe('Sample')
          return Promise.resolve(mockTasks)
        })

        const result = await taskResolvers.Query.tasks({}, { search: 'Sample' })

        expect(mockSearchTasks).toHaveBeenCalledWith('Sample')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('task1')
      })

      it('returns child tasks when parentId arg is provided', async () => {
        const mockTasks = [
          {
            id: 'child1',
            title: 'Child Task 1',
            state: 'todo',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]

        mockGetChildTasks.mockResolvedValueOnce(mockTasks)

        const result = await taskResolvers.Query.tasks(
          {},
          { parentId: 'parent1' }
        )

        expect(mockGetChildTasks).toHaveBeenCalledWith('parent1')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('child1')
      })

      it('returns tasks with specific label when labelId arg is provided', async () => {
        // labelIdによる検索のテスト
        mockSelect.mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValueOnce([{ taskId: 'task1' }]),
        })

        const mockTask = {
          id: 'task1',
          title: 'Task with Label',
          state: 'todo',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        mockGetTaskById.mockResolvedValueOnce(mockTask)

        const result = await taskResolvers.Query.tasks({}, { labelId: 1 })

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('task1')
      })
    })

    describe('task', () => {
      it('returns a single task by id', async () => {
        const mockTask = {
          id: 'task1',
          title: 'Task 1',
          state: 'todo',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        mockGetTaskById.mockResolvedValueOnce(mockTask)

        const result = await taskResolvers.Query.task({}, { id: 'task1' })

        expect(mockGetTaskById).toHaveBeenCalledWith('task1')
        expect(result?.id).toBe('task1')
        expect(result?.status).toBe('todo')
      })

      it('returns null when task is not found', async () => {
        mockGetTaskById.mockResolvedValueOnce(null)

        const result = await taskResolvers.Query.task({}, { id: 'nonexistent' })

        expect(result).toBeNull()
      })
    })
  })

  describe('Mutation', () => {
    describe('createTask', () => {
      it('creates a new task with provided input', async () => {
        const input = {
          title: 'New Task',
          description: 'Task description',
          status: 'todo',
          dueAt: '2025-12-31T00:00:00.000Z',
        }

        mockCreateTask.mockResolvedValueOnce(true)

        const result = await taskResolvers.Mutation.createTask({}, { input })

        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-uuid',
            title: 'New Task',
            description: 'Task description',
            state: 'todo',
          })
        )

        expect(result.id).toBe('test-uuid')
        expect(result.title).toBe('New Task')
        expect(result.status).toBe('todo')
      })

      it('creates task links when parentId is provided', async () => {
        const input = {
          title: 'Child Task',
          description: 'Child task description',
          status: 'todo',
          parentId: 'parent1',
        }

        mockCreateTask.mockResolvedValueOnce(true)
        mockCreateTaskLink.mockResolvedValueOnce(true)

        await taskResolvers.Mutation.createTask({}, { input })

        expect(mockCreateTaskLink).toHaveBeenCalledWith('parent1', 'test-uuid')
      })
    })

    describe('updateTask', () => {
      it('updates an existing task with provided input', async () => {
        const id = 'task1'
        const input = {
          title: 'Updated Task',
          status: 'in_progress',
        }

        const updatedTask = {
          id: 'task1',
          title: 'Updated Task',
          state: 'in_progress',
          updatedAt: Date.now(),
        }

        mockUpdateTask.mockResolvedValueOnce(updatedTask)

        const result = await taskResolvers.Mutation.updateTask(
          {},
          { id, input }
        )

        expect(mockUpdateTask).toHaveBeenCalledWith(
          'task1',
          expect.objectContaining({
            title: 'Updated Task',
            state: 'in_progress',
          })
        )

        expect(result?.id).toBe('task1')
        expect(result?.title).toBe('Updated Task')
        expect(result?.status).toBe('in_progress')
      })

      it('updates parent-child relationship when parentId is provided', async () => {
        const id = 'task1'
        const input = {
          parentId: 'newParent',
        }

        const updatedTask = {
          id: 'task1',
          title: 'Task 1',
          state: 'todo',
          updatedAt: Date.now(),
        }

        mockUpdateTask.mockResolvedValueOnce(updatedTask)
        mockUpdateParent.mockResolvedValueOnce(true)

        await taskResolvers.Mutation.updateTask({}, { id, input })

        expect(mockUpdateParent).toHaveBeenCalledWith('task1', 'newParent')
      })

      it('returns null when task is not found', async () => {
        mockUpdateTask.mockResolvedValueOnce(null)

        const result = await taskResolvers.Mutation.updateTask(
          {},
          { id: 'nonexistent', input: {} }
        )

        expect(result).toBeNull()
      })
    })

    describe('deleteTask', () => {
      it('deletes a task and its relationships', async () => {
        mockDeleteTask.mockResolvedValueOnce('task1')
        mockDeleteTaskLink.mockResolvedValueOnce(true)
        mockDelete.mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(true),
        })

        const result = await taskResolvers.Mutation.deleteTask(
          {},
          { id: 'task1' }
        )

        expect(mockDeleteTask).toHaveBeenCalledWith('task1')
        expect(mockDeleteTaskLink).toHaveBeenCalledWith('task1')
        expect(result).toBe('task1')
      })

      it('returns null when task is not found', async () => {
        mockDeleteTask.mockResolvedValueOnce(null)

        const result = await taskResolvers.Mutation.deleteTask(
          {},
          { id: 'nonexistent' }
        )

        expect(result).toBeNull()
      })
    })
  })

  describe('Task Field Resolvers', () => {
    const mockTask: Task = {
      id: 'task1',
      title: 'Task 1',
      description: 'Description',
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueAt: null,
    }

    describe('parent', () => {
      it('returns parent task when available', async () => {
        const mockParent = {
          id: 'parent1',
          title: 'Parent Task',
          state: 'todo',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        mockGetParentTask.mockResolvedValueOnce(mockParent)

        const result = await taskResolvers.Task.parent(mockTask)

        expect(mockGetParentTask).toHaveBeenCalledWith('task1')
        expect(result?.id).toBe('parent1')
        expect(result?.status).toBe('todo')
      })

      it('returns null when parent task is not found', async () => {
        mockGetParentTask.mockResolvedValueOnce(null)

        const result = await taskResolvers.Task.parent(mockTask)

        expect(result).toBeNull()
      })
    })

    describe('children', () => {
      it('returns child tasks when available', async () => {
        const mockChildren = [
          {
            id: 'child1',
            title: 'Child Task 1',
            state: 'todo',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'child2',
            title: 'Child Task 2',
            state: 'in_progress',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]

        mockGetChildTasks.mockResolvedValueOnce(mockChildren)

        const result = await taskResolvers.Task.children(mockTask)

        expect(mockGetChildTasks).toHaveBeenCalledWith('task1')
        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('child1')
        expect(result[1].id).toBe('child2')
      })
    })

    describe('labels', () => {
      it('returns labels when available', async () => {
        const mockLabels = [
          { id: 'label1', name: 'Important', color: 'red' },
          { id: 'label2', name: 'Work', color: 'blue' },
        ]

        mockGetLabelsByTaskId.mockResolvedValueOnce(mockLabels)

        const result = await taskResolvers.Task.labels(mockTask)

        expect(mockGetLabelsByTaskId).toHaveBeenCalledWith('task1')
        expect(result).toHaveLength(2)
        if (result[0] && result[1]) {
          expect(result[0].id).toBe('label1')
          expect(result[1].id).toBe('label2')
        } else {
          // エラーを発生させる代わりに非同期テストを失敗させる
          assert(result[0] !== undefined, 'Expected label[0] to be defined')
          assert(result[1] !== undefined, 'Expected label[1] to be defined')
        }
      })
    })

    describe('comments', () => {
      it('returns empty array for comments (not implemented yet)', async () => {
        const result = await taskResolvers.Task.comments()

        expect(result).toEqual([])
      })
    })
  })
})
