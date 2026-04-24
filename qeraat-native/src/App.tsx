import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './hooks/useLocale';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AyaPage from './pages/AyaPage';
import './index.css';

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/aya/:index" element={<AyaPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LocaleProvider>
  );
}
