import { useFinance } from '../context/FinanceContext';
import categories from '../constants/categories.json';

const catColorMap = Object.fromEntries(categories.map(c => [c.category, c.color]));

function CategoryBadge({ name }) {
  const color = catColorMap[name] || '#64748b';
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}

export default function TopExpensesTable() {
  const { topExpenses, fmt } = useFinance();

  if (topExpenses.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">No expense data yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-gray-500 font-medium w-8">#</th>
            <th className="text-left py-2 px-3 text-gray-500 font-medium">Description</th>
            <th className="text-left py-2 px-3 text-gray-500 font-medium hidden sm:table-cell">Date</th>
            <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Category</th>
            <th className="text-right py-2 px-3 text-gray-500 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {topExpenses.map((t, i) => (
            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2 px-3 text-gray-400">{i + 1}</td>
              <td className="py-2 px-3 text-gray-700 max-w-xs truncate">{t.description}</td>
              <td className="py-2 px-3 text-gray-400 hidden sm:table-cell">
                {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </td>
              <td className="py-2 px-3 hidden md:table-cell">
                <CategoryBadge name={t.category} />
              </td>
              <td className="py-2 px-3 text-right font-semibold text-red-500">{fmt(t.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
