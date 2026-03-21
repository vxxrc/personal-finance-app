import { useState } from 'react';
import { Save, Moon, Sun, LogOut } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../services/calculations';

const Settings = () => {
  const { profile, updateProfile, loading } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  const [formData, setFormData] = useState({
    bankBalance: profile?.bankBalance || 0,
    stocksValue: profile?.stocksValue || 0,
    cryptoValue: profile?.cryptoValue || 0,
    creditCardDue: profile?.creditCardDue || 0,
    monthlySalary: profile?.monthlySalary || 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-blue-100">Update your financial profile</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-purple-500" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Financial Accounts */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Financial Accounts
          </h2>

          <div className="space-y-4">
            {/* Bank Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Balance (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.bankBalance}
                  onChange={(e) => handleChange('bankBalance', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Stocks Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stocks Value (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.stocksValue}
                  onChange={(e) => handleChange('stocksValue', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Crypto Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crypto Value (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cryptoValue}
                  onChange={(e) => handleChange('cryptoValue', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Credit Card Due */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credit Card Due (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.creditCardDue}
                  onChange={(e) => handleChange('creditCardDue', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Monthly Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Salary (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlySalary}
                  onChange={(e) => handleChange('monthlySalary', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Pro Tip
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            Update these values whenever you receive your salary, pay bills, or make investment changes.
            Your net worth will automatically update based on your daily expense logs.
          </p>
        </div>

        {/* Account Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
                <p className="font-medium text-gray-800 dark:text-white">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
