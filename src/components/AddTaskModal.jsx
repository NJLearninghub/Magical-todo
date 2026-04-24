import React, { useState, useEffect } from 'react'
import { useTodo } from '../context/TodoContext'
import { QUADRANTS, TIME_HORIZONS } from '../constants'

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function AddTaskModal() {
  const { state, dispatch } = useTodo()
  const { addModal } = state

  const isEdit = Boolean(addModal.editTask)
  const [title, setTitle] = useState('')
  const [quadrant, setQuadrant] = useState(1)
  const [horizon, setHorizon] = useState(state.timeHorizon)
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')

  useEffect(() => {
    if (addModal.open) {
      if (isEdit) {
        const t = addModal.editTask
        setTitle(t.title)
        setQuadrant(t.quadrant)
        setHorizon(t.timeHorizon)
        setDueDate(t.dueDate || '')
        setDueTime(t.dueTime || '')
      } else {
        setTitle('')
        setQuadrant(addModal.quadrant || 1)
        setHorizon(state.timeHorizon)
        setDueDate('')
        setDueTime('')
      }
    }
  }, [addModal.open])

  if (!addModal.open) return null

  function close() {
    dispatch({ type: 'CLOSE_ADD_MODAL' })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    if (isEdit) {
      dispatch({
        type: 'EDIT_TASK',
        payload: {
          id: addModal.editTask.id,
          title: title.trim(),
          quadrant,
          timeHorizon: horizon,
          dueDate: dueDate || null,
          dueTime: dueTime || null,
        },
      })
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          title: title.trim(),
          quadrant,
          timeHorizon: horizon,
          dueDate: dueDate || null,
          dueTime: dueTime || null,
        },
      })
    }
    close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit task' : 'Add task'}
          </h2>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              autoFocus
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Quadrant</label>
            <div className="grid grid-cols-2 gap-2">
              {QUADRANTS.map(q => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuadrant(q.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    quadrant === q.id
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${q.badgeBg}`} />
                  <span className="text-left leading-tight">
                    <span className="block text-xs font-medium">{q.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Time horizon</label>
            <div className="flex gap-2">
              {TIME_HORIZONS.map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHorizon(h.id)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                    horizon === h.id
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Due date</label>
              <input
                type="text"
                placeholder="e.g. May 27"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Due time</label>
              <input
                type="text"
                placeholder="e.g. 2:00 PM"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isEdit ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
