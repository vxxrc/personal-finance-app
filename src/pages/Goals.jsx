import { useState } from 'react';
import { Plus, Target, Trash2, Edit2 } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useProfile } from '../hooks/useProfile';
import { calculateNetWorth, calculateGoalProgress, calculateMonthlySavingsNeeded, formatCurrency } from '../services/calculations';
import { format } from 'date-fns';

const Goals = () => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Financial Goals</h1>
          <p className="text-blue-100">Set and track your targets</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
            <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by adding your first financial goal
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Target: {format(new Date(goal.targetDate), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatCurrency(currentAmount)}
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-2">
                    {goal.monthlyInvestment > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <p className="text-sm text-green-900 dark:text-green-300">
                          ✓ Already investing <strong>{formatCurrency(goal.monthlyInvestment)}/month</strong>
                        </p>
                      </div>
                    )}
                    {monthlySavings > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-blue-900 dark:text-blue-300">
                          💡 {goal.monthlyInvestment > 0 ? 'Additionally save' : 'Save'} <strong>{formatCurrency(monthlySavings)}/month</strong> to reach this goal on time
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {editingGoal ? 'Edit Goal' : 'New Goal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="e.g., Save for vacation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Investment (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyInvestment}
                  onChange={(e) => setFormData({ ...formData, monthlyInvestment: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="0.00 (Optional - if you invest regularly)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter amount if you already invest regularly towards this goal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'short-term' })}
                    className={`flex-1 py-3 rounded-xl font-medium ${
                      formData.type === 'short-term'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Short-term
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'long-term' })}
                    className={`flex-1 py-3 rounded-xl font-medium ${
                      formData.type === 'long-term'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
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
                  className="w-5 h-5 text-blue-500 rounded"
                />
                <label htmlFor="useNetWorth" className="text-sm text-gray-700 dark:text-gray-300">
                  Track against total net worth
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl"
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
          className="fixed bottom-20 right-6 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default Goals;
