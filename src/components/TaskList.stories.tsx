import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import React from 'react';
import { TaskList } from './TaskList';
import * as hooks from '@/lib/hooks';

// Create a wrapper to mock the useTasks hook
const MockedTasksProvider = ({
  children,
  mockState,
}: {
  children: React.ReactNode;
  mockState: 'loading' | 'error' | 'empty' | 'withTasks';
}) => {
  // Override the useTasks implementation for Storybook
  const originalUseTasks = hooks.useTasks;
  
  // @ts-ignore - for Storybook mock purposes
  hooks.useTasks = () => {
    switch (mockState) {
      case 'loading':
        return {
          data: undefined,
          error: undefined,
          isLoading: true,
          isValidating: false,
          mutate: fn(),
        };
      case 'error':
        return {
          data: undefined,
          error: new Error('Failed to fetch tasks'),
          isLoading: false,
          isValidating: false,
          mutate: fn(),
        };
      case 'empty':
        return {
          data: { tasks: [] },
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: fn(),
        };
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
              }
            ]
          },
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: fn(),
        };
    }
  };

  // Restore the original implementation when the component unmounts
  React.useEffect(() => {
    return () => {
      // @ts-ignore - for Storybook mock purposes
      hooks.useTasks = originalUseTasks;
    };
  }, [originalUseTasks]);

  return <>{children}</>;
};

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
    mockState: {
      control: 'select',
      options: ['loading', 'error', 'empty', 'withTasks'],
      description: 'The mock state to display',
      defaultValue: 'withTasks',
    },
  },
  args: {
    onTaskClick: fn(),
  },
} satisfies Meta<typeof TaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Decorator to wrap the component with our mock provider
const withMockedTasks = (Story, { args }) => {
  return (
    <MockedTasksProvider mockState={args.mockState || 'withTasks'}>
      <Story />
    </MockedTasksProvider>
  );
};

export const WithTasks: Story = {
  args: {
    mockState: 'withTasks',
  },
  decorators: [withMockedTasks],
};

export const Loading: Story = {
  args: {
    mockState: 'loading',
  },
  decorators: [withMockedTasks],
};

export const Error: Story = {
  args: {
    mockState: 'error',
  },
  decorators: [withMockedTasks],
};

export const Empty: Story = {
  args: {
    mockState: 'empty',
  },
  decorators: [withMockedTasks],
};

export const WithSearchTerm: Story = {
  args: {
    mockState: 'withTasks',
    searchTerm: '検索キーワード',
  },
  decorators: [withMockedTasks],
};

export const WithParentId: Story = {
  args: {
    mockState: 'withTasks',
    parentId: 'parent-task-1',
  },
  decorators: [withMockedTasks],
};

export const WithLabelId: Story = {
  args: {
    mockState: 'withTasks',
    labelId: 'label-1',
  },
  decorators: [withMockedTasks],
};