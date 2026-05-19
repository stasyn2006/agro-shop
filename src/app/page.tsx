"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // ДОДАНО: Імпорт Link для переходів
import { Search, ChevronRight, LayoutGrid, Zap, Fan, Droplets, Disc3, Settings, Bot, ArrowRightLeft, Radio, Target, CircleUserRound, Lightbulb, Box, KeyRound, Wrench, Magnet, ShieldCheck, ArrowLeft, ShoppingCart } from 'lucide-react';

const TRACTOR_NODES_CONFIG = [
  { name: "Двигун", icon: Zap },
  { name: "Система живлення", icon: Fan },
  { name: "Система охолодження", icon: Droplets },
  { name: "Система змащення", icon: Droplets },
  { name: "Зчеплення", icon: Disc3 },
  { name: "Пусковий двигун", icon: Bot },
  { name: "Коробка передач", icon: Settings },
  { name: "Задній міст", icon: Box },
  { name: "Напіврама", icon: Box },
  { name: "Вісь передня", icon: ArrowRightLeft },
  { name: "Колеса і ступиці", icon: Disc3 },
  { name: "Рульове керування", icon: Radio },
  { name: "Гальма", icon: Target },
  { name: "Відбір потужності", icon: KeyRound },
  { name: "Механізм задньої навіски", icon: CircleUserRound },
  { name: "Електрообладнання та прилади", icon: Lightbulb },
  { name: "Гідроагрегати", icon: Droplets },
  { name: "Арматура", icon: Wrench },
  { name: "Кабіна", icon: CircleUserRound },
  { name: "Підшипники", icon: Magnet },
  { name: "Манжети", icon: Magnet },
  { name: "Кріплення", icon: ShieldCheck },
];

const TRACTOR_BRANDS = [
  { id: "mtz", name: "МТЗ", count: 1222 },
  { id: "yumz", name: "ЮМЗ", count: 845 },
  { id: "t25", name: "Т-25", count: 630 }
];

