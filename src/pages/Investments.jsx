import { TrendingUp, Bitcoin, PieChart } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { formatCurrency } from '../services/calculations';

const Investments = () => {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const totalInvestments = (profile.stocksValue || 0) + (profile.cryptoValue || 0);
  const stocksPercentage = totalInvestments > 0 ? (profile.stocksValue / totalInvestments) * 100 : 50;
  const cryptoPercentage = totalInvestments > 0 ? (profile.cryptoValue / totalInvestments) * 100 : 50;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-1">Investments</h1>
          <p className="text-zinc-400">Track your portfolio</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Total Portfolio Value */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PieChart className="w-6 h-6 text-emerald-600" />
              <p className="text-sm text-zinc-400">Total Portfolio</p>
            </div>
            <h2 className="text-4xl font-bold text-white">
              {formatCurrency(totalInvestments)}
            </h2>
          </div>
        </div>

        {/* Investment Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Portfolio Breakdown
          </h3>

          {/* Stocks */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-white">Stocks</span>
              </div>
              <span className="text-zinc-400">
                {stocksPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${stocksPercentage}%` }}
              />
            </div>
            <p className="text-right text-lg font-semibold text-white">
              {formatCurrency(profile.stocksValue || 0)}
            </p>
          </div>

          {/* Crypto */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-white">Crypto</span>
              </div>
              <span className="text-zinc-400">
                {cryptoPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
              <div
                className="bg-orange-500 h-full rounded-full"
                style={{ width: `${cryptoPercentage}%` }}
              />
            </div>
            <p className="text-right text-lg font-semibold text-white">
              {formatCurrency(profile.cryptoValue || 0)}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-3">
            How to track investments
          </h3>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• When you buy stocks/crypto, add it as an expense with category "Investments"</li>
            <li>• This will deduct from your bank and add to your investment value</li>
            <li>• Update total values in Settings when prices change</li>
            <li>• Your net worth includes all investment values</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Investments;
