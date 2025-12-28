import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useTeamStore } from '../store';
import {
  BalanceCard,
  CategoryChart,
  MonthlyTrendChart,
  RecentTransactions,
} from '../components/Dashboard';

export default function Dashboard() {
  const { currentTeam, dashboard, isLoading, fetchDashboard } = useTeamStore();

  useEffect(() => {
    if (currentTeam) {
      fetchDashboard(currentTeam.id);
    }
  }, [currentTeam, fetchDashboard]);

  const handleRefresh = () => {
    if (currentTeam) {
      fetchDashboard(currentTeam.id);
    }
  };

  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <PlusCircle size={32} className="text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Team Selected</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Create your first team to start tracking your budget and expenses.
        </p>
        <Link to="/create-team" className="btn-primary">
          Create Your First Team
        </Link>
      </div>
    );
  }

  if (isLoading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentTeam.name}</h1>
          <p className="text-gray-500">
            {currentTeam.sport} • {currentTeam.season}
            {currentTeam.ageGroup && ` • ${currentTeam.ageGroup}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </button>
          <Link to="/add-expense" className="btn-primary">
            <PlusCircle size={18} />
            <span className="ml-2">Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card - Full width on mobile, 1 col on desktop */}
        <div className="lg:col-span-1">
          <BalanceCard
            balance={dashboard?.currentBalance || 0}
            totalIncome={dashboard?.totalIncome || 0}
            totalExpenses={dashboard?.totalExpenses || 0}
          />
        </div>

        {/* Monthly Trend - Full width on mobile, 2 cols on desktop */}
        <div className="lg:col-span-2">
          <MonthlyTrendChart data={dashboard?.monthlyTrend || []} />
        </div>

        {/* Category Chart */}
        <div className="lg:col-span-1">
          <CategoryChart data={dashboard?.categoryBreakdown || []} />
        </div>

        {/* Recent Transactions - 2 cols */}
        <div className="lg:col-span-2">
          <RecentTransactions transactions={dashboard?.recentTransactions || []} />
        </div>
      </div>

      {/* Quick Stats */}
      {dashboard && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">
              {(dashboard.recentTransactions?.length || 0)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              {dashboard.pendingTransactions || 0}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboard.categoryBreakdown?.length || 0}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Avg Expense</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboard.categoryBreakdown && dashboard.categoryBreakdown.length > 0
                ? `$${Math.round(
                    dashboard.totalExpenses / 100 / dashboard.categoryBreakdown.reduce((acc, c) => acc + c.count, 0)
                  )}`
                : '$0'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
