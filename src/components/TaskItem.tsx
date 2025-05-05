'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { taskMutations } from '@/lib/hooks';

// タスクの状態によって表示色を変更するユーティリティ関数
export const getStatusColor = (status: string) => {
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
export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '期限なし';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// 利用可能なタスクステータス
const TASK_STATUSES = [
  { value: 'todo', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '完了' },
  { value: 'cancelled', label: 'キャンセル' },
];

// タスクアイテムコンポーネントのProps
export interface TaskItemProps {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueAt?: string | null;
  onClick?: () => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean; // コンパクト表示モード
}

export function TaskItem({
  id,
  title,
  description,
  status,
  dueAt,
  onClick,
  onStatusChange,
  onDelete,
  compact = false,
}: TaskItemProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ステータス変更ハンドラー
  const handleStatusChange = async (newStatus: string) => {
    if (status === newStatus) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await taskMutations.updateTask(id, { status: newStatus });
      
      // 親コンポーネントに通知
      if (onStatusChange) {
        onStatusChange(id, newStatus);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('ステータスの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // タスク削除ハンドラー
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // タスクのクリックイベントが発火しないようにする
    
    if (!window.confirm('このタスクを削除してもよろしいですか？')) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await taskMutations.deleteTask(id);
      
      // 親コンポーネントに通知
      if (onDelete) {
        onDelete(id);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('タスクの削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // コンパクトモード用のレンダリング
  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-2 border-b hover:bg-gray-50 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", {
            "bg-gray-400": status === 'todo',
            "bg-blue-500": status === 'in_progress',
            "bg-green-500": status === 'done',
            "bg-red-500": status === 'cancelled',
          })} />
          <span className="font-medium">{title}</span>
        </div>
        <span className="text-xs text-gray-500">{formatDate(dueAt)}</span>
      </div>
    );
  }

  // 通常モード用のレンダリング
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(status))}>
            {TASK_STATUSES.find(s => s.value === status)?.label || status}
          </span>
        </div>
        
        {description && (
          <p className="text-gray-600 mb-2 line-clamp-2">{description}</p>
        )}
        
        <div className="text-sm text-gray-500">
          期限: {formatDate(dueAt)}
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-500">{error}</div>
        )}
      </div>
      
      {/* アクションエリア */}
      <div className="bg-gray-50 p-2 flex flex-wrap gap-2 items-center justify-between border-t">
        {/* ステータス変更ボタン */}
        <div className="flex gap-1">
          {TASK_STATUSES.map((taskStatus) => (
            <button
              key={taskStatus.value}
              className={cn(
                "px-2 py-1 text-xs rounded",
                status === taskStatus.value
                  ? "bg-gray-200 font-bold"
                  : "hover:bg-gray-200"
              )}
              onClick={() => handleStatusChange(taskStatus.value)}
              disabled={isUpdating || status === taskStatus.value}
            >
              {taskStatus.label}
            </button>
          ))}
        </div>
        
        {/* 削除ボタン */}
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? '削除中...' : '削除'}
        </Button>
      </div>
    </div>
  );
}