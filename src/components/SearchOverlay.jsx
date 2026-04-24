import React, { useEffect, useRef } from 'react'
import { useTodo } from '../context/TodoContext'
import { QUADRANTS } from '../constants'

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function SearchOverlay() {
  const { state, dispatch } = useTodo()
  const inputRef = useRef(null)

  useEffect(() => {
    if (state.searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [state.searchOpen])

  if (!state.searchOpen) return null

  const query = state.searchQuery.toLowerCase()
  const results = query
    ? state.tasks.filter(t => t.title.toLowerCase().includes(query))
    : []

  function close() {
    dispatch({ type: 'CLOSE_SEARCH' })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-gray-400"><SearchIcon /></span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks..."
            value={state.searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>
        {results.length > 0 && (
          <div className="border-t border-gray-100 max-h-64 overflow-y-auto">
            {results.map(task => {
              const q = QUADRANTS[task.quadrant - 1]
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_TASK', payload: task.id })
                  }}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${q.badgeBg}`} />
                  <div>
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {q.label} · {task.timeHorizon}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
            No tasks found
          </div>
        )}
      </div>
    </div>
  )
}
