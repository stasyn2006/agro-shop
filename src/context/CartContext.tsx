"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

type CartItem = {
    id: number;
    article?: string;
    name: string;
    price: number;
    img: string;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, delta: number) => void;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [isCheckout, setIsCheckout] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // ДОДАНО: номер за замовчуванням починається з +380
    const [formData, setFormData] = useState({ name: '', phone: '+380', address: '' });

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem('agro_cart');
        if (saved) {
            try { setItems(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('agro_cart', JSON.stringify(items));
        }
    }, [items, isMounted]);

    const addToCart = (product: any) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, {
                id: product.id,
                article: product.article,
                name: product.name,
                price: product.price,
                img: product.img,
                quantity: 1
            }];
        });
        setIsOpen(true);
        setIsCheckout(false);
        setIsSuccess(false);
    };

    const removeFromCart = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.quantity + delta;
                return newQ > 0 ? { ...item, quantity: newQ } : item;
            }
            return item;
        }));
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const submitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const orderDetails = items.map(i => {
            const articleText = i.article ? i.article : 'Не вказано';
            return `• ${i.name} — ${i.quantity} шт. (${i.price * i.quantity} грн)\n   Код: ${i.id}\n   Артикул: ${articleText}`;
        }).join('\n\n');

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: "0d5a74db-0611-4404-8ca9-e48090afa84d", // Твій ключ
                    subject: "🚜 Нове замовлення з AGRO-SHOP!",
                    from_name: "AGRO-SHOP",
                    "Ім'я клієнта": formData.name,
                    "Телефон": formData.phone,
                    "Адреса": formData.address,
                    "Загальна сума": `${total} грн`,
                    "Список товарів": orderDetails,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setIsSuccess(true);
                setItems([]);
                setFormData({ name: '', phone: '+380', address: '' }); // Скидаємо до +380
            } else {
                alert("Сталася помилка при відправці. Спробуйте ще раз.");
            }
        } catch (err) {
            console.error('Помилка відправки листа:', err);
            alert("Сталася помилка. Перевірте підключення до інтернету.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeCart = () => {
        setIsOpen(false);
        setTimeout(() => {
            setIsCheckout(false);
            setIsSuccess(false);
        }, 300);
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, isOpen, setIsOpen }}>
            {children}

            {isMounted && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 bg-[#facc15] text-[#0f1110] p-4 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-110 transition-all z-40"
                >
                    <ShoppingCart className="h-6 w-6" />
                    {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#0f1110]">
              {items.length}
            </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
                    <div className="relative w-full max-w-md bg-[#141816] h-full shadow-2xl flex flex-col border-l border-[#242926] animate-in slide-in-from-right duration-300">

                        <div className="flex items-center justify-between p-6 border-b border-[#242926]">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-[#facc15]" />
                                {isCheckout ? 'Оформлення замовлення' : 'Кошик'}
                            </h2>
                            <button onClick={closeCart} className="text-gray-400 hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

                            {isSuccess ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                                        <CheckCircle2 className="h-20 w-20 text-green-500 mb-2" />
                                        <h3 className="text-2xl font-black text-white">Замовлення прийнято!</h3>
                                        <p className="text-gray-400">Наш менеджер зателефонує вам найближчим часом для підтвердження деталей.</p>
                                        <button onClick={closeCart} className="mt-6 bg-[#242926] hover:bg-[#323b36] text-white px-6 py-3 rounded-lg font-bold transition-all">
                                            Повернутися до покупок
                                        </button>
                                    </div>
                                )
                                : isCheckout ? (
                                        <form id="checkout-form" onSubmit={submitOrder} className="flex flex-col gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Ваше ім'я</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Іван Іванов"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-3 text-white focus:border-[#facc15] focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Номер телефону</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        // Захист: якщо стерли префікс, повертаємо його
                                                        if (!val.startsWith('+380')) {
                                                            val = '+380';
                                                        }
                                                        // Залишаємо тільки цифри після +380 і лімітуємо до 9 штук
                                                        const digits = val.slice(4).replace(/\D/g, '');
                                                        setFormData({...formData, phone: '+380' + digits.slice(0, 9)});
                                                    }}
                                                    pattern="^\+380[0-9]{9}$"
                                                    title="Введіть коректний номер у форматі +380XXXXXXXXX"
                                                    className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-3 text-white focus:border-[#facc15] focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Місто та відділення НП</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="м. Львів, Відділення №1"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                    className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-3 text-white focus:border-[#facc15] focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div className="mt-4 p-4 bg-[#1c221f] rounded-lg border border-[#242926]">
                                                <h4 className="text-sm font-bold text-gray-300 mb-2">Ваше замовлення:</h4>
                                                <ul className="text-sm text-gray-400 flex flex-col gap-1 mb-3">
                                                    {items.map(i => (
                                                        <li key={i.id} className="flex justify-between">
                                                            <span className="truncate pr-2">{i.name} x{i.quantity}</span>
                                                            <span className="shrink-0">{i.price * i.quantity} грн</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="flex justify-between items-center pt-3 border-t border-[#323b36]">
                                                    <span className="font-bold text-white">Сума:</span>
                                                    <span className="font-black text-[#facc15] text-lg">{total} грн</span>
                                                </div>
                                            </div>
                                        </form>
                                    )
                                    : items.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-10 font-medium">Кошик порожній 😔</div>
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} className="flex gap-4 bg-[#1c221f] p-3 rounded-lg border border-[#242926]">
                                                <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-black" />
                                                <div className="flex flex-col justify-between flex-1">
                                                    <h3 className="text-white text-sm font-bold leading-tight line-clamp-2">{item.name}</h3>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[#facc15] font-black">{item.price * item.quantity} грн</span>
                                                        <div className="flex items-center bg-[#141816] rounded-md border border-[#323b36]">
                                                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-400 hover:text-white"><Minus className="h-4 w-4"/></button>
                                                            <span className="w-8 text-center text-white text-sm font-bold">{item.quantity}</span>
                                                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-400 hover:text-white"><Plus className="h-4 w-4"/></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 transition-colors self-start p-1">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                        </div>

                        {!isSuccess && items.length > 0 && (
                            <div className="p-6 border-t border-[#242926] bg-[#1c221f] flex flex-col gap-3">
                                {!isCheckout ? (
                                    <>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400 font-medium">Всього до сплати:</span>
                                            <span className="text-2xl font-black text-white">{total} грн</span>
                                        </div>
                                        <button onClick={() => setIsCheckout(true)} className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-4 rounded-xl font-black text-lg transition-all active:scale-[0.98]">
                                            Оформити замовлення
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            form="checkout-form"
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] py-4 rounded-xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Підтвердити замовлення'}
                                        </button>
                                        <button type="button" onClick={() => setIsCheckout(false)} className="w-full text-gray-400 hover:text-white py-2 font-medium transition-colors">
                                            Назад до кошика
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};