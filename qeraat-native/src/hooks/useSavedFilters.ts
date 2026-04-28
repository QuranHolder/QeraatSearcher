import { useState, useCallback, useEffect } from 'react';
import type { SavedFilter } from '../lib/types';

const LS_KEY = 'qeraat_saved_filters';
const EVENT_KEY = 'qeraat_filters_updated';

function load(): SavedFilter[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? (JSON.parse(raw) as SavedFilter[]) : [];
    } catch {
        return [];
    }
}

function persist(filters: SavedFilter[]) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(filters));
        window.dispatchEvent(new Event(EVENT_KEY));
    } catch { /* storage full – silently ignore */ }
}

export function useSavedFilters() {
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(load);

    // Keep all instances of the hook in sync automatically
    useEffect(() => {
        const sync = () => setSavedFilters(load());
        window.addEventListener(EVENT_KEY, sync);
        return () => window.removeEventListener(EVENT_KEY, sync);
    }, []);

    const saveFilter = useCallback((filter: Omit<SavedFilter, 'savedAt'>) => {
        setSavedFilters(prev => {
            // Replace if same name already exists, otherwise prepend
            const withoutDup = prev.filter(f => f.name !== filter.name);
            const next = [{ ...filter, savedAt: Date.now() }, ...withoutDup];
            persist(next);
            return next;
        });
    }, []);

    const deleteFilter = useCallback((name: string) => {
        setSavedFilters(prev => {
            const next = prev.filter(f => f.name !== name);
            persist(next);
            return next;
        });
    }, []);

    return { savedFilters, saveFilter, deleteFilter };
}
