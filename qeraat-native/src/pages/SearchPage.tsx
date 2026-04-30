import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X, Copy, Share2, Check, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { searchText, searchRoot, searchReading, searchTag, getAllTags, getAllQarees, getSearchSql, getAllSurahs, getAyahsForSora } from '../lib/sqljs-db';
import { useLocale } from '../hooks/useLocale';
import { useSavedFilters } from '../hooks/useSavedFilters';
import { useSettings } from '../hooks/useSettings';
import type { QuranData, Tagsmaster, Qareemaster, SearchOptions, QuranSora, BookQuran } from '../lib/types';

// ─── Copy/Share helper ────────────────────────────────────────────────────────
function buildShareText(item: QuranData): string {
    const title = `${item.sora_name ?? `سورة ${item.sora}`}:${item.aya}`;
    const subject = item.sub_subject1 || item.sub_subject || '';
    const result = item.resultnew ? `${subject}: ${item.resultnew}` : subject;
    const reading = item.reading ? `\n${item.reading}` : '';
    const qarees = item.qarees ? `\n[${item.qarees}]` : '';
    const qareesrest = item.qareesrest ? (item.qarees === 'الباقون' ? `\nالباقون: ${item.qareesrest}` : `\n${item.qareesrest}`) : '';
    return `${title}\n${result}${reading}${qarees}${qareesrest}`;
}

// ─── Tag chip component ───────────────────────────────────────────────────────
function TagChip({ tag, mode, selected, onClick }: {
    tag: Tagsmaster;
    mode: 'include' | 'exclude';
    selected: boolean;
    onClick: () => void;
}) {
    const baseClass = 'cursor-pointer select-none px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border';
    if (!selected) {
        return (
            <button type="button" onClick={onClick}
                className={`${baseClass} border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white dark:bg-gray-800`}>
                {tag.description || tag.tag}
            </button>
        );
    }
    if (mode === 'include') {
        return (
            <button type="button" onClick={onClick}
                className={`${baseClass} bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-400`}>
                ✓ {tag.description || tag.tag}
            </button>
        );
    }
    return (
        <button type="button" onClick={onClick}
            className={`${baseClass} bg-red-100 dark:bg-red-900/50 border-red-500 text-red-700 dark:text-red-300 ring-1 ring-red-400`}>
            ✕ {tag.description || tag.tag}
        </button>
    );
}

