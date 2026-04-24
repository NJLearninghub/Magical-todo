import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { INITIAL_TASKS } from '../constants'

const TodoContext = createContext(null)

const initialState = {
  tasks: INITIAL_TASKS,
  timeHorizon: 'daily',
  focusMode: false,
  focusQuadrant: null,
  searchOpen: false,
  searchQuery: '',
  taskMenu: null,
  addModal: { open: false, quadrant: null, editTask: null },
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TIME_HORIZON':
      return { ...state, timeHorizon: action.payload }

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      }

    case 'ADD_TASK': {
      const newTask = {
        id: Date.now().toString(),
        title: action.payload.title,
        timeHorizon: action.payload.timeHorizon || state.timeHorizon,
        quadrant: action.payload.quadrant,
        completed: false,
        dueDate: action.payload.dueDate || null,
        dueTime: action.payload.dueTime || null,
      }
      return { ...state, tasks: [...state.tasks, newTask] }
    }

    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      }

    case 'MOVE_TO_QUADRANT':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, quadrant: action.payload.quadrant }
            : t
        ),
      }

    case 'MOVE_TO_HORIZON':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, timeHorizon: action.payload.timeHorizon }
            : t
        ),
      }

    case 'SET_FOCUS_MODE':
      return {
        ...state,
        focusMode: action.payload.active,
        focusQuadrant: action.payload.quadrant ?? state.focusQuadrant,
      }

    case 'SET_FOCUS_QUADRANT':
      return { ...state, focusQuadrant: action.payload }

    case 'OPEN_SEARCH':
      return { ...state, searchOpen: true }

    case 'CLOSE_SEARCH':
      return { ...state, searchOpen: false, searchQuery: '' }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }

    case 'OPEN_TASK_MENU':
      return { ...state, taskMenu: action.payload }

    case 'CLOSE_TASK_MENU':
      return { ...state, taskMenu: null }

    case 'OPEN_ADD_MODAL':
      return {
        ...state,
        addModal: { open: true, quadrant: action.payload?.quadrant ?? null, editTask: action.payload?.editTask ?? null },
        taskMenu: null,
      }

    case 'CLOSE_ADD_MODAL':
      return { ...state, addModal: { open: false, quadrant: null, editTask: null } }

    default:
      return state
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('magical-todo-state')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...initialState, tasks: parsed.tasks, timeHorizon: parsed.timeHorizon }
    }
  } catch {}
  return initialState
}

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(
        'magical-todo-state',
        JSON.stringify({ tasks: state.tasks, timeHorizon: state.timeHorizon })
      )
    } catch {}
  }, [state.tasks, state.timeHorizon])

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  )
}

export function useTodo() {
  return useContext(TodoContext)
}
