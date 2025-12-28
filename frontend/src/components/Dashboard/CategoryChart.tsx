import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CategoryBreakdown } from '@teambudget/shared';

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

const categoryLabels: Record<string, string> = {
  registration: 'Registration',
  equipment: 'Equipment',
  uniforms: 'Uniforms',
  tournament: 'Tournaments',
  travel: 'Travel',
  field_rental: 'Field Rental',
  coaching: 'Coaching',
  insurance: 'Insurance',
  fundraising: 'Fundraising',
  supplies: 'Supplies',
  snacks: 'Snacks',
  trophies: 'Trophies',
  photography: 'Photography',
  other: 'Other',
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No expense data yet
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: categoryLabels[item.category] || item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
