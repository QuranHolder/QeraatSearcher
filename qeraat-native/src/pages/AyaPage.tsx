import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Copy, Share2, Check } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { getAya } from '../lib/sqljs-db';
import { useLocale } from '../hooks/useLocale';
import type { BookQuran, QuranData, QuranSora } from '../lib/types';

// ─── Qaree card with optional raawi display ───────────────────────────────────
function QareeCard({
    n,
    item,
    qareeMap,
}: {
    n: number;
    item: QuranData;
    qareeMap: Record<string, string>;
}) {
    const qKey = `Q${n}` as keyof QuranData;
    const r1Key = `R${n}_1` as keyof QuranData;
    const r2Key = `R${n}_2` as keyof QuranData;

    const qActive = item[qKey] === '1' || item[qKey] === 1;
    const r1Active = item[r1Key] === '1' || item[r1Key] === 1;
    const r2Active = item[r2Key] === '1' || item[r2Key] === 1;

    // Show if the qari or either narrator is active
    if (!qActive && !r1Active && !r2Active) return null;

    const qName = qareeMap[`Q${n}`] || `Q${n}`;
    const r1Name = qareeMap[`R${n}_1`] || null;
    const r2Name = qareeMap[`R${n}_2`] || null;

    let mainText = qName;
    let subText = '';

    // Logic: "يتم عرضه فقط إذا اختلف الراويان"
    // "مثلا إذا كان q6 is null and r6_1 is not null أو and r6_2 is not null يتم عرض العنصر الموافق للراوي"
    if (!qActive) {
        if (r1Active && r2Active) {
            mainText = `${r1Name} / ${r2Name}`;
        } else if (r1Active) {
            mainText = r1Name || qName;
        } else if (r2Active) {
            mainText = r2Name || qName;
        }
    } else {
        // Qari is active. Show narrators only if they differ (one is active, one is not)
        if (r1Active !== r2Active) {
            subText = (r1Active ? r1Name : r2Name) || '';
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
            <span className="font-arabic text-[11px] font-bold text-blue-800 dark:text-blue-200 text-center leading-tight">
                {mainText}
            </span>
            {subText && (
                <span className="font-arabic text-[9px] text-indigo-500 dark:text-indigo-400 text-center leading-tight border-t border-blue-100 dark:border-blue-800/50 pt-0.5 mt-0.5 w-full">
                    {subText}
                </span>
            )}
        </div>
    );
}

// ─── Reading card ─────────────────────────────────────────────────────────────
function ReadingCard({
    item,
    qareeMap,
    dict,
}: {
    item: QuranData;
    qareeMap: Record<string, string>;
    dict: Record<string, Record<string, string>>;
}) {
    const [copied, setCopied] = useState(false);

    const subject = item.sub_subject1 || item.sub_subject || '';
    const showResultNew = !!item.resultnew;

    const shareText = [
        subject + (showResultNew ? `: ${item.resultnew}` : ''),
        item.reading || '',
        item.qareesrest || '',
    ].filter(Boolean).join('\n');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try { await navigator.share({ text: shareText }); } catch { /* ignore */ }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            {/* Subject + resultnew */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        onClick={handleCopy}
                        title={dict.aya.copyResult}
                        className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        title={dict.aya.shareResult}
                        className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                        <Share2 size={13} />
                    </button>
                </div>

                <div className="text-right flex-1" dir="rtl">
                    <p className="font-arabic font-bold text-base leading-relaxed">
                        {subject}
                        {showResultNew && (
                            <span className="text-gray-500 dark:text-gray-400 font-normal">: {item.resultnew}</span>
                        )}
                    </p>
                    {item.reading && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-arabic">
                            {item.reading}
                        </p>
                    )}
                    {item.qareesrest && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-arabic">
                            {item.qareesrest}
                        </p>
                    )}
                </div>
            </div>

            {/* Tags */}
            {item.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.split(',').filter(Boolean).map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-100 dark:border-emerald-800">
                            {t.trim()}
                        </span>
                    ))}
                </div>
            )}

            {/* Qarees grid */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <QareeCard key={n} n={n} item={item} qareeMap={qareeMap} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── AyaPage ──────────────────────────────────────────────────────────────────
export default function AyaPage() {
    const { index } = useParams<{ index: string }>();
    const navigate = useNavigate();
    const ayaIndex = parseInt(index || '1', 10);
    const dbState = useDatabase();
    const { dict, isRtl } = useLocale();
    const [data, setData] = useState<{
        aya: BookQuran | null;
        sora: QuranSora | null;
        quranData: QuranData[];
        qareeMap: Record<string, string>;
    } | null>(null);

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

    const { aya, sora, quranData, qareeMap } = data;

    // Prefer text_full if available
    const ayaText = aya.text_full || aya.text;

    return (
        <main className="min-h-screen p-4 sm:p-8 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center h-11 mb-4 ms-12">
                    <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline inline-flex items-center gap-1 text-sm font-medium">
                        <BackIcon size={15} /> {(dict.common as any).back}
                    </button>
                </div>

                {/* Sora header */}
                <div className="text-center my-6">
                    <h1 className="text-2xl font-bold font-arabic">
                        {sora?.sora_name && (
                            <span className="text-blue-600 dark:text-blue-400">({sora.sora_name}:{aya.aya})</span>
                        )}
                    </h1>
                </div>

                {/* Aya text */}
                <div className="bg-white dark:bg-gray-800 px-6 py-5 rounded-2xl shadow-sm mb-6 text-center border border-gray-100 dark:border-gray-700">
                    <p className="text-xl leading-loose font-arabic text-gray-800 dark:text-gray-100" dir="rtl">
                        {ayaText}
                    </p>
                </div>

                {/* Prev / Next */}
                <div className="flex justify-between mb-8 gap-3">
                    <Link to={ayaIndex > 1 ? `/aya/${ayaIndex - 1}` : '#'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${ayaIndex > 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'}`}>
                        <PrevIcon size={16} /> {dict.aya.previous}
                    </Link>
                    <Link to={`/aya/${ayaIndex + 1}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors">
                        {dict.aya.next} <NextIcon size={16} />
                    </Link>
                </div>

                {/* Readings */}
                {quranData.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
                            {dict.aya.readings}
                        </h2>
                        {quranData.map((item, idx) => (
                            <ReadingCard
                                key={idx}
                                item={item}
                                qareeMap={qareeMap}
                                dict={dict as Record<string, Record<string, string>>}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
