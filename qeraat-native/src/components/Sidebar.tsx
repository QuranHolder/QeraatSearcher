import { useState } from 'react';
import { Menu, X, Settings, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { dict, isRtl } = useLocale();
    const location = useLocation();

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

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <Link 
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${location.pathname === '/' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                        <Home size={20} className={location.pathname === '/' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className="font-arabic">{dict.common.home}</span>
                    </Link>
                    <Link 
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${location.pathname === '/settings' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                        <Settings size={20} className={location.pathname === '/settings' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className="font-arabic">{dict.common.settings}</span>
                    </Link>
                </nav>
            </div>
        </>
    );
}
