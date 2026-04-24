import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { getAya } from '../lib/sqljs-db';
import { useLocale } from '../hooks/useLocale';
import type { BookQuran, QuranData, QuranSora } from '../lib/types';

export default function AyaPage() {
    const { index } = useParams<{ index: string }>();
    const ayaIndex = parseInt(index || '1', 10);
    const dbState = useDatabase();
    const { dict, isRtl } = useLocale();
    const [data, setData] = useState<{ aya: BookQuran | null; sora: QuranSora | null; quranData: QuranData[] } | null>(null);

    useEffect(() => {
        if (dbState.status !== 'ready') return;
        setData(getAya(dbState.db, ayaIndex));
    }, [dbState, ayaIndex]);

    const isLoading = dbState.status !== 'ready' || !data;
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;
    const PrevIcon = isRtl ? ArrowRight : ArrowLeft;
    const NextIcon = isRtl ? ArrowLeft : ArrowRight;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data?.aya) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">{dict.aya.notFound}</h1>
                <Link to="/" className="text-blue-500 hover:underline">{dict.aya.goHome}</Link>
            </div>
        );
    }

    const { aya, sora, quranData } = data;

    return (
        <main className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-blue-500 hover:underline mb-6 inline-flex items-center gap-1">
                    <BackIcon size={16} /> {dict.aya.goHome}
                </Link>

                <div className="text-center my-8">
                    <h1 className="text-3xl font-bold">{dict.aya.surah} {sora?.sora_name}</h1>
                    <p className="text-gray-500">{dict.aya.aya} {aya.aya}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 text-center">
                    <p className="text-4xl leading-loose font-arabic" dir="rtl">{aya.text}</p>
                </div>

                <div className="flex justify-between mb-8">
                    <Link to={ayaIndex > 1 ? `/aya/${ayaIndex - 1}` : '#'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${ayaIndex > 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                        <PrevIcon size={18} /> {dict.aya.previous}
                    </Link>
                    <Link to={`/aya/${ayaIndex + 1}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        {dict.aya.next} <NextIcon size={18} />
                    </Link>
                </div>

                {quranData.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold border-b pb-2">{dict.aya.readings}</h2>
                        {quranData.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className={`flex justify-between gap-4 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{dict.aya.id} {item.id}</span>
                                        {item.tags && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.tags.split(',').map((t, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">{t.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-arabic font-bold" dir="rtl">{item.sub_subject1 || item.sub_subject}</p>
                                        <p className="text-sm text-gray-500" dir="rtl">{dict.aya.readingLabel} {item.reading}</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className={`text-xs font-semibold mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{dict.aya.readers}</p>
                                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                                        {[1,2,3,4,5,6,7,8,9,10].map(n => {
                                            const isActive = item[`Q${n}` as keyof QuranData] === '1' || item[`Q${n}` as keyof QuranData] === 1;
                                            return (
                                                <div key={n} className={`p-1 rounded ${isActive ? 'bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-50 text-gray-300 dark:bg-gray-700'}`}>
                                                    Q{n}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {item.qarees && <p className="mt-1 text-xs text-gray-500 text-right" dir="rtl">{item.qarees}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
