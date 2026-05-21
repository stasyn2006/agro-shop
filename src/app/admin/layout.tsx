"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const { data } = await supabase.auth.getSession();

            // Якщо ти вже на сторінці входу, нічого не блокуємо
            if (pathname === '/admin/login') {
                setIsAuthorized(true);
                return;
            }

            // Якщо сесії немає — миттєво викидаємо на логін (replace, щоб не можна було повернутися кнопкою "Назад")
            if (!data.session) {
                router.replace('/admin/login');
            } else {
                setIsAuthorized(true);
            }
        };

        checkAuth();
    }, [pathname, router]);

    // Поки йде перевірка (долі секунди), показуємо чорний екран з лоадером.
    // Жоден сторонній користувач не побачить інтерфейс адмінки!
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0f1110] flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-[#facc15] animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}