// ─── QareeChip ────────────────────────────────────────────────────────────────
function QareeChip({ qaree, selected, onClick, small }: {
    qaree: Qareemaster;
    selected: boolean;
    onClick: () => void;
    small?: boolean;
}) {
    if (!small) {
        // ── Main qaree (Q1..Q10) ────────────────────────────────────────────
        return (
            <button type="button" onClick={onClick}
                className={`cursor-pointer select-none rounded-lg font-medium transition-all duration-150 border text-center font-arabic px-3 py-1.5 text-xs shadow-sm
                    ${selected
                        ? 'bg-blue-600 border-blue-500 text-white ring-1 ring-blue-400 shadow-blue-200 dark:shadow-blue-900'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold'
                    }`}>
                {qaree.sname}
            </button>
        );
    }

    // ── Sub narrator (R*) ───────────────────────────────────────────────────
    return (
        <button type="button" onClick={onClick}
            className={`cursor-pointer select-none rounded-md font-medium transition-all duration-150 border text-center font-arabic px-2 py-0.5 text-[11px]
                ${selected
                    ? 'bg-violet-500 border-violet-500 text-white ring-1 ring-violet-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-violet-600 dark:text-violet-300 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                }`}>
            {qaree.sname}
        </button>
    );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────
function ResultCard({ item }: { item: QuranData }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const text = buildShareText(item);
        try {
            await navigator.clipboard.writeText(text);
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

    const soraAya = item.sora_name
        ? `${item.sora_name}:${item.aya}`
        : `${item.sora}:${item.aya}`;

    const subject = item.sub_subject1 || item.sub_subject || '';
    const showResultNew = item.resultnew;

    return (
        <Link
            to={`/aya/${item.aya_index}`}
            className="block p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group relative overflow-hidden"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />

            <div className="flex justify-between items-start gap-4 relative z-10">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                        {/* Sora:Aya badge */}
                        <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-sm font-arabic">
                            ({soraAya})
                        </span>

                        {/* Reading ID Badge (Subtle) */}
                        <span className="text-[10px] text-gray-400 font-medium">#{item.id}</span>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                        <p className="font-quran font-bold text-right text-xl leading-relaxed text-gray-800 dark:text-gray-100" dir="rtl">
                            {subject}
                            {showResultNew && (
                                <span className="text-red-600 dark:text-red-400 font-medium font-quran"> : {item.resultnew}</span>
                            )}
                        </p>

                        {/* Reading */}
                        {item.reading && (
                            <div className="mt-2 mb-1 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                                <p className="text-base md:text-lg text-blue-800 dark:text-blue-300 font-quran font-bold leading-relaxed text-right" dir="rtl">
                                    {item.reading}
                                </p>
                            </div>
                        )}

                        {/* Qarees rest */}
                        {item.qareesrest && (
                            <p className="text-sm text-[#800000] dark:text-[#ff9999] font-arabic text-right mt-1" dir="rtl">
                                {item.qarees === 'الباقون' ? 'الباقون: ' : ''}{item.qareesrest}
                            </p>
                        )}
                    </div>

                    {/* Tags Footer */}
                    {item.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-4 border-t border-gray-50 dark:border-gray-700/30 pt-3">
                            {item.tags.split(',').filter(Boolean).map((t, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800/30 font-medium">
                                    {t.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vertical Actions Tray */}
                <div className="flex flex-col gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-600 hover:text-white text-gray-400 transition-all shadow-sm"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-600 hover:text-white text-gray-400 transition-all shadow-sm"
                    >
                        <Share2 size={16} />
                    </button>
                </div>
            </div>
        </Link>
    );
}

// ─── Main SearchPage ──────────────────────────────────────────────────────────
export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'text';
    const dbState = useDatabase();
    const { dict, isRtl } = useLocale();
    const { settings } = useSettings();

    const [results, setResults] = useState<QuranData[]>([]);
    const [query, setQuery] = useState(q);
    const [searchType, setSearchType] = useState(type);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isSearching, setIsSearching] = useState(() => !!searchParams.get('applySaved'));

    // Filters
    const initShowFilters = searchParams.get('showFilters') === 'true';
    const [showFilters, setShowFilters] = useState(initShowFilters);
    const [allTags, setAllTags] = useState<Tagsmaster[]>([]);
    const [allQarees, setAllQarees] = useState<Qareemaster[]>([]);
    const [includeTags, setIncludeTags] = useState<Set<string>>(new Set());
    const [excludeTags, setExcludeTags] = useState<Set<string>>(new Set());
    const [includeQarees, setIncludeQarees] = useState<Set<string>>(new Set());
    const [excludeHafsa, setExcludeHafsa] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [tagFilterMode, setTagFilterMode] = useState<'include' | 'exclude'>('include');

    const [allSurahs, setAllSurahs] = useState<QuranSora[]>([]);
    const [selectedSora, setSelectedSora] = useState<number>(() => Number(searchParams.get('sora')) || 0);
    const [fromAya, setFromAya] = useState<number>(() => Number(searchParams.get('fromAya')) || 0);
    const [toAya, setToAya] = useState<number>(() => Number(searchParams.get('toAya')) || 0);
    const [soraAyahs, setSoraAyahs] = useState<BookQuran[]>([]);

    // SQL debug panel
    const [showSqlDebug, setShowSqlDebug] = useState(false);
    const [sqlCopied, setSqlCopied] = useState(false);

    // Saved filters
    const { savedFilters, saveFilter, deleteFilter } = useSavedFilters();
    const [filterName, setFilterName] = useState('');
    const [filterSavedFlash, setFilterSavedFlash] = useState(false);

    useEffect(() => { setQuery(q); setSearchType(type); }, [q, type]);

    // Apply a saved filter when navigated from the Sidebar
    useEffect(() => {
        const applySaved = searchParams.get('applySaved');
        if (!applySaved) return;
        const match = savedFilters.find(f => f.name === applySaved);
        if (match) applyFilter(match);
        else setIsSearching(false); // if not found, disable spinner
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run only on mount


    // Load tags & qarees once DB is ready
    useEffect(() => {
        if (dbState.status !== 'ready') return;
        setAllTags(getAllTags(dbState.db));
        // Keep all Q and R rows
        setAllQarees(getAllQarees(dbState.db));
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

    const buildOpts = useCallback((): SearchOptions => ({
        wholeWord,
        includeTags: includeTags.size > 0 ? Array.from(includeTags) : undefined,
        excludeTags: excludeTags.size > 0 ? Array.from(excludeTags) : undefined,
        includeQarees: includeQarees.size > 0 ? Array.from(includeQarees) : undefined,
        excludeHafsa,
        sora: selectedSora > 0 ? selectedSora : undefined,
        fromAya: fromAya > 0 ? fromAya : undefined,
        toAya: toAya > 0 ? toAya : undefined,
    }), [wholeWord, includeTags, excludeTags, includeQarees, excludeHafsa, selectedSora, fromAya, toAya]);

    const fetchResults = useCallback((currentPage: number, append: boolean) => {
        if (dbState.status !== 'ready') return;
        const db = dbState.db;
        const opts = buildOpts();
        opts.limit = settings.resultsPerPage;
        opts.offset = currentPage * settings.resultsPerPage;

        if (!q && includeTags.size === 0 && excludeTags.size === 0 && includeQarees.size === 0 && !excludeHafsa && selectedSora === 0) {
            if (!append) setResults([]);
            setHasMore(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        // Use setTimeout to allow the spinner to render before the synchronous SQL runs
        setTimeout(() => {
            let newResults: QuranData[] = [];
            if (type === 'root') newResults = searchRoot(db, q, opts);
            else if (type === 'reading') newResults = searchReading(db, q, opts);
            else if (type === 'tag') newResults = searchTag(db, q, opts);
            else newResults = searchText(db, q || '%', opts);

            if (append) {
                setResults(prev => [...prev, ...newResults]);
            } else {
                setResults(newResults);
            }
            setHasMore(newResults.length === settings.resultsPerPage);
            setIsSearching(false);
        }, 0);
    }, [dbState, q, type, buildOpts, settings.resultsPerPage]);

    useEffect(() => {
        setPage(0);
        fetchResults(0, false);
    }, [fetchResults]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(nextPage, true);
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        let url = `/search?q=${encodeURIComponent(query)}&type=${searchType}`;
        if (selectedSora > 0) url += `&sora=${selectedSora}`;
        if (fromAya > 0) url += `&fromAya=${fromAya}`;
        if (toAya > 0) url += `&toAya=${toAya}`;
        navigate(url);
    };

    const toggleIncludeTag = (tag: string) => {
        setIncludeTags(prev => {
            const n = new Set(prev);
            if (n.has(tag)) n.delete(tag); else n.add(tag);
            return n;
        });
        setExcludeTags(prev => { const n = new Set(prev); n.delete(tag); return n; });
    };

    const toggleExcludeTag = (tag: string) => {
        setExcludeTags(prev => {
            const n = new Set(prev);
            if (n.has(tag)) n.delete(tag); else n.add(tag);
            return n;
        });
        setIncludeTags(prev => { const n = new Set(prev); n.delete(tag); return n; });
    };

    const toggleQaree = (qkey: string) => {
        setIncludeQarees(prev => {
            const n = new Set(prev);
            if (n.has(qkey)) n.delete(qkey); else n.add(qkey);
            return n;
        });
    };

    const clearFilters = () => {
        setIncludeTags(new Set());
        setExcludeTags(new Set());
        setIncludeQarees(new Set());
        setExcludeHafsa(false);
        setWholeWord(false);
        setSelectedSora(0);
        setFromAya(0);
        setToAya(0);
    };

    const handleSaveFilter = () => {
        const name = filterName.trim();
        if (!name) return;
        saveFilter({
            name,
            includeTags: Array.from(includeTags),
            excludeTags: Array.from(excludeTags),
            includeQarees: Array.from(includeQarees),
            excludeHafsa,
            wholeWord,
            sora: selectedSora > 0 ? selectedSora : undefined,
            fromAya: fromAya > 0 ? fromAya : undefined,
            toAya: toAya > 0 ? toAya : undefined,
        });
        setFilterName('');
        setFilterSavedFlash(true);
        setTimeout(() => setFilterSavedFlash(false), 2000);
    };

    const applyFilter = (filter: import('../lib/types').SavedFilter) => {
        setIsSearching(true);
        setIncludeTags(new Set(filter.includeTags));
        setExcludeTags(new Set(filter.excludeTags));
        setIncludeQarees(new Set(filter.includeQarees));
        setExcludeHafsa(filter.excludeHafsa);
        setWholeWord(filter.wholeWord);
        setSelectedSora(filter.sora || 0);
        setFromAya(filter.fromAya || 0);
        setToAya(filter.toAya || 0);
    };

    const hasActiveFilters = includeTags.size > 0 || excludeTags.size > 0 || includeQarees.size > 0 || excludeHafsa || wholeWord || selectedSora > 0 || fromAya > 0 || toAya > 0;
    const isLoading = dbState.status === 'loading' || dbState.status === 'idle';

    // Compute debug SQL whenever filter/query/type changes
    const debugSql = (() => {
        const opts = buildOpts();
        opts.limit = 200;
        opts.offset = page * 200;
        return getSearchSql(
            (type === 'root' || type === 'reading' || type === 'tag' ? type : 'text') as 'text' | 'root' | 'reading' | 'tag',
            q || '',
            opts
        );
    })();

    const handleCopySql = async () => {
        try {
            await navigator.clipboard.writeText(debugSql);
            setSqlCopied(true);
            setTimeout(() => setSqlCopied(false), 2000);
        } catch { /* ignore */ }
    };



    return (
        <main className="min-h-screen p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+1rem)]" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">

                {/* ── Sora and Aya Filter (Main Screen) ── */}
                <div className="flex flex-wrap gap-2 mb-2 items-center" dir={isRtl ? 'rtl' : 'ltr'}>
                    <select 
                        value={selectedSora} 
                        onChange={e => setSelectedSora(Number(e.target.value))}
                        className="py-1.5 px-2 border rounded-xl bg-white dark:bg-gray-800 text-sm font-arabic outline-none focus:ring-2 focus:ring-blue-400 w-[120px] sm:w-[140px] truncate"
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
                                className="py-1.5 px-2 border rounded-xl bg-white dark:bg-gray-800 text-sm font-arabic outline-none focus:ring-2 focus:ring-blue-400 w-[110px] sm:w-[130px] truncate"
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
                                className="py-1.5 px-2 border rounded-xl bg-white dark:bg-gray-800 text-sm font-arabic outline-none focus:ring-2 focus:ring-blue-400 w-[110px] sm:w-[130px] truncate"
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

                {/* Search form */}
                <form onSubmit={handleSearch} className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={searchType === 'reading' ? dict.search.readingHint : dict.search.placeholder}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-base"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors">
                        <Search size={17} /> {dict.search.button}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowFilters(v => !v)}
                        className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 text-sm font-medium transition-all
                            ${hasActiveFilters
                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-600 dark:text-blue-300'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-300'
                            }`}
                    >
                        <Filter size={16} />
                        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                    </button>
                </form>

                {/* Search type radio */}
                <div className="flex gap-4 mt-3" dir={isRtl ? 'rtl' : 'ltr'}>
                    {(['text', 'root', 'tag', 'reading'] as const).map(t => (
                        <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm">
                            <input type="radio" value={t} checked={searchType === t} onChange={() => setSearchType(t)} className="w-3.5 h-3.5 accent-blue-600" />
                            {dict.search[t]}
                        </label>
                    ))}
                </div>

                {/* ── Filter Panel ── */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                <Filter size={16} /> {dict.search.filters}
                            </h2>
                            {hasActiveFilters && (
                                <button type="button" onClick={clearFilters}
                                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                                    <X size={13} /> {dict.search.clearFilters}
                                </button>
                            )}
                        </div>

                        {/* ── Saved Filters ── */}
                        {savedFilters.length > 0 && (
                            <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600 p-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase tracking-wide">
                                    <Bookmark size={12} /> {dict.search.savedFilters}
                                </p>
                                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                                    {savedFilters.map(sf => (
                                        <div key={sf.name}
                                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                            <span className="text-sm font-arabic text-gray-700 dark:text-gray-200 truncate flex-1" title={sf.name}>
                                                {sf.name}
                                            </span>
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => applyFilter(sf)}
                                                    className="px-2 py-1 text-[11px] font-medium rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors"
                                                >
                                                    {dict.search.applyFilter}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteFilter(sf.name)}
                                                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title={dict.search.deleteFilter}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Save current filter ── */}
                        {hasActiveFilters && (
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={filterName}
                                        onChange={e => setFilterName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveFilter()}
                                        placeholder={dict.search.filterNamePlaceholder}
                                        className="w-full text-sm px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 font-arabic"
                                        dir="rtl"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveFilter}
                                    disabled={!filterName.trim()}
                                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                        ${filterSavedFlash
                                            ? 'bg-emerald-500 text-white'
                                            : filterName.trim()
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {filterSavedFlash
                                        ? <><BookmarkCheck size={15} /> {dict.search.filterSaved}</>
                                        : <><Bookmark size={15} /> {dict.search.saveFilter}</>
                                    }
                                </button>
                            </div>
                        )}

                        {/* Quick options row */}
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                                <input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)}
                                    className="w-4 h-4 rounded accent-blue-600" />
                                <span>{dict.search.wholeWord}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                                <input type="checkbox" checked={excludeHafsa} onChange={e => setExcludeHafsa(e.target.checked)}
                                    className="w-4 h-4 rounded accent-red-500" />
                                <span className="text-red-600 dark:text-red-400">{dict.search.excludeHafsa}</span>
                            </label>
                        </div>

                        {/* Qarees multi-select – compact inline: Q chip + R chips per row */}
                        {allQarees.length > 0 && (() => {
                            const qList = allQarees.filter(r => /^Q\d+$/.test(r.qkey));
                            const rByQ = (qn: number) =>
                                allQarees.filter(r => /^R\d+_\d+$/.test(r.qkey) && r.qkey.startsWith(`R${qn}_`));
                            return (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                        {dict.search.filterQarees}
                                    </p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center">
                                        {qList.map((q, idx) => {
                                            const qNum = parseInt(q.qkey.slice(1));
                                            const rwayat = rByQ(qNum);
                                            return (
                                                <div key={q.qkey} className="flex items-center gap-1">
                                                    {/* separator between groups */}
                                                    {idx > 0 && (
                                                        <span className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5 shrink-0" />
                                                    )}
                                                    {/* Q chip */}
                                                    <QareeChip
                                                        qaree={q}
                                                        selected={includeQarees.has(q.qkey)}
                                                        onClick={() => toggleQaree(q.qkey)}
                                                    />
                                                    {/* R chips inline */}
                                                    {rwayat.map(r => (
                                                        <QareeChip
                                                            key={r.qkey}
                                                            qaree={r}
                                                            selected={includeQarees.has(r.qkey)}
                                                            onClick={() => toggleQaree(r.qkey)}
                                                            small
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Tags filter mode toggle */}
                        {allTags.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        {tagFilterMode === 'include' ? dict.search.includeTags : dict.search.excludeTags}
                                    </p>
                                    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 text-xs">
                                        <button type="button"
                                            onClick={() => setTagFilterMode('include')}
                                            className={`px-2.5 py-1 transition-colors ${tagFilterMode === 'include' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                                            ✓ {dict.search.includeTags}
                                        </button>
                                        <button type="button"
                                            onClick={() => setTagFilterMode('exclude')}
                                            className={`px-2.5 py-1 transition-colors ${tagFilterMode === 'exclude' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                                            ✕ {dict.search.excludeTags}
                                        </button>
                                    </div>
                                </div>

                                {/* Tags flat list */}
                                <div className="max-h-56 overflow-y-auto pr-1">
                                    <div className="flex flex-wrap gap-1.5">
                                        {allTags.map(tag => (
                                            <TagChip
                                                key={tag.tag}
                                                tag={tag}
                                                mode={tagFilterMode}
                                                selected={tagFilterMode === 'include' ? includeTags.has(tag.tag) : excludeTags.has(tag.tag)}
                                                onClick={() => tagFilterMode === 'include'
                                                    ? toggleIncludeTag(tag.tag)
                                                    : toggleExcludeTag(tag.tag)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Active filter badges summary */}
                                {(includeTags.size > 0 || excludeTags.size > 0) && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {Array.from(includeTags).map(t => (
                                            <span key={t} className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-300">
                                                ✓ {allTags.find(x => x.tag === t)?.description || t}
                                                <button type="button" onClick={() => toggleIncludeTag(t)}><X size={10} /></button>
                                            </span>
                                        ))}
                                        {Array.from(excludeTags).map(t => (
                                            <span key={t} className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full border border-red-300">
                                                ✕ {allTags.find(x => x.tag === t)?.description || t}
                                                <button type="button" onClick={() => toggleExcludeTag(t)}><X size={10} /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── SQL Debug Panel ── */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowSqlDebug(v => !v)}
                                className="flex items-center gap-1.5 text-xs font-mono text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors select-none"
                            >
                                <span className={`transition-transform duration-150 ${showSqlDebug ? 'rotate-90' : ''}`}>▶</span>
                                SQL Debug
                            </button>
                            {showSqlDebug && (
                                <div className="mt-2 relative">
                                    <pre
                                        dir="ltr"
                                        className="text-[11px] leading-relaxed font-mono bg-gray-900 dark:bg-black text-green-400 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-all"
                                    >
                                        {debugSql}
                                    </pre>
                                    <button
                                        type="button"
                                        onClick={handleCopySql}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                                        title="Copy SQL"
                                    >
                                        {sqlCopied ? <Check size={13} /> : <Copy size={13} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="mt-6">
                    {isLoading || isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 font-arabic">
                                {isLoading
                                    ? (isRtl ? 'جاري تحميل قاعدة البيانات...' : 'Loading database...')
                                    : (isRtl ? 'جاري البحث...' : 'Searching…')
                                }
                            </p>
                        </div>
                    ) : dbState.status === 'error' ? (
                        <p className="text-red-500">Error: {dbState.error}</p>
                    ) : (
                        <>
                            {(q || hasActiveFilters) && (
                                <h1 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-200">
                                    {q && <>{dict.search.resultsFor} «{q}»{' '}</>}
                                    <span className="text-gray-400 font-normal text-sm">({results.length} {dict.search.found})</span>
                                </h1>
                            )}
                            <div className="space-y-3">
                                {results.length === 0 && (q || hasActiveFilters)
                                    ? <p className="text-gray-500 text-center py-8">{dict.search.noResults}</p>
                                    : <>
                                        {results.map(item => (
                                            <ResultCard key={`${item.sora}-${item.aya}-${item.id}`} item={item} />
                                        ))}
                                        {hasMore && (
                                            <div className="flex justify-center pt-4 pb-8">
                                                <button
                                                    type="button"
                                                    onClick={handleLoadMore}
                                                    className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                                >
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
