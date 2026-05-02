import { useState } from 'react';
import { Bookmark, Trash2, X } from 'lucide-react';
import type { Qareemaster, QuranSora, SavedFilter, Tagsmaster } from '../lib/types';
import { FARSH_TAG, savedFilterToValues, type SearchFilterValues } from '../lib/searchFilters';

type TagFilterMode = 'include' | 'exclude';
type SearchDict = { search: Record<string, string> };

interface SearchFiltersProps {
    filters: SearchFilterValues;
    onChange: (filters: SearchFilterValues) => void;
    allTags: Tagsmaster[];
    allQarees: Qareemaster[];
    allSurahs: QuranSora[];
    savedFilters: SavedFilter[];
    deleteFilter: (name: string) => void;
    dict: SearchDict;
    isRtl: boolean;
    showSavedFilters?: boolean;
}

function unique(values: string[]): string[] {
    return Array.from(new Set(values));
}

function without(values: string[], value: string): string[] {
    return values.filter(x => x !== value);
}

function TagChip({ tag, mode, selected, onClick }: { tag: Tagsmaster; mode: TagFilterMode; selected: boolean; onClick: () => void }) {
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

function QareeChip({ qaree, selected, onClick, small }: { qaree: Qareemaster; selected: boolean; onClick: () => void; small?: boolean }) {
    if (!small) {
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

export function ActiveFilterChips({ filters, onChange, allTags, allQarees, allSurahs, dict, showClear = false }: {
    filters: SearchFilterValues;
    onChange: (filters: SearchFilterValues) => void;
    allTags: Tagsmaster[];
    allQarees: Qareemaster[];
    allSurahs: QuranSora[];
    dict: SearchDict;
    showClear?: boolean;
}) {
    const chips: { key: string; label: string; remove: () => void; tone?: string }[] = [];
    const tagLabel = (tag: string) => allTags.find(x => x.tag === tag)?.description || tag;
    const qareeLabel = (qkey: string) => allQarees.find(x => x.qkey === qkey)?.sname || qkey;
    const sura = allSurahs.find(x => x.sora === filters.sora);
    const clearFilters = () => onChange({ includeTags: [], excludeTags: [], includeQarees: [], excludeHafsa: false, wholeWord: false, sora: 0, allQareesSelected: true });

    if (filters.sora > 0) chips.push({ key: 'sora', label: `${dict.search.sora}: ${sura ? `${sura.sora} - ${sura.sora_name}` : filters.sora}`, remove: () => onChange({ ...filters, sora: 0 }) });
    if (filters.wholeWord) chips.push({ key: 'wholeWord', label: dict.search.wholeWord, remove: () => onChange({ ...filters, wholeWord: false }) });
    if (filters.excludeHafsa) chips.push({ key: 'excludeHafsa', label: dict.search.excludeHafsa, remove: () => onChange({ ...filters, excludeHafsa: false }), tone: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' });
    if (filters.includeTags.includes(FARSH_TAG)) chips.push({ key: 'farsh', label: dict.search.farshOnly, remove: () => onChange({ ...filters, includeTags: without(filters.includeTags, FARSH_TAG) }) });
    filters.includeTags.filter(t => t !== FARSH_TAG).forEach(tag => chips.push({ key: `it-${tag}`, label: `✓ ${tagLabel(tag)}`, remove: () => onChange({ ...filters, includeTags: without(filters.includeTags, tag) }), tone: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' }));
    filters.excludeTags.forEach(tag => chips.push({ key: `et-${tag}`, label: `✕ ${tagLabel(tag)}`, remove: () => onChange({ ...filters, excludeTags: without(filters.excludeTags, tag) }), tone: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' }));
    if (!filters.allQareesSelected) filters.includeQarees.forEach(qkey => chips.push({ key: `q-${qkey}`, label: qareeLabel(qkey), remove: () => onChange({ ...filters, includeQarees: without(filters.includeQarees, qkey) }) }));

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5" aria-label={dict.search.selectedFilters}>
            {chips.map(chip => (
                <span key={chip.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${chip.tone || 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`}>
                    {chip.label}
                    <button type="button" onClick={chip.remove} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <X size={12} />
                    </button>
                </span>
            ))}
            {showClear && (
                <button type="button" onClick={clearFilters} className="ms-auto inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                    <X size={12} /> {dict.search.clearFilters}
                </button>
            )}
        </div>
    );
}

export default function SearchFilters({ filters, onChange, allTags, allQarees, allSurahs, savedFilters, deleteFilter, dict, isRtl, showSavedFilters = true }: SearchFiltersProps) {
    const [tagFilterMode, setTagFilterMode] = useState<TagFilterMode>('include');

    const set = (patch: Partial<SearchFilterValues>) => onChange({ ...filters, ...patch });
    const toggleIncludeTag = (tag: string) => {
        const includeTags = filters.includeTags.includes(tag) ? without(filters.includeTags, tag) : unique([...filters.includeTags, tag]);
        onChange({ ...filters, includeTags, excludeTags: without(filters.excludeTags, tag) });
    };
    const toggleExcludeTag = (tag: string) => {
        const excludeTags = filters.excludeTags.includes(tag) ? without(filters.excludeTags, tag) : unique([...filters.excludeTags, tag]);
        onChange({ ...filters, excludeTags, includeTags: without(filters.includeTags, tag) });
    };
    const toggleQaree = (qkey: string) => set({ includeQarees: filters.includeQarees.includes(qkey) ? without(filters.includeQarees, qkey) : unique([...filters.includeQarees, qkey]) });

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200 me-2">{dict.search.filters}</h2>
                <select
                    value={filters.sora}
                    onChange={e => set({ sora: Number(e.target.value) })}
                    className="qeraat-select py-2 ps-3 pe-10 border rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-sm font-arabic outline-none focus:ring-2 focus:ring-blue-400 w-[140px] sm:w-[160px] truncate shadow-sm me-3"
                    title={dict.search.sora}
                >
                    <option value={0}>{isRtl ? 'جميع السور' : 'All Surahs'}</option>
                    {allSurahs.map(s => (
                        <option key={s.sora} value={s.sora}>{s.sora} - {s.sora_name}</option>
                    ))}
                </select>
                <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                    <input type="checkbox" checked={filters.wholeWord} onChange={e => set({ wholeWord: e.target.checked })} className="w-4 h-4 rounded accent-blue-600" />
                    <span>{dict.search.wholeWord}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                    <input type="checkbox" checked={filters.excludeHafsa} onChange={e => set({ excludeHafsa: e.target.checked })} className="w-4 h-4 rounded accent-red-500" />
                    <span className="text-red-600 dark:text-red-400">{dict.search.excludeHafsa}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                    <input type="checkbox" checked={filters.includeTags.includes(FARSH_TAG)} onChange={e => e.target.checked ? toggleIncludeTag(FARSH_TAG) : set({ includeTags: without(filters.includeTags, FARSH_TAG) })} className="w-4 h-4 rounded accent-emerald-600" />
                    <span>{dict.search.farshOnly}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                    <input type="checkbox" checked={filters.allQareesSelected} onChange={e => set({ allQareesSelected: e.target.checked, includeQarees: e.target.checked ? [] : filters.includeQarees })} className="w-4 h-4 rounded accent-blue-600" />
                    <span>{dict.search.allQarees}</span>
                </label>
            </div>

            {showSavedFilters && savedFilters.length > 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600 p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase tracking-wide">
                        <Bookmark size={12} /> {dict.search.savedFilters}
                    </p>
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {savedFilters.map(sf => (
                            <div key={sf.name} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <span className="text-sm font-arabic text-gray-700 dark:text-gray-200 truncate flex-1" title={sf.name}>{sf.name}</span>
                                <div className="flex gap-1 shrink-0">
                                    <button type="button" onClick={() => onChange(savedFilterToValues(sf))} className="px-2 py-1 text-[11px] font-medium rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors">
                                        {dict.search.applyFilter}
                                    </button>
                                    <button type="button" onClick={() => deleteFilter(sf.name)} className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={dict.search.deleteFilter}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!filters.allQareesSelected && allQarees.length > 0 && (() => {
                const qList = allQarees.filter(r => /^Q\d+$/.test(r.qkey));
                const rByQ = (qn: number) => allQarees.filter(r => /^R\d+_\d+$/.test(r.qkey) && r.qkey.startsWith(`R${qn}_`));
                return (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{dict.search.filterQarees}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center">
                            {qList.map((q, idx) => {
                                const qNum = parseInt(q.qkey.slice(1));
                                const rwayat = rByQ(qNum);
                                return (
                                    <div key={q.qkey} className="flex items-center gap-1">
                                        {idx > 0 && <span className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5 shrink-0" />}
                                        <QareeChip qaree={q} selected={filters.includeQarees.includes(q.qkey)} onClick={() => toggleQaree(q.qkey)} />
                                        {rwayat.map(r => <QareeChip key={r.qkey} qaree={r} selected={filters.includeQarees.includes(r.qkey)} onClick={() => toggleQaree(r.qkey)} small />)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {allTags.length > 0 && (
                <div>
                    <div className="flex items-center justify-start gap-3 mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {dict.home.tags}
                        </p>
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 text-xs">
                            <button type="button" onClick={() => setTagFilterMode('include')} className={`px-2.5 py-1 transition-colors ${tagFilterMode === 'include' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                                ✓ {dict.search.includeTags}
                            </button>
                            <button type="button" onClick={() => setTagFilterMode('exclude')} className={`px-2.5 py-1 transition-colors ${tagFilterMode === 'exclude' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                                ✕ {dict.search.excludeTags}
                            </button>
                        </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto pr-1">
                        <div className="flex flex-wrap gap-1.5">
                            {allTags.map(tag => (
                                <TagChip
                                    key={tag.tag}
                                    tag={tag}
                                    mode={tagFilterMode}
                                    selected={tagFilterMode === 'include' ? filters.includeTags.includes(tag.tag) : filters.excludeTags.includes(tag.tag)}
                                    onClick={() => tagFilterMode === 'include' ? toggleIncludeTag(tag.tag) : toggleExcludeTag(tag.tag)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
