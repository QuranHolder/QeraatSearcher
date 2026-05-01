import type { SavedFilter, SearchOptions } from './types';

export const FARSH_TAG = 'farsh';

export interface SearchFilterValues {
    includeTags: string[];
    excludeTags: string[];
    includeQarees: string[];
    excludeHafsa: boolean;
    wholeWord: boolean;
    sora: number;
    allQareesSelected: boolean;
}

export const emptySearchFilters: SearchFilterValues = {
    includeTags: [],
    excludeTags: [],
    includeQarees: [],
    excludeHafsa: false,
    wholeWord: false,
    sora: 0,
    allQareesSelected: true,
};

function parseList(value: string | null): string[] {
    return value ? value.split(',').map(x => x.trim()).filter(Boolean) : [];
}

function setList(params: URLSearchParams, key: string, values: string[]) {
    if (values.length > 0) params.set(key, values.join(','));
}

export function parseSearchFilters(params: URLSearchParams): SearchFilterValues {
    const includeQarees = parseList(params.get('qarees'));
    return {
        includeTags: parseList(params.get('includeTags')),
        excludeTags: parseList(params.get('excludeTags')),
        includeQarees,
        excludeHafsa: params.get('excludeHafsa') === '1',
        wholeWord: params.get('wholeWord') === '1',
        sora: Number(params.get('sora')) || 0,
        allQareesSelected: includeQarees.length === 0,
    };
}

export function filtersToOptions(filters: SearchFilterValues): SearchOptions {
    return {
        wholeWord: filters.wholeWord,
        includeTags: filters.includeTags.length > 0 ? filters.includeTags : undefined,
        excludeTags: filters.excludeTags.length > 0 ? filters.excludeTags : undefined,
        includeQarees: filters.allQareesSelected || filters.includeQarees.length === 0 ? undefined : filters.includeQarees,
        excludeHafsa: filters.excludeHafsa,
        sora: filters.sora > 0 ? filters.sora : undefined,
    };
}

export function hasActiveSearchFilters(filters: SearchFilterValues): boolean {
    return filters.includeTags.length > 0 || filters.excludeTags.length > 0 || (!filters.allQareesSelected && filters.includeQarees.length > 0) || filters.excludeHafsa || filters.wholeWord || filters.sora > 0;
}

export function buildSearchUrl(query: string, searchType: string, filters: SearchFilterValues): string {
    const params = new URLSearchParams();
    const cleanQuery = query.trim();
    if (cleanQuery) params.set('q', cleanQuery);
    params.set('type', searchType || 'text');
    if (filters.sora > 0) params.set('sora', String(filters.sora));
    setList(params, 'includeTags', filters.includeTags);
    setList(params, 'excludeTags', filters.excludeTags);
    if (!filters.allQareesSelected) setList(params, 'qarees', filters.includeQarees);
    if (filters.wholeWord) params.set('wholeWord', '1');
    if (filters.excludeHafsa) params.set('excludeHafsa', '1');
    return `/search?${params.toString()}`;
}

export function savedFilterToValues(filter: SavedFilter): SearchFilterValues {
    const includeQarees = filter.includeQarees || [];
    return {
        includeTags: filter.includeTags || [],
        excludeTags: filter.excludeTags || [],
        includeQarees,
        excludeHafsa: filter.excludeHafsa,
        wholeWord: filter.wholeWord,
        sora: filter.sora || 0,
        allQareesSelected: includeQarees.length === 0,
    };
}

export function valuesToSavedFilter(filters: SearchFilterValues, name: string): Omit<SavedFilter, 'savedAt'> {
    return {
        name,
        includeTags: filters.includeTags,
        excludeTags: filters.excludeTags,
        includeQarees: filters.allQareesSelected ? [] : filters.includeQarees,
        excludeHafsa: filters.excludeHafsa,
        wholeWord: filters.wholeWord,
        sora: filters.sora > 0 ? filters.sora : undefined,
    };
}
