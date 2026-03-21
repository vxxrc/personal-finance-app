import { useState } from 'react';
import { Save, LogOut } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { profile, updateProfile, loading } = useProfile();
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const InputField = ({ label, field }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">₹</span>
        <input
          type="number"
          step="0.01"
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-600"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your account</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {/* Financial Accounts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-base font-semibold text-white mb-6">
            Financial Accounts
          </h2>

          <div className="space-y-4">
            <InputField label="Bank Balance" field="bankBalance" />
            <InputField label="Stocks Value" field="stocksValue" />
            <InputField label="Crypto Value" field="cryptoValue" />
            <InputField label="Credit Card Due" field="creditCardDue" />
            <InputField label="Monthly Salary" field="monthlySalary" />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Account Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-base font-semibold text-white mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-black border border-zinc-800 rounded-lg">
              <p className="text-xs text-zinc-500">Logged in as</p>
              <p className="text-sm text-white mt-1">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
