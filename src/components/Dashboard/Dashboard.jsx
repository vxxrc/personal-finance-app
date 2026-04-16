import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, Wallet, TrendingDown, Target, Receipt } from 'lucide-react';
import NetWorthCard from '../NetWorthCard/NetWorthCard';
import GoalTracker from '../GoalTracker/GoalTracker';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import ExpenseList from './ExpenseList';
import MonthlyExpenses from './MonthlyExpenses';
import { useProfile } from '../../hooks/useProfile';
import { useExpenses } from '../../hooks/useExpenses';
import { useGoals } from '../../hooks/useGoals';
import { calculateNetWorth, formatCurrency } from '../../services/calculations';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const { profile, updateProfile, refreshProfile } = useProfile();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { goals } = useGoals();
  const { numbersHidden } = useAuth();

  const netWorth = calculateNetWorth(profile);

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    if (!expenses) return { income: 0, expense: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const income = monthlyExpenses
      .filter(exp => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const expense = monthlyExpenses
      .filter(exp => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);

    return { income, expense };
  }, [expenses]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        // EDIT MODE: Calculate difference and update
        const oldExpense = editingExpense;

        // First, reverse the old transaction's effect
        await reverseTransactionEffect(oldExpense);

        // Then apply the new transaction
        await updateExpense(editingExpense.id, expenseData);
        await applyTransactionEffect(expenseData);

        setEditingExpense(null);
      } else {
        // ADD MODE: Add new expense
        await addExpense(expenseData);
        await applyTransactionEffect(expenseData);
      }

      setIsExpenseFormOpen(false);
    } catch (error) {
      console.error('Error adding/updating transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const applyTransactionEffect = async (expenseData) => {
    if (!profile) return;

    const updates = {};

    // Handle INCOME
    if (expenseData.type === 'income') {
      // Check payment method for income too
      if (expenseData.paymentMethod === 'bank') {
        updates.bankBalance = (profile.bankBalance || 0) + expenseData.amount;
      } else if (expenseData.paymentMethod === 'credit') {
        // Income to credit card reduces the amount due
        updates.creditCardDue = (profile.creditCardDue || 0) - expenseData.amount;
      }
    }
    // Handle EXPENSE
    else {
      // Handle credit card payment (money from bank to pay credit card)
      if (expenseData.subCategory === 'Credit Card Payment') {
        updates.bankBalance = (profile.bankBalance || 0) - expenseData.amount;
        updates.creditCardDue = Math.max((profile.creditCardDue || 0) - expenseData.amount, 0);
      }
      // Handle investments separately (always from bank, goes to stocks/crypto)
      else if (expenseData.category === 'Investments') {
        updates.bankBalance = (profile.bankBalance || 0) - expenseData.amount;

        if (expenseData.subCategory === 'Stocks') {
          updates.stocksValue = (profile.stocksValue || 0) + expenseData.amount;
        } else if (expenseData.subCategory === 'Crypto') {
          updates.cryptoValue = (profile.cryptoValue || 0) + expenseData.amount;
        }
      }
      // Handle regular expenses
      else {
        if (expenseData.paymentMethod === 'bank') {
          updates.bankBalance = (profile.bankBalance || 0) - expenseData.amount;
        } else if (expenseData.paymentMethod === 'credit') {
          updates.creditCardDue = (profile.creditCardDue || 0) + expenseData.amount;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateProfile(updates);
      // Refresh profile to get latest data from Firestore
      await refreshProfile();
    }
  };

  const reverseTransactionEffect = async (expense) => {
    if (!profile) return;

    const updates = {};

    // Handle INCOME deletion/reversal
    if (expense.type === 'income') {
      // Check payment method for income reversal too
      if (expense.paymentMethod === 'bank') {
        updates.bankBalance = (profile.bankBalance || 0) - expense.amount;
      } else if (expense.paymentMethod === 'credit') {
        // Reversing income from credit card increases the amount due
        updates.creditCardDue = (profile.creditCardDue || 0) + expense.amount;
      }
    }
    // Handle EXPENSE deletion/reversal
    else {
      // Reverse credit card payment (add back to bank, increase credit card due)
      if (expense.subCategory === 'Credit Card Payment') {
        updates.bankBalance = (profile.bankBalance || 0) + expense.amount;
        updates.creditCardDue = (profile.creditCardDue || 0) + expense.amount;
      }
      // Reverse investment updates (add back to bank, remove from stocks/crypto)
      else if (expense.category === 'Investments') {
        updates.bankBalance = (profile.bankBalance || 0) + expense.amount;

        if (expense.subCategory === 'Stocks') {
          updates.stocksValue = (profile.stocksValue || 0) - expense.amount;
        } else if (expense.subCategory === 'Crypto') {
          updates.cryptoValue = (profile.cryptoValue || 0) - expense.amount;
        }
      }
      // Reverse regular expenses
      else {
        if (expense.paymentMethod === 'bank') {
          updates.bankBalance = (profile.bankBalance || 0) + expense.amount;
        } else if (expense.paymentMethod === 'credit') {
          updates.creditCardDue = (profile.creditCardDue || 0) - expense.amount;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateProfile(updates);
      // Refresh profile to get latest data from Firestore
      await refreshProfile();
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Delete this transaction?')) return;

    try {
      const expense = expenses.find(exp => exp.id === expenseId);
      if (!expense || !profile) return;

      await deleteExpense(expenseId);
      await reverseTransactionEffect(expense);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setIsExpenseFormOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0 md:pt-16">
      {/* Header - Mobile only */}
      <div className="md:hidden bg-zinc-900 border-b border-zinc-800 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-white">Finance</h1>
          <p className="text-sm text-zinc-400 mt-1">Dashboard</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        {/* Summary Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Net Worth Box */}
          <div
            onClick={() => toggleSection('networth')}
            className={`bg-zinc-900 rounded-2xl border border-zinc-800 p-6 cursor-pointer transition-all hover:border-emerald-600 ${
              expandedSection === 'networth' ? 'md:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">Net Worth</h3>
              </div>
              {expandedSection === 'networth' ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            {expandedSection === 'networth' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <NetWorthCard profile={profile} />
              </div>
            ) : (
              <div className="text-3xl font-bold text-emerald-600">
                {formatCurrency(netWorth, numbersHidden)}
              </div>
            )}
          </div>

          {/* Monthly Summary Box */}
          <div
            onClick={() => toggleSection('monthly')}
            className={`bg-zinc-900 rounded-2xl border border-zinc-800 p-6 cursor-pointer transition-all hover:border-emerald-600 ${
              expandedSection === 'monthly' ? 'md:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">Monthly Summary</h3>
              </div>
              {expandedSection === 'monthly' ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            {expandedSection === 'monthly' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <MonthlyExpenses expenses={expenses} />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Income</span>
                  <span className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(monthlySummary.income, numbersHidden)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Expenses</span>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(monthlySummary.expense, numbersHidden)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Goals Box */}
          <div
            onClick={() => toggleSection('goals')}
            className={`bg-zinc-900 rounded-2xl border border-zinc-800 p-6 cursor-pointer transition-all hover:border-emerald-600 ${
              expandedSection === 'goals' ? 'md:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">Goals</h3>
              </div>
              {expandedSection === 'goals' ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            {expandedSection === 'goals' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <GoalTracker goals={goals} netWorth={netWorth} />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">
                  {goals?.length || 0}
                </div>
                <div className="text-sm text-zinc-400">Active Goals</div>
              </div>
            )}
          </div>

          {/* Transactions Box */}
          <div
            onClick={() => toggleSection('transactions')}
            className={`bg-zinc-900 rounded-2xl border border-zinc-800 p-6 cursor-pointer transition-all hover:border-emerald-600 ${
              expandedSection === 'transactions' ? 'md:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Receipt className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
              </div>
              {expandedSection === 'transactions' ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            {expandedSection === 'transactions' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} onEdit={handleEditExpense} />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-600">
                  {expenses?.length || 0}
                </div>
                <div className="text-sm text-zinc-400">Total Transactions</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setEditingExpense(null);
          setIsExpenseFormOpen(true);
        }}
        className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-colors z-40 shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddExpense}
        editingExpense={editingExpense}
      />
    </div>
  );
};

export default Dashboard;
