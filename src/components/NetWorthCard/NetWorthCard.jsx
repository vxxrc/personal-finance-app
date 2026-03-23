import { Wallet, TrendingUp, CreditCard, Bitcoin } from 'lucide-react';
import { formatCurrency } from '../../services/calculations';

const NetWorthCard = ({ profile }) => {
  if (!profile) return null;

  const { bankBalance = 0, stocksValue = 0, cryptoValue = 0, creditCardDue = 0 } = profile;
  const netWorth = bankBalance + stocksValue + cryptoValue - creditCardDue;

  const items = [
    { label: 'Bank', value: bankBalance, icon: Wallet, color: 'text-brand-blue', bgColor: 'bg-blue-50' },
    { label: 'Stocks', value: stocksValue, icon: TrendingUp, color: 'text-brand-green', bgColor: 'bg-green-50' },
    { label: 'Crypto', value: cryptoValue, icon: Bitcoin, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { label: 'Credit Due', value: creditCardDue, icon: CreditCard, color: 'text-brand-red', bgColor: 'bg-red-50', negative: true },
  ];

  return (
    <div className="bg-white rounded-card shadow-raised p-6">
      {/* Net Worth Display */}
      <div className="text-center mb-6 pb-6 border-b border-neutral-80">
        <p className="text-xs uppercase tracking-wide text-neutral-50 mb-2 font-medium">Total Net Worth</p>
        <h1 className={`text-5xl font-bold tracking-tight ${netWorth >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
          {formatCurrency(netWorth)}
        </h1>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ label, value, icon: Icon, color, bgColor, negative }) => (
          <div key={label} className="bg-neutral-90 rounded-lg p-4 border border-neutral-80 hover:shadow-flat transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${bgColor}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-xs text-neutral-40 font-medium">{label}</span>
            </div>
            <p className={`text-lg font-semibold tracking-tight ${negative ? 'text-brand-red' : 'text-neutral-5'}`}>
              {negative && value > 0 ? '-' : ''}{formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetWorthCard;
