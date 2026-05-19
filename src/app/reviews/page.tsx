"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, User } from 'lucide-react';

const MOCK_REVIEWS = [
    { id: 1, name: "Іван Петрович", region: "Полтавська обл.", text: "Замовляв колінвал на МТЗ-82. Якість відмінна, став як рідний. Доставили наступного дня після замовлення. Дякую!", rating: 5 },
    { id: 2, name: "Сергій", region: "Дніпропетровська обл.", text: "Брав лемеші на плуг ПЛН. Борвмісна сталь, вже відпахали сезон — знос мінімальний. Рекомендую Агро-Дніпро.", rating: 5 },
    { id: 3, name: "Микола К.", region: "Вінницька обл.", text: "Купував стартер на Т-25. Все працює, заводить з півоберту. Менеджер підказав по моделі, сервіс на висоті.", rating: 4 },
];

export default function ReviewsPage() {
    return (
        <div className="min-h-screen bg-[#0f1110] text-[#e4e6e5] font-sans p-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#facc15] transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" /> Назад до каталогу
                </Link>

                <h1 className="text-4xl font-black text-white mb-8 tracking-tight">
                    Відгуки наших <span className="text-[#facc15]">клієнтів</span>
                </h1>

                <div className="flex flex-col gap-6">
                    {MOCK_REVIEWS.map((review) => (
                        <div key={review.id} className="bg-[#141816] border border-[#242926] p-6 rounded-lg">
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
                            <p className="text-sm text-gray-300 leading-relaxed">{review.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}