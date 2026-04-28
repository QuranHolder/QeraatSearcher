import { useDatabase } from '../hooks/useDatabase';
import { useLocale } from '../hooks/useLocale';

export default function LoadingScreen() {
    const dbState = useDatabase();
    const { isRtl } = useLocale();

    if (dbState.status === 'ready') return null;

    const isError = dbState.status === 'error';

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-6"
            style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {isError ? (
                /* ── Error state ── */
                <>
                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 text-3xl">
                        ✕
                    </div>
                    <div className="text-center px-8">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200 font-arabic mb-2">
                            {isRtl ? 'خطأ في تحميل قاعدة البيانات' : 'Failed to load database'}
                        </p>
                        <p className="text-sm text-red-500 font-mono break-all">
                            {'error' in dbState ? dbState.error : ''}
                        </p>
                    </div>
                </>
            ) : (
                /* ── Loading state ── */
                <>
                    {/* Animated logo / spinner ring */}
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                        <div className="absolute inset-[6px] rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-arabic select-none">ق</span>
                        </div>
                    </div>

                    <div className="text-center px-8 space-y-1.5">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200 font-arabic">
                            {isRtl ? 'باحث القراءات' : 'Qeraat Searcher'}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 font-arabic">
                            {isRtl ? 'جاري تحميل قاعدة البيانات...' : 'Loading database…'}
                        </p>
                    </div>

                    {/* Animated dots */}
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                            <span
                                key={i}
                                className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
