import arDict from '../dictionaries/ar.json';
import enDict from '../dictionaries/en.json';

export type Locale = 'ar' | 'en';
export const defaultLocale: Locale = 'ar';
export const locales: Locale[] = ['ar', 'en'];

const dictionaries = { ar: arDict, en: enDict };

export function getDictionary(locale: Locale) {
    return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function getSavedLocale(): Locale {
    try {
        const saved = localStorage.getItem('qeraat_locale') as Locale;
        if (saved && locales.includes(saved)) return saved;
    } catch { /* ignore */ }
    return defaultLocale;
}

export function saveLocale(locale: Locale) {
    try { localStorage.setItem('qeraat_locale', locale); } catch { /* ignore */ }
}