const PRODUCTS = [
  { id: 101, brand: "МТЗ", node: "Двигун", name: "Колінвал МТЗ-80/82 (Д-240)", price: 8450, img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400" },
  { id: 102, brand: "МТЗ", node: "Система живлення", name: "Насос паливний ТНВД (Д-240)", price: 12500, img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400" },
  { id: 201, brand: "ЮМЗ", node: "Двигун", name: "Поршнекомплект ЮМЗ (Д-65)", price: 4200, img: "https://images.unsplash.com/photo-1594818379496-da1e345b06a9?q=80&w=400" },
  { id: 202, brand: "ЮМЗ", node: "Система живлення", name: "Форсунка ЮМЗ в зборі", price: 850, img: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=400" },
  { id: 301, brand: "Т-25", node: "Двигун", name: "Циліндр двигуна Т-25 (Д-21)", price: 1800, img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400" },
  { id: 302, brand: "Т-25", node: "Система живлення", name: "Насос паливний НД-21/2", price: 6300, img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400" },
];

export default function AgroStore() {
  const [selectedBrand, setSelectedBrand] = useState(TRACTOR_BRANDS[0]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleBrandChange = (brand: typeof TRACTOR_BRANDS[0]) => {
    setSelectedBrand(brand);
    setSelectedNode(null);
  };

  const currentProducts = PRODUCTS.filter(
      (p) => p.brand === selectedBrand.name && p.node === selectedNode
  );

  return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-10">

        {/* ЛІВА ПАНЕЛЬ */}
        <aside className="w-full md:w-64 shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 px-2">Марки техніки</h2>
          <div className="flex flex-col gap-2">
            {TRACTOR_BRANDS.map((brand) => {
              const isSelected = selectedBrand.id === brand.id;
              return (
                  <button
                      key={brand.id}
                      onClick={() => handleBrandChange(brand)}
                      className={`w-full flex items-center justify-between px-4 py-4 rounded-lg border transition-all ${
                          isSelected ? "bg-[#1c221f] text-white border-[#323b36]" : "bg-[#141816] hover:bg-[#1c221f]/60 text-gray-300 border-[#242926]"
                      }`}
                  >
                    <span className="font-black tracking-wide text-lg">{brand.name} <span className="text-xs font-normal text-gray-600 ml-1">({brand.count})</span></span>
                    <ChevronRight className={`h-5 w-5 ${isSelected ? "text-[#facc15]" : "text-gray-700"}`} />
                  </button>
              );
            })}
          </div>
        </aside>

        {/* ЦЕНТР */}
        <main className="flex-1">
          {!selectedNode ? (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-[#242926]">
                  <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6 text-gray-600" />
                    <span>Каталог вузлів <span className="text-[#facc15] font-black">{selectedBrand.name}</span></span>
                  </h1>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {TRACTOR_NODES_CONFIG.map((node) => {
                    const NodeIcon = node.icon;
                    return (
                        <button
                            key={node.name}
                            onClick={() => setSelectedNode(node.name)}
                            className="bg-[#141816] border border-[#242926] rounded-xl p-6 text-center flex flex-col items-center gap-4 hover:border-[#facc15] hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
                        >
                          <div className="bg-[#1c221f] p-4 rounded-full border border-[#242926] transition-colors group-hover:border-[#facc15]">
                            <NodeIcon className="h-8 w-8 text-gray-600 transition-colors group-hover:text-[#facc15]" />
                          </div>
                          <span className="font-bold text-white text-sm leading-tight group-hover:text-[#facc15] transition-colors line-clamp-2">{node.name}</span>
                        </button>
                    );
                  })}
                </div>
              </>
          ) : (
              <>
                <div className="flex flex-col mb-8 pb-4 border-b border-[#242926]">
                  <button onClick={() => setSelectedNode(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#facc15] transition-colors mb-4 w-fit">
                    <ArrowLeft className="h-4 w-4" /> Назад до вузлів {selectedBrand.name}
                  </button>
                  <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span className="text-gray-500">{selectedBrand.name}</span>
                    <span className="text-[#facc15]">/</span>
                    <span>{selectedNode}</span>
                  </h1>
                </div>

                {currentProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#141816] rounded-xl border border-dashed border-[#323b36] flex flex-col items-center justify-center">
                      <Search className="h-12 w-12 text-gray-600 mb-4" />
                      <h3 className="text-white font-bold text-xl mb-2">У цій категорії поки немає товарів.</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentProducts.map((product) => (
                          <div key={product.id} className="bg-[#141816] rounded-lg border border-[#242926] overflow-hidden hover:border-[#3a443e] transition-all group flex flex-col justify-between">
                            {/* ДОДАНО: Обгортка Link для переходу на сторінку товару */}
                            <Link href={`/product/${product.id}`} className="block">
                              <div className="relative aspect-video bg-[#1c221f] overflow-hidden">
                                <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100" />
                                <span className="absolute top-2 left-2 bg-[#0f1110]/90 text-[#facc15] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#323b36]">
                          Артикул: {product.id}
                        </span>
                              </div>
                              <div className="p-4 flex-1 flex flex-col gap-2">
                                <h3 className="font-bold text-white text-base group-hover:text-[#facc15] transition-colors leading-snug">
                                  {product.name}
                                </h3>
                              </div>
                            </Link>

                            {/* Нижня частина з ціною та кнопкою залишається без змін */}
                            <div className="p-4 pt-0">
                              <div className="flex items-center justify-between pt-3 border-t border-[#242926]">
                                <div className="flex flex-col">
                                  <span className="text-xl font-black text-white">{product.price} <span className="text-xs font-normal text-gray-400">грн</span></span>
                                </div>
                                <a
                                    href={`https://t.me/your_telegram?text=Вітаю! Хочу замовити: ${encodeURIComponent(product.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] px-3 py-2 rounded font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                                >
                                  <ShoppingCart className="h-4 w-4" /> Замовити
                                </a>
                              </div>
                            </div>

                          </div>
                      ))}
                    </div>
                )}
              </>
          )}
        </main>
      </div>
  );
}