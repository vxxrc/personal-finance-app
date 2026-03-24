import { useState } from 'react';
import { Home, Target, TrendingUp, Settings, Eye, EyeOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PasswordModal from '../PasswordModal/PasswordModal';

const Navigation = () => {
  const location = useLocation();
  const { numbersHidden, hideNumbers, verifyPasswordAndShow } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/investments', icon: TrendingUp, label: 'Investments' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handlePrivacyToggle = () => {
    if (numbersHidden) {
      // Show password modal to verify
      setIsPasswordModalOpen(true);
    } else {
      // Hide numbers immediately
      hideNumbers();
    }
  };

  const handlePasswordVerify = async (password) => {
    await verifyPasswordAndShow(password);
  };

  return (
    <>
      {/* Desktop Navigation - Top horizontal */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-white">Personal Finance</h1>
            <div className="flex items-center gap-3">
              {/* Privacy Toggle Button */}
              <button
                onClick={handlePrivacyToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  numbersHidden
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
                title={numbersHidden ? 'Numbers hidden - click to show' : 'Hide numbers'}
              >
                {numbersHidden ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {numbersHidden ? 'Hidden' : 'Hide'}
                </span>
              </button>

              {/* Navigation Links */}
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {/* Privacy Toggle Button */}
            <button
              onClick={handlePrivacyToggle}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                numbersHidden
                  ? 'text-red-400'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {numbersHidden ? (
                <EyeOff className="w-6 h-6 mb-1" />
              ) : (
                <Eye className="w-6 h-6 mb-1" />
              )}
              <span className="text-xs font-medium">
                {numbersHidden ? 'Hidden' : 'Hide'}
              </span>
            </button>

            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    isActive
                      ? 'text-emerald-600'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onVerify={handlePasswordVerify}
      />
    </>
  );
};

export default Navigation;
