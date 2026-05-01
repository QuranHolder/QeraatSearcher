import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import SearchFilters, { ActiveFilterChips } from '../components/SearchFilters';
import { useLocale } from '../hooks/useLocale';
import { useDatabase } from '../hooks/useDatabase';
import { useSavedFilters } from '../hooks/useSavedFilters';
import { buildSearchUrl, emptySearchFilters, type SearchFilterValues } from '../lib/searchFilters';
import { getAllQarees, getAllSurahs, getAllTags } from '../lib/sqljs-db';

export default function HomePage() {
    const { dict, isRtl } = useLocale();
    const navigate = useNavigate();
    const dbState = useDatabase();
    const { savedFilters, deleteFilter } = useSavedFilters();
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilterValues>(emptySearchFilters);
    const allTags = useMemo(() => dbState.status === 'ready' ? getAllTags(dbState.db) : [], [dbState]);
    const allQarees = useMemo(() => dbState.status === 'ready' ? getAllQarees(dbState.db) : [], [dbState]);
    const allSurahs = useMemo(() => dbState.status === 'ready' ? getAllSurahs(dbState.db) : [], [dbState]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        navigate(buildSearchUrl(query, 'text', filters));
    };

    return (
        <main className="flex flex-col items-center justify-start min-h-[calc(100vh-env(safe-area-inset-top,0px)-3.5rem)] p-4 sm:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <form onSubmit={handleSearch} className="w-full max-w-4xl space-y-4">
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1 min-w-0">
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={dict.search.placeholder}
                                className="w-full p-3 text-base border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors shrink-0"
                        >
                            <Search size={17} />
                            {dict.search.button}
                        </button>
                    </div>
                    <ActiveFilterChips filters={filters} onChange={setFilters} allTags={allTags} allQarees={allQarees} allSurahs={allSurahs} dict={dict} showClear />
                </div>

                <SearchFilters
                    filters={filters}
                    onChange={setFilters}
                    allTags={allTags}
                    allQarees={allQarees}
                    allSurahs={allSurahs}
                    savedFilters={savedFilters}
                    deleteFilter={deleteFilter}
                    dict={dict}
                    isRtl={isRtl}
                />
            </form>
        </main>
    );
}
