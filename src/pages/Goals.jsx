import { useState } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { Plus, Target, Trash2, Edit2 } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useProfile } from '../hooks/useProfile';
import { calculateNetWorth, calculateGoalProgress, calculateMonthlySavingsNeeded, formatCurrency } from '../services/calculations';
import { format } from 'date-fns';

const Goals = () => {
  const { numbersHidden } = useAuth();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const { profile } = useProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const netWorth = calculateNetWorth(profile);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    type: 'short-term',
    useNetWorth: true,
    monthlyInvestment: '',
  });

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate.split('T')[0],
      type: goal.type,
      useNetWorth: goal.useNetWorth,
      monthlyInvestment: (goal.monthlyInvestment || 0).toString(),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        // Update existing goal
        await updateGoal(editingGoal.id, {
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          targetDate: new Date(formData.targetDate).toISOString(),
          type: formData.type,
          useNetWorth: formData.useNetWorth,
          monthlyInvestment: parseFloat(formData.monthlyInvestment) || 0,
        });
      } else {
        // Add new goal
        await addGoal({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          targetDate: new Date(formData.targetDate).toISOString(),
          type: formData.type,
          useNetWorth: formData.useNetWorth,
          currentAmount: formData.useNetWorth ? netWorth : 0,
          monthlyInvestment: parseFloat(formData.monthlyInvestment) || 0,
        });
      }
      setFormData({
        name: '',
        targetAmount: '',
        targetDate: '',
        type: 'short-term',
        useNetWorth: true,
        monthlyInvestment: '',
      });
      setEditingGoal(null);
      setIsFormOpen(false);
    } catch (error) {
      alert(editingGoal ? 'Failed to update goal' : 'Failed to add goal');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: '',
      type: 'short-term',
      useNetWorth: true,
      monthlyInvestment: '',
    });
    setEditingGoal(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await deleteGoal(goalId);
    } catch (error) {
      alert('Failed to delete goal');
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0 md:pt-16">
      {/* Header - Mobile only */}
      <div className="md:hidden bg-zinc-900 border-b border-zinc-800 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-1">Financial Goals</h1>
          <p className="text-zinc-400">Set and track your targets</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <Target className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No goals yet
            </h3>
            <p className="text-zinc-400 mb-4">
              Start by adding your first financial goal
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {goals.map((goal) => {
              const currentAmount = goal.useNetWorth ? netWorth : goal.currentAmount;
              const progress = calculateGoalProgress(currentAmount, goal.targetAmount);
              const monthlySavings = calculateMonthlySavingsNeeded(
                currentAmount,
                goal.targetAmount,
                new Date(goal.targetDate),
                goal.monthlyInvestment || 0
              );

              return (
                <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Target: {format(new Date(goal.targetDate), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">
                        {formatCurrency(currentAmount, numbersHidden)}
                      </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(goal.targetAmount, numbersHidden)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-3">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress >= 100 ? 'bg-emerald-600' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-right text-sm text-zinc-400 mt-1">
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-2">
                    {goal.monthlyInvestment > 0 && (
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                        <p className="text-sm text-zinc-300">
                          Already investing <strong className="text-white">{formatCurrency(goal.monthlyInvestment, numbersHidden)}/month</strong>
                        </p>
                      </div>
                    )}
                    {monthlySavings > 0 && (
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                        <p className="text-sm text-zinc-300">
                          {goal.monthlyInvestment > 0 ? 'Additionally save' : 'Save'} <strong className="text-white">{formatCurrency(monthlySavings, numbersHidden)}/month</strong> to reach this goal on time
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Goal Form */}
        {isFormOpen && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingGoal ? 'Edit Goal' : 'New Goal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-600"
                  placeholder="e.g., Save for vacation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-600"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Monthly Investment
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyInvestment}
                  onChange={(e) => setFormData({ ...formData, monthlyInvestment: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-600"
                  placeholder="0.00 (Optional - if you invest regularly)"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Enter amount if you already invest regularly towards this goal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Goal Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'short-term' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'short-term'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    Short-term
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'long-term' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'long-term'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    Long-term
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useNetWorth"
                  checked={formData.useNetWorth}
                  onChange={(e) => setFormData({ ...formData, useNetWorth: e.target.checked })}
                  className="w-5 h-5 bg-black border-zinc-700 rounded text-emerald-600 focus:ring-emerald-600"
                />
                <label htmlFor="useNetWorth" className="text-sm text-zinc-300">
                  Track against total net worth
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {!isFormOpen && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Goals;
