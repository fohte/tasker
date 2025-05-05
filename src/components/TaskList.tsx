'use client';

import { useTasks } from '@/lib/hooks';
import { TaskItem } from '@/components/TaskItem';

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
    <div className="space-y-4">
      {data.tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          description={task.description}
          status={task.status}
          dueAt={task.dueAt}
          onClick={() => onTaskClick && onTaskClick(task.id)}
          onStatusChange={() => mutate()} // ステータス変更時にリストを更新
          onDelete={() => mutate()} // 削除時にリストを更新
        />
      ))}
    </div>
  );
}