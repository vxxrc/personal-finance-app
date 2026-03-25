import { useState, useEffect, useMemo } from 'react';
import { Save, LogOut, Calendar, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../services/calculations';
import { format, startOfWeek, startOfMonth, isAfter } from 'date-fns';

// Move InputField outside to prevent recreation on every render
const InputField = ({ label, field, value, onChange, hidden }) => (
  <div>
    <label className="block text-sm font-medium text-zinc-300 mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">₹</span>
      <input
        type={hidden ? "text" : "number"}
        step="0.01"
        value={hidden ? "••••••" : value}
        onChange={onChange}
        readOnly={hidden}
        className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-600 disabled:opacity-50"
        title={hidden ? "Disable privacy mode to edit" : ""}
      />
    </div>
  </div>
);

const Settings = () => {
  const { profile, updateProfile, loading } = useProfile();
  const { expenses } = useExpenses();
  const { logout, user, numbersHidden } = useAuth();

  const [formData, setFormData] = useState({
    bankBalance: 0,
    stocksValue: 0,
    cryptoValue: 0,
    creditCardDue: 0,
    monthlySalary: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month'); // 'week', 'month', 'all'
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'insights'

  // Sync formData with profile when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        bankBalance: profile.bankBalance || 0,
        stocksValue: profile.stocksValue || 0,
        cryptoValue: profile.cryptoValue || 0,
        creditCardDue: profile.creditCardDue || 0,
        monthlySalary: profile.monthlySalary || 0,
      });
    }
  }, [profile]);

  // Filter transactions by time period
  const filteredTransactions = useMemo(() => {
    if (!expenses) return [];

    const now = new Date();
    let startDate;

    if (timeFilter === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
    } else if (timeFilter === 'month') {
      startDate = startOfMonth(now);
    } else {
      return expenses; // All transactions
    }

    return expenses.filter(expense =>
      isAfter(new Date(expense.date), startDate)
    );
  }, [expenses, timeFilter]);

  // Calculate spending analysis
  const spendingAnalysis = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');

    // Total spending by category
    const categoryTotals = {};
    expenseTransactions.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    // Sort categories by spending
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Calculate totals
    const totalExpenses = expenseTransactions.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomeTransactions.reduce((sum, exp) => sum + exp.amount, 0);

    // Average daily spending
    const daysInPeriod = timeFilter === 'week' ? 7 : timeFilter === 'month' ? 30 : 365;
    const avgDailySpending = totalExpenses / daysInPeriod;

    return {
      topCategories,
      totalExpenses,
      totalIncome,
      avgDailySpending,
      netCashFlow: totalIncome - totalExpenses,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions, timeFilter]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0 md:pt-16">
      {/* Header - Mobile only */}
      <div className="md:hidden bg-zinc-900 border-b border-zinc-800 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your account & view insights</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 md:flex-initial md:px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            Account Settings
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 md:flex-initial md:px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'insights'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            Recent Transactions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Financial Accounts */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-6">
                Financial Accounts
              </h2>

              <div className="space-y-4">
                <InputField
                  label="Bank Balance"
                  field="bankBalance"
                  value={formData.bankBalance}
                  onChange={(e) => handleChange('bankBalance', e.target.value)}
                  hidden={numbersHidden}
                />
                <InputField
                  label="Stocks Value"
                  field="stocksValue"
                  value={formData.stocksValue}
                  onChange={(e) => handleChange('stocksValue', e.target.value)}
                  hidden={numbersHidden}
                />
                <InputField
                  label="Crypto Value"
                  field="cryptoValue"
                  value={formData.cryptoValue}
                  onChange={(e) => handleChange('cryptoValue', e.target.value)}
                  hidden={numbersHidden}
                />
                <InputField
                  label="Credit Card Due"
                  field="creditCardDue"
                  value={formData.creditCardDue}
                  onChange={(e) => handleChange('creditCardDue', e.target.value)}
                  hidden={numbersHidden}
                />
                <InputField
                  label="Monthly Salary"
                  field="monthlySalary"
                  value={formData.monthlySalary}
                  onChange={(e) => handleChange('monthlySalary', e.target.value)}
                  hidden={numbersHidden}
                />
              </div>

              {/* Privacy Mode Notice */}
              {numbersHidden && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-xs text-red-400">
                    Privacy mode is active. Disable it to edit account settings.
                  </p>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving || numbersHidden}
                className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Account Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-4">
                Account
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-black border border-zinc-800 rounded-lg">
                  <p className="text-xs text-zinc-500">Logged in as</p>
                  <p className="text-sm text-white mt-1">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <>
            {/* Spending Analysis */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-semibold text-white">
                  Spending Analysis
                </h2>
                <Calendar className="w-5 h-5 text-zinc-400" />
              </div>

              {/* Time Filter */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    timeFilter === 'week'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    timeFilter === 'month'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    timeFilter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  All Time
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <p className="text-xs text-zinc-400">Total Expenses</p>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(spendingAnalysis.totalExpenses, numbersHidden)}
                  </p>
                </div>
                <div className="bg-black border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs text-zinc-400">Total Income</p>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(spendingAnalysis.totalIncome, numbersHidden)}
                  </p>
                </div>
              </div>

              {/* Net Cash Flow */}
              <div className="bg-black border border-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-400">Net Cash Flow</p>
                  <p className={`text-lg font-semibold ${
                    spendingAnalysis.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {spendingAnalysis.netCashFlow >= 0 ? '+' : ''}
                    {formatCurrency(Math.abs(spendingAnalysis.netCashFlow, numbersHidden))}
                  </p>
                </div>
              </div>

              {/* Average Daily Spending */}
              <div className="bg-black border border-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-400">Average Daily Spending</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(spendingAnalysis.avgDailySpending, numbersHidden)}
                  </p>
                </div>
              </div>

              {/* Top Spending Categories */}
              {spendingAnalysis.topCategories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-white">Top Spending Categories</h3>
                  </div>
                  <div className="space-y-3">
                    {spendingAnalysis.topCategories.map(([category, amount], index) => {
                      const percentage = (amount / spendingAnalysis.totalExpenses) * 100;
                      return (
                        <div key={category}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-zinc-300">{category}</span>
                            <span className="text-sm font-semibold text-white">
                              {formatCurrency(amount, numbersHidden)}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-zinc-500 mt-1 text-right">
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-4">
                Recent Transactions
              </h2>

              {filteredTransactions.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">
                  No transactions for this period
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 mb-3">
                    Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-center p-3 bg-black border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {transaction.subCategory || transaction.category}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {format(new Date(transaction.date), 'MMM dd, yyyy • h:mm a')}
                          </p>
                          {transaction.note && (
                            <p className="text-xs text-zinc-400 mt-1">{transaction.note}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount, numbersHidden)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {transaction.paymentMethod === 'credit' ? 'Credit Card' : 'Bank'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
