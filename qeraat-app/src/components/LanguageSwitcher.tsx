'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/lib/dictionaries';

export default function LanguageSwitcher({
  currentLocale,
  labels,
}: {
  currentLocale: string;
  labels: { language: string; arabic: string; english: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    if (!pathname) return;
    
    // Replace the current locale in the pathname with the new one
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as any)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {labels.language}:
      </span>
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
      >
        <option value="ar">{labels.arabic}</option>
        <option value="en">{labels.english}</option>
      </select>
    </div>
  );
}
