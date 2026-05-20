"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Search, ChevronRight, LayoutGrid, ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';

type Product = {
  id: number;
  brand: string;
  node: string;
  name: string;
  price: number;
  img: string;
  desc: string;
};

type NodeConfig = {
  name: string;
  images: Record<string, string>;
};

// Конфігурація шляхів до локальних фотографій
const TRACTOR_NODES_CONFIG: NodeConfig[] = [
  {
    name: "Двигун",
    images: {
      mtz: "/categories/mtz/mtz-engine.webp",
      yumz: "/categories/yumz/yumz-engine.webp",
      t25: "/categories/t25/t25-engine.webp"
    }
  },
  {
    name: "Система живлення",
    images: {
      mtz: "/categories/mtz/mtz-power.webp",
      yumz: "/categories/yumz/yumz-power.webp",
      t25: "/categories/t25/t25-power.webp"
    }
  },
  {
    name: "Система охолодження",
    images: {
      mtz: "/categories/mtz/mtz-cooling.webp",
      yumz: "/categories/yumz/yumz-cooling.webp",
      t25: "/categories/t25/t25-cooling.webp"
    }
  },
  {
    name: "Система змащення",
    images: {
      mtz: "/categories/mtz/mtz-lubrication.webp",
      yumz: "/categories/yumz/yumz-lubrication.webp",
      t25: "/categories/t25/t25-lubrication.webp"
    }
  },
  {
    name: "Зчеплення",
    images: {
      mtz: "/categories/mtz/mtz-clutch.webp",
      yumz: "/categories/yumz/yumz-clutch.webp",
      t25: "/categories/t25/t25-clutch.webp"
    }
  },
  {
    name: "Пусковий двигун",
    images: {
      mtz: "/categories/mtz/mtz-starter-motor.webp",
      yumz: "/categories/yumz/yumz-starter-motor.webp",
      t25: "/categories/t25/t25-starter-motor.webp"
    }
  },
  {
    name: "Коробка передач",
    images: {
      mtz: "/categories/mtz/mtz-gearbox.webp",
      yumz: "/categories/yumz/yumz-gearbox.webp",
      t25: "/categories/t25/t25-gearbox.webp"
    }
  },
  {
    name: "Задній міст",
    images: {
      mtz: "/categories/mtz/mtz-rear-axle.webp",
      yumz: "/categories/yumz/yumz-rear-axle.webp",
      t25: "/categories/t25/t25-rear-axle.webp"
    }
  },
  {
    name: "Напіврама",
    images: {
      mtz: "/categories/mtz/mtz-frame.webp",
      yumz: "/categories/yumz/yumz-frame.webp",
      t25: "/categories/t25/t25-frame.webp"
    }
  },
  {
    name: "Вісь передня",
    images: {
      mtz: "/categories/mtz/mtz-front-axle.webp",
      yumz: "/categories/yumz/yumz-front-axle.webp",
      t25: "/categories/t25/t25-front-axle.webp"
    }
  },
  {
    name: "Колеса і ступиці",
    images: {
      mtz: "/categories/mtz/mtz-wheels.webp",
      yumz: "/categories/yumz/yumz-wheels.webp",
      t25: "/categories/t25/t25-wheels.webp"
    }
  },
  {
    name: "Рульове керування",
    images: {
      mtz: "/categories/mtz/mtz-steering.webp",
      yumz: "/categories/yumz/yumz-steering.webp",
      t25: "/categories/t25/t25-steering.webp"
    }
  },
  {
    name: "Гальма",
    images: {
      mtz: "/categories/mtz/mtz-brakes.webp",
      yumz: "/categories/yumz/yumz-brakes.webp",
      t25: "/categories/t25/t25-brakes.webp"
    }
  },
  {
    name: "Відбір потужності",
    images: {
      mtz: "/categories/mtz/mtz-pto.webp",
      yumz: "/categories/yumz/yumz-pto.webp",
      t25: "/categories/t25/t25-pto.webp"
    }
  },
  {
    name: "Механізм задньої навіски",
    images: {
      mtz: "/categories/mtz/mtz-hitch.webp",
      yumz: "/categories/yumz/yumz-hitch.webp",
      t25: "/categories/t25/t25-hitch.webp"
    }
  },
  {
    name: "Електрообладнання та прилади",
    images: {
      mtz: "/categories/mtz/mtz-electronics.webp",
      yumz: "/categories/yumz/yumz-electronics.webp",
      t25: "/categories/t25/t25-electronics.webp"
    }
  },
  {
    name: "Гідроагрегати",
    images: {
      mtz: "/categories/mtz/mtz-hydraulics.webp",
      yumz: "/categories/yumz/yumz-hydraulics.webp",
      t25: "/categories/t25/t25-hydraulics.webp"
    }
  },
  {
    name: "Арматура",
    images: {
      mtz: "/categories/mtz/mtz-valves.webp",
      yumz: "/categories/yumz/yumz-valves.webp",
      t25: "/categories/t25/t25-valves.webp"
    }
  },
  {
    name: "Кабіна",
    images: {
      mtz: "/categories/mtz/mtz-cabin.webp",
      yumz: "/categories/yumz/yumz-cabin.webp",
      t25: "/categories/t25/t25-cabin.webp"
    }
  },
  {
    name: "Підшипники",
    images: {
      mtz: "/categories/mtz/mtz-bearings.webp",
      yumz: "/categories/yumz/yumz-bearings.webp",
      t25: "/categories/t25/t25-bearings.webp"
    }
  },
  {
    name: "Манжети",
    images: {
      mtz: "/categories/mtz/mtz-seals.webp",
      yumz: "/categories/yumz/yumz-seals.webp",
      t25: "/categories/t25/t25-seals.webp"
    }
  },
  {
    name: "Кріплення",
    images: {
      mtz: "/categories/mtz/mtz-fasteners.webp",
      yumz: "/categories/yumz/yumz-fasteners.webp",
      t25: "/categories/t25/t25-fasteners.webp"
    }
  }
];

