/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Copy, Filter, Search, Share2 } from 'lucide-react';
import SearchFilters, { ActiveFilterChips } from '../components/SearchFilters';
import { useDatabase } from '../hooks/useDatabase';
import { useLocale } from '../hooks/useLocale';
import { useSavedFilters } from '../hooks/useSavedFilters';
import { useSettings } from '../hooks/useSettings';
import { buildSearchUrl, filtersToOptions, hasActiveSearchFilters, parseSearchFilters, savedFilterToValues, type SearchFilterValues } from '../lib/searchFilters';
import { getAllQarees, getAllSurahs, getAllTags, getSearchSql, searchReading, searchRoot, searchTag, searchText } from '../lib/sqljs-db';
import type { Qareemaster, QuranData, QuranSora, SearchOptions, Tagsmaster } from '../lib/types';

function buildShareText(item: QuranData): string {
    const title = `${item.sora_name ?? `سورة ${item.sora}`}:${item.aya}`;
    const subject = item.sub_subject1 || item.sub_subject || '';
    const result = item.resultnew ? `${subject}: ${item.resultnew}` : subject;
    const reading = item.reading ? `\n${item.reading}` : '';
    const qarees = item.qarees ? `\n[${item.qarees}]` : '';
    const qareesrest = item.qareesrest ? (item.qarees === 'الباقون' ? `\nالباقون: ${item.qareesrest}` : `\n${item.qareesrest}`) : '';
    return `${title}\n${result}${reading}${qarees}${qareesrest}`;
}

