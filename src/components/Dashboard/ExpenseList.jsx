import { Trash2, ShoppingBag, Coffee, Car, Home, Zap, TrendingUp, Bitcoin, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
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
  Income: DollarSign,
};

const ExpenseList = ({ expenses, onDelete }) => {
  // Filter today's transactions
  const todayTransactions = expenses.filter(exp => isToday(new Date(exp.date)));

  // Calculate totals for today
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpenses = todayTransactions
    .filter(t => t.type !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayNet = todayIncome - todayExpenses;

  if (todayTransactions.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
        <h2 className="text-xl font-semibold text-white mb-4">
          Today's Transactions
        </h2>
        <p className="text-zinc-400 text-center py-8">
          No transactions logged today
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-3">
          Today's Transactions
        </h2>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black rounded-lg p-3 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-1">Income</p>
            <p className="text-sm font-semibold text-emerald-500">+{formatCurrency(todayIncome)}</p>
          </div>
          <div className="bg-black rounded-lg p-3 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-1">Expenses</p>
            <p className="text-sm font-semibold text-red-500">-{formatCurrency(todayExpenses)}</p>
          </div>
          <div className="bg-black rounded-lg p-3 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-1">Net</p>
            <p className={`text-sm font-semibold ${todayNet >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {todayNet >= 0 ? '+' : ''}{formatCurrency(todayNet)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {todayTransactions.map((transaction) => {
          const isIncome = transaction.type === 'income';
          const Icon = CATEGORY_ICONS[transaction.subCategory] || (isIncome ? DollarSign : ShoppingBag);

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between bg-black rounded-xl p-4 hover:bg-zinc-800 transition-colors border border-zinc-800"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${isIncome ? 'bg-emerald-900/30' : 'bg-red-900/30'}`}>
                  <Icon className={`w-5 h-5 ${isIncome ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">
                    {transaction.subCategory}
                  </p>
                  {transaction.note && (
                    <p className="text-sm text-zinc-400 truncate">
                      {transaction.note}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500">
                    {format(new Date(transaction.date), 'h:mm a')} • {transaction.paymentMethod === 'credit' ? 'Credit Card' : 'Bank'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-semibold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
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