const TRACTOR_BRANDS = [
  { id: "mtz", name: "МТЗ", count: 1222 },
  { id: "yumz", name: "ЮМЗ", count: 845 },
  { id: "t25", name: "Т-25", count: 630 }
];

export default function AgroStore() {
  const [selectedBrand, setSelectedBrand] = useState(TRACTOR_BRANDS[0]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Помилка при завантаженні товарів:', error);
      } else if (data) {
        setProducts(data);
      }
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const handleBrandChange = (brand: typeof TRACTOR_BRANDS[0]) => {
    setSelectedBrand(brand);
    setSelectedNode(null);
  };

  const currentProducts = products.filter(
      (p) => p.brand === selectedBrand.name && p.node === selectedNode
  );

  return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-10">

        {/* ЛІВА ПАНЕЛЬ (МАРКИ) */}
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

        {/* ЦЕНТРАЛЬНА ЧАСТИНА */}
        <main className="flex-1">
          {!selectedNode ? (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-[#242926]">
                  <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6 text-gray-600" />
                    <span>Каталог вузлів <span className="text-[#facc15] font-black">{selectedBrand.name}</span></span>
                  </h1>
                </div>

                {/* 1. СІТКА КАТЕГОРІЙ (Жорстка фіксація картинок) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {TRACTOR_NODES_CONFIG.map((node) => {
                    const currentImage = node.images[selectedBrand.id] || "/categories/placeholder.webp";

                    return (
                        <button
                            key={node.name}
                            onClick={() => setSelectedNode(node.name)}
                            className="bg-[#141816] border border-[#242926] rounded-xl overflow-hidden text-center flex flex-col hover:border-[#facc15] hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
                        >
                          <div className="w-full aspect-[4/3] bg-[#1c221f] overflow-hidden relative border-b border-[#242926]">
                            <img
                                src={currentImage}
                                alt={node.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100 pointer-events-none"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%231c221f'/></svg>";
                                }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                          </div>

                          <div className="p-4 flex items-center justify-center min-h-[4rem]">
                             <span className="font-bold text-white text-sm leading-tight group-hover:text-[#facc15] transition-colors line-clamp-2">
                               {node.name}
                             </span>
                          </div>
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

                {isLoading ? (
                    <div className="text-center py-20 bg-[#141816] rounded-xl border border-dashed border-[#323b36] flex flex-col items-center justify-center">
                      <Loader2 className="h-10 w-10 text-[#facc15] animate-spin mb-4" />
                      <h3 className="text-white font-bold text-lg">Завантажуємо деталі з бази...</h3>
                    </div>
                ) : currentProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#141816] rounded-xl border border-dashed border-[#323b36] flex flex-col items-center justify-center">
                      <Search className="h-12 w-12 text-gray-600 mb-4" />
                      <h3 className="text-white font-bold text-xl mb-2">У цій категорії поки немає товарів.</h3>
                      <p className="text-gray-500 text-sm">Додайте їх у панелі Supabase!</p>
                    </div>
                ) : (
                    /* 2. СІТКА ТОВАРІВ (Така ж жорстка фіксація картинок) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentProducts.map((product) => (
                          <div key={product.id} className="bg-[#141816] rounded-lg border border-[#242926] overflow-hidden hover:border-[#3a443e] transition-all group flex flex-col justify-between">
                            <Link href={`/product/${product.id}`} className="block">
                              <div className="relative aspect-video bg-[#1c221f] overflow-hidden">
                                <img
                                    src={product.img}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                                />
                                <span className="absolute top-2 left-2 bg-[#0f1110]/90 text-[#facc15] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#323b36] z-10">
                                  Артикул: {product.id}
                                </span>
                              </div>
                              <div className="p-4 flex-1 flex flex-col gap-2">
                                <h3 className="font-bold text-white text-base group-hover:text-[#facc15] transition-colors leading-snug">
                                  {product.name}
                                </h3>
                              </div>
                            </Link>

                            <div className="p-4 pt-0">
                              <div className="flex items-center justify-between pt-3 border-t border-[#242926]">
                                <div className="flex flex-col">
                                  <span className="text-xl font-black text-white">{product.price} <span className="text-xs font-normal text-gray-400">грн</span></span>
                                </div>
                                <a
                                    href={`https://t.me/your_telegram?text=Вітаю! Хочу замовити: ${encodeURIComponent(product.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#facc15] hover:bg-[#eab308] text-[#0f1110] px-3 py-2 rounded font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 z-10 relative"
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