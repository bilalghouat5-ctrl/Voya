/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Reservation, User, Notification, Review, Agency, Car } from "../types";
import { 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  Ticket, 
  Ban, 
  Download, 
  FileText, 
  X, 
  AlertCircle, 
  Star,
  Search, 
  MapPin, 
  Eye, 
  Phone, 
  ArrowRight, 
  Upload, 
  Building, 
  Award, 
  Heart, 
  ChevronLeft, 
  Car as CarIcon, 
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookingsTabProps {
  bookings: Reservation[];
  user: User;
  onUpdateUser: (updated: User) => void;
  onUpdateBookingStatus: (id: string, status: "pending" | "confirmed" | "cancelled" | "active" | "completed") => void;
  onAddNotification: (notif: Notification) => void;
  onAddReview: (review: Review) => void;
  onChangeTab?: (tab: string) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
  agencies: Agency[];
  cars: Car[];
  onSelectCar: (car: Car) => void;
}

export default function BookingsTab({ 
  bookings, 
  user, 
  onUpdateUser, 
  onUpdateBookingStatus, 
  onAddNotification, 
  onAddReview, 
  onChangeTab, 
  onSetHideBottomNav,
  agencies,
  cars,
  onSelectCar
}: BookingsTabProps) {
  // Main Tab Level switcher (Trips vs Certified Agencies)
  const [mainTab, setMainTab] = useState<"trips" | "agencies">("trips");

  // === TRIPS TAB STATE ===
  const [activeSegment, setActiveSegment] = useState<"current" | "past">("current");
  const [selectedBookingForContract, setSelectedBookingForContract] = useState<Reservation | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Reservation | null>(null);
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  // === AGENCIES SECTION STATE ===
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [callingAgency, setCallingAgency] = useState<Agency | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("turo_dz_favs");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Custom Reviews for agencies
  const [customReviews, setCustomReviews] = useState<Array<{ id: string; agencyId: string; userName: string; rating: number; comment: string; date: string }>>([
    {
      id: "rev_mock_1",
      agencyId: "agency_bahdja",
      userName: "أحمد مليك",
      rating: 5,
      comment: "السيارات نظيفة ومعقمة للغاية، سهلة الوصول والموقع واضح، والمسير متعاون ومحترم جداً. سأقوم بالكراء منهم مجدداً بكل تأكيد.",
      date: "5 جوان 2026"
    }
  ]);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewName, setNewReviewName] = useState<string>("");
  const [newReviewComment, setNewReviewComment] = useState<string>("");
  const [isAddingReview, setIsAddingReview] = useState<boolean>(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState<boolean>(false);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState<boolean>(false);
  const [hasLoadedMoreReviews, setHasLoadedMoreReviews] = useState<boolean>(false);

  // Sync Favorites on focus/storage
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

  // Hide Bottom nav logic
  const isAnyModalOpen = !!selectedBookingForContract || !!reviewBooking || !!selectedAgency || !!callingAgency || showAllReviewsModal;
  
  React.useEffect(() => {
    if (onSetHideBottomNav) {
      onSetHideBottomNav(isAnyModalOpen);
    }
    return () => {
      if (onSetHideBottomNav) {
        onSetHideBottomNav(false);
      }
    };
  }, [isAnyModalOpen, onSetHideBottomNav]);

  const currentBookings = bookings.filter(b => b.status === "confirmed" || b.status === "active" || b.status === "pending");
  const pastBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled");
  const selectedList = activeSegment === "current" ? currentBookings : pastBookings;

  const handleCancelBooking = (booking: Reservation) => {
    if (window.confirm("هل أنت متأكد من إلغاء هذا الحجز؟ سيتم استرجاع المبلغ بالكامل إلى محفظتك.")) {
      const newBalance = user.walletBalance + booking.totalPrice;
      onUpdateUser({
        ...user,
        walletBalance: newBalance
      });

      onUpdateBookingStatus(booking.id, "cancelled");

      onAddNotification({
        id: "cancel_" + Date.now(),
        title: "تم إلغاء الحجز واسترداد المبلغ 💰",
        content: `لقد قمت بإلغاء حجز السيارة ${booking.carName}. تم إرجاع ${booking.totalPrice.toLocaleString()} دج بنجاح إلى رصيد محفظتك.`,
        type: "wallet",
        date: "الآن",
        read: false
      });
    }
  };

  const submitReviewForBooking = () => {
    if (!reviewBooking) return;
    
    onAddReview({
      id: "rev_" + Date.now(),
      userName: user.name,
      userAvatar: user.avatar,
      rating: reviewStars,
      comment: reviewComment || "تجربة ممتازة وسيارة رائعة، أنصح بها بشدة في الجزائر!",
      date: new Date().toISOString().split('T')[0],
      carId: reviewBooking.carId
    });

    onUpdateBookingStatus(reviewBooking.id, "completed");
    const found = bookings.find(b => b.id === reviewBooking.id);
    if (found) found.ratingGiven = reviewStars;
    
    onAddNotification({
      id: "rev_not_" + Date.now(),
      title: "شكراً على تقييمك النبيل ⭐️",
      content: "تم نشر مراجعتك بنجاح. تعليقاتك تساعد في تحسين مجتمع تورو الجزائر.",
      type: "system",
      date: "الآن",
      read: false
    });

    setReviewBooking(null);
    setReviewComment("");
    setReviewStars(5);
  };

  // === AGENCIES HELPERS ===
  const filteredAgencies = agencies.filter(agency => {
    return agency.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           agency.city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getAgencyCars = (agencyId: string) => {
    return cars.filter(car => car.agencyId === agencyId);
  };

  const getReviewsForAgency = (agencyId: string, agencyName: string) => {
    const filtered = customReviews.filter(r => r.agencyId === agencyId);
    if (filtered.length > 0) return filtered;

    return [
      {
        userName: "سامي .ق",
        rating: 5,
        comment: "ممتاز جداً! تعامل سريع وسيارات جديدة ونظيفة. الاستلام والتسليم تم في دقائق معدودة.",
        date: "6 جوان 2026"
      },
      {
        userName: "منى ب.",
        rating: 5,
        comment: "تعامل في غاية الاحترافية واللباقة، أعجبتني نظافة السيارة والخدمة الراقية المقدمة. أتمنى أن تكون كافة تجاربي القادمة هكذا.",
        date: "5 جوان 2026"
      },
      {
        userName: "هاجر ج.",
        rating: 5,
        comment: "السيارة كانت في حالة ممتازة، سهلة الاستلام ووكيل الوكالة متعاون جداً وسهل التواصل معه في أي وقت. سأكرر الإيجار بالتأكيد.",
        date: "5 جوان 2026"
      }
    ];
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastReviewElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMoreReviews || hasLoadedMoreReviews || !showAllReviewsModal) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsLoadingMoreReviews(true);
        setTimeout(() => {
          setIsLoadingMoreReviews(false);
          setHasLoadedMoreReviews(true);
        }, 1800);
      }
    }, { threshold: 0.1 });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMoreReviews, hasLoadedMoreReviews, showAllReviewsModal]);

  useEffect(() => {
    if (showAllReviewsModal) {
      setIsLoadingMoreReviews(false);
      setHasLoadedMoreReviews(false);
    }
  }, [showAllReviewsModal]);

  return (
    <div id="bookings-tab-view" className="relative flex flex-col h-full bg-black text-white overflow-hidden text-right" dir="rtl">
      
      {/* 1. Main Header - Centered Trips Page Header exactly like the screenshot */}
      <div className="relative flex items-center justify-center w-full h-16 shrink-0 bg-black border-b border-zinc-900/30 sticky top-0 z-20">
        <h1 className="text-[17px] font-black text-white tracking-wide">الرحلات</h1>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pr-1">
        
        {/* VIEW A: TRIPS */}
        {mainTab === "trips" && (
          <div className="px-5 pt-4 space-y-4">
            
            {/* Segmented Control: Active vs Past, only show if there are actual bookings so it doesn't clutter empty screen */}
            {bookings.length > 0 && (
              <div className="bg-[#141416]/80 p-1 rounded-xl flex gap-1 w-max mx-auto border border-zinc-900 leading-none mb-2">
                <button
                  onClick={() => setActiveSegment("current")}
                  className={`px-6 py-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    activeSegment === "current"
                      ? "bg-[#252528] text-white border border-zinc-850"
                      : "text-zinc-500 hover:text-zinc-450"
                  }`}
                >
                  النشطة ({currentBookings.length})
                </button>
                <button
                  onClick={() => setActiveSegment("past")}
                  className={`px-6 py-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    activeSegment === "past"
                      ? "bg-[#252528] text-white border border-zinc-850"
                      : "text-zinc-500 hover:text-zinc-450"
                  }`}
                >
                  المنتهية والملغاة ({pastBookings.length})
                </button>
              </div>
            )}

            {/* Bookings List */}
            {selectedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-6 px-4 max-w-md mx-auto">
                
                {/* 1. Elegant Vector Illustration exactly like the screenshot (Muscle Car and Pink Cactus) */}
                <div className="w-full max-w-[340px] mx-auto select-none">
                  <svg 
                    viewBox="0 0 400 240" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-full h-auto"
                  >
                    {/* Horizon & Ground Pathway line */}
                    <line x1="20" y1="180" x2="380" y2="180" stroke="#312e81" strokeWidth="2.5" />
                    <line x1="10" y1="194" x2="390" y2="194" stroke="#1e1b4b" strokeWidth="1.5" />
                    
                    {/* Road center dashes */}
                    <line x1="70" y1="180" x2="100" y2="180" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
                    <line x1="120" y1="180" x2="170" y2="180" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
                    <line x1="230" y1="180" x2="290" y2="180" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
                    <line x1="310" y1="180" x2="350" y2="180" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />

                    {/* Pink Sunset Cactus on the left background */}
                    {/* Main Trunk */}
                    <rect x="94" y="60" width="10" height="120" rx="5" fill="#e0128a" />
                    {/* Left curved arm */}
                    <path d="M 94 94 L 76 94 A 10 10 0 0 1 66 84 L 66 68 A 5 5 0 0 1 76 68 L 76 84 L 94 84 Z" fill="#e0128a" />
                    {/* Right curved arm */}
                    <path d="M 104 110 L 122 110 A 10 10 0 0 0 132 100 L 132 84 A 5 5 0 0 0 122 84 L 122 100 L 104 100 Z" fill="#e0128a" />
                    {/* Tiny Spines in Pink */}
                    <line x1="60" y1="78" x2="64" y2="76" stroke="#f472b6" strokeWidth="1.2" />
                    <line x1="138" y1="92" x2="134" y2="90" stroke="#f472b6" strokeWidth="1.2" />
                    <line x1="90" y1="52" x2="94" y2="48" stroke="#f472b6" strokeWidth="1.2" />

                    {/* Dusty bushes and ground grass details on right side */}
                    <path d="M 310 180 C 310 162, 320 162, 324 180 C 324 163, 332 163, 336 180 C 336 166, 344 166, 348 180" stroke="#a21caf" strokeWidth="2.5" fill="#581c87" />
                    <path d="M 318 182 L 314 158 M 322 182 L 328 152 M 328 182 L 344 162" stroke="#e0128a" strokeWidth="1" opacity="0.8" />
                    
                    {/* Dry tumbleweed bush on road center-right */}
                    <circle cx="230" cy="176" r="14" stroke="#a1a1aa" strokeWidth="2" strokeDasharray="3 2" fill="none" />
                    <circle cx="225" cy="173" r="10" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />

                    {/* BEAUTIFUL VINTAGE CONVERTIBLE MUSCLE CAR */}
                    <g id="retro-car">
                      {/* Sub-chassis / Shadow on road */}
                      <rect x="80" y="156" width="244" height="6" rx="3" fill="#090500" />
                      
                      {/* Car Body Lower Section (Indigo Blue) */}
                      <path d="M 72 153 C 72 135, 85 125, 115 125 L 315 125 C 335 125, 355 135, 355 153 L 72 153 Z" fill="#5c61ec" />
                      
                      {/* Car Side Highlight line */}
                      <line x1="77" y1="135" x2="350" y2="135" stroke="#a5b4fc" strokeWidth="1.8" />
                      <line x1="95" y1="145" x2="338" y2="145" stroke="#4b50d3" strokeWidth="1.8" />

                      {/* Tail Fin Accent */}
                      <path d="M 72 131 L 64 148 L 74 150 Z" fill="#6f73f7" />
                      {/* Chrome rear and front bumpers */}
                      <rect x="70" y="150" width="8" height="4" rx="2" fill="#e2e8f0" />
                      <rect x="348" y="150" width="10" height="4" rx="2" fill="#e2e8f0" />

                      {/* Cabin upper convertible canvas & windshield */}
                      {/* Windshield pillar */}
                      <line x1="228" y1="125" x2="218" y2="92" stroke="#e2e8f0" strokeWidth="2.5" />
                      {/* Convertible Roof structure (flat classical canopy style) */}
                      <path d="M 148 125 L 164 92 C 166 89, 172 88, 180 88 L 265 88 C 272 88, 276 91, 278 95 L 296 125 Z" fill="#1e1b4b" stroke="#5c61ec" strokeWidth="2.5" />
                      {/* Glass panes with slight reflection */}
                      <path d="M 160 121 L 172 94 L 210 94 L 210 121 Z" fill="#ffffff" opacity="0.14" />
                      <path d="M 218 121 L 218 94 L 268 94 L 280 121 Z" fill="#ffffff" opacity="0.08" />
                      <line x1="214" y1="90" x2="214" y2="123" stroke="#5c61ec" strokeWidth="2" />

                      {/* Steering wheel silhouette */}
                      <circle cx="238" cy="118" r="5" stroke="#94a3b8" strokeWidth="1.5" fill="none" />

                      {/* Rear & Front Wheels */}
                      {/* Rear Wheel */}
                      <circle cx="128" cy="155" r="21" fill="#18181b" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="128" cy="155" r="13" fill="#e0128a" /> {/* Magenta inner hub detail */}
                      <circle cx="128" cy="155" r="7" fill="#ffffff" />
                      <circle cx="128" cy="155" r="3.5" fill="#18181b" />

                      {/* Front Wheel */}
                      <circle cx="298" cy="155" r="21" fill="#18181b" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="298" cy="155" r="13" fill="#e0128a" /> {/* Magenta inner hub detail */}
                      <circle cx="298" cy="155" r="7" fill="#ffffff" />
                      <circle cx="298" cy="155" r="3.5" fill="#18181b" />
                    </g>
                  </svg>
                </div>

                {/* 2. Text Content precisely matched & localized */}
                <h2 className="text-xl font-black text-white mt-5 tracking-tight leading-snug">
                  لا توجد رحلات قادمة بعد
                </h2>
                
                <p className="text-[12px] text-zinc-400 font-medium leading-relaxed max-w-sm mt-2.5 px-6">
                  اكتشف آلاف السيارات المتاحة على <span className="font-extrabold text-zinc-300">Voya</span> واحجز رحلتك القادمة.
                </p>

                {/* 3. Action button precisely matching the screenshot's design & branding */}
                <div className="w-full px-6 mt-6 shrink-0">
                  <button
                    onClick={() => onChangeTab && onChangeTab("explore")}
                    className="w-full py-3.5 bg-[#5c61ec] hover:bg-[#4b50d3] active:scale-95 text-white rounded-[14px] text-xs font-black tracking-wide transition-all duration-200 select-none shadow-[0_4px_16px_rgba(92,97,236,0.35)] cursor-pointer"
                  >
                    ابدأ البحث
                  </button>
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                {selectedList.map((booking) => (
                  <div 
                    key={booking.id}
                    className="bg-[#141416]/90 border border-zinc-900/80 p-4 rounded-[22px] shadow-sm relative space-y-3.5 hover:border-zinc-850/60 transition-all text-right"
                  >
                    {/* Status badge and top info */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[9.5px] font-bold text-zinc-500 font-mono">#{booking.bookingCode}</span>
                      
                      {booking.status === "confirmed" && (
                        <span className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          مؤكد وموثق 🎖️
                        </span>
                      )}
                      {booking.status === "pending" && (
                        <span className="bg-amber-950/40 border border-amber-900/60 text-amber-500 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                          قيد التأكيد الحركي ⏱️
                        </span>
                      )}
                      {booking.status === "completed" && (
                        <span className="bg-purple-950/40 border border-purple-900/60 text-purple-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          مكتملة ومسترجعة ✅
                        </span>
                      )}
                      {booking.status === "cancelled" && (
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          ملغى ومسترد 💰
                        </span>
                      )}
                      {booking.status === "active" && (
                        <span className="bg-blue-950/40 border border-blue-900/60 text-blue-400 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                          نشط حالياً بالجزائر 🚗
                        </span>
                      )}
                    </div>

                    {/* Car snapshot */}
                    <div className="flex gap-3.5 items-center justify-start border-t border-zinc-900/40 pt-3">
                      <img 
                        src={booking.carImage} 
                        alt={booking.carName} 
                        className="w-20 h-14 object-cover rounded-xl shrink-0 bg-zinc-950"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-right">
                        <h3 className="text-xs font-extrabold text-white uppercase">{booking.carName}</h3>
                        <p className="text-[10px] text-zinc-500 mt-1 font-semibold">
                          تذكرة الحجز: <span className="font-mono font-extrabold text-zinc-300">{booking.bookingCode}</span>
                        </p>
                      </div>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-2 gap-2 bg-zinc-950 rounded-xl p-3 text-right border border-zinc-850">
                      <div>
                        <span className="text-[8px] text-zinc-500 block">تاريخ الاستلام بالجزائر</span>
                        <span className="text-[10px] font-extrabold text-zinc-300 block mt-0.5">{booking.startDate}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-zinc-500 block">تاريخ الإرجاع والمدة</span>
                        <span className="text-[10px] font-extrabold text-zinc-300 block mt-0.5">{booking.endDate} ({booking.totalDays} أيام)</span>
                      </div>
                    </div>

                    {/* Footer price and controls */}
                    <div className="flex justify-between items-center mt-3.5 pt-3 border-t border-zinc-800/60">
                      <div className="text-right">
                        <span className="text-[8px] text-zinc-500 block">المبلغ الإجمالي</span>
                        <span className="text-xs font-black text-purple-400 font-mono">{booking.totalPrice.toLocaleString()} دج</span>
                      </div>

                      <div className="flex gap-1.5">
                        {booking.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => setSelectedBookingForContract(booking)}
                              className="px-3 py-1.5 bg-zinc-850 border border-zinc-750 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-purple-400" />
                              عقد الإيجار
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-950 border border-rose-900/60 text-rose-400 text-[10px] font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                              title="إلغاء حجز"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              إلغاء
                            </button>
                          </>
                        )}

                        {booking.status === "completed" && !booking.ratingGiven && (
                          <button
                            onClick={() => setReviewBooking(booking)}
                            className="px-3.5 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-md cursor-pointer"
                          >
                            قيّم سيارتك ⭐
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW B: CERTIFIED AGENCIES */}
        {mainTab === "agencies" && (
          <div className="flex flex-col flex-1">
            {/* Header Description */}
            <div className="px-5 pt-3 pb-3 text-right">
              <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                تصفح وتواصل مباشرة مع أفضل الوكالات في ولايات الجزائر لتأمين سيارتك براحة بال تامة وعقود رسمية إلكترونية معتمدة.
              </p>

              {/* Agency Search bar built neatly */}
              <div className="mt-3.5 bg-zinc-900 rounded-full p-2.5 shadow-md flex items-center gap-2 border border-zinc-820">
                <Search className="w-4.5 h-4.5 text-zinc-500 shrink-0 mr-1" />
                <input 
                  id="agency-search-inside-trips"
                  type="text"
                  placeholder="ابحث باسم الوكالة أو الولاية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent text-white border-none outline-none placeholder-zinc-500 focus:ring-0 text-right"
                />
              </div>
            </div>

            {/* Grid of Agencies */}
            <div className="px-5 mt-4 space-y-4">
              <h2 className="text-xs font-extrabold text-zinc-400 tracking-tight">شركاء الخدمة المعتمدين بالجزائر ({filteredAgencies.length})</h2>
              
              {filteredAgencies.length === 0 ? (
                <div className="bg-zinc-900 rounded-2xl p-6 text-center border border-zinc-800 py-10">
                  <p className="text-xs font-bold text-zinc-400">لا توجــد وكالات حالياً مطابقة لمعيار البحث.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredAgencies.map((agency) => {
                    const agencyCars = getAgencyCars(agency.id);
                    return (
                      <div 
                        key={agency.id}
                        className="bg-zinc-900 rounded-2xl shadow-md border border-zinc-800 p-0 overflow-hidden relative text-right"
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
                              <span className="bg-emerald-950/80 border border-emerald-900/50 backdrop-blur-md text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                                <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> معتمدة
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 pt-10 relative text-right">
                          {/* Floating circular Logo */}
                          <div className="w-14 h-14 rounded-xl border-4 border-zinc-900 bg-zinc-900 absolute -top-8 right-4 shadow-lg overflow-hidden">
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

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/60">
                            <div className="flex gap-3 text-xs">
                              <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span>{agency.rating}</span>
                              </div>
                              <span className="text-zinc-550 text-[9.5px] font-semibold">({agency.reviewsCount} تقييم)</span>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold">
                              <CarIcon className="w-3.5 h-3.5 text-purple-400" />
                              <span>{agencyCars.length} سيارات معروضة</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                            <button
                              onClick={() => setSelectedAgency(agency)}
                              className="py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-[10.5px] font-bold rounded-full flex items-center justify-center gap-1 cursor-pointer border border-zinc-705 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              عرض الأسطول
                            </button>

                            <button
                              onClick={() => setCallingAgency(agency)}
                              className="py-2 bg-purple-600 text-white text-[10.5px] font-bold rounded-full flex items-center justify-center gap-1 shadow-md hover:bg-purple-700 active:scale-95 transition-all cursor-pointer border border-purple-500"
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
        )}

      </div>

      {/* ========================================================
          MODALS & OVERLAYS (STRICTLY ABSOLUTE & BOUNDED TO PHONE FRAME)
         ======================================================== */}
      
      {/* 1. Renders Bilingual Algerian Lease Agreement terms */}
      <AnimatePresence>
        {selectedBookingForContract && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 text-white text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 rounded-[28px] p-5 w-full max-w-sm max-h-[85%] flex flex-col border border-zinc-800 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-900 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-emerald-400 w-5 h-5 stroke-[2.5]" />
                  <span className="text-xs font-extrabold text-white">عقد الكراء الموحد للتطبيق</span>
                </div>
                <button
                  onClick={() => setSelectedBookingForContract(null)}
                  className="p-1 rounded-full bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-white cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Terms Content */}
              <div className="py-4 overflow-y-auto no-scrollbar space-y-4 text-zinc-300 flex-1">
                <div className="text-center bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                  <span className="text-[9px] bg-purple-950 border border-purple-800 text-purple-400 font-extrabold px-2.5 py-0.5 rounded-full block w-max mx-auto mb-2 font-mono">
                    كود التحقق: {selectedBookingForContract.bookingCode}
                  </span>
                  <p className="text-xs font-black text-white">{selectedBookingForContract.carName}</p>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-1">تاريخ الصلاحية: {selectedBookingForContract.startDate} إلى {selectedBookingForContract.endDate}</p>
                </div>

                <div className="space-y-3 font-semibold text-[10px] leading-relaxed">
                  <div>
                    <h4 className="text-white text-[10.5px] font-extrabold block mb-1">الطرف الأول: شركة تورو كراء السيارات بالجزائر</h4>
                    <p className="text-zinc-500 leading-normal">
                      بصفته الوسيط التراخيص المعتمد والشركة المقدمة تكنولوجياً عبر شبكات ريادة الأعمال الجزائرية.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white text-[10.5px] font-extrabold block mb-1">الطرف الثاني: المستأجر ({user.name})</h4>
                    <p className="text-zinc-500 leading-normal">
                      حامل رخصة سياقة إلكترونية مبرمة رقم: <span className="font-mono text-zinc-350">{user.licenseNumber || "DZ-2026/894"}</span>.
                    </p>
                  </div>

                  <hr className="border-zinc-900" />

                  <div className="space-y-2 text-zinc-400">
                    <p className="font-extrabold text-white">البنود والشروط الأساسية / Conditions du contrat:</p>
                    <p>1. يلتزم المستعلم بإرجاع السيارة بكافة تجهيزاتها ووقودها المتفق عليه عند التسليم للوكيل.</p>
                    <p>2. لا يجوز قيادة السيارة الفارهة من طرف شخص غير مدون في الوثيقة أو تذكرة شركة تورو.</p>
                    <p>3. التأمين إلزامي ويغطي كافة ترسبات الحوادث الموثقة بمحاضر مصلحة الدرك الوطني الجزائري.</p>
                    <p className="italic text-zinc-550 text-[9px] mt-2 leading-tight">
                      Ce contrat réglementaire numérique est conforme aux lois nationales de la République Algérienne Populaire.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Stamp action */}
              <div className="pt-4 border-t border-zinc-900 flex gap-2 shrink-0">
                <button
                  onClick={() => alert("تم حفظ نسخة عقد الكراء الموحد PDF بالهاتف بنجاح 📁")}
                  className="flex-1 py-2.5 bg-purple-650 hover:bg-purple-750 text-white border border-purple-550 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  حفظ نسخة العقد PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Booking Review Modal Sheet */}
      <AnimatePresence>
        {reviewBooking && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-xs text-white text-right" dir="rtl">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-zinc-950 w-full max-h-[80%] rounded-t-[28px] p-5 border-t border-zinc-800 space-y-4 shadow-2xl relative overflow-y-auto no-scrollbar"
            >
              <button
                onClick={() => setReviewBooking(null)}
                className="absolute top-4 left-4 text-zinc-500 hover:text-white cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xs font-black text-zinc-200 mt-1">شاركنا تقييمك للسيارة ⭐</h3>
              <p className="text-[10px] text-zinc-500 font-bold mb-2">كيف كانت تجربتك مع سيارة {reviewBooking.carName}؟</p>

              {/* Stars selection */}
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setReviewStars(num)}
                    className="p-1 cursor-pointer transition-transform active:scale-125"
                  >
                    <Star className={`w-8 h-8 ${num <= reviewStars ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
                  </button>
                ))}
              </div>

              {/* Comment inputs */}
              <div className="space-y-1 text-right">
                <label htmlFor="booking-review-comment" className="text-[9px] font-bold text-zinc-500 block">اكتب تعليقك وصراحتك*</label>
                <textarea
                  id="booking-review-comment"
                  rows={3}
                  required
                  placeholder="مثال: السيارة ممتازة، نظيفة جداً، والمعاملة راقية وسريعة..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 outline-none focus:border-purple-550 text-right"
                />
              </div>

              <button
                onClick={submitReviewForBooking}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-black shadow-lg cursor-pointer border border-purple-500 text-center"
              >
                إرسال التقييم للمجتمع
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Calling Sim Setup */}
      <AnimatePresence>
        {callingAgency && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-5 text-white text-right" dir="rtl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950 rounded-[28px] p-6 text-center w-full max-w-sm border border-zinc-800 shadow-2xl"
            >
              <div className="w-16 h-16 bg-purple-600 mx-auto rounded-full flex items-center justify-center animate-pulse mb-6 shadow-lg">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xs text-zinc-500 mb-1 font-semibold">يجري الاتصال برقم هاتف الوكيل...</h3>
              <h2 className="text-sm font-extrabold mb-4">{callingAgency.name}</h2>
              <div className="text-lg font-mono text-emerald-400 font-extrabold mb-8">{callingAgency.phone}</div>
              
              <p className="text-[10px] text-zinc-500 mb-6 font-semibold leading-relaxed">
                ملاحظة: هذا اتصال افتراضي ومحاكاة مدمجة داخل تطبيق Voya الجزائر لسهولة تواصل الأعضاء مع الوكالات المعتمدة.
              </p>

              <button
                onClick={() => setCallingAgency(null)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                إنهاء المكالمة والرجوع
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Selected Agency Details Profile View Sheet */}
      <AnimatePresence>
        {selectedAgency && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col text-white text-right font-sans" dir="rtl">
            
            {/* Top Toolbar Navigation */}
            <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-900 flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  setSelectedAgency(null);
                  setIsAddingReview(false);
                  setNewReviewComment("");
                  setNewReviewName("");
                }}
                className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center"
                title="رجوع"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>

              <span className="text-xs font-black text-zinc-300">الملف التعريفي للوكالة</span>

              <button
                onClick={() => {
                  alert(`تم نسخ رابط الملف التعريفي لوكالة "${selectedAgency.name}" للمشاركة!`);
                }}
                className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                title="مشاركة"
              >
                <Upload className="w-4 h-4 text-white" />
              </button>
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
                        <span className="text-[9.5px] font-black text-white block">مضيف متميز • Voya Partner</span>
                        <span className="text-[8px] text-zinc-400 font-semibold block leading-tight">الوكلاء الأعلى تقييماً والأكثر التزاماً وخبرة بكراء السيارات على المنصة</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical split facts block */}
                <div className="grid grid-cols-3 border border-zinc-850 rounded-[18px] bg-zinc-900/40 p-3 h-16 items-center text-center">
                  <div className="border-l border-zinc-850">
                    <span className="text-xs font-black text-zinc-100 block">{(selectedAgency.reviewsCount * 2) + 12}</span>
                    <span className="text-[9px] font-bold text-zinc-500 block mt-0.5">رحلات • Trips</span>
                  </div>
                  <div className="border-l border-zinc-850">
                    <span className="text-xs font-black text-[#5c61ec] flex items-center justify-center gap-0.5">
                      <span>{selectedAgency.rating.toFixed(1)}</span>
                      <Star className="w-3 h-3 fill-[#5c61ec] text-[#5c61ec]" />
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 block mt-0.5">التقييم • Rating</span>
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
                  <span className="text-[9.5px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-md font-extrabold font-mono">
                    {getAgencyCars(selectedAgency.id).length} سيارات متوفرة
                  </span>
                  <h3 className="text-xs font-black text-white">أسطول معروضات الوكالة</h3>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 justify-start py-0.5 select-none">
                  <div className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-305 flex items-center gap-1 hover:bg-zinc-850">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    <span>تأمين التوصيل للمطارات الجزائرية</span>
                  </div>
                </div>

                {/* Render cars inside search */}
                <div className="space-y-4">
                  {getAgencyCars(selectedAgency.id).length === 0 ? (
                    <div className="text-center py-10 bg-zinc-900/50 border border-zinc-850 rounded-2xl">
                      <p className="text-[10px] font-semibold text-zinc-500">لا توجد سيارات معروضة لهذه الوكالة حالياً.</p>
                    </div>
                  ) : (
                    getAgencyCars(selectedAgency.id).map(car => {
                      const isCarFav = favorites.includes(car.id);
                      const discountAmount = Math.round(car.pricePerDay * 0.12);
                      const crossedPrice = car.pricePerDay + discountAmount;

                      return (
                        <div 
                          key={`fleet_ag_${car.id}`}
                          className="bg-zinc-900 rounded-[20px] overflow-hidden border border-zinc-800 shadow-lg flex flex-col hover:border-zinc-750 transition-all text-right"
                        >
                          <div className="aspect-[16/10] w-full bg-zinc-950 relative overflow-hidden">
                            <img 
                              src={car.image} 
                              alt="" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Favorite Heart trigger */}
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
                              <span className="text-amber-400 flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {car.rating}
                              </span>
                              <span>({car.reviewsCount} رحلة)</span>
                            </div>

                            <p className="text-[9.5px] text-zinc-500 font-bold">
                              📍 التسليم بـ {car.city} (تتوفر إمكانية حجز التسليم الفوري والذكي)
                            </p>

                            <div className="border-t border-zinc-800 pt-2 flex justify-between items-center">
                              <span className="py-0.5 px-2 bg-emerald-950/40 border border-emerald-900/40 rounded-md text-[9px] font-bold text-emerald-400">
                                وفر {discountAmount.toLocaleString()} دج 🏷️
                              </span>

                              <div className="text-left font-mono">
                                <span className="text-xs font-black text-purple-400 font-mono">{car.pricePerDay.toLocaleString()} دج</span>
                                <span className="text-[8px] text-zinc-500 font-bold block">اليومية الكلية</span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                onSelectCar(car);
                                setSelectedAgency(null);
                              }}
                              className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-705 text-white rounded-xl text-[10px] font-black tracking-wide text-center active:scale-[0.98] transition-all cursor-pointer"
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
                <div className="bg-zinc-950 border border-zinc-850 rounded-[20px] p-4 text-right">
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

                        // Add notification
                        onAddNotification({
                          id: "agency_rev_not_" + Date.now(),
                          title: "تم استلام تقييمك للوكالة ⭐",
                          content: `لقد اضفت تقييم ${newReviewRating} نجوم لوكالة "${selectedAgency.name}" بنجاح.`,
                          type: "system",
                          date: "الآن",
                          read: false
                        });

                        setIsAddingReview(false);
                        setNewReviewComment("");
                        setNewReviewName("");
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label htmlFor="agency-new-rev-name" className="text-[9px] font-bold text-zinc-500 block mb-1">اسمك بالكامل (اختياري)</label>
                        <input 
                          id="agency-new-rev-name"
                          type="text"
                          placeholder="مثال: يونس الجزائري"
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none text-right"
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
                            <Star className={`w-6 h-6 ${num <= newReviewRating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
                          </button>
                        ))}
                      </div>

                      <div>
                        <label htmlFor="agency-new-rev-comment" className="text-[9px] font-bold text-zinc-500 block mb-1">تعليقك وتقييمك للخدمة والسيارات*</label>
                        <textarea 
                          id="agency-new-rev-comment"
                          rows={2}
                          required
                          placeholder="اكتب تعليقك هنا بصدق وصراحة..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-550 text-right"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-md"
                        >
                          نشر التقييم
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingReview(false);
                            setNewReviewComment("");
                          }}
                          className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-[10px] font-bold hover:text-white cursor-pointer"
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
                      className="bg-zinc-900 border border-zinc-850 rounded-[18px] p-3.5 space-y-2 text-right"
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
                            className={`w-3 h-3 ${starNum <= rev.rating ? "text-amber-400 fill-amber-400" : "text-zinc-800"}`} 
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
                className="py-3 bg-purple-650 hover:bg-purple-750 text-white rounded-full text-xs font-black shadow-lg flex items-center justify-center gap-1.5 cursor-pointer border border-purple-550 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                اتصل بالوكيل الهاتفي
              </button>

              <button
                onClick={() => {
                  alert("لتأجير سيارة، يرجى تصفح الأسطول أعلاه والضغط على زر الحجز المباشر للمركبة المختارة.");
                }}
                className="py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-805 transition-all"
              >
                📥 احجز رحلة الآن
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
