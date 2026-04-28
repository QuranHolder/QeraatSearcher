import { useState, useEffect, createContext, useContext } from 'react';
import { type Locale, defaultLocale, getDictionary, getSavedLocale, saveLocale } from '../lib/locale';

interface LocaleContextType {
    locale: Locale;
    setLocale: (l: Locale) => void;
    dict: ReturnType<typeof getDictionary>;
    isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
    locale: defaultLocale,
    setLocale: () => {},
    dict: getDictionary(defaultLocale),
    isRtl: true,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(getSavedLocale);

    const setLocale = (l: Locale) => {
        saveLocale(l);
        setLocaleState(l);
    };

    const dict = getDictionary(locale);
    const isRtl = locale === 'ar';

    // Apply synchronously so the correct dir/lang is set before the first paint.
    // The useEffect below keeps it in sync on subsequent locale changes.
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }, [locale, isRtl]);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, dict, isRtl }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    return useContext(LocaleContext);
}
