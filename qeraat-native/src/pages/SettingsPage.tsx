import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';

export default function SettingsPage() {
    const { dict, isRtl, locale, setLocale } = useLocale();
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;

    return (
        <main className="min-h-screen p-4 sm:p-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl mx-auto">
                {/* Back link */}
                <div className="flex items-center h-11 mb-6 ms-12">
                    <Link to="/" className="text-blue-500 hover:underline inline-flex items-center gap-1 text-sm font-arabic font-medium">
                        <BackIcon size={15} /> {dict.common.home}
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Settings size={22} />
                        </div>
                        <h1 className="text-xl font-bold font-arabic">{dict.common.settings}</h1>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">{dict.common.language}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-arabic">
                                    {isRtl ? 'اختر لغة واجهة التطبيق' : 'Choose the app interface language'}
                                </p>
                            </div>
                            <select
                                value={locale}
                                onChange={e => setLocale(e.target.value as 'ar' | 'en')}
                                className="w-full sm:w-auto min-w-[140px] border border-gray-200 dark:border-gray-600 rounded-xl p-3.5 text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all font-arabic cursor-pointer appearance-none"
                            >
                                <option value="ar">{dict.common.arabic}</option>
                                <option value="en">{dict.common.english}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
