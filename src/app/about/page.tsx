"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0f1110] text-[#e4e6e5] font-sans p-6">
            <div className="max-w-4xl mx-auto">
                {/* Кнопка Повернення */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#facc15] transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" /> Назад до каталогу
                </Link>

                <h1 className="text-4xl font-black text-white mb-6 tracking-tight">
                    Про компанію <span className="text-[#facc15]">АГРО-ДНІПРО</span>
                </h1>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                    Ми спеціалізуємося на постачанні якісних запчастин для сільгосптехніки по всій Україні.
                    Наша мета — забезпечити фермерів та агропідприємства надійними комплектуючими для тракторів,
                    плугів та сівалок, щоб техніка працювала без простоїв у найважливіші сезони.
                </p>

                {/* Переваги */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-[#141816] border border-[#242926] p-6 rounded-lg">
                        <ShieldCheck className="h-8 w-8 text-[#facc15] mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Гарантія якості</h3>
                        <p className="text-sm text-gray-400">Працюємо тільки з перевіреними заводами-виробниками та оригінальними деталями.</p>
                    </div>

                    <div className="bg-[#141816] border border-[#242926] p-6 rounded-lg">
                        <Truck className="h-8 w-8 text-[#facc15] mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Швидка доставка</h3>
                        <p className="text-sm text-gray-400">Відправка Новою Поштою або Делівері в день замовлення, щоб мінімізувати простій техніки.</p>
                    </div>

                    <div className="bg-[#141816] border border-[#242926] p-6 rounded-lg">
                        <CheckCircle2 className="h-8 w-8 text-[#facc15] mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Широкий асортимент</h3>
                        <p className="text-sm text-gray-400">Запчастини до тракторів МТЗ, ЮМЗ, Т-25, а також розхідники для навісного обладнання.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}