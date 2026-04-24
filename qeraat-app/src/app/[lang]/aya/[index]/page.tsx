import { getDb } from '@/lib/db';
import { BookQuran, QuranData, QuranSora } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getDictionary, Locale } from '@/lib/dictionaries';

async function getAyaDetails(index: number) {
    const db = getDb();

    const ayaStmt = db.prepare('SELECT * FROM book_quran WHERE aya_index = ?');
    const aya = ayaStmt.get(index) as BookQuran | undefined;

    if (!aya) return null;

    const soraStmt = db.prepare('SELECT * FROM quran_sora WHERE sora = ?');
    const sora = soraStmt.get(aya.sora) as QuranSora | undefined;

    const dataStmt = db.prepare('SELECT * FROM quran_data WHERE aya_index = ? ORDER BY id ASC');
    const quranData = dataStmt.all(index) as QuranData[];

    return { aya, sora, quranData };
}

export default async function AyaPage({
    params,
}: {
    params: Promise<{ index: string; lang: string }>;
}) {
    const resolvedParams = await params;
    const { index } = resolvedParams;
    const lang = resolvedParams.lang as Locale;
    const dict = await getDictionary(lang);
    
    const ayaIndex = parseInt(index, 10);
    const data = await getAyaDetails(ayaIndex);

    const isRtl = lang === 'ar';
    const NextIcon = isRtl ? ArrowLeft : ArrowRight;
    const PrevIcon = isRtl ? ArrowRight : ArrowLeft;

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">{dict.aya.notFound}</h1>
                <Link href={`/${lang}`} className="text-blue-500 hover:underline">
                    {dict.aya.goHome}
                </Link>
            </div>
        );
    }

    const { aya, sora, quranData } = data;

    return (
        <main className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href={`/${lang}`} className="text-blue-500 hover:underline mb-8 inline-flex items-center gap-2">
                    {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {dict.aya.goHome}
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2">{dict.aya.surah} {sora?.sora_name}</h1>
                    <p className="text-gray-500">{dict.aya.aya} {aya.aya}</p>
                </div>

                {/* Quran Text */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-12 text-center">
                    <p className="text-4xl md:text-5xl leading-loose font-arabic text-gray-900 dark:text-gray-100" dir="rtl">
                        {aya.text}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mb-12">
                    <Link
                        href={ayaIndex > 1 ? `/${lang}/aya/${ayaIndex - 1}` : '#'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${ayaIndex > 1
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                            }`}
                    >
                        {isRtl ? <PrevIcon size={20} /> : <ArrowLeft size={20} />} {dict.aya.previous}
                    </Link>
                    <Link
                        href={`/${lang}/aya/${ayaIndex + 1}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {dict.aya.next} {isRtl ? <NextIcon size={20} /> : <ArrowRight size={20} />}
                    </Link>
                </div>

                {/* Readings / Qeraat */}
                {quranData.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-2">{dict.aya.readings}</h2>
                        {quranData.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <div className={`flex flex-col md:flex-row justify-between items-start gap-4 mb-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                                    <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded mb-2">
                                            {dict.aya.id} {item.id}
                                        </span>
                                        {item.tags && (
                                            <div className={`flex flex-wrap gap-2 mt-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                                                {item.tags.split(',').map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right flex-1 w-full md:w-auto">
                                        <h3 className="text-xl font-bold font-arabic mb-1" dir="rtl">
                                            {item.sub_subject1 || item.sub_subject}
                                        </h3>
                                        <p className="text-sm text-gray-500" dir="rtl">
                                            {dict.aya.readingLabel} {item.reading}
                                        </p>
                                    </div>
                                </div>

                                {/* Readers Matrix */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className={`text-sm font-semibold mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{dict.aya.readers}</h4>
                                    <div className={`grid grid-cols-5 gap-2 text-center text-xs ${isRtl ? 'rtl' : 'ltr'}`}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                                            const qKey = `Q${n}` as keyof QuranData;
                                            const isActive = item[qKey] === '1';
                                            return (
                                                <div
                                                    key={n}
                                                    className={`p-1 rounded ${isActive ? 'bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-50 text-gray-300 dark:bg-gray-800 dark:text-gray-600'}`}
                                                >
                                                    Q{n}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {item.qarees && (
                                        <p className="mt-2 text-xs text-gray-500 text-right" dir="rtl">
                                            {item.qarees}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
