"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { ShoppingCart, Loader2, LayoutGrid, User, MessageSquare } from 'lucide-react';
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
    in_stock?: boolean;
};

type Review = {
    id: number;
    name: string;
    text: string;
    created_at: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const ZOOM_SPEED = 0.15;

function InteractiveImage({ src, alt }: { src: string; alt: string }) {
    const [scale, setScale] = useState<number>(MIN_SCALE);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosition(prev => clampPosition(prev.x, prev.y, scale));
    }, [scale, clampPosition]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setScale(MIN_SCALE);
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
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
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>('');

    // Стани для форми відгуків
    const [reviewName, setReviewName] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addToCart } = useCart();

    const fetchProductData = useCallback(async () => {
        if (!id) return;
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

            // Завантажуємо схожі товари
            const { data: similar } = await supabase
                .from('products')
                .select('*')
                .eq('node', data.node)
                .neq('id', data.id)
                .limit(4);

            if (similar) setSimilarProducts(similar);

            // Завантажуємо відгуки
            const { data: revData } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', data.id)
                .order('created_at', { ascending: false });

            if (revData) setReviews(revData);
        }
        setIsLoading(false);
    }, [id]);

    useEffect(() => {
        void fetchProductData();
    }, [fetchProductData]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewName.trim() || !reviewText.trim() || !product) return;

        setIsSubmitting(true);
        const { data, error } = await supabase
            .from('reviews')
            .insert([
                { product_id: product.id, name: reviewName.trim(), text: reviewText.trim() }
            ])
            .select();

        if (error) {
            alert('Помилка надсилання відгуку: ' + error.message);
        } else if (data) {
            setReviews(prev => [data[0] as Review, ...prev]);
            setReviewName('');
            setReviewText('');
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 text-[#facc15] animate-spin" />
                <p className="text-gray-400 font-medium">Завантажуємо інформацію...</p>
            </div>
        );
    }

    if (!product) return null;

    const allImages = [product.img, ...(Array.isArray(product.gallery) ? product.gallery : [])];
    const isAvailable = product.in_stock !== false;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <nav className="flex items-center flex-wrap gap-2.5 text-sm text-gray-400 mb-8 font-medium">
                <Link href="/" className="hover:text-[#facc15] transition-colors flex items-center gap-1.5"><LayoutGrid className="h-4 w-4" /> Головна</Link>
                <span className="text-[#242926] font-bold">/</span>
                <span>{product.brand}</span>
                <span className="text-[#242926] font-bold">/</span>
                <span className="text-white">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-8">
                <div className="lg:col-span-7 flex flex-col gap-8">
                    <div className="w-full flex gap-3 md:gap-4">
                        <div className="flex flex-col gap-2 w-16 md:w-20 shrink-0">
                            {allImages.map((src, index) => (
                                <button key={index} onClick={() => setActiveImage(src)} className={`w-full aspect-square rounded-lg border-2 overflow-hidden bg-[#1c221f] ${activeImage === src ? 'border-[#facc15]' : 'border-transparent'}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                        <div className="flex-1">
                            <InteractiveImage src={activeImage} alt={product.name} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-white">{product.name}</h1>
                        <div className="flex flex-col gap-1.5 mt-1">
                            {isAvailable ? (
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-green-500 font-bold text-sm tracking-wide">В наявності</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-red-500 font-bold text-sm tracking-wide">Немає в наявності</span>
                                </div>
                            )}
                            <div className="text-sm"><span className="text-gray-400">Код: </span><span className="text-gray-300 font-bold">{product.id}</span></div>
                            <div className="text-sm"><span className="text-gray-400">Артикул: </span><span className="text-gray-300 font-bold">{product.article || "Не вказано"}</span></div>
                        </div>
                    </div>
                    <div className="text-4xl font-black text-white mt-2">{product.price} <span className="text-xl font-normal text-gray-400">грн</span></div>
                    <button onClick={() => addToCart(product)} disabled={!isAvailable} className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 mt-2 ${isAvailable ? 'bg-[#facc15] text-[#0f1110] active:scale-[0.99] transition-transform shadow-xl' : 'bg-[#242926] text-gray-500 cursor-not-allowed border border-[#323b36]'}`}>
                        <ShoppingCart className="h-6 w-6 stroke-[2.5]" /> {isAvailable ? 'Придбати' : 'Недоступно'}
                    </button>
                </div>
            </div>

            {/* Опис товару */}
            <div className="bg-[#141816] rounded-xl border border-[#242926] p-6 md:p-8 w-full mb-8">
                <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wide">Опис та характеристики</h2>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap break-all sm:break-words overflow-hidden">
                    {product.desc ? product.desc : "Детальний опис для цього товару ще не додано."}
                </div>
            </div>

            {/* БЛОК ВІДГУКІВ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 border-t border-[#242926] pt-8">
                <div>
                    <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wide flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#facc15]" /> Відгуки покупців ({reviews.length})
                    </h2>
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 italic">На цей товар ще немає відгуків. Будьте першим!</p>
                    ) : (
                        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="bg-[#141816] p-4 rounded-xl border border-[#242926]">
                                    <div className="flex items-center gap-2 mb-2 text-sm font-bold text-white">
                                        <User className="h-4 w-4 text-gray-500" />
                                        {rev.name}
                                        <span className="text-xs font-normal text-gray-500 ml-auto">
                                            {new Date(rev.created_at).toLocaleDateString('uk-UA')}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap break-all sm:break-words">{rev.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ФОРМА ВІДГУКУ */}
                <div className="bg-[#141816] p-6 rounded-xl border border-[#242926]">
                    <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Залишити відгук</h3>
                    <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Ваше ім&apos;я</label>
                            <input required type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none text-sm" placeholder="Іван" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Ваш коментар</label>
                            <textarea required rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none text-sm" placeholder="Поділіться враженнями від деталі..." />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-2.5 rounded-lg font-black text-sm transition-colors disabled:opacity-50">
                            {isSubmitting ? 'Надсилається...' : 'Надіслати відгук'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Схожі товари */}
            <div>
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wide">
                    {similarProducts.length > 0 ? "Схожі товари" : "Схожих товарів поки немає"}
                </h2>
                {similarProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {similarProducts.map((p) => (
                            <Link key={p.id} href={`/product/${p.id}`} className="bg-[#141816] p-3 rounded-lg border border-[#242926] hover:border-[#facc15] transition-all group flex flex-col justify-between">
                                <div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.img} alt={p.name} className="w-full aspect-square object-cover rounded mb-3 bg-[#1c221f]" />
                                    <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-[#facc15] mb-2">{p.name}</h4>
                                </div>
                                <p className="text-[#facc15] font-black text-lg">{p.price} <span className="text-xs font-normal text-gray-400">грн</span></p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Спробуйте додати ще товари у категорію &quot;{product.node}&quot;</p>
                )}
            </div>
        </div>
    );
}