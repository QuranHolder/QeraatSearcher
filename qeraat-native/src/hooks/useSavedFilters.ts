import { useState, useCallback } from 'react';
import type { SavedFilter } from '../lib/types';

const LS_KEY = 'qeraat_saved_filters';

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
    } catch { /* storage full – silently ignore */ }
}

export function useSavedFilters() {
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(load);

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