function ResultCard({ item }: { item: QuranData }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(buildShareText(item));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };
    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const text = buildShareText(item);
        if (navigator.share) {
            try { await navigator.share({ text }); } catch { /* ignore */ }
        } else {
            handleCopy(e);
        }
    };
    const soraAya = item.sora_name ? `${item.sora_name}:${item.aya}` : `${item.sora}:${item.aya}`;
    const subject = item.sub_subject1 || item.sub_subject || '';

    return (
        <Link
            to={`/aya/${item.aya_index}`}
            className="block p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex justify-between items-start gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                        <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-sm font-arabic">({soraAya})</span>
                        <span className="text-[10px] text-gray-400 font-medium">#{item.id}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="font-quran font-bold text-right text-xl leading-relaxed text-gray-800 dark:text-gray-100" dir="rtl">
                            {subject}
                            {item.resultnew && <span className="text-red-600 dark:text-red-400 font-medium font-quran"> : {item.resultnew}</span>}
                        </p>
                        {item.reading && (
                            <div className="mt-2 mb-1 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                                <p className="text-base md:text-lg text-blue-800 dark:text-blue-300 font-quran font-bold leading-relaxed text-right" dir="rtl">{item.reading}</p>
                            </div>
                        )}
                        {item.qareesrest && (
                            <p className="text-sm text-[#800000] dark:text-[#ff9999] font-arabic text-right mt-1" dir="rtl">
                                {item.qarees === 'الباقون' ? 'الباقون: ' : ''}{item.qareesrest}
                            </p>
                        )}
                    </div>
                    {(item.tags || item.page_number1 || item.page_number2) && (
                        <div className="flex flex-wrap gap-1.5 mt-4 border-t border-gray-50 dark:border-gray-700/30 pt-3">
                            {item.page_number1 && <span className="px-2 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-800/30 font-medium">مدينة: {item.page_number1}</span>}
                            {item.page_number2 && <span className="px-2 py-0.5 text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md border border-amber-100 dark:border-amber-800/30 font-medium">شمرلي: {item.page_number2}</span>}
                            {item.tags?.split(',').filter(Boolean).map((t, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800/30 font-medium">{t.trim()}</span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button type="button" onClick={handleCopy} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-600 hover:text-white text-gray-400 transition-all shadow-sm">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button type="button" onClick={handleShare} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-600 hover:text-white text-gray-400 transition-all shadow-sm">
                        <Share2 size={16} />
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dbState = useDatabase();
    const { dict, isRtl } = useLocale();
    const { settings } = useSettings();
    const { savedFilters, deleteFilter } = useSavedFilters();
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'text';
    const isDebug = searchParams.get('debug') === '1';
    const appliedFilters = useMemo(() => parseSearchFilters(searchParams), [searchParams]);
    const [results, setResults] = useState<QuranData[]>([]);
    const [query, setQuery] = useState(q);
    const [searchType, setSearchType] = useState(type);
    const [draftFilters, setDraftFilters] = useState<SearchFilterValues>(appliedFilters);
    const [showFilters, setShowFilters] = useState(searchParams.get('showFilters') === 'true');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showSqlDebug, setShowSqlDebug] = useState(false);
    const [sqlCopied, setSqlCopied] = useState(false);
    const allTags = useMemo<Tagsmaster[]>(() => dbState.status === 'ready' ? getAllTags(dbState.db) : [], [dbState]);
    const allQarees = useMemo<Qareemaster[]>(() => dbState.status === 'ready' ? getAllQarees(dbState.db) : [], [dbState]);
    const allSurahs = useMemo<QuranSora[]>(() => dbState.status === 'ready' ? getAllSurahs(dbState.db) : [], [dbState]);

    useEffect(() => {
        const applySaved = searchParams.get('applySaved');
        if (!applySaved) return;
        const match = savedFilters.find(f => f.name === applySaved);
        if (match) navigate(buildSearchUrl('', 'text', savedFilterToValues(match)), { replace: true });
    }, [searchParams, savedFilters, navigate]);

    useEffect(() => {
        if (searchParams.get('applySaved')) return;
        setQuery(q);
        setSearchType(type);
        setDraftFilters(appliedFilters);
        setShowFilters(searchParams.get('showFilters') === 'true');
    }, [q, type, appliedFilters, searchParams]);

    const buildOpts = useCallback((currentPage: number): SearchOptions => {
        const opts = filtersToOptions(appliedFilters);
        opts.limit = settings.resultsPerPage;
        opts.offset = currentPage * settings.resultsPerPage;
        return opts;
    }, [appliedFilters, settings.resultsPerPage]);

    const fetchResults = useCallback((currentPage: number, append: boolean) => {
        if (dbState.status !== 'ready') return;
        const activeAppliedFilters = hasActiveSearchFilters(appliedFilters);
        if (!q && !activeAppliedFilters) {
            if (!append) setResults([]);
            setHasMore(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setTimeout(() => {
            const opts = buildOpts(currentPage);
            let newResults: QuranData[] = [];
            if (type === 'root') newResults = searchRoot(dbState.db, q, opts);
            else if (type === 'reading') newResults = searchReading(dbState.db, q, opts);
            else if (type === 'tag') newResults = searchTag(dbState.db, q, opts);
            else newResults = searchText(dbState.db, q || '%', opts);
            setResults(prev => append ? [...prev, ...newResults] : newResults);
            setHasMore(newResults.length === settings.resultsPerPage);
            setIsSearching(false);
        }, 0);
    }, [appliedFilters, buildOpts, dbState, q, type, settings.resultsPerPage]);

    useEffect(() => {
        setPage(0);
        fetchResults(0, false);
    }, [fetchResults]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        navigate(buildSearchUrl(query, searchType, draftFilters));
    };
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(nextPage, true);
    };
    const debugSql = useMemo(() => {
        if (!isDebug) return '';
        const opts = filtersToOptions(appliedFilters);
        opts.limit = 200;
        opts.offset = page * 200;
        return getSearchSql((type === 'root' || type === 'reading' || type === 'tag' ? type : 'text') as 'text' | 'root' | 'reading' | 'tag', q || '', opts);
    }, [isDebug, appliedFilters, page, type, q]);
    const handleCopySql = async () => {
        try {
            await navigator.clipboard.writeText(debugSql);
            setSqlCopied(true);
            setTimeout(() => setSqlCopied(false), 2000);
        } catch { /* ignore */ }
    };

    const hasAppliedFilters = hasActiveSearchFilters(appliedFilters);
    const isLoading = dbState.status === 'loading' || dbState.status === 'idle';

    return (
        <main className="min-h-screen p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+1rem)]" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1 min-w-0">
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={searchType === 'reading' ? dict.search.readingHint : dict.search.placeholder}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-base"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors shrink-0">
                            <Search size={17} /> {dict.search.button}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(v => !v)}
                            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 text-sm font-medium transition-all shrink-0
                                ${hasActiveSearchFilters(draftFilters)
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-600 dark:text-blue-300'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-300'
                                }`}
                        >
                            <Filter size={16} />
                            {hasActiveSearchFilters(draftFilters) && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                        </button>
                    </div>
                    <ActiveFilterChips filters={draftFilters} onChange={setDraftFilters} allTags={allTags} allQarees={allQarees} allSurahs={allSurahs} dict={dict} showClear />
                    {showFilters && (
                        <SearchFilters
                            filters={draftFilters}
                            onChange={setDraftFilters}
                            allTags={allTags}
                            allQarees={allQarees}
                            allSurahs={allSurahs}
                            savedFilters={savedFilters}
                            deleteFilter={deleteFilter}
                            dict={dict}
                            isRtl={isRtl}
                        />
                    )}
                </form>

                {isDebug && showFilters && (
                    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <button type="button" onClick={() => setShowSqlDebug(v => !v)} className="flex items-center gap-1.5 text-xs font-mono text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors select-none">
                            <span className={`transition-transform duration-150 ${showSqlDebug ? 'rotate-90' : ''}`}>▶</span>
                            SQL Debug
                        </button>
                        {showSqlDebug && (
                            <div className="mt-2 relative">
                                <pre dir="ltr" className="text-[11px] leading-relaxed font-mono bg-gray-900 dark:bg-black text-green-400 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-all">{debugSql}</pre>
                                <button type="button" onClick={handleCopySql} className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors" title="Copy SQL">
                                    {sqlCopied ? <Check size={13} /> : <Copy size={13} />}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6">
                    {isLoading || isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 font-arabic">{isLoading ? (isRtl ? 'جاري تحميل قاعدة البيانات...' : 'Loading database...') : (isRtl ? 'جاري البحث...' : 'Searching...')}</p>
                        </div>
                    ) : dbState.status === 'error' ? (
                        <p className="text-red-500">Error: {dbState.error}</p>
                    ) : (
                        <>
                            {(q || hasAppliedFilters) && (
                                <h1 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-200">
                                    {q && <>{dict.search.resultsFor} «{q}»{' '}</>}
                                    <span className="text-gray-400 font-normal text-sm">({results.length} {dict.search.found})</span>
                                </h1>
                            )}
                            <div className="space-y-3">
                                {results.length === 0 && (q || hasAppliedFilters)
                                    ? <p className="text-gray-500 text-center py-8">{dict.search.noResults}</p>
                                    : <>
                                        {results.map(item => <ResultCard key={`${item.sora}-${item.aya}-${item.id}`} item={item} />)}
                                        {hasMore && (
                                            <div className="flex justify-center pt-4 pb-8">
                                                <button type="button" onClick={handleLoadMore} className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                                                    {dict.search.loadMore}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                }
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
