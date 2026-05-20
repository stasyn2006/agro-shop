"use client";


import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Звертаємося до Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Неправильний email або пароль. Доступ заборонено.');
            setIsLoading(false);
        } else if (data.session) {
            // Якщо логін успішний, кидаємо в адмінку
            router.push('/admin');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-[#141816] w-full max-w-md p-8 rounded-2xl border border-[#242926] shadow-2xl relative overflow-hidden">

                {/* Декор */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#facc15] to-orange-500"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-[#1c221f] p-4 rounded-full border border-[#323b36] mb-4">
                        <Lock className="h-8 w-8 text-[#facc15]" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Вхід в Адмін-панель</h1>
                    <p className="text-gray-400 text-sm mt-1">Тільки для співробітників магазину</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm font-medium">
                        <ShieldAlert className="h-5 w-5 shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-[#facc15] focus:outline-none transition-colors"
                                placeholder="admin@agro-shop.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Пароль</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-[#facc15] focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 w-full bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-3 rounded-xl font-black text-base transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Увійти в систему'}
                    </button>
                </form>
            </div>
        </div>
    );
}