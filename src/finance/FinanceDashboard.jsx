import { useFinance } from '../context/FinanceContext';
import FileUploadZone from './FileUploadZone';
import KpiCards from './KpiCards';
import MonthlyBarChart from './MonthlyBarChart';
import ExpensePieChart from './ExpensePieChart';
import TrendLineChart from './TrendLineChart';
import TopExpensesTable from './TopExpensesTable';
import SavingsSuggestions from './SavingsSuggestions';

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {title && <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">{title}</h2>}
      {children}
    </div>
  );
}

export default function FinanceDashboard() {
  const { transactions, kpis } = useFinance();
  const hasData = transactions.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Upload */}
        <Section>
          <FileUploadZone />
        </Section>

        {/* KPI Cards */}
        {hasData && <KpiCards />}

        {/* Charts row */}
        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section title="Monthly Income vs Expenses">
              <MonthlyBarChart />
            </Section>
            <Section title="Expense Breakdown by Category">
              <ExpensePieChart />
            </Section>
          </div>
        )}

        {/* Savings trend */}
        {hasData && kpis.monthsCovered > 1 && (
          <Section title="Net Savings Trend">
            <TrendLineChart />
          </Section>
        )}

        {/* Bottom row */}
        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section title="Top 10 Expenses">
              <TopExpensesTable />
            </Section>
            <Section title="💡 Savings Suggestions">
              <SavingsSuggestions />
            </Section>
          </div>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium text-gray-500">Your financial dashboard awaits</p>
            <p className="text-sm mt-2">Upload your credit card or savings account statements above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
