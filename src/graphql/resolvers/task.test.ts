import { describe, expect, it, vi, beforeEach } from 'vitest'
import { taskResolvers } from './task'
import { GraphQLContext, Task } from '../types'
import { db } from '@/db'

// DB関連のモジュールのモック
vi.mock('@/db', () => {
  const mockTaskQueries = {
    getAllTasks: vi.fn(),
    getTaskById: vi.fn(),
    searchTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }
  
  const mockTaskLinkQueries = {
    getParentTask: vi.fn(),
    getChildTasks: vi.fn(),
    createTaskLink: vi.fn(),
    updateParent: vi.fn(),
    deleteTaskLink: vi.fn(),
  }
  
  const mockLabelQueries = {
    getLabelsByTaskId: vi.fn(),
  }
  
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }
  
  return {
    taskQueries: mockTaskQueries,
    taskLinkQueries: mockTaskLinkQueries,
    labelQueries: mockLabelQueries,
    db: mockDb,
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
  and: vi.fn(),
  eq: vi.fn(),
  like: vi.fn(),
  or: vi.fn(),
  asc: vi.fn(),
}))

// UUIDモック
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid'),
}))

// バリデーターのモック
vi.mock('../validators', () => ({
  validateCreateTaskInput: vi.fn(),
  validateUpdateTaskInput: vi.fn(),
  ValidationError: class ValidationError extends Error {},
}))

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
        
        vi.mocked(require('@/db').taskQueries.getAllTasks).mockResolvedValueOnce(mockTasks)
        
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
        
        vi.mocked(require('@/db').taskQueries.searchTasks).mockResolvedValueOnce(mockTasks)
        
        const result = await taskResolvers.Query.tasks({}, { search: 'Sample' }, mockContext)
        
        expect(require('@/db').taskQueries.searchTasks).toHaveBeenCalledWith('Sample')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('task1')
      })
      
      it('returns child tasks when parentId arg is provided', async () => {
        const mockTasks = [
          { id: 'child1', title: 'Child Task 1', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() },
        ]
        
        vi.mocked(require('@/db').taskLinkQueries.getChildTasks).mockResolvedValueOnce(mockTasks)
        
        const result = await taskResolvers.Query.tasks({}, { parentId: 'parent1' }, mockContext)
        
        expect(require('@/db').taskLinkQueries.getChildTasks).toHaveBeenCalledWith('parent1')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('child1')
      })
      
      it('returns tasks with specific label when labelId arg is provided', async () => {
        // labelIdによる検索のテスト
        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValueOnce([{ taskId: 'task1' }]),
        } as any)
        
        const mockTask = { id: 'task1', title: 'Task with Label', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() }
        vi.mocked(require('@/db').taskQueries.getTaskById).mockResolvedValueOnce(mockTask)
        
        const result = await taskResolvers.Query.tasks({}, { labelId: 1 }, mockContext)
        
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('task1')
      })
    })
    
    describe('task', () => {
      it('returns a single task by id', async () => {
        const mockTask = { id: 'task1', title: 'Task 1', state: 'todo', createdAt: Date.now(), updatedAt: Date.now() }
        
        vi.mocked(require('@/db').taskQueries.getTaskById).mockResolvedValueOnce(mockTask)
        
        const result = await taskResolvers.Query.task({}, { id: 'task1' }, mockContext)
        
        expect(require('@/db').taskQueries.getTaskById).toHaveBeenCalledWith('task1')
        expect(result?.id).toBe('task1')
        expect(result?.status).toBe('todo')
      })
      
      it('returns null when task is not found', async () => {
        vi.mocked(require('@/db').taskQueries.getTaskById).mockResolvedValueOnce(null)
        
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
        
        vi.mocked(require('@/db').taskQueries.createTask).mockResolvedValueOnce(true)
        
        const result = await taskResolvers.Mutation.createTask({}, { input }, mockContext)
        
        expect(require('@/db').taskQueries.createTask).toHaveBeenCalledWith(expect.objectContaining({
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
        
        vi.mocked(require('@/db').taskQueries.createTask).mockResolvedValueOnce(true)
        vi.mocked(require('@/db').taskLinkQueries.createTaskLink).mockResolvedValueOnce(true)
        
        await taskResolvers.Mutation.createTask({}, { input }, mockContext)
        
        expect(require('@/db').taskLinkQueries.createTaskLink).toHaveBeenCalledWith('parent1', 'test-uuid')
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
        
        vi.mocked(require('@/db').taskQueries.updateTask).mockResolvedValueOnce(updatedTask)
        
        const result = await taskResolvers.Mutation.updateTask({}, { id, input }, mockContext)
        
        expect(require('@/db').taskQueries.updateTask).toHaveBeenCalledWith('task1', expect.objectContaining({
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
        
        vi.mocked(require('@/db').taskQueries.updateTask).mockResolvedValueOnce(updatedTask)
        vi.mocked(require('@/db').taskLinkQueries.updateParent).mockResolvedValueOnce(true)
        
        await taskResolvers.Mutation.updateTask({}, { id, input }, mockContext)
        
        expect(require('@/db').taskLinkQueries.updateParent).toHaveBeenCalledWith('task1', 'newParent')
      })
      
      it('returns null when task is not found', async () => {
        vi.mocked(require('@/db').taskQueries.updateTask).mockResolvedValueOnce(null)
        
        const result = await taskResolvers.Mutation.updateTask({}, { id: 'nonexistent', input: {} }, mockContext)
        
        expect(result).toBeNull()
      })
    })
    
    describe('deleteTask', () => {
      it('deletes a task and its relationships', async () => {
        vi.mocked(require('@/db').taskQueries.deleteTask).mockResolvedValueOnce('task1')
        vi.mocked(require('@/db').taskLinkQueries.deleteTaskLink).mockResolvedValueOnce(true)
        vi.mocked(db.delete).mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(true),
        } as any)
        
        const result = await taskResolvers.Mutation.deleteTask({}, { id: 'task1' }, mockContext)
        
        expect(require('@/db').taskQueries.deleteTask).toHaveBeenCalledWith('task1')
        expect(require('@/db').taskLinkQueries.deleteTaskLink).toHaveBeenCalledWith('task1')
        expect(result).toBe('task1')
      })
      
      it('returns null when task is not found', async () => {
        vi.mocked(require('@/db').taskQueries.deleteTask).mockResolvedValueOnce(null)
        
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
        
        vi.mocked(require('@/db').taskLinkQueries.getParentTask).mockResolvedValueOnce(mockParent)
        
        const result = await taskResolvers.Task.parent(mockTask, {}, mockContext)
        
        expect(require('@/db').taskLinkQueries.getParentTask).toHaveBeenCalledWith('task1')
        expect(result?.id).toBe('parent1')
        expect(result?.status).toBe('todo')
      })
      
      it('returns null when parent task is not found', async () => {
        vi.mocked(require('@/db').taskLinkQueries.getParentTask).mockResolvedValueOnce(null)
        
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
        
        vi.mocked(require('@/db').taskLinkQueries.getChildTasks).mockResolvedValueOnce(mockChildren)
        
        const result = await taskResolvers.Task.children(mockTask, {}, mockContext)
        
        expect(require('@/db').taskLinkQueries.getChildTasks).toHaveBeenCalledWith('task1')
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
        
        vi.mocked(require('@/db').labelQueries.getLabelsByTaskId).mockResolvedValueOnce(mockLabels)
        
        const result = await taskResolvers.Task.labels(mockTask, {}, mockContext)
        
        expect(require('@/db').labelQueries.getLabelsByTaskId).toHaveBeenCalledWith('task1')
        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('label1')
        expect(result[1].id).toBe('label2')
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