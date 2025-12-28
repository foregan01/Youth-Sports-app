import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useTeamStore, useTransactionStore } from '../store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@teambudget/shared';

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
    year: 'numeric',
  });
}

const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export default function Transactions() {
  const { currentTeam } = useTeamStore();
  const { transactions, pagination, isLoading, fetchTransactions } = useTransactionStore();

  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (currentTeam) {
      fetchTransactions(currentTeam.id, {
        page: 1,
        type: filters.type || undefined,
        category: filters.category || undefined,
      });
    }
  }, [currentTeam, filters.type, filters.category, fetchTransactions]);

  const handlePageChange = (page: number) => {
    if (currentTeam) {
      fetchTransactions(currentTeam.id, {
        page,
        type: filters.type || undefined,
        category: filters.category || undefined,
      });
    }
  };

  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-gray-500">Please select a team first</p>
        <Link to="/dashboard" className="btn-primary mt-4">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">View and manage all team transactions</p>
        </div>
        <Link to="/add-expense" className="btn-primary">
          <PlusCircle size={18} />
          <span className="ml-2">Add Transaction</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-50 text-primary-700' : ''}`}
          >
            <Filter size={18} />
            <span className="ml-2">Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="label">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="input"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Receipt size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No transactions found</p>
            <Link to="/add-expense" className="btn-primary">
              Add Your First Transaction
            </Link>
          </div>
        ) : (
          <>
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="col-span-1">Type</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Transactions */}
            <div className="divide-y divide-gray-200">
              {transactions
                .filter(
                  (t) =>
                    !filters.search ||
                    t.description.toLowerCase().includes(filters.search.toLowerCase())
                )
                .map((transaction) => {
                  const isIncome = transaction.type === 'income';
                  const categoryLabel =
                    allCategories.find((c) => c.value === transaction.category)?.label ||
                    transaction.category;
                  const extendedTransaction = transaction as typeof transaction & {
                    receipt_id?: string;
                  };

                  return (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Type Icon */}
                      <div className="col-span-1 flex items-center">
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
                      </div>

                      {/* Description */}
                      <div className="col-span-3 flex items-center gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500 md:hidden">{categoryLabel}</p>
                        </div>
                        {extendedTransaction.receipt_id && (
                          <Receipt size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                      </div>

                      {/* Category (Desktop) */}
                      <div className="hidden md:flex col-span-2 items-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {categoryLabel}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex items-center text-gray-500">
                        {formatDate(transaction.date)}
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 flex items-center justify-end">
                        <span
                          className={`font-semibold ${
                            isIncome ? 'text-success-600' : 'text-red-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex items-center justify-end">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-success-100 text-success-700'
                              : transaction.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} transactions
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary py-2 px-3 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary py-2 px-3 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
