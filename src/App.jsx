import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './pages/Settings';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Auth from './pages/Auth';
import Navigation from './components/Navigation/Navigation';

function App() {
  const { user } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter basename="/personal-finance-app">
      <div className="min-h-screen bg-black">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
