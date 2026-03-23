import { Trash2, Edit2, ShoppingBag, Coffee, Car, Home, Zap, TrendingUp, Bitcoin, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatCurrency } from '../../services/calculations';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

const CATEGORY_ICONS = {
  Groceries: ShoppingBag,
  Dining: Coffee,
  Coffee: Coffee,
  Transportation: Car,
  Rent: Home,
  Utilities: Zap,
  Stocks: TrendingUp,
  Crypto: Bitcoin,
  Income: DollarSign,
};

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
  // Sort transactions by date (newest first) and take last 10
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // Calculate totals for today
  const todayTransactions = expenses.filter(exp => isToday(new Date(exp.date)));
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpenses = todayTransactions
    .filter(t => t.type !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayNet = todayIncome - todayExpenses;

  if (recentTransactions.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Transactions
        </h2>
        <p className="text-zinc-400 text-center py-8">
          No transactions logged yet
        </p>
      </div>
    );
  }

  const getDateLabel = (date) => {
    const dateObj = new Date(date);
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    if (isThisWeek(dateObj)) return format(dateObj, 'EEEE');
    return format(dateObj, 'MMM dd');
  };

  return (
    <div className="bg-white rounded-card shadow-raised p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-neutral-5 mb-4 tracking-tight">
          Recent Transactions
        </h2>

        {/* Today's Summary - only show if there are transactions today */}
        {todayTransactions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-neutral-80">
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <p className="text-xs text-neutral-50 mb-1 font-medium">Today Income</p>
              <p className="text-sm font-bold text-brand-green tracking-tight">+{formatCurrency(todayIncome)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-xs text-neutral-50 mb-1 font-medium">Today Expenses</p>
              <p className="text-sm font-bold text-brand-red tracking-tight">-{formatCurrency(todayExpenses)}</p>
            </div>
            <div className="bg-neutral-90 rounded-lg p-3 border border-neutral-80">
              <p className="text-xs text-neutral-50 mb-1 font-medium">Today Net</p>
              <p className={`text-sm font-bold tracking-tight ${todayNet >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                {todayNet >= 0 ? '+' : ''}{formatCurrency(todayNet)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {recentTransactions.map((transaction) => {
          const isIncome = transaction.type === 'income';
          const Icon = CATEGORY_ICONS[transaction.subCategory] || (isIncome ? DollarSign : ShoppingBag);

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between bg-neutral-90 rounded-lg p-3 hover:bg-neutral-85 hover:shadow-flat transition-all border border-neutral-80"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                  <Icon className={`w-4 h-4 ${isIncome ? 'text-brand-green' : 'text-brand-red'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-5">
                    {transaction.subCategory}
                  </p>
                  {transaction.note && (
                    <p className="text-xs text-neutral-40 truncate">
                      {transaction.note}
                    </p>
                  )}
                  <p className="text-xs text-neutral-50 mt-0.5">
                    {getDateLabel(transaction.date)} • {format(new Date(transaction.date), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${isIncome ? 'text-brand-green' : 'text-brand-red'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 text-neutral-50 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-2 text-neutral-50 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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
