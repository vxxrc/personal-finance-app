import { Trash2, ShoppingBag, Coffee, Car, Home, Zap, TrendingUp, Bitcoin } from 'lucide-react';
import { formatCurrency } from '../../services/calculations';
import { format, isToday } from 'date-fns';

const CATEGORY_ICONS = {
  Groceries: ShoppingBag,
  Dining: Coffee,
  Coffee: Coffee,
  Transportation: Car,
  Rent: Home,
  Utilities: Zap,
  Stocks: TrendingUp,
  Crypto: Bitcoin,
};

const ExpenseList = ({ expenses, onDelete }) => {
  // Filter today's expenses
  const todayExpenses = expenses.filter(exp => isToday(new Date(exp.date)));

  // Calculate total for today
  const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (todayExpenses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Today's Expenses
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No expenses logged today
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Today's Expenses
        </h2>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(todayTotal)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {todayExpenses.map((expense) => {
          const Icon = CATEGORY_ICONS[expense.subCategory] || ShoppingBag;

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white">
                    {expense.subCategory}
                  </p>
                  {expense.note && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {expense.note}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(expense.date), 'h:mm a')} • {expense.paymentMethod === 'credit' ? 'Credit Card' : 'Bank'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-gray-800 dark:text-white">
                  {formatCurrency(expense.amount)}
                </p>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;
