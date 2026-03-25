import { Trash2, Edit2, ShoppingBag, Coffee, Car, Home, Zap, TrendingUp, Bitcoin, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
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
  const { numbersHidden } = useAuth();

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
    <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white mb-3">
          Recent Transactions
        </h2>

        {/* Today's Summary - only show if there are transactions today */}
        {todayTransactions.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-black rounded-lg p-2.5 border border-zinc-800">
              <p className="text-xs text-zinc-400 mb-0.5">Today Income</p>
              <p className="text-sm font-semibold text-emerald-500">+{formatCurrency(todayIncome, numbersHidden)}</p>
            </div>
            <div className="bg-black rounded-lg p-2.5 border border-zinc-800">
              <p className="text-xs text-zinc-400 mb-0.5">Today Expenses</p>
              <p className="text-sm font-semibold text-red-500">-{formatCurrency(todayExpenses, numbersHidden)}</p>
            </div>
            <div className="bg-black rounded-lg p-2.5 border border-zinc-800">
              <p className="text-xs text-zinc-400 mb-0.5">Today Net</p>
              <p className={`text-sm font-semibold ${todayNet >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {todayNet >= 0 ? '+' : ''}{formatCurrency(todayNet, numbersHidden)}
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
              className="flex items-center justify-between bg-black rounded-lg p-3 hover:bg-zinc-800 transition-colors border border-zinc-800"
            >
              <div className="flex items-center gap-2.5 flex-1">
                <div className={`p-1.5 rounded-lg ${isIncome ? 'bg-emerald-900/30' : 'bg-red-900/30'}`}>
                  <Icon className={`w-4 h-4 ${isIncome ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {transaction.subCategory}
                  </p>
                  {transaction.note && (
                    <p
                      className="text-xs text-zinc-400 line-clamp-2 break-words"
                      title={transaction.note}
                    >
                      {transaction.note}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500">
                    {getDateLabel(transaction.date)} • {format(new Date(transaction.date), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, numbersHidden)}
                </p>
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-1.5 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-900/20 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
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
