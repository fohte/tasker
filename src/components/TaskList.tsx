'use client';

import { cn } from '@/lib/utils';
import { useTasks } from '@/lib/hooks';

// タスクの状態によって表示色を変更するユーティリティ関数
const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 日付をフォーマットするユーティリティ関数
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '期限なし';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// タスクアイテムコンポーネント
interface TaskItemProps {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueAt?: string | null;
  onClick?: () => void;
}

const TaskItem = ({ id, title, description, status, dueAt, onClick }: TaskItemProps) => {
  return (
    <div 
      className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(status))}>
          {status}
        </span>
      </div>
      {description && (
        <p className="text-gray-600 mb-2 line-clamp-2">{description}</p>
      )}
      <div className="text-sm text-gray-500">
        期限: {formatDate(dueAt)}
      </div>
    </div>
  );
};

// タスクリストコンポーネント
interface TaskListProps {
  searchTerm?: string;
  parentId?: string;
  labelId?: string;
  onTaskClick?: (taskId: string) => void;
}

export function TaskList({ searchTerm, parentId, labelId, onTaskClick }: TaskListProps) {
  // SWRを使用してデータを取得
  const { data, error, isLoading, mutate } = useTasks({ 
    search: searchTerm, 
    parentId, 
    labelId 
  });

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">タスクの取得中にエラーが発生しました。</p>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => mutate()}
        >
          再試行
        </button>
      </div>
    );
  }

  // データがない場合
  if (!data || !data.tasks || data.tasks.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">タスクがありません</p>
      </div>
    );
  }

  // タスク一覧の表示
  return (
    <div className="space-y-2">
      {data.tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          description={task.description}
          status={task.status}
          dueAt={task.dueAt}
          onClick={() => onTaskClick && onTaskClick(task.id)}
        />
      ))}
    </div>
  );
}