// @ts-nocheck
import { describe, expect, it, vi, beforeEach, test, assert } from 'vitest'
import { GraphQLContext, Task } from '../types'

// エラー回避のためにテスト用モック変数を用意
const mockGetAllTasks = vi.fn().mockImplementation(() => Promise.resolve([]));
const mockGetTaskById = vi.fn().mockImplementation(() => Promise.resolve(null));
const mockSearchTasks = vi.fn().mockImplementation(() => Promise.resolve([]));
const mockCreateTask = vi.fn().mockImplementation(() => Promise.resolve(true));
const mockUpdateTask = vi.fn().mockImplementation(() => Promise.resolve(null));
const mockDeleteTask = vi.fn().mockImplementation(() => Promise.resolve(null));
const mockGetParentTask = vi.fn().mockImplementation(() => Promise.resolve(null));
const mockGetChildTasks = vi.fn().mockImplementation(() => Promise.resolve([]));
const mockCreateTaskLink = vi.fn().mockImplementation(() => Promise.resolve(true));
const mockUpdateParent = vi.fn().mockImplementation(() => Promise.resolve(true));
const mockDeleteTaskLink = vi.fn().mockImplementation(() => Promise.resolve(true));
const mockGetLabelsByTaskId = vi.fn().mockImplementation(() => Promise.resolve([]));
const mockSelect = vi.fn().mockReturnThis();
const mockFrom = vi.fn().mockReturnThis();
const mockWhere = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();

// Vitestのモックシステムを使用するにはvi.mock呼び出しをモジュールのトップレベルに配置する必要があります
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
    }
  }
})

// DBスキーマのモック
vi.mock('@/db/schema', () => ({
  tasks: {},
  taskLabels: { taskId: 'taskId', labelId: 'labelId' },
  taskLinks: { parentId: 'parentId', childId: 'childId' },
  labels: {},
}))

// drizzle-ormのモック
vi.mock('drizzle-orm', () => ({
  and: vi.fn().mockImplementation((a, b) => ({ and: [a, b] })),
  eq: vi.fn().mockImplementation((col, val) => ({ eq: [col, val] })),
  like: vi.fn().mockImplementation((col, pattern) => ({ like: [col, pattern] })),
  or: vi.fn().mockImplementation((a, b) => ({ or: [a, b] })),
  asc: vi.fn().mockImplementation((col) => ({ asc: col })),
}))

// UUIDモック
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid'),
}))

// バリデーターのモック
vi.mock('../validators', () => ({
  validateCreateTaskInput: vi.fn().mockImplementation((input) => input),
  validateUpdateTaskInput: vi.fn().mockImplementation((input) => input),
  ValidationError: class ValidationError extends Error {},
}))

// モジュールのインポートはvi.mockの後に行う必要があります
import { taskResolvers } from './task'
import { db, taskQueries, taskLinkQueries, labelQueries } from '@/db'

