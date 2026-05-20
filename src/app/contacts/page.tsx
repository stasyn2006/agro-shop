"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, MapPin, Mail } from 'lucide-react';

export default function ContactsPage() {
    return (
        <div className="min-h-screen bg-[#0f1110] text-[#e4e6e5] font-sans p-6 flex justify-center">
            <div className="w-full max-w-2xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#facc15] transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" /> Назад до каталогу
                </Link>

                <h1 className="text-4xl font-black text-white mb-10 tracking-tight text-center">
                    Зв'язатися з <span className="text-[#facc15]">нами</span>
                </h1>

                {/* --- ТУТ ОСНОВНА ЗМІНА --- */}
                {/* flex-col без items-center. Замість цього max-w-[500px] та mx-auto */}
                <div className="flex flex-col gap-6 max-w-[500px] mx-auto">

                    {/* Картка Телефону: Автоматично розтягується */}
                    <div className="flex items-start gap-4 bg-[#141816] border border-[#242926] p-5 rounded-lg shadow-lg">
                        <Phone className="h-6 w-6 text-[#facc15] shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-white mb-1">Телефон для замовлень</h3>
                            <p className="text-lg font-black text-white hover:text-[#facc15] transition-colors">
                                <a href="tel:+380975773551">+38 (097) 577-35-51</a>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Приймаємо дзвінки з 8:00 до 19:00 (Пн-Сб)</p>
                        </div>
                    </div>

                    {/* Картка Складу: Вона тепер задає ширину. Тут немає додаткових класів */}
                    <div className="flex items-start gap-4 bg-[#141816] border border-[#242926] p-5 rounded-lg shadow-lg">
                        <MapPin className="h-6 w-6 text-[#facc15] shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-white mb-1">Наш склад / Самовивіз</h3>
                            <p className="text-sm text-gray-300">Україна, м. Львів, вул. Стрийська, 102</p>
                            <p className="text-xs text-gray-500 mt-1">Перед виїздом обов'язково узгоджуйте наявність деталі.</p>
                        </div>
                    </div>

                    {/* Картка Пошти: Також автоматично розтягується */}
                    <div className="flex items-start gap-4 bg-[#141816] border border-[#242926] p-5 rounded-lg shadow-lg">
                        <Mail className="h-6 w-6 text-[#facc15] shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-white mb-1">Електронна пошта</h3>
                            <p className="text-sm text-gray-300">sales@agro-dnepr.com.ua</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}