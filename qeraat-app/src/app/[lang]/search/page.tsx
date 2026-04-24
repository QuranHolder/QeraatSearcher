import SearchPageClient from '@/components/SearchPageClient';
import { getDictionary, Locale } from '@/lib/dictionaries';
import { Suspense } from 'react';

export default async function SearchPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const resolvedParams = await params;
    const lang = resolvedParams.lang as Locale;
    const dict = await getDictionary(lang);

    return (
        <Suspense>
            <SearchPageClient lang={lang} dict={dict.search} />
        </Suspense>
    );
}
