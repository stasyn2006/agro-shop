"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук по всьому сайту..."
                className="w-full bg-[#1c221f] border border-[#323b36] rounded-md py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#facc15] transition-colors"
            />
            {/* Кнопка пошуку (можна натиснути Enter або клікнути на лупу) */}
            <button type="submit" className="absolute left-3 top-2.5 cursor-pointer">
                <Search className="h-4 w-4 text-gray-400 hover:text-[#facc15] transition-colors" />
            </button>
        </form>
    );
}