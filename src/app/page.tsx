'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/TaskList'
import { useTasks } from '@/lib/hooks'
import { taskMutations } from '@/lib/hooks'

export default function Home() {
  const router = useRouter()
  const [newTaskText, setNewTaskText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // SWRでタスクデータを取得
  const { mutate: refreshTasks } = useTasks({
    search: searchTerm || undefined
  });

  // タスク作成を処理する関数
  const handleAddTask = async () => {
    if (newTaskText.trim() === '') return
    
    setIsCreatingTask(true)
    setError(null)
    
    try {
      await taskMutations.createTask({
        title: newTaskText.trim(),
      })
      
      setNewTaskText('') // 入力をクリア
      // タスク一覧を更新
      refreshTasks()
    } catch (err) {
      console.error('Error creating task:', err)
      setError('タスクの作成中にエラーが発生しました。')
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask()
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleTaskClick = (taskId: string) => {
    // 詳細ページに遷移（実装予定）
    console.log('Task clicked:', taskId)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tasker</h1>
      
      {/* タスク作成フォーム */}
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="新しいタスクを追加"
          value={newTaskText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow"
          disabled={isCreatingTask}
        />
        <Button 
          onClick={handleAddTask}
          disabled={isCreatingTask || newTaskText.trim() === ''}
        >
          {isCreatingTask ? '追加中...' : 'タスク追加'}
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* 検索フォーム */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="タスクを検索..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      
      {/* タスクリスト */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">タスク一覧</h2>
        <TaskList 
          searchTerm={searchTerm || undefined}
          onTaskClick={handleTaskClick}
        />
      </div>
    </main>
  )
}
