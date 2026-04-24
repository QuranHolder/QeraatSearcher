import AyaPageClient from '@/components/AyaPageClient';
import { getDictionary, Locale } from '@/lib/dictionaries';

export default async function AyaPage({
    params,
}: {
    params: Promise<{ index: string; lang: string }>;
}) {
    const resolvedParams = await params;
    const lang = resolvedParams.lang as Locale;
    const ayaIndex = parseInt(resolvedParams.index, 10);
    const dict = await getDictionary(lang);

    return <AyaPageClient lang={lang} ayaIndex={ayaIndex} dict={dict.aya} />;
}
