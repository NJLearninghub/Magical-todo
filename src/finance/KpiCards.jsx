import { useFinance } from '../context/FinanceContext';

function Card({ label, value, sub, color, icon }) {
  return (
    <div className={`rounded-2xl p-4 bg-white border border-gray-100 shadow-sm`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function KpiCards() {
  const { kpis, fmt } = useFinance();
  const savingsColor = kpis.netSavings >= 0 ? 'text-green-600' : 'text-red-600';
  const rateColor = kpis.savingsRate >= 20 ? 'text-green-600' : kpis.savingsRate >= 10 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card
        label="Total Income"
        value={fmt(kpis.totalIncome)}
        sub={`${kpis.monthsCovered} month${kpis.monthsCovered !== 1 ? 's' : ''} of data`}
        color="text-green-600"
        icon="💰"
      />
      <Card
        label="Total Expenses"
        value={fmt(kpis.totalExpenses)}
        sub={`Avg ${fmt(kpis.avgMonthlyExpense)}/month`}
        color="text-red-500"
        icon="💸"
      />
      <Card
        label="Net Savings"
        value={fmt(kpis.netSavings)}
        sub={kpis.netSavings >= 0 ? 'Keep it up!' : 'Spending exceeds income'}
        color={savingsColor}
        icon={kpis.netSavings >= 0 ? '📈' : '📉'}
      />
      <Card
        label="Savings Rate"
        value={`${kpis.savingsRate.toFixed(1)}%`}
        sub={kpis.savingsRate >= 20 ? 'Above 20% target ✓' : 'Target: 20%'}
        color={rateColor}
        icon="🎯"
      />
    </div>
  );
}
