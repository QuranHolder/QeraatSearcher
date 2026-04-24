'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [type, setType] = useState(searchParams.get('type') || 'text');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Quran (text, root, or tag)..."
                        className="w-full p-4 pr-12 text-lg border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500"
                    >
                        <Search size={24} />
                    </button>
                </div>

                <div className="flex justify-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="text"
                            checked={type === 'text'}
                            onChange={(e) => setType(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span>Text</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="root"
                            checked={type === 'root'}
                            onChange={(e) => setType(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span>Root</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="tag"
                            checked={type === 'tag'}
                            onChange={(e) => setType(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span>Tag</span>
                    </label>
                </div>
            </div>
        </form>
    );
}
