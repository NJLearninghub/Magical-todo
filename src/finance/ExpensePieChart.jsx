import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinance } from '../context/FinanceContext';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  const total = payload[0].payload.total;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700">{name}</p>
      <p className="text-gray-600">₹{value.toLocaleString('en-IN')}</p>
      <p className="text-gray-400">{pct}% of expenses</p>
    </div>
  );
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function ExpensePieChart() {
  const { pieData } = useFinance();
  const total = pieData.reduce((s, d) => s + d.value, 0);
  const dataWithTotal = pieData.map(d => ({ ...d, total }));

  if (pieData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No expense data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {dataWithTotal.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={10}
          formatter={(value) => <span style={{ fontSize: 11, color: '#374151' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
