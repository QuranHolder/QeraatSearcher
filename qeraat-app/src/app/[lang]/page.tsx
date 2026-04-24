import SearchInput from '@/components/SearchInput';
import { getDictionary, Locale } from '@/lib/dictionaries';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Locale;
  const dict = await getDictionary(lang);

  return (
    <main className="flex flex-col items-center justify-center p-8 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col gap-8 mb-12">
        <h1 className="text-4xl font-bold text-center mb-2">{dict.home.title}</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {dict.home.subtitle}
        </p>
      </div>

      <div className="w-full">
        <SearchInput dict={dict.search} />
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-4xl">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-2">{dict.home.wordSearch}</h3>
          <p className="text-gray-500">{dict.home.wordSearchDesc}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-2">{dict.home.rootSearch}</h3>
          <p className="text-gray-500">{dict.home.rootSearchDesc}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-2">{dict.home.tags}</h3>
          <p className="text-gray-500">{dict.home.tagsDesc}</p>
        </div>
      </div>
    </main>
  );
}
