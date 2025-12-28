import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Receipt, ChevronRight } from 'lucide-react';
import type { Transaction } from '@teambudget/shared';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

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
  registration_fee: 'Registration Fees',
  sponsorship: 'Sponsorship',
  donation: 'Donation',
  other: 'Other',
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No transactions yet
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <Link
          to="/transactions"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          View all <ChevronRight size={16} />
        </Link>
      </div>

      <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => {
          const isIncome = transaction.type === 'income';
          const extendedTransaction = transaction as Transaction & {
            receipt_id?: string;
            created_by_name?: string;
          };

          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isIncome ? 'bg-success-100' : 'bg-red-100'
                }`}
              >
                {isIncome ? (
                  <ArrowUpRight className="text-success-600" size={20} />
                ) : (
                  <ArrowDownRight className="text-red-600" size={20} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">
                    {transaction.description}
                  </p>
                  {extendedTransaction.receipt_id && (
                    <Receipt size={14} className="text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {categoryLabels[transaction.category] || transaction.category} •{' '}
                  {formatDate(transaction.date)}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`font-semibold ${
                    isIncome ? 'text-success-600' : 'text-red-600'
                  }`}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                {transaction.status === 'voided' && (
                  <span className="text-xs text-gray-400">Voided</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
