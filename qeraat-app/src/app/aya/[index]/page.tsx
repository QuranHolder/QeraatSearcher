import { getDb } from '@/lib/db';
import { BookQuran, QuranData, QuranSora } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
    params: Promise<{ index: string }>;
}) {
    const { index } = await params;
    const ayaIndex = parseInt(index, 10);
    const data = await getAyaDetails(ayaIndex);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Aya Not Found</h1>
                <Link href="/" className="text-blue-500 hover:underline">
                    Go Home
                </Link>
            </div>
        );
    }

    const { aya, sora, quranData } = data;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-blue-500 hover:underline mb-8 block">
                    &larr; Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2">Surah {sora?.sora_name}</h1>
                    <p className="text-gray-500">Aya {aya.aya}</p>
                </div>

                {/* Quran Text */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-12 text-center">
                    <p className="text-4xl md:text-5xl leading-loose font-arabic text-gray-900 dark:text-gray-100" dir="rtl">
                        {aya.text}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mb-12">
                    <Link
                        href={ayaIndex > 1 ? `/aya/${ayaIndex - 1}` : '#'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${ayaIndex > 1
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <ArrowLeft size={20} /> Previous
                    </Link>
                    <Link
                        href={`/aya/${ayaIndex + 1}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Next <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Readings / Qeraat */}
                {quranData.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Readings & Variations</h2>
                        {quranData.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                    <div className="flex-1">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded mb-2">
                                            ID: {item.id}
                                        </span>
                                        {item.tags && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.tags.split(',').map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-xl font-bold font-arabic mb-1" dir="rtl">
                                            {item.sub_subject1 || item.sub_subject}
                                        </h3>
                                        <p className="text-sm text-gray-500" dir="rtl">
                                            Reading: {item.reading}
                                        </p>
                                    </div>
                                </div>

                                {/* Readers Matrix */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold mb-2">Readers (Qarra'):</h4>
                                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                                            const qKey = `Q${n}` as keyof QuranData;
                                            const isActive = item[qKey] === '1'; // Check if string '1'
                                            return (
                                                <div
                                                    key={n}
                                                    className={`p-1 rounded ${isActive ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-50 text-gray-300'}`}
                                                >
                                                    Q{n}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {item.qarees && (
                                        <p className="mt-2 text-xs text-gray-500 text-right" dir="rtl">
                                            القراء: {item.qarees}
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
