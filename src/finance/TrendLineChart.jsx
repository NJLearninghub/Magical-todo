import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useFinance } from '../context/FinanceContext';

function rupeeFormatter(value) {
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className={val >= 0 ? 'text-green-600' : 'text-red-500'}>
        Net: ₹{val.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

export default function TrendLineChart() {
  const { monthlyChartData } = useFinance();

  if (monthlyChartData.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tickFormatter={rupeeFormatter} tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="net"
          name="Net Savings"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#3b82f6' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
