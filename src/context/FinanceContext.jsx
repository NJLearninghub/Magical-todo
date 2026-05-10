import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import categories from '../constants/categories.json';

const FinanceContext = createContext(null);

const initialState = {
  transactions: [],
  uploadedFiles: [],
  isLoading: false,
  parseProgress: [],
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STORED': {
      return { ...state, transactions: action.transactions, uploadedFiles: action.uploadedFiles };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };
    case 'SET_PARSE_PROGRESS': {
      const existing = state.parseProgress.filter(p => p.file !== action.progress.file);
      return { ...state, parseProgress: [...existing, action.progress] };
    }
    case 'MERGE_TRANSACTIONS': {
      // Deduplicate by id
      const map = new Map(state.transactions.map(t => [t.id, t]));
      for (const t of action.transactions) map.set(t.id, t);
      const merged = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
      const files = [...state.uploadedFiles, ...action.files];
      return { ...state, transactions: merged, uploadedFiles: files, isLoading: false };
    }
    case 'CLEAR_ALL':
      return { ...initialState };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    default:
      return state;
  }
}

const isElectron = typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount, then sync from electron-store if available
  useEffect(() => {
    const local = localStorage.getItem('magical-finance-state');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        dispatch({ type: 'LOAD_STORED', transactions: parsed.transactions || [], uploadedFiles: parsed.uploadedFiles || [] });
        return;
      } catch (_) {}
    }
    if (isElectron) {
      window.electronAPI.getStoredData().then(data => {
        if (data && data.transactions && data.transactions.length > 0) {
          dispatch({ type: 'LOAD_STORED', transactions: data.transactions, uploadedFiles: data.uploadedFiles || [] });
        }
      });
    }
  }, []);

  // Persist to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('magical-finance-state', JSON.stringify({
      transactions: state.transactions,
      uploadedFiles: state.uploadedFiles,
    }));
    if (isElectron && state.transactions.length > 0) {
      window.electronAPI.saveData({ transactions: state.transactions, uploadedFiles: state.uploadedFiles });
    }
  }, [state.transactions, state.uploadedFiles]);

  // Subscribe to parse progress events from Electron
  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.onParseProgress(progress => {
      dispatch({ type: 'SET_PARSE_PROGRESS', progress });
    });
    return () => window.electronAPI.offParseProgress();
  }, []);

  // ── Derived Data ────────────────────────────────────────────────────────────
  const monthlyStats = useMemo(() => {
    const stats = {};
    for (const t of state.transactions) {
      const ym = t.date.slice(0, 7); // YYYY-MM
      if (!stats[ym]) stats[ym] = { income: 0, expenses: 0, net: 0, byCategory: {} };
      if (t.type === 'credit') {
        stats[ym].income += t.amount;
      } else {
        stats[ym].expenses += t.amount;
        stats[ym].byCategory[t.category] = (stats[ym].byCategory[t.category] || 0) + t.amount;
      }
      stats[ym].net = stats[ym].income - stats[ym].expenses;
    }
    return stats;
  }, [state.transactions]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    for (const t of state.transactions) {
      if (t.type === 'debit') {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      }
    }
    return totals;
  }, [state.transactions]);

  const kpis = useMemo(() => {
    const months = Object.keys(monthlyStats);
    const totalIncome = months.reduce((s, m) => s + monthlyStats[m].income, 0);
    const totalExpenses = months.reduce((s, m) => s + monthlyStats[m].expenses, 0);
    const netSavings = totalIncome - totalExpenses;
    const monthsCovered = months.length;
    const avgMonthlyExpense = monthsCovered > 0 ? totalExpenses / monthsCovered : 0;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    return { totalIncome, totalExpenses, netSavings, monthsCovered, avgMonthlyExpense, savingsRate };
  }, [monthlyStats]);

  const monthlyChartData = useMemo(() => {
    return Object.keys(monthlyStats).sort().map(ym => {
      const [year, mo] = ym.split('-');
      const label = new Date(parseInt(year), parseInt(mo) - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      return { month: label, income: Math.round(monthlyStats[ym].income), expenses: Math.round(monthlyStats[ym].expenses), net: Math.round(monthlyStats[ym].net) };
    });
  }, [monthlyStats]);

  const pieData = useMemo(() => {
    const catMap = {};
    categories.forEach(c => { catMap[c.category] = c.color; });
    return Object.entries(categoryTotals)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value: Math.round(value), color: catMap[name] || '#64748b' }));
  }, [categoryTotals]);

  const topExpenses = useMemo(() => {
    return [...state.transactions]
      .filter(t => t.type === 'debit')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [state.transactions]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function uploadFiles(fileDescriptors) {
    if (!isElectron) {
      alert('File upload requires the desktop app.');
      return;
    }
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const newTransactions = await window.electronAPI.parseFiles(fileDescriptors);
      const newFiles = fileDescriptors.map(f => ({
        name: f.name,
        uploadedAt: new Date().toISOString(),
        transactionCount: newTransactions.filter(t => t.sourceFile === f.name).length,
      }));
      dispatch({ type: 'MERGE_TRANSACTIONS', transactions: newTransactions, files: newFiles });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }

  async function openAndUploadFiles() {
    if (!isElectron) return;
    const files = await window.electronAPI.openFileDialog();
    if (files.length > 0) await uploadFiles(files);
  }

  async function clearAllData() {
    dispatch({ type: 'CLEAR_ALL' });
    if (isElectron) await window.electronAPI.clearData();
    localStorage.removeItem('magical-finance-state');
  }

  return (
    <FinanceContext.Provider value={{
      ...state,
      monthlyStats, categoryTotals, kpis, monthlyChartData, pieData, topExpenses,
      uploadFiles, openAndUploadFiles, clearAllData,
      fmt, isElectron, categories,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
