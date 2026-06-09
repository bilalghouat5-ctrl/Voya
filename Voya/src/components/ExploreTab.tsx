/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Car, Reservation, User, Notification, Agency } from "../types";
import { Search, SlidersHorizontal, MapPin, Calendar, Star, ShieldCheck, Fuel, UserPlus, Heart, X, Check, Wallet, ChevronLeft, ChevronRight, MessageSquare, Info, Plane, Sparkles, Crown, Zap, Building, Award, Compass, Globe, Navigation, Train, Bed, Wifi, CarFront, ArrowLeft, ArrowRight, Upload, Pencil, Users, Gauge, SquarePlus, ThumbsUp, CreditCard, Shield, Clock, Headset, LifeBuoy, CigaretteOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALGERIAN_CITIES, INITIAL_AGENCIES, INITIAL_REVIEWS } from "../data";

interface ExploreTabProps {
  cars: Car[];
  user: User;
  onUpdateUser: (updated: User) => void;
  onAddBooking: (booking: Reservation) => void;
  onAddNotification: (notif: Notification) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
  onShowLoginSignup?: () => void;
}

export default function ExploreTab({ cars, user, onUpdateUser, onAddBooking, onAddNotification, onSetHideBottomNav, onShowLoginSignup }: ExploreTabProps) {
  const [searchCity, setSearchCity] = useState<string>("الكل");
  const [searchBrand, setSearchBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedTransmission, setSelectedTransmission] = useState<string>("الكل");
  const [maxPrice, setMaxPrice] = useState<number>(40000);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Custom states for iOS Screenshot 1 & 2 search screens
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState<boolean>(false);
  const [tempSearchText, setTempSearchText] = useState<string>("");
  
  // Quick Pill Category state for matching Photo 1 filters (All, Airports, Nearby, Monthly)
  const [currentPill, setCurrentPill] = useState<string>("الكل");

  // Detail Modal & Booking Sheet States
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isPostLoading, setIsPostLoading] = useState<boolean>(false);
  const [modalScrollY, setModalScrollY] = useState<number>(0);
  const [pullY, setPullY] = useState<number>(0);
  const touchStartRef = React.useRef<number>(0);
  const isAtTopRef = React.useRef<boolean>(true);
  const isDraggingRef = React.useRef<boolean>(false);

  // DRAGGABLE BOTTOM SHEET STATES (Exquisite native-feel sliding gesture configurations)
  const [sheetY, setSheetY] = useState<number>(250);
  const [isDraggingSheet, setIsDraggingSheet] = useState<boolean>(false);
  const [innerScrollTop, setInnerScrollTop] = useState<number>(0);
  
  const sheetDragStartY = React.useRef<number>(0);
  const sheetStartOffset = React.useRef<number>(250);

  const handleSheetDragStart = (clientY: number) => {
    sheetDragStartY.current = clientY;
    sheetStartOffset.current = sheetY;
    setIsDraggingSheet(true);
  };

  const handleSheetDragMove = (clientY: number) => {
    if (!isDraggingSheet) return;
    
    const deltaY = clientY - sheetDragStartY.current;
    
    // If sheet is fully expanded and user is scrolling inside the content, do not drag sheet.
    if (sheetStartOffset.current === 56) {
      if (innerScrollTop > 0) {
        return;
      }
      if (deltaY < 0) {
        // Swiping up when fully expanded scrolls child content instead of dragging sheet
        return;
      }
    }
    
    let targetY = sheetStartOffset.current + deltaY;
    
    // Bounds of sheet movement: top is 56, bottom is 400
    if (targetY < 56) targetY = 56;
    if (targetY > 400) targetY = 400;
    
    setSheetY(targetY);
  };

  const handleSheetDragEnd = () => {
    if (!isDraggingSheet) return;
    setIsDraggingSheet(false);
    
    // Snap to either expanded (56) or collapsed (250) based on proximity
    if (sheetY < 150) {
      setSheetY(56);
    } else {
      setSheetY(250);
    }
  };

  const handlePullStart = (clientY: number, scrollTop: number) => {
    isAtTopRef.current = scrollTop <= 0;
    touchStartRef.current = clientY;
    isDraggingRef.current = true;
  };

  const handlePullMove = (clientY: number) => {
    if (!isAtTopRef.current || !isDraggingRef.current) return;
    const diff = clientY - touchStartRef.current;
    if (diff > 0) {
      // Clean tension mapping: 0.45 factor to simulate high elastic resistance
      const tension = Math.min(diff * 0.45, 120);
      setPullY(tension);
    } else {
      setPullY(0);
    }
  };

  const handlePullEnd = () => {
    isDraggingRef.current = false;
    setPullY(0);
  };

  const [showBookingSheet, setShowBookingSheet] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("2026-06-07");
  const [endDate, setEndDate] = useState<string>("2026-06-10");
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>("");

  // Favorites (persisted locally)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("turo_dz_favs");
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    if (onSetHideBottomNav) {
      onSetHideBottomNav(!!selectedCar);
    }
    if (!selectedCar) {
      setModalScrollY(0);
      setSheetY(250);
      setInnerScrollTop(0);
      setIsDraggingSheet(false);
      setIsPostLoading(false);
    } else {
      setSheetY(250);
      setInnerScrollTop(0);
      setIsPostLoading(true);
      const timer = setTimeout(() => {
        setIsPostLoading(false);
      }, 3500);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [selectedCar, onSetHideBottomNav]);

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

  // Filter cars based on city, brand search, transmission, maxPrice & quick category pills
  const filteredCars = cars.filter(car => {
    // City filter
    const matchCity = searchCity === "الكل" || car.city === searchCity;
    
    // Brand search filter
    const matchBrand = car.brand.toLowerCase().includes(searchBrand.toLowerCase()) || 
                       car.model.toLowerCase().includes(searchBrand.toLowerCase());
    
    // Category mapping
    let matchCategory = true;
    const activeCategory = selectedCategory !== "الكل" ? selectedCategory : currentPill;
    
    if (activeCategory !== "الكل") {
      if (activeCategory === "electric") {
        matchCategory = car.fuel === "electric";
      } else {
        matchCategory = car.category === activeCategory;
      }
    }

    const matchTransmission = selectedTransmission === "الكل" || car.transmission === selectedTransmission;
    const matchPrice = car.pricePerDay <= maxPrice;
    
    return matchCity && matchBrand && matchCategory && matchTransmission && matchPrice && car.isAvailable;
  });

  // Calculate booking details
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
  const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const priceBeforeFees = selectedCar ? selectedCar.pricePerDay * calculatedDays : 0;
  const platformFees = Math.round(priceBeforeFees * 0.05); // 5% Turo fee
  const finalTotalPrice = priceBeforeFees + platformFees;

  const formatTripDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const monthsAr = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      return `${daysAr[d.getDay()]}، ${d.getDate()} ${monthsAr[d.getMonth()]} الساعة 10:00`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatTripDateEN = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${daysEn[d.getDay()]}, ${d.getDate()} ${monthsEn[d.getMonth()]}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleCreateBooking = () => {
    if (!selectedCar) return;
    
    // Check if guest
    if (user.isGuest) {
      setBookingError("أنت تقوم بالتصفح حالياً بوضعية الزائر. يرجى تسجيل الدخول أو إنشاء حساب لإتمام الحجز بنجاح!");
      return;
    }
    
    // Check verification
    if (!user.isDriverVerified) {
      setBookingError("يرجى توثيق رخصة السياقة أولاً من صفحة الملف الشخصي قبل حجز سيارة.");
      return;
    }

    // Check balance
    if (user.walletBalance < finalTotalPrice) {
      setBookingError(`رصيدك غير كافٍ. تحتاج إلى ${finalTotalPrice.toLocaleString()} دج، بينما رصيدك الحالي هو ${user.walletBalance.toLocaleString()} دج. يمكنك شحن رصيدك من الملف الشخصي.`);
      return;
    }

    // Process payment and booking
    const newBalance = user.walletBalance - finalTotalPrice;
    onUpdateUser({
      ...user,
      walletBalance: newBalance
    });

    const bookingCode = "TR-" + Math.floor(100000 + Math.random() * 900000);
    const newReservation: Reservation = {
      id: "res_" + Date.now(),
      carId: selectedCar.id,
      carName: `${selectedCar.brand} ${selectedCar.model}`,
      carImage: selectedCar.image,
      pricePerDay: selectedCar.pricePerDay,
      startDate: startDate,
      endDate: endDate,
      totalDays: calculatedDays,
      totalPrice: finalTotalPrice,
      status: "confirmed",
      agencyId: selectedCar.agencyId,
      hostId: selectedCar.hostId,
      bookingCode: bookingCode,
      contractVerified: false
    };

    onAddBooking(newReservation);

    // Notification
    onAddNotification({
      id: "not_booking_" + Date.now(),
      title: "تم تأكيد الحجز بنجاح 🎉",
      content: `لقد حجزت ${selectedCar.brand} ${selectedCar.model} لمدة ${calculatedDays} أيام في ${selectedCar.city}. كود الحجز: ${bookingCode}`,
      type: "booking",
      date: "الآن",
      read: false
    });

    setBookingSuccess(true);
    setBookingError("");
    
    // Mark car unavailable
    selectedCar.isAvailable = false;

    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingSheet(false);
      setSelectedCar(null);
    }, 2500);
  };

  // Recent searches highlights (Tesla Y and BMW X7 specifically to match Photo 1 screenshots)
  const inspiredCars = cars.filter(c => c.id === "car_tesla_y" || c.id === "car_bmw_x7");

  // Categorized lists based on user options and the requested subdivisions
  const cityMatch = (c: Car) => searchCity === "الكل" || c.city === searchCity;
  
  const weddingCars = cars.filter(c => c.category === "wedding" && c.isAvailable && cityMatch(c));
  const suvCars = cars.filter(c => c.category === "suv" && c.isAvailable && cityMatch(c));
  const luxuryCars = cars.filter(c => c.category === "luxury" && c.isAvailable && cityMatch(c));
  const vanCars = cars.filter(c => c.category === "van" && c.isAvailable && cityMatch(c));
  const electricCars = cars.filter(c => c.fuel === "electric" && c.isAvailable && cityMatch(c));
  const allAvailableCars = cars.filter(c => c.isAvailable && cityMatch(c));
  
  const isFilteringActive = searchBrand !== "" || selectedCategory !== "الكل" || selectedTransmission !== "الكل";

  const renderCarCard = (car: Car) => {
    return (
      <div
        key={car.id}
        onClick={() => setSelectedCar(car)}
        className="w-[245px] shrink-0 bg-[#0c0c0e] border border-zinc-900 rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.985] hover:border-zinc-800 transition-all shadow-xl flex flex-col relative group"
        dir="rtl"
      >
        {/* Rounded image block */}
        <div className="relative h-34 w-full bg-zinc-950 overflow-hidden">
          <img 
            src={car.image} 
            alt={`${car.brand} ${car.model}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-emerald-400 border border-zinc-800/40">
            {car.year}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(car.id);
            }}
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center shadow hover:bg-black/85 transition-colors cursor-pointer"
            title="مفضلة"
          >
            <Heart className={`w-4 h-4 transition-colors ${favorites.includes(car.id) ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'}`} />
          </button>

          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-zinc-300 px-2 py-0.5 rounded-[5px] text-[8.5px] font-extrabold">
            <MapPin className="w-2.5 h-2.5 text-rose-500" />
            <span>{car.city}</span>
          </div>
        </div>

        {/* Info elements underneath image mimicking the requested layout */}
        <div className="p-3 text-right flex-grow flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-[12.5px] font-black text-white truncate leading-tight">{car.brand} {car.model}</h4>
            
            {/* Rating plus details line */}
            <div className="flex items-center justify-start gap-1 text-[10px] text-zinc-400 font-bold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 font-black">{car.rating}</span>
              <span className="text-zinc-550">({car.reviewsCount} رحلة)</span>
              <span className="text-zinc-700 mx-0.5">•</span>
              <span className="text-zinc-450">{car.transmission === 'automatic' ? 'تلقائي' : 'يدوي'}</span>
            </div>

            {/* Custom high fidelity "Ships/Chips" matching exact screenshots request */}
            <div className="flex gap-1.5 flex-wrap pt-1.5 pb-0.5">
              <span className="bg-purple-950/40 border border-purple-900/60 text-purple-300 text-[8px] font-extrabold px-2 py-0.5 rounded-[5px] flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5 text-purple-400" /> مضيف متميز
              </span>
              <span className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-[8px] font-extrabold px-2 py-0.5 rounded-[5px] flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-emerald-400" /> حجز فوري
              </span>
            </div>
          </div>

          <div className="mt-3 text-right border-t border-zinc-900/80 pt-2 flex justify-between items-baseline">
            <div className="text-[9px] text-zinc-500 font-bold tracking-tight">
              إجمالي {calculatedDays} أيام: <span className="font-mono text-zinc-450">{(car.pricePerDay * calculatedDays).toLocaleString()} دج</span>
            </div>
            
            <div className="text-[12.5px] font-black text-[#5c61ec] leading-none">
              {car.pricePerDay.toLocaleString()} دج<span className="text-[9px] text-zinc-500 font-normal">/يوم</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGridCarCard = (carData: Car) => {
    return (
      <div 
        key={carData.id}
        onClick={() => setSelectedCar(carData)}
        className="bg-transparent overflow-hidden flex flex-col cursor-pointer group text-right"
        dir="rtl"
      >
        <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden bg-zinc-950 border border-zinc-900/60">
          <img 
            src={carData.image} 
            alt={`${carData.brand} ${carData.model}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(carData.id);
            }}
            className="absolute top-2.5 left-2.5 text-white bg-black/40 backdrop-blur-md p-1.5 rounded-full hover:bg-black/60 active:scale-95 transition-all"
          >
            <Heart className={`w-3.5 h-3.5 ${favorites.includes(carData.id) ? "fill-rose-500 text-rose-500" : "text-white"}`} />
          </button>
        </div>

        <div className="pt-2 font-sans text-right">
          <h4 className="text-[11.5px] font-black text-white group-hover:text-[#5c61ec] transition-colors leading-tight truncate">{carData.brand} {carData.model}</h4>
          <div className="flex items-center gap-1 mt-1 leading-none justify-start">
            <span className="text-[9.5px] font-bold text-zinc-500">{carData.year} • {carData.rating.toFixed(1)}</span>
            <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
            <span className="text-[9.5px] font-bold text-zinc-500">({carData.reviewsCount})</span>
          </div>

          <div className="mt-2.5 leading-none">
            <div className="flex items-baseline gap-1 justify-start">
              <span className="text-xs font-black text-white">{carData.pricePerDay.toLocaleString()} دج</span>
              <span className="text-[9.5px] font-bold text-zinc-550">/ اليوم</span>
            </div>
            <span className="text-[9.5px] font-bold text-zinc-550 mt-1 block">إجمالي {calculatedDays} أيام: {(carData.pricePerDay * calculatedDays).toLocaleString()} دج</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAgencyCard = (agency: Agency) => {
    return (
      <div
        key={agency.id}
        onClick={() => {
          setSearchBrand(agency.name.split(" ")[0]);
          onAddNotification({
            id: "notif_agency_filter_" + Date.now(),
            title: `تمت تصفية أسطول ${agency.name} 🏢`,
            content: `تتصفح الآن المركبات المعتمدة المتوفرة حالياً لدى الوكالة في ولاية ${agency.city}.`,
            type: "system",
            date: "الآن",
            read: false
          });
        }}
        className="w-[210px] shrink-0 bg-[#0d0d11]/80 border border-zinc-900 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.99] hover:border-zinc-800 transition-all shadow-lg flex flex-col relative group"
      >
        <div className="relative h-16 bg-zinc-950 shrink-0">
          <img 
            src={agency.banner} 
            alt="" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
          
          {agency.verified && (
            <div className="absolute top-2 right-2 bg-emerald-950/85 backdrop-blur-md border border-emerald-800/40 px-1.5 py-0.5 rounded-md text-[8px] font-black text-emerald-400 flex items-center gap-0.5 shadow-sm">
              <ShieldCheck className="w-2.5 h-2.5 stroke-[3]" /> موثقة
            </div>
          )}
        </div>

        <div className="absolute top-8 left-4 w-9 h-9 rounded-full border-2 border-zinc-900 bg-zinc-900 overflow-hidden shadow-md">
          <img src={agency.logo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>

        <div className="p-3.5 text-right flex-1 flex flex-col justify-between pt-5">
          <div>
            <h4 className="text-[11.5px] font-black text-white group-hover:text-purple-400 transition-colors truncate">{agency.name}</h4>
            
            <p className="text-[9.5px] text-zinc-500 font-bold mt-1 flex items-center justify-end gap-1">
              <span>{agency.city}</span>
              <MapPin className="w-2.5 h-2.5 text-rose-500" />
            </p>
          </div>

          <div className="mt-3.5 pt-2 border-t border-zinc-900 flex justify-between items-center text-[9px] font-bold">
            <span className="text-purple-400 bg-purple-950/40 border border-purple-900/10 px-1.5 py-0.5 rounded-md">{agency.carsCount} سيارة متوفرة</span>
            
            <div className="flex items-center gap-0.5 text-amber-400">
              <span className="font-mono">{agency.rating}</span>
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="explore-tab-view" className={`flex flex-col h-full bg-black text-white ${selectedCar ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'} pb-24 select-none relative`}>
      
      {/* Search Header Container (Pure Luxurious Dark) */}
      <div id="explore-hero-header" className="px-4 pt-3.5 pb-3 shrink-0 bg-black/95 backdrop-blur-md sticky top-0 z-20">
        
        {/* Turo Precise Premium Search Panel - Redesigned to match Screenshot 3 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {/* High-fidelity pill search container from Screenshot 3 */}
            <div 
              onClick={() => {
                setIsSearchOverlayOpen(true);
                setTempSearchText("");
              }}
              className="flex-1 flex items-center justify-between text-right pl-1.5 pr-4 py-2 bg-[#121214] border border-zinc-900 rounded-[18px] h-[52px] shadow-lg shadow-black/40 cursor-pointer hover:border-zinc-850 transition-all duration-300"
            >
              <span className="text-[#a1a1aa] text-xs font-bold font-sans">
                ابحث في أي مكان...
              </span>
              <div className="w-[38px] h-[38px] rounded-[14px] bg-[#5c61ec] border border-[#7276f0]/30 hover:bg-[#4b50d3] active:scale-95 transition-all text-white flex items-center justify-center shadow-md">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Categories Horizontal Navigation Bar */}
          <div id="turo-category-pills" className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none scroll-smooth">
            {[
              { id: "الكل", label: "الكل", icon: CarFront },
              { id: "Airports", label: "المطارات", icon: Plane },
              { id: "Monthly", label: "الكراء الشهري", icon: Calendar },
              { id: "Nearby", label: "قريب مني", icon: MapPin }
            ].map((pill) => {
              const isSelected = currentPill === pill.id;
              const IconComponent = pill.icon;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setCurrentPill(pill.id);
                    if (pill.id === "الكل") {
                      setSelectedCategory("الكل");
                      setSearchCity("الكل");
                      setSearchBrand("");
                    } else if (pill.id === "Airports") {
                      setSelectedCategory("luxury");
                      setSearchCity("الكل");
                      onAddNotification({
                        id: "not_airports_pills_" + Date.now(),
                        title: "خيارات النقل والمطارات المتاحة ✈️",
                        content: "تتصفح الآن فئة التوصيل للمطارات والرحلات الطويلة.",
                        type: "system",
                        date: "الآن",
                        read: false
                      });
                    } else if (pill.id === "Monthly") {
                      setSelectedCategory("van");
                      onAddNotification({
                        id: "not_monthly_pills_" + Date.now(),
                        title: "العروض الشهرية الطويلة 📅",
                        content: "تتصفح فئات الإيجار طويل المدى وبأسعار مفضلة للالتزام الشهري.",
                        type: "system",
                        date: "الآن",
                        read: false
                      });
                    } else if (pill.id === "Nearby") {
                      setSelectedCategory("الكل");
                      setSearchCity("الجزائر");
                      onAddNotification({
                        id: "not_nearby_pills_" + Date.now(),
                        title: "السيارات القريبة منك 📍",
                        content: "تتصفح حالياً السيارات المتواجدة بالقرب من موقعك الجغرافي.",
                        type: "system",
                        date: "الآن",
                        read: false
                      });
                    }
                  }}
                  className={`px-3.5 py-2 rounded-[12px] text-xs font-bold whitespace-nowrap transition-all duration-200 border flex items-center justify-center gap-1.5 h-9 ${
                    isSelected 
                      ? "bg-white border-white text-black font-extrabold shadow-md active:scale-95" 
                      : "bg-[#121214] border-zinc-900/60 text-zinc-300 hover:bg-[#1a1a1f]"
                  }`}
                  dir="rtl"
                >
                  <IconComponent className="w-3.5 h-3.5 text-current shrink-0" />
                  <span className="font-sans leading-none">{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Filters Drawer (Premium Animating Block) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            id="filters-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-950 px-4 py-3.5 border-b border-zinc-900 flex flex-col gap-4 overflow-hidden shadow-inner shrink-0"
          >
            {/* الولاية filter */}
            <div>
              <span className="text-[10px] font-bold text-zinc-400 block mb-1.5">الولاية المحددة للبحث</span>
              <div className="relative">
                <select 
                  id="city-search"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full text-xs font-bold bg-zinc-900 border border-zinc-805 text-zinc-300 rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="الكل">كل ولايات الجزائر</option>
                  {ALGERIAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <span className="text-[10px] font-bold text-zinc-400 block mb-1.5">فئة السيارة المفضلة</span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {["الكل", "wedding", "suv", "luxury", "van", "electric"].map((cat) => {
                  let arabicLabel = "الكل";
                  if (cat === "wedding") arabicLabel = "سيارات الزفاف";
                  if (cat === "suv") arabicLabel = "دفع رباعي 4X4";
                  if (cat === "luxury") arabicLabel = "السيارات الفاخرة";
                  if (cat === "van") arabicLabel = "سيارات الفان";
                  if (cat === "electric") arabicLabel = "السيارات الكهربائية";

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPill("الكل");
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors border ${
                        selectedCategory === cat 
                          ? 'bg-purple-600 border-purple-500 text-white' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {arabicLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transmission selection & Price slider in one row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 block mb-1.5">ناقل الحركة</span>
                <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  {["الكل", "automatic", "manual"].map((trans) => {
                    let label = "الكل";
                    if (trans === "automatic") label = "أوتو";
                    if (trans === "manual") label = "عادي";
                    const isSel = selectedTransmission === trans;
                    return (
                      <button
                        key={trans}
                        type="button"
                        onClick={() => setSelectedTransmission(trans)}
                        className={`flex-1 text-center py-1 text-xs font-bold rounded-lg transition-all ${
                          isSel ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-zinc-400 font-sans">السعر الأقصى: {maxPrice.toLocaleString()} دج</span>
                </div>
                <input 
                  type="range"
                  min={5000}
                  max={80000}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body view */}
      <div className="px-4 mt-5 flex-1">
        
        {/* 1. CONTINUE SEARCHING WIDGET (Matching Photo 1 precisely) */}
        {searchCity !== "باتنة" && !isFilteringActive && (
          <div 
            id="continue-search-card"
            onClick={() => {
              setSearchCity("باتنة");
              onAddNotification({
                id: "not_city_switch_" + Date.now(),
                title: "تم تحديد وجهتك لولاية باتنة 🗺️",
                content: "جارٍ تصفية سيارات الـ SUV الفارهة وسيارات تسلا/BMW القريبة منك في باتنة الأوراس.",
                type: "system",
                date: "الآن",
                read: false
              });
            }}
            className="mb-6 bg-zinc-905 border border-zinc-900 rounded-3xl p-4 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all hover:bg-zinc-900 group"
          >
            <div className="flex items-center gap-3.5">
              
              {/* Glowing Purple Search circle */}
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-10 w-10 rounded-full bg-purple-500/25 animate-ping opacity-75" />
                <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-700/60 flex items-center justify-center text-purple-400 font-extrabold shadow-inner relative z-10">
                  <Search className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              {/* Text metadata */}
              <div className="text-right">
                <h3 className="text-xs font-black text-white group-hover:text-purple-400 transition-colors">مواصلة البحث عن سيارات</h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-1">ولاية باتنة، 05، الجزائر • باتنة، الجزائر</p>
              </div>
            </div>

            <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:translate-x-[-2px] transition-transform" />
          </div>
        )}



        {/* Active search or active filter result listing */}
        {isFilteringActive ? (
          <div>
            <div className="flex justify-between items-center mb-4" dir="rtl">
              <h2 className="text-xs font-extrabold text-zinc-400 tracking-tight">نتائج البحث المصفاة ({filteredCars.length})</h2>
              <button 
                onClick={() => {
                  setSearchCity("الكل");
                  setSearchBrand("");
                  setSelectedCategory("الكل");
                  setSelectedTransmission("الكل");
                  setMaxPrice(40000);
                  setCurrentPill("الكل");
                }}
                className="text-[10px] text-purple-400 hover:underline font-bold"
              >
                إعادة تعيين الكل 🔄
              </button>
            </div>

            {filteredCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900 rounded-3xl p-5 border border-zinc-800" dir="rtl">
                <div className="p-3 bg-zinc-800 text-zinc-400 rounded-full mb-3">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-zinc-300">عذراً، لم نجد سيارات متوفرة للفلترة المحددة</p>
                <p className="text-[10px] text-zinc-500 mt-1 leading-normal">يرجى تغيير خيارات البحث أو إعادة تصفية الأسعار والمدن الجزائري.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4" dir="rtl">
                {filteredCars.map((car) => (
                  <motion.div
                    key={car.id}
                    layoutId={`car-card-${car.id}`}
                    onClick={() => setSelectedCar(car)}
                    className="bg-[#0c0c0e] rounded-[24px] border border-zinc-900 overflow-hidden cursor-pointer group active:scale-[0.99] transition-all relative hover:border-zinc-800 shadow-xl"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
                      <img 
                        src={car.image} 
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Category & Year Tags */}
                      <div className="absolute top-3 right-3 flex gap-1 items-center">
                        <span className="bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-0.5 rounded-[6px] border border-zinc-800/40">
                          {car.year}
                        </span>
                        <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-[6px] ${
                          car.category === 'luxury' || car.category === 'wedding' ? 'bg-amber-500 text-black' : 'bg-[#5c61ec] text-white'
                        }`}>
                          {car.category === 'luxury' ? 'فاخرة ♦️' : car.category === 'wedding' ? 'زفاف 👑' : car.category === 'suv' ? 'SUV 4x4' : car.category === 'van' ? 'فان عائلي 🚐' : 'اقتصادية'}
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(car.id);
                        }}
                        className="absolute top-3 left-3 w-8.5 h-8.5 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-zinc-300 shadow cursor-pointer hover:bg-black/80"
                        title="حفظ في المفضلة"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${favorites.includes(car.id) ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'}`} />
                      </button>

                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-[6px] text-[9px] font-black">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{car.city}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 text-right">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-black text-sm text-white uppercase tracking-tight">{car.brand} {car.model}</h3>
                          <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5 font-bold">
                            <span>• {car.transmission === 'automatic' ? 'تلقائي (أتوماتيك)' : 'يدوي هجين'}</span>
                            <span>• {car.fuel === 'diesel' ? 'ديزل (مازوت)' : car.fuel === 'electric' ? 'كهربائية' : 'بنزين'}</span>
                          </p>
                        </div>
                        <div className="text-left flex flex-col">
                          <span className="text-sm font-black text-[#5c61ec]">{car.pricePerDay.toLocaleString()} دج</span>
                          <span className="text-[9px] text-zinc-500 font-bold block">/ اليوم</span>
                        </div>
                      </div>

                      {/* Chips / Badges Row (as requested) */}
                      <div className="flex gap-1.5 flex-wrap pt-3">
                        <span className="bg-purple-950/40 border border-purple-900/60 text-purple-300 text-[8.5px] font-extrabold px-2.5 py-1 rounded-[6px] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-purple-400" /> مضيف متميز Voya
                        </span>
                        <span className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-[8.5px] font-extrabold px-2.5 py-1 rounded-[6px] flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" /> حجز فوري مؤكد
                        </span>
                        <span className="bg-[#121214] border border-zinc-800 text-zinc-300 text-[8.5px] font-extrabold px-2.5 py-1 rounded-[6px] flex items-center gap-0.5">
                          تأمين شامل 🛡️
                        </span>
                      </div>

                      <hr className="my-3.5 border-zinc-900" />

                      {/* Rating + Agency details */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 text-amber-400 font-black">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span className="text-[10.5px]">{car.rating}</span>
                          </div>
                          <span className="text-[9.5px] text-zinc-500 font-bold">({car.reviewsCount} رحلة ناجحة)</span>
                        </div>

                        <span className="text-[9px] text-[#5c61ec] font-black bg-purple-950/20 border border-purple-900/30 px-2.5 py-1 rounded-lg max-w-[155px] truncate text-center">
                          {car.agencyName || car.hostName}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Landing Discover Sections with the beautiful requested divisions */
          <div className="space-y-7">
            
            {/* 1. Inspired by your recent searches */}
            {currentPill === "الكل" && (
              <div className="space-y-3 text-right">
                <h3 className="text-sm font-black text-white font-sans tracking-wide">ملهم من عمليات بحثك الأخيرة</h3>
                
                {/* Horizontal scroll of recent search recommendations */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                  <div 
                    onClick={() => {
                      const tesla = cars.find(c => c.brand.includes("تسلا") || c.model.includes("Model Y")) || cars[1];
                      setSelectedCar(tesla);
                    }}
                    className="w-[280px] shrink-0 bg-[#121214] border border-zinc-900 rounded-[18px] overflow-hidden flex h-28 cursor-pointer hover:border-zinc-800 transition-colors duration-200 group"
                  >
                    <div className="w-[45%] h-full bg-zinc-950 overflow-hidden relative">
                      <img 
                        src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="w-[55%] p-4 flex flex-col justify-center text-right font-sans">
                      <span className="text-[11.5px] font-black text-white group-hover:text-[#5c61ec] transition-colors leading-none tracking-wide">تسلا موديل واي (Tesla Y)</span>
                      <div className="flex items-center gap-1 mt-2.5 justify-start">
                        <span className="text-[10px] font-bold text-[#5c61ec] leading-none">2026 • 5.0</span>
                        <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
                        <span className="text-[10px] font-bold text-zinc-500 leading-none">(27)</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      const golf = cars.find(c => c.brand.includes("فولكس") || c.model.includes("Golf")) || cars[4];
                      setSelectedCar(golf);
                    }}
                    className="w-[280px] shrink-0 bg-[#121214] border border-zinc-900 rounded-[18px] overflow-hidden flex h-28 cursor-pointer hover:border-zinc-800 transition-colors duration-200 group"
                  >
                    <div className="w-[45%] h-full bg-zinc-950 overflow-hidden relative">
                      <img 
                        src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="w-[55%] p-4 flex flex-col justify-center text-right font-sans">
                      <span className="text-[11.5px] font-black text-white group-hover:text-[#5c61ec] transition-colors leading-none tracking-wide">غولف 8 أر لاين (Golf 8 R-Line)</span>
                      <div className="flex items-center gap-1 mt-2.5 justify-start">
                        <span className="text-[10px] font-bold text-[#5c61ec] leading-none">2026 • 5.0</span>
                        <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
                        <span className="text-[10px] font-bold text-zinc-500 leading-none">(44)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Newer car rental in Algiers */}
            {currentPill === "الكل" && (
              <div className="space-y-3.5">
                <div className="text-right font-sans" dir="rtl">
                  <h3 className="text-sm font-black text-white tracking-wide">أحدث سيارات الكراء في الجزائر العاصمة</h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">متوسط الأسعار اليومية لرحلة مدتها 7 أيام</p>
                </div>

                {/* Horizontal Swipe/Scroll List for Algeria Car Rental */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-1" dir="rtl">
                  {[
                    {
                      id: "bmw_x7",
                      title: "بي ام دبليو X7",
                      year: "2026",
                      rating: "5.0",
                      reviews: "(17)",
                      price: "28,000 دج",
                      total: "196,000 دج",
                      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600",
                      carIndex: 0
                    },
                    {
                      id: "chev_tahoe",
                      title: "شيفروليه تاهو",
                      year: "2026",
                      rating: "5.0",
                      reviews: "(5)",
                      price: "11,000 دج",
                      total: "77,000 دج",
                      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
                      carIndex: 2
                    }
                  ].map((item) => {
                    const carData = cars[item.carIndex] || cars[0];
                    return (
                      <div 
                        key={item.id}
                        className="w-[185px] shrink-0"
                      >
                        <div 
                          onClick={() => setSelectedCar(carData)}
                          className="bg-transparent overflow-hidden flex flex-col cursor-pointer group text-right"
                        >
                          <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden bg-zinc-950 border border-zinc-900/60">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(carData.id);
                              }}
                              className="absolute top-2.5 left-2.5 text-white bg-black/40 backdrop-blur-md p-1.5 rounded-full hover:bg-black/60 active:scale-95 transition-all"
                            >
                              <Heart className={`w-3.5 h-3.5 ${favorites.includes(carData.id) ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                            </button>
                          </div>

                          <div className="pt-2 font-sans text-right">
                            <h4 className="text-[11px] font-black text-white group-hover:text-[#5c61ec] transition-colors leading-none tracking-wide">{item.title}</h4>
                            <div className="flex items-center gap-1 mt-1.5 leading-none justify-start">
                              <span className="text-[9.5px] font-bold text-zinc-500">{item.year} • {item.rating}</span>
                              <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
                              <span className="text-[9.5px] font-bold text-zinc-500">{item.reviews}</span>
                            </div>

                            <div className="mt-2.5 leading-none">
                              <div className="flex items-baseline gap-1 justify-start">
                                <span className="text-xs font-black text-white">{item.price}</span>
                                <span className="text-[9.5px] font-bold text-zinc-500">/ اليوم</span>
                              </div>
                              <span className="text-[9.5px] font-bold text-zinc-550 mt-1 block">إجمالي 7 أيام: {item.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. أفخم السيارات جاهزة للكراء */}
            {currentPill === "الكل" && luxuryCars.length > 0 && (
              <div className="space-y-3.5 px-1">
                <div className="text-right font-sans" dir="rtl">
                  <h3 className="text-sm font-black text-white tracking-wide">أفخم السيارات جاهزة للكراء</h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">مجموعة حصرية من أحدث السيارات الفاخرة والرياضية لتجربة استثنائية</p>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                  {luxuryCars.map((car) => (
                    <div key={car.id} className="w-[185px] shrink-0">
                      {renderGridCarCard(car)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. سيارات الزفاف */}
            {currentPill === "الكل" && weddingCars.length > 0 && (
              <div className="space-y-3.5 px-1">
                <div className="text-right font-sans" dir="rtl">
                  <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-1.5 justify-start">
                    سيارات الزفاف
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">اجعل ليلة عمرك ذكرى لا تُنسى بأفخم مواكب وأعراس بأسلوب راقٍ</p>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                  {weddingCars.map((car) => (
                    <div key={car.id} className="w-[185px] shrink-0">
                      {renderGridCarCard(car)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. سيارات رباعية الدفع 4X4 */}
            {currentPill === "الكل" && suvCars.length > 0 && (
              <div className="space-y-3.5 px-1">
                <div className="text-right font-sans" dir="rtl">
                  <h3 className="text-sm font-black text-white tracking-wide">سيارات رباعية الدفع 4X4</h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">قوة جبارة في المدينة ومستعدة لكافة المغامرات الجبلية والاستكشافات</p>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                  {suvCars.map((car) => (
                    <div key={car.id} className="w-[185px] shrink-0">
                      {renderGridCarCard(car)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. سيارات الفان جاهزة للتخييم */}
            {currentPill === "الكل" && vanCars.length > 0 && (
              <div className="space-y-3.5 px-1">
                <div className="text-right font-sans" dir="rtl">
                  <h3 className="text-sm font-black text-white tracking-wide">سيارات الفان جاهزة للتخييم</h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">عش متعة الترحال البري الطبيعي والاستيقاظ ببهجة في سيارات فان مجهزة بالكامل</p>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                  {vanCars.map((car) => (
                    <div key={car.id} className="w-[185px] shrink-0">
                      {renderGridCarCard(car)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Airports category selection rendering */}
            {currentPill === "Airports" && (
              <div className="space-y-4" dir="rtl">
                <div className="flex justify-between items-center text-right font-sans">
                  <div>
                    <h3 className="text-xs font-black text-white tracking-wide uppercase">التوصيل للمطارات الجزائريّة</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">توصيل متميز ومباشر إلى مطار هواري بومدين، قسنطينة أو وهران</p>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                  {luxuryCars.map((car) => (
                    <div key={car.id} className="w-[185px] shrink-0">
                      {renderGridCarCard(car)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly category selection rendering */}
            {currentPill === "Monthly" && (
              <div className="space-y-4" dir="rtl">
                <div className="flex justify-between items-center text-right font-sans">
                  <div>
                    <h3 className="text-xs font-black text-white tracking-wide uppercase">إيجارات شهريّة واشتراكات</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">خصومات كبيرة وهائلة على إيجار السيارات لعدة أسابيع متتالية</p>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                  {vanCars.map((car) => (
                    <div key={car.id} className="w-[185px] shrink-0">
                      {renderGridCarCard(car)}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Renders Selected Car Detail Modal */}
      <AnimatePresence>
        {selectedCar && (
          <div id="car-details-overlay" className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col justify-start items-center">
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.2 }}
              className="bg-[#000000] w-full max-w-md h-full flex flex-col shadow-2xl relative text-right font-sans"
            >
              {/* Dynamic Sticky Collapsing Header Bar with Integrated Dark Action Bar */}
              <div
                className="absolute top-0 inset-x-0 z-40 px-4 py-4 flex justify-between items-center bg-transparent"
                dir="rtl"
              >
                {/* Back button (Right side in RTL, circular Glassmorphism style) */}
                <button
                  onClick={() => {
                    setSelectedCar(null);
                    setModalScrollY(0);
                  }}
                  className="w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex items-center justify-center text-white hover:bg-white/[0.18] hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer pointer-events-auto"
                  title="الرجوع"
                >
                  <ArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
                </button>

                {/* Glassmorphism Action Bar (Left side in RTL, pill shape with glassmorphism styling) */}
                <div className="bg-white/[0.08] backdrop-blur-[12px] border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-full h-11 px-5 flex items-center gap-6.5 select-none pointer-events-auto shrink-0 animate-fade-in animate-duration-300">
                  {/* Share/Upload button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("تم نسخ رابط المركبة بنجاح!");
                    }}
                    className="flex items-center justify-center text-white hover:text-zinc-200 active:scale-90 transition-all duration-200 cursor-pointer"
                    title="مشاركة"
                  >
                    <Upload className="w-5 h-5 text-white stroke-[2.2]" />
                  </button>

                  {/* Favorite / Love button */}
                  <button
                    onClick={() => toggleFavorite(selectedCar.id)}
                    className="flex items-center justify-center text-white active:scale-90 transition-all duration-200 cursor-pointer"
                    title="المفضلة"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors duration-200 ${
                        favorites.includes(selectedCar.id) 
                          ? "fill-rose-500 text-rose-500" 
                          : "text-white stroke-[2.2] hover:text-zinc-200"
                      }`} 
                    />
                  </button>
                </div>
              </div>

              {isPostLoading ? (
                <div className="flex-1 overflow-y-auto no-scrollbar pb-28 bg-[#000000] text-right relative" dir="rtl">
                  {/* Shimmering Image Banner skeleton container */}
                  <div className="relative h-64 w-full bg-neutral-950 shrink-0 shimmer-bg flex items-center justify-center">
                    {/* Floating brand spinner container */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                      <div className="spinner"></div>
                      <span className="text-[12px] text-zinc-300 font-extrabold mt-5 tracking-wide animate-pulse">
                        جاري تحميل تفاصيل السيارة...
                      </span>
                    </div>
                  </div>

                  {/* Shimmering Elements matching the exact positions of original content */}
                  <div className="px-5 py-6 space-y-6">
                    {/* Brand name & Rating skeleton lines */}
                    <div className="space-y-2">
                      <div className="h-7 w-52 rounded-lg shimmer-bg"></div>
                      <div className="h-4 w-36 rounded shimmer-bg"></div>
                    </div>

                    {/* All-star badging skeleton line */}
                    <div className="h-7 w-32 rounded-lg shimmer-bg opacity-90"></div>

                    {/* Features Quad Segment Grid with shimmer blocks */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                      <div className="h-10 rounded-xl shimmer-bg opacity-70"></div>
                      <div className="h-10 rounded-xl shimmer-bg opacity-70"></div>
                      <div className="h-10 rounded-xl shimmer-bg opacity-70"></div>
                      <div className="h-10 rounded-xl shimmer-bg opacity-70"></div>
                    </div>

                    {/* Distance specifications details lines */}
                    <div className="border-t border-zinc-950 pt-5 mt-1 space-y-3">
                      <div className="flex gap-3 justify-start items-center">
                        <div className="w-5 h-5 rounded-full shimmer-bg shrink-0"></div>
                        <div className="h-4 w-2/3 rounded shimmer-bg"></div>
                      </div>
                      <div className="flex gap-3 justify-start items-center">
                        <div className="w-5 h-5 rounded-full shimmer-bg shrink-0"></div>
                        <div className="h-4 w-1/2 rounded shimmer-bg"></div>
                      </div>
                    </div>

                    {/* Host identity profile block skeleton placeholder */}
                    <div className="border-t border-zinc-950 pt-5 flex gap-4 justify-start items-center">
                      <div className="w-11 h-11 rounded-full shimmer-bg shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-40 rounded shimmer-bg"></div>
                        <div className="h-3.5 w-28 rounded shimmer-bg"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom booking actions skeleton bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-[#070708] border-t border-zinc-900 px-5 py-4 flex items-center justify-between z-30">
                    <div className="space-y-1.5 text-right w-1/3">
                      <div className="h-4.5 w-20 rounded shimmer-bg"></div>
                      <div className="h-3 w-16 rounded shimmer-bg"></div>
                    </div>
                    <div className="h-11 w-44 rounded-xl shimmer-bg"></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main container holding stationary background image and natural overlay scrolling list */}
                  <div className="flex-1 w-full bg-[#000000] relative overflow-hidden" dir="rtl">
                    
                    {/* Background stationary Image Banner (Completely fixed/stationary, not moving or scaling) */}
                    <div 
                      className="absolute top-0 inset-x-0 bg-neutral-950 overflow-hidden"
                      style={{
                        height: "260px",
                      }}
                    >
                      <img 
                        src={selectedCar.image} 
                        alt={`${selectedCar.brand} ${selectedCar.model}`} 
                        className="w-full h-[260px] object-cover select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      {/* Visual gradient to blend white texts */}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />
                      
                      {/* Overlaid Image Counter on bottom-right of the fixed background */}
                      <div className="absolute bottom-5 right-5 bg-black/75 backdrop-blur-[12px] px-2.5 py-1 rounded-md text-[9px] font-extrabold text-[#f4f4f5] font-mono tracking-wider border border-white/10 select-none z-10 shadow-lg">
                        1 من 12
                      </div>
                    </div>

                    {/* UNIFIED SCROLLING CONTAINER (Overlay scroll: content naturally slides over top background image) */}
                    <div 
                      onScroll={(e) => {
                        setModalScrollY(e.currentTarget.scrollTop);
                      }}
                      className="absolute inset-0 overflow-y-auto no-scrollbar pt-14 z-10"
                      dir="rtl"
                    >
                      {/* Transparent Spacer enabling the background image to show through */}
                      <div className="h-[210px] w-full bg-transparent flex items-end justify-between px-5 pb-3 pointer-events-none relative" />

                      {/* Smooth black card overlay containing specifications, layouts and host details */}
                      <div className="bg-[#000000] rounded-t-[32px] border-t border-zinc-900/60 pb-36 px-5 pt-8 space-y-6 text-right relative z-20 shadow-[0_-12px_44px_rgba(0,0,0,0.95)]">
                  
                        {/* Brand & Model Name Header */}
                        <div className="space-y-1 text-right">
                          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
                            {selectedCar.brand} {selectedCar.model}
                          </h1>
                          <p className="text-[14.5px] text-zinc-400 mt-1 flex items-center gap-1.5 justify-start">
                            <span>{selectedCar.year} {selectedCar.trim || "Willys"}</span>
                            <span className="text-zinc-650">•</span>
                            <span className="text-[#a1a5fa] flex items-center gap-0.5 font-bold">
                              {selectedCar.rating.toFixed(2).replace('.', ',')}
                              <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec] shrink-0" />
                            </span>
                            <span className="text-zinc-400">({selectedCar.reviewsCount} رحلة)</span>
                          </p>
                        </div>

                        {/* All-Star Host badge bar */}
                        <div className="flex items-center gap-2 text-right justify-start text-zinc-300" id="all-star-host-badge">
                          <Award className="w-4.5 h-4.5 text-[#5c61ec] fill-[#5c61ec]/10 shrink-0" />
                          <span className="text-[13.5px] font-medium text-zinc-300">مضيف متميز (كل النجوم)</span>
                        </div>

                        {/* Horizontal features pill grid - Screenshot 1 exact replica */}
                        <div className="space-y-2 pt-1" id="car-features-replica">
                          {/* Row of 3 columns */}
                          <div className="flex flex-wrap gap-2 justify-start">
                            {/* Seats Pill */}
                            <div className="bg-[#1c1c1e] text-zinc-200 border border-[#27272a]/70 rounded-[12px] px-4 py-2.5 flex items-center gap-2 text-[14px]">
                              <Users className="w-4.5 h-4.5 text-zinc-300 shrink-0" />
                              <span>{selectedCar.seats} مقاعد</span>
                            </div>

                            {/* Gas Pill */}
                            <div className="bg-[#1c1c1e] text-zinc-200 border border-[#27272a]/70 rounded-[12px] px-4 py-2.5 flex items-center gap-2 text-[14px]">
                              <Fuel className="w-4.5 h-4.5 text-zinc-300 shrink-0" />
                              <span>بنزين / وقود</span>
                            </div>

                            {/* MPG/Efficiency Pill */}
                            <div className="bg-[#1c1c1e] text-zinc-200 border border-[#27272a]/70 rounded-[12px] px-4 py-2.5 flex items-center gap-2 text-[14px]">
                              <Gauge className="w-4.5 h-4.5 text-zinc-300 shrink-0" />
                              <span>كفاءة وقود ممتازة</span>
                            </div>
                          </div>

                          {/* Row of Transmission */}
                          <div className="w-full flex justify-start mt-1.5">
                            <div className="bg-[#1c1c1e] text-zinc-200 border border-[#27272a]/70 rounded-[12px] px-4 py-2.5 flex items-center gap-2 text-[14px]">
                              <SquarePlus className="w-4.5 h-4.5 text-zinc-300 shrink-0" />
                              <span>{selectedCar.transmission === 'automatic' || selectedCar.transmission === 'تلقائي' ? 'ناقل حركة تلقائي (أوتوماتيك)' : 'ناقل حركة يدوي (عادي)'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Horizontal Divider exactly as in the image (Thick, full-bleed section separator) */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Your Trip Layout replica */}
                        <div className="space-y-4 text-right" id="replica-your-trip">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">تفاصيل رحلتك</h2>

                          <div className="space-y-5">
                            
                            {/* Sub-item: Trip dates */}
                            <div className="flex items-start justify-between gap-4 text-right">
                              <div className="flex items-start gap-4 flex-1 select-none">
                                <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                                  {/* A clean calendar-grid icon representing dates */}
                                  <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15px] font-bold text-white leading-none">تواريخ الإيجار</h4>
                                  <div className="text-[15px] text-zinc-400 leading-normal font-sans text-right">
                                    <p>{formatTripDate(startDate)} الساعة 10:00</p>
                                    <p>{formatTripDate(endDate)} الساعة 10:00</p>
                                  </div>
                                </div>
                              </div>

                              {/* Rounded pencil button */}
                              <button
                                onClick={() => setShowBookingSheet(true)}
                                className="w-11 h-11 rounded-[14px] bg-[#1c1c1e] border border-[#27272a]/70 hover:bg-[#242427] flex items-center justify-center text-zinc-300 hover:text-white transition-all shrink-0 mt-1 cursor-pointer"
                                title="تعديل التواريخ"
                              >
                                <Pencil className="w-[18px] h-[18px] text-zinc-300" />
                              </button>
                            </div>

                            {/* Inner Separator Line */}
                            <div className="border-t border-[#1c1c1e] my-5" />

                            {/* Sub-item: Pickup & return location */}
                            <div className="flex items-start justify-between gap-4 text-right">
                              <div className="flex items-start gap-4 flex-1 select-none">
                                <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                                  {/* Milestone icon representing routing/directions */}
                                  <Compass className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-1 text-right font-sans">
                                  <h4 className="text-[15px] font-bold text-white leading-none font-sans">موقع الاستلام والإرجاع</h4>
                                  <div className="space-y-1 text-right">
                                    <p className="text-[15px] text-zinc-400 leading-snug">في الموقع بمطار هواري بومدين الدولي بالجزائر أو موقع تسليم الوكالة</p>
                                    <p className="text-[13px] text-zinc-500 leading-normal">شارع المطار الدولي، الدار البيضاء، الجزائر العاصمة</p>
                                    <button 
                                      onClick={() => alert("خدمات تسليم واستلام المطارات تتم إدارتها بالكامل في الميدان لتجربة كراء متميزة!")}
                                      className="text-xs font-semibold text-zinc-405 hover:text-white flex items-center gap-1.5 mt-2.5 transition-colors cursor-pointer bg-transparent border-none text-right p-0"
                                    >
                                      <span>معلومات حول استلام المطارات</span>
                                      <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 inline" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Rounded pencil button */}
                              <button
                                onClick={() => {
                                  alert("تم اختيار تسليم مطار الجزائر الدولي مسبقاً. سيتم تزويدك بكافة تعليمات وموقع الاستلام المباشر ومندوب الوكالة فور إتمام الحجز.");
                                }}
                                className="w-11 h-11 rounded-[14px] bg-[#1c1c1e] border border-[#27272a]/70 hover:bg-[#242427] flex items-center justify-center text-zinc-300 hover:text-white transition-all shrink-0 mt-1 cursor-pointer"
                                title="تعديل الموقع"
                              >
                                <Pencil className="w-[18px] h-[18px] text-zinc-300" />
                              </button>
                            </div>

                          </div>
                        </div>

                        {/* Thick Divider: Section 3 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Trip savings segment */}
                        <div className="space-y-4 text-right" id="replica-trip-savings">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">خصومات وتوفير الرحلة</h2>
                          <div className="bg-[#1c1c1e] border border-[#27272a]/40 rounded-[14px] px-4 py-[18px] flex items-center justify-between">
                            <span className="text-[15.5px] font-medium text-zinc-200">خصم الإيجار لـ 3 أيام أو أكثر</span>
                            <span className="text-[16px] font-semibold text-[#10b981] font-sans">1,000 دج</span>
                          </div>
                        </div>

                        {/* Thick Divider: Section 4 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Cancellation policy segment */}
                        <div className="space-y-4 text-right" id="replica-cancellation-policy">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">سياسة الإلغاء</h2>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                              <ThumbsUp className="w-6 h-6 text-white stroke-[2]" />
                            </div>
                            <div className="space-y-1 text-right">
                              <h4 className="text-[15.5px] font-bold text-white leading-tight">إلغاء مجاني</h4>
                              <p className="text-[13.5px] text-zinc-400 font-medium leading-relaxed font-sans text-right">
                                استرداد كامل للمبلغ خلال 24 ساعة من الحجز. تتوفر خيارات مرنة ومريحة لك عند الدفع.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Thick Divider: Section 5 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Payment options segment */}
                        <div className="space-y-4 text-right" id="replica-payment-options">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">خيارات الرسوم والدفع</h2>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                              <CreditCard className="w-6 h-6 text-white stroke-[2]" />
                            </div>
                            <div className="space-y-1 text-right">
                              <h4 className="text-[15.5px] font-bold text-white leading-tight">خيارات حجز ودفع مرنة</h4>
                              <p className="text-[13.5px] text-zinc-400 font-medium leading-relaxed font-sans text-right">
                                0 دج مستحق الآن عند اختيار خيار الإلغاء الشامل القابل للاسترداد وتفعيله لطلبك.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Thick Divider: Section 6 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Miles included segment */}
                        <div className="space-y-4 text-right" id="replica-miles-included">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">المسافة المشمولة (المسار)</h2>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                              <Gauge className="w-6 h-6 text-white stroke-[2]" />
                            </div>
                            <div className="space-y-1 text-right">
                              <h4 className="text-[15.5px] font-bold text-white leading-tight">600 كم مشمولة مجاناً</h4>
                              <p className="text-[13.5px] text-zinc-400 font-medium leading-relaxed font-sans text-right">
                                تسعيرة إيجار بسيطة ومدروسة لكل كيلومتر إضافي زائد.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Thick Divider: Section 7 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c10] h-3 border-t border-b border-black/55" />

                        {/* Insurance & Protection segment */}
                        <div className="space-y-4 text-right" id="replica-insurance-protection">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">التأمين والحماية</h2>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 flex items-center justify-center text-white shrink-0">
                                <Shield className="w-6 h-6 text-white stroke-[2]" />
                              </div>
                              <span className="text-[15.5px] font-bold text-white">تأمين حماية شامل بالتعاقد مع Voya للتكافل</span>
                            </div>
                            <Info className="w-5 h-5 text-zinc-400 stroke-[2] shrink-0 cursor-pointer hover:text-white transition-colors" />
                          </div>
                        </div>

                        {/* Thick Divider: Section 8 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Vehicle features segment */}
                        <div className="space-y-6 text-right" id="replica-vehicle-features">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">ميزات ومواصفات السيارة</h2>
                          
                          <div className="space-y-3">
                            <h3 className="text-[15.5px] font-bold text-white text-right">وسائل الأمان</h3>
                            <div className="space-y-2.5 text-[15.5px] text-zinc-200 font-medium font-sans text-right">
                              <p>نظام دفع رباعي مستمر (AWD)</p>
                              <p>كاميرا خلفية للمساعدة والاصطفاف</p>
                              <p>نظام ذكي لمساعدة الكبح</p>
                              <p>إطارات مخصصة لجميع التضاريس والظروف</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <h3 className="text-[15.5px] font-bold text-white text-right">الاتصال والميديا</h3>
                            <div className="space-y-2.5 text-[15.5px] text-zinc-200 font-medium font-sans text-right">
                              <p>أندرويد أوتو (Android Auto)</p>
                              <p>أبل كاربلاي (Apple CarPlay)</p>
                              <p>منفذ صوتي AUX</p>
                              <p>اتصال بلوتوث لاسلكي</p>
                            </div>
                          </div>

                          <button className="w-full mt-4 py-3 px-4 bg-[#1c1c1e] hover:bg-[#242427] border border-[#27272a]/70 rounded-[14px] text-[15px] font-bold text-white transition-all text-center cursor-pointer">
                            عرض كافة ميزات السيارة (19 ميزة)
                          </button>
                        </div>

                        {/* Thick Divider: Section 9 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Included in the price segment */}
                        <div className="space-y-6 text-right" id="replica-included-in-price">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">مشمول في السعر مجاناً</h2>
                          
                          <div className="space-y-5">
                            <h3 className="text-[15.5px] font-bold text-white text-right">ميزات الراحة والتسهيلات</h3>
                            
                            <div className="space-y-4">
                              {/* Item 1 */}
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                  <CarFront className="w-6 h-6 text-white stroke-[2]" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15.5px] font-bold text-white leading-tight">تخطي طابور ومكتب الاستلام التقليدي</h4>
                                  <p className="text-[13.5px] text-zinc-400 font-medium leading-relaxed font-sans text-right">
                                    استخدم التطبيق بالكامل لتوجيه خطواتك وتلقي موقع الاستلام بالكامل بدون تضييع الوقت.
                                  </p>
                                </div>
                              </div>

                              {/* Item 2 */}
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                  <UserPlus className="w-6 h-6 text-white stroke-[2]" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15.5px] font-bold text-white leading-tight">إمكانية إضافة سائقين إضافيين مجاناً</h4>
                                </div>
                              </div>

                              {/* Item 3 */}
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                  <Clock className="w-6 h-6 text-white stroke-[2]" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15.5px] font-bold text-white leading-tight">فترة سماح إضافية لمدة 30 دقيقة عند الإرجاع</h4>
                                  <p className="text-[13.5px] text-zinc-400 font-medium leading-relaxed font-sans text-right">
                                    لا حاجة لتمديد كراء المركبة احتياطياً إلا إذا تأخرت لأكثر من 30 دقيقة عن الموعد.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-5 pt-3">
                            <h3 className="text-[15.5px] font-bold text-white text-right">راحة البال الكاملة</h3>

                            <div className="space-y-4">
                              {/* Item 1 */}
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                  <Sparkles className="w-6 h-6 text-white stroke-[2]" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15.5px] font-bold text-white leading-tight">غسيل السيارة غير الزامي، فقط يرجى الحفاظ على نظافتها العامة</h4>
                                </div>
                              </div>

                              {/* Item 2 */}
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                  <LifeBuoy className="w-6 h-6 text-white stroke-[2]" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15.5px] font-bold text-white leading-tight">ولوج مجاني وسريع لخدمة المساعدة على الطريق 24/7</h4>
                                </div>
                              </div>

                              {/* Item 3 */}
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                  <Headset className="w-6 h-6 text-white stroke-[2]" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15.5px] font-bold text-white leading-tight">خدمة دعم متميزة للعملاء على مدار الساعة 24/7</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Thick Divider: Section 10 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Ratings and reviews segment */}
                        <div className="space-y-6 text-right" id="replica-ratings-reviews">
                          <div className="space-y-1">
                            <h2 className="text-[22px] font-bold text-white text-right tracking-tight">التقييمات والمراجعات</h2>
                            <div className="flex items-center gap-1.5 text-[22px] font-bold text-white font-sans mt-0.5 justify-start">
                              <span>{selectedCar.rating.toFixed(2).replace('.', ',')}</span>
                              <Star className="w-[18px] h-[18px] fill-[#5c61ec] text-[#5c61ec]" />
                              <span className="text-zinc-400 font-normal">({selectedCar.reviewsCount} تقييم)</span>
                            </div>
                          </div>

                          {/* Category bars container */}
                          <div className="space-y-3.5">
                            {[
                              { label: "النظافة والتعقيم", val: "5,0" },
                              { label: "الصيانة والجاهزية", val: "5,0" },
                              { label: "التواصل وسرعة الرد", val: "5,0" },
                              { label: "سهولة الاستلام والتسليم", val: "5,0" },
                              { label: "دقة مواصفات الإعلان", val: "5,0" },
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-[15px] font-medium text-white" dir="rtl">
                                <span className="w-36 text-right">{item.label}</span>
                                <div className="flex-1 mx-4 h-1.5 bg-[#1c1c1e] rounded-full overflow-hidden relative">
                                  <span className="absolute inset-y-0 right-0 bg-[#5c61ec] rounded-full w-full" />
                                </div>
                                <span className="text-zinc-200 font-sans w-6 text-left">{item.val}</span>
                              </div>
                            ))}
                          </div>
                          
                          <p className="text-[13.5px] text-zinc-500 font-medium font-sans text-right">
                            بناءً على {selectedCar.reviewsCount} تقييماً حقيقياً من مستأجرين سابقين
                          </p>

                          {/* Horizontal scroll of reviews */}
                          <div className="flex gap-4 overflow-x-auto no-scrollbar pt-3 pb-2 snap-x scroll-smooth" dir="rtl">
                            {[
                              {
                                userName: "ماثيو",
                                date: "17 مارس 2026",
                                userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
                                comment: "السيارة كانت رائعة ونظيفة جداً والتعليمات كانت واضحة وسهلة ومطابقة تماماً. سأقوم بالكراء مجدداً بالتأكيد!"
                              },
                              {
                                userName: "سارة",
                                date: "02 يونيو 2026",
                                userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
                                comment: "خدمة قمة في الاحترافية والمرونة وسيارة متميزة من كافة النواحي. أنصح بشدة بالتعامل معهم!"
                              },
                              {
                                userName: "ديفيد",
                                date: "14 ماي 2026",
                                userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
                                comment: "قيادة ممتعة وسلسة والسيارة مجهزة بالكامل. عملية الاستلام والرد كانت سريعة جداً وخالية من أي متاعب."
                              },
                              {
                                userName: "جيسيكا",
                                date: "28 أفريل 2026",
                                userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
                                comment: "سيارة نظيفة ورائعة للغاية، المضيف محترم، خدوم ومتعاون جداً، وكان التواصل معه طيلة الرحلة ممتازاً."
                              }
                            ].map((rev, idx) => (
                              <div 
                                key={idx} 
                                className="min-w-[315px] max-w-[315px] w-[315px] flex-shrink-0 bg-[#1c1c1e] border border-[#27272a]/70 p-5 rounded-[16px] flex flex-col justify-start text-right h-[210px] snap-start"
                              >
                                <div className="space-y-4 text-right">
                                  <div className="flex items-center gap-3.5 justify-start">
                                    <img 
                                      src={rev.userAvatar} 
                                      alt={rev.userName} 
                                      className="w-[46px] h-[46px] rounded-full object-cover border border-[#27272a]/30" 
                                      referrerPolicy="no-referrer" 
                                    />
                                    <div className="space-y-1">
                                      {/* Star rating stars in violet-purple */}
                                      <div className="flex gap-0.5 text-[#5c61ec] justify-start">
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} className="w-[15px] h-[15px] fill-[#5c61ec] text-[#5c61ec]" />
                                        ))}
                                      </div>
                                      <div className="text-[15px] flex items-baseline gap-1.5 leading-none justify-start">
                                        <span className="font-bold text-white">{rev.userName}</span>
                                        <span className="text-zinc-400 font-sans text-[14px] font-normal">{rev.date}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-[16px] text-zinc-100 font-medium leading-relaxed font-sans line-clamp-3 text-right">
                                    {rev.comment}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button className="w-full mt-2 py-3.5 px-4 bg-[#1c1c1e] hover:bg-[#242427] border border-[#27272a]/70 rounded-[14px] text-[15.5px] font-bold text-white transition-all text-center cursor-pointer">
                            مشاهدة كافة التعليقات والتقييمات
                          </button>
                        </div>

                        {/* Thick Divider: Section 11 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Hosted By Segment */}
                        <div className="space-y-6 text-right" id="replica-hosted-by">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">المضيف وصاحب السيارة</h2>
                          
                          {/* Host Profile Info */}
                          <div className="flex items-center gap-5 justify-start">
                            {/* Avatar with absolute Star badge overlay */}
                            <div className="relative shrink-0 select-none">
                              <div className="w-[84px] h-[84px] rounded-full overflow-hidden border border-zinc-850">
                                <img 
                                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" 
                                  alt="Guillermo" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {/* Floating 5,0 Star badge with shadow */}
                              <div className="absolute -bottom-1.5 -left-1 bg-[#1c1c1e] border border-zinc-800/80 py-1 px-2.5 text-[12px] rounded-full flex items-center justify-center gap-1 shadow-lg select-none leading-none z-10 font-bold text-white font-sans">
                                <span>5,0</span>
                                <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec] shrink-0" />
                              </div>
                            </div>

                            {/* Name and statistics */}
                            <div className="space-y-1.5 text-right">
                              <h3 className="text-[24px] font-bold text-white leading-none">Guillermo</h3>
                              <p className="text-[16px] text-zinc-400 font-medium font-sans">
                                611 رحلة كراء ناجحة <span className="text-zinc-600">•</span> انضم في جويليّة 2022
                              </p>
                            </div>
                          </div>

                          {/* Thin custom divider line */}
                          <div className="border-t border-[#1c1c1e] my-5" />

                          {/* All-Star Host features with rosette badge */}
                          <div className="flex items-start gap-4">
                            {/* Polished award badge */}
                            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                              <div className="absolute inset-0 bg-[#5c61ec]/10 rounded-full blur-[6px]" />
                              <div className="relative w-12 h-12 bg-gradient-to-tr from-[#3b3f8c] to-[#5c61ec] rounded-full flex items-center justify-center border border-white/10 shadow-md">
                                <Star className="w-5.5 h-5.5 text-white fill-white" />
                                <div className="absolute -bottom-1 w-[14px] h-[14px] bg-[#3b3f8c] border-r border-b border-white/10 rotate-45 transform" />
                              </div>
                              <Sparkles className="absolute -top-1 -right-1 w-4.5 h-4.5 text-[#e879f9]" />
                              <Sparkles className="absolute -bottom-1 -left-1 w-3.5 h-3.5 text-[#a1a5fa]" />
                            </div>
                            
                            {/* Description details */}
                            <div className="space-y-1.5 text-right flex-1">
                              <h4 className="text-[16px] font-bold text-white leading-tight">مضيف متميز (All-Star Host)</h4>
                              <p className="text-[14.5px] text-[#8e8e93] font-medium leading-relaxed font-sans text-right">
                                المضيفون المميزون مثل Guillermo هم من بين الأفضل تقييماً والأكثر ثقةً وموثوقيةً في المنصة لتأمين رحلة خالية من المتاعب.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Thick Divider: Section 12 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Extras segment */}
                        <div className="space-y-4 text-right" id="replica-extras">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">الخدمات الإضافية (1)</h2>
                          
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-[15.5px] text-zinc-300 font-medium leading-normal text-right">
                              أضف خدمات إضافية اختيارية لرحلتك عند إتمام طلب الكراء.
                            </p>
                            <Info className="w-5 h-5 text-zinc-400 stroke-[2] shrink-0 cursor-pointer hover:text-white transition-colors mt-0.5" />
                          </div>

                          <div className="space-y-2 pt-2">
                            <h3 className="text-[17px] font-bold text-white text-right">تعبئة مسبقة للغاز والوقود</h3>
                            <p className="text-[14.5px] text-[#8e8e93] font-medium leading-relaxed font-sans text-right">
                              وفر وقتك واجعل تسليم المركبة في غاية السلاسة والسرعة دون غرامات إضافية، حيث تتيح لك هذه الإضافة إرجاع السيارة بأي مستوى وقود متبقي. يشمل السعر تغطية تكلفة خزان ممتلئ بالكامل عند الاستلام.
                            </p>
                            <div className="text-[15.5px] font-bold text-white font-sans pt-1 text-right">
                              15,000 دج / للرحلة
                            </div>
                          </div>
                        </div>

                        {/* Thick Divider: Section 13 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Rules of the road segment */}
                        <div className="space-y-6 text-left" id="replica-rules-of-the-road">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">تعليمات وقواعد الطريق</h2>

                          <div className="space-y-5">
                            {/* Smoking rule */}
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                <CigaretteOff className="w-6 h-6 text-white stroke-[2]" />
                              </div>
                              <div className="space-y-1 text-right">
                                <h4 className="text-[15.5px] font-bold text-white leading-tight font-sans">يُمنع التدخين تماماً داخل المركبة</h4>
                                <p className="text-[13.5px] text-[#8e8e93] font-medium leading-relaxed font-sans text-right">
                                  التدخين داخل المركبة يؤدي إلى غرامة تنظيف وتعقيم عميق بقيمة 15,000 دج.
                                </p>
                              </div>
                            </div>

                            {/* Tidy rule */}
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                <Sparkles className="w-6 h-6 text-white stroke-[2]" />
                              </div>
                              <div className="space-y-1 text-right">
                                <h4 className="text-[15.5px] font-bold text-white leading-tight font-sans">الحفاظ على نظافة السيارة وترتيبها</h4>
                                <p className="text-[13.5px] text-[#8e8e93] font-medium leading-relaxed font-sans text-right">
                                  إرجاع السيارة متسخة بشكل مفرط ومخالف للآداب قد يترتب عليه رسوم تنظيف بقيمة 5,000 دج.
                                </p>
                              </div>
                            </div>

                            {/* Refuel rule */}
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                <Fuel className="w-6 h-6 text-white stroke-[2]" />
                              </div>
                              <div className="space-y-1 text-right">
                                <h4 className="text-[15.5px] font-bold text-white leading-tight font-sans">مستوى الوقود عند الإرجاع</h4>
                                <p className="text-[13.5px] text-[#8e8e93] font-medium leading-relaxed font-sans text-right">
                                  يرجى إعادة ملء الوقود إلى نفس المستوى المستلم لتفادي أي رسوم إضافية للوقود المستهلك.
                                </p>
                              </div>
                            </div>

                            {/* Off-roading rule */}
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 flex items-center justify-center text-white shrink-0 mt-0.5">
                                <Compass className="w-6 h-6 text-white stroke-[2]" />
                              </div>
                              <div className="space-y-1 text-right">
                                <h4 className="text-[15.5px] font-bold text-white leading-tight font-sans">يُمنع القيادة خارج الطرق المعبدة (Off-Road)</h4>
                              </div>
                            </div>
                          </div>

                          {/* Location tracking disclaimer */}
                          <p className="text-[13px] text-zinc-500 font-medium leading-relaxed font-sans pt-1 pb-1 text-right">
                            تنبيه الأمان والدقة: قد تكون المركبة مزودة بجهاز حماية GPS مدمج لتحديد الموقع الجغرافي لأغراض أمنية وضمان استرداد المركبة حال حدوث أي طارئ.
                          </p>

                          {/* Divider */}
                          <div className="border-t border-[#1c1c1e] my-3" />

                          {/* Reporting buttons */}
                          <div className="flex flex-col items-center gap-4.5 pt-2 pb-4">
                            <button className="text-[16px] font-bold text-[#5c61ec] hover:underline cursor-pointer bg-transparent border-0 outline-none">
                              الإبلاغ عن خطأ في الإعلان
                            </button>
                            <button className="text-[16px] font-bold text-[#5c61ec] hover:underline cursor-pointer bg-transparent border-0 outline-none">
                              سياسة إلغاء الحجز التفصيلية
                            </button>
                          </div>
                        </div>

                        {/* Thick Divider: Final bottom separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                      </div>
                    </div>
                  </div>

              {/* Sticky bottom checkout action bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-[#0a0a0b] border-t border-zinc-900 flex justify-between items-center z-10" dir="rtl">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-tight">إجمالي تكلفة الكراء</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xs text-zinc-500 line-through">{(selectedCar.pricePerDay * calculatedDays).toLocaleString()} دج</span>
                    <span className="text-base font-black text-zinc-100">{finalTotalPrice.toLocaleString()} دج</span>
                    <span className="text-[9px] text-[#888c94] font-bold uppercase tracking-wide">
                      {calculatedDays === 1 ? ' / يوم' : ` / ${calculatedDays} أيام`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowBookingSheet(true)}
                  className="px-8 py-3 bg-[#5c61ec] hover:bg-[#4d51d5] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-950/40 active:scale-95 transition-all text-center cursor-pointer border border-[#6b70ff]"
                >
                  الاستمرار لتأكيد الحجز
                </button>
              </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking date picker and final checkout panel */}
      <AnimatePresence>
        {showBookingSheet && selectedCar && (
          <div id="booking-sheet-overlay" className="absolute inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-zinc-950 w-full max-w-md rounded-t-3xl shadow-2xl p-5 relative border-t border-zinc-850 text-right"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setShowBookingSheet(false)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/20 text-zinc-400 hover:text-white hover:bg-white/[0.18] hover:border-white/35 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md"
                title="إغلاق التذكرة"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <h3 className="text-sm font-extrabold text-zinc-200 mb-4 flex items-center gap-1.5 font-sans">
                <Calendar className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                تأكيد حجز السيارة • {selectedCar.brand}
              </h3>

              {bookingSuccess ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-purple-950/60 text-purple-400 rounded-full flex items-center justify-center mb-4 animate-bounce border border-purple-800">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <h4 className="text-xs font-extrabold text-purple-400">تم حجز مركبتك بنجاح!</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">يجرى تحضير عقد الكراء وعرض كود التذكرة في صفحة الحجوزات.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Select Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="start-date-input" className="text-[9px] font-bold text-zinc-500 block mb-1">تاريخ الاستلام</label>
                      <input 
                        id="start-date-input"
                        type="date"
                        value={startDate}
                        min="2026-06-06"
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date-input" className="text-[9px] font-bold text-zinc-500 block mb-1">تاريخ الإرجاع</label>
                      <input 
                        id="end-date-input"
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Calculations invoice */}
                  <div className="bg-zinc-905 p-3 rounded-2xl border border-zinc-900 flex flex-col gap-2 font-semibold">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">مدة الإيجار:</span>
                      <span className="font-extrabold text-zinc-300 font-mono">{calculatedDays} أيام</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">إجمالي الكراء اليومي:</span>
                      <span className="font-extrabold text-zinc-300 font-mono">{priceBeforeFees.toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">تأمين Voya والوساطة (5%):</span>
                      <span className="font-extrabold text-zinc-300 font-mono">{platformFees.toLocaleString()} دج</span>
                    </div>
                    
                    <hr className="border-zinc-800/80 my-1" />
                    
                    <div className="flex justify-between items-center text-xs text-purple-400 font-black">
                      <span>إجمالي الخصم من المحفظة:</span>
                      <span className="text-sm font-extrabold text-purple-400 font-mono">{finalTotalPrice.toLocaleString()} دج</span>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="bg-rose-950/40 text-rose-400 text-[10px] p-3 rounded-xl border border-rose-900/60 leading-relaxed text-right flex flex-col gap-1.5 items-end">
                      <span>{bookingError}</span>
                      {user.isGuest && onShowLoginSignup && (
                        <button
                          type="button"
                          onClick={onShowLoginSignup}
                          className="mt-1 bg-[#5c61ec] hover:bg-[#4b50d3] text-white px-3 py-1.5 rounded-lg text-[9.5px] font-black transition-all cursor-pointer shadow-lg active:scale-95 border border-[#6f73f7]/25"
                        >
                          سجل الدخول / إنشاء حساب جديد
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submit checkout buttons */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 block">رصيد المحفظة الحالي</span>
                      <span className="text-xs font-black text-zinc-300 font-mono">{user.walletBalance.toLocaleString()} دج</span>
                    </div>

                    <button
                      onClick={handleCreateBooking}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg shadow-purple-900/30 border border-purple-500 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 shrink-0" />
                      تأكيد ودفع قيمة الكراء
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Screenshot 2 Full-Screen Interactive Search Overlay */}
      <AnimatePresence>
        {isSearchOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 z-50 bg-[#0d0d10] flex flex-col font-sans select-none overflow-hidden"
            dir="rtl"
          >
            {/* Native High-Fidelity iOS Status Bar at the top of Search screen */}
            <div className="w-full bg-[#0d0d10] text-white px-5 pt-3.5 pb-2 flex justify-between items-center shrink-0" dir="rtl">
              {/* Left Side: Time (matching 15:52 exactly) */}
              <div className="flex items-center">
                <span className="text-[12.5px] font-black font-sans leading-none text-white/95">15:52</span>
              </div>

              {/* Right Side: Network status indicator elements */}
              <div className="flex items-center gap-1.5" dir="ltr">
                {/* iPhone signal bars */}
                <div className="flex items-end gap-[1.5px] h-2.5 pb-[0.5px]">
                  <div className="w-[3px] h-[3px] bg-white rounded-[0.5px]" />
                  <div className="w-[3px] h-[5px] bg-white rounded-[0.5px]" />
                  <div className="w-[3px] h-[7px] bg-white rounded-[0.5px]" />
                  <div className="w-[3px] h-[9px] bg-white rounded-[0.5px]" />
                </div>

                <Wifi className="w-3.5 h-3.5 text-white stroke-[2.2]" />

                {/* Battery capsule detailing 54 */}
                <div className="flex items-center gap-0.5">
                  <div className="relative w-6 h-3 rounded-[3.5px] bg-zinc-800 flex items-center p-[1px] border border-zinc-700/60">
                    <div className="h-full w-[54%] bg-white rounded-[2px]" />
                    <span className="absolute inset-0 flex items-center justify-center text-[7.5px] font-black text-zinc-100 font-sans z-10 leading-none">54</span>
                  </div>
                  <div className="w-[1.2px] h-1 bg-zinc-650 rounded-r-[1px]" />
                </div>
              </div>
            </div>

            {/* Input Row Container */}
            <div className="px-4 pt-2 pb-3.5 flex items-center gap-3 shrink-0 bg-[#0d0d10]" dir="rtl">
              {/* Text Input Block */}
              <div className="flex-1 bg-[#1c1c21] border border-zinc-800/40 rounded-xl py-2.5 px-4 flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="ابحث عن مدينة، مطار، فندق، أو عنوان..."
                  value={tempSearchText}
                  onChange={(e) => {
                    setTempSearchText(e.target.value);
                    // Live typing filters search brand in parent as well for native responses!
                    setSearchBrand(e.target.value);
                  }}
                  className="w-full text-xs font-semibold font-sans bg-transparent text-white border-none outline-none placeholder-[#585860] focus:ring-0 focus:outline-none text-right"
                />
                {tempSearchText && (
                  <button 
                    onClick={() => {
                      setTempSearchText("");
                      setSearchBrand("");
                    }}
                    className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Red/White clickable "Cancel" text */}
              <button
                onClick={() => {
                  setIsSearchOverlayOpen(false);
                  setTempSearchText("");
                  setSearchBrand("");
                }}
                className="text-zinc-400 hover:text-white active:scale-95 transition-all text-xs font-extrabold font-sans px-1 shrink-0"
              >
                إلغاء
              </button>
            </div>

            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4 no-scrollbar bg-[#0d0d10]" dir="rtl">
              
              {/* Promo deliveries card */}
              <div className="p-4 bg-[#141418] border border-zinc-900 rounded-[18px] flex items-center justify-between hover:bg-zinc-900/60 transition-colors duration-200">
                <div className="flex items-center gap-4 text-right">
                  {/* Delivery Route Car Logo badge */}
                  <div className="relative w-11 h-11 bg-gradient-to-tr from-[#5c61ec]/25 to-[#a1a5fa]/15 rounded-2xl flex items-center justify-center border border-[#5c61ec]/30 shadow-md shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#5c61ec]" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 18H15C17.5 18 19 16.5 19 14C19 11.5 17.5 10 15 10H8" />
                      <path d="M11 7L8 10L11 13" />
                      <circle cx="5" cy="18.5" r="1.5" className="fill-[#0d0d10]" />
                      <circle cx="8" cy="18.5" r="1.5" className="fill-[#0d0d10]" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-black text-white font-sans tracking-wide">احصل على سيارتك موصلة لبابك</h3>
                    <p className="text-[10px] font-bold text-zinc-500 font-sans mt-0.5">ابحث عن الفندق أو موقع إقامتك الحالي</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700 rotate-180" />
              </div>

              {/* Location selection rows */}
              <div className="flex flex-col text-right">
                {[
                  {
                    id: "current",
                    title: "موقعي الحالي الآن",
                    subtitle: "تفعيل خدمة الـ GPS وتحديد الأقرب",
                    icon: Navigation,
                    action: () => {
                      setSearchCity("الجزائر");
                      setIsSearchOverlayOpen(false);
                      onAddNotification({
                        id: "not_loc_srv_" + Date.now(),
                        title: "تم تحديد موقعك بنجاح 📍",
                        content: "تتصفح الآن جميع السيارات المتوفرة بالقرب من الجزائر العاصمة.",
                        type: "system",
                        date: "الآن",
                        read: false
                      });
                    }
                  },
                  {
                    id: "anywhere",
                    title: "كل ولايات الجزائر",
                    subtitle: "استكشف أسطول تورو الكامل في كل البلاد",
                    icon: Globe,
                    action: () => {
                      setSearchCity("الكل");
                      setSearchBrand("");
                      setCurrentPill("الكل");
                      setIsSearchOverlayOpen(false);
                    }
                  },
                  {
                    id: "sjc",
                    title: "مطار هواري بومدين الدولي",
                    subtitle: "خيارات التسليم الفخمة داخل مرآب المطار بالجزائر العاصمة",
                    icon: Plane,
                    action: () => {
                      setSearchCity("الجزائر");
                      setSearchBrand("");
                      setIsSearchOverlayOpen(false);
                      onAddNotification({
                        id: "not_alg_" + Date.now(),
                        title: "مطار هواري بومدين الدولي ✈️",
                        content: "تمت تصفية السيارات المتاحة للتوصيل الفوري لمطار هواري بومدين.",
                        type: "system",
                        date: "الآن",
                        read: false
                      });
                    }
                  },
                  {
                    id: "la",
                    title: "حيدرة - الجزائر العاصمة",
                    subtitle: "استكشف تشكيلة السيارات الفخمة والـ SUV الرياضية",
                    icon: Building,
                    action: () => {
                      setSearchCity("الجزائر");
                      setSearchBrand("");
                      setIsSearchOverlayOpen(false);
                    }
                  },
                  {
                    id: "sf",
                    title: "وهران الباهية",
                    subtitle: "ابحث عن التشكيلات العائلية والشعبية في الغرب الجزائري",
                    icon: Building,
                    action: () => {
                      setSearchCity("وهران");
                      setSearchBrand("");
                      setIsSearchOverlayOpen(false);
                    }
                  },
                  {
                    id: "union",
                    title: "قسنطينة (ولاية الجسور المعلقة)",
                    subtitle: "اكتشف أفضل سيارات الكراء والـ 4x4 في الشرق",
                    icon: Train,
                    action: () => {
                      setSearchCity("قسنطينة");
                      setIsSearchOverlayOpen(false);
                    }
                  },
                  {
                    id: "sheraton",
                    title: "فندق شيراتون / الأوراسي",
                    subtitle: "تسهيل استلام مجاني ومباشر لسيارتك أمام أبواب الفندق",
                    icon: Bed,
                    action: () => {
                      setSearchCity("الجزائر");
                      setIsSearchOverlayOpen(false);
                    }
                  }
                ].map((loc) => {
                  const LocIconComp = loc.icon;
                  return (
                    <button
                      key={loc.id}
                      onClick={loc.action}
                      className="w-full flex items-center gap-4 py-3 border-b border-zinc-900/40 text-right hover:bg-zinc-900/30 px-2 rounded-xl transition-all group"
                    >
                      {/* Left icon sphere */}
                      <div className="w-[38px] h-[38px] rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-850/40 group-hover:bg-[#5c61ec]/10 transition-colors">
                        <LocIconComp className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#5c61ec] stroke-[2.2] transition-colors" />
                      </div>

                      {/* Headings */}
                      <div className="flex-1 text-right">
                        <h4 className="text-xs font-bold text-[#f3f4f6] font-sans tracking-wide leading-none">{loc.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 font-sans mt-1.5 leading-none">{loc.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
