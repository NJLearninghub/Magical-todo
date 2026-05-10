import { useState } from 'react'
import { TodoProvider, useTodo } from './context/TodoContext'
import { FinanceProvider } from './context/FinanceContext'
import Header from './components/Header'
import QuadrantGrid from './components/QuadrantGrid'
import TimeHorizonTabs from './components/TimeHorizonTabs'
import TaskOptionsMenu from './components/TaskOptionsMenu'
import AddTaskModal from './components/AddTaskModal'
import SearchOverlay from './components/SearchOverlay'
import FocusMode from './components/FocusMode'
import FinanceDashboard from './finance/FinanceDashboard'

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

function TodoIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#1d4ed8' : '#9ca3af'} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#1d4ed8' : '#9ca3af'} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function AppNav({ activeView, setActiveView }) {
  return (
    <div className="flex border-t border-gray-200 bg-white">
      <button
        onClick={() => setActiveView('todo')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
          activeView === 'todo' ? 'text-blue-700' : 'text-gray-400'
        }`}
      >
        <TodoIcon active={activeView === 'todo'} />
        Tasks
      </button>
      <button
        onClick={() => setActiveView('finance')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
          activeView === 'finance' ? 'text-blue-700' : 'text-gray-400'
        }`}
      >
        <ChartIcon active={activeView === 'finance'} />
        Finance
      </button>
    </div>
  )
}

function TodoView() {
  const { state, dispatch } = useTodo()

  function openFocusMode() {
    dispatch({ type: 'SET_FOCUS_MODE', payload: { active: true, quadrant: 1 } })
  }

  return (
    <>
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
    </>
  )
}

function AppContent() {
  const [activeView, setActiveView] = useState('todo')

  return (
    <div className="flex flex-col h-screen bg-gray-100 max-w-2xl mx-auto relative overflow-hidden">
      <Header />
      {activeView === 'todo' && <TodoView />}
      {activeView === 'finance' && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <FinanceDashboard />
        </div>
      )}
      <AppNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  )
}

export default function App() {
  return (
    <TodoProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </TodoProvider>
  )
}