describe('Task Resolvers', () => {
  const mockContext: GraphQLContext = {
    db,
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('Query', () => {
    describe('tasks', () => {
      it('returns all tasks when no args are provided', async () => {
        const mockTasks = [
          { id: 'task1', title: 'Task 1', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() },
          { id: 'task2', title: 'Task 2', state: 'done', createdAt: Date.now(), updatedAt: Date.now() },
        ]
        
        // モック実装を直接設定
        mockGetAllTasks.mockImplementation(() => Promise.resolve(mockTasks));
        
        const result = await taskResolvers.Query.tasks({}, {}, mockContext)
        
        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('task1')
        expect(result[0].status).toBe('todo') // stateがstatusに変換されていることを確認
        expect(result[1].id).toBe('task2')
        expect(result[1].status).toBe('done')
      })
      
      it('returns search results when search arg is provided', async () => {
        const mockTasks = [
          { id: 'task1', title: 'Sample Task', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() },
        ]
        
        mockSearchTasks.mockImplementation((searchTerm) => {
          expect(searchTerm).toBe('Sample');
          return Promise.resolve(mockTasks);
        });
        
        const result = await taskResolvers.Query.tasks({}, { search: 'Sample' }, mockContext)
        
        expect(mockSearchTasks).toHaveBeenCalledWith('Sample')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('task1')
      })
      
      it('returns child tasks when parentId arg is provided', async () => {
        const mockTasks = [
          { id: 'child1', title: 'Child Task 1', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() },
        ]
        
        taskLinkQueries.getChildTasks.mockResolvedValueOnce(mockTasks)
        
        const result = await taskResolvers.Query.tasks({}, { parentId: 'parent1' }, mockContext)
        
        expect(taskLinkQueries.getChildTasks).toHaveBeenCalledWith('parent1')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('child1')
      })
      
      it('returns tasks with specific label when labelId arg is provided', async () => {
        // labelIdによる検索のテスト
        db.select.mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValueOnce([{ taskId: 'task1' }]),
        })
        
        const mockTask = { id: 'task1', title: 'Task with Label', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() }
        taskQueries.getTaskById.mockResolvedValueOnce(mockTask)
        
        const result = await taskResolvers.Query.tasks({}, { labelId: 1 }, mockContext)
        
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('task1')
      })
    })
    
    describe('task', () => {
      it('returns a single task by id', async () => {
        const mockTask = { id: 'task1', title: 'Task 1', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() }
        
        taskQueries.getTaskById.mockResolvedValueOnce(mockTask)
        
        const result = await taskResolvers.Query.task({}, { id: 'task1' }, mockContext)
        
        expect(taskQueries.getTaskById).toHaveBeenCalledWith('task1')
        expect(result?.id).toBe('task1')
        expect(result?.status).toBe('todo')
      })
      
      it('returns null when task is not found', async () => {
        taskQueries.getTaskById.mockResolvedValueOnce(null)
        
        const result = await taskResolvers.Query.task({}, { id: 'nonexistent' }, mockContext)
        
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
        
        taskQueries.createTask.mockResolvedValueOnce(true)
        
        const result = await taskResolvers.Mutation.createTask({}, { input }, mockContext)
        
        expect(taskQueries.createTask).toHaveBeenCalledWith(expect.objectContaining({
          id: 'test-uuid',
          title: 'New Task',
          description: 'Task description',
          state: 'todo',
        }))
        
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
        
        taskQueries.createTask.mockResolvedValueOnce(true)
        taskLinkQueries.createTaskLink.mockResolvedValueOnce(true)
        
        await taskResolvers.Mutation.createTask({}, { input }, mockContext)
        
        expect(taskLinkQueries.createTaskLink).toHaveBeenCalledWith('parent1', 'test-uuid')
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
        
        taskQueries.updateTask.mockResolvedValueOnce(updatedTask)
        
        const result = await taskResolvers.Mutation.updateTask({}, { id, input }, mockContext)
        
        expect(taskQueries.updateTask).toHaveBeenCalledWith('task1', expect.objectContaining({
          title: 'Updated Task',
          state: 'in_progress',
        }))
        
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
        
        taskQueries.updateTask.mockResolvedValueOnce(updatedTask)
        taskLinkQueries.updateParent.mockResolvedValueOnce(true)
        
        await taskResolvers.Mutation.updateTask({}, { id, input }, mockContext)
        
        expect(taskLinkQueries.updateParent).toHaveBeenCalledWith('task1', 'newParent')
      })
      
      it('returns null when task is not found', async () => {
        taskQueries.updateTask.mockResolvedValueOnce(null)
        
        const result = await taskResolvers.Mutation.updateTask({}, { id: 'nonexistent', input: {} }, mockContext)
        
        expect(result).toBeNull()
      })
    })
    
    describe('deleteTask', () => {
      it('deletes a task and its relationships', async () => {
        taskQueries.deleteTask.mockResolvedValueOnce('task1')
        taskLinkQueries.deleteTaskLink.mockResolvedValueOnce(true)
        db.delete.mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(true),
        })
        
        const result = await taskResolvers.Mutation.deleteTask({}, { id: 'task1' }, mockContext)
        
        expect(taskQueries.deleteTask).toHaveBeenCalledWith('task1')
        expect(taskLinkQueries.deleteTaskLink).toHaveBeenCalledWith('task1')
        expect(result).toBe('task1')
      })
      
      it('returns null when task is not found', async () => {
        taskQueries.deleteTask.mockResolvedValueOnce(null)
        
        const result = await taskResolvers.Mutation.deleteTask({}, { id: 'nonexistent' }, mockContext)
        
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
        const mockParent = { id: 'parent1', title: 'Parent Task', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() }
        
        taskLinkQueries.getParentTask.mockResolvedValueOnce(mockParent)
        
        const result = await taskResolvers.Task.parent(mockTask, {}, mockContext)
        
        expect(taskLinkQueries.getParentTask).toHaveBeenCalledWith('task1')
        expect(result?.id).toBe('parent1')
        expect(result?.status).toBe('todo')
      })
      
      it('returns null when parent task is not found', async () => {
        taskLinkQueries.getParentTask.mockResolvedValueOnce(null)
        
        const result = await taskResolvers.Task.parent(mockTask, {}, mockContext)
        
        expect(result).toBeNull()
      })
    })
    
    describe('children', () => {
      it('returns child tasks when available', async () => {
        const mockChildren = [
          { id: 'child1', title: 'Child Task 1', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() },
          { id: 'child2', title: 'Child Task 2', state: 'in_progress', createdAt: Date.now(), updatedAt: Date.now() },
        ]
        
        taskLinkQueries.getChildTasks.mockResolvedValueOnce(mockChildren)
        
        const result = await taskResolvers.Task.children(mockTask, {}, mockContext)
        
        expect(taskLinkQueries.getChildTasks).toHaveBeenCalledWith('task1')
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
        
        labelQueries.getLabelsByTaskId.mockResolvedValueOnce(mockLabels)
        
        const result = await taskResolvers.Task.labels(mockTask, {}, mockContext)
        
        expect(labelQueries.getLabelsByTaskId).toHaveBeenCalledWith('task1')
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
        const result = await taskResolvers.Task.comments(mockTask, {}, mockContext)
        
        expect(result).toEqual([])
      })
    })
  })
})