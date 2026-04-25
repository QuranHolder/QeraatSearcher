import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search, Filter, X, Copy, Share2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { searchText, searchRoot, searchTag, getAllTags, getAllQarees } from '../lib/sqljs-db';
import { useLocale } from '../hooks/useLocale';
import type { QuranData, Tagsmaster, Qareemaster, SearchOptions } from '../lib/types';

// ─── Copy/Share helper ────────────────────────────────────────────────────────
function buildShareText(item: QuranData): string {
    const title = `${item.sora_name ?? `سورة ${item.sora}`}:${item.aya}`;
    const subject = item.sub_subject1 || item.sub_subject || '';
    const result = item.resultnew ? `${subject}: ${item.resultnew}` : subject;
    const reading = item.reading ? `\n${item.reading}` : '';
    const qarees = item.qarees ? `\n[${item.qarees}]` : '';
    const qareesrest = item.qareesrest ? `\n${item.qareesrest}` : '';
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
function QareeChip({ qaree, selected, onClick }: {
    qaree: Qareemaster;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button type="button" onClick={onClick}
            className={`cursor-pointer select-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border text-center
                ${selected
                    ? 'bg-blue-600 border-blue-600 text-white ring-1 ring-blue-400'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 bg-white dark:bg-gray-800'
                }`}>
            {qaree.name}
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
        ? `(${item.sora_name}:${item.aya})`
        : `(${item.sora}:${item.aya})`;

    const subject = item.sub_subject1 || item.sub_subject || '';
    const showResultNew = item.resultnew;

    return (
        <Link
            to={`/aya/${item.aya_index}`}
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 group"
        >
            <div className="flex justify-between items-start gap-3">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Sora:Aya badge */}
                    <span className="inline-block mb-2 text-xs font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800 font-arabic">
                        {soraAya}
                    </span>

                    {/* Subject */}
                    <p className="font-arabic font-bold text-right text-base leading-relaxed" dir="rtl">
                        {subject}
                        {showResultNew && (
                            <span className="text-gray-500 dark:text-gray-400 font-normal">: {item.resultnew}</span>
                        )}
                    </p>

                    {/* Reading */}
                    {item.reading && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-arabic" dir="rtl">
                            {item.reading}
                        </p>
                    )}

                    {/* Qarees rest */}
                    {item.qareesrest && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-arabic" dir="rtl">
                            {item.qareesrest}
                        </p>
                    )}

                    {/* Tags */}
                    {item.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.split(',').filter(Boolean).map((t, i) => (
                                <span key={i} className="px-1.5 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-100 dark:border-emerald-800">
                                    {t.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={handleCopy}
                        title="نسخ"
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        title="مشاركة"
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <Share2 size={14} />
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

    const [results, setResults] = useState<QuranData[]>([]);
    const [query, setQuery] = useState(q);
    const [searchType, setSearchType] = useState(type);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [allTags, setAllTags] = useState<Tagsmaster[]>([]);
    const [allQarees, setAllQarees] = useState<Qareemaster[]>([]);
    const [includeTags, setIncludeTags] = useState<Set<string>>(new Set());
    const [excludeTags, setExcludeTags] = useState<Set<string>>(new Set());
    const [includeQarees, setIncludeQarees] = useState<Set<string>>(new Set());
    const [excludeHafsa, setExcludeHafsa] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [tagFilterMode, setTagFilterMode] = useState<'include' | 'exclude'>('include');

    useEffect(() => { setQuery(q); setSearchType(type); }, [q, type]);

    // Load tags & qarees once DB is ready
    useEffect(() => {
        if (dbState.status !== 'ready') return;
        setAllTags(getAllTags(dbState.db));
        // Only Q1–Q10 keys
        const all = getAllQarees(dbState.db);
        setAllQarees(all.filter(r => /^Q\d+$/.test(r.qkey)));
    }, [dbState]);

    const buildOpts = useCallback((): SearchOptions => ({
        wholeWord,
        includeTags: includeTags.size > 0 ? Array.from(includeTags) : undefined,
        excludeTags: excludeTags.size > 0 ? Array.from(excludeTags) : undefined,
        includeQarees: includeQarees.size > 0 ? Array.from(includeQarees) : undefined,
        excludeHafsa,
    }), [wholeWord, includeTags, excludeTags, includeQarees, excludeHafsa]);

    useEffect(() => {
        if (dbState.status !== 'ready') { setResults([]); return; }
        const db = dbState.db;
        const opts = buildOpts();

        if (!q && includeTags.size === 0 && excludeTags.size === 0 && includeQarees.size === 0 && !excludeHafsa) {
            setResults([]);
            return;
        }

        if (type === 'root') setResults(searchRoot(db, q, opts));
        else if (type === 'tag') setResults(searchTag(db, q, opts));
        else setResults(searchText(db, q || '%', opts));
    }, [dbState, q, type, buildOpts, includeTags, excludeTags, includeQarees, excludeHafsa, wholeWord]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
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
    };

    const hasActiveFilters = includeTags.size > 0 || excludeTags.size > 0 || includeQarees.size > 0 || excludeHafsa || wholeWord;
    const isLoading = dbState.status === 'loading' || dbState.status === 'idle';
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;

    // Group tags by category
    const tagsByCategory = allTags.reduce<Record<string, Tagsmaster[]>>((acc, tag) => {
        const cat = tag.category || 'عام';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tag);
        return acc;
    }, {});

    return (
        <main className="min-h-screen p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link to="/" className="text-blue-500 hover:underline inline-flex items-center gap-1 mb-4 text-sm">
                    <BackIcon size={15} /> {dict.search.backToHome}
                </Link>

                {/* Search form */}
                <form onSubmit={handleSearch} className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={dict.search.placeholder}
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
                <div className="flex gap-4 mt-3">
                    {(['text', 'root', 'tag'] as const).map(t => (
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

                        {/* Qarees multi-select */}
                        {allQarees.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                    {dict.search.filterQarees}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {allQarees.map(q => (
                                        <QareeChip
                                            key={q.qkey}
                                            qaree={q}
                                            selected={includeQarees.has(q.qkey)}
                                            onClick={() => toggleQaree(q.qkey)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

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

                                {/* Tags grouped by category */}
                                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                    {Object.entries(tagsByCategory).map(([cat, tags]) => (
                                        <div key={cat}>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 font-arabic">{cat}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {tags.map(tag => (
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
                                    ))}
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
                    </div>
                )}

                {/* Results */}
                <div className="mt-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500">{isRtl ? 'جاري تحميل قاعدة البيانات...' : 'Loading database...'}</p>
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
                                    : results.map(item => (
                                        <ResultCard key={`${item.sora}-${item.aya}-${item.id}`} item={item} />
                                    ))
                                }
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
