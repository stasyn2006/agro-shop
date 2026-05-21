import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { MessageSquare, Phone } from "lucide-react";
import { CartProvider } from "../context/CartContext";
// ДОДАНО: Імпортуємо наш новий розумний пошук
import SearchBar from "../components/SearchBar";

export const metadata: Metadata = {
    title: "АГРО-МАГАЗИН | Запчастини",
    description: "Інтернет-магазин запчастин до сільгосптехніки",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="uk">
        <body className="bg-[#0f1110] text-[#e4e6e5] font-sans min-h-screen flex flex-col">

        <CartProvider>
            <header className="border-b border-[#242926] bg-[#141816] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-wider text-white hover:text-gray-300 transition-colors">
                          AGRO<span className="text-[#facc15]">-SHOP</span>
                        </span>
                    </Link>

                    {/* ДОДАНО: Викликаємо наш клієнтський компонент пошуку */}
                    <SearchBar />

                    {/* Глобальна навігація */}
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-[#facc15] transition-colors">Каталог</Link>
                        <Link href="/about" className="hover:text-[#facc15] transition-colors">Про нас</Link>
                        <Link href="/reviews" className="hover:text-[#facc15] transition-colors">Відгуки</Link>
                        <Link href="/contacts" className="hover:text-[#facc15] transition-colors">Контакти</Link>
                        <Link href="/admin" className="text-gray-500 hover:text-[#facc15] transition-colors text-sm font-bold ml-4 border-l border-[#242926] pl-4">Адмін-панель</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="mt-auto border-t border-[#242926] bg-[#111413] py-8 text-sm text-gray-400">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2026 AGRO-SHOP — Якісні запчастини до сільгосптехніки. Доставка по Україні.</p>

                    <div className="flex gap-4">
                        <a href="https://t.me/Trach_R" className="flex items-center gap-1 hover:text-white transition-colors bg-[#1c221f] px-3 py-1.5 rounded border border-[#242926]">
                            <MessageSquare className="h-4 w-4 text-[#38bdf8]" /> Telegram
                        </a>
                        <a href="viber://chat?number=%2B380975773551" className="flex items-center gap-1 hover:text-white transition-colors bg-[#1c221f] px-3 py-1.5 rounded border border-[#242926]">
                            <Phone className="h-4 w-4 text-[#a855f7]" /> Viber
                        </a>
                    </div>
                </div>
            </footer>

        </CartProvider>
        </body>
        </html>
    );
}