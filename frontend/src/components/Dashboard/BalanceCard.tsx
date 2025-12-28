import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function BalanceCard({ balance, totalIncome, totalExpenses }: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Current Balance</h2>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-success-100' : 'bg-red-100'}`}>
          <DollarSign size={24} className={isPositive ? 'text-success-600' : 'text-red-600'} />
        </div>
      </div>

      <div className={`text-4xl font-bold mb-6 ${isPositive ? 'text-success-600' : 'text-red-600'}`}>
        {formatCurrency(balance)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-success-50 rounded-lg">
          <div className="flex items-center gap-2 text-success-700 mb-1">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Income</span>
          </div>
          <div className="text-lg font-semibold text-success-800">
            {formatCurrency(totalIncome)}
          </div>
        </div>

        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-1">
            <TrendingDown size={16} />
            <span className="text-sm font-medium">Expenses</span>
          </div>
          <div className="text-lg font-semibold text-red-800">
            {formatCurrency(totalExpenses)}
          </div>
        </div>
      </div>
    </div>
  );
}
