import { useState, useEffect } from 'react';

const LS_KEY = 'qeraat_settings';

interface AppSettings {
    resultsPerPage: number;
}

const defaultSettings: AppSettings = {
    resultsPerPage: 200
};

function loadSettings(): AppSettings {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
            return { ...defaultSettings, ...JSON.parse(raw) };
        }
    } catch {}
    return defaultSettings;
}

export function useSettings() {
    const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettingsState(prev => {
            const next = { ...prev, ...updates };
            try {
                localStorage.setItem(LS_KEY, JSON.stringify(next));
                window.dispatchEvent(new Event('qeraat_settings_updated'));
            } catch {}
            return next;
        });
    };

    useEffect(() => {
        const sync = () => setSettingsState(loadSettings());
        window.addEventListener('qeraat_settings_updated', sync);
        return () => window.removeEventListener('qeraat_settings_updated', sync);
    }, []);

    return { settings, updateSettings };
}
