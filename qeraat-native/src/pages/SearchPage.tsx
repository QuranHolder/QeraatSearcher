import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { searchText, searchRoot, searchTag } from '../lib/sqljs-db';
import { useLocale } from '../hooks/useLocale';
import type { QuranData } from '../lib/types';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'text';
    const dbState = useDatabase();
    const { dict, isRtl } = useLocale();
    const [results, setResults] = useState<QuranData[]>([]);
    const [query, setQuery] = useState(q);
    const [searchType, setSearchType] = useState(type);

    useEffect(() => { setQuery(q); setSearchType(type); }, [q, type]);

    useEffect(() => {
        if (dbState.status !== 'ready' || !q) { setResults([]); return; }
        const db = dbState.db;
        if (type === 'root') setResults(searchRoot(db, q));
        else if (type === 'tag') setResults(searchTag(db, q));
        else setResults(searchText(db, q));
    }, [dbState, q, type]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
    };

    const isLoading = dbState.status === 'loading' || dbState.status === 'idle';
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;

    return (
        <main className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/" className="text-blue-500 hover:underline inline-flex items-center gap-1 mb-4">
                        <BackIcon size={16} /> {dict.search.backToHome}
                    </Link>
                    <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={dict.search.placeholder}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Search size={18} /> {dict.search.button}
                        </button>
                    </form>
                    <div className="flex gap-4 mt-3">
                        {['text', 'root', 'tag'].map(t => (
                            <label key={t} className="flex items-center gap-1 cursor-pointer text-sm">
                                <input type="radio" value={t} checked={searchType === t} onChange={() => setSearchType(t)} className="w-3.5 h-3.5" />
                                {dict.search[t as 'text' | 'root' | 'tag']}
                            </label>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500">{isRtl ? 'جاري تحميل قاعدة البيانات...' : 'Loading database...'}</p>
                    </div>
                ) : dbState.status === 'error' ? (
                    <p className="text-red-500">Error: {dbState.error}</p>
                ) : (
                    <>
                        {q && <h1 className="text-xl font-bold mb-4">
                            {dict.search.resultsFor} "{q}" <span className="text-gray-400 font-normal text-base">({results.length} {dict.search.found})</span>
                        </h1>}
                        <div className="space-y-3">
                            {results.length === 0 && q
                                ? <p className="text-gray-500">{dict.search.noResults}</p>
                                : results.map(item => (
                                    <Link key={`${item.sora}-${item.aya}-${item.id}`}
                                        to={`/aya/${item.aya_index}`}
                                        className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1">
                                                <p className="font-arabic font-bold text-right" dir="rtl">{item.sub_subject1 || item.sub_subject}</p>
                                                <p className="text-sm text-gray-500">{dict.search.sora} {item.sora}, {dict.search.aya} {item.aya}</p>
                                            </div>
                                            {item.root && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">{dict.search.rootLabel} {item.root}</span>}
                                        </div>
                                        {item.reading && <p className="mt-1 text-sm text-gray-500" dir="rtl">{item.reading}</p>}
                                    </Link>
                                ))
                            }
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
