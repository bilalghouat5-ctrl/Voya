/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Percent, 
  MessageSquare, 
  Activity, 
  Bell, 
  ChevronLeft,
  ArrowUpRight,
  ShieldAlert,
  Car
} from "lucide-react";
import { Reservation, Car as CarType } from "../types";

interface HostDashboardProps {
  cars: CarType[];
  bookings: Reservation[];
  onSelectTrip: (tripId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function HostDashboard({ cars, bookings, onSelectTrip, onNavigateToTab }: HostDashboardProps) {
  // host cars - we assume our host hasbatna or self-owned cars matches
  const hostCars = cars.filter(c => c.hostId === "host_current" || c.id.startsWith("host_") || c.agencyId === "agency_batna_auras" || c.hostId === "owner_1");
  const hostCarIds = new Set(hostCars.map(c => c.id));
  
  // host bookings
  const hostBookings = bookings.filter(b => hostCarIds.has(b.carId));
  
  // Calculate stats
  const activeTrips = hostBookings.filter(b => b.status === "confirmed");
  const pendingTrips = hostBookings.filter(b => b.status === "pending");
  const completedTrips = hostBookings.filter(b => b.status === "completed");

  const todayEarnings = activeTrips.reduce((acc, b) => acc + (b.totalPrice / 3), 0) + 8500; // Simulated today
  const totalEarnings = completedTrips.reduce((acc, b) => acc + b.totalPrice, 0) + activeTrips.reduce((acc, b) => acc + b.totalPrice, 0);

  // occupancy rate
  const occupancyRate = hostCars.length > 0 
    ? Math.round((hostCars.filter(c => !c.isAvailable).length / hostCars.length) * 100) 
    : 75;

  return (
    <div className="w-full h-full bg-[#030303] text-white flex flex-col overflow-y-auto no-scrollbar pb-28 text-right px-5 pt-5" dir="rtl">
      {/* Upper header with Premium styling */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[10px] text-[#5c61ec] uppercase tracking-widest font-black block select-none">نظرة عامة</span>
          <h1 className="text-2xl font-black text-white mt-1 select-none tracking-tight">لوحة التحكم</h1>
        </div>
        <div className="bg-[#5c61ec]/10 border border-[#5c61ec]/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black text-[#5c61ec] shadow-[0_2px_10px_rgba(92,97,236,0.15)] select-none">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          <span>الاستضافة نشطة (Active Pro)</span>
        </div>
      </div>

      {/* KPI Stats Grid - Exquisite Bento Cards */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        {/* Earnings Card */}
        <div className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-[22px] flex flex-col justify-between hover:border-[#5c61ec]/40 transition-all duration-300 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#5c61ec]/5 rounded-full blur-2xl group-hover:bg-[#5c61ec]/10 transition-colors" />
          <div className="flex justify-between items-start z-10">
            <div className="p-2.5 bg-[#5c61ec]/10 border border-[#5c61ec]/25 rounded-xl text-[#5c61ec] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-md px-1.5 py-0.5 leading-none font-black">جاهز للسحب</span>
          </div>
          <div className="mt-5 z-10">
            <span className="text-[10px] text-zinc-500 font-bold block">أرباح اليوم</span>
            <div className="flex items-baseline gap-1 mt-1 justify-start">
              <span className="text-xl font-black font-sans leading-none tracking-tight text-white">{(todayEarnings).toLocaleString()}</span>
              <span className="text-[10px] text-zinc-400 font-extrabold">دج</span>
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-[22px] flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-start z-10">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <Percent className="w-4 h-4" />
            </div>
            <span className="text-[9px] bg-[#5c61ec]/10 text-[#5c61ec] border border-[#5c61ec]/15 rounded-md px-1.5 py-0.5 leading-none font-black font-sans">99% رضا</span>
          </div>
          <div className="mt-5 z-10">
            <span className="text-[10px] text-zinc-500 font-bold block">معدل الإشغال</span>
            <div className="flex items-baseline gap-1 mt-1 justify-start">
              <span className="text-xl font-black font-sans leading-none tracking-tight text-white">{occupancyRate || 60}%</span>
              <span className="text-[10px] text-zinc-400 font-extrabold">من الأسطول</span>
            </div>
          </div>
        </div>

        {/* Upcoming Trips Card */}
        <div className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-[22px] flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden group shadow-lg cursor-pointer" onClick={() => onNavigateToTab("host_trips")}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex justify-between items-start z-10">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/25 rounded-xl text-purple-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5 z-10">
            <span className="text-[10px] text-zinc-500 font-bold block">حجوزات نشطة</span>
            <div className="flex items-baseline gap-1 mt-1 justify-start">
              <span className="text-xl font-black font-sans leading-none tracking-tight text-white">{(pendingTrips.length + activeTrips.length)}</span>
              <span className="text-[10px] text-zinc-400 font-extrabold">رحلات فعالة</span>
            </div>
          </div>
        </div>

        {/* Response rate */}
        <div className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-[22px] flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex justify-between items-start z-10">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-md px-1.5 py-0.5 leading-none font-black font-sans">صندوق البريد</span>
          </div>
          <div className="mt-5 z-10">
            <span className="text-[10px] text-zinc-500 font-bold block">معدل الرد</span>
            <div className="flex items-baseline gap-1 mt-1 justify-start">
              <span className="text-xl font-black font-sans leading-none tracking-tight text-white">99%</span>
              <span className="text-[10px] text-zinc-450 font-bold font-sans mt-0.5">(&lt; 5 دقائق)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Status section - Elegant High Fidelity Design */}
      <div className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-[24px] mb-6 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-white/[0.04] pb-3">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981]" />
            <span>حالة أسطول السيارات</span>
          </h3>
          <span className="text-[9.5px] text-[#5c61ec] font-black uppercase font-sans tracking-tight">إحصائية فورية</span>
        </div>
        
        <div className="grid grid-cols-3 gap-1 py-1.5">
          <div className="text-center">
            <span className="text-xl font-black text-white font-sans tracking-tight block">{hostCars.length}</span>
            <span className="text-[9.5px] text-zinc-500 block mt-1 font-bold">إجمالي المركبات</span>
          </div>
          <div className="border-r border-white/[0.04] text-center">
            <span className="text-xl font-black text-emerald-400 font-sans tracking-tight block">{hostCars.filter(c => c.isAvailable).length}</span>
            <span className="text-[9.5px] text-zinc-500 block mt-1 font-bold">جاهزة للكراء</span>
          </div>
          <div className="border-r border-white/[0.04] text-center">
            <span className="text-xl font-black text-indigo-400 font-sans tracking-tight block">{hostCars.filter(c => !c.isAvailable).length}</span>
            <span className="text-[9.5px] text-zinc-500 block mt-1 font-bold">مؤجرة حالياً</span>
          </div>
        </div>
      </div>

      {/* Recent Trips section */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-3.5">
          <h2 className="text-xs font-black text-zinc-400 block uppercase tracking-wide select-none">الرحلات الجارية والطلبات</h2>
          <button onClick={() => onNavigateToTab("host_trips")} className="text-xs font-extrabold text-[#5c61ec] flex items-center gap-0.5 hover:underline bg-transparent border-none cursor-pointer">
            عرض الكل <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {hostBookings.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-850 p-8 rounded-[24px] text-center shadow-lg">
            <Car className="w-9 h-9 text-zinc-700 mx-auto mb-3 stroke-[1.5]" />
            <p className="text-xs text-zinc-500 font-bold">لا توجد حجوزات نشطة لسياراتك حالياً.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {hostBookings.slice(0, 3).map((trip) => {
              const car = cars.find(c => c.id === trip.carId);
              return (
                <div 
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className="bg-zinc-900 border border-zinc-850 hover:border-zinc-700 hover:shadow-[#5c61ec]/5 p-3.5 rounded-[22px] flex gap-3.5 text-right cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 relative group"
                >
                  <div className="relative shrink-0 w-[96px] h-[66px] bg-zinc-950 overflow-hidden rounded-xl border border-white/[0.05]">
                    <img src={car?.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-[12.5px] font-black text-white leading-tight font-sans truncate pr-0.5 group-hover:text-[#5c61ec] transition-colors">{car?.brand} {car?.model}</h4>
                        <span className={`text-[8.5px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                          trip.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                          trip.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse" :
                          "bg-zinc-805 text-zinc-400 border border-zinc-800"
                        }`}>
                          {trip.status === "confirmed" ? "مؤكدة" : trip.status === "pending" ? "طلب جديد" : "منتهية"}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-extrabold pt-1">المستأجر: <span className="text-zinc-350">{trip.renterName || "بلال"}</span></p>
                    </div>

                    <div className="flex justify-between items-center pt-2 mt-1 border-t border-white/[0.03]">
                      <span className="text-[9.5px] text-zinc-500 font-bold font-sans">{trip.startDate} - {trip.endDate}</span>
                      <span className="text-[11.5px] font-black text-[#5c61ec] font-sans">{trip.totalPrice.toLocaleString()} دج</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick host tips with glowing elegant style */}
      <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-[24px] text-right shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#5c61ec]/2 rounded-full blur-3xl" />
        <h4 className="text-xs font-black text-white flex items-center gap-2 z-10 relative">
          <span className="w-2 h-2 bg-[#5c61ec] rounded-full animate-ping shrink-0" />
          <TrendingUp className="w-4 h-4 text-[#5c61ec]" />
          <span>نصيحة لزيادة أرباحك 💡</span>
        </h4>
        <p className="text-[10.5px] text-zinc-400 leading-relaxed mt-2.5 font-bold z-10 relative">
          قم بتحديث جدول توفر سياراتك في نهاية الأسبوع وتخفيض السعر بنسبة %5 لجذب حركية استجمام وعوائل أكبر لولاية الجزائر وتيبازة وباتنة.
        </p>
      </div>
    </div>
  );
}
