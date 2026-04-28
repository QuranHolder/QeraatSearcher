import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './hooks/useLocale';
import { ThemeProvider } from './hooks/useTheme';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AyaPage from './pages/AyaPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
    <LocaleProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
          <LoadingScreen />
          <Sidebar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/aya/:index" element={<AyaPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LocaleProvider>
    </ThemeProvider>
  );
}
