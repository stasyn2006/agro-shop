"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
// ДОДАЛИ ChevronDown для нашого нового списку
import { Plus, Edit2, Trash2, LogOut, Loader2, Image as ImageIcon, ShieldAlert, X, UploadCloud, Search, ChevronDown } from 'lucide-react';

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

    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isUploadingMain, setIsUploadingMain] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);

    // СТАН ДЛЯ НАШОГО НОВОГО СПИСКУ "ВУЗОЛ"
    const [isNodeOpen, setIsNodeOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        brand: 'МТЗ',
        node: 'Двигун',
        price: '',
        article: '',
        img: '',
        gallery: '',
        desc: 'Оригінальна запчастина',
        in_stock: true
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
        setFormData({ name: '', brand: 'МТЗ', node: 'Двигун', price: '', article: '', img: '', gallery: '', desc: '', in_stock: true });
        setIsNodeOpen(false); // Закриваємо список при відкритті модалки
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            brand: product.brand,
            node: product.node,
            price: String(product.price),
            article: product.article || '',
            img: product.img,
            gallery: product.gallery ? product.gallery.join(', ') : '',
            desc: product.desc || '',
            in_stock: product.in_stock !== false
        });
        setIsNodeOpen(false); // Закриваємо список при відкритті модалки
        setIsModalOpen(true);
    };

    const uploadImageToStorage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsUploadingMain(true);
        try {
            const file = e.target.files[0];
            const url = await uploadImageToStorage(file);
            setFormData({ ...formData, img: url });
        } catch (error: any) {
            alert('Помилка завантаження фото: ' + error.message);
        } finally {
            setIsUploadingMain(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsUploadingGallery(true);
        try {
            const newUrls: string[] = [];
            for (const file of Array.from(e.target.files)) {
                const url = await uploadImageToStorage(file);
                newUrls.push(url);
            }

            const currentGalleryStr = formData.gallery.trim();
            const newGalleryStr = newUrls.join(', ');

            const combinedGallery = currentGalleryStr
                ? `${currentGalleryStr}, ${newGalleryStr}`
                : newGalleryStr;

            setFormData({ ...formData, gallery: combinedGallery });
        } catch (error: any) {
            alert('Помилка завантаження галереї: ' + error.message);
        } finally {
            setIsUploadingGallery(false);
        }
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
            price: Number(formData.price),
            article: formData.article,
            img: formData.img,
            gallery: galleryArray,
            desc: formData.desc,
            in_stock: formData.in_stock
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

    const filteredProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase();
        const matchesId = product.id.toString().includes(query);
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesArticle = product.article?.toLowerCase().includes(query);

        return matchesId || matchesName || matchesArticle;
    });

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

    const isSaveDisabled = isSaving || isUploadingMain || isUploadingGallery;

    return (
        <div className="min-h-[80vh] bg-[#0f1110] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-center bg-[#141816] p-6 rounded-xl border border-[#242926] mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white">Панель керування</h1>
                        <p className="text-gray-400 text-sm">Керування каталогом товарів</p>
                    </div>

                    <div className="flex-1 max-w-md mx-4 relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Пошук по коду, назві або артикулу..."
                            className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#facc15] outline-none transition-colors"
                        />
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
                            <th className="px-6 py-4">Код / Артикул</th>
                            <th className="px-6 py-4">Назва</th>
                            <th className="px-6 py-4">Бренд / Вузол</th>
                            <th className="px-6 py-4">Ціна</th>
                            <th className="px-6 py-4 text-center">Статус</th>
                            <th className="px-6 py-4 text-right">Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    {searchQuery ? 'За вашим запитом нічого не знайдено.' : 'Товарів поки немає. Створіть перший!'}
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product.id} className="border-b border-[#242926] hover:bg-[#1c221f]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded bg-[#0f1110] border border-[#323b36] overflow-hidden flex items-center justify-center">
                                            {product.img ? <img src={product.img} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-600" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-bold text-xs bg-[#242926] px-2 py-1 rounded inline-block mb-1">Код: {product.id}</div>
                                        {product.article && <div className="text-gray-500 text-xs truncate max-w-[100px]">Арт: {product.article}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{product.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-[#242926] text-gray-300 px-2 py-1 rounded text-xs mr-2">{product.brand}</span>
                                        <span className="text-gray-500">{product.node}</span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-[#facc15]">{product.price} грн</td>

                                    <td className="px-6 py-4 text-center">
                                        {product.in_stock !== false ? (
                                            <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded text-xs font-bold">Є</span>
                                        ) : (
                                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded text-xs font-bold">Немає</span>
                                        )}
                                    </td>

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
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#141816] border border-[#242926] rounded-2xl w-full max-w-2xl my-8">
                        <div className="p-6 border-b border-[#242926] flex justify-between items-center sticky top-0 bg-[#141816] rounded-t-2xl z-10">
                            <h2 className="text-xl font-black text-white">{editingId ? 'Редагувати товар' : 'Новий товар'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
                            <div className="bg-[#1c221f] border border-[#323b36] p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-bold text-sm">Наявність товару</h3>
                                    <p className="text-gray-500 text-xs mt-0.5">Чи доступний цей товар для покупки клієнтами?</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.in_stock} onChange={e => setFormData({...formData, in_stock: e.target.checked})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#facc15]"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Назва товару</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Ціна (грн)</label>
                                    <input required type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Бренд</label>
                                    <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none cursor-pointer">
                                        <option>МТЗ</option>
                                        <option>ЮМЗ</option>
                                        <option>Т-25</option>
                                    </select>
                                </div>

                                {/* КАСТОМНИЙ ВУЗОЛ (Вирішує баг з вилітанням за екран) */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Вузол</label>
                                    <div
                                        onClick={() => setIsNodeOpen(!isNodeOpen)}
                                        className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white hover:border-[#facc15] focus:border-[#facc15] transition-colors cursor-pointer flex justify-between items-center"
                                    >
                                        <span className="truncate">{formData.node}</span>
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isNodeOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {isNodeOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[60]" onClick={() => setIsNodeOpen(false)}></div>
                                            <div className="absolute z-[70] top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-[#1c221f] border border-[#323b36] rounded-lg shadow-2xl custom-scrollbar py-1">
                                                {TRACTOR_NODES.map(n => (
                                                    <div
                                                        key={n}
                                                        onClick={() => {
                                                            setFormData({...formData, node: n});
                                                            setIsNodeOpen(false);
                                                        }}
                                                        className={`px-3 py-2 text-sm cursor-pointer transition-colors ${formData.node === n ? 'bg-[#facc15]/10 text-[#facc15] font-bold' : 'text-gray-300 hover:bg-[#242926] hover:text-white'}`}
                                                    >
                                                        {n}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Артикул</label>
                                    <input type="text" value={formData.article} onChange={e => setFormData({...formData, article: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Головне фото</label>
                                    <div className="flex gap-2 items-center h-[42px]">
                                        <label className={`cursor-pointer bg-[#242926] hover:bg-[#323b36] border border-[#323b36] text-white px-3 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 h-full shrink-0 ${isUploadingMain ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {isUploadingMain ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-[#facc15]" />}
                                            <span className="hidden sm:inline">Файл</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} disabled={isUploadingMain} />
                                        </label>
                                        <input required type="text" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="w-full h-full bg-[#1c221f] border border-[#323b36] rounded-lg px-2.5 text-white text-xs focus:border-[#facc15] outline-none" placeholder="Або встав посилання..." />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Додаткові фото (галерея)</label>
                                <div className="flex gap-2 items-start">
                                    <label className={`cursor-pointer bg-[#242926] hover:bg-[#323b36] border border-[#323b36] text-white px-3 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 h-[42px] shrink-0 ${isUploadingGallery ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {isUploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-[#facc15]" />}
                                        <span className="hidden sm:inline">Файли</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={isUploadingGallery} />
                                    </label>
                                    <textarea rows={2} value={formData.gallery} onChange={e => setFormData({...formData, gallery: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white text-xs focus:border-[#facc15] outline-none leading-relaxed" placeholder="Тут з'являться посилання через кому..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Опис / Характеристики</label>
                                <textarea rows={3} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-[#1c221f] border border-[#323b36] rounded-lg p-2.5 text-white focus:border-[#facc15] outline-none" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#242926] sticky bottom-0 bg-[#141816] rounded-b-2xl mt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-300 hover:bg-[#1c221f] transition-colors">Скасувати</button>
                                <button type="submit" disabled={isSaveDisabled} className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] px-8 py-2.5 rounded-lg font-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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