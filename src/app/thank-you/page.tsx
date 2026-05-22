import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function ThankYouPage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center text-center max-w-sm">

                {/* Зелена галочка як на скриншоті */}
                <div className="w-16 h-16 rounded-full border-[3px] border-[#00c853] flex items-center justify-center mb-6">
                    <Check className="h-8 w-8 text-[#00c853] stroke-[3]" />
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-white mb-4">
                    Замовлення прийнято!
                </h1>

                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    Наш менеджер зателефонує вам найближчим часом<br className="hidden sm:block"/> для підтвердження деталей.
                </p>

                {/* Темна кнопка повернення */}
                <Link
                    href="/"
                    className="bg-[#1c221f] hover:bg-[#242926] border border-[#323b36] text-white px-8 py-3.5 rounded-lg font-bold text-sm transition-colors w-full"
                >
                    Повернутися до покупок
                </Link>

            </div>
        </div>
    );
}