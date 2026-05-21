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
    desc?: string;
    gallery?: string[];
    in_stock?: boolean; // ДОДАЛИ СТАТУС НАЯВНОСТІ
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
        setScale(MIN_SCALE);
        setPosition({ x: 0, y: 0 });
    }, [src]);

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
                    className="w-full h-full object-contain select-none pointer-events-none"
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
    const [activeImage, setActiveImage] = useState<string>('');

    const { addToCart } = useCart();

    useEffect(() => {
        if (!id) return;
        async function fetchProductData() {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', Number(id))
                .single();

            if (error) {
                console.error('Помилка завантаження деталі:', error);
            } else if (data) {
                setProduct(data);
                setActiveImage(data.img);

                const { data: similar } = await supabase
                    .from('products')
                    .select('*')
                    .eq('brand', data.brand)
                    .eq('node', data.node)
                    .neq('id', data.id)
                    .limit(4);

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

    const allImages = [product.img, ...(Array.isArray(product.gallery) ? product.gallery : [])];

    // Якщо in_stock не задано, вважаємо що воно true (для старих товарів)
    const isAvailable = product.in_stock !== false;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            <nav className="flex items-center flex-wrap gap-2.5 text-sm text-gray-400 mb-8 font-medium">
                <Link href="/" className="hover:text-[#facc15] transition-colors flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4" /> Головна
                </Link>
                <span className="text-[#242926] font-bold">/</span>
                <span className="hover:text-white transition-colors">{product.brand}</span>
                <span className="text-[#242926] font-bold">/</span>
                <span className="hover:text-white transition-colors">{product.node}</span>
                <span className="text-[#242926] font-bold">/</span>
                <span className="text-white truncate max-w-[200px] sm:max-w-[300px]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                <div className="lg:col-span-7 flex flex-col gap-8">
                    <div className="w-full flex gap-3 md:gap-4">
                        <div className="flex flex-col gap-2 w-16 md:w-20 shrink-0">
                            {allImages.map((src, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(src)}
                                    className={`w-full aspect-square rounded-lg border-2 overflow-hidden bg-[#1c221f] transition-all ${
                                        activeImage === src ? 'border-[#facc15]' : 'border-transparent hover:border-[#323b36]'
                                    }`}
                                >
                                    <img src={src} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        <div className="flex-1">
                            <InteractiveImage src={activeImage} alt={product.name} />
                        </div>
                    </div>

                    <div className="bg-[#141816] rounded-xl border border-[#242926] p-6 md:p-8">
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wide">Опис та характеристики</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base overflow-hidden">
                            {product.desc ? product.desc : "Детальний опис для цього товару ще не додано."}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex flex-col gap-1.5 mt-1">
                            {/* ДИНАМІЧНИЙ СТАТУС НАЯВНОСТІ */}
                            {isAvailable ? (
                                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                                    <span className="text-green-500 font-bold text-sm tracking-wide">В наявності</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                                    <span className="text-red-500 font-bold text-sm tracking-wide">Немає в наявності</span>
                                </div>
                            )}

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
                        {/* ДИНАМІЧНА КНОПКА ПРИДБАТИ */}
                        <button
                            onClick={() => addToCart(product)}
                            disabled={!isAvailable}
                            className={`w-full py-4 rounded-xl font-black text-lg text-center flex items-center justify-center gap-3 transition-all shadow-xl tracking-wide 
                ${isAvailable
                                ? 'bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] active:scale-[0.99]'
                                : 'bg-[#242926] text-gray-500 border border-[#323b36] cursor-not-allowed'}`}
                        >
                            <ShoppingCart className="h-6 w-6 stroke-[2.5]" />
                            {isAvailable ? 'Придбати' : 'Недоступно'}
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
                </div>
            </div>
        </div>
    );
}