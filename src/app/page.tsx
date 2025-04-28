'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Task {
  id: number
  text: string
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState('')

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return
    const newTask: Task = {
      id: Date.now(), // Use timestamp as a simple unique ID for now
      text: newTaskText.trim(),
    }
    setTasks([...tasks, newTask])
    setNewTaskText('') // Clear input after adding
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask()
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasker</h1>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Add a new task"
          value={newTaskText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        <Button onClick={handleAddTask}>Add Task</Button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="border-b p-2">
            {task.text}
          </li>
        ))}
      </ul>
    </main>
  )
}
