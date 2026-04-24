import React, { useState } from 'react'
import { useTodo } from '../context/TodoContext'
import { QUADRANTS } from '../constants'
import TaskCard from './TaskCard'

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

export default function Quadrant({ quadrantId }) {
  const { state, dispatch } = useTodo()
  const [dragOver, setDragOver] = useState(false)

  const q = QUADRANTS[quadrantId - 1]
  const tasks = state.tasks.filter(
    t => t.quadrant === quadrantId && t.timeHorizon === state.timeHorizon
  )

  const visibleTasks = state.searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(state.searchQuery.toLowerCase()))
    : tasks

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      dispatch({ type: 'MOVE_TO_QUADRANT', payload: { taskId, quadrant: quadrantId } })
    }
  }

  function handleAddTask() {
    dispatch({ type: 'OPEN_ADD_MODAL', payload: { quadrant: quadrantId } })
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl flex flex-col min-h-0 transition-all ${
        dragOver ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
      }`}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className={`w-7 h-7 rounded-full ${q.badgeBg} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{quadrantId}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{q.label}</p>
          <p className="text-xs text-gray-400 leading-tight">{q.subtitle}</p>
        </div>
        {tasks.length > 0 && (
          <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${q.countBg} ${q.countText}`}>
            {tasks.length}
          </span>
        )}
        <button className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
          <DotsIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2 min-h-0 max-h-48">
        {visibleTasks.map(task => (
          <TaskCard key={task.id} task={task} quadrant={quadrantId} />
        ))}
        {visibleTasks.length === 0 && state.searchQuery && (
          <p className="text-xs text-gray-300 text-center py-3">No matches</p>
        )}
      </div>

      <div className="px-3 pb-3 pt-2">
        <button
          onClick={handleAddTask}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          <PlusIcon />
          <span>Add task</span>
        </button>
      </div>
    </div>
  )
}
