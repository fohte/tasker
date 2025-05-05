import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { TaskItem } from './TaskItem';

const meta = {
  title: 'Components/TaskItem',
  component: TaskItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: { 
      control: 'select', 
      options: ['todo', 'in_progress', 'done', 'cancelled'] 
    },
    compact: { control: 'boolean' },
  },
  args: { 
    onClick: fn(),
    onStatusChange: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof TaskItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = {
  args: {
    id: 'task-1',
    title: 'タスクの作成',
    description: 'Storybookのセットアップと導入',
    status: 'todo',
    dueAt: '2025-12-31T00:00:00.000Z',
  },
};

export const InProgress: Story = {
  args: {
    id: 'task-2',
    title: 'ドキュメントの更新',
    description: 'プロジェクトの仕様書を更新する',
    status: 'in_progress',
    dueAt: '2025-06-30T00:00:00.000Z',
  },
};

export const Done: Story = {
  args: {
    id: 'task-3',
    title: 'セットアップの完了',
    description: '初期設定とデータベースのセットアップ',
    status: 'done',
    dueAt: '2025-01-15T00:00:00.000Z',
  },
};

export const Cancelled: Story = {
  args: {
    id: 'task-4',
    title: '不要な機能',
    description: '優先度が低いため現在は実装しない',
    status: 'cancelled',
    dueAt: null,
  },
};

export const Compact: Story = {
  args: {
    id: 'task-5',
    title: 'コンパクト表示のタスク',
    description: 'コンパクトモードのテスト',
    status: 'todo',
    dueAt: '2025-10-01T00:00:00.000Z',
    compact: true,
  },
};

export const LongDescription: Story = {
  args: {
    id: 'task-6',
    title: '長い説明のタスク',
    description: 'これは非常に長い説明文です。説明が長すぎる場合、UI上で適切に表示されるかテストします。長いテキストは省略されて、「...」で表示される必要があります。これによりUIのレイアウトが崩れないようにします。',
    status: 'todo',
    dueAt: '2025-08-15T00:00:00.000Z',
  },
};

export const NoDescription: Story = {
  args: {
    id: 'task-7',
    title: '説明なしのタスク',
    description: null,
    status: 'todo',
    dueAt: '2025-05-20T00:00:00.000Z',
  },
};

export const NoDueDate: Story = {
  args: {
    id: 'task-8',
    title: '期限なしのタスク',
    description: '期限が設定されていないタスク',
    status: 'todo',
    dueAt: null,
  },
};