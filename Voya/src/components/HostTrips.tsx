/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  ChevronLeft, 
  User, 
  MapPin, 
  Clock, 
  Camera, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Check, 
  X, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Reservation, Car as CarType } from "../types";

interface HostTripsProps {
  bookings: Reservation[];
  cars: CarType[];
  onUpdateBookingStatus: (id: string, status: Reservation["status"]) => void;
  onAddNotification: (notif: any) => void;
  onSelectTrip?: (tripId: string | null) => void;
  selectedTripId?: string | null;
}

export default function HostTrips({ 
  bookings, 
  cars, 
  onUpdateBookingStatus, 
  onAddNotification,
  onSelectTrip,
  selectedTripId
}: HostTripsProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const activeId = selectedTripId !== undefined ? selectedTripId : localSelectedId;
  const setActiveId = onSelectTrip !== undefined ? onSelectTrip : setLocalSelectedId;

  const [activeTab, setActiveTab] = useState<"pending" | "upcoming" | "ongoing" | "completed">("pending");

  // Damage report state
  const [damageReportText, setDamageReportText] = useState<string>("");
  const [damageList, setDamageList] = useState<string[]>([]);
  
  // Inspection photos state
  const [preTripPhotos, setPreTripPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=150"
  ]);
  const [postTripPhotos, setPostTripPhotos] = useState<string[]>([]);

  // Host Cars set to filter bookings
  const hostCars = cars.filter(c => c.hostId === "host_current" || c.id.startsWith("host_") || c.agencyId === "agency_batna_auras" || c.hostId === "owner_1");
  const hostCarIds = new Set(hostCars.map(c => c.id));

  // host bookings
  const hostBookings = bookings.filter(b => hostCarIds.has(b.carId));

  // Filter lists based on status categories:
  // pending: status === "pending"
  // upcoming: status === "confirmed" but date is futures (simulated) or just confirmed
  // ongoing: status === "confirmed" and simulated active
  // completed: status === "completed" or cancelled
  
  const pendingTrips = hostBookings.filter(b => b.status === "pending");
  const upcomingTrips = hostBookings.filter(b => b.status === "confirmed" && !b.startDate.includes("جويلية"));
  const ongoingTrips = hostBookings.filter(b => b.status === "confirmed" && b.startDate.includes("جويلية"));
  const completedTrips = hostBookings.filter(b => b.status === "completed" || b.status === "cancelled");

  const currentList = 
    activeTab === "pending" ? pendingTrips :
    activeTab === "upcoming" ? upcomingTrips :
    activeTab === "ongoing" ? ongoingTrips :
    completedTrips;

  const handleStatusChange = (tripId: string, status: Reservation["status"], title: string, content: string) => {
    onUpdateBookingStatus(tripId, status);
    onAddNotification({
      id: "trip_status_" + Date.now(),
      title,
      content,
      type: "host",
      date: "الآن",
      read: false
    });
  };

  const selectedTrip = hostBookings.find(b => b.id === activeId);
  const selectedCar = selectedTrip ? cars.find(c => c.id === selectedTrip.carId) : null;

  const addDamageReport = () => {
    if (!damageReportText.trim()) return;
    setDamageList(prev => [...prev, damageReportText]);
    setDamageReportText("");
  };

  const uploadInspectionPhoto = (type: "pre" | "post") => {
    const url = prompt("الرجاء إدخال رابط الصورة للتأكد من سلامة الهيكل:");
    if (url) {
      if (type === "pre") {
        setPreTripPhotos(prev => [...prev, url]);
      } else {
        setPostTripPhotos(prev => [...prev, url]);
      }
    }
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col overflow-hidden text-right" dir="rtl">
      
      <AnimatePresence mode="wait">
        {!activeId ? (
          /* TRIPS DIRECTORY */
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col overflow-hidden w-full"
          >
            {/* Upper Header */}
            <div className="px-5 pt-5 pb-2 text-right shrink-0">
              <span className="text-[10px] text-[#5c61ec] uppercase tracking-widest font-black block select-none">إدارة الحجوزات</span>
              <h1 className="text-2xl font-black text-white mt-1 select-none tracking-tight">رحلات الأسطول</h1>
            </div>

            {/* Premium Categorized Switcher matching Guest-Tab styling */}
            <div className="px-5 py-2 shrink-0">
              <div className="bg-zinc-950/80 border border-zinc-950 p-1 rounded-2xl flex divide-x divide-zinc-900 overflow-x-auto no-scrollbar" dir="rtl">
                {[
                  { id: "pending", label: "طلبات جديدة", count: pendingTrips.length },
                  { id: "upcoming", label: "قادمة", count: upcomingTrips.length },
                  { id: "ongoing", label: "جارية", count: ongoingTrips.length },
                  { id: "completed", label: "منتهية", count: completedTrips.length }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] font-black cursor-pointer select-none whitespace-nowrap focus:outline-none ${
                        isActive 
                          ? "bg-[#5c61ec] text-white shadow-lg shadow-[#5c61ec]/10" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span className="font-sans font-bold">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`text-[9px] font-sans font-black rounded-full px-1.5 py-0.5 min-w-[16px] text-center leading-none ${
                          isActive ? "bg-zinc-950/30 text-white" : "bg-[#5c61ec]/15 text-[#5c61ec]"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trips Feed list */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24 bg-black space-y-4">
              {currentList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900 border border-zinc-950 rounded-[24px] p-6">
                  <Calendar className="w-10 h-10 text-zinc-650 mx-auto mb-3 stroke-[1.5]" />
                  <p className="text-xs text-zinc-500 font-bold leading-normal">لا توجد أي رحلات مسجلة في هذه الفئة حالياً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentList.map((trip) => {
                    const car = cars.find(c => c.id === trip.carId);
                    return (
                      <div
                        key={trip.id}
                        onClick={() => setActiveId(trip.id)}
                        className="bg-zinc-900 border border-zinc-950 hover:border-zinc-900 hover:shadow-[#5c61ec]/5 p-4 rounded-[22px] flex flex-col gap-3.5 text-right cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 relative group"
                      >
                        <div className="flex gap-4 flex-row">
                          <div className="relative shrink-0 w-[100px] h-[70px] bg-zinc-950 overflow-hidden rounded-xl border border-zinc-950">
                            <img src={car?.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          
                          <div className="flex-grow min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="text-[13px] font-black text-white leading-tight font-sans truncate pr-0.5 group-hover:text-[#5c61ec] transition-colors">
                                  {car?.brand} {car?.model}
                                </h4>
                                <span className={`text-[8.5px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                                  trip.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                                  trip.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse" :
                                  "bg-zinc-805 text-zinc-400 border border-zinc-955"
                                }`}>
                                  {trip.status === "confirmed" ? "مؤكدة" : trip.status === "pending" ? "طلب جديد" : "منتهية"}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-extrabold pt-1">المستأجر: <span className="text-zinc-350">{trip.renterName || "بلال"}</span></p>
                            </div>
                            <span className="text-[9px] text-[#5c61ec] font-black block mt-1 font-sans leading-none">{trip.startDate} - {trip.endDate}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-zinc-950 pt-3.5 mt-0.5">
                          <span className="text-xs font-black text-white font-sans">{trip.totalPrice.toLocaleString()} دج</span>
                          <span className="text-[10.5px] font-bold text-[#5c61ec] flex items-center gap-0.5 group-hover:translate-x-[-2px] transition-transform">
                            عرض التفاصيل والتحقق <ChevronLeft className="w-3.5 h-3.5 text-[#5c61ec]" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* DETAILED TRIP PAGE (HIGH FIDELITY INSPECTION & INSTRUCTIONS) */
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col overflow-hidden bg-black w-full"
          >
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0">
              <button 
                onClick={() => setActiveId(null)}
                className="p-1 px-2.5 text-zinc-400 hover:text-white flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 text-zinc-400" />
              </button>
              <h2 className="text-xs font-black text-white">تفاصيل الرحلة #{(selectedTrip?.id || "").slice(-5)}</h2>
              <div className="w-12" />
            </div>

            {/* Scrollable details with luxury glass structure */}
            <div className="flex-grow p-4.5 overflow-y-auto no-scrollbar pb-24 bg-black space-y-4 text-right">
              
              {/* Car Info Card */}
              <div className="bg-zinc-900 border border-zinc-950 p-4 rounded-[22px] flex gap-4 text-right shadow-lg">
                <div className="relative shrink-0 w-24 h-16 bg-zinc-950 overflow-hidden rounded-xl border border-zinc-950">
                  <img src={selectedCar?.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className={`text-[8px] px-2 py-0.5 rounded-md font-black inline-block ${
                      selectedTrip?.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                      selectedTrip?.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                      "bg-zinc-900 text-zinc-450 border border-zinc-900"
                    }`}>
                      {selectedTrip?.status === "confirmed" ? "مؤكدة" : selectedTrip?.status === "pending" ? "طلب معلق" : "منتهية"}
                    </span>
                    <h3 className="text-[12.5px] font-black text-white truncate mt-1.5 font-sans leading-none">
                      {selectedCar?.brand} {selectedCar?.model} • {selectedCar?.year}
                    </h3>
                  </div>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-[9.5px] text-[#5c61ec] font-black font-sans">{selectedTrip?.startDate} - {selectedTrip?.endDate}</span>
                    <span className="text-xs font-black text-white font-sans">{(selectedTrip?.totalPrice || 0).toLocaleString()} دج</span>
                  </div>
                </div>
              </div>

              {/* Renter detail: معلومات المستأجر */}
              <div className="bg-zinc-900 border border-zinc-950 p-4 rounded-[22px] space-y-3.5 text-right shadow-lg relative overflow-hidden">
                <h3 className="text-xs font-black text-white border-b border-zinc-950 pb-2.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#5c61ec]" />
                  <span>معلومات ومصداقية المستأجر</span>
                </h3>
                <div className="flex justify-between items-center text-right">
                  <div>
                    <span className="text-xs font-black text-white block">{selectedTrip?.renterName || "بلال"}</span>
                    <span className="text-[9.5px] text-zinc-500 font-bold block mt-0.5">رخصة سياقة جزائرية معتمدة ورقم هوية موثق</span>
                  </div>
                  {/* Verified Badge with glowing light */}
                  <div className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_2px_10px_rgba(16,185,129,0.1)]">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>حساب موثق</span>
                  </div>
                </div>

                 {/* Communication buttons */}
                <div className="flex gap-2.5 pt-2.5 border-t border-zinc-950">
                  <button 
                    onClick={() => alert(`جاري الاتصال بهاتف المستأجر: ${selectedTrip?.renterPhone || "0554-12-42-12"}`)}
                    className="flex-grow cursor-pointer bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-950 hover:border-zinc-900 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-[11px] font-black text-zinc-300 transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#5c61ec]" />
                    <span>سماع الهاتف</span>
                  </button>
                  <button 
                    onClick={() => alert("جاري فتح المحادثة المباشرة مع المستأجر...")}
                    className="flex-grow cursor-pointer bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-950 hover:border-zinc-900 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-[11px] font-black text-zinc-300 transition-all active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#5c61ec]" />
                    <span>مراسلة المستأجر</span>
                  </button>
                </div>
              </div>

              {/* Delivery and Locations: مكان ووقت التسليم */}
              <div className="bg-zinc-900 border border-zinc-950 p-4 rounded-[22px] space-y-3 text-right shadow-lg font-sans">
                <h3 className="text-xs font-black text-white border-b border-zinc-950 pb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#5c61ec]" />
                  <span>معلومات وموقع تسليم العربة</span>
                </h3>
                <div className="space-y-2.5 pt-0.5">
                  <div className="flex justify-between items-center text-right">
                    <span className="text-[11px] text-zinc-400 font-bold">موقع ومكتب التوصيل</span>
                    <span className="text-xs text-white font-extrabold">{selectedCar?.city || "الجزائر العاصمة"}</span>
                  </div>
                  <div className="flex justify-between items-center text-right border-t border-zinc-950 pt-2.5">
                    <span className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" /> موعد التسليم المقرر
                    </span>
                    <span className="text-xs text-[#5c61ec] font-black font-sans">10:00 صباحاً</span>
                  </div>
                </div>
              </div>

              {/* Pre trip validation checklist: صور قبل الرحلة */}
              <div className="bg-zinc-900 border border-zinc-950 p-4 rounded-[22px] space-y-3.5 text-right shadow-lg">
                <div className="flex justify-between items-baseline border-b border-zinc-950 pb-2.5">
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#5c61ec]" />
                    <span>صور فحص المركبة قبل الرحلة (Pre-Trip)</span>
                  </h3>
                  <button 
                    onClick={() => uploadInspectionPhoto("pre")}
                    className="text-[10px] bg-zinc-950 border border-zinc-950 hover:bg-zinc-900 px-2 py-1 rounded-lg text-[#5c61ec] font-black cursor-pointer"
                  >
                    + إضافة صورة
                  </button>
                </div>
                
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {preTripPhotos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-950 bg-zinc-950">
                      <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <button 
                    onClick={() => uploadInspectionPhoto("pre")}
                    className="w-20 h-16 border-2 border-zinc-950 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-550 shrink-0 hover:text-white hover:border-[#5c61ec]/40 bg-zinc-950/40 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-[8px] mt-1 font-bold">رفع صور</span>
                  </button>
                </div>
              </div>

              {/* Post trip: صور بعد الرحلة */}
              <div className="bg-zinc-900 border border-zinc-950 p-4 rounded-[22px] space-y-3.5 text-right shadow-lg">
                <div className="flex justify-between items-baseline border-b border-zinc-950 pb-2.5">
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#5c61ec]" />
                    <span>صور فحص المركبة بعد انتهاء الكراء (Post-Trip)</span>
                  </h3>
                  <button 
                    onClick={() => uploadInspectionPhoto("post")}
                    className="text-[10px] bg-zinc-950 border border-zinc-950 hover:bg-zinc-900 px-2 py-1 rounded-lg text-[#5c61ec] font-black cursor-pointer"
                  >
                    + إضافة صورة
                  </button>
                </div>
                
                {postTripPhotos.length === 0 ? (
                  <p className="text-[10px] text-zinc-550 py-1.5 leading-relaxed font-bold">لا يوجد صور مرفوعة بعد انتهاء الرحلة. يتم الرفع فور استلام المفتاح من المستأجر للتأمين.</p>
                ) : (
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                    {postTripPhotos.map((photo, i) => (
                      <div key={i} className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-950 bg-zinc-950">
                        <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-start pt-1">
                  <button 
                    onClick={() => uploadInspectionPhoto("post")}
                    className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-950 hover:border-zinc-900 rounded-xl text-[10.5px] font-black text-zinc-350 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4 text-[#5c61ec]" />
                    <span>التقاط صور ما بعد الرحلة للتأمين</span>
                  </button>
                </div>
              </div>

              {/* Damage claims section: تقرير الأضرار */}
              <div className="bg-zinc-900 border border-zinc-950 p-4 rounded-[22px] space-y-3.5 text-right shadow-lg">
                <h3 className="text-xs font-black text-white border-b border-zinc-950 pb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>تقرير وتتبع الأكلاف والأضرار (Claims & Damages)</span>
                </h3>
                
                {damageList.length > 0 && (
                  <div className="space-y-2 bg-amber-550/5 border border-amber-500/20 p-3 rounded-xl text-right">
                    {damageList.map((rep, i) => (
                      <div key={i} className="flex gap-2 items-start text-amber-200 text-[10.5px]">
                        <span className="text-amber-400">⚠️</span>
                        <p className="font-bold leading-normal">{rep}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3.5 pt-1.5 font-sans">
                  <input
                    type="text"
                    value={damageReportText}
                    onChange={(e) => setDamageReportText(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-950 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 text-right leading-none placeholder-zinc-600 focus:bg-black transition-all"
                    placeholder="اكتب تفاصيل الضرر (مثل: خدش بسيط في الهيكل الخلفي)..."
                  />
                  <button 
                    onClick={addDamageReport}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-450 text-black text-[11px] font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                  >
                    إثبات وتوثيق الأضرار للشركة
                  </button>
                </div>
              </div>

              {/* Action approvals for pending bookings */}
              {selectedTrip?.status === "pending" && (
                <div className="flex gap-3 pt-3">
                  <button 
                    onClick={() => handleStatusChange(
                      selectedTrip.id, 
                      "confirmed",
                      "تم تأكيد وقبول الحجز بنجاح 🟢",
                      `لقد قبلت طلب كراء مركبتك من المستأجر ${selectedTrip.renterName}. يرجي تتبع تفاصيل الاستلام.`
                    )}
                    className="flex-grow py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1.5 font-black text-xs active:scale-95 transition-all text-center cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
                  >
                    <Check className="w-4 h-4" />
                    <span>قبول الحجز والموافقة</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(
                      selectedTrip.id, 
                      "cancelled",
                      "تم رفض طلب الكراء المالي 🛑",
                      `تم إلغاء طلب المتقدم ${selectedTrip.renterName} لسيارتك واسترداد أمواله بالكامل.`
                    )}
                    className="py-3.5 px-4 bg-[#141416] hover:bg-zinc-900 border border-zinc-950 rounded-xl flex items-center justify-center text-red-500 font-bold text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>رفض الطلب</span>
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
