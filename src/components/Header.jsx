import React, { useState } from 'react'
import { useTodo } from '../context/TodoContext'
import { TIME_HORIZONS } from '../constants'

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function formatDate() {
  const d = new Date()
  return `${DAYS[d.getDay()].slice(0,3)}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export default function Header() {
  const { state, dispatch } = useTodo()
  const [horizonDropdown, setHorizonDropdown] = useState(false)

  const currentHorizon = TIME_HORIZONS.find(h => h.id === state.timeHorizon)

  function selectHorizon(id) {
    dispatch({ type: 'SET_TIME_HORIZON', payload: id })
    setHorizonDropdown(false)
  }

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
        <MenuIcon />
      </button>

      <div className="flex flex-col items-center">
        <div className="relative">
          <button
            onClick={() => setHorizonDropdown(v => !v)}
            className="flex items-center gap-1 font-semibold text-gray-900 text-base hover:text-gray-700"
          >
            {currentHorizon?.label}
            <ChevronDown />
          </button>
          {horizonDropdown && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 w-36">
              {TIME_HORIZONS.map(h => (
                <button
                  key={h.id}
                  onClick={() => selectHorizon(h.id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    h.id === state.timeHorizon ? 'text-indigo-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-0.5">{formatDate()}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => dispatch({ type: 'OPEN_SEARCH' })}
          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <SearchIcon />
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <FilterIcon />
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <DotsIcon />
        </button>
      </div>

      {horizonDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setHorizonDropdown(false)} />
      )}
    </header>
  )
}
