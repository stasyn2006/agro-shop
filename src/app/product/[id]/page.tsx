"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// Підключаємо наш клієнт Supabase
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, ShoppingCart, ShieldCheck, Zap, Loader2, Search } from 'lucide-react';

// Структура товару для TypeScript
type Product = {
    id: number;
    brand: string;
    node: string;
    name: string;
    price: number;
    img: string;
    desc: string;
};

// Константи для налаштування зуму
const MIN_SCALE = 1;
const MAX_SCALE = 6;
const ZOOM_SPEED = 0.15;

// --- ОНОВЛЕНИЙ КОМПОНЕНТ ІНТЕРАКТИВНОЇ КАРТИНКИ ---
function InteractiveImage({ src, alt, productId }: { src: string; alt: string; productId: number }) {
    const [scale, setScale] = useState(MIN_SCALE);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Функція для розрахунку максимального зсуву (граcheck) на основі поточного масштабу
    const calculateBounds = useCallback((currentScale: number) => {
        if (currentScale <= 1) return { maxX: 0, maxY: 0 };

        // Число 250 - це приблизна половина ширини контейнера при aspect-video.
        // Для ідеальної точності краще брати containerRef.current.offsetWidth / 2,
        // але стале число працює стабільніше при ресайзі.
        const baseOffset = 250;
        const maxOffset = (currentScale - 1) * baseOffset;

        return { maxX: maxOffset, maxY: maxOffset };
    }, []);

    // Функція, яка жорстко утримує картинку в межах рамки
    const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
        const { maxX, maxY } = calculateBounds(currentScale);
        return {
            x: Math.min(Math.max(x, -maxX), maxX),
            y: Math.min(Math.max(y, -maxY), maxY)
        };
    }, [calculateBounds]);

    // ФІКС БАГУ: Перерахунок позиції при зміні масштабу
    useEffect(() => {
        // Кожного разу, коли змінюється масштаб (наприклад, віддаляємо),
        // ми беремо поточну позицію і "підправляємо" її під нові границі.
        setPosition(prev => clampPosition(prev.x, prev.y, scale));
    }, [scale, clampPosition]);

    // Блокування прокрутки всієї сторінки при зумі коліщатком миші
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); // Блокуємо скрол сторінки

            setScale((prevScale) => {
                // Розраховуємо новий масштаб
                const delta = e.deltaY < 0 ? ZOOM_SPEED : -ZOOM_SPEED;
                const newScale = prevScale + delta;

                // Обмежуємо масштаб від 1х до 6х
                return Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // Події миші для перетягування (Drag)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return; // Тягати можна тільки збільшену картинку

        e.preventDefault(); // Забороняє синє виділення
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;
        e.preventDefault();

        const rawX = e.clientX - dragStart.x;
        const rawY = e.clientY - dragStart.y;

        // Одразу застосовуємо обмеження граcheck
        setPosition(clampPosition(rawX, rawY, scale));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDoubleClick = () => {
        // Скидання масштабу та позиції
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
            // select-none вимикає синє виділення
            className="relative w-full aspect-[4/3] md:aspect-video bg-[#1c221f] rounded-xl border border-[#242926] overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
            {/* ПРИБРАНО: Інструкцію про зум */}

            {/* Код товару (артикул) */}
            <span className="absolute top-3 right-3 z-10 bg-[#0f1110]/90 text-gray-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-[#323b36]">
        Код: {productId}
      </span>

            {/* Контейнер трансформації */}
            <div
                className="w-full h-full flex items-center justify-center select-none"
                style={{
                    // Використовуємо transition тільки для масштабу, щоб пересування було миттєвим
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                }}
            >
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    draggable={false} // Забороняє браузеру "тягти" картинку
                    className="w-full h-full object-cover select-none pointer-events-none"
                />
            </div>
        </div>
    );
}

// --- ГОЛОВНИЙ КОМПОНЕНТ СТОРІНКИ ТОВАРУ ---
export default function ProductPage() {
    const params = useParams();
    const id = params?.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Завантажуємо товар із Supabase за ID
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
            }
            setIsLoading(false);
        }

        fetchProductData();
    }, [id]);

    // Екран завантаження
    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 text-[#facc15] animate-spin" />
                <p className="text-gray-400 font-medium">Завантажуємо інформацію про деталь...</p>
            </div>
        );
    }

    // Екран "Нічого не знайдено"
    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <Search className="h-16 w-16 text-gray-700 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white mb-4">Деталь не знайдено</h2>
                <p className="text-gray-400 mb-8">Можливо, цей товар було видалено або посилання застаріло.</p>
                <Link href="/" className="bg-[#facc15] text-[#0f1110] px-6 py-3 rounded font-bold hover:bg-[#eab308] transition-all">
                    Повернутися в каталог
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Кнопка Назад */}
            <Link
                href="/"
                className="text-gray-400 hover:text-[#facc15] transition-colors flex items-center gap-2 text-sm mb-8 w-fit group"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Назад до каталогу {product.brand}</span>
            </Link>

            {/* Основна сітка контенту */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                {/* Ліва колонка — Фото */}
                <div className="lg:col-span-7 w-full">
                    <InteractiveImage src={product.img} alt={product.name} productId={product.id} />
                </div>

                {/* Права колонка — Інформація */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* Теги */}
                    <div className="flex flex-wrap gap-2 select-none">
            <span className="bg-[#1c221f] text-gray-300 text-xs font-black px-3 py-1 rounded border border-[#242926]">
              {product.brand}
            </span>
                        <span className="bg-[#1c221f] text-[#facc15] text-xs font-black px-3 py-1 rounded border border-[#242926] uppercase">
              {product.node}
            </span>
                    </div>

                    {/* Назва та ціна */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                            {product.name}
                        </h1>
                        <div className="text-3xl font-black text-white mt-2">
                            {product.price} <span className="text-lg font-normal text-gray-400">грн</span>
                        </div>
                    </div>

                    {/* Опис товару */}
                    <div className="border-t border-[#242926] pt-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Опис деталі</h2>
                        <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                            {product.desc || "Оригінальна запчастина високої якості для вашої агротехніки. Надійність перевірена часом."}
                        </p>
                    </div>

                    {/* Переваги */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 select-none">
                        <div className="bg-[#141816] border border-[#242926] rounded-lg p-4 flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-[#facc15] shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm">Гарантія 12 місяців</span>
                            </div>
                        </div>
                        <div className="bg-[#141816] border border-[#242926] rounded-lg p-4 flex items-center gap-3">
                            <Zap className="h-6 w-6 text-[#facc15] shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm">Відправка сьогодні</span>
                            </div>
                        </div>
                    </div>

                    {/* Кнопка замовлення в Telegram */}
                    <div className="pt-4">
                        <a
                            href={`https://t.me/your_telegram?text=${encodeURIComponent(`Вітаю! Хочу оформити замовлення.\nТовар: ${product.name}\nКод товару: ${product.id}\nЦіна: ${product.price} грн`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-4 rounded-xl font-black text-center flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.99] tracking-wide"
                        >
                            <ShoppingCart className="h-5 w-5 stroke-[2.5]" />
                            Оформити замовлення в Telegram
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}