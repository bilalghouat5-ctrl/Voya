/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Agency, Car } from "../types";
import { 
  Search, 
  Star, 
  Heart, 
  Award,
  ChevronLeft
} from "lucide-react";

interface AgenciesTabProps {
  agencies: Agency[];
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onChangeTab?: (tab: string) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
}

export default function AgenciesTab({ agencies, cars, onSelectCar, onChangeTab, onSetHideBottomNav }: AgenciesTabProps) {
  // Sync favorites with localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("turo_dz_favs");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("turo_dz_favs");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const toggleFavorite = (carId: string) => {
    let updated: string[];
    if (favorites.includes(carId)) {
      updated = favorites.filter(id => id !== carId);
    } else {
      updated = [...favorites, carId];
    }
    setFavorites(updated);
    localStorage.setItem("turo_dz_favs", JSON.stringify(updated));
  };

  // Find all favorited cars
  const favoritedCars = cars.filter(c => favorites.includes(c.id));

  // Safe recently viewed extraction: We prefer Active/Premium models
  let recentlyViewedCars = cars.filter(c => ["car_nissan_kicks", "car_tesla_y", "car_bmw_x7"].includes(c.id));
  if (recentlyViewedCars.length === 0) {
    recentlyViewedCars = cars.slice(0, 3);
  }

  return (
    <div id="agencies-tab-view" className="relative flex flex-col h-full bg-black text-white overflow-y-auto no-scrollbar pb-24 text-right select-none" dir="rtl">
      
      {/* Tab Header (iOS Centered bar style exactly like the screenshot) */}
      <div className="relative flex items-center justify-center w-full h-16 shrink-0 bg-black border-b border-zinc-900/30 sticky top-0 z-20">
        <h1 className="text-[17px] font-black text-white tracking-wide">المفضلة</h1>
      </div>

      <div className="flex flex-col flex-1 pb-10">
        
        {/* Helper instructions banner / Empty State styled exactly like the screenshot */}
        {favoritedCars.length === 0 ? (
          <div className="px-6 mt-16 text-right space-y-3 max-w-sm">
            <h2 className="text-[19px] font-black text-white leading-snug">
              البدء مع قائمة المفضلة
            </h2>
            <p className="text-[13px] text-zinc-300 font-medium leading-relaxed mt-2 pl-4">
              اضغط على أيقونة القلب لحفظ سياراتك المفضلة في قائمة.
            </p>

            <div className="pt-4">
              <button
                id="find-new-favs-btn"
                onClick={() => onChangeTab && onChangeTab("explore")}
                className="w-full py-4 bg-[#121214] border border-[#262629] hover:border-zinc-700 rounded-[14px] flex items-center justify-center gap-2.5 hover:bg-zinc-900/50 text-white font-black text-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Search className="w-4 h-4 text-white stroke-[2.5]" />
                <span>البحث عن مفضلات جديدة</span>
              </button>
            </div>
          </div>
        ) : (
          /* Favorited cars list block exactly like the screenshot */
          <div className="mt-6 px-6 text-right">
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-black bg-rose-950/45 border border-rose-900/40 text-rose-400 px-3 py-0.5 rounded-full">
                {favoritedCars.length} سيارات محفوظة
              </span>
              <h3 className="text-sm font-black text-white/90">قائمتك المفضلة</h3>
            </div>

            <div className="space-y-6">
              {favoritedCars.map(car => (
                <div 
                  key={`fav_${car.id}`}
                  onClick={() => onSelectCar(car)}
                  className="bg-[#141416] rounded-[24px] overflow-hidden border border-zinc-900/80 shadow-xl text-right cursor-pointer hover:border-zinc-800 transition-all duration-200 block relative"
                >
                  <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden group">
                    <img 
                      src={car.image} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Heart button on top-right of the image to unfavorite */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Stop navigation to car page when heart is clicked
                        toggleFavorite(car.id);
                      }}
                      className="absolute top-4 right-4 w-[40px] h-[40px] rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/85 active:scale-90 transition-all cursor-pointer shadow-lg z-10"
                      title="إزالة من قائمة المفضلة"
                    >
                      <Heart className="w-[18px] h-[18px] fill-white text-white stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="p-5 text-right flex flex-col gap-1.5 bg-[#141416]">
                    <h4 className="text-[18px] font-black text-white tracking-snug text-right">
                      {car.brand} {car.model}
                    </h4>
                    
                    <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 font-medium justify-start" dir="rtl">
                      <span>{car.year}</span>
                      <span className="text-zinc-600 font-bold">•</span>
                      <span className="text-[#5c61ec] font-extrabold leading-none flex items-center gap-0.5 select-none text-[12px]">
                        {car.rating.toFixed(1).replace(".", ",")}
                        <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
                      </span>
                      <span className="text-zinc-400">({car.reviewsCount})</span>
                      <span className="text-zinc-600 font-bold">•</span>
                      <span className="text-purple-400 font-semibold flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-purple-400 fill-purple-400/10" />
                        <span>مضيف متميز</span>
                      </span>
                    </div>

                    <div className="border-t border-zinc-900/40 mt-3 pt-2.5 max-w-full">
                      <div className="text-left">
                        <span className="text-[13.5px] font-bold text-white hover:text-zinc-300 transition-colors">
                          عرض التفاصيل
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
              <button
                onClick={() => onChangeTab && onChangeTab("explore")}
                className="w-full py-4 bg-[#121214] border border-[#262629] hover:border-zinc-750 rounded-[14px] flex items-center justify-center gap-2 px-5 hover:bg-zinc-900/50 text-white font-black text-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Search className="w-4 h-4 text-white stroke-[2.5]" />
                <span>البحث عن سيارات مفضلة أخرى</span>
              </button>
            </div>
          </div>
        )}

        {/* Recently viewed block preserves functionality with matching high quality visual design */}
        <div className="mt-8 text-right">
          <h3 className="text-xs font-black text-zinc-400 text-right px-6 mb-4">تمت مشاهدتها مؤخراً</h3>
          
          <div className="px-6 space-y-6">
            {recentlyViewedCars.map(car => {
              const isCarFav = favorites.includes(car.id);
              return (
                <div 
                  key={`recent_${car.id}`}
                  onClick={() => onSelectCar(car)}
                  className="bg-[#141415] rounded-[24px] overflow-hidden border border-zinc-900 shadow-xl text-right cursor-pointer hover:border-zinc-800 transition-all active:scale-[0.99] duration-200 block relative"
                >
                  <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden group">
                    <img 
                      src={car.image} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Heart toggle on top-right of image */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent viewing car details on heart click
                        toggleFavorite(car.id);
                      }}
                      className="absolute top-4 right-4 w-[40px] h-[40px] rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/90 active:scale-95 transition-all text-center cursor-pointer shadow-lg z-10"
                      title={isCarFav ? "إزالة من قائمة المفضلة" : "إضافة إلى قائمة المفضلة"}
                    >
                      <Heart className={`w-[18px] h-[18px] transition-colors ${
                        isCarFav ? "fill-white text-white stroke-[2.5]" : "text-white stroke-[2.5]"
                      }`} />
                    </button>
                  </div>

                  <div className="p-5 pt-4 text-right flex flex-col gap-1.5 bg-[#141415]">
                    <h4 className="text-[18px] font-black text-white tracking-tight text-right">{car.brand} {car.model}</h4>
                    
                    <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 font-medium justify-start" dir="rtl">
                      <span>{car.year}</span>
                      <span className="text-zinc-650 font-bold">•</span>
                      <span className="text-[#5c61ec] font-extrabold leading-none flex items-center gap-0.5 select-none text-[12px]">
                        {car.rating.toFixed(1).replace(".", ",")}
                        <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
                      </span>
                      <span className="text-zinc-400">({car.reviewsCount})</span>
                      <span className="text-[#262629]/50 font-black">•</span>
                      <span className="text-purple-400 font-semibold flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-purple-400 fill-purple-400/10" />
                        <span>مضيف متميز</span>
                      </span>
                    </div>

                    <div className="border-t border-zinc-900/60 mt-3 pt-2.5 max-w-full">
                      <div className="text-left">
                        <span className="text-[13.5px] font-bold text-white hover:text-zinc-300 transition-colors">
                          عرض التفاصيل
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
