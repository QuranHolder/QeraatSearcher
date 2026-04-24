import { getDb } from '@/lib/db';
import { QuranData } from '@/lib/types';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';

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
}: {
    searchParams: Promise<{ q: string; type: string }>;
}) {
    const { q, type } = await searchParams;
    const results = await getSearchResults(q || '', type || 'text');

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-blue-500 hover:underline mb-4 block">
                        &larr; Back to Home
                    </Link>
                    <SearchInput />
                </div>

                <h1 className="text-2xl font-bold mb-4">
                    Results for "{q}" <span className="text-gray-500 text-base font-normal">({results.length} found)</span>
                </h1>

                <div className="space-y-4">
                    {results.length === 0 ? (
                        <p className="text-gray-500">No results found.</p>
                    ) : (
                        results.map((item) => (
                            <Link
                                key={`${item.sora}-${item.aya}-${item.id}`}
                                href={`/aya/${item.aya_index}`}
                                className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-lg font-arabic font-bold mb-1 text-right" dir="rtl">
                                            {item.sub_subject1 || item.sub_subject}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Sora {item.sora}, Aya {item.aya}
                                        </p>
                                    </div>
                                    {item.root && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                            Root: {item.root}
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
