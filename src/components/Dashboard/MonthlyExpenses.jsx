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
  // Note: old transactions may not have 'type' field, treat them as expenses
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
    <div className="bg-white rounded-card shadow-raised p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-neutral-5 mb-4 tracking-tight">
          This Month's Summary
        </h2>

        {/* Monthly Overview */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-neutral-50 mb-1 font-medium">Income</p>
            <p className="text-base font-bold text-brand-green tracking-tight">+{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <p className="text-xs text-neutral-50 mb-1 font-medium">Expenses</p>
            <p className="text-base font-bold text-brand-red tracking-tight">-{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-neutral-90 rounded-lg p-3 border border-neutral-80">
            <p className="text-xs text-neutral-50 mb-1 font-medium">Net</p>
            <p className={`text-base font-bold tracking-tight ${netAmount >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
              {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      {sortedCategories.length > 0 && (
        <div className="pt-5 border-t border-neutral-80">
          <h3 className="text-sm font-semibold text-neutral-20 mb-4">Expense Breakdown</h3>
          <div className="space-y-4">
            {sortedCategories.map(([category, amount]) => {
              const percentage = (amount / totalExpenses) * 100;

              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-20">{category}</span>
                    <span className="text-sm font-semibold text-neutral-5">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-neutral-90 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-red h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-50 mt-1">{percentage.toFixed(1)}% of expenses</p>
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
