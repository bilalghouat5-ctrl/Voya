/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Car, Reservation, User, Notification, Agency } from "../types";
import { Search, SlidersHorizontal, MapPin, Calendar, Star, ShieldCheck, Fuel, UserPlus, Heart, X, Check, Wallet, ChevronLeft, ChevronRight, MessageSquare, Info, Plane, Sparkles, Crown, Zap, Building, Award, Compass, Globe, Navigation, Train, Bed, Wifi, CarFront, ArrowLeft, ArrowRight, Upload, Pencil, Users, Gauge, SquarePlus, ThumbsUp, CreditCard, Shield, Clock, Headset, LifeBuoy, CigaretteOff, Share2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALGERIAN_CITIES, INITIAL_AGENCIES, INITIAL_REVIEWS } from "../data";
import { useLanguage } from "../LanguageContext";

interface ExploreTabProps {
  cars: Car[];
  user: User;
  onUpdateUser: (updated: User) => void;
  onAddBooking: (booking: Reservation) => void;
  onAddNotification: (notif: Notification) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
  onShowLoginSignup?: () => void;
}

const INITIAL_REVIEWS_LIST = [
  {
    id: "rev-1",
    initialLetter: "V",
    userName: "VALERIE",
    date: "4 جوان 2026",
    rating: 5,
    comment: "الحالة ممتازة جداً للسيارة، تواصل رائع مع المضيف، الشحن كان مجانياً في المنتجع وهو خيار ممتاز للتجول دون دفع ثمن الوقود، مساحة كبيرة تتسع لـ 3 حقائب كبيرة.",
    englishComment: "very nice condition ev car, fsd, good communication with host, charging at resort was free so very good option to tour the island without paying for gas, plenty of room for 3 large suitcases",
    userAvatar: ""
  },
  {
    id: "rev-2",
    initialLetter: "I",
    userName: "INWOO",
    date: "17 أبريل 2026",
    rating: 5,
    comment: "سيارة مثالية ورحلة ممتازة ومريحة للغاية.",
    englishComment: "perfect car, perfect trip",
    userAvatar: ""
  },
  {
    id: "rev-3",
    initialLetter: "M",
    userName: "Michael",
    date: "9 أبريل 2026",
    rating: 5,
    comment: "كان من الرائع التعامل مع المضيف، والسيارة كانت ممتازة ومثالية جداً للرحلة بأكملها.",
    englishComment: "RJ was great to work with and the car is perfect for Oahu",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "rev-4",
    initialLetter: "M",
    userName: "Mithun",
    date: "5 فبراير 2026",
    rating: 5,
    comment: "مذهلة بكل بساطة. مضيف رائع والسيارة ممتازة ومريحة للغاية.",
    englishComment: "just amazing. Amazing host. Amazing car.",
    userAvatar: ""
  },
  {
    id: "rev-5",
    initialLetter: "M",
    userName: "Mona",
    date: "5 جوان 2026",
    rating: 5,
    comment: "تعامل احترافي للغاية وأحببت السيارة والخدمة المقدمة. أتمنى لو كانت كل تجاربي مثل هذه التجربة.",
    englishComment: "Very professional interaction and I loved the car and the service rendered. I wish all my experiences was like this.",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "rev-6",
    initialLetter: "S",
    userName: "Sean",
    date: "2 جوان 2026",
    rating: 5,
    comment: "السيارة كانت رائعة واستهلاك الوقود كان أفضل بكثير مما كنت أتوقع.",
    englishComment: "Car was great and the gas mileage was even better.",
    response: {
      hostName: "Rides Plus",
      comment: "Thank you! / شكراً جزيلاً لك!"
    },
    userAvatar: ""
  }
];

