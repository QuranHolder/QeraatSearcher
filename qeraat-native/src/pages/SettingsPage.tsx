import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import { useSettings } from '../hooks/useSettings';

export default function SettingsPage() {
    const { dict, isRtl, locale, setLocale } = useLocale();
    const { settings, updateSettings } = useSettings();
    const navigate = useNavigate();
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const exportData = async () => {
        const data = {
            settings: localStorage.getItem('qeraat_settings'),
            filters: localStorage.getItem('qeraat_saved_filters')
        };
        const jsonStr = JSON.stringify(data, null, 2);
        const fileName = `qeraat-backup-${new Date().toISOString().split('T')[0]}.json`;

        try {
            const file = new File([jsonStr], fileName, { type: "application/json" });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Qeraat Backup',
                });
                return;
            }
        } catch (e) {
            // AbortError is normal if user cancels share sheet
            if ((e as Error).name === 'AbortError') return;
        }

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Qeraat Backup',
                    text: jsonStr
                });
                return;
            }
        } catch (e) {
            if ((e as Error).name === 'AbortError') return;
        }

        try {
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            try {
                await navigator.clipboard.writeText(jsonStr);
                alert((dict.common as any).copiedToClipboard);
            } catch (err) {
                alert("Failed to export.");
            }
        }
    };

    const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                let imported = false;
                if (json.settings) {
                    localStorage.setItem('qeraat_settings', json.settings);
                    window.dispatchEvent(new Event('qeraat_settings_updated'));
                    imported = true;
                }
                if (json.filters) {
                    localStorage.setItem('qeraat_saved_filters', json.filters);
                    window.dispatchEvent(new Event('qeraat_filters_updated'));
                    imported = true;
                }
                if (imported) {
                    alert((dict.common as any).importSuccess);
                } else {
                    alert((dict.common as any).importError);
                }
            } catch (err) {
                alert((dict.common as any).importError);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <main className="min-h-screen p-4 sm:p-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl mx-auto">
                {/* Back link */}
                <div className="flex items-center h-11 mb-6 ms-12">
                    <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline inline-flex items-center gap-1 text-sm font-arabic font-medium">
                        <BackIcon size={15} /> {(dict.common as any).back}
                    </button>
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

                        {/* Divider */}
                        <hr className="my-6 border-gray-100 dark:border-gray-700/60" />

                        {/* Results Per Page Setting */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">{(dict.common as any).resultsPerPage}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-arabic">
                                    {(dict.common as any).resultsPerPageDesc}
                                </p>
                            </div>
                            <select
                                value={settings.resultsPerPage}
                                onChange={e => updateSettings({ resultsPerPage: Number(e.target.value) })}
                                className="w-full sm:w-auto min-w-[140px] border border-gray-200 dark:border-gray-600 rounded-xl p-3.5 text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all font-mono cursor-pointer appearance-none"
                            >
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="500">500</option>
                            </select>
                        </div>

                        {/* Divider */}
                        <hr className="my-6 border-gray-100 dark:border-gray-700/60" />

                        {/* Backup & Restore */}
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic mb-4">
                                {(dict.common as any).backupRestore}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Export */}
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col items-start gap-3">
                                    <div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200 font-arabic text-sm">{(dict.common as any).exportData}</div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-arabic">{(dict.common as any).exportDataDesc}</p>
                                    </div>
                                    <button
                                        onClick={exportData}
                                        className="mt-auto px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors w-full font-arabic"
                                    >
                                        {(dict.common as any).exportData}
                                    </button>
                                </div>

                                {/* Import */}
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col items-start gap-3">
                                    <div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200 font-arabic text-sm">{(dict.common as any).importData}</div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-arabic">{(dict.common as any).importDataDesc}</p>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors w-full font-arabic"
                                    >
                                        {(dict.common as any).importData}
                                    </button>
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={importData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
