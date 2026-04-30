import { ArrowRight, ArrowLeft, Info, BookOpen, Copyright } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';

export default function AboutPage() {
    const navigate = useNavigate();
    const { dict, isRtl } = useLocale();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 pt-safe">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ms-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                        aria-label={dict.common.back}
                    >
                        {isRtl ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
                    </button>
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                        <Info size={24} />
                        <h1 className="text-xl font-bold font-arabic">{dict.about.title}</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center space-y-8">
                    
                    {/* Logo/Icon Area */}
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                        <BookOpen size={48} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold font-arabic text-gray-900 dark:text-gray-100">
                            {dict.home.title}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-arabic">
                            {dict.home.subtitle}
                        </p>
                    </div>

                    <hr className="w-full border-gray-100 dark:border-gray-700/50" />

                    {/* Author Section */}
                    <div className="space-y-4 w-full">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 font-arabic">
                                {dict.about.preparedBy}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-arabic">
                                {dict.about.author}
                            </p>
                        </div>
                    </div>

                    {/* Copyright Section */}
                    <div className="space-y-2 w-full pt-4">
                        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                            <Copyright size={18} />
                            <span className="font-arabic font-medium">{dict.about.copyright}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300 font-arabic">
                            {dict.about.center}
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}
