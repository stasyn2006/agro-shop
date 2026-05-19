"use client";

import React, { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Wrench, Search } from 'lucide-react';

const PRODUCTS = [
    { id: 101, brand: "МТЗ", node: "Двигун", name: "Колінвал МТЗ-80/82 (Д-240)", price: 8450, img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400", desc: "Оригінальний колінчастий вал для тракторів МТЗ. Виготовлений із високоміцного чавуну. Пройшов заводське комп'ютерне балансування." },
    { id: 102, brand: "МТЗ", node: "Система живлення", name: "Насос паливний ТНВД (Д-240)", price: 12500, img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400", desc: "Паливний насос високого тиску для двигунів Д-240. Забезпечує максимально точне дозування палива." },
    { id: 103, brand: "МТЗ", node: "Двигун", name: "Вкладиші корінні (Н2)", price: 650, img: "https://images.unsplash.com/photo-1594818379496-da1e345b06a9?q=80&w=400", desc: "Комплект вкладишів корінних номінального розміру Н2." },
    { id: 201, brand: "ЮМЗ", node: "Двигун", name: "Поршнекомплект ЮМЗ (Д-65)", price: 4200, img: "https://images.unsplash.com/photo-1594818379496-da1e345b06a9?q=80&w=400", desc: "Повний поршневий комплект для ЮМЗ. Включає гільзу, поршень, кільця та поршневий палець. Стандартний розмір." },
    { id: 202, brand: "ЮМЗ", node: "Система живлення", name: "Форсунка ЮМЗ в зборі", price: 850, img: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=400", desc: "Форсунка в зборі з розпилювачем, налаштована на заводський робочий тиск. Готова до встановлення." },
    { id: 301, brand: "Т-25", node: "Двигун", name: "Циліндр двигуна Т-25 (Д-21)", price: 1800, img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400", desc: "Оригінальний ребристий циліндр повітряного охолодження для двигунів Д-21 (Т-25). Відмінна тепловіддача." },
    { id: 302, brand: "Т-25", node: "Система живлення", name: "Насос паливний НД-21/2", price: 6300, img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400", desc: "Розподільний паливний насос для двоциліндрових двигунів Д-21. Пройшов перевірку на стенді." },
];

const InteractiveImage = ({ src, alt }: { src: string; alt: string }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Автоматичне центрування при скиданні масштабу
    useEffect(() => {
        if (scale <= 1) setPosition({ x: 0, y: 0 });
    }, [scale]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomSpeed = 0.005;
        setScale(prev => Math.min(Math.max(1, prev - e.deltaY * zoomSpeed), 5));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1 || !containerRef.current) return;

        // Розрахунок меж, щоб картинка не тікала
        const limitX = (containerRef.current.clientWidth * (scale - 1)) / 2;
        const limitY = (containerRef.current.clientHeight * (scale - 1)) / 2;

        setPosition({
            x: Math.min(Math.max(e.clientX - dragStart.x, -limitX), limitX),
            y: Math.min(Math.max(e.clientY - dragStart.y, -limitY), limitY)
        });
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden rounded-xl bg-[#1c221f] border border-[#242926] cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onDoubleClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
        >
            <div className="absolute top-3 left-3 z-10 bg-[#0f1110]/90 text-[#facc15] text-[10px] px-2.5 py-1 rounded border border-[#323b36] pointer-events-none font-bold tracking-wider shadow-lg">
                🔍 КОЛЕСО — ЗУМ | ЛКМ — ПЕРЕСУВАННЯ
            </div>
            <img
                src={src}
                alt={alt}
                draggable={false}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                    transformOrigin: 'center center',
                }}
                className="w-full h-full object-cover pointer-events-none"
            />
        </div>
    );
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const productId = parseInt(resolvedParams.id);
    const product = PRODUCTS.find((p) => p.id === productId);

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Деталь не знайдена</h1>
                <Link href="/" className="text-[#facc15] hover:underline text-sm">Повернутися до каталогу</Link>
            </div>
        );
    }

    const relatedProducts = PRODUCTS.filter(
        (p) => p.brand === product.brand && p.node === product.node && p.id !== productId
    ).slice(0, 3);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#facc15] transition-colors mb-6">
                <ArrowLeft className="h-3.5 w-3.5" /> Назад до каталогу {product.brand}
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="h-[350px] lg:h-[420px]">
                    <InteractiveImage src={product.img} alt={product.name} />
                </div>

                <div className="flex flex-col">
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#1c221f] text-gray-400 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border border-[#323b36]">
                                {product.brand}
                            </span>
                            <span className="bg-[#1c221f] text-[#facc15] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border border-[#323b36]">
                                {product.node}
                            </span>
                            <span className="text-gray-600 text-xs ml-auto">Код: {product.id}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                            {product.name}
                        </h1>
                        <div className="text-3xl font-black text-white mb-5">
                            {product.price} <span className="text-lg font-normal text-gray-500">грн</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-[#242926] pb-1.5">Опис деталі</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {product.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-2.5 bg-[#141816]/50 border border-[#242926] p-3 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-[#facc15] shrink-0" />
                            <p className="text-gray-300 text-xs">Гарантія 12 місяців</p>
                        </div>
                        <div className="flex items-center gap-2.5 bg-[#141816]/50 border border-[#242926] p-3 rounded-lg">
                            <Truck className="h-5 w-5 text-[#facc15] shrink-0" />
                            <p className="text-gray-300 text-xs">Відправка сьогодні</p>
                        </div>
                    </div>

                    <a
                        href={`https://t.me/your_telegram?text=Вітаю! Хочу замовити: ${encodeURIComponent(product.name)} (Код: ${product.id}) за ${product.price} грн.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-3.5 rounded-lg font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                    >
                        <ShoppingCart className="h-5 w-5" /> Оформити замовлення в Telegram
                    </a>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="border-t border-[#242926] pt-10">
                    <h2 className="text-sm font-black uppercase text-gray-500 mb-6 flex items-center gap-2">
                        <Search className="h-4 w-4 text-[#facc15]" />
                        Схожі запчастини {product.brand} / {product.node}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedProducts.map((p) => (
                            <div key={p.id} className="bg-[#141816] rounded-lg border border-[#242926] overflow-hidden hover:border-[#3a443e] transition-all group flex flex-col justify-between">
                                <Link href={`/product/${p.id}`} className="block overflow-hidden">
                                    <div className="relative aspect-[16/10] bg-[#1c221f] overflow-hidden">
                                        <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <span className="absolute top-1.5 left-1.5 bg-[#0f1110]/90 text-[#facc15] text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#323b36]">
                                            Код: {p.id}
                                        </span>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-white text-sm group-hover:text-[#facc15] transition-colors line-clamp-2 leading-snug">
                                            {p.name}
                                        </h3>
                                    </div>
                                </Link>
                                <div className="p-3 pt-0">
                                    <div className="flex items-center justify-between pt-2.5 border-t border-[#242926]">
                                        <span className="text-lg font-black text-white">{p.price} <span className="text-xs font-normal text-gray-500">грн</span></span>
                                        <Link
                                            href={`/product/${p.id}`}
                                            className="bg-[#1c221f] hover:bg-[#facc15]/10 border border-[#323b36] hover:border-[#facc15] text-[#facc15] px-3 py-1.5 rounded font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
                                        >
                                            Переглянути
                                        </Link>
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