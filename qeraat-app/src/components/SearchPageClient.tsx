'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import { useDatabase } from '@/hooks/useDatabase';
import { searchText, searchRoot, searchTag } from '@/lib/sqljs-db';
import type { QuranData } from '@/lib/types';

interface SearchPageClientProps {
    lang: string;
    dict: {
        placeholder: string;
        text: string;
        root: string;
        tag: string;
        button: string;
        backToHome: string;
        resultsFor: string;
        found: string;
        noResults: string;
        sora: string;
        aya: string;
        rootLabel: string;
    };
}

export default function SearchPageClient({ lang, dict }: SearchPageClientProps) {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'text';
    const dbState = useDatabase();
    const [results, setResults] = useState<QuranData[]>([]);
    const isRtl = lang === 'ar';

    useEffect(() => {
        if (dbState.status !== 'ready' || !q) {
            setResults([]);
            return;
        }
        const db = dbState.db;
        let found: QuranData[] = [];
        if (type === 'root') found = searchRoot(db, q);
        else if (type === 'tag') found = searchTag(db, q);
        else found = searchText(db, q);
        setResults(found);
    }, [dbState, q, type]);

    const isLoading = dbState.status === 'loading' || dbState.status === 'idle';

    return (
        <main className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link
                        href={`/${lang}`}
                        className="text-blue-500 hover:underline mb-4 inline-flex items-center gap-1"
                    >
                        {isRtl ? '→' : '←'} {dict.backToHome}
                    </Link>
                    <div className="mt-4">
                        <SearchInput dict={dict} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500">
                            {lang === 'ar' ? 'جاري تحميل قاعدة البيانات...' : 'Loading database...'}
                        </p>
                    </div>
                ) : dbState.status === 'error' ? (
                    <p className="text-red-500">Error: {dbState.error}</p>
                ) : (
                    <>
                        {q && (
                            <h1 className="text-2xl font-bold mb-4 flex flex-wrap items-center gap-2">
                                {dict.resultsFor} &ldquo;{q}&rdquo;
                                <span className="text-gray-500 text-base font-normal">
                                    ({results.length} {dict.found})
                                </span>
                            </h1>
                        )}

                        <div className="space-y-4">
                            {results.length === 0 && q ? (
                                <p className="text-gray-500">{dict.noResults}</p>
                            ) : (
                                results.map((item) => (
                                    <Link
                                        key={`${item.sora}-${item.aya}-${item.id}`}
                                        href={`/${lang}/aya/${item.aya_index}`}
                                        className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                                <h2 className="text-lg font-arabic font-bold mb-1" dir="rtl">
                                                    {item.sub_subject1 || item.sub_subject}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                    {dict.sora} {item.sora}, {dict.aya} {item.aya}
                                                </p>
                                            </div>
                                            {item.root && (
                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap">
                                                    {dict.rootLabel} {item.root}
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
                    </>
                )}
            </div>
        </main>
    );
}
