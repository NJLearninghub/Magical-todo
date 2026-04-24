import React from 'react'
import { TodoProvider, useTodo } from './context/TodoContext'
import Header from './components/Header'
import QuadrantGrid from './components/QuadrantGrid'
import TimeHorizonTabs from './components/TimeHorizonTabs'
import TaskOptionsMenu from './components/TaskOptionsMenu'
import AddTaskModal from './components/AddTaskModal'
import SearchOverlay from './components/SearchOverlay'
import FocusMode from './components/FocusMode'

function PlusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function FocusModeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  )
}

function AppContent() {
  const { state, dispatch } = useTodo()

  function openFocusMode() {
    dispatch({ type: 'SET_FOCUS_MODE', payload: { active: true, quadrant: 1 } })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 max-w-2xl mx-auto relative overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <QuadrantGrid />
      </main>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <button
          onClick={() => dispatch({ type: 'OPEN_ADD_MODAL', payload: {} })}
          className="w-14 h-14 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95"
          aria-label="Add task"
        >
          <PlusIcon />
        </button>
      </div>

      <div className="absolute bottom-20 right-4">
        <button
          onClick={openFocusMode}
          title="Focus Mode"
          className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center shadow-md text-gray-600 transition-all active:scale-95"
        >
          <FocusModeIcon />
        </button>
      </div>

      <TimeHorizonTabs />

      <TaskOptionsMenu />
      <AddTaskModal />
      <SearchOverlay />
      <FocusMode />
    </div>
  )
}

export default function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  )
}
