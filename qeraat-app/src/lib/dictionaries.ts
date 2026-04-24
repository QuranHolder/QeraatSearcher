const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;
export const defaultLocale: Locale = 'ar';
export const locales: Locale[] = ['ar', 'en'];

export const getDictionary = async (locale: Locale) => {
  if (!locales.includes(locale)) {
    locale = defaultLocale;
  }
  return dictionaries[locale]();
};
