import { ArrowLeft, ArrowRight, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';

interface TopBarProps {
    onMenuClick: () => void;
}

const pageTitles: Record<string, { ar: string; en: string }> = {
    '/': { ar: 'باحث القراءات', en: 'Qeraat Searcher' },
    '/search': { ar: 'نتائج البحث', en: 'Search' },
    '/settings': { ar: 'الإعدادات', en: 'Settings' },
    '/about': { ar: 'حول التطبيق', en: 'About' },
};

export default function TopBar({ onMenuClick }: TopBarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRtl } = useLocale();

    const isHome = location.pathname === '/';
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;

    // Resolve title: check exact match first, then prefix match (for /aya/:id)
    let title = pageTitles[location.pathname];
    if (!title && location.pathname.startsWith('/aya/')) {
        title = { ar: 'تفاصيل الآية', en: 'Aya Details' };
    }
    const displayTitle = title
        ? (isRtl ? title.ar : title.en)
        : '';

    return (
        <header className="fixed top-0 left-0 right-0 z-40" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Status bar zone — covers the Dynamic Island / notch / camera */}
            <div
                className="bg-blue-600 dark:bg-gray-800"
                style={{ height: 'env(safe-area-inset-top, 0px)' }}
            />

            {/* Navigation bar */}
            <div className="h-14 bg-blue-600 dark:bg-gray-800 flex items-center px-4 shadow-md">
                {/* Start side: Menu and Back (if not home) */}
                <div className="w-20 flex items-center shrink-0">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ms-2 text-white/90 hover:text-white active:scale-95 transition-all rounded-lg"
                        aria-label="Menu"
                    >
                        <Menu size={22} />
                    </button>
                    
                    {!isHome && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-white/90 hover:text-white active:scale-95 transition-all rounded-lg"
                            aria-label="Back"
                        >
                            <BackIcon size={22} />
                        </button>
                    )}
                </div>

                {/* Center: Title */}
                <h1 className="flex-1 text-center text-white font-bold text-base font-arabic truncate px-2">
                    {displayTitle}
                </h1>

                {/* End side: spacer to balance start side and keep title centered */}
                <div className="w-20 shrink-0"></div>
            </div>
        </header>
    );
}
