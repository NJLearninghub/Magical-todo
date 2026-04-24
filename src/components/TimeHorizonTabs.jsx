import React from 'react'
import { useTodo } from '../context/TodoContext'
import { TIME_HORIZONS } from '../constants'

function DailyIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function WeeklyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function MonthlyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="14" x2="12" y2="14" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="14" x2="16" y2="14" strokeWidth="3" strokeLinecap="round" />
      <line x1="8" y1="18" x2="8" y2="18" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function YearlyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

const ICONS = [DailyIcon, WeeklyIcon, MonthlyIcon, YearlyIcon]

export default function TimeHorizonTabs() {
  const { state, dispatch } = useTodo()

  return (
    <nav className="bg-white border-t border-gray-100 px-2 pt-2 pb-4 sticky bottom-0">
      <div className="flex justify-around">
        {TIME_HORIZONS.map((h, i) => {
          const Icon = ICONS[i]
          const active = state.timeHorizon === h.id
          return (
            <button
              key={h.id}
              onClick={() => dispatch({ type: 'SET_TIME_HORIZON', payload: h.id })}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors min-w-[64px] ${
                active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon active={active} />
              <span className="text-xs font-medium">{h.label}</span>
              {active && (
                <div className="w-5 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
