import { Target, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, calculateGoalProgress } from '../../services/calculations';
import { format, differenceInDays } from 'date-fns';

const GoalTracker = ({ goals, netWorth }) => {
  if (!goals || goals.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-white">Goals</h2>
        </div>
        <p className="text-zinc-400 text-center py-8">
          No goals set yet. Add your first goal to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-white">Goals</h2>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(
            goal.useNetWorth ? netWorth : goal.currentAmount,
            goal.targetAmount
          );
          const targetDate = new Date(goal.targetDate);
          const daysRemaining = differenceInDays(targetDate, new Date());
          const isShortTerm = goal.type === 'short-term';

          return (
            <div key={goal.id} className="bg-black rounded-xl p-4 border border-zinc-800">
              {/* Goal Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-white">{goal.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {formatCurrency(goal.useNetWorth ? netWorth : goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isShortTerm
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-purple-900 text-purple-300'
                }`}>
                  {isShortTerm ? 'Short-term' : 'Long-term'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress >= 100
                        ? 'bg-green-500'
                        : isShortTerm
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-right text-sm text-zinc-300 mt-1">
                  {progress.toFixed(1)}%
                </p>
              </div>

              {/* Goal Details */}
              <div className="flex justify-between text-sm text-zinc-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(targetDate, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {daysRemaining > 0
                      ? `${daysRemaining} days left`
                      : daysRemaining === 0
                      ? 'Due today!'
                      : 'Overdue'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTracker;
