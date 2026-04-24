import React, { useEffect, useRef, useState } from 'react'
import { useTodo } from '../context/TodoContext'
import { QUADRANTS, TIME_HORIZONS } from '../constants'

function MoveQuadrantIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  )
}

function MoveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function DateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default function TaskOptionsMenu() {
  const { state, dispatch } = useTodo()
  const menuRef = useRef(null)
  const [subMenu, setSubMenu] = useState(null)

  const menu = state.taskMenu
  if (!menu) return null

  const task = state.tasks.find(t => t.id === menu.taskId)
  if (!task) return null

  function close() {
    dispatch({ type: 'CLOSE_TASK_MENU' })
    setSubMenu(null)
  }

  function handleMoveQuadrant(qId) {
    dispatch({ type: 'MOVE_TO_QUADRANT', payload: { taskId: task.id, quadrant: qId } })
    close()
  }

  function handleMoveHorizon(hId) {
    dispatch({ type: 'MOVE_TO_HORIZON', payload: { taskId: task.id, timeHorizon: hId } })
    close()
  }

  function handleEdit() {
    dispatch({ type: 'OPEN_ADD_MODAL', payload: { editTask: task, quadrant: task.quadrant } })
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_TASK', payload: task.id })
    close()
  }

  const menuStyle = {
    position: 'fixed',
    top: Math.min(menu.y, window.innerHeight - 280),
    left: Math.min(menu.x + 4, window.innerWidth - 200),
    zIndex: 1000,
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={close} />
      <div
        ref={menuRef}
        style={menuStyle}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-48 z-50 relative"
      >
        <div className="relative">
          <button
            onMouseEnter={() => setSubMenu('quadrant')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-400"><MoveQuadrantIcon /></span>
            <span className="flex-1 text-left">Move to quadrant</span>
            <span className="text-gray-300"><ChevronRight /></span>
          </button>
          {subMenu === 'quadrant' && (
            <div className="absolute left-full top-0 ml-1 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-52">
              {QUADRANTS.filter(q => q.id !== task.quadrant).map(q => (
                <button
                  key={q.id}
                  onClick={() => handleMoveQuadrant(q.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-3 h-3 rounded-full ${q.badgeBg}`} />
                  <span className="text-left leading-tight">
                    <span className="block text-xs font-medium">{q.subtitle}</span>
                    <span className="block text-xs text-gray-400">{q.label.split(' + ').join(' & ')}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onMouseEnter={() => setSubMenu('horizon')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-400"><MoveIcon /></span>
            <span className="flex-1 text-left">Move to...</span>
            <span className="text-gray-300"><ChevronRight /></span>
          </button>
          {subMenu === 'horizon' && (
            <div className="absolute left-full top-0 ml-1 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-36">
              {TIME_HORIZONS.filter(h => h.id !== task.timeHorizon).map(h => (
                <button
                  key={h.id}
                  onClick={() => handleMoveHorizon(h.id)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onMouseEnter={() => setSubMenu(null)}
          onClick={handleEdit}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-400"><EditIcon /></span>
          Edit task
        </button>

        <button
          onMouseEnter={() => setSubMenu(null)}
          onClick={() => {
            setSubMenu(null)
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-400"><DateIcon /></span>
          Set due date
        </button>

        <div className="border-t border-gray-100 mt-1 pt-1">
          <button
            onMouseEnter={() => setSubMenu(null)}
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <DeleteIcon />
            Delete task
          </button>
        </div>
      </div>
    </>
  )
}
