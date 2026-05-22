"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Star, User, MessageSquarePlus, X, Loader2 } from 'lucide-react';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Стан для модального вікна форми
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Стан для полів форми
    const [formData, setFormData] = useState({ name: '', region: '', text: '' });
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            // Завантажуємо відгуки, сортуючи від найновіших
            const { data, error } = await supabase
                .from('shop_reviews')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;
            if (data) setReviews(data);
        } catch (err) {
            console.error("Помилка завантаження відгуків:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('shop_reviews').insert([
                {
                    name: formData.name,
                    region: formData.region,
                    text: formData.text,
                    rating: rating
                }
            ]);

            if (error) throw error;

            // Скидаємо форму та закриваємо модалку
            setFormData({ name: '', region: '', text: '' });
            setRating(5);
            setIsModalOpen(false);

            // Оновлюємо список відгуків на сторінці
            await fetchReviews();
        } catch (err: any) {
            alert("Помилка при додаванні відгуку: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1110] text-[#e4e6e5] font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#facc15] transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Назад до каталогу
                    </Link>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors self-start sm:self-auto shadow-[0_0_15px_rgba(250,204,21,0.15)]"
                    >
                        <MessageSquarePlus className="h-4 w-4" /> Залишити відгук
                    </button>
                </div>

                <h1 className="text-4xl font-black text-white mb-8 tracking-tight">
                    Відгуки наших <span className="text-[#facc15]">клієнтів</span>
                </h1>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 text-[#facc15] animate-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 font-medium bg-[#141816] rounded-xl border border-[#242926]">
                        Відгуків поки немає. Будьте першим, хто залишить свій відгук!
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-[#141816] border border-[#242926] p-6 rounded-lg animate-in fade-in duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#1c221f] p-2 rounded-full border border-[#323b36]">
                                            <User className="h-5 w-5 text-[#facc15]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">{review.name}</h3>
                                            <p className="text-xs text-gray-500">{review.region}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < review.rating ? "text-[#facc15] fill-[#facc15]" : "text-gray-600"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-all">{review.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* МОДАЛЬНЕ ВІКНО ФОРМИ ВІДГУКУ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141816] border border-[#242926] rounded-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wide">Ваш відгук</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Ваше ім'я</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Олександр"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-3 text-white text-sm focus:border-[#facc15] focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Область або Місто</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Львівська обл."
                                    value={formData.region}
                                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                                    className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-3 text-white text-sm focus:border-[#facc15] focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Оцінка магазину</label>
                                <div className="flex gap-1.5 py-1">
                                    {[...Array(5)].map((_, i) => {
                                        const starValue = i + 1;
                                        return (
                                            <button
                                                type="button"
                                                key={i}
                                                onClick={() => setRating(starValue)}
                                                onMouseEnter={() => setHoverRating(starValue)}
                                                onMouseLeave={() => setHoverRating(null)}
                                                className="text-gray-600 hover:scale-110 transition-transform focus:outline-none"
                                            >
                                                <Star
                                                    className={`h-7 w-7 ${
                                                        starValue <= (hoverRating ?? rating)
                                                            ? "text-[#facc15] fill-[#facc15]"
                                                            : "text-gray-600"
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Текст відгуку</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Поділіться враженнями про якість деталей чи якість обслуговування..."
                                    value={formData.text}
                                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                                    className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-3 text-white text-sm focus:border-[#facc15] focus:outline-none transition-colors resize-none leading-relaxed"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all mt-2 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Надіслати відгук'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}