export default function ExploreTab({ cars, user, onUpdateUser, onAddBooking, onAddNotification, onSetHideBottomNav, onShowLoginSignup }: ExploreTabProps) {
  const { t, isRtl, dir, language } = useLanguage();
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
  const [showFeaturesModal, setShowFeaturesModal] = useState<boolean>(false);
  const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);
  const [selectedAgency, setSelectedAgency] = useState<any | null>(null);
  const [showAllAgencyReviews, setShowAllAgencyReviews] = useState<boolean>(false);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState<boolean>(false);
  const [hasMoreReviews, setHasMoreReviews] = useState<boolean>(true);
  const [loadedReviews, setLoadedReviews] = useState<any[]>(INITIAL_REVIEWS_LIST);

  const handleReviewsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
    if (isAtBottom && !isLoadingMoreReviews && hasMoreReviews) {
      setIsLoadingMoreReviews(true);
      setTimeout(() => {
        setLoadedReviews(prev => {
          // Double safeguard to make sure we don't ever add duplicate reviews
          if (prev.some(r => r.id === "rev-7")) {
            return prev;
          }
          return [
            ...prev,
            {
              id: "rev-7",
              initialLetter: "Y",
              userName: "ياسين",
              date: "28 ماي 2026",
              rating: 5,
              comment: "السيارة ممتازة ومريحة للغاية وموفرة في الوقود، بالإضافة إلى أن المضيف محترم ومرن جداً.",
              englishComment: "Excellent car, clean and fuel-efficient. The host was very respectful and flexible.",
              userAvatar: ""
            },
            {
              id: "rev-8",
              initialLetter: "S",
              userName: "سليمة",
              date: "20 ماي 2026",
              rating: 5,
              comment: "تجربة رائعة وتواصل ممتاز وسرعة فائقة في تسليم واستلام المركبة. أنصح بالتعامل معه بشدة.",
              englishComment: "Wonderful experience, great communication, and fast check-in/out. Highly recommend!",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
            },
            {
              id: "rev-9",
              initialLetter: "A",
              userName: "أحمد",
              date: "15 ماي 2026",
              rating: 5,
              comment: "خيار رائع وجودة متميزة في التعامل، سأقوم بالكراء مجدداً بالتأكيد.",
              englishComment: "Great choice and perfect handling, will definitely rent again.",
              userAvatar: ""
            }
          ];
        });
        setHasMoreReviews(false);
        setIsLoadingMoreReviews(false);
      }, 1500);
    }
  };

  const [startDate, setStartDate] = useState<string>("2026-06-17");
  const [endDate, setEndDate] = useState<string>("2026-06-20");
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [returnTime, setReturnTime] = useState<string>("10:00");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [pickupOption, setPickupOption] = useState<"car_location" | "airport" | "delivery">("airport");
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState<string>("");
  const [tempPickupOption, setTempPickupOption] = useState<"car_location" | "airport" | "delivery">("airport");
  const [tempCustomDeliveryAddress, setTempCustomDeliveryAddress] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<string>("2026-06-17");
  const [tempEndDate, setTempEndDate] = useState<string>("2026-06-20");
  const [tempPickupTime, setTempPickupTime] = useState<string>("10:00");
  const [tempReturnTime, setTempReturnTime] = useState<string>("10:00");
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>("");

  // Checkout states to match provided design screenshot
  const [countryCode, setCountryCode] = useState<string>("+213");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [driverFirstName, setDriverFirstName] = useState<string>("");
  const [driverLastName, setDriverLastName] = useState<string>("");
  const [driverAge, setDriverAge] = useState<number>(30);
  const [agreeToPromotions, setAgreeToPromotions] = useState<boolean>(true);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  React.useEffect(() => {
    if (showCustomDatePicker) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setTempPickupTime(pickupTime);
      setTempReturnTime(returnTime);
    }
  }, [showCustomDatePicker, startDate, endDate, pickupTime, returnTime]);

  React.useEffect(() => {
    if (showLocationPicker) {
      setTempPickupOption(pickupOption);
      setTempCustomDeliveryAddress(customDeliveryAddress);
    }
  }, [showLocationPicker, pickupOption, customDeliveryAddress]);

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

  const formatTripDate = (dateStr: string, customTime?: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const monthsAr = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      return `${daysAr[d.getDay()]}، ${d.getDate()} ${monthsAr[d.getMonth()]} ${customTime ? `الساعة ${customTime}` : "الساعة 10:00"}`;
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

  const formatTripDateAR = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const monthsAr = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      return `${daysAr[d.getDay()]}، ${d.getDate()} ${monthsAr[d.getMonth()]}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatCheckoutDate = (dateStr: string, customTime?: string, isReturn: boolean = false) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedTime = customTime ? (parseInt(customTime.split(":")[0]) >= 12 ? `${customTime} PM` : `${customTime} AM`) : "10:00 AM";
      return `${daysEn[d.getDay()]}, ${monthsEn[d.getMonth()]} ${d.getDate()}• ${formattedTime}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getRefundedByDate = (endDateStr: string) => {
    try {
      const d = new Date(endDateStr);
      if (isNaN(d.getTime())) return "";
      d.setDate(d.getDate() + 3); // add 3 days
      if (isRtl) {
        const monthsAr = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        return `${d.getDate()} ${monthsAr[d.getMonth()]}`;
      } else {
        const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthsEn[d.getMonth()]} ${d.getDate()}`;
      }
    } catch (e) {
      return "";
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
      contractVerified: false,
      renterName: `${driverFirstName} ${driverLastName}`,
      renterPhone: `${countryCode} ${mobileNumber}`
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
  
  const weddingCarsLocal = cars.filter(c => c.category === "wedding" && c.isAvailable && cityMatch(c));
  const weddingCarsAll = cars.filter(c => c.category === "wedding" && c.isAvailable);
  const weddingCars = weddingCarsLocal.length > 0 ? weddingCarsLocal : weddingCarsAll;
  const isWeddingBackup = weddingCarsLocal.length === 0 && weddingCarsAll.length > 0;

  const suvCarsLocal = cars.filter(c => c.category === "suv" && c.isAvailable && cityMatch(c));
  const suvCarsAll = cars.filter(c => c.category === "suv" && c.isAvailable);
  const suvCars = suvCarsLocal.length > 0 ? suvCarsLocal : suvCarsAll;
  const isSuvBackup = suvCarsLocal.length === 0 && suvCarsAll.length > 0;

  const luxuryCarsLocal = cars.filter(c => c.category === "luxury" && c.isAvailable && cityMatch(c));
  const luxuryCarsAll = cars.filter(c => c.category === "luxury" && c.isAvailable);
  const luxuryCars = luxuryCarsLocal.length > 0 ? luxuryCarsLocal : luxuryCarsAll;
  const isLuxuryBackup = luxuryCarsLocal.length === 0 && luxuryCarsAll.length > 0;

  const vanCarsLocal = cars.filter(c => c.category === "van" && c.isAvailable && cityMatch(c));
  const vanCarsAll = cars.filter(c => c.category === "van" && c.isAvailable);
  const vanCars = vanCarsLocal.length > 0 ? vanCarsLocal : vanCarsAll;
  const isVanBackup = vanCarsLocal.length === 0 && vanCarsAll.length > 0;

  const nearbyCars = cars.filter(c => c.isAvailable && (searchCity === "الكل" ? c.city === "الجزائر العاصمة" : c.city === searchCity));

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

          <div className="mt-3 text-right border-t border-zinc-900/80 pt-2 flex justify-end items-baseline">
            <div className="text-[12.5px] font-black text-[#5c61ec] leading-none font-sans">
              {car.pricePerDay.toLocaleString()} دج<span className="text-[10px] text-zinc-500 font-bold font-sans"> / اليوم</span>
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
          
          {/* City Location Badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/50 backdrop-blur-md text-[8.5px] text-zinc-200 px-2 py-0.5 rounded-[6px] font-black flex items-center gap-0.5 border border-white/5 shadow-md">
            <MapPin className="w-2.5 h-2.5 text-rose-500" />
            <span className="font-sans leading-none">{carData.city}</span>
          </div>
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
              <span className="text-[9.5px] font-bold text-zinc-500">/ اليوم</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPremiumFavoritesStyleCarCard = (carData: Car) => {
    const isCarFav = favorites.includes(carData.id);
    return (
      <div 
        key={`premium_cat_${carData.id}`}
        onClick={() => setSelectedCar(carData)}
        className="bg-[#141416] rounded-[24px] overflow-hidden border border-zinc-900 shadow-xl text-right cursor-pointer hover:border-zinc-850 hover:bg-[#161619] transition-all duration-200 block relative w-full mb-4 group"
        dir="rtl"
      >
        <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden">
          <img 
            src={carData.image} 
            alt={`${carData.brand} ${carData.model}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(carData.id);
            }}
            className="absolute top-4 right-4 w-[40px] h-[40px] rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/85 active:scale-90 transition-all cursor-pointer shadow-lg z-10"
            title="حفظ في المفضلة"
          >
            <Heart className={`w-[18px] h-[18px] stroke-[2.5] ${isCarFav ? "fill-rose-500 text-rose-500" : "text-white"}`} />
          </button>

          {/* City Location Badge */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-[10px] text-zinc-200 px-3 py-1 rounded-[8px] font-black flex items-center gap-1 border border-white/5 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-sans leading-none">{carData.city}</span>
          </div>
        </div>

        <div className="p-5 text-right flex flex-col gap-1.5 bg-[#141416] group-hover:bg-[#161619] transition-colors">
          <div className="flex justify-between items-start">
            <h4 className="text-[17px] font-black text-white tracking-snug text-right leading-snug">
              {carData.brand} {carData.model}
            </h4>
            <div className="text-left flex flex-col items-end">
              <span className="text-[16px] font-black text-[#5c61ec] leading-none">{carData.pricePerDay.toLocaleString()} دج</span>
              <span className="text-[9.5px] text-zinc-500 font-bold block mt-1">/ اليوم</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium justify-start mt-1.5" dir="rtl">
            <span>{carData.year}</span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-[#5c61ec] font-extrabold leading-none flex items-center gap-0.5 select-none text-[11px]">
              {carData.rating.toFixed(1).replace(".", ",")}
              <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
            </span>
            <span className="text-zinc-400">({carData.reviewsCount})</span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-purple-400 font-semibold flex items-center gap-1 text-[11px]">
              <Award className="w-3.5 h-3.5 text-purple-400 fill-purple-400/10" />
              <span>مضيف متميز</span>
            </span>
          </div>

          <div className="border-t border-zinc-900/40 mt-3 pt-2.5 max-w-full">
            <div className="text-left flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-bold">حجز فوري آمن ومؤكد في ثوانٍ</span>
              <span className="text-[12px] font-bold text-white group-hover:text-[#8b8ff7] hover:underline transition-all">
                عرض التفاصيل والحجز ⚡
              </span>
            </div>
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
          setSelectedAgency(agency);
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

  const getHostDetails = () => {
    if (!selectedCar) return null;
    if (selectedCar.agencyId) {
      const found = INITIAL_AGENCIES.find(a => a.id === selectedCar.agencyId);
      if (found) return found;
    }
    // Default fallback or individual host
    return {
      id: selectedCar.hostId || "host_guillermo",
      isHost: true,
      name: selectedCar.hostName || selectedCar.agencyName || "Guillermo",
      logo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      rating: 5.0,
      reviewsCount: 611,
      city: selectedCar.city,
      address: `${selectedCar.city}، الجزائر`,
      phone: "0550 00 11 22",
      verified: true,
      banner: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
      carsCount: 3,
      about: "مستضيف متميز منذ جويلية 2022. أهتم براحة المستأجر وسرعة تسليم واستلام المركبة ويبذل قصارى جهدي لتلبية الطلبات.",
      languages: "العربية، الفرنسية، الإنجليزية"
    };
  };

  const handleOpenHostProfile = () => {
    const host = getHostDetails();
    if (host) {
      setSelectedAgency(host);
    }
  };

  return (
    <div id="explore-tab-view" className="flex flex-col h-full bg-black text-white select-none relative overflow-hidden">
      
      {/* Scrollable Main Space (Preserves list scroll position and decouples layout overlays from viewport shift) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 flex flex-col relative">

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
              { id: "luxury", label: "أفخم السيارات", icon: Sparkles },
              { id: "wedding", label: "سيارات الزفاف", icon: Crown },
              { id: "suv", label: "ربعية الدفع 4x4", icon: Compass },
              { id: "van", label: "سيارات الفان", icon: Users },
              { id: "Airports", label: "المطارات", icon: Plane },
              { id: "Monthly", label: "كراء شهري", icon: Calendar },
              { id: "Nearby", label: "قريب مني", icon: MapPin }
            ].map((pill) => {
              const isSelected = currentPill === pill.id;
              const IconComponent = pill.icon;
              return (
                <button
                   key={pill.id}
                   onClick={() => {
                     setCurrentPill(pill.id);
                     setSelectedCategory("الكل"); // reset manual filter so we stay in discovery scrolling templates
                     
                     if (pill.id === "الكل") {
                       setSearchCity("الكل");
                       setSearchBrand("");
                       setSelectedTransmission("الكل");
                     } else if (pill.id === "Airports") {
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
                       onAddNotification({
                         id: "not_monthly_pills_" + Date.now(),
                         title: "العروض الشهرية الطويلة 📅",
                         content: "تتصفح فئات الإيجار طويل المدى وبأسعار مفضلة للالتزام الشهري.",
                         type: "system",
                         date: "الآن",
                         read: false
                       });
                     } else if (pill.id === "Nearby") {
                       setSearchCity("الجزائر العاصمة");
                       onAddNotification({
                         id: "not_nearby_pills_" + Date.now(),
                         title: "السيارات القريبة منك 📍",
                         content: "تتصفح حالياً السيارات المتواجدة بالقرب من موقعك الجغرافي بالجزائر العاصمة.",
                         type: "system",
                         date: "الآن",
                         read: false
                       });
                     } else {
                       // Specific categories
                       onAddNotification({
                         id: "not_cat_" + pill.id + "_" + Date.now(),
                         title: `فئة ${pill.label} ✨`,
                         content: `تستعرض أسطول ${pill.label} المتميز والمجهز بأعلى درجات الرفاهية في الجزائر.`,
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
                <span className="absolute inline-flex h-10 w-10 rounded-full bg-purple-500/25 opacity-75" />
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
                          <Award className="w-3.5 h-3.5 text-purple-400" /> مضيف متميز درايف RENT
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
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">متوسط الأسعار اليومية لكراء السيارات ليوم واحد فقط</p>
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
            {(currentPill === "الكل" || currentPill === "luxury") && luxuryCars.length > 0 && (
              <div className="space-y-4 px-1 animate-fade-in duration-300">
                <div className="text-right font-sans" dir="rtl">
                  <div className="flex items-center gap-2 justify-start mb-0.5">
                    <h3 className="text-sm font-black text-white tracking-wide">أفخم السيارات جاهزة للكراء</h3>
                    {isLuxuryBackup && (
                      <span className="bg-[#5c61ec]/20 border border-[#5c61ec]/40 text-[#8b8ff7] text-[8px] px-1.5 py-0.5 rounded-[5px] font-black">خيارات كل الولايات</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">مجموعة حصرية من أحدث السيارات الفاخرة والرياضية لتجربة استثنائية</p>
                </div>
                {currentPill === "الكل" ? (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                    {luxuryCars.map((car) => (
                      <div key={car.id} className="w-[185px] shrink-0">
                        {renderGridCarCard(car)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 py-1" dir="rtl">
                    {luxuryCars.map((car) => renderPremiumFavoritesStyleCarCard(car))}
                  </div>
                )}
              </div>
            )}

            {/* 4. سيارات الزفاف */}
            {(currentPill === "الكل" || currentPill === "wedding") && weddingCars.length > 0 && (
              <div className="space-y-4 px-1 animate-fade-in duration-300 mt-6">
                <div className="text-right font-sans" dir="rtl">
                  <div className="flex items-center gap-2 justify-start mb-0.5">
                    <h3 className="text-sm font-black text-white tracking-wide">سيارات الزفاف الفخمة</h3>
                    {isWeddingBackup && (
                      <span className="bg-[#5c61ec]/20 border border-[#5c61ec]/40 text-[#8b8ff7] text-[8px] px-1.5 py-0.5 rounded-[5px] font-black">خيارات كل الولايات</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">اجعل ليلة عمرك ذكرى لا تُنسى بأفخم مواكب وأعراس بأسلوب راقٍ</p>
                </div>
                {currentPill === "الكل" ? (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                    {weddingCars.map((car) => (
                      <div key={car.id} className="w-[185px] shrink-0">
                        {renderGridCarCard(car)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 py-1" dir="rtl">
                    {weddingCars.map((car) => renderPremiumFavoritesStyleCarCard(car))}
                  </div>
                )}
              </div>
            )}

            {/* 5. سيارات رباعية الدفع 4X4 */}
            {(currentPill === "الكل" || currentPill === "suv") && suvCars.length > 0 && (
              <div className="space-y-4 px-1 animate-fade-in duration-300 mt-6">
                <div className="text-right font-sans" dir="rtl">
                  <div className="flex items-center gap-2 justify-start mb-0.5">
                    <h3 className="text-sm font-black text-white tracking-wide">سيارات رباعية الدفع 4X4</h3>
                    {isSuvBackup && (
                      <span className="bg-[#5c61ec]/20 border border-[#5c61ec]/40 text-[#8b8ff7] text-[8px] px-1.5 py-0.5 rounded-[5px] font-black">خيارات كل الولايات</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">قوة جبارة في المدينة ومستعدة لكافة المغامرات الجبلية والاستكشافات</p>
                </div>
                {currentPill === "الكل" ? (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                    {suvCars.map((car) => (
                      <div key={car.id} className="w-[185px] shrink-0">
                        {renderGridCarCard(car)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 py-1" dir="rtl">
                    {suvCars.map((car) => renderPremiumFavoritesStyleCarCard(car))}
                  </div>
                )}
              </div>
            )}

            {/* 6. سيارات الفان جاهزة للتخييم */}
            {(currentPill === "الكل" || currentPill === "van") && vanCars.length > 0 && (
              <div className="space-y-4 px-1 animate-fade-in duration-300 mt-6">
                <div className="text-right font-sans" dir="rtl">
                  <div className="flex items-center gap-2 justify-start mb-0.5">
                    <h3 className="text-sm font-black text-white tracking-wide">سيارات الفان العائلية والتخييم</h3>
                    {isVanBackup && (
                      <span className="bg-[#5c61ec]/20 border border-[#5c61ec]/40 text-[#8b8ff7] text-[8px] px-1.5 py-0.5 rounded-[5px] font-black">خيارات كل الولايات</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">عش متعة الترحال البري الطبيعي والاستيقاظ ببهجة في سيارات فان مجهزة بالكامل</p>
                </div>
                {currentPill === "الكل" ? (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
                    {vanCars.map((car) => (
                      <div key={car.id} className="w-[185px] shrink-0">
                        {renderGridCarCard(car)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 py-1" dir="rtl">
                    {vanCars.map((car) => renderPremiumFavoritesStyleCarCard(car))}
                  </div>
                )}
              </div>
            )}

            {/* Airports category selection rendering */}
            {currentPill === "Airports" && (
              <div className="space-y-4 px-1 animate-fade-in duration-300" dir="rtl">
                <div className="flex justify-between items-center text-right font-sans">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase">التوصيل للمطارات الجزائريّة ✈️</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">توصيل متميز ومباشر إلى مطار هواري بومدين، قسنطينة أو وهران وباقي ولايات الجزائر</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 py-1" dir="rtl">
                  {luxuryCars.map((car) => renderPremiumFavoritesStyleCarCard(car))}
                </div>
              </div>
            )}

            {/* Monthly category selection rendering */}
            {currentPill === "Monthly" && (
              <div className="space-y-4 px-1 animate-fade-in duration-300" dir="rtl">
                <div className="flex justify-between items-center text-right font-sans">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase">إيجارات شهريّة واشتراكات 📅</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">خصومات هائلة مخصصة لإيجار السيارات لعدة أسابيع متتالية</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 py-1" dir="rtl">
                  {vanCars.map((car) => renderPremiumFavoritesStyleCarCard(car))}
                </div>
              </div>
            )}

            {/* Nearby category selection rendering - Added & fully operational */}
            {currentPill === "Nearby" && (
              <div className="space-y-4 px-1 animate-fade-in duration-300" dir="rtl">
                <div className="flex justify-between items-center text-right font-sans">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase">سيارات قريبة منك 📍</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">سيارات ممتازة جاهزة للاستلام الفوري في ولايتك</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 py-1" dir="rtl">
                  {nearbyCars.map((car) => renderPremiumFavoritesStyleCarCard(car))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      </div>

      {/* Renders Selected Car Detail Modal */}
      <AnimatePresence>
        {selectedCar && (
          <div id="car-details-overlay" className="absolute inset-0 z-[100] bg-black overflow-hidden flex flex-col justify-start items-center">
            
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
                  className="w-11 h-11 rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer pointer-events-auto"
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
                            <div 
                              onClick={() => setShowCustomDatePicker(true)}
                              className="flex items-start justify-between gap-4 text-right cursor-pointer group/dates"
                            >
                              <div className="flex items-start gap-4 flex-1 select-none">
                                <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                                  {/* A clean calendar-grid icon representing dates */}
                                  <Calendar className="w-6 h-6 text-white group-hover/dates:text-[#5c61ec] transition-colors" />
                                </div>
                                <div className="space-y-1 text-right">
                                  <h4 className="text-[15px] font-bold text-white leading-none group-hover/dates:text-[#5c61ec] transition-colors">تواريخ الإيجار</h4>
                                  <div className="text-[15px] text-zinc-400 leading-normal font-sans text-right">
                                    <p>{formatTripDate(startDate, pickupTime)}</p>
                                    <p>{formatTripDate(endDate, returnTime)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Rounded pencil button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCustomDatePicker(true);
                                }}
                                className="w-11 h-11 rounded-[14px] bg-[#1c1c1e] border border-[#27272a]/70 hover:bg-[#242427] flex items-center justify-center text-zinc-300 hover:text-white transition-all shrink-0 mt-1 cursor-pointer"
                                title="تعديل التواريخ"
                              >
                                <Pencil className="w-[18px] h-[18px] text-zinc-305" />
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
                                    {pickupOption === "car_location" && (
                                      <>
                                        <p className="text-[15px] text-zinc-400 leading-snug">موقع السيارة ({selectedCar.city})</p>
                                        <p className="text-[13px] text-zinc-500 leading-normal">سنرسل لك العنوان الدقيق بمجرد حجز رحلتك.</p>
                                      </>
                                    )}
                                    {pickupOption === "airport" && (
                                      <>
                                        <p className="text-[15px] text-zinc-400 leading-snug">مطار الجزائر الدولي</p>
                                        <p className="text-[13px] text-zinc-500 leading-normal">مطار هواري بومدين الدولي، الدار البيضاء، الجزائر</p>
                                      </>
                                    )}
                                    {pickupOption === "delivery" && (
                                      <>
                                        <p className="text-[15px] text-zinc-400 leading-snug">توصيل السيارة إليّ</p>
                                        <p className="text-[13px] text-zinc-500 leading-normal">{customDeliveryAddress || "لم يتم تحديد عنوان التوصيل بعد"}</p>
                                      </>
                                    )}
                                    
                                    <button 
                                      onClick={() => setShowLocationPicker(true)}
                                      className="text-xs font-semibold text-[#5c61ec] hover:text-[#7479ff] flex items-center gap-1.5 mt-2.5 transition-colors cursor-pointer bg-transparent border-none text-right p-0"
                                    >
                                      <span>تغيير موقع الاستلام والإرجاع</span>
                                      <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 inline" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Rounded pencil button */}
                              <button
                                onClick={() => {
                                  setShowLocationPicker(true);
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
                              <span className="text-[15.5px] font-bold text-white">تأمين حماية شامل بالتعاقد مع درايف RENT للتكافل</span>
                            </div>
                            <Info className="w-5 h-5 text-zinc-400 stroke-[2] shrink-0 cursor-pointer hover:text-white transition-colors" />
                          </div>
                        </div>

                        {/* Thick Divider: Section 8 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Vehicle features segment */}
                        <div className="space-y-6 text-right" id="replica-vehicle-features">
                          <h2 className="text-[20px] font-extrabold text-white text-right tracking-tight">ميزات ومواصفات السيارة</h2>
                          
                          <div className="space-y-3">
                            <h3 className="text-[15.5px] font-bold text-white text-right">وسائل الأمان</h3>
                            <div className="space-y-2.5 text-[14px] text-zinc-300 font-medium font-sans text-right">
                              <p>نظام دفع رباعي مستمر (AWD)</p>
                              <p>كاميرا خلفية للمساعدة والاصطفاف</p>
                              <p>نظام ذكي لمساعدة الكبح</p>
                              <p>إطارات مخصصة لجميع التضاريس والظروف</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <h3 className="text-[15.5px] font-bold text-white text-right">الاتصال والميديا</h3>
                            <div className="space-y-2.5 text-[14px] text-zinc-300 font-medium font-sans text-right">
                              <p>أندرويد أوتو (Android Auto)</p>
                              <p>أبل كاربلاي (Apple CarPlay)</p>
                              <p>منفذ صوتي AUX</p>
                              <p>اتصال بلوتوث لاسلكي</p>
                            </div>
                          </div>

                          <button 
                            onClick={() => setShowFeaturesModal(true)}
                            className="w-full mt-4 py-3 px-4 bg-[#1c1c1e] hover:bg-[#242427] border border-[#27272a]/70 rounded-[14px] text-[15px] font-bold text-white transition-all text-center cursor-pointer active:scale-98"
                          >
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

                          <button 
                            onClick={() => {
                              setLoadedReviews(INITIAL_REVIEWS_LIST);
                              setShowReviewsModal(true);
                              setHasMoreReviews(true);
                            }}
                            className="w-full mt-2 py-3.5 px-4 bg-[#1c1c1e] hover:bg-[#242427] border border-[#27272a]/70 rounded-[14px] text-[15.5px] font-bold text-white transition-all text-center cursor-pointer active:scale-[0.98]"
                          >
                            {t("مشاهدة كافة التعليقات والتقييمات")}
                          </button>
                        </div>

                        {/* Thick Divider: Section 11 separator */}
                        <div className="mx-[-1.25rem] bg-[#1c1c20] h-3 border-t border-b border-black/55" />

                        {/* Hosted By Segment */}
                        <div className="space-y-6 text-right" id="replica-hosted-by">
                          <h2 className="text-[22px] font-bold text-white text-right tracking-tight">المضيف وصاحب السيارة</h2>
                          
                          {/* Host Profile Info */}
                          {(() => {
                            const host = getHostDetails();
                            if (!host) return null;
                            return (
                              <div 
                                onClick={handleOpenHostProfile}
                                className="flex items-center gap-5 justify-start cursor-pointer bg-[#0f0f12]/30 hover:bg-[#1c1c1e]/60 border border-transparent hover:border-zinc-800/45 p-3 rounded-2xl transition-all duration-150 active:scale-[0.98] select-none"
                              >
                                {/* Avatar with absolute Star badge overlay */}
                                <div className="relative shrink-0">
                                  <div className="w-[84px] h-[84px] rounded-full overflow-hidden border border-zinc-800">
                                    <img 
                                      src={host.logo} 
                                      alt={host.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  {/* Floating 5,0 Star badge with shadow */}
                                  <div className="absolute -bottom-1.5 -left-1 bg-[#1c1c1e] border border-zinc-800/80 py-1 px-2.5 text-[12px] rounded-full flex items-center justify-center gap-1 shadow-lg select-none leading-none z-10 font-bold text-white font-sans">
                                    <span>{host.rating.toFixed(1).replace(".", ",")}</span>
                                    <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec] shrink-0" />
                                  </div>
                                </div>

                                {/* Name and statistics */}
                                <div className="space-y-1.5 text-right flex-1">
                                  <h3 className="text-[18px] font-bold text-white leading-none hover:text-purple-400 transition-colors flex items-center justify-end gap-1.5">
                                    <span>{host.name}</span>
                                    {host.verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                  </h3>
                                  <p className="text-[14px] text-zinc-400 font-semibold font-sans">
                                    {host.reviewsCount} رحلة كراء ناجحة <span className="text-zinc-650">•</span> انضم في جويليّة 2022
                                  </p>
                                  <span className="inline-block text-[11px] text-[#5c61ec] font-bold bg-[#1c1c20] hover:bg-[#242428] px-2.5 py-1 rounded-full border border-purple-900/15 mt-1 transition-colors">
                                    عرض الملف الشخصي للمضيف 🏢
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Thin custom divider line */}
                          <div className="border-t border-[#1c1c1e] my-5" />

                          {/* All-Star Host features with rosette badge */}
                          {(() => {
                            const host = getHostDetails();
                            const hostName = host?.name || "Guillermo";
                            return (
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
                                    المضيفون المميزون مثل {hostName} هم من بين الأفضل تقييماً والأكثر ثقةً وموثوقيةً في المنصة لتأمين رحلة خالية من المتاعب.
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
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
                            <h3 className="text-[15.5px] font-bold text-white text-right">تعبئة مسبقة للغاز والوقود</h3>
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
                      <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-tight">سعر الكراء اليومي</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-base font-black text-zinc-100">{selectedCar.pricePerDay.toLocaleString()} دج</span>
                        <span className="text-[10px] text-[#888c94] font-bold uppercase tracking-wide">
                          / اليوم الواحد فقط
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
          <div id="booking-sheet-overlay" className="absolute inset-0 z-[110] bg-black text-white flex flex-col overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
            
            {/* Header Mirroring iPhone Checkout Screen precisely */}
            <div className="sticky top-0 bg-[#000000] border-b border-zinc-900 h-16 flex items-center px-4 justify-between z-30 shrink-0 select-none">
              <button
                onClick={() => setShowBookingSheet(false)}
                className="w-10 h-10 rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer"
                title="Back"
              >
                {isRtl ? <ArrowRight className="w-5 h-5 text-zinc-200" /> : <ArrowLeft className="w-5 h-5 text-zinc-200" />}
              </button>
              <h3 className="text-[17px] font-black text-white tracking-wide font-sans text-center flex-1 pr-10">
                {isRtl ? "تأكيد واستكمال الحجز" : "Checkout"}
              </h3>
            </div>

            {/* Scrollable form content area */}
            <div className={`flex-1 p-5 pb-24 overflow-y-auto no-scrollbar space-y-5 select-none ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
              
              {bookingSuccess ? (
                <div className="py-16 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-indigo-950/50 text-indigo-400 rounded-full flex items-center justify-center animate-bounce border border-indigo-800 shadow-xl shadow-indigo-950/50">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                  <h4 className="text-xl font-black text-white font-sans">
                    {language === "ar" ? "تم تأكيد الحجز بنجاح! 🎉" : "Booking Confirmed! 🎉"}
                  </h4>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed text-center font-sans">
                    {language === "ar" 
                      ? "تم خصم قيمة الكراء من محفظتك وتوليد تذكرة الحجز الخاصة بك في صفحة الرحلات الحالية." 
                      : "Your payment was processed successfully. You can find your booking receipt in your Trips tab."}
                  </p>
                  <div className={`bg-[#0b0b0d] border border-zinc-900 p-4 rounded-xl max-w-xs w-full space-y-2 mt-4 shadow-xl ${isRtl ? "text-right" : "text-left"}`}>
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-zinc-500">{isRtl ? "رمز الحجز:" : "Booking Code:"}</span>
                      <span className="font-extrabold text-indigo-400 font-mono">TR-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-zinc-500">{isRtl ? "المركبة:" : "Vehicle:"}</span>
                      <span className="font-extrabold text-white">{selectedCar.brand} {selectedCar.model}</span>
                    </div>
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-zinc-500">{isRtl ? "المدة:" : "Period:"}</span>
                      <span className="font-extrabold text-indigo-300 font-mono">{calculatedDays} {isRtl ? "أيام" : "days"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Car Quick Preview summary matching screenshot */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <h4 className="text-2xl font-black text-white leading-tight font-sans tracking-tight">
                        {selectedCar.brand} {selectedCar.model}
                      </h4>
                      {/* Sub-details line: year, rating, trips */}
                      <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 font-sans leading-none pt-1">
                        <span>{selectedCar.year}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-white font-black">{selectedCar.rating.toFixed(2)}</span>
                        <Star className="w-4 h-4 text-[#5c61ec] fill-[#5c61ec] stroke-none" />
                        <span className="text-zinc-500">({selectedCar.reviewsCount} {isRtl ? "رحلة" : "trips"})</span>
                      </div>
                    </div>

                    {/* Compact high fidelity image thumbnail mimicking right-hand card */}
                    <div className="w-[110px] h-[72px] shrink-0 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 shadow-md">
                      <img
                        src={selectedCar.image}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Dates display row matching grid layout of Screenshot */}
                  <div className="flex items-start gap-4 pt-2 border-t border-zinc-900/60">
                    <div className="w-10 h-10 flex items-center justify-center bg-zinc-950 border border-zinc-900/80 rounded-xl text-zinc-400 shrink-0">
                      <Calendar className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}>
                      <p className="text-sm font-bold text-zinc-100 font-sans">
                        {formatCheckoutDate(startDate, pickupTime, false)}
                      </p>
                      <p className="text-sm font-bold text-zinc-400 font-sans">
                        {formatCheckoutDate(endDate, returnTime, false)}
                      </p>
                    </div>
                  </div>

                  {/* Pick up location row matching location layout of Screenshot */}
                  <div className="flex items-start gap-4 pb-2">
                    <div className="w-10 h-10 flex items-center justify-center bg-zinc-950 border border-zinc-900/80 rounded-xl text-zinc-400 shrink-0">
                      <MapPin className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className={`space-y-0.5 ${isRtl ? "text-right" : "text-left"}`}>
                      <p className="text-sm font-bold text-zinc-150 font-sans leading-tight">
                        {isRtl ? `مطار ${selectedCar.city} الدولي` : `${selectedCar.city} International Airport`}
                      </p>
                      <p className="text-[10px] font-black text-zinc-500 font-sans uppercase tracking-wide">
                        {isRtl ? "موقع استلام وتسليم السيارة" : "Pick-up & Drop-off Location"}
                      </p>
                    </div>
                  </div>

                  {/* Wide Section Thick Divider mirroring native screenshot partitions */}
                  <div className="-mx-5 h-2 bg-[#0c0c0e] border-y border-zinc-900/40" />

                  {/* Primary Driver Section */}
                  <div className="space-y-4 pt-1">
                    <h3 className="text-2xl font-black text-white tracking-tight font-sans">
                      {isRtl ? "بيانات السائق الرئيسي" : "Primary driver"}
                    </h3>

                    {/* Country Code & Phone Inputs Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 font-sans">{isRtl ? "رمز الدولة" : "Country code"}</label>
                        <div className="relative">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-zinc-950 border border-zinc-900 text-white text-sm font-bold rounded-xl px-3 py-3 w-full appearance-none outline-none focus:border-zinc-700 cursor-pointer"
                          >
                            <option value="+213">+213</option>
                          </select>
                          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-500">
                            <span className="text-[10px]">▼</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 font-sans">{isRtl ? "رقم الهاتف المحمول" : "Mobile number"}</label>
                        <input
                          type="tel"
                          placeholder={isRtl ? "أدخل رقم الهاتف" : "Mobile number"}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className={`bg-zinc-950 border border-zinc-900 text-white text-sm rounded-xl px-4 py-3 w-full outline-none focus:border-zinc-750 font-mono tracking-wider ${isRtl ? "text-right" : "text-left"}`}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-1">
                      {isRtl 
                        ? "بتزويدنا برقم هاتفك، فإنك توافق على تلقي رسائل نصية آلية بخصوص تحديثات الرحلة أو معاملات حسابك." 
                        : "By providing a phone number, you consent to receive automated text messages with trip or account updates."}
                    </p>

                    {/* Driver Names Input fields */}
                    <div className="flex flex-col space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-zinc-400 font-sans">
                        {isRtl ? "الاسم الشخصي (كما هو في رخصة السياقة)" : "First name on driver's license"}
                      </label>
                      <input
                        type="text"
                        value={driverFirstName}
                        onChange={(e) => setDriverFirstName(e.target.value)}
                        className={`bg-zinc-950 border border-zinc-900 text-white text-sm rounded-xl px-4 py-3 w-full outline-none focus:border-zinc-750 ${isRtl ? "text-right" : "text-left"}`}
                        placeholder={isRtl ? "الاسم الأول" : "First name"}
                      />
                      <p className="text-xs text-zinc-400 leading-tight font-sans mt-0.5">
                        {isRtl ? "يمكنك إضافة اسم مستعار مفضل من خلال حسابك لاحقاً." : "You can add a preferred name through your Account later."}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-zinc-400 font-sans">
                        {isRtl ? "اللقب / اسم العائلة (كما هو في رخصة السياقة)" : "Last name on driver's license"}
                      </label>
                      <input
                        type="text"
                        value={driverLastName}
                        onChange={(e) => setDriverLastName(e.target.value)}
                        className={`bg-zinc-950 border border-zinc-900 text-white text-sm rounded-xl px-4 py-3 w-full outline-none focus:border-zinc-750 ${isRtl ? "text-right" : "text-left"}`}
                        placeholder={isRtl ? "اللقب / اسم العائلة" : "Last name"}
                      />
                    </div>

                    {/* Driver Age Field Selector */}
                    <div className="flex flex-col space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-zinc-400 font-sans">{isRtl ? "العمر" : "Age"}</label>
                      <div className="relative">
                        <select
                          value={driverAge}
                          onChange={(e) => setDriverAge(Number(e.target.value))}
                          className="bg-zinc-950 border border-zinc-900 text-white text-sm font-bold rounded-xl px-3 py-3 w-full appearance-none outline-none focus:border-zinc-750 cursor-pointer"
                        >
                          {Array.from({ length: 38 }).map((_, i) => {
                            const val = i + 18;
                            return (
                              <option key={val} value={val}>
                                {val === 55 ? "55+" : val}
                              </option>
                            );
                          })}
                        </select>
                        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-500">
                          <span className="text-[10px]">▼</span>
                        </div>
                      </div>
                    </div>

                    {/* Native Separator */}
                    <div className="-mx-5 h-2 bg-[#0c0c0e] border-y border-zinc-900/40 my-4" />

                    {/* Cost Summary Section (Image 1) */}
                    <div className="space-y-4 font-sans select-none block-summary">
                      <h3 className="text-[17px] font-extrabold text-white tracking-tight">
                        {isRtl ? "ملخص الدفع والرسوم" : "Summary"}
                      </h3>

                      <div className="space-y-3 pt-1">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-300 font-medium underline decoration-zinc-700 decoration-dashed underline-offset-4 cursor-pointer hover:text-white transition-all">
                            {isRtl ? "المجموع الفرعي" : "Subtotal"}
                          </span>
                          <span className="text-zinc-100 font-bold font-mono">
                            {isRtl ? `${priceBeforeFees.toLocaleString()} دج` : `${priceBeforeFees.toLocaleString()} DZD`}
                          </span>
                        </div>

                        {/* Sales tax */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-300 font-medium underline decoration-zinc-700 decoration-dashed underline-offset-4 cursor-pointer hover:text-white transition-all">
                            {isRtl ? "مستحقات الخدمة والضريبة" : "Sales tax"}
                          </span>
                          <span className="text-zinc-100 font-bold font-mono">
                            {isRtl ? `${platformFees.toLocaleString()} دج` : `${platformFees.toLocaleString()} DZD`}
                          </span>
                        </div>

                        {/* Distance included */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-300 font-medium pb-px">
                            {isRtl ? "المسافة المسموح بها" : "Distance included"}
                          </span>
                          <span className="text-zinc-100 font-bold font-mono">
                            {isRtl ? `${(calculatedDays * 350).toLocaleString()} كلم` : `${(calculatedDays * 350).toLocaleString()} km`}
                          </span>
                        </div>

                        {/* Solid Divider */}
                        <div className="border-t border-zinc-900 my-1" />

                        {/* Trip total */}
                        <div className="flex justify-between items-center text-[15.5px] font-bold">
                          <span className="text-white font-extrabold">
                            {isRtl ? "إجمالي كراء الرحلة" : "Trip total"}
                          </span>
                          <span className="text-white font-black font-mono">
                            {isRtl ? `${finalTotalPrice.toLocaleString()} دج` : `${finalTotalPrice.toLocaleString()} DZD`}
                          </span>
                        </div>

                        {/* Refundable deposit */}
                        <div className="flex justify-between items-start text-sm pt-0.5">
                          <div className="space-y-0.5">
                            <span className="text-zinc-300 font-medium underline decoration-zinc-700 decoration-dashed underline-offset-4 cursor-pointer hover:text-white transition-all block">
                              {isRtl ? "مبلغ التأمين المسترد" : "Refundable deposit"}
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium font-sans block">
                              {isRtl ? `يُسترجع تلقائياً بحلول ${getRefundedByDate(endDate)}` : `Refunded by ${getRefundedByDate(endDate)}`}
                            </span>
                          </div>
                          <span className="text-zinc-300 font-bold font-mono">
                            {isRtl ? `${Math.round(finalTotalPrice * 0.35).toLocaleString()} دج` : `${Math.round(finalTotalPrice * 0.35).toLocaleString()} DZD`}
                          </span>
                        </div>
                      </div>

                      {/* Custom Callout Box: You're saving ... */}
                      <div className="bg-[#042417]/80 border border-emerald-950/40 rounded-2xl p-4 flex items-start gap-3.5 mt-3 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-emerald-950/90 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <Tag className="w-4.5 h-4.5" />
                        </div>
                        <div className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}>
                          <p className="text-[14.5px] font-extrabold text-[#10b981] leading-none">
                            {isRtl 
                              ? `لقد قمت بتوفير ${Math.round(priceBeforeFees * 0.15).toLocaleString()} دج` 
                              : `You're saving DZD ${Math.round(priceBeforeFees * 0.15).toLocaleString()}`}
                          </p>
                          <p className="text-[11.5px] text-emerald-500/90 font-medium leading-relaxed">
                            {isRtl 
                              ? "تم تطبيق خصم الكراء الأسبوعي وتعرفية الحجز غير المستردة بنجاح." 
                              : "Weekly discount and non-refundable rate applied."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Native Separator */}
                    <div className="-mx-5 h-2 bg-[#0c0c0e] border-y border-zinc-900/40 my-4" />

                    {/* Agreements Checkboxes Section (Image 2) */}
                    <div className="space-y-4 font-sans select-none block-checkboxes">
                      {/* Checkbox 1: Promotions */}
                      <label className="flex items-start gap-3.5 cursor-pointer group">
                        <div className="relative mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={agreeToPromotions}
                            onChange={(e) => setAgreeToPromotions(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-lg transition-all border flex items-center justify-center ${
                            agreeToPromotions 
                              ? "bg-[#5c61ec] border-[#5c61ec] text-white shadow-md shadow-indigo-950/20" 
                              : "border-zinc-700 bg-transparent text-transparent group-hover:border-zinc-500"
                          }`}>
                            <Check className="w-4 h-4 text-white stroke-[3.5]" />
                          </div>
                        </div>
                        <span className="text-zinc-350 text-[13px] font-medium leading-tight group-hover:text-zinc-200 transition-colors">
                          {isRtl 
                            ? "أرسل لي العروض الترويجية والإعلانات الحصرية عبر البريد الإلكتروني" 
                            : "Send me promotions and announcements via email"}
                        </span>
                      </label>

                      {/* Checkbox 2: Terms and conditions */}
                      <label className="flex items-start gap-3.5 cursor-pointer group">
                        <div className="relative mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-lg transition-all border flex items-center justify-center ${
                            agreeToTerms 
                              ? "bg-[#5c61ec] border-[#5c61ec] text-white shadow-md shadow-indigo-950/20" 
                              : "border-zinc-750 bg-transparent text-transparent group-hover:border-zinc-500"
                          }`}>
                            <Check className="w-4 h-4 text-white stroke-[3.5]" />
                          </div>
                        </div>
                        <span className={`text-[13px] leading-tight font-medium transition-colors ${
                          agreeToTerms ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
                        }`}>
                          {isRtl ? (
                            <>
                              أوافق على دفع المبلغ الإجمالي الموضح أعلاه وعلى{" "}
                              <span className="text-indigo-400 hover:underline">شروط الخدمة لـ درايف RENT</span>،{" "}
                              <span className="text-indigo-400 hover:underline">وسياسة الإلغاء</span>، وأقر بـ{" "}
                              <span className="text-indigo-400 hover:underline">سياسة الخصوصية للمنصة</span>.
                            </>
                          ) : (
                            <>
                              I agree to pay the total shown and to the Turo{" "}
                              <span className="text-indigo-400 hover:underline">terms of service</span>,{" "}
                              <span className="text-indigo-400 hover:underline">cancellation policy</span> and I acknowledge the{" "}
                              <span className="text-indigo-400 hover:underline">privacy policy</span>.
                            </>
                          )}
                        </span>
                      </label>
                    </div>

                    {/* Native Separator */}
                    <div className="-mx-5 h-2 bg-[#0c0c0e] border-y border-zinc-900/40 my-4" />

                    {/* Errors overlay */}
                    {bookingError && (
                      <div className={`bg-rose-950/40 text-rose-300 text-xs p-3.5 rounded-xl border border-rose-900/60 leading-relaxed flex flex-col gap-2.5 mt-2 font-sans ${isRtl ? "text-right items-end w-full" : "text-left items-start"}`}>
                        <span className="font-bold">{bookingError}</span>
                        {user.isGuest && onShowLoginSignup && (
                          <button
                            type="button"
                            onClick={onShowLoginSignup}
                            className="bg-[#5c61ec] hover:bg-[#4b50d3] text-white px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 border border-[#6f73f7]/25"
                          >
                            {language === "ar" ? "سجل الدخول / إنشاء حساب جديد" : "Log In / Create Account"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sticky bottom total costs action bar matching the layout */}
            {!bookingSuccess && (
              <div className="sticky bottom-0 inset-x-0 p-4 bg-black border-t border-zinc-900/60 flex justify-between items-center z-20 select-none shrink-0" dir={isRtl ? "rtl" : "ltr"}>
                <div className={`space-y-0.5 font-sans ${isRtl ? "text-right" : "text-left"}`}>
                  <span className="text-lg font-black text-white leading-none block">
                    {language === "ar" ? `${finalTotalPrice.toLocaleString()} دج إجمالي` : `${finalTotalPrice.toLocaleString()} DZD total`}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-bold leading-none block">
                    {isRtl ? "شامل جميع الرسوم والضرائب والوساطة" : "Taxes and fees included"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    // Validations
                    if (!mobileNumber.trim()) {
                      setBookingError(isRtl ? "يرجى توفير رقم هاتف محمول صالح للسائق الرئيسي تلقائياً." : "Please provide a valid mobile number for the primary driver.");
                      return;
                    }
                    if (!driverFirstName.trim()) {
                      setBookingError(isRtl ? "يرجى كتابة الاسم الأول للسائق تماماً كما يظهر في رخصة السياقة." : "Please enter the driver's first name as shown on their license.");
                      return;
                    }
                    if (!driverLastName.trim()) {
                      setBookingError(isRtl ? "يرجى كتابة اللقب/الاسم العائلي للسائق تماماً كما يظهر في رخصة السياقة." : "Please enter the driver's last name as shown on their license.");
                      return;
                    }

                    if (!agreeToTerms) {
                      setBookingError(isRtl ? "يرجى الموافقة على شروط الخدمة وسياسة الإلغاء للمتابعة والتمكن من الدفع." : "Please agree to the terms of service and cancellation policy to proceed.");
                      return;
                    }

                    // Balance, login or driver verification checks from the container
                    if (user.isGuest) {
                      setBookingError(isRtl ? "يرجى تسجيل الدخول أولاً لإتمام الحجز بنجاح." : "Please login or signup to confirm this checkout.");
                      return;
                    }

                    if (!user.isDriverVerified) {
                      setBookingError(isRtl ? "يرجى توثيق رخصة السياقة أولاً من صفحة الملف الشخصي قبل حجز سيارة." : "Please verify your driver license in your profile before checking out.");
                      return;
                    }

                    if (user.walletBalance < finalTotalPrice) {
                      setBookingError(isRtl 
                        ? `رصيدك غير كافٍ. تحتاج إلى ${finalTotalPrice.toLocaleString()} دج، بينما رصيدك الحالي هو ${user.walletBalance.toLocaleString()} دج. يمكنك شحن رصيدك من الملف الشخصي.` 
                        : `Insufficient wallet balance. Total is ${finalTotalPrice.toLocaleString()} DZD but you only have ${user.walletBalance.toLocaleString()} DZD. Please top up in your profile.`
                      );
                      return;
                    }

                    // Otherwise trigger original booking function
                    handleCreateBooking();
                  }}
                  className="px-8 py-3.5 bg-[#5c61ec] hover:bg-[#4d51d5] text-white rounded-[14px] text-xs font-black shadow-lg shadow-purple-950/25 active:scale-95 transition-all text-center cursor-pointer border border-[#6b70ff] font-sans"
                >
                  {isRtl ? "تأكيد الدفع والكراء" : "Continue"}
                </button>
              </div>
            )}
            
          </div>
        )}
      </AnimatePresence>

      {/* Custom Fullscreen Bottom Sheet Date Picker (Trip Dates) */}
      <AnimatePresence>
        {showCustomDatePicker && selectedCar && (() => {
          const timeOptions = [
            "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
            "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
            "19:00", "19:30", "20:00"
          ];

          // June 2026 (starts Monday, 30 days)
          const juneDays = Array.from({ length: 30 }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `2026-06-${dayNum.toString().padStart(2, "0")}`;
            // Mute / Cross out before 13th (past), as well as weekends/custom days as in screenshot
            const isPast = dayNum < 13;
            // Strike-through list matching screenshot exactly: 13, 14, 21-30
            const isCrossed = isPast || dayNum === 13 || dayNum === 14 || (dayNum >= 21 && dayNum <= 30);
            return {
              dayNum,
              dateStr,
              disabled: isCrossed
            };
          });

          // July 2026 (starts Wednesday, 31 days)
          const julyDays = Array.from({ length: 31 }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `2026-07-${dayNum.toString().padStart(2, "0")}`;
            return {
              dayNum,
              dateStr,
              disabled: false
            };
          });

          const handleDayClick = (dateStr: string) => {
            if (!tempStartDate || (tempStartDate && tempEndDate)) {
              setTempStartDate(dateStr);
              setTempEndDate("");
            } else {
              if (dateStr < tempStartDate) {
                setTempStartDate(dateStr);
              } else {
                setTempEndDate(dateStr);
              }
            }
          };

          const handleClearDates = () => {
            setTempStartDate("");
            setTempEndDate("");
          };

          const handleSaveDates = () => {
            if (tempStartDate) setStartDate(tempStartDate);
            if (tempEndDate) {
              setEndDate(tempEndDate);
            } else if (tempStartDate) {
              // Default to start date if end date weren't picked
              setEndDate(tempStartDate);
            }
            setPickupTime(tempPickupTime);
            setReturnTime(tempReturnTime);
            setShowCustomDatePicker(false);
          };

          return (
            <div id="custom-datepicker-overlay" className="absolute inset-0 z-[130] bg-black overflow-hidden flex flex-col">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="bg-black w-full h-full flex flex-col overflow-hidden text-right"
                dir="rtl"
              >
                {/* Header bar mirroring Apple device flow */}
                <div className="h-14 bg-black border-b border-zinc-900 flex items-center px-4 justify-between shrink-0" dir="rtl">
                  <button
                    onClick={() => setShowCustomDatePicker(false)}
                    className="w-10 h-10 rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer"
                    title="الرجوع"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-[17px] font-bold text-white tracking-wide font-sans">تواريخ الإيجار</span>
                  <div className="w-10 h-10" /> {/* Spacer for alignment */}
                </div>

                {/* Display dates selection on top (Mon, 17 Aug etc.) */}
                <div className="bg-[#040405] py-4 px-6 border-b border-zinc-900 select-none shrink-0" dir="rtl">
                  <div className="flex items-center justify-between">
                    {/* Right/Pickup date (Now rightmost in RTL) */}
                    <div className="flex-1 text-center">
                      <div className="text-[17px] font-extrabold text-white tracking-tight font-sans">
                        {tempStartDate ? formatTripDateAR(tempStartDate) : "اختر تاريخ الاستلام"}
                      </div>
                      <div className="text-[12px] text-zinc-450 mt-1 font-sans font-medium">
                        {tempPickupTime ? `الساعة ${tempPickupTime}` : ""}
                      </div>
                    </div>

                    {/* Styled centered white arrow pill pointing LEFT */}
                    <div className="mx-4 flex items-center justify-center text-zinc-500">
                      <ArrowLeft className="w-5 h-5 shrink-0" />
                    </div>

                    {/* Left/Return date */}
                    <div className="flex-1 text-center">
                      <div className="text-[17px] font-extrabold text-white tracking-tight font-sans">
                        {tempEndDate ? formatTripDateAR(tempEndDate) : "اختر تاريخ الإرجاع"}
                      </div>
                      <div className="text-[12px] text-zinc-450 mt-1 font-sans font-medium">
                        {tempReturnTime ? `الساعة ${tempReturnTime}` : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekdays indicator headers starting Monday (RTL layout) */}
                <div className="grid grid-cols-7 text-center py-2.5 bg-[#08080a] text-[11px] text-zinc-500 font-extrabold border-b border-zinc-900 shrink-0 select-none" dir="rtl">
                  <span>ن</span>
                  <span>ث</span>
                  <span>ر</span>
                  <span>خ</span>
                  <span>ج</span>
                  <span>س</span>
                  <span>ح</span>
                </div>

                {/* Scrollable Month Calendar views */}
                <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-8 bg-black pb-12">
                  
                  {/* JUNE 2026 */}
                  <div>
                    <h4 className="text-center text-[13.5px] font-bold text-zinc-400 font-sans tracking-wide mb-4">جوان 2026</h4>
                    <div className="grid grid-cols-7 gap-y-2 text-center">
                      {/* Empty offsets for June Mondaystart (since June 1, 2026 is Monday, offset is 0) */}
                      {juneDays.map(({ dayNum, dateStr, disabled }) => {
                        const isSelStart = tempStartDate === dateStr;
                        const isSelEnd = tempEndDate === dateStr;
                        const isMiddleRange = tempStartDate && tempEndDate && dateStr > tempStartDate && dateStr < tempEndDate;
                        
                        return (
                          <div
                            key={dateStr}
                            onClick={() => !disabled && handleDayClick(dateStr)}
                            className="h-10 flex items-center justify-center relative cursor-pointer"
                          >
                            {/* Connectors */}
                            {isMiddleRange && (
                              <div className="absolute inset-y-1 left-0 right-0 bg-[#5c61ec]/15" />
                            )}
                            {isSelStart && tempEndDate && (
                              <div className="absolute inset-y-1 right-1/2 left-0 bg-[#5c61ec]/15 rounded-r-none" />
                            )}
                            {isSelEnd && tempStartDate && (
                              <div className="absolute inset-y-1 right-0 left-1/2 bg-[#5c61ec]/15 rounded-l-none" />
                            )}

                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[15.5px] font-semibold transition-all relative z-10 ${
                              isSelStart || isSelEnd
                                ? "bg-[#5c61ec] text-white font-black shadow-md shadow-[#5c61ec]/30"
                                : disabled
                                  ? "text-zinc-700 line-through decoration-zinc-800 cursor-not-allowed"
                                  : "text-zinc-200 hover:bg-zinc-900"
                            }`}>
                              {dayNum}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* JULY 2026 */}
                  <div>
                    <h4 className="text-center text-[13.5px] font-bold text-zinc-400 font-sans tracking-wide mb-4">جويلية 2026</h4>
                    <div className="grid grid-cols-7 gap-y-2 text-center">
                      {/* Empty spaces for July Mondaystart (July 1, 2026 is Wednesday, so offset is 2: Mon, Tue are empty) */}
                      <div className="h-10" />
                      <div className="h-10" />

                      {julyDays.map(({ dayNum, dateStr, disabled }) => {
                        const isSelStart = tempStartDate === dateStr;
                        const isSelEnd = tempEndDate === dateStr;
                        const isMiddleRange = tempStartDate && tempEndDate && dateStr > tempStartDate && dateStr < tempEndDate;
                        
                        return (
                          <div
                            key={dateStr}
                            onClick={() => !disabled && handleDayClick(dateStr)}
                            className="h-10 flex items-center justify-center relative cursor-pointer"
                          >
                            {/* Connectors */}
                            {isMiddleRange && (
                              <div className="absolute inset-y-1 left-0 right-0 bg-[#5c61ec]/15" />
                            )}
                            {isSelStart && tempEndDate && (
                              <div className="absolute inset-y-1 right-1/2 left-0 bg-[#5c61ec]/15 rounded-r-none" />
                            )}
                            {isSelEnd && tempStartDate && (
                              <div className="absolute inset-y-1 right-0 left-1/2 bg-[#5c61ec]/15 rounded-l-none" />
                            )}

                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[15.5px] font-semibold transition-all relative z-10 ${
                              isSelStart || isSelEnd
                                ? "bg-[#5c61ec] text-white font-black shadow-md shadow-[#5c61ec]/30"
                                : disabled
                                  ? "text-zinc-700 line-through decoration-zinc-800 cursor-not-allowed"
                                  : "text-zinc-200 hover:bg-zinc-900"
                            }`}>
                              {dayNum}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PICKUP Time horizontal selectors */}
                  <div className="pt-2 select-none" dir="rtl">
                    <h5 className="text-[11.5px] tracking-wide font-extrabold text-zinc-500 mb-2.5 text-right px-1 font-sans">وقت الاستلام</h5>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                      {timeOptions.map((time) => {
                        const isSel = tempPickupTime === time;
                        return (
                          <button
                            key={`pickup-t-${time}`}
                            onClick={() => setTempPickupTime(time)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                              isSel
                                ? "bg-white text-black font-extrabold border border-white"
                                : "bg-[#111113] border border-zinc-900 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RETURN Time horizontal selectors */}
                  <div className="pt-2 select-none" dir="rtl">
                    <h5 className="text-[11.5px] tracking-wide font-extrabold text-zinc-500 mb-2.5 text-right px-1 font-sans">وقت الإرجاع</h5>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                      {timeOptions.map((time) => {
                        const isSel = tempReturnTime === time;
                        return (
                          <button
                            key={`return-t-${time}`}
                            onClick={() => setTempReturnTime(time)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                              isSel
                                ? "bg-white text-black font-extrabold border border-white"
                                : "bg-[#111113] border border-zinc-900 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer with Clear & Save buttons */}
                <div className="bg-black border-t border-zinc-900 px-6 py-4 flex items-center justify-between shrink-0" dir="rtl">
                  <button
                    onClick={handleSaveDates}
                    className="px-7 py-3 bg-[#5c61ec] hover:bg-[#4d51d9] text-white rounded-xl text-sm font-black active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#5c61ec]/10"
                  >
                    حفظ التواريخ
                  </button>
                  <button
                    onClick={handleClearDates}
                    className="text-zinc-400 hover:text-white font-extrabold text-[15px] cursor-pointer active:scale-95 transition-all p-2"
                  >
                    مسح الاختيار
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
                                        {/* Dynamic Fullscreen Bottom Sheet Location Picker (Arabic Only, RTL) */}
      <AnimatePresence>
        {showLocationPicker && selectedCar && (
          <div id="custom-location-picker-overlay" className="absolute inset-0 z-[130] bg-[#000000] overflow-hidden flex flex-col">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#000000] w-full h-full flex flex-col overflow-hidden text-right"
              dir="rtl"
            >
              {/* Header bar mirroring Apple native device flow */}
              <div className="h-16 bg-[#000000] flex items-center px-4 justify-between shrink-0 select-none border-b border-zinc-900/60" dir="rtl">
                {/* Close Button on the left to match the screenshot visually */}
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="w-10 h-10 rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                {/* Centered Title */}
                <span className="text-[17px] font-bold text-white tracking-wide font-sans">الاستلام والإرجاع</span>
                
                {/* Symmetry spacer */}
                <div className="w-10 h-10 invisible" />
              </div>

              {/* Scrolling Content */}
              <div className="flex-1 overflow-y-auto pb-8 no-scrollbar bg-[#000000]" dir="rtl">
                
                {/* Apple Maps style dark map placeholder */}
                <div className="relative w-full h-[190px] bg-[#0c1221] overflow-hidden border-b border-zinc-900 flex shrink-0 select-none">
                  {/* High-Fidelity Road & Land Grid Vector Map */}
                  <svg className="absolute inset-0 w-full h-full opacity-85" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Land Area with deep dark navy */}
                    <rect width="400" height="200" fill="#0b0e17"/>
                    
                    {/* Custom blue styled bay / water body */}
                    <path d="M -20,220 Q 120,120 220,165 T 420,130 L 422,220 Z" fill="#04162e" fillOpacity="0.8"/>
                    <path d="M -20,220 Q 120,120 220,165 T 420,130" stroke="#003554" strokeWidth="2.5" strokeDasharray="4 4" opacity="0.4"/>
                    
                    {/* Airport Runways / Grid Ground lines */}
                    <path d="M 90,85 L 210,120 M 70,105 L 190,140 M 110,65 L 160,160" stroke="#1c2132" strokeWidth="12" strokeLinecap="round" opacity="0.75"/>
                    <path d="M 90,85 L 210,120 M 70,105 L 190,140" stroke="#ffffff" strokeWidth="1" strokeDasharray="5 4" opacity="0.18"/>

                    {/* Major Highways & Street Lines resembling a real city grid layout */}
                    <path d="M-30,45 Q 110,30 210,65 T 430,55" stroke="#1f2638" strokeWidth="3" fill="none"/>
                    <path d="M-30,55 Q 110,40 210,75 T 430,65" stroke="#003d80" strokeWidth="1" opacity="0.3" fill="none"/>
                    <path d="M-30,160 Q 170,110 290,140 T 430,175" stroke="#1f2638" strokeWidth="2.5" fill="none"/>
                    
                    {/* Subtle grid secondary streets block */}
                    <path d="M15,-10 L 50,210" stroke="#141926" strokeWidth="1.5" fill="none"/>
                    <path d="M290,-10 L 255,210" stroke="#141926" strokeWidth="2" fill="none"/>
                    <path d="M180,-10 Q 220,70 170,210" stroke="#141926" strokeWidth="1.5" fill="none"/>
                    <path d="M330,-10 Q 360,90 320,210" stroke="#141926" strokeWidth="1.5" fill="none"/>

                    {/* Neighborhood Secondary Grid lines */}
                    <path d="M 60,35 Q 140,25 250,5 " stroke="#121622" strokeWidth="1" opacity="0.6"/>
                    <path d="M 80,120 L 350,110" stroke="#121622" strokeWidth="1" opacity="0.6"/>

                    {/* Map text labels */}
                    <text x="160" y="112" fill="#52525b" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="right">مطار الجزائر الدولي</text>
                    <text x="315" y="155" fill="#3f3f46" fontSize="7.5" fontFamily="sans-serif">خليج الجزائر</text>
                  </svg>

                  {/* Highway H1 Shield Badge from screenshot (placed top right) */}
                  <div className="absolute top-[35px] left-[310px] -translate-x-1/2 flex items-center justify-center select-none">
                    <div className="w-[18px] h-[18px] rounded bg-[#0657e6] border border-white flex items-center justify-center shadow-md">
                      <span className="text-white text-[7.5px] font-black tracking-tighter">H1</span>
                    </div>
                  </div>

                  {/* Legal branding exactly matching the Apple Maps styling on screenshot */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white/50 text-[10px] font-semibold tracking-tight select-none">
                    <span className="font-extrabold tracking-tight text-white/95">Maps</span>
                    <span className="text-[9px] text-white/40 underline cursor-pointer hover:text-white/60">Legal</span>
                  </div>

                  {/* Centered Airport Pin with pointer dot and flight icon mimicking screenshot */}
                  <div className="absolute top-[100px] left-[200px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none">
                    {/* Ring Pulse behind */}
                    <span className="absolute inline-flex h-9 w-9 rounded-full bg-[#5c61ec]/25 animate-ping opacity-60" />
                    
                    {/* Circle shape with plane icon resembling screenshot */}
                    <div className="w-8 h-8 rounded-full bg-[#4c1d95] border-[2px] border-white flex items-center justify-center shadow-lg shadow-purple-900/40 relative z-10 transition-transform active:scale-95 cursor-pointer">
                      <Plane className="w-4 h-4 text-white rotate-270" />
                    </div>
                    {/* Pinned map anchor indicator */}
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5 border border-purple-950 shadow-sm z-10" />
                  </div>
                </div>

                {/* OPTIONS SECTION LIST (Pure Continuous Black list layout matching the divisions in the screenshot) */}
                <div className="mt-5 space-y-6 px-1" dir="rtl">

                  {/* SECTION 1: Pickup at car location */}
                  <div className="space-y-0">
                    <div className="px-3 pb-1 ">
                      <h3 className="text-zinc-400 text-[13px] font-normal tracking-wide text-right font-sans">
                        الاستلام في موقع السيارة
                      </h3>
                    </div>
                    
                    {/* Continuous horizontal separator above */}
                    <div className="border-t border-[#1c1c1e]" />
                    
                    {/* Content Item block */}
                    <div 
                      onClick={() => setTempPickupOption("car_location")}
                      className="px-3 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-all cursor-pointer group active:bg-zinc-950"
                    >
                      {/* Address / labels left (in RTL context, on the right next to the right-aligned radio) */}
                      <div className="flex-1 text-right flex items-center gap-3">
                        {/* Radio Checkbox aligned beautifully right */}
                        <div className="shrink-0">
                          <div className={`w-[22px] h-[22px] rounded-full border-[1.8px] flex items-center justify-center transition-all ${
                            tempPickupOption === "car_location" 
                              ? "border-[#5c61ec]" 
                              : "border-[#3a3a3c] hover:border-zinc-500"
                          }`}>
                            {tempPickupOption === "car_location" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#5c61ec]" />
                            )}
                          </div>
                        </div>

                        <span className="text-[15.5px] font-normal text-white tracking-tight font-sans transition-colors group-hover:text-zinc-150">
                          {selectedCar.city}، الجزائر
                        </span>
                      </div>
                    </div>
                    
                    {/* Continuous horizontal separator below */}
                    <div className="border-b border-[#1c1c1e]" />
                    
                    {/* Indented helper subtext mimicking screenshot */}
                    <div className="px-3 pt-1.5 pb-2">
                      <p className="text-[12px] text-zinc-500 tracking-tight leading-relaxed text-right">
                        سنرسل لك العنوان الدقيق بمجرد حجز رحلتك.
                      </p>
                    </div>
                  </div>

                  {/* SECTION 2: Pickup locations */}
                  <div className="space-y-0">
                    <div className="px-3 pb-1">
                      <h3 className="text-zinc-400 text-[13px] font-normal tracking-wide text-right font-sans">
                        مواقع الاستلام
                      </h3>
                    </div>
                    
                    {/* Continuous horizontal separator above */}
                    <div className="border-t border-[#1c1c1e]" />
                    
                    {/* Content Item block */}
                    <div 
                      onClick={() => setTempPickupOption("airport")}
                      className="px-3 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-all cursor-pointer group active:bg-zinc-950"
                    >
                      <div className="flex-1 text-right flex items-start gap-3">
                        {/* Radio Checkbox */}
                        <div className="shrink-0 mt-0.5">
                          <div className={`w-[22px] h-[22px] rounded-full border-[1.8px] flex items-center justify-center transition-all ${
                            tempPickupOption === "airport" 
                              ? "border-[#5c61ec]" 
                              : "border-[#3a3a3c] hover:border-zinc-500"
                          }`}>
                            {tempPickupOption === "airport" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#5c61ec]" />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col text-right">
                          <span className="text-[15px] font-normal text-white tracking-tight font-sans transition-colors group-hover:text-zinc-150">
                            مطار هواري بومدين الدولي
                          </span>
                          <span className="text-[13.5px] text-zinc-500 font-normal mt-0.5 font-sans">
                            المطار
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Continuous horizontal separator below */}
                    <div className="border-b border-[#1c1c1e]" />
                  </div>

                  {/* SECTION 3: Bring the car to me */}
                  <div className="space-y-0">
                    <div className="px-3 pb-1">
                      <h3 className="text-zinc-400 text-[13px] font-normal tracking-wide text-right font-sans">
                        توصيل السيارة إليّ
                      </h3>
                    </div>
                    
                    {/* Continuous horizontal separator above */}
                    <div className="border-t border-[#1c1c1e]" />
                    
                    {/* Content Item block */}
                    <div 
                      onClick={() => setTempPickupOption("delivery")}
                      className="px-3 py-4 flex flex-col text-right hover:bg-zinc-950/40 transition-all cursor-pointer group active:bg-zinc-950"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1 text-right flex items-center gap-3">
                          {/* Radio Checkbox */}
                          <div className="shrink-0">
                            <div className={`w-[22px] h-[22px] rounded-full border-[1.8px] flex items-center justify-center transition-all ${
                              tempPickupOption === "delivery" 
                                ? "border-[#5c61ec]" 
                                : "border-[#3a3a3c] hover:border-zinc-500"
                            }`}>
                              {tempPickupOption === "delivery" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#5c61ec]" />
                              )}
                            </div>
                          </div>

                          <span className="text-[15.5px] font-normal text-white tracking-tight font-sans transition-colors group-hover:text-zinc-150">
                            أدخل عنوان التوصيل المحدد
                          </span>
                        </div>
                      </div>

                      {/* Animated expandable address text field */}
                      <AnimatePresence>
                        {tempPickupOption === "delivery" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden w-full pr-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={tempCustomDeliveryAddress}
                              onChange={(e) => setTempCustomDeliveryAddress(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                }
                              }}
                              placeholder="اكتب العنوان هنا (مثال: باب الزوار، الجزائر العاصمة)"
                              className="w-full mt-3 px-3 py-3 bg-[#111113] text-white border border-[#2c2c2e] rounded-xl text-[13.5px] placeholder:text-zinc-650 focus:outline-none focus:border-[#5c61ec] text-right font-sans"
                              autoFocus
                            />
                            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                              قد تطبق وكالة كراء السيارات رسوماً إضافية طفيفة لقاء خدمة تسليم وتوصيل السيارة لمقر سكنك أو فندقك.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Continuous horizontal separator below */}
                    <div className="border-b border-[#1c1c1e]" />
                  </div>

                </div>
              </div>

              {/* Action Save Button mimicking the exact shape, purple color, and container position of the screenshot */}
              <div className="bg-[#000000] border-t border-zinc-900/60 px-4 py-4 flex items-center justify-center shrink-0" dir="rtl">
                <button
                  onClick={() => {
                    setPickupOption(tempPickupOption);
                    setCustomDeliveryAddress(tempCustomDeliveryAddress);
                    setShowLocationPicker(false);
                  }}
                  className="w-full py-4 bg-[#5c61ec] hover:bg-[#4d51d9] text-white rounded-2xl text-[14.5px] font-black active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#5c61ec]/10 text-center font-sans tracking-wide"
                >
                  حفظ
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete High-Fidelity Vehicle Features Modal (19 Features) - RTL Arabic */}
      <AnimatePresence>
        {showFeaturesModal && selectedCar && (
          <div id="features-sheet-overlay" className="absolute inset-0 z-[120] flex items-center justify-center bg-black overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className="bg-black w-full h-full flex flex-col overflow-hidden text-right"
              dir="rtl"
            >
              {/* Sticky Header inside features modal */}
              <div className="flex items-center px-4 py-4 bg-black border-b border-zinc-900/60 shrink-0 select-none relative" dir="rtl">
                <button
                  onClick={() => setShowFeaturesModal(false)}
                  className="absolute right-4 w-[38px] h-[38px] rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer"
                  aria-label="إغلاق"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
                <div className="w-full text-center">
                  <span className="text-[17px] font-bold text-white tracking-wide font-sans">ميزات ومواصفات السيارة</span>
                </div>
              </div>

              {/* Scrolling List Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7 no-scrollbar bg-black">
                
                {/* Header Title inside list matching screenshots */}
                <h1 className="text-[26px] font-extrabold text-white text-right leading-tight tracking-tight mb-2 font-sans">
                  ميزات السيارة
                </h1>

                {/* Group 1: Safety (وسائل الأمان) */}
                <div className="space-y-3">
                  <h3 className="text-[15.5px] font-bold text-[#5c61ec] text-right border-b border-zinc-900/60 pb-1.5 font-sans">
                    وسائل الأمان
                  </h3>
                  <div className="space-y-2.5 text-[14.5px] text-zinc-400 font-sans text-right font-medium">
                    <p className="hover:text-white transition-colors">• نظام دفع رباعي مستمر (AWD)</p>
                    <p className="hover:text-white transition-colors">• كاميرا خلفية للمساعدة والاصطفاف</p>
                    <p className="hover:text-white transition-colors">• نظام ذكي لمساعدة الكبح (Brake assist)</p>
                    <p className="hover:text-white transition-colors">• إطارات مخصصة لجميع التضاريس والظروف والمناخات</p>
                  </div>
                </div>

                {/* Group 2: Device Connectivity (الاتصال والميديا) */}
                <div className="space-y-3">
                  <h3 className="text-[15.5px] font-bold text-[#5c61ec] text-right border-b border-zinc-900/60 pb-1.5 font-sans">
                    الاتصال والميديا
                  </h3>
                  <div className="space-y-2.5 text-[14.5px] text-zinc-400 font-sans text-right font-medium">
                    <p className="hover:text-white transition-colors">• أندرويد أوتو (Android Auto)</p>
                    <p className="hover:text-white transition-colors">• أبل كاربلاي (Apple CarPlay)</p>
                    <p className="hover:text-white transition-colors">• منفذ صوتي متكامل AUX</p>
                    <p className="hover:text-white transition-colors">• اتصال بلوتوث لاسلكي فائق السرعة</p>
                    <p className="hover:text-white transition-colors">• شاحن USB ذكي عالي السرعة (USB charger)</p>
                    <p className="hover:text-white transition-colors">• مدخل وسائط USB للملفات والمقاطع</p>
                  </div>
                </div>

                {/* Group 3: Convenience (وسائل الراحة والتسهيلات) */}
                <div className="space-y-3">
                  <h3 className="text-[15.5px] font-bold text-[#5c61ec] text-right border-b border-zinc-900/60 pb-1.5 font-sans">
                    وسائل الراحة والتسهيلات
                  </h3>
                  <div className="space-y-2.5 text-[14.5px] text-zinc-400 font-sans text-right font-medium">
                    <p className="hover:text-white transition-colors">• نظام تحديد المواقع العالمي والخرائط GPS</p>
                    <p className="hover:text-white transition-colors">• دخول ذكي بدون مفتاح وإدارة تشغيل آمنة</p>
                  </div>
                </div>

                {/* Group 4: Additional Features (الميزات الإضافية) */}
                <div className="space-y-3">
                  <h3 className="text-[15.5px] font-bold text-[#5c61ec] text-right border-b border-zinc-900/60 pb-1.5 font-sans">
                    الميزات الإضافية
                  </h3>
                  <div className="space-y-2.5 text-[14.5px] text-zinc-400 font-sans text-right font-medium">
                    <p className="hover:text-white transition-colors">• مكيف هواء مركزي عالي الكفاءة</p>
                    <p className="hover:text-white transition-colors">• نظام التنبيه للنقاط العمياء</p>
                    <p className="hover:text-white transition-colors">• عرض المعلومات على الزجاج الأمامي (HUD)</p>
                    <p className="hover:text-white transition-colors">• نظام تثبيت السرعة التكيفي</p>
                    <p className="hover:text-white transition-colors">• شاحن هاتف لاسلكي مدمج</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete High-Fidelity Reviews & Ratings Modal */}
      <AnimatePresence>
        {showReviewsModal && selectedCar && (() => {
          const translateCategory = (cat: string) => {
            if (language === "ar") {
              switch (cat) {
                case "Cleanliness": return "النظافة";
                case "Maintenance": return "الصيانة";
                case "Communication": return "التواصل";
                case "Convenience": return "السهولة";
                case "Accuracy": return "الدقة";
                default: return cat;
              }
            } else if (language === "fr") {
              switch (cat) {
                case "Cleanliness": return "Propreté";
                case "Maintenance": return "Maintenance / Entretien";
                case "Communication": return "Communication";
                case "Convenience": return "Confort / Praticité";
                case "Accuracy": return "Précision";
                default: return cat;
              }
            } else if (language === "amazigh") {
              switch (cat) {
                case "Cleanliness": return "Zeddeg";
                case "Maintenance": return "Maintenance";
                case "Communication": return "Tawa";
                case "Convenience": return "Sahl";
                case "Accuracy": return "Nican";
                default: return cat;
              }
            }
            return cat;
          };

          const getModalTitle = () => {
            if (language === "ar") return "التقييمات والتعليقات";
            if (language === "fr") return "Évaluations et avis";
            if (language === "amazigh") return "Atig d tibratin";
            return "Ratings and reviews";
          };

          const getBasedOnText = () => {
            const count = selectedCar.reviewsCount || 28;
            if (language === "ar") return `بناءً على ${count} تقييماً من المستأجرين`;
            if (language === "fr") return `Basé sur ${count} évaluations de voyageurs`;
            if (language === "amazigh") return `Atig seg ${count} imsafen`;
            return `Based on ${count} guest ratings`;
          };

          const getOverallTitleText = () => {
            const count = selectedCar.reviewsCount || 28;
            if (language === "ar") return `( ${count} تقييم )`;
            if (language === "fr") return `( ${count} évaluations )`;
            if (language === "amazigh") return `( ${count} imedyaten )`;
            return `( ${count} ratings )`;
          };

          const formatReviewsDate = (dateStr: string) => {
            if (language === "ar") return dateStr;
            return dateStr
              .replace("جوان", "Jun")
              .replace("أبريل", "Apr")
              .replace("فبراير", "Feb")
              .replace("ديسمبر", "Dec")
              .replace("نوفمبر", "Nov")
              .replace("أكتوبر", "Oct")
              .replace("سبتمبر", "Sep")
              .replace("أوت", "Aug")
              .replace("جويلية", "Jul")
              .replace("ماي", "May")
              .replace("مارس", "Mar")
              .replace("يناير", "Jan");
          };

          return (
            <div id="reviews-sheet-overlay" className="absolute inset-0 z-[130] flex items-center justify-center bg-black overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
                className="bg-black w-full h-full flex flex-col overflow-hidden text-right"
                dir="rtl"
              >
                {/* Native High-Fidelity Header - Identical to Agency profile page */}
                <div className="flex items-center px-4 py-4 bg-black border-b border-zinc-900/60 shrink-0 select-none relative" dir="rtl">
                  {/* Back button precisely placed on the right like agency page */}
                  <button
                    onClick={() => setShowReviewsModal(false)}
                    className="absolute right-4 w-[38px] h-[38px] rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer"
                    aria-label="رجوع"
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>

                  {/* Title Centered */}
                  <div className="w-full text-center">
                    <span className="text-[17px] font-bold text-white tracking-wide font-sans">
                      {getModalTitle()}
                    </span>
                  </div>
                </div>

                {/* Scrolling List Content */}
                <div 
                  onScroll={handleReviewsScroll}
                  className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar bg-black"
                >
                  {/* Overall Rating & Breakdown Bars exactly like the Turo screenshot */}
                  <div className="flex flex-col">
                    
                    {/* Overall Score Header */}
                    <div className="flex items-center gap-1.5 text-[22px] font-bold text-white mb-5 justify-start">
                      <span className="font-sans">5,0</span>
                      <Star className="w-[18px] h-[18px] text-[#5c61ec] fill-[#5c61ec] inline-block shrink-0" />
                      <span className="text-zinc-400 font-sans text-[15.5px] font-medium tracking-wide">
                        {getOverallTitleText()}
                      </span>
                    </div>

                    {/* Progress bars of category metrics - beautifully aligned under RTL & LTR */}
                    <div className="space-y-3">
                      {[
                        "Cleanliness",
                        "Maintenance",
                        "Communication",
                        "Convenience",
                        "Accuracy",
                      ].map((cat) => (
                        <div
                          key={cat}
                          className="flex items-center justify-between gap-4 text-[13.5px] font-medium leading-relaxed flex-row"
                        >
                          {/* 1st element inside standard flex-row: Category Title (appears right in RTL, left in LTR) */}
                          <span className="text-zinc-300 w-28 shrink-0 text-right font-normal">
                            {translateCategory(cat)}
                          </span>

                          {/* 2nd element: Progress Bar in middle */}
                          <div className="flex-1 h-[5px] bg-[#1c1c24] rounded-full overflow-hidden">
                            <div className="h-full bg-[#5c61ec] rounded-full w-full" />
                          </div>

                          {/* 3rd element: Value (appears left in RTL, right in LTR) */}
                          <span className="text-zinc-350 w-8 shrink-0 text-left font-semibold font-sans">
                            5,0
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Based on ratings text */}
                    <p className="text-[12.5px] text-zinc-500 font-medium mt-3.5 text-right">
                      {getBasedOnText()}
                    </p>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6 pt-5 border-t border-zinc-900/40">
                    <div className="space-y-7">
                      {loadedReviews.map((rev) => {
                        return (
                          <div 
                            key={rev.id} 
                            className="flex gap-4 items-start text-right"
                          >
                            {/* Avatar: 1st child in JSX (appears rightmost in RTL, leftmost in LTR) */}
                            <div className="shrink-0 pt-0.5">
                              {rev.userAvatar ? (
                                <img 
                                  src={rev.userAvatar} 
                                  alt={rev.userName} 
                                  className="w-10 h-10 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#1c1c24] border border-zinc-800/80 flex items-center justify-center text-zinc-400">
                                  <Users className="w-4.5 h-4.5 stroke-[1.5]" />
                                </div>
                              )}
                            </div>

                            {/* Content Column: 2nd child in JSX (appears on the left of the avatar) */}
                            <div className="flex-1 space-y-1.5 text-right">
                              {/* 5 solid purple stars aligned to start (right in RTL) */}
                              <div className="flex gap-0.5 justify-start">
                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 text-[#5c61ec] fill-[#5c61ec]" />
                                ))}
                              </div>

                              {/* Username and Date in lightgray/gray */}
                              <div className="flex items-center gap-2 text-xs font-sans">
                                <span className="font-black text-zinc-100 tracking-wide uppercase">
                                  {rev.userName}
                                </span>
                                <span className="text-zinc-500 font-medium">
                                  {formatReviewsDate(rev.date)}
                                </span>
                              </div>

                              {/* Comment text - beautifully aligned to the right side */}
                              <p className="text-sm text-zinc-350 leading-relaxed font-sans font-medium text-right">
                                {language !== "ar" && rev.englishComment ? rev.englishComment : rev.comment}
                              </p>

                              {/* Optional host response */}
                              {rev.response && (
                                <div className="p-3 bg-[#0a0a0c] border-[#5c61ec] border-r-2 rounded-l-xl rounded-r-md space-y-1 mt-2.5 text-right">
                                  <div className="flex items-center gap-1.5 justify-start flex-row">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#5c61ec]" />
                                    <span className="text-[11px] font-black text-zinc-400">{rev.response.hostName}</span>
                                  </div>
                                  <p className="text-[12px] text-zinc-500 leading-normal font-sans italic text-right">
                                    {rev.response.comment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Loader / footer status */}
                  <div className="pt-4 pb-6 text-center select-none font-sans">
                    {isLoadingMoreReviews ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-2">
                        {/* Custom Uiverse.io Loader by Javierrocadev in Platform Purple (downscaled to 50%) */}
                        <div className="flex flex-row gap-2 justify-center">
                          <div className="w-1 h-1 rounded-full bg-[#5c61ec] animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-1 h-1 rounded-full bg-[#5c61ec] animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-1 h-1 rounded-full bg-[#5c61ec] animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                        <span className="text-zinc-400 text-xs mt-1">{t("جاري تحميل المزيد من التقييمات...")}</span>
                      </div>
                    ) : !hasMoreReviews ? (
                      <p className="text-[11px] text-zinc-500 font-semibold py-2">
                        ✨ {t("تم تحميل كافة التعليقات والتقييمات الموثقة")}
                      </p>
                    ) : (
                      <p className="text-[10.5px] text-zinc-650">
                        {t("اسحب للأعلى لمشاهدة المزيد")}
                      </p>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Complete High-Fidelity Agency & Host Profile Page Modal - RTL Arabic - Opens Full Page Left */}
      <AnimatePresence>
        {selectedAgency && (
          <div id="agency-sheet-overlay" className="absolute inset-0 z-[140] flex items-center justify-center bg-black overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className="bg-black w-full h-full flex flex-col overflow-hidden text-right"
              dir="rtl"
            >
              {/* Native High-Fidelity Header */}
              <div className="flex items-center px-4 py-4 bg-black border-b border-zinc-900/60 shrink-0 select-none relative" dir="rtl">
                {/* Back Button on Right precisely as requested in Arabic RTL */}
                <button
                  onClick={() => setSelectedAgency(null)}
                  className="absolute right-4 w-[38px] h-[38px] rounded-full glass-back-btn flex items-center justify-center text-white cursor-pointer"
                  aria-label="رجوع"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>

                {/* Title Centered */}
                <div className="w-full text-center">
                  <span className="text-[17px] font-bold text-white tracking-wide font-sans">
                    الملف الشخصي للوكالة
                  </span>
                </div>

                {/* Share Button on Left */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    onAddNotification({
                      id: "notif_share_" + Date.now(),
                      title: "تم نسخ الرابط 🔗",
                      content: `تم نسخ رابط الملف الشخصي للوكالة بنجاح.`,
                      type: "system",
                      date: "الآن",
                      read: false
                    });
                  }}
                  className="absolute left-4 p-2 rounded-full hover:bg-zinc-900 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  aria-label="مشاركة"
                >
                  <Share2 className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Scrolling Content Block */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar">
                
                {/* 1. Profile Bio / Header with Avatar */}
                <div className="flex items-center gap-4 pt-4 select-none text-right" dir="rtl">
                  <div className="w-[84px] h-[84px] rounded-full bg-zinc-900 border-2 border-zinc-800/80 overflow-hidden flex items-center justify-center relative shrink-0">
                    {selectedAgency.avatar ? (
                      <img 
                        src={selectedAgency.avatar} 
                        alt={selectedAgency.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-950/40 to-zinc-900 flex items-center justify-center text-zinc-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-zinc-500">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-[26px] font-black tracking-tight text-white font-sans">
                      {selectedAgency.name}
                    </h2>
                  </div>
                </div>

                {/* 2. Standard High-Fidelity Badge Stats Line */}
                <div className="grid grid-cols-3 gap-3 bg-[#0d0d0f]/80 border border-zinc-900/40 p-4 rounded-2xl select-none text-center">
                  {/* Column 1: Successful trips */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white font-sans leading-none">
                      {selectedAgency.isHost ? "182" : "54"}
                    </span>
                    <span className="text-xs text-zinc-400 mt-1.5 font-medium font-sans">رحلة ناجحة</span>
                  </div>
                  
                  {/* Column 2: Ratings */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-white font-sans leading-none">
                        {selectedAgency.rating.toFixed(1)}
                      </span>
                      <Star className="w-4 h-4 fill-[#5c61ec] text-[#5c61ec]" />
                    </div>
                    <span className="text-xs text-zinc-400 mt-1.5 font-medium font-sans">التقييم العام</span>
                  </div>

                  {/* Column 3: Membership longevity */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white font-sans leading-none">
                      {selectedAgency.isHost ? "4 سنوات" : "2 سنتين"}
                    </span>
                    <span className="text-xs text-zinc-400 mt-1.5 font-medium font-sans">الأقدمية</span>
                  </div>
                </div>

                {/* Thick Section Separator */}
                <div className="mx-[-1.5rem] bg-[#141416] h-2.5 border-t border-b border-black/50 my-6" />

                {/* 4. Vehicles Section Header block */}
                <div className="px-6 text-right space-y-1" dir="rtl">
                  <div className="flex items-center gap-2 pb-2 justify-start">
                    <h3 className="text-xl font-bold text-white tracking-tight font-sans">
                      أسطول السيارات المتوفرة ({cars.filter(c => c.agencyId === selectedAgency.id || c.agencyName === selectedAgency.name || c.hostName === selectedAgency.name).length})
                    </h3>
                  </div>
                </div>

                {/* Pills Filters Row */}
                <div className="px-6 py-2 flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth justify-start shrink-0 font-sans" dir="rtl">
                  <div className="flex items-center gap-2 bg-[#141416]/85 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>تاريخ البدء - الانتهاء</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#141416]/85 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 whitespace-nowrap font-sans">
                    <Plane className="w-3.5 h-3.5 text-zinc-400" />
                    <span>توصيل مجاني للمطار</span>
                  </div>
                </div>

                {/* 5. Car Cards Render Loop */}
                <div className="px-6 space-y-6 pt-3">
                  {(() => {
                    const agencyCars = cars.filter(c => c.agencyId === selectedAgency.id || c.agencyName === selectedAgency.name || c.hostName === selectedAgency.name);
                    if (agencyCars.length === 0) {
                      return (
                        <div className="py-8 text-center text-zinc-500 font-bold text-xs select-none">
                          لا توجد سيارات معروضة حالياً لهذا الحساب في الولاية.
                        </div>
                      );
                    }
                    return agencyCars.map(carData => {
                      const discountPct = 12;
                      const originalPrice = carData.pricePerDay * 1.15;
                      const savings = originalPrice - carData.pricePerDay;

                      return (
                        <div
                          key={`agency_fleet_${carData.id}`}
                          onClick={() => {
                            setSelectedAgency(null);
                            setSelectedCar(carData);
                          }}
                          className="bg-black border-none rounded-[20px] overflow-hidden flex flex-col cursor-pointer active:scale-[0.99] transition-all"
                        >
                          {/* Image aspect-ratio matching Tommy design */}
                          <div className="w-full aspect-[16/10] bg-[#141416] rounded-[16px] overflow-hidden shrink-0">
                            <img src={carData.image} alt="" className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                          </div>

                          {/* Info Segment */}
                          <div className="pt-3 pb-2 text-right space-y-1.5 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[19px] font-bold text-white tracking-snug font-sans">{carData.brand} {carData.model} {carData.year}</h4>
                              
                              {/* Rating Line with purple star */}
                              <div className="flex items-center gap-1 text-[13.5px] text-zinc-400 font-medium pt-0.5 font-sans">
                                <span className="font-bold text-white font-sans">{carData.rating.toFixed(1).replace(".", ",")}</span>
                                <Star className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
                                <span className="text-zinc-[500]">({carData.reviewsCount || 3} رحلات)</span>
                              </div>

                              {/* Location and Date Range */}
                              <div className="flex items-center gap-1 text-[13.5px] text-zinc-400 pt-1 font-sans">
                                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                                <span>{carData.city || "الجزائر العاصمة"}</span>
                              </div>
                              
                              <p className="text-[12.5px] text-zinc-500 font-medium font-sans">
                                9 - 16 جويلية
                              </p>
                            </div>

                            {/* Footer block with price */}
                            <div className="flex justify-end items-end pt-3">
                              {/* Dynamic price logic */}
                              <div className="text-right">
                                <div className="flex items-baseline gap-1.5 justify-end font-sans">
                                  <span className="text-white font-extrabold text-base font-sans">{carData.pricePerDay.toLocaleString()} دج</span>
                                  <span className="text-[12.5px] text-zinc-400 font-bold">/ اليوم</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 block pt-0.5 font-sans">سعر اليوم الواحد فقط</span>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* iOS layout-matched "See 32 more cars" button in Arabic */}
                <div className="px-6 pt-3 pb-2 select-none" dir="rtl">
                  <button
                    onClick={() => {
                      onAddNotification({
                        id: "notif_more_cars_" + Date.now(),
                        title: "أسطول الوكالة الكامل 🚗",
                        content: `تم استعراض طرازات إضافية من أسطول كراء هذه الوكالة لمساعدتك على الاختيار الأفضل.`,
                        type: "system",
                        date: "الآن",
                        read: false
                      });
                    }}
                    className="w-full py-4 bg-transparent border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-700 text-white rounded-[14px] text-[15px] font-semibold transition-all active:scale-[0.98] cursor-pointer text-center font-sans tracking-tight"
                  >
                    عرض 32 سيارة أخرى
                  </button>
                </div>

                {/* Thick Section Separator */}
                <div className="mx-[-1.5rem] bg-[#141416] h-2.5 border-t border-b border-black/55 my-6" />

                {/* 6. High-Fidelity Reviews section */}
                <div className="px-6 select-none text-right space-y-4 font-sans">
                  <h3 className="text-xl font-bold text-white tracking-tight font-sans">التقييمات والآراء</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[42px] font-black font-sans text-white leading-none">5.0</span>
                      <Star className="w-8 h-8 fill-[#5c61ec] text-[#5c61ec] mt-1" />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold font-sans">
                      {selectedAgency.reviewsCount || 11} تقييم
                    </div>
                  </div>
                </div>

                {/* Review List items */}
                <div className="px-6 pt-2 space-y-6 text-right pb-10">
                  {[
                    {
                      author: "عبد الكريم",
                      date: "1 جوان 2026",
                      rating: 5,
                      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
                      comment: "سيارة نظيفة وممتازة للغاية ومرح في قيادتها، تعامل المضيف كان في قمة الرقي والسرعة في الاستجابة والتسليم في المطار كان سلساً جداً. بالتأكيد سأكرر التجربة معه."
                    },
                    {
                      author: "زين الدين",
                      date: "31 ماي 2026",
                      rating: 5,
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                      comment: "وكالة محترفة جداً، تعامل سريع وسيارة نظيفة ومعطرة ومعقمة بالكامل، تجربة مميزة جداً وأنصح بشدة بالتعامل معهم."
                    },
                    {
                      author: "محمد الأمين",
                      date: "16 ماي 2026",
                      rating: 5,
                      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
                      comment: "خدمة فوق المتوقع، توصيل سريع واستعلام مرن طوال الرحلة، شكراً جزيلاً لرحابة صدركم وتسهيل الإجراءات."
                    },
                    {
                      author: "رياض",
                      date: "10 ماي 2026",
                      rating: 5,
                      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
                      comment: "سيارة اقتصادية وعملية جداً، والمضيف كان مرناً للغاية في التوقيت والمقر. أنصح بالتعامل معه."
                    },
                    {
                      author: "ياسين",
                      date: "4 ماي 2026",
                      rating: 5,
                      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
                      comment: "السيارة في حالة ممتازة كأنها جديدة، المعاملة جد راقية وسهلة جداً في الإجراءات."
                    },
                    {
                      author: "عبد المالك",
                      date: "28 أفريل 2026",
                      rating: 5,
                      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=150",
                      comment: "كل شيء كان رائعاً، دقة في المواعيد وسرعة قصوى في الرد. بارك الله فيكم وسدد خطاكم."
                    }
                  ].slice(0, showAllAgencyReviews ? 6 : 3).map((rev, index) => (
                    <div key={index} className="space-y-2.5 border-t border-zinc-900/60 pt-4">
                      <div className="flex items-center gap-3">
                        <img src={rev.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="text-xs font-bold text-white font-sans">{rev.author}</h4>
                          <span className="text-[10px] text-zinc-500 font-sans">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-[#5c61ec]">
                        {[...Array(rev.rating)].map((_, rIdx) => (
                          <Star key={rIdx} className="w-3.5 h-3.5 fill-[#5c61ec] text-[#5c61ec]" />
                        ))}
                      </div>
                      <p className="text-[13.5px] text-zinc-300 leading-relaxed font-sans">{rev.comment}</p>
                    </div>
                  ))}

                  <button 
                    onClick={() => setShowAllAgencyReviews(!showAllAgencyReviews)}
                    className="w-full py-3.5 border border-zinc-850 hover:bg-zinc-900 text-zinc-300 rounded-[14px] text-xs font-extrabold transition-all active:scale-[0.98] cursor-pointer mt-4 font-sans"
                  >
                    {showAllAgencyReviews ? "عرض تقييمات أقل" : "عرض جميع التقييمات"}
                  </button>
                </div>

              </div>
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
            className="absolute inset-0 z-[180] bg-[#0d0d10] flex flex-col font-sans select-none overflow-hidden"
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
