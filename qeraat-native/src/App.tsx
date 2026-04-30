import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './hooks/useLocale';
import { ThemeProvider } from './hooks/useTheme';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AyaPage from './pages/AyaPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoadingScreen from './components/LoadingScreen';
import { useState } from 'react';
import './index.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
    <LocaleProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
          <LoadingScreen />
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Page content — pushed below the fixed TopBar */}
          <div style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)',
          }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/aya/:index" element={<AyaPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </LocaleProvider>
    </ThemeProvider>
  );
}
