"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Search as SearchIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';

type Product = {
    id: number;
    article?: string;
    brand: string;
    node: string;
    name: string;
    price: number;
    img: string;
    desc?: string;
    gallery?: string[];
    in_stock?: boolean;
};

function SearchContent() {
    const searchParams = useSearchParams();
    const q = searchParams ? searchParams.get('q') : null;

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        async function fetchSearchResults() {
            if (!q) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const searchQuery = q.trim();

            // Перевіряємо, чи ввів користувач ТІЛЬКИ цифри (щоб шукати по ID)
            const isNumber = /^\d+$/.test(searchQuery);

            // Формуємо розумний запит. ilike - це пошук без урахування регістру (великі/малі літери)
            let orQuery = `name.ilike.%${searchQuery}%,article.ilike.%${searchQuery}%`;

            // Якщо це число, додаємо пошук по ID
            if (isNumber) {
                orQuery += `,id.eq.${searchQuery}`;
            }

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(orQuery);

            if (error) {
                console.error('Помилка пошуку:', error);
            } else if (data) {
                setProducts(data);
            }
            setIsLoading(false);
        }

        fetchSearchResults();
    }, [q]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col mb-8 pb-4 border-b border-[#242926]">
                <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#facc15] transition-colors mb-4 w-fit">
                    <ArrowLeft className="h-4 w-4" /> На головну
                </Link>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    Результати пошуку: <span className="text-[#facc15]">"{q}"</span>
                </h1>
                <p className="text-gray-400 mt-2 text-sm">Знайдено товарів: {products.length}</p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 bg-[#141816] rounded-xl border border-[#242926] flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 text-[#facc15] animate-spin mb-4" />
                    <h3 className="text-white font-bold text-lg">Шукаємо в базі...</h3>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-[#141816] rounded-xl border border-[#242926] flex flex-col items-center justify-center">
                    <SearchIcon className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-white font-bold text-xl mb-2">На жаль, нічого не знайдено.</h3>
                    <p className="text-gray-500 text-sm">Спробуйте змінити запит або пошукати за кодом товару.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const isAvailable = product.in_stock !== false;

                        return (
                            <div key={product.id} className="bg-[#141816] rounded-lg border border-[#242926] overflow-hidden hover:border-[#3a443e] transition-all group flex flex-col justify-between">
                                <Link href={`/product/${product.id}`} className="block">
                                    <div className="relative aspect-video bg-[#1c221f] overflow-hidden">
                                        <img src={product.img} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100" />
                                        <span className="absolute top-2 left-2 bg-[#0f1110]/90 text-[#facc15] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#323b36] z-10">
                      Код: {product.id}
                    </span>
                                        {!isAvailable && (
                                            <span className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-red-500 z-10">
                         Немає
                       </span>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                        <h3 className="font-bold text-white text-base group-hover:text-[#facc15] transition-colors leading-snug line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <div className="text-xs text-gray-500 flex gap-2">
                                            <span>Арт: {product.article || "—"}</span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-4 pt-0">
                                    <div className="flex items-center justify-between pt-3 border-t border-[#242926]">
                                        <span className="text-xl font-black text-white">{product.price} <span className="text-xs font-normal text-gray-400">грн</span></span>
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={!isAvailable}
                                            className={`px-3 py-2 rounded font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg z-10 relative
                        ${isAvailable
                                                ? 'bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] active:scale-95'
                                                : 'bg-[#242926] text-gray-500 cursor-not-allowed'}`}
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Next.js вимагає огортати useSearchParams у Suspense
export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 text-[#facc15] animate-spin" /></div>}>
            <SearchContent />
        </Suspense>
    );
}