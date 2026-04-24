import React, { useRef } from 'react'
import { useTodo } from '../context/TodoContext'
import { QUADRANTS } from '../constants'

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function DotsHIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

export default function TaskCard({ task, quadrant }) {
  const { dispatch } = useTodo()
  const cardRef = useRef(null)
  const q = QUADRANTS[quadrant - 1]

  function handleMenuClick(e) {
    e.stopPropagation()
    const rect = cardRef.current.getBoundingClientRect()
    dispatch({
      type: 'OPEN_TASK_MENU',
      payload: {
        taskId: task.id,
        x: rect.right,
        y: rect.top,
        quadrant,
      },
    })
  }

  function handleDragStart(e) {
    e.dataTransfer.setData('taskId', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const hasDate = Boolean(task.dueDate || task.dueTime)

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      className="bg-white border border-gray-100 rounded-xl px-3 py-3 flex items-start gap-3 cursor-grab active:cursor-grabbing hover:border-gray-200 hover:shadow-sm transition-all group"
    >
      <button
        onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed
            ? `border-transparent ${q.badgeBg} bg-opacity-80`
            : `border-gray-300 hover:border-gray-400 ${q.borderHover}`
        }`}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {hasDate && (
          <div className="flex items-center gap-1 mt-1 text-gray-400">
            {task.dueTime ? <ClockIcon /> : <CalendarIcon />}
            <span className="text-xs">
              {task.dueTime
                ? `Today, ${task.dueTime}`
                : task.dueDate}
            </span>
          </div>
        )}
        {!hasDate && (
          <div className="flex items-center gap-1 mt-1 text-gray-300">
            <CalendarIcon />
            <span className="text-xs">No due date</span>
          </div>
        )}
      </div>

      <button
        onClick={handleMenuClick}
        className="flex-shrink-0 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded"
      >
        <DotsHIcon />
      </button>
    </div>
  )
}
