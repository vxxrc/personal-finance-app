import { formatCurrency } from '../../services/calculations';
import { format } from 'date-fns';

const MonthlyExpenses = ({ expenses }) => {
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter transactions for current month
  const monthlyTransactions = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  // Separate income and expenses
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income');
  const monthlyExpenses = monthlyTransactions.filter(t => t.type !== 'income');

  // Calculate totals
  const totalIncome = monthlyIncome.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netAmount = totalIncome - totalExpenses;

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

  if (monthlyTransactions.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
        <h2 className="text-base font-semibold text-white mb-3">
          This Month's Summary
        </h2>
        <p className="text-zinc-400 text-center py-8 text-sm">
          No transactions this month
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white mb-3">
          This Month's Summary
        </h2>

        {/* Monthly Overview */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-black rounded-lg p-2.5 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-0.5">Income</p>
            <p className="text-sm font-semibold text-emerald-500">+{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-black rounded-lg p-2.5 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-0.5">Expenses</p>
            <p className="text-sm font-semibold text-red-500">-{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-black rounded-lg p-2.5 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-0.5">Net</p>
            <p className={`text-sm font-semibold ${netAmount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      {sortedCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Expense Breakdown</h3>
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
                  <p className="text-xs text-zinc-500 mt-0.5">{percentage.toFixed(1)}% of expenses</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpenses;
