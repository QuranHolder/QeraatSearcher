import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';

export default function HomePage() {
    const { dict, isRtl } = useLocale();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('text');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-8">


            {/* Header */}
            <div className="max-w-5xl w-full text-center mb-12">
                <h1 className="text-4xl font-bold mb-3">{dict.home.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{dict.home.subtitle}</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={dict.search.placeholder}
                            className="w-full p-4 text-lg border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800"
                            style={{ paddingInlineEnd: '5.5rem' }}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 flex gap-1" style={{ insetInlineEnd: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => navigate(`/search?q=${encodeURIComponent(query)}&type=${type}&showFilters=true`)}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <Filter size={24} />
                            </button>
                            <button
                                type="submit"
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <Search size={24} />
                            </button>
                        </div>
                    </div>
                    <div className={`flex justify-center gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {['text', 'root', 'tag', 'reading'].map(t => (
                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value={t}
                                    checked={type === t}
                                    onChange={() => setType(t)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>{dict.search[t as 'text' | 'root' | 'tag' | 'reading']}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </form>

            {/* Feature Cards */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                {[
                    { title: dict.home.wordSearch, desc: dict.home.wordSearchDesc },
                    { title: dict.home.rootSearch, desc: dict.home.rootSearchDesc },
                    { title: dict.home.tags, desc: dict.home.tagsDesc },
                ].map((card, i) => (
                    <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                        <p className="text-gray-500 text-sm">{card.desc}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}
