import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskItem, getStatusColor, formatDate, TaskItemProps } from './TaskItem'
import { taskMutations } from '@/lib/hooks'

// タスクミューテーションのモック
vi.mock('@/lib/hooks', () => ({
  taskMutations: {
    updateTask: vi.fn().mockResolvedValue({}),
    deleteTask: vi.fn().mockResolvedValue({}),
  }
}))

describe('TaskItem Component', () => {
  const mockProps: TaskItemProps = {
    id: 'task-1',
    title: 'テストタスク',
    description: 'これはテスト用のタスクです',
    status: 'todo',
    dueAt: '2025-12-31T00:00:00.000Z',
    onClick: vi.fn(),
    onStatusChange: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn().mockImplementation(() => true)
  })

  it('renders correctly with all props', () => {
    render(<TaskItem {...mockProps} />)
    
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
    expect(screen.getByText('これはテスト用のタスクです')).toBeInTheDocument()
    // "未着手" テキストは複数箇所に存在するため、特定の要素で検索
    expect(screen.getByRole('heading', { level: 3, name: 'テストタスク' })).toBeInTheDocument()
    expect(screen.getAllByText('未着手').length).toBeGreaterThan(0)
    expect(screen.getByText('期限: 2025年12月31日')).toBeInTheDocument()
  })

  it('renders in compact mode correctly', () => {
    render(<TaskItem {...mockProps} compact={true} />)
    
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
    expect(screen.getByText('2025年12月31日')).toBeInTheDocument()
    expect(screen.queryByText('これはテスト用のタスクです')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<TaskItem {...mockProps} />)
    
    const taskElement = screen.getByText('テストタスク').closest('div')
    fireEvent.click(taskElement!)
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('updates task status when status button is clicked', async () => {
    render(<TaskItem {...mockProps} />)
    
    const inProgressButton = screen.getByText('進行中')
    fireEvent.click(inProgressButton)
    
    // waitFor を使用して非同期更新を待つ
    await vi.waitFor(() => {
      expect(taskMutations.updateTask).toHaveBeenCalledWith('task-1', { status: 'in_progress' })
    })
    
    // 非同期処理が完了するまで待機
    await vi.waitFor(() => {
      expect(mockProps.onStatusChange).toHaveBeenCalledWith('task-1', 'in_progress')
    })
  })

  it('deletes task when delete button is clicked and confirmed', async () => {
    render(<TaskItem {...mockProps} />)
    
    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalled()
    
    // 非同期処理が完了するまで待機
    await vi.waitFor(() => {
      expect(taskMutations.deleteTask).toHaveBeenCalledWith('task-1')
    })
    
    await vi.waitFor(() => {
      expect(mockProps.onDelete).toHaveBeenCalledWith('task-1')
    })
  })

  it('does not delete task when delete is not confirmed', () => {
    window.confirm = vi.fn().mockImplementation(() => false)
    render(<TaskItem {...mockProps} />)
    
    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(taskMutations.deleteTask).not.toHaveBeenCalled()
    expect(mockProps.onDelete).not.toHaveBeenCalled()
  })

  it('shows error message when task status update fails', async () => {
    vi.mocked(taskMutations.updateTask).mockRejectedValueOnce(new Error('Update failed'))
    
    render(<TaskItem {...mockProps} />)
    
    const inProgressButton = screen.getByText('進行中')
    fireEvent.click(inProgressButton)
    
    // エラーメッセージが表示されるまで待機
    const errorMessage = await screen.findByText('ステータスの更新に失敗しました')
    expect(errorMessage).toBeInTheDocument()
  })

  it('shows error message when task delete fails', async () => {
    vi.mocked(taskMutations.deleteTask).mockRejectedValueOnce(new Error('Delete failed'))
    
    render(<TaskItem {...mockProps} />)
    
    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)
    
    // エラーメッセージが表示されるまで待機
    const errorMessage = await screen.findByText('タスクの削除に失敗しました')
    expect(errorMessage).toBeInTheDocument()
  })
})

describe('getStatusColor utility', () => {
  it('returns correct color for todo status', () => {
    expect(getStatusColor('todo')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns correct color for in_progress status', () => {
    expect(getStatusColor('in_progress')).toBe('bg-blue-100 text-blue-800')
  })

  it('returns correct color for done status', () => {
    expect(getStatusColor('done')).toBe('bg-green-100 text-green-800')
  })

  it('returns correct color for cancelled status', () => {
    expect(getStatusColor('cancelled')).toBe('bg-red-100 text-red-800')
  })

  it('returns default color for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800')
  })
})

describe('formatDate utility', () => {
  it('formats date correctly', () => {
    const date = '2025-12-31T00:00:00.000Z'
    expect(formatDate(date)).toBe('2025年12月31日')
  })

  it('returns "期限なし" when date is null', () => {
    expect(formatDate(null)).toBe('期限なし')
  })

  it('returns "期限なし" when date is undefined', () => {
    expect(formatDate(undefined)).toBe('期限なし')
  })
})