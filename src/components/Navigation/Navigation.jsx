import { Home, Target, TrendingUp, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/investments', icon: TrendingUp, label: 'Investments' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Desktop Navigation - Top horizontal */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-white">Personal Finance</h1>
            <div className="flex gap-1">
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
    </>
  );
};

export default Navigation;
