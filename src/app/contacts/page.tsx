"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, MapPin, Mail, MessageSquare } from 'lucide-react';

export default function ContactsPage() {
    return (
        <div className="min-h-screen bg-[#0f1110] text-[#e4e6e5] font-sans p-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#facc15] transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" /> Назад до каталогу
                </Link>

                <h1 className="text-4xl font-black text-white mb-10 tracking-tight">
                    Зв'язатися з <span className="text-[#facc15]">нами</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Контактні дані */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4 bg-[#141816] border border-[#242926] p-5 rounded-lg">
                            <Phone className="h-6 w-6 text-[#facc15] shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-white mb-1">Телефон для замовлень</h3>
                                <p className="text-lg font-black text-white hover:text-[#facc15] transition-colors">
                                    <a href="tel:+380975773551">+38 (097) 577-35-51</a>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Приймаємо дзвінки з 8:00 до 19:00 (Пн-Сб)</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-[#141816] border border-[#242926] p-5 rounded-lg">
                            <MapPin className="h-6 w-6 text-[#facc15] shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-white mb-1">Наш склад / Самовивіз</h3>
                                <p className="text-sm text-gray-300">Україна, м. Дніпро, вул. Аграрна, 102</p>
                                <p className="text-xs text-gray-500 mt-1">Перед виїздом обов'язково узгоджуйте наявність деталі по телефону.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-[#141816] border border-[#242926] p-5 rounded-lg">
                            <Mail className="h-6 w-6 text-[#facc15] shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-white mb-1">Електронна пошта</h3>
                                <p className="text-sm text-gray-300">sales@agro-dnepr.com.ua</p>
                            </div>
                        </div>
                    </div>

                    {/* Швидкі кнопки месенджерів */}
                    <div className="bg-[#141816] border border-[#242926] p-6 rounded-lg flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Швидке замовлення в чаті</h3>
                            <p className="text-sm text-gray-400 mb-6">Пишіть нам у будь-який час. Менеджер відповість одразу, як тільки звільниться.</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#1c221f] hover:bg-[#242926] border border-[#323b36] py-3 rounded font-bold text-sm text-white transition-all">
                                <MessageSquare className="h-4 w-4 text-[#38bdf8]" /> Написати в Telegram
                            </a>
                            <a href="viber://chat?number=%2B380670000000" className="flex items-center justify-center gap-2 bg-[#1c221f] hover:bg-[#242926] border border-[#323b36] py-3 rounded font-bold text-sm text-white transition-all">
                                <Phone className="h-4 w-4 text-[#a855f7]" /> Написати у Viber
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}