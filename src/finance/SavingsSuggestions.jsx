import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

function generateSuggestions(categoryTotals, monthlyStats, kpis) {
  const suggestions = [];
  const months = Math.max(kpis.monthsCovered, 1);

  const avg = (cat) => (categoryTotals[cat] || 0) / months;
  const totalExpenses = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const avgMonthlyExpenses = totalExpenses / months;

  // Rule A: Top category >35%
  const sorted = Object.entries(categoryTotals).sort(([,a],[,b]) => b - a);
  if (sorted.length > 0) {
    const [topCat, topAmt] = sorted[0];
    const pct = totalExpenses > 0 ? (topAmt / totalExpenses) * 100 : 0;
    if (pct > 35) {
      suggestions.push({
        id: 'top-cat',
        icon: '📊',
        title: `${topCat} is your biggest expense`,
        detail: `${topCat} accounts for ${pct.toFixed(0)}% of your total spending (₹${Math.round(topAmt / months).toLocaleString('en-IN')}/month). Aim to reduce it by 20%.`,
        saving: Math.round((topAmt / months) * 0.2),
        severity: 'high',
      });
    }
  }

  // Rule B: Food & Dining
  const foodAvg = avg('Food & Dining');
  if (foodAvg > 8000) {
    suggestions.push({
      id: 'food',
      icon: '🍱',
      title: 'High spending on Food & Dining',
      detail: `You spend ₹${Math.round(foodAvg).toLocaleString('en-IN')}/month dining out. Cooking at home 3–4 times a week could save approximately ₹${Math.round(foodAvg * 0.35).toLocaleString('en-IN')}/month.`,
      saving: Math.round(foodAvg * 0.35),
      severity: 'medium',
    });
  }

  // Rule C: Entertainment / subscriptions
  const entAvg = avg('Entertainment');
  if (entAvg > 2000) {
    suggestions.push({
      id: 'subscriptions',
      icon: '📺',
      title: 'Review your subscriptions',
      detail: `Entertainment subscriptions cost ₹${Math.round(entAvg).toLocaleString('en-IN')}/month. Cancel services you haven't used in the last 30 days.`,
      saving: Math.round(entAvg * 0.4),
      severity: 'low',
    });
  }

  // Rule D: Transport
  const transportAvg = avg('Transport');
  if (transportAvg > 6000) {
    suggestions.push({
      id: 'transport',
      icon: '🚌',
      title: 'Reduce transport costs',
      detail: `You spend ₹${Math.round(transportAvg).toLocaleString('en-IN')}/month on transport. Carpooling, monthly transit passes, or using metro for daily commutes could save ₹${Math.round(transportAvg * 0.3).toLocaleString('en-IN')}.`,
      saving: Math.round(transportAvg * 0.3),
      severity: 'medium',
    });
  }

  // Rule E: Shopping
  const shopAvg = avg('Shopping');
  if (shopAvg > 5000) {
    suggestions.push({
      id: 'shopping',
      icon: '🛍',
      title: 'Curb impulse shopping',
      detail: `Online shopping totals ₹${Math.round(shopAvg).toLocaleString('en-IN')}/month. Try a 24-hour rule before purchases and use wishlists to delay buying.`,
      saving: Math.round(shopAvg * 0.25),
      severity: 'medium',
    });
  }

  // Rule F: Low savings rate
  if (kpis.savingsRate < 20 && kpis.totalIncome > 0) {
    const gap = kpis.totalIncome * 0.2 - kpis.netSavings;
    suggestions.push({
      id: 'savings-rate',
      icon: '🎯',
      title: 'Boost your savings rate',
      detail: `Your savings rate is ${kpis.savingsRate.toFixed(1)}%. Financial experts recommend at least 20%. You need to save ₹${Math.round(gap / months).toLocaleString('en-IN')} more per month to reach this goal.`,
      saving: Math.round(gap / months),
      severity: kpis.savingsRate < 10 ? 'high' : 'medium',
    });
  }

  // Rule G: Month-over-month spike — compare last two months
  const monthKeys = Object.keys(monthlyStats).sort();
  if (monthKeys.length >= 2) {
    const prev = monthlyStats[monthKeys[monthKeys.length - 2]];
    const last = monthlyStats[monthKeys[monthKeys.length - 1]];
    for (const cat of Object.keys(last.byCategory || {})) {
      const lastAmt = last.byCategory[cat] || 0;
      const prevAmt = (prev.byCategory || {})[cat] || 0;
      if (prevAmt > 0 && lastAmt > prevAmt * 1.25) {
        const growth = Math.round(((lastAmt - prevAmt) / prevAmt) * 100);
        suggestions.push({
          id: `spike-${cat}`,
          icon: '⚠️',
          title: `${cat} spending spiked this month`,
          detail: `${cat} grew by ${growth}% last month (₹${Math.round(prevAmt).toLocaleString('en-IN')} → ₹${Math.round(lastAmt).toLocaleString('en-IN')}). Review recent transactions in this category.`,
          saving: Math.round(lastAmt - prevAmt),
          severity: 'high',
        });
        break; // only show the biggest spike
      }
    }
  }

  // Rule H: Good savings rate — encourage SIP
  if (kpis.savingsRate >= 30 && kpis.totalIncome > 0) {
    suggestions.push({
      id: 'invest',
      icon: '📈',
      title: 'Great job! Consider investing your surplus',
      detail: `You're saving ${kpis.savingsRate.toFixed(1)}% of your income. Put the extra ₹${Math.round(kpis.netSavings / months * 0.5).toLocaleString('en-IN')}/month into a SIP (mutual fund) to grow your wealth.`,
      saving: 0,
      severity: 'low',
    });
  }

  return suggestions.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.severity] - rank[b.severity];
  }).slice(0, 5);
}

const severityStyles = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low: 'border-blue-100 bg-blue-50',
};

export default function SavingsSuggestions() {
  const { categoryTotals, monthlyStats, kpis, fmt } = useFinance();

  const suggestions = useMemo(
    () => generateSuggestions(categoryTotals, monthlyStats, kpis),
    [categoryTotals, monthlyStats, kpis]
  );

  if (suggestions.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        {kpis.totalExpenses > 0
          ? 'Your finances look well-balanced! Keep it up.'
          : 'Upload statements to see personalised savings suggestions.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map(s => (
        <div key={s.id} className={`rounded-2xl border p-4 ${severityStyles[s.severity]}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none mt-0.5">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{s.detail}</p>
            </div>
            {s.saving > 0 && (
              <div className="text-right shrink-0">
                <div className="text-green-700 font-bold text-sm">{fmt(s.saving)}</div>
                <div className="text-gray-400 text-xs">potential/mo</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
