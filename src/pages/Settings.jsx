import { useState, useEffect } from 'react';
import { Save, LogOut } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';

// Move InputField outside to prevent recreation on every render
const InputField = ({ label, field, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-neutral-20 mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-50">₹</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-70 rounded-lg text-neutral-5 font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>
  </div>
);

const Settings = () => {
  const { profile, updateProfile, loading } = useProfile();
  const { logout, user } = useAuth();

  const [formData, setFormData] = useState({
    bankBalance: 0,
    stocksValue: 0,
    cryptoValue: 0,
    creditCardDue: 0,
    monthlySalary: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync formData with profile when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        bankBalance: profile.bankBalance || 0,
        stocksValue: profile.stocksValue || 0,
        cryptoValue: profile.cryptoValue || 0,
        creditCardDue: profile.creditCardDue || 0,
        monthlySalary: profile.monthlySalary || 0,
      });
    }
  }, [profile]);

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

  return (
    <div className="min-h-screen bg-neutral-90 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-neutral-80 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-5 px-6 shadow-flat">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-neutral-5 tracking-tight">Settings</h1>
          <p className="text-sm text-neutral-50 mt-1">Manage your account & finances</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {/* Financial Accounts */}
        <div className="bg-white border border-neutral-80 rounded-card shadow-raised p-6">
          <h2 className="text-lg font-semibold text-neutral-5 mb-6 tracking-tight">
            Financial Accounts
          </h2>

          <div className="space-y-4">
            <InputField
              label="Bank Balance"
              field="bankBalance"
              value={formData.bankBalance}
              onChange={(e) => handleChange('bankBalance', e.target.value)}
            />
            <InputField
              label="Stocks Value"
              field="stocksValue"
              value={formData.stocksValue}
              onChange={(e) => handleChange('stocksValue', e.target.value)}
            />
            <InputField
              label="Crypto Value"
              field="cryptoValue"
              value={formData.cryptoValue}
              onChange={(e) => handleChange('cryptoValue', e.target.value)}
            />
            <InputField
              label="Credit Card Due"
              field="creditCardDue"
              value={formData.creditCardDue}
              onChange={(e) => handleChange('creditCardDue', e.target.value)}
            />
            <InputField
              label="Monthly Salary"
              field="monthlySalary"
              value={formData.monthlySalary}
              onChange={(e) => handleChange('monthlySalary', e.target.value)}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-6 py-3 bg-brand-green hover:bg-green-600 disabled:bg-neutral-80 text-white font-semibold rounded-lg transition-all shadow-flat hover:shadow-raised flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Account Section */}
        <div className="bg-white border border-neutral-80 rounded-card shadow-raised p-6">
          <h2 className="text-lg font-semibold text-neutral-5 mb-4 tracking-tight">
            Account
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-90 border border-neutral-80 rounded-lg">
              <p className="text-xs text-neutral-50 font-medium">Logged in as</p>
              <p className="text-sm text-neutral-5 mt-1 font-medium">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full py-3 bg-brand-red hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-flat hover:shadow-raised flex items-center justify-center gap-2"
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
