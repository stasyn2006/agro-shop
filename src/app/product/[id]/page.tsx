"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { ShoppingCart, ShieldCheck, Zap, Loader2, Search, LayoutGrid } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

type Product = {
    id: number;
    article?: string;
    brand: string;
    node: string;
    name: string;
    price: number;
    img: string;
    desc: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const ZOOM_SPEED = 0.15;

function InteractiveImage({ src, alt }: { src: string; alt: string }) {
    const [scale, setScale] = useState(MIN_SCALE);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const calculateBounds = useCallback((currentScale: number) => {
        if (currentScale <= 1) return { maxX: 0, maxY: 0 };
        const baseOffset = 250;
        const maxOffset = (currentScale - 1) * baseOffset;
        return { maxX: maxOffset, maxY: maxOffset };
    }, []);

    const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
        const { maxX, maxY } = calculateBounds(currentScale);
        return {
            x: Math.min(Math.max(x, -maxX), maxX),
            y: Math.min(Math.max(y, -maxY), maxY)
        };
    }, [calculateBounds]);

    useEffect(() => {
        setPosition(prev => clampPosition(prev.x, prev.y, scale));
    }, [scale, clampPosition]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            setScale((prevScale) => {
                const delta = e.deltaY < 0 ? ZOOM_SPEED : -ZOOM_SPEED;
                const newScale = prevScale + delta;
                return Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;
        e.preventDefault();
        const rawX = e.clientX - dragStart.x;
        const rawY = e.clientY - dragStart.y;
        setPosition(clampPosition(rawX, rawY, scale));
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleDoubleClick = () => {
        setScale(MIN_SCALE);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            className="relative w-full aspect-[4/3] md:aspect-video bg-[#1c221f] rounded-xl border border-[#242926] overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
            <div
                className="w-full h-full flex items-center justify-center select-none"
                style={{
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                }}
            >
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none"
                />
            </div>
        </div>
    );
}

export default function ProductPage() {
    const params = useParams();
    const id = params?.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { addToCart } = useCart();

    useEffect(() => {
        if (!id) return;
        async function fetchProductData() {
            setIsLoading(true);

            // 1. Завантажуємо головний товар
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', Number(id))
                .single();

            if (error) {
                console.error('Помилка завантаження деталі:', error);
            } else if (data) {
                setProduct(data);

                // 2. Одразу шукаємо схожі товари (той самий бренд і вузол, крім цього ж товару)
                const { data: similar } = await supabase
                    .from('products')
                    .select('*')
                    .eq('brand', data.brand)
                    .eq('node', data.node)
                    .neq('id', data.id)
                    .limit(4); // Виводимо максимум 4 картки

                if (similar) {
                    setSimilarProducts(similar);
                }
            }
            setIsLoading(false);
        }
        fetchProductData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 text-[#facc15] animate-spin" />
                <p className="text-gray-400 font-medium">Завантажуємо інформацію про деталь...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <Search className="h-16 w-16 text-gray-700 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white mb-4">Деталь не знайдено</h2>
                <Link href="/" className="bg-[#facc15] text-[#0f1110] px-6 py-3 rounded font-bold hover:bg-[#eab308] transition-all">
                    Повернутися в каталог
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {/* ХЛІБНІ КРИХТИ */}
            <nav className="flex items-center flex-wrap gap-2.5 text-sm text-gray-400 mb-8 font-medium">
                <Link href="/" className="hover:text-[#facc15] transition-colors flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4" /> Головна
                </Link>
                <span className="text-[#242926] font-bold">/</span>
                <Link href="/" className="hover:text-[#facc15] transition-colors">{product.brand}</Link>
                <span className="text-[#242926] font-bold">/</span>
                <Link href="/" className="hover:text-[#facc15] transition-colors">{product.node}</Link>
                <span className="text-[#242926] font-bold">/</span>
                <span className="text-white truncate max-w-[200px] sm:max-w-[300px]">{product.name}</span>
            </nav>

            {/* ОСНОВНА КАРТКА ТОВАРУ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 w-full flex gap-3 md:gap-4">
                    <div className="flex flex-col gap-2 w-16 md:w-20 shrink-0">
                        <button className="w-full aspect-square rounded-lg border-2 border-[#facc15] overflow-hidden bg-[#1c221f]">
                            <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                        </button>
                    </div>

                    <div className="flex-1">
                        <InteractiveImage src={product.img} alt={product.name} />
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                                <span className="text-green-500 font-bold text-sm tracking-wide">В наявності</span>
                            </div>

                            <div className="text-sm">
                                <span className="text-gray-400">Код: </span>
                                <span className="text-gray-300 font-bold">{product.id}</span>
                            </div>

                            <div className="text-sm">
                                <span className="text-gray-400">Артикул: </span>
                                <span className="text-gray-300 font-bold">{product.article || "Не вказано"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-4xl font-black text-white mt-2">
                        {product.price} <span className="text-xl font-normal text-gray-400">грн</span>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-4 rounded-xl font-black text-lg text-center flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.99] tracking-wide"
                        >
                            <ShoppingCart className="h-6 w-6 stroke-[2.5]" />
                            Придбати
                        </button>
                    </div>

                    <div className="border-t border-[#242926] pt-6 mt-2">
                        <h2 className="text-lg font-bold text-white mb-4 tracking-wide uppercase">Характеристики</h2>
                        <div className="flex flex-col gap-4 text-sm">
                            <div className="flex justify-between border-b border-[#242926]/50 pb-3">
                                <span className="text-gray-400">Бренд</span>
                                <span className="font-bold text-white">{product.brand}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#242926]/50 pb-3">
                                <span className="text-gray-400">Застосовність</span>
                                <span className="font-bold text-[#facc15]">{product.node}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#242926]/50 pb-3">
                                <span className="text-gray-400">Стан</span>
                                <span className="font-bold text-white">Новий</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 select-none">
                        <div className="bg-[#141816] border border-[#242926] rounded-lg p-4 flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-gray-500 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-gray-300 font-bold text-sm">Гарантія 12 місяців</span>
                            </div>
                        </div>
                        <div className="bg-[#141816] border border-[#242926] rounded-lg p-4 flex items-center gap-3">
                            <Zap className="h-6 w-6 text-gray-500 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-gray-300 font-bold text-sm">Відправка сьогодні</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* БЛОК СХОЖИХ ТОВАРІВ */}
            {similarProducts.length > 0 && (
                <div className="mt-24 pt-10 border-t border-[#242926]">
                    <h2 className="text-2xl font-black tracking-tight text-white mb-8">
                        З цим товаром також купують
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarProducts.map((simProduct) => (
                            <div key={simProduct.id} className="bg-[#141816] rounded-lg border border-[#242926] overflow-hidden hover:border-[#3a443e] transition-all group flex flex-col justify-between">
                                <Link href={`/product/${simProduct.id}`} className="block">
                                    <div className="relative aspect-video bg-[#1c221f] overflow-hidden">
                                        <img
                                            src={simProduct.img}
                                            alt={simProduct.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                                        />
                                        <span className="absolute top-2 left-2 bg-[#0f1110]/90 text-[#facc15] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#323b36] z-10">
                      Код: {simProduct.id}
                    </span>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                        <h3 className="font-bold text-white text-sm group-hover:text-[#facc15] transition-colors leading-snug line-clamp-2">
                                            {simProduct.name}
                                        </h3>
                                    </div>
                                </Link>

                                <div className="p-4 pt-0">
                                    <div className="flex items-center justify-between pt-3 border-t border-[#242926]">
                                        <span className="text-lg font-black text-white">{simProduct.price} <span className="text-xs font-normal text-gray-400">грн</span></span>
                                        <button
                                            onClick={() => addToCart(simProduct)}
                                            className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] px-3 py-2 rounded font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 z-10 relative"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}