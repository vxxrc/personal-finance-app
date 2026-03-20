import { useState } from 'react';
import { Plus } from 'lucide-react';
import NetWorthCard from '../NetWorthCard/NetWorthCard';
import GoalTracker from '../GoalTracker/GoalTracker';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import ExpenseList from './ExpenseList';
import { useProfile } from '../../hooks/useProfile';
import { useExpenses } from '../../hooks/useExpenses';
import { useGoals } from '../../hooks/useGoals';
import { calculateNetWorth } from '../../services/calculations';

const Dashboard = () => {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  const { profile, updateProfile } = useProfile();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { goals } = useGoals();

  const netWorth = calculateNetWorth(profile);

  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(expenseData);

      // Update profile based on payment method and category
      if (profile) {
        const updates = {};

        if (expenseData.paymentMethod === 'bank') {
          updates.bankBalance = (profile.bankBalance || 0) - expenseData.amount;
        } else if (expenseData.paymentMethod === 'credit') {
          updates.creditCardDue = (profile.creditCardDue || 0) + expenseData.amount;
        }

        // Handle investments separately
        if (expenseData.category === 'Investments') {
          updates.bankBalance = (profile.bankBalance || 0) - expenseData.amount;

          if (expenseData.subCategory === 'Stocks') {
            updates.stocksValue = (profile.stocksValue || 0) + expenseData.amount;
          } else if (expenseData.subCategory === 'Crypto') {
            updates.cryptoValue = (profile.cryptoValue || 0) + expenseData.amount;
          }
        }

        if (Object.keys(updates).length > 0) {
          await updateProfile(updates);
        }
      }

      setIsExpenseFormOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Delete this expense?')) return;

    try {
      const expense = expenses.find(exp => exp.id === expenseId);
      if (!expense || !profile) return;

      await deleteExpense(expenseId);

      // Reverse the profile updates
      const updates = {};

      if (expense.paymentMethod === 'bank') {
        updates.bankBalance = (profile.bankBalance || 0) + expense.amount;
      } else if (expense.paymentMethod === 'credit') {
        updates.creditCardDue = (profile.creditCardDue || 0) - expense.amount;
      }

      // Reverse investment updates
      if (expense.category === 'Investments') {
        updates.bankBalance = (profile.bankBalance || 0) + expense.amount;

        if (expense.subCategory === 'Stocks') {
          updates.stocksValue = (profile.stocksValue || 0) - expense.amount;
        } else if (expense.subCategory === 'Crypto') {
          updates.cryptoValue = (profile.cryptoValue || 0) - expense.amount;
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Personal Finance</h1>
          <p className="text-blue-100">Track your wealth journey</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <NetWorthCard profile={profile} />
        <GoalTracker goals={goals} netWorth={netWorth} />
        <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsExpenseFormOpen(true)}
        className="fixed bottom-20 right-6 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  );
};

export default Dashboard;
