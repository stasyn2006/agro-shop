"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, LogOut, Loader2, Image as ImageIcon, ShieldAlert, X } from 'lucide-react';

// Повний список вузлів для випадаючого списку
const TRACTOR_NODES = [
    "Двигун", "Система живлення", "Система охолодження", "Система змащення", "Зчеплення",
    "Пусковий двигун", "Коробка передач", "Задній міст", "Напіврама", "Вісь передня",
    "Колеса і ступиці", "Рульове керування", "Гальма", "Відбір потужності", "Механізм задньої навіски",
    "Електрообладнання та прилади", "Гідроагрегати", "Арматура", "Кабіна", "Підшипники", "Манжети", "Кріплення"
];

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [debugError, setDebugError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Ціна тепер рядок, щоб зручно вводити без стрілочок
    const [formData, setFormData] = useState({
        name: '',
        brand: 'МТЗ',
        node: 'Двигун',
        price: '',
        article: '',
        img: '',
        gallery: '',
        desc: 'Оригінальна запчастина'
    });

    useEffect(() => {
        checkUserAndFetchData();
    }, []);

    const checkUserAndFetchData = async () => {
        try {
            setIsLoading(true);
            setDebugError(null);

            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (!data || !data.session) {
                router.push('/admin/login');
                return;
            }

            await fetchProducts();
        } catch (err: any) {
            console.error("Помилка авторизації:", err);
            setDebugError(err.message || "Сталася помилка при перевірці доступу.");
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
            if (error) throw error;
            if (data) setProducts(data);
        } catch (err: any) {
            console.error("Помилка завантаження бази:", err);
            setDebugError(err.message || "Не вдалося завантажити товари з бази даних.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Ти впевнений, що хочеш видалити цей товар?')) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            alert('Помилка видалення: ' + error.message);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: '', brand: 'МТЗ', node: 'Двигун', price: '', article: '', img: '', gallery: '', desc: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            brand: product.brand,
            node: product.node,
            price: String(product.price), // Перетворюємо в рядок для інпута
            article: product.article || '',
            img: product.img,
            gallery: product.gallery ? product.gallery.join(', ') : '',
            desc: product.desc || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const galleryArray = formData.gallery
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);

        const productData = {
            name: formData.name,
            brand: formData.brand,
            node: formData.node,
            price: Number(formData.price), // Перед відправкою робимо числом
            article: formData.article,
            img: formData.img,
            gallery: galleryArray,
            desc: formData.desc
        };

        if (editingId) {
            const { error } = await supabase.from('products').update(productData).eq('id', editingId);
            if (error) alert('Помилка оновлення: ' + error.message);
        } else {
            const { error } = await supabase.from('products').insert([productData]);
            if (error) alert('Помилка створення: ' + error.message);
        }

        setIsSaving(false);
        setIsModalOpen(false);
        fetchProducts();
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 text-[#facc15] animate-spin" /></div>;

    if (debugError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl max-w-lg w-full flex flex-col items-center text-center gap-4">
                    <ShieldAlert className="h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-bold text-white">Сталася помилка</h2>
                    <p className="text-gray-400">{debugError}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 bg-[#242926] text-white px-6 py-2 rounded font-bold hover:bg-[#323b36]">
                        Спробувати ще раз
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-[#0f1110] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-center bg-[#141816] p-6 rounded-xl border border-[#242926] mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white">Панель керування</h1>
                        <p className="text-gray-400 text-sm">Керування каталогом товарів</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={openAddModal} className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                            <Plus className="h-5 w-5" /> Додати товар
                        </button>
                        <button onClick={handleLogout} className="bg-[#1c221f] hover:bg-[#242926] border border-[#323b36] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                            <LogOut className="h-5 w-5" /> Вийти
                        </button>
                    </div>
                </div>

                <div className="bg-[#141816] rounded-xl border border-[#242926] overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-[#1c221f] border-b border-[#323b36] text-xs uppercase font-black text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Фото</th>
                            <th className="px-6 py-4">Назва</th>
                            <th className="px-6 py-4">Бренд / Вузол</th>
                            <th className="px-6 py-4">Ціна</th>
                            <th className="px-6 py-4">Артикул</th>
                            <th className="px-6 py-4 text-right">Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Товарів поки немає. Створіть перший!</td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className="border-b border-[#242926] hover:bg-[#1c221f]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded bg-[#0f1110] border border-[#323b36] overflow-hidden flex items-center justify-center">
                                            {product.img ? <img src={product.img} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-600" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{product.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-[#242926] text-gray-300 px-2 py-1 rounded text-xs mr-2">{product.brand}</span>
                                        <span className="text-gray-500">{product.node}</span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-[#facc15]">{product.price} грн</td>
                                    <td className="px-6 py-4 text-gray-500">{product.article || '—'}</td>
                                    <td className="px-6 py-4 flex justify-end gap-3">
                                        <button onClick={() => openEditModal(product)} className="p-2 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#141816] border border-[#242926] rounded-2xl w-full max-w-2xl my-8">
                        <div className="p-6 border-b border-[#242926] flex justify-between items-center sticky top-0 bg-[#141816] rounded-t-2xl z-10">
                            <h2 className="text-xl font-black text-white">{editingId ? 'Редагувати товар' : 'Новий товар'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Назва товару</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Ціна (грн)</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.price}
                                        onChange={e => {
                                            // Дозволяємо вводити ТІЛЬКИ цифри
                                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                                            setFormData({...formData, price: onlyNumbers});
                                        }}
                                        className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Бренд</label>
                                    <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none">
                                        <option>МТЗ</option>
                                        <option>ЮМЗ</option>
                                        <option>Т-25</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Вузол</label>
                                    <select value={formData.node} onChange={e => setFormData({...formData, node: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none">
                                        {TRACTOR_NODES.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Артикул</label>
                                    <input type="text" value={formData.article} onChange={e => setFormData({...formData, article: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Шлях до головного фото</label>
                                    <input required type="text" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" placeholder="/categories/mtz/mtz-engine.webp" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Додаткові фото (через кому)</label>
                                <input type="text" value={formData.gallery} onChange={e => setFormData({...formData, gallery: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" placeholder="/photo1.jpg, /photo2.jpg" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Опис / Характеристики</label>
                                <textarea rows={3} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#242926] sticky bottom-0 bg-[#141816] rounded-b-2xl">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-300 hover:bg-[#1c221f] transition-colors">Скасувати</button>
                                <button type="submit" disabled={isSaving} className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] px-8 py-2.5 rounded-lg font-black transition-colors flex items-center gap-2">
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Зберегти'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}