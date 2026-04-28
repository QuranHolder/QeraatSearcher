import { useState, useEffect, createContext, useContext } from 'react';

export type Theme = 'auto' | 'day' | 'night';

const STORAGE_KEY = 'qeraat_theme';

function applyTheme(theme: Theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'night' || (theme === 'auto' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
}

function getSavedTheme(): Theme {
    try {
        const saved = localStorage.getItem(STORAGE_KEY) as Theme;
        if (saved === 'auto' || saved === 'day' || saved === 'night') return saved;
    } catch { /* ignore */ }
    return 'auto';
}

interface ThemeContextType {
    theme: Theme;
    setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'auto',
    setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getSavedTheme);

    // Apply immediately on mount and whenever theme changes
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Re-apply when OS preference changes (only matters in 'auto' mode)
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => { if (theme === 'auto') applyTheme('auto'); };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = (t: Theme) => {
        try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
        setThemeState(t);
    };

    // Apply synchronously before first paint
    applyTheme(theme);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
