import { formatCurrency } from '../../services/calculations';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const MonthlyExpenses = ({ expenses }) => {
  // Filter expenses for current month (exclude income)
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return exp.type !== 'income' && isWithinInterval(expDate, {
      start: currentMonthStart,
      end: currentMonthEnd
    });
  });

  // Calculate total
  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by main category
  const categoryBreakdown = monthlyExpenses.reduce((acc, exp) => {
    const category = exp.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += exp.amount;
    return acc;
  }, {});

  // Sort by amount (highest first)
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1]);

  if (monthlyExpenses.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
        <h2 className="text-base font-semibold text-white mb-3">
          This Month's Spending
        </h2>
        <p className="text-zinc-400 text-center py-8 text-sm">
          No expenses this month
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white mb-1">
          This Month's Spending
        </h2>
        <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
      </div>

      <div className="space-y-3">
        {sortedCategories.map(([category, amount]) => {
          const percentage = (amount / totalExpenses) * 100;

          return (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-white">{category}</span>
                <span className="text-sm font-semibold text-zinc-300">{formatCurrency(amount)}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{percentage.toFixed(1)}% of total</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyExpenses;
