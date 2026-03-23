import { useState } from 'react';
import { Plus } from 'lucide-react';
import NetWorthCard from '../NetWorthCard/NetWorthCard';
import GoalTracker from '../GoalTracker/GoalTracker';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import ExpenseList from './ExpenseList';
import MonthlyExpenses from './MonthlyExpenses';
import { useProfile } from '../../hooks/useProfile';
import { useExpenses } from '../../hooks/useExpenses';
import { useGoals } from '../../hooks/useGoals';
import { calculateNetWorth } from '../../services/calculations';

const Dashboard = () => {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const { profile, updateProfile, refreshProfile } = useProfile();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { goals } = useGoals();

  const netWorth = calculateNetWorth(profile);

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
      updates.bankBalance = (profile.bankBalance || 0) + expenseData.amount;
    }
    // Handle EXPENSE
    else {
      // Handle investments separately (always from bank, goes to stocks/crypto)
      if (expenseData.category === 'Investments') {
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

    // Handle INCOME deletion
    if (expense.type === 'income') {
      updates.bankBalance = (profile.bankBalance || 0) - expense.amount;
    }
    // Handle EXPENSE deletion
    else {
      // Reverse investment updates (add back to bank, remove from stocks/crypto)
      if (expense.category === 'Investments') {
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
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-white">Finance</h1>
          <p className="text-sm text-zinc-400 mt-1">Dashboard</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <NetWorthCard profile={profile} />
        <MonthlyExpenses expenses={expenses} />
        <GoalTracker goals={goals} netWorth={netWorth} />
        <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} onEdit={handleEditExpense} />
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setEditingExpense(null);
          setIsExpenseFormOpen(true);
        }}
        className="fixed bottom-20 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-colors z-40"
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
