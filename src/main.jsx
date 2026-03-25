import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'

// Wrapper to hide loading screen after app mounts
function AppWithLoadingScreen() {
  useEffect(() => {
    // Hide loading screen after a short delay to ensure everything is rendered
    const timer = setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AppWithLoadingScreen />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
