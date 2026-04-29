import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import { useDatabase } from '../hooks/useDatabase';
import { getAllSurahs, getAyahsForSora } from '../lib/sqljs-db';
import type { QuranSora, BookQuran } from '../lib/types';

export default function HomePage() {
    const { dict, isRtl } = useLocale();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('text');
    const dbState = useDatabase();

    const [allSurahs, setAllSurahs] = useState<QuranSora[]>([]);
    const [selectedSora, setSelectedSora] = useState<number>(0);
    const [fromAya, setFromAya] = useState<number>(0);
    const [toAya, setToAya] = useState<number>(0);
    const [soraAyahs, setSoraAyahs] = useState<BookQuran[]>([]);

    useEffect(() => {
        if (dbState.status !== 'ready') return;
        setAllSurahs(getAllSurahs(dbState.db));
    }, [dbState]);

    useEffect(() => {
        if (dbState.status !== 'ready') return;
        if (selectedSora > 0) {
            setSoraAyahs(getAyahsForSora(dbState.db, selectedSora));
        } else {
            setSoraAyahs([]);
            setFromAya(0);
            setToAya(0);
        }
    }, [selectedSora, dbState]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        let url = `/search?q=${encodeURIComponent(query)}&type=${type}`;
        if (selectedSora > 0) url += `&sora=${selectedSora}`;
        if (fromAya > 0) url += `&fromAya=${fromAya}`;
        if (toAya > 0) url += `&toAya=${toAya}`;
        navigate(url);
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-8">


            {/* Header */}
            <div className="max-w-5xl w-full text-center mb-12">
                <h1 className="text-4xl font-bold mb-3">{dict.home.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{dict.home.subtitle}</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
                {/* ── Sora and Aya Filter ── */}
                <div className="flex flex-wrap gap-2 mb-3 items-center" dir={isRtl ? 'rtl' : 'ltr'}>
                    <select 
                        value={selectedSora} 
                        onChange={e => setSelectedSora(Number(e.target.value))}
                        className="py-2 px-3 border rounded-xl bg-white dark:bg-gray-800 text-sm font-arabic outline-none focus:ring-2 focus:ring-blue-400 w-[140px] sm:w-[160px] truncate shadow-sm"
                        title={isRtl ? 'السورة' : 'Sora'}
                    >
                        <option value={0}>{isRtl ? 'جميع السور' : 'All Surahs'}</option>
                        {allSurahs.map(s => (
                            <option key={s.sora} value={s.sora}>
                                {s.sora} - {s.sora_name}
                            </option>
                        ))}
                    </select>

                    {selectedSora > 0 && soraAyahs.length > 0 && (
                        <>
                            <select 
                                value={fromAya} 
                                onChange={e => setFromAya(Number(e.target.value))}
                                className="py-2 px-3 border rounded-xl bg-white dark:bg-gray-800 text-sm font-arabic outline-none focus:ring-2 focus:ring-blue-400 w-[120px] sm:w-[140px] truncate shadow-sm"
                                dir="rtl"
                                title={isRtl ? 'من آية' : 'From Aya'}
                            >
                                <option value={0}>{isRtl ? 'من البداية' : 'Start'}</option>
                                {soraAyahs.map(a => (
                                    <option key={a.aya} value={a.aya}>
                                        {a.aya} - {a.text}
                                    </option>
                                ))}
                            </select>
                            <select 
                                value={toAya} 
                                onChange={e => setToAya(Number(e.target.value))}
                                className="py-2 px-3 border rounded-xl bg-white dark:bg-gray-800 text-sm font-arabic outline-none focus:ring-2 focus:ring-blue-400 w-[120px] sm:w-[140px] truncate shadow-sm"
                                dir="rtl"
                                title={isRtl ? 'إلى آية' : 'To Aya'}
                            >
                                <option value={0}>{isRtl ? 'إلى النهاية' : 'End'}</option>
                                {soraAyahs.map(a => (
                                    <option key={a.aya} value={a.aya}>
                                        {a.aya} - {a.text}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={dict.search.placeholder}
                                className="w-full p-3 text-base border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Search size={17} />
                            {dict.search.button}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/search?q=${encodeURIComponent(query)}&type=${type}&showFilters=true`)}
                            className="px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-300 flex items-center gap-1.5 text-sm font-medium transition-all"
                        >
                            <Filter size={16} />
                        </button>
                    </div>
                    <div className="flex gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
                        {['text', 'root', 'tag', 'reading'].map(t => (
                            <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    name="type"
                                    value={t}
                                    checked={type === t}
                                    onChange={() => setType(t)}
                                    className="w-3.5 h-3.5 accent-blue-600"
                                />
                                <span>{dict.search[t as 'text' | 'root' | 'tag' | 'reading']}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </form>

            {/* Feature Cards */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
                {[
                    { title: dict.home.wordSearch, desc: dict.home.wordSearchDesc },
                    { title: dict.home.rootSearch, desc: dict.home.rootSearchDesc },
                    { title: dict.home.tags, desc: dict.home.tagsDesc },
                    { title: dict.home.readingSearch, desc: dict.home.readingSearchDesc },
                ].map((card, i) => (
                    <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                        <p className="text-gray-500 text-sm">{card.desc}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}
