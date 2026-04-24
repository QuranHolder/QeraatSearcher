import { getDb } from '@/lib/db';
import { QuranData } from '@/lib/types';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import { getDictionary, Locale } from '@/lib/dictionaries';

async function getSearchResults(query: string, type: string) {
    const db = getDb();
    let sql = '';
    let params: any[] = [];
    const LIMIT = 50;

    if (type === 'root') {
        sql = `SELECT * FROM quran_data WHERE root = ? LIMIT ?`;
        params = [query, LIMIT];
    } else if (type === 'tag') {
        sql = `SELECT * FROM quran_data WHERE tags LIKE ? LIMIT ?`;
        params = [`%${query}%`, LIMIT];
    } else {
        // text
        sql = `SELECT * FROM quran_data WHERE sub_subject LIKE ? OR sub_subject1 LIKE ? LIMIT ?`;
        params = [`%${query}%`, `%${query}%`, LIMIT];
    }

    const stmt = db.prepare(sql);
    return stmt.all(...params) as QuranData[];
}

export default async function SearchPage({
    searchParams,
    params,
}: {
    searchParams: Promise<{ q: string; type: string }>;
    params: Promise<{ lang: string }>;
}) {
    const { q, type } = await searchParams;
    const resolvedParams = await params;
    const lang = resolvedParams.lang as Locale;
    const dict = await getDictionary(lang);
    const results = await getSearchResults(q || '', type || 'text');

    return (
        <main className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href={`/${lang}`} className="text-blue-500 hover:underline mb-4 inline-block">
                        {lang === 'ar' ? '\u2192' : '\u2190'} {dict.search.backToHome}
                    </Link>
                    <SearchInput dict={dict.search} />
                </div>

                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    {dict.search.resultsFor} "{q}" 
                    <span className="text-gray-500 text-base font-normal">
                        ({results.length} {dict.search.found})
                    </span>
                </h1>

                <div className="space-y-4">
                    {results.length === 0 ? (
                        <p className="text-gray-500">{dict.search.noResults}</p>
                    ) : (
                        results.map((item) => (
                            <Link
                                key={`${item.sora}-${item.aya}-${item.id}`}
                                href={`/${lang}/aya/${item.aya_index}`}
                                className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className={lang === 'ar' ? 'text-right flex-1' : 'text-left flex-1'}>
                                        <h2 className="text-lg font-arabic font-bold mb-1" dir="rtl">
                                            {item.sub_subject1 || item.sub_subject}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {dict.search.sora} {item.sora}, {dict.search.aya} {item.aya}
                                        </p>
                                    </div>
                                    {item.root && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                            {dict.search.rootLabel} {item.root}
                                        </span>
                                    )}
                                </div>
                                {item.reading && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300" dir="rtl">
                                        {item.reading}
                                    </p>
                                )}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
