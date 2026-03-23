import { Home, Target, TrendingUp, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/investments', icon: TrendingUp, label: 'Invest' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-80 z-50 shadow-overlay pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  isActive
                    ? 'text-brand-green'
                    : 'text-neutral-50 hover:text-neutral-20'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs transition-all ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
