import { useState } from 'react';
import { Menu, X, Settings, Home, Sun, Moon, Monitor, Bookmark, Trash2, ChevronDown, Play } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';
import { useTheme, type Theme } from '../hooks/useTheme';
import { useSavedFilters } from '../hooks/useSavedFilters';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [savedOpen, setSavedOpen] = useState(false);
    const { dict, isRtl } = useLocale();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { savedFilters, deleteFilter } = useSavedFilters();

    const themes: { value: Theme; icon: any; label: string }[] = [
        { value: 'auto', icon: Monitor, label: dict.common.themeAuto },
        { value: 'day', icon: Sun, label: dict.common.themeDay },
        { value: 'night', icon: Moon, label: dict.common.themeNight },
    ];

    const handleApplyFilter = (name: string) => {
        setIsOpen(false);
        navigate(`/search?applySaved=${encodeURIComponent(name)}`);
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed top-[calc(env(safe-area-inset-top)+1rem)] ${isRtl ? 'right-4' : 'left-4'} p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 z-40 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95`}
                aria-label={dict.common.menu}
            >
                <Menu size={22} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 bottom-0 ${isRtl ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} w-72 bg-white dark:bg-gray-900 z-50 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isOpen ? '!translate-x-0' : ''}`}
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/60 mt-2">
                    <h2 className="font-bold text-lg font-arabic">{dict.common.menu}</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label={dict.common.close}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {/* Home */}
                    <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${location.pathname === '/' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                        <Home size={20} className={location.pathname === '/' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className="font-arabic">{dict.common.home}</span>
                    </Link>

                    {/* Settings */}
                    <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${location.pathname === '/settings' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                        <Settings size={20} className={location.pathname === '/settings' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className="font-arabic">{dict.common.settings}</span>
                    </Link>

                    {/* ── Saved Filters Accordion ── */}
                    {savedFilters.length > 0 && (
                        <div className="pt-1">
                            {/* Accordion Header */}
                            <button
                                type="button"
                                onClick={() => setSavedOpen(v => !v)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                            >
                                <div className="flex items-center gap-3.5">
                                    <Bookmark size={20} className="text-gray-400" />
                                    <span className="font-arabic font-medium">{dict.search.savedFilters}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                                        {savedFilters.length}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`text-gray-400 transition-transform duration-200 ${savedOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Accordion Content */}
                            {savedOpen && (
                                <div className="mt-1 ms-4 border-s-2 border-gray-100 dark:border-gray-700/60 ps-3 space-y-1">
                                    {savedFilters.map(sf => (
                                        <div
                                            key={sf.name}
                                            className="flex items-center gap-2 px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        >
                                            {/* Name */}
                                            <span
                                                className="flex-1 text-sm font-arabic text-gray-700 dark:text-gray-200 truncate min-w-0"
                                                title={sf.name}
                                            >
                                                {sf.name}
                                            </span>

                                            {/* Apply button */}
                                            <button
                                                type="button"
                                                onClick={() => handleApplyFilter(sf.name)}
                                                title={dict.search.applyFilter}
                                                className="shrink-0 p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-500 hover:text-white transition-colors"
                                            >
                                                <Play size={13} />
                                            </button>

                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                onClick={() => deleteFilter(sf.name)}
                                                title={dict.search.deleteFilter}
                                                className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Theme Selector */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800/60 mt-auto">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2 font-arabic uppercase tracking-wider">
                        {dict.common.theme}
                    </p>
                    <div className="flex gap-1 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        {themes.map(t => {
                            const Icon = t.icon;
                            const isActive = theme === t.value;
                            return (
                                <button
                                    key={t.value}
                                    onClick={() => setTheme(t.value)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg transition-all ${
                                        isActive
                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-gray-600/50'
                                            : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-[10px] font-medium font-arabic">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
