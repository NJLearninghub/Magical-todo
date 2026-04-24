import React from 'react'
import { useTodo } from '../context/TodoContext'
import { QUADRANTS } from '../constants'
import TaskCard from './TaskCard'

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default function FocusMode() {
  const { state, dispatch } = useTodo()

  if (!state.focusMode) return null

  const qId = state.focusQuadrant || 1
  const q = QUADRANTS[qId - 1]
  const tasks = state.tasks.filter(t => t.quadrant === qId && t.timeHorizon === state.timeHorizon)

  function exit() {
    dispatch({ type: 'SET_FOCUS_MODE', payload: { active: false } })
  }

  function prev() {
    dispatch({ type: 'SET_FOCUS_QUADRANT', payload: qId === 1 ? 4 : qId - 1 })
  }

  function next() {
    dispatch({ type: 'SET_FOCUS_QUADRANT', payload: qId === 4 ? 1 : qId + 1 })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${q.badgeBg} flex items-center justify-center`}>
          <span className="text-white text-sm font-bold">{qId}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{q.label}</p>
          <p className="text-xs text-gray-400">{q.subtitle} · Focus Mode</p>
        </div>
        <button onClick={exit} className="text-gray-400 hover:text-gray-600 transition-colors">
          <XIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-sm">All done in this quadrant!</p>
          </div>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} quadrant={qId} />)
        )}
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={prev}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft />
          Previous
        </button>
        <div className="flex gap-1.5">
          {QUADRANTS.map(q2 => (
            <button
              key={q2.id}
              onClick={() => dispatch({ type: 'SET_FOCUS_QUADRANT', payload: q2.id })}
              className={`w-2 h-2 rounded-full transition-all ${
                q2.id === qId ? q.badgeBg : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Next
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}
