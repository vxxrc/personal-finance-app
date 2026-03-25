import { Wallet, TrendingUp, CreditCard, Bitcoin } from 'lucide-react';
import { formatCurrency } from '../../services/calculations';
import { useAuth } from '../../contexts/AuthContext';

const NetWorthCard = ({ profile }) => {
  const { numbersHidden } = useAuth();

  if (!profile) return null;

  const { bankBalance = 0, stocksValue = 0, cryptoValue = 0, creditCardDue = 0 } = profile;
  const netWorth = bankBalance + stocksValue + cryptoValue - creditCardDue;

  const items = [
    { label: 'Bank', value: bankBalance, icon: Wallet, color: 'text-blue-600' },
    { label: 'Stocks', value: stocksValue, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Crypto', value: cryptoValue, icon: Bitcoin, color: 'text-orange-600' },
    { label: 'Credit Due', value: creditCardDue, icon: CreditCard, color: 'text-red-600', negative: true },
  ];

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
      {/* Net Worth Display */}
      <div className="text-center mb-6">
        <p className="text-sm text-zinc-400 mb-1">Net Worth</p>
        <h1 className={`text-4xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(netWorth, numbersHidden)}
        </h1>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-4">
        {items.map(({ label, value, icon: Icon, color, negative }) => (
          <div key={label} className="bg-black rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-xs text-zinc-300">{label}</span>
            </div>
            <p className={`text-xl font-semibold ${negative ? 'text-red-600' : 'text-white'}`}>
              {formatCurrency(value, numbersHidden)}
            </p>
          </div>
        ))}
      </div>

      {/* Calculation Helper */}
      <div className="mt-4 p-3 bg-black/50 rounded-lg border border-zinc-800">
        <p className="text-xs text-zinc-400 text-center">
          Net Worth = Bank + Stocks + Crypto - Credit Due
        </p>
      </div>
    </div>
  );
};

export default NetWorthCard;
