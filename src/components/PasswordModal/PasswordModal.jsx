import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onVerify }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      await onVerify(password);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Incorrect password');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-white">Verify Password</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-zinc-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-zinc-400 mb-4">
            Enter your login password to show numbers
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 pr-12 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-600"
                placeholder="Enter your password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || isVerifying}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Show Numbers'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
