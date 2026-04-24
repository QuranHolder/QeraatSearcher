import SearchInput from '@/components/SearchInput';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col gap-8 mb-12">
        <h1 className="text-4xl font-bold text-center mb-2">Qeraat Searcher</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Explore the Ten Readings of the Quran. Search by word, root, or tag.
        </p>
      </div>

      <div className="w-full">
        <SearchInput />
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-4xl">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-2">Word Search</h3>
          <p className="text-gray-500">Find specific words and their variations across readings.</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-2">Root Search</h3>
          <p className="text-gray-500">Analyze words based on their linguistic roots.</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-2">Tags</h3>
          <p className="text-gray-500">Browse by categories and canonical tags.</p>
        </div>
      </div>
    </main>
  );
}
