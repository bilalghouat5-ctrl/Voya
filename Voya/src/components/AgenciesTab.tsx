/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Agency, Car, User, Review, Notification } from "../types";
import { 
  Search, 
  MapPin, 
  Star, 
  Eye, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Upload, 
  Calendar, 
  Heart,
  X,
  Download,
  AlertCircle,
  Check,
  Building,
  Car as CarIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgenciesTabProps {
  agencies: Agency[];
  cars: Car[];
  user?: User;
  onSelectCar: (car: Car) => void;
  onChangeTab?: (tab: string) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
  onAddNotification?: (notif: Notification) => void;
}

export default function AgenciesTab({ 
  agencies, 
  cars, 
  user = { name: "يونس الجزائري", email: "younes@voya.dz", phone: "+213 550 12 34 56" } as User,
  onSelectCar, 
  onChangeTab, 
  onSetHideBottomNav,
  onAddNotification
}: AgenciesTabProps) {
  
  // === LOCAL STATE & STORAGE PARALLELS ===
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [callingAgency, setCallingAgency] = useState<Agency | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("turo_dz_favs");
    return saved ? JSON.parse(saved) : [];
  });

  const [customReviews, setCustomReviews] = useState<any[]>(() => {
    const saved = localStorage.getItem("turo_dz_cust_reviews");
    return saved ? JSON.parse(saved) : [];
  });

  // Review states
  const [isAddingReview, setIsAddingReview] = useState<boolean>(false);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewName, setNewReviewName] = useState<string>("");
  const [newReviewComment, setNewReviewComment] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("turo_dz_cust_reviews", JSON.stringify(customReviews));
  }, [customReviews]);

  // Sync favorites with other tabs
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

  // Helper selectors
  const getAgencyCars = (agencyId: string) => {
    return cars.filter(c => c.agencyId === agencyId);
  };

  const getReviewsForAgency = (agencyId: string, agencyName: string) => {
    const defaultReviews = [
      {
        userName: "محمد لمين",
        rating: 5,
        comment: "تعامل راقٍ جداً وسرعة في تسليم السيارة. أنصح بالتعامل معهم بشدة في العاصمة.",
        date: "منذ 3 أيام"
      },
      {
        userName: "رياض بن عيسى",
        rating: 4,
        comment: "السيارات نظيفة ومطابقة للمواصفات تماماً، التوصيل للمطار كان دقيقاً وبدون تأخير.",
        date: "منذ أسبوع"
      }
    ];

    const localMatched = customReviews.filter(r => r.agencyId === agencyId);
    return [...localMatched, ...defaultReviews];
  };

  // Safe search logic
  const filteredAgencies = agencies.filter(agency => {
    const term = searchQuery.toLowerCase();
    return (
      agency.name.toLowerCase().includes(term) ||
      agency.city.toLowerCase().includes(term) ||
      (agency.address && agency.address.toLowerCase().includes(term))
    );
  });

  return (
    <div id="agencies-page-view" className="relative flex flex-col h-full bg-black text-white overflow-hidden text-right select-none" dir="rtl">
      
      {/* 1. Page Header */}
      <div className="relative flex items-center justify-center w-full h-16 shrink-0 bg-black border-b border-zinc-900/30 sticky top-0 z-20">
        <h1 className="text-[17px] font-black text-white tracking-wide">الوكالات الشريكة</h1>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* Header Description */}
        <div className="px-5 pt-4 pb-3 text-right">
          <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
            تصفح وتواصل مباشرة مع أفضل الوكالات في ولايات الجزائر لتأمين سيارتك براحة بال تامة وعقود رسمية إلكترونية معتمدة.
          </p>

          {/* Agency Search bar */}
          <div className="mt-3.5 bg-[#141416] bg-opacity-80 rounded-full p-2.5 shadow-md flex items-center gap-2 border border-zinc-850">
            <Search className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
            <input 
              id="agency-main-search-input"
              type="text"
              placeholder="ابحث باسم الوكالة أو الولاية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent text-white border-none outline-none placeholder-zinc-500 focus:ring-0 text-right pr-1"
            />
          </div>
        </div>

        {/* Grid of Agencies */}
        <div className="px-5 mt-4 space-y-4">
          <h2 className="text-xs font-extrabold text-zinc-400 tracking-tight">شركاء الخدمة المعتمدين بالجزائر ({filteredAgencies.length})</h2>
          
          {filteredAgencies.length === 0 ? (
            <div className="bg-[#111113] rounded-2xl p-6 text-center border border-zinc-900 py-10">
              <p className="text-xs font-bold text-zinc-400">لا توجد وكالات حالياً مطابقة لمعيار البحث.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAgencies.map((agency) => {
                const agencyCars = getAgencyCars(agency.id);
                return (
                  <div 
                    key={agency.id}
                    className="bg-[#141416]/90 rounded-2xl shadow-md border border-zinc-900 p-0 overflow-hidden relative text-right"
                  >
                    {/* Banner background with logo */}
                    <div className="relative h-20 w-full overflow-hidden bg-zinc-950">
                      <img 
                        src={agency.banner} 
                        alt="" 
                        className="w-full h-full object-cover brightness-[0.5]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {agency.verified && (
                          <span className="bg-emerald-950/80 border border-emerald-900/50 backdrop-blur-md text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> معتمدة
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-10 relative text-right">
                      {/* Floating circular Logo */}
                      <div className="w-14 h-14 rounded-xl border-4 border-[#141416] bg-zinc-900 absolute -top-8 right-4 shadow-lg overflow-hidden">
                        <img 
                          src={agency.logo} 
                          alt={agency.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex justify-between items-start mb-2 text-right">
                        <div className="text-right">
                          <h3 className="text-xs font-extrabold text-white text-right">{agency.name}</h3>
                          <p className="text-[10px] text-zinc-400 font-semibold mt-1 flex items-center justify-start gap-1">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{agency.city} • {agency.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-900/60">
                        <div className="flex gap-3 text-xs">
                          <div className="flex items-center gap-0.5 text-[#5c61ec] font-bold">
                            <Star className="w-3 h-3 fill-[#5c61ec] text-[#5c61ec]" />
                            <span>{agency.rating}</span>
                          </div>
                          <span className="text-zinc-500 text-[9.5px] font-semibold">({agency.reviewsCount} تقييم)</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold">
                          <CarIcon className="w-3.5 h-3.5 text-[#5c61ec]" />
                          <span>{agencyCars.length} سيارات معروضة</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedAgency(agency);
                            onSetHideBottomNav && onSetHideBottomNav(true);
                          }}
                          className="py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-[10.5px] font-bold rounded-full flex items-center justify-center gap-1 cursor-pointer border border-zinc-800 transition-all active:scale-[0.98]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض الأسطول
                        </button>

                        <button
                          onClick={() => setCallingAgency(agency)}
                          className="py-2 bg-[#5c61ec] text-white text-[10.5px] font-bold rounded-full flex items-center justify-center gap-1 shadow-md hover:bg-purple-700 active:scale-95 transition-all cursor-pointer border border-purple-550"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          اتصل بالوكيل
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Selected Agency Details Profile View Sheet */}
      <AnimatePresence>
        {selectedAgency && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col text-white text-right font-sans overflow-hidden" dir="rtl">
            
            {/* Top Toolbar Navigation - Swap Go Back to the right side! */}
            <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-900 flex justify-between items-center shrink-0">
              <span className="text-xs font-black text-zinc-300">الملف التعريفي للوكالة</span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    alert(`تم نسخ رابط الملف التعريفي لوكالة "${selectedAgency.name}" للمشاركة!`);
                  }}
                  className="w-[38px] h-[38px] rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/20 text-white hover:bg-white/[0.18] hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-md"
                  title="مشاركة"
                >
                  <Upload className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={() => {
                    setSelectedAgency(null);
                    setIsAddingReview(false);
                    setNewReviewComment("");
                    setNewReviewName("");
                    onSetHideBottomNav && onSetHideBottomNav(false);
                  }}
                  className="w-[38px] h-[38px] rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer"
                  title="رجوع"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Scrollable profile contents */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28 text-right">
              
              {/* Profile Header Image/Logo and Stats */}
              <div className="p-5 bg-zinc-950 border-b border-zinc-900 space-y-6">
                <div className="flex gap-4 items-center justify-start">
                  <div className="w-16 h-16 rounded-2xl border-2 border-zinc-800 bg-zinc-900 overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
                    <img 
                      src={selectedAgency.logo} 
                      alt="" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="text-right space-y-1">
                    <h2 className="text-sm font-black text-white text-right">{selectedAgency.name}</h2>
                    
                    {/* Premium Host Badge */}
                    <div className="flex gap-2 items-start mt-1.5 bg-[#5c61ec]/10 border border-[#5c61ec]/20 rounded-xl p-2 max-w-[270px]">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#5c61ec] flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-white text-[#5c61ec]" />
                      </div>
                      <div className="text-right">
                        <span className="text-[9.5px] font-black text-white block">مضيف متميز • شريك معتمد</span>
                        <span className="text-[8px] text-zinc-400 font-semibold block leading-tight">الوكلاء الأعلى تقييماً والأكثر التزاماً وخبرة بكراء السيارات على المنصة</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical split facts block */}
                <div className="grid grid-cols-3 border border-zinc-850 rounded-[18px] bg-zinc-900/40 p-3 h-16 items-center text-center">
                  <div className="border-l border-zinc-850">
                    <span className="text-xs font-black text-zinc-100 block">{(selectedAgency.reviewsCount * 2) + 12}</span>
                    <span className="text-[9px] font-bold text-zinc-500 block mt-0.5">رحلات مكتملة</span>
                  </div>
                  <div className="border-l border-zinc-850">
                    <span className="text-xs font-black text-[#5c61ec] flex items-center justify-center gap-0.5">
                      <span>{selectedAgency.rating.toFixed(1)}</span>
                      <Star className="w-3 h-3 fill-[#5c61ec] text-[#5c61ec]" />
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 block mt-0.5">التقييم العام</span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-100 block">{(selectedAgency.id.charCodeAt(3) % 3) + 2}</span>
                    <span className="text-[9px] font-bold text-zinc-500 block mt-0.5">سنوات خبرة</span>
                  </div>
                </div>
              </div>

              {/* Agency Vehicles/Fleet */}
              <div className="px-5 mt-6 space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[9.5px] bg-[#141416] border border-zinc-800 text-zinc-450 px-2.5 py-0.5 rounded-md font-extrabold font-mono">
                    {getAgencyCars(selectedAgency.id).length} سيارات متوفرة
                  </span>
                  <h3 className="text-xs font-black text-white">أسطول معروضات الوكالة</h3>
                </div>

                {/* Render cars */}
                <div className="space-y-4">
                  {getAgencyCars(selectedAgency.id).length === 0 ? (
                    <div className="text-center py-10 bg-[#141416]/50 border border-zinc-850 rounded-2xl">
                      <p className="text-[10px] font-semibold text-zinc-500">لا توجد سيارات معروضة لهذه الوكالة حالياً.</p>
                    </div>
                  ) : (
                    getAgencyCars(selectedAgency.id).map(car => {
                      const isCarFav = favorites.includes(car.id);
                      const discountAmount = Math.round(car.pricePerDay * 0.12);

                      return (
                        <div 
                          key={`fleet_ag_${car.id}`}
                          className="bg-[#141416] rounded-[20px] overflow-hidden border border-zinc-850 shadow-lg flex flex-col hover:border-zinc-750 transition-all text-right"
                        >
                          <div className="aspect-[16/10] w-full bg-zinc-950 relative overflow-hidden">
                            <img 
                              src={car.image} 
                              alt="" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(car.id);
                              }}
                              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/85 active:scale-95 transition-all cursor-pointer shadow"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isCarFav ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                            </button>
                          </div>

                          <div className="p-4 space-y-2 text-right">
                            <h4 className="text-xs font-black text-white text-right">{car.brand} {car.model} ({car.year})</h4>
                            
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold justify-start">
                              <span className="text-[#5c61ec] flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" /> {car.rating}
                              </span>
                              <span>({car.reviewsCount} رحلة)</span>
                            </div>

                            <p className="text-[9.5px] text-zinc-500 font-bold">
                              📍 التسليم بـ {car.city} (تتوفر إمكانية حجز التسليم الفوري والذكي)
                            </p>

                            <div className="border-t border-zinc-850 pt-2 flex justify-between items-center">
                              <span className="py-0.5 px-2 bg-emerald-950/40 border border-emerald-950/40 rounded-md text-[9px] font-bold text-emerald-400">
                                وفر {discountAmount.toLocaleString()} دج 🏷️
                              </span>

                              <div className="text-left font-mono">
                                <span className="text-xs font-black text-[#5c61ec] font-mono">{car.pricePerDay.toLocaleString()} دج</span>
                                <span className="text-[8px] text-zinc-500 font-bold block">اليومية الكلية</span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                onSelectCar(car);
                                setSelectedAgency(null);
                                onSetHideBottomNav && onSetHideBottomNav(false);
                              }}
                              className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white rounded-xl text-[10px] font-black tracking-wide text-center active:scale-[0.98] transition-all cursor-pointer"
                            >
                              عرض الخيارات وبدء الحجز الآمن ←
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Reviews Area */}
              <div className="px-5 mt-8 pt-6 border-t border-zinc-900 space-y-4">
                <div className="flex justify-between items-center text-right">
                  <h3 className="text-xs font-black text-white">التقييمات والتعليقات</h3>
                  <div className="flex items-center gap-1 bg-[#5c61ec]/10 border border-[#5c61ec]/20 rounded-full px-2.5 py-0.5">
                    <span className="text-[11px] font-black text-[#5c61ec] font-mono">{selectedAgency.rating.toFixed(1)} ★</span>
                    <span className="text-[8.5px] text-zinc-500 font-extrabold">{getReviewsForAgency(selectedAgency.id, selectedAgency.name).length} رأي</span>
                  </div>
                </div>

                {/* Add Review Box inside listing */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-[20px] p-4 text-right">
                  {!isAddingReview ? (
                    <button
                      onClick={() => setIsAddingReview(true)}
                      className="w-full py-2.5 bg-[#5c61ec]/10 hover:bg-[#5c61ec]/20 text-[#5c61ec] border border-[#5c61ec]/20 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer active:scale-95 text-center"
                    >
                      + كتابة تقييم ومراجعة للوكالة مباشرة
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newReviewComment) {
                          alert("يرجى كتابة نص المراجعة أولاً.");
                          return;
                        }

                        const generatedReview = {
                          id: "custom_" + Date.now(),
                          agencyId: selectedAgency.id,
                          userName: newReviewName || user.name,
                          rating: newReviewRating,
                          comment: newReviewComment,
                          date: "الآن"
                        };

                        setCustomReviews([generatedReview, ...customReviews]);

                        if (onAddNotification) {
                          onAddNotification({
                            id: "agency_rev_not_" + Date.now(),
                            title: "تم استلام تقييمك للوكالة ⭐",
                            content: `لقد أضفت تقييم ${newReviewRating} نجوم لوكالة "${selectedAgency.name}" بنجاح.`,
                            type: "system",
                            date: "الآن",
                            read: false
                          });
                        }

                        setIsAddingReview(false);
                        setNewReviewComment("");
                        setNewReviewName("");
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label htmlFor="agency-new-rev-name-tab" className="text-[9px] font-bold text-zinc-500 block mb-1">اسمك بالكامل (اختياري)</label>
                        <input 
                          id="agency-new-rev-name-tab"
                          type="text"
                          placeholder="مثال: يونس الجزائري"
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="w-full text-xs font-semibold bg-[#141416] border border-zinc-800 rounded-xl p-2 text-white outline-none text-right placeholder-zinc-650"
                        />
                      </div>

                      <div className="flex gap-1 justify-center py-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setNewReviewRating(num)}
                            className="p-1 cursor-pointer transition-transform active:scale-125"
                          >
                            <Star className={`w-6 h-6 ${num <= newReviewRating ? "text-[#5c61ec] fill-[#5c61ec]" : "text-zinc-800"}`} />
                          </button>
                        ))}
                      </div>

                      <div>
                        <label htmlFor="agency-new-rev-comment-tab" className="text-[9px] font-bold text-zinc-500 block mb-1">تعليقك وتقييمك للخدمة والسيارات*</label>
                        <textarea 
                          id="agency-new-rev-comment-tab"
                          rows={2}
                          required
                          placeholder="اكتب تعليقك هنا بصدق وصراحة..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full text-xs font-semibold bg-[#141416] border border-zinc-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-550 text-right placeholder-zinc-650"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-[#5c61ec] hover:bg-purple-700 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-md border border-purple-550"
                        >
                          نشر التقييم
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingReview(false);
                            setNewReviewComment("");
                          }}
                          className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-bold hover:text-white cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Review Feed */}
                <div className="space-y-3">
                  {getReviewsForAgency(selectedAgency.id, selectedAgency.name).map((rev, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#141416] border border-zinc-900 rounded-[18px] p-3.5 space-y-2 text-right"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[9.5px] text-zinc-500 font-bold">{rev.date}</span>
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] text-white font-extrabold">{rev.userName}</span>
                          <div className="w-5.5 h-5.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center text-[7.5px] font-black">
                            {rev.userName.charAt(0)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-0.5">
                        {[1, 2, 3, 4, 5].map(starNum => (
                          <Star 
                            key={starNum} 
                            className={`w-3 h-3 ${starNum <= rev.rating ? "text-[#5c61ec] fill-[#5c61ec]" : "text-zinc-800"}`} 
                          />
                        ))}
                      </div>

                      <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Floating Agency Bottom Action controls */}
            <div className="absolute bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 p-4 shrink-0 grid grid-cols-2 gap-3.5">
              <button
                onClick={() => setCallingAgency(selectedAgency)}
                className="py-3 bg-[#5c61ec] hover:bg-purple-700 text-white rounded-full text-xs font-black shadow-lg flex items-center justify-center gap-1.5 cursor-pointer border border-[#5c61ec]/50 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                اتصل بالوكيل الهاتفي
              </button>

              <button
                onClick={() => {
                  alert("لتأجير سيارة، يرجى تصفح الأسطول أعلاه والضغط على زر الحجز المباشر للمركبة المختارة.");
                }}
                className="py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800 transition-all"
              >
                📥 احجز رحلة الآن
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Calling Agency Simulated Dialog Overlay */}
      <AnimatePresence>
        {callingAgency && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 text-white p-4 text-center font-sans">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs flex flex-col items-center justify-center py-10 px-5 space-y-6"
            >
              {/* Spinning Logo Calling Indicator - shrank standard anim with platform style */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-purple-950/45 border-2 border-[#5c61ec] flex items-center justify-center relative shadow-xl overflow-hidden animate-pulse">
                  <img 
                    src={callingAgency.logo} 
                    alt="" 
                    className="w-14 h-14 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                {/* Platform purple bouncing lines - 50% smaller container & bouncing circles colored `#5c61ec` */}
                <div className="flex flex-row gap-1 items-center justify-center mt-4">
                  <div className="w-1 h-1 rounded-full bg-[#5c61ec] animate-bounce"></div>
                  <div className="w-1 h-1 rounded-full bg-[#5c61ec] animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 rounded-full bg-[#5c61ec] animate-bounce [animation-delay:-0.5s]"></div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">جاري الاتصال الآمن...</p>
                <h3 className="text-base font-black text-white">{callingAgency.name}</h3>
                <p className="text-xs text-zinc-400 font-semibold">{callingAgency.city} • هاتف: 0550XX XX XX</p>
              </div>

              <p className="text-[10.5px] text-[#5c61ec] px-4 font-bold leading-normal">
                بروتوكول تورو يضمن سرية مكالمتك وتأمين التسليم للمطار مباشرة بدون أي تكلفة إضافية.
              </p>

              <div className="pt-4 w-full">
                <button
                  onClick={() => setCallingAgency(null)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-lg cursor-pointer transition-all active:scale-95 border border-rose-500"
                >
                  إنهاء المكالمة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
