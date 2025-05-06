import type { Meta, StoryObj, StoryFn, StoryContext } from '@storybook/react'
import { fn } from '@storybook/test'
import React from 'react'
import type { SWRResponse } from 'swr' // Import SWRResponse
import { TaskList } from './TaskList'
import * as hooks from '@/lib/hooks'
import type { TasksQueryResult } from '@/lib/client' // Import TasksQueryResult

// Create a wrapper to mock the useTasks hook
// Define the mock function factory outside the component
const createMockUseTasks = (
  mockState: 'loading' | 'error' | 'empty' | 'withTasks'
) => {
  // Use the explicit return type from the original hook
  return (): SWRResponse<TasksQueryResult> => {
    switch (mockState) {
      case 'loading':
        return {
          data: undefined,
          error: undefined,
          isLoading: true,
          isValidating: false,
          mutate: fn() as any, // Use 'as any' for mutate mock if needed
        }
      case 'error':
        // NOTE: Still using 'as any' for the error object temporarily
        // If this still fails, the issue might be deeper in type compatibility
        // Workaround for persistent TS error: Use a plain object instead of Error instance
        const errorObj = { message: 'Failed to fetch tasks' }
        return {
          data: undefined,
          error: errorObj,
          isLoading: false,
          isValidating: false,
          mutate: fn() as any,
        }
      case 'empty':
        return {
          data: { tasks: [] },
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: fn() as any,
        }
      case 'withTasks':
      default:
        return {
          data: {
            tasks: [
              {
                id: 'task-1',
                title: 'Storybookの導入',
                description: 'コンポーネント開発環境としてStorybookを導入する',
                status: 'todo',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                dueAt: '2025-05-31T00:00:00.000Z',
              },
              {
                id: 'task-2',
                title: 'GraphQLリゾルバの実装',
                description: '各種APIエンドポイントのリゾルバを実装する',
                status: 'in_progress',
                createdAt: '2025-01-02T00:00:00.000Z',
                updatedAt: '2025-01-03T00:00:00.000Z',
                dueAt: '2025-04-15T00:00:00.000Z',
              },
              {
                id: 'task-3',
                title: 'データベース設計',
                description: 'スキーマとリレーションシップの設計を完了',
                status: 'done',
                createdAt: '2024-12-15T00:00:00.000Z',
                updatedAt: '2025-01-10T00:00:00.000Z',
                dueAt: '2025-01-15T00:00:00.000Z',
              },
              {
                id: 'task-4',
                title: '古い機能の削除',
                description: '不要になった機能とコードを整理',
                status: 'cancelled',
                createdAt: '2024-12-10T00:00:00.000Z',
                updatedAt: '2024-12-20T00:00:00.000Z',
                dueAt: null,
              },
            ],
          },
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: fn() as any,
        }
    }
  }
}

const meta = {
  title: 'Components/TaskList',
  component: TaskList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    searchTerm: { control: 'text' },
    parentId: { control: 'text' },
    labelId: { control: 'text' },
  },
  args: {
    onTaskClick: fn(),
  },
} satisfies Meta<typeof TaskList>

export default meta
type Story = StoryObj<typeof meta>

// Decorator to wrap the component with our mock provider
// Define the StoryWrapper component outside the decorator
const StoryWrapper = ({
  Story,
  context,
  mockState,
}: {
  Story: StoryFn
  context: StoryContext
  mockState: 'loading' | 'error' | 'empty' | 'withTasks'
}) => {
  // Store original hook ref inside the wrapper
  const originalUseTasksRef = React.useRef(hooks.useTasks)

  // Memoize the mock function creation
  const mockUseTasks = React.useMemo(
    () => createMockUseTasks(mockState),
    [mockState]
  )

  // Apply mock on mount, restore on unmount using useEffect
  React.useEffect(() => {
    // @ts-ignore - Override hook for Storybook
    hooks.useTasks = mockUseTasks
    return () => {
      // @ts-ignore - Restore original hook
      hooks.useTasks = originalUseTasksRef.current
    }
  }, [mockUseTasks]) // Dependency ensures effect runs if mock function changes

  // Render the original Story function with its args and context
  return Story(context.args, context)
}

// Decorator function returns an instance of the StoryWrapper component
const withMockedTasks = (Story: StoryFn, context: StoryContext) => {
  const mockState = context.parameters.mockState || 'withTasks'
  // Directly return the JSX element
  return <StoryWrapper Story={Story} context={context} mockState={mockState} />
}

export const WithTasks: Story = {
  parameters: {
    mockState: 'withTasks',
  },
  decorators: [withMockedTasks],
}

export const Loading: Story = {
  parameters: {
    mockState: 'loading',
  },
  decorators: [withMockedTasks],
}

export const Error: Story = {
  parameters: {
    mockState: 'error',
  },
  decorators: [withMockedTasks],
}

export const Empty: Story = {
  parameters: {
    mockState: 'empty',
  },
  decorators: [withMockedTasks],
}

export const WithSearchTerm: Story = {
  args: {
    searchTerm: '検索キーワード',
  },
  parameters: {
    mockState: 'withTasks',
  },
  decorators: [withMockedTasks],
}

export const WithParentId: Story = {
  args: {
    parentId: 'parent-task-1',
  },
  parameters: {
    mockState: 'withTasks',
  },
  decorators: [withMockedTasks],
}

export const WithLabelId: Story = {
  args: {
    labelId: 'label-1',
  },
  parameters: {
    mockState: 'withTasks',
  },
  decorators: [withMockedTasks],
}
