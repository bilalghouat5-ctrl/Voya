/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  DollarSign, 
  Settings, 
  FileText, 
  ChevronLeft, 
  Check, 
  ArrowRight,
  TrendingUp,
  X,
  ShieldAlert,
  HelpCircle,
  Building,
  UploadCloud
} from "lucide-react";
import { User as UserType, Car as CarType, Reservation } from "../types";

interface HostAccountProps {
  user: UserType;
  cars: CarType[];
  bookings: Reservation[];
  onUpdateUser: (updated: UserType) => void;
  onAddNotification: (notif: any) => void;
  onToggleHostMode: () => void;
}

export default function HostAccount({ 
  user, 
  cars,
  bookings,
  onUpdateUser, 
  onAddNotification,
  onToggleHostMode
}: HostAccountProps) {
  const [subView, setSubView] = useState<"menu" | "profile" | "earnings" | "settings" | "docs">("menu");
  const [showDocUploadedAlert, setShowDocUploadedAlert] = useState<boolean>(false);

  // host bookings
  const hostCars = cars.filter(c => c.hostId === "host_current" || c.id.startsWith("host_") || c.agencyId === "agency_batna_auras" || c.hostId === "owner_1");
  const hostCarIds = new Set(hostCars.map(c => c.id));
  const hostBookings = bookings.filter(b => hostCarIds.has(b.carId));
  const completedTrips = hostBookings.filter(b => b.status === "completed" || b.status === "confirmed");

  const totalEarnings = completedTrips.reduce((acc, b) => acc + b.totalPrice, 0) + 42000; // Simulated historic base

  const handleUploadDoc = (docType: string) => {
    const file = prompt(`الرجاء إدخال اسم ملف ${docType} المرفوع للتجربة:`);
    if (file) {
      setShowDocUploadedAlert(true);
      setTimeout(() => setShowDocUploadedAlert(false), 2500);
      onAddNotification({
        id: "doc_upload_" + Date.now(),
        title: "تم استلام مستند الوكالة 📄",
        content: `تم رفع ملف ${docType} (${file}) بنجاح للمراجعة القانونية من تورو الجزائر. ستحصل على كود الاعتماد فورياً في 12 ساعة.`,
        type: "system",
        date: "الآن",
        read: false
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#030303] text-white flex flex-col overflow-hidden text-right" dir="rtl">
      
      <AnimatePresence mode="wait">
        {subView === "menu" ? (
          /* MAIN ACCOUNT SETTINGS MENU */
          <motion.div 
            key="menu-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24"
          >
            {/* Host Identity Badge Card */}
            <div className="px-6 pt-7 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-[62px] h-[62px] rounded-full bg-zinc-950 border-2 border-[#5c61ec] p-0.5 flex items-center justify-center relative shrink-0 shadow-lg shadow-[#5c61ec]/15">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-8 h-8 text-zinc-600" />
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-[#5c61ec] text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black leading-none border border-black shadow-md">
                    ★
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-black text-white leading-snug">{user.name}</h2>
                  <span className="text-[9.5px] text-[#5c61ec] font-sans font-black tracking-wide block uppercase mt-0.5">حساب مضيف معتمد • PRO OWNER</span>
                </div>
              </div>
            </div>

            {/* Switch Mode CTA Row */}
            <div className="mx-6 my-2 bg-gradient-to-r from-zinc-950 to-zinc-900 hover:from-zinc-900 hover:to-zinc-850 border border-white/[0.04] p-4.5 rounded-[22px] text-right flex justify-between items-center transition-all shadow-lg">
              <div>
                <span className="text-[10.5px] font-black text-[#5c61ec] block select-none">التبديل بين الأوضاع</span>
                <span className="text-xs text-zinc-400 font-bold block mt-1 select-none leading-normal">تبديل للبحث وحجز سيارات كضيف</span>
              </div>
              <button 
                onClick={onToggleHostMode}
                className="px-4.5 py-3 bg-[#5c61ec] hover:bg-[#4d51d9] text-white rounded-xl text-[10.5px] font-black active:scale-95 transition-all cursor-pointer shadow-md shadow-[#5c61ec]/10 border-none"
              >
                تبديل لوضع الضيف (Guest)
              </button>
            </div>

            {/* Options List */}
            <div className="px-6 mt-4 space-y-1">
              
              {/* Profile */}
              <button 
                onClick={() => setSubView("profile")}
                className="w-full py-4.5 px-3 flex items-center justify-between rounded-xl hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors cursor-pointer text-right border-none bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-zinc-450 stroke-[1.8]" />
                  <span className="text-[14px] font-black text-zinc-200">الملف الشخصي للمضيف</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-zinc-600" />
              </button>

              <div className="h-[1px] bg-white/[0.02] w-full" />

              {/* Earnings Ledgers */}
              <button 
                onClick={() => setSubView("earnings")}
                className="w-full py-4.5 px-3 flex items-center justify-between rounded-xl hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors cursor-pointer text-right border-none bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <DollarSign className="w-5 h-5 text-zinc-450 stroke-[1.8]" />
                  <span className="text-[14px] font-black text-zinc-200">مركز الأرباح المالي (Earnings)</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11.5px] font-black text-emerald-400 font-sans">{(totalEarnings || 0).toLocaleString()} دج</span>
                  <ChevronLeft className="w-4 h-4 text-zinc-600" />
                </div>
              </button>

              <div className="h-[1px] bg-white/[0.02] w-full" />

              {/* Documents uploads */}
              <button 
                onClick={() => setSubView("docs")}
                className="w-full py-4.5 px-3 flex items-center justify-between rounded-xl hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors cursor-pointer text-right border-none bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-zinc-450 stroke-[1.8]" />
                  <span className="text-[14px] font-black text-zinc-200">الملفات وتوثيق الوكالة (Documents)</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-zinc-600" />
              </button>

              <div className="h-[1px] bg-white/[0.02] w-full" />

              {/* General Settings */}
              <button 
                onClick={() => setSubView("settings")}
                className="w-full py-4.5 px-3 flex items-center justify-between rounded-xl hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors cursor-pointer text-right border-none bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <Settings className="w-5 h-5 text-zinc-450 stroke-[1.8]" />
                  <span className="text-[14px] font-black text-zinc-200">إعدادات الاستضافة والخصوصية</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-zinc-600" />
              </button>

            </div>

            {/* Version Label */}
            <div className="px-6 mt-12 select-none text-right">
              <span className="text-[10px] font-black text-zinc-700 font-mono uppercase tracking-widest">Host Area Version v2.26</span>
            </div>
          </motion.div>
        ) : subView === "profile" ? (
          /* PROFILE DETAILS SUBVIEW */
          <motion.div 
            key="profile-sub"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col overflow-y-auto no-scrollbar pb-24"
          >
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0" dir="rtl">
              <button onClick={() => setSubView("menu")} className="p-1 px-2.5 flex items-center justify-center gap-1 text-zinc-400 hover:text-white bg-transparent border-none cursor-pointer active:scale-95 transition-all">
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black text-white">الملف الشخصي للمضيف</h2>
              <div className="w-6" />
            </div>

            <div className="p-5 space-y-5 text-right" dir="rtl">
              <div>
                <label className="text-[11px] text-zinc-400 font-black block mb-2">اسم المضيف / الوكالة بالمنصة</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                  className="w-full bg-[#121215]/90 border border-white/[0.05] focus:border-[#5c61ec] rounded-2xl p-3.5 text-xs text-white focus:outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-black block mb-2">بريدك الإلكتروني (لتوثيق التعامل الفوري)</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => onUpdateUser({ ...user, email: e.target.value })}
                  className="w-full bg-[#121215]/90 border border-white/[0.05] focus:border-[#5c61ec] rounded-2xl p-3.5 text-xs text-white focus:outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-black block mb-2">الهاتف للاتصال من المكتتبين</label>
                <input
                  type="text"
                  value={user.phone}
                  onChange={(e) => onUpdateUser({ ...user, phone: e.target.value })}
                  className="w-full bg-[#121215]/90 border border-white/[0.05] focus:border-[#5c61ec] rounded-2xl p-3.5 text-xs text-white focus:outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-black block mb-2">نبذة تعريفية وموقع مكتب الاستعلام</label>
                <textarea
                  value={user.about || "مستضيف معتمد لدى وكالة باتنة أوراس بالولاية، نوفر تسليم فوري لسياراتنا المكيفة والنظيفة لتنقل آمن وعائلي بالجزائر العاصمة وكافة الولايات."}
                  onChange={(e) => onUpdateUser({ ...user, about: e.target.value })}
                  className="w-full bg-[#121215]/90 border border-white/[0.05] focus:border-[#5c61ec] rounded-2xl p-3.5 text-xs text-white outline-none min-h-[105px] leading-relaxed transition-all font-medium"
                />
              </div>

              <div className="bg-[#121215] p-3.5 rounded-2xl flex items-center justify-start gap-2 border border-[#5c61ec]/25">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-zinc-300 font-black">تم حفظ وتزامن ملف حسابك بشكل فوري آمن بالمنصة.</span>
              </div>
            </div>
          </motion.div>
        ) : subView === "earnings" ? (
          /* EARNINGS LEDGER AND GRAPH SUBVIEW */
          <motion.div 
            key="earnings-sub"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col overflow-y-auto no-scrollbar pb-24"
          >
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0" dir="rtl">
              <button onClick={() => setSubView("menu")} className="p-1 px-2.5 flex items-center justify-center gap-1 text-zinc-400 hover:text-white bg-transparent border-none cursor-pointer active:scale-95 transition-all">
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black text-white">مركز الأرباح المالي</h2>
              <div className="w-6" />
            </div>

            <div className="p-5 space-y-5" dir="rtl">
              {/* Earnings KPI Overview card */}
              <div className="bg-gradient-to-br from-[#121215] to-[#0a0a0c] border border-white/[0.04] rounded-[24px] p-6 text-right relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-[#5c61ec]/10 border border-[#5c61ec]/20 rounded-xl text-[#5c61ec]">
                    <TrendingUp className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[9.5px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 font-black">مكتمل وبث فوري</span>
                </div>
                <span className="text-[10.5px] text-zinc-450 font-black block mt-4">الرصيد الكلي المقبوض</span>
                <div className="flex items-baseline gap-1 mt-1 justify-start">
                  <span className="text-3xl font-black font-sans text-white tracking-tight">{totalEarnings.toLocaleString()}</span>
                  <span className="text-xs font-black text-zinc-500">دج</span>
                </div>
                <div className="border-t border-white/[0.02] pt-4 mt-5 flex justify-between text-right text-[11px]">
                  <div>
                    <span className="text-zinc-500 font-black block">مستحقات هذا الأسبوع</span>
                    <span className="text-emerald-400 font-black mt-1 block font-sans">18,500 دج</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-black block">مبالغ قيد التصفية</span>
                    <span className="text-zinc-400 font-black mt-1 block font-sans">6,000 دج</span>
                  </div>
                </div>
              </div>

              {/* simulated payment bar chart */}
              <div className="bg-[#111113] p-4 border border-zinc-900 rounded-2xl">
                <h3 className="text-xs font-black text-white text-right mb-4">نشاط الأرباح الشهري (2026)</h3>
                <div className="flex items-end justify-between h-32 pt-2 text-center" dir="ltr">
                  {[
                    { m: "جان", val: 55, active: false },
                    { m: "فيف", val: 40, active: false },
                    { m: "مار", val: 75, active: false },
                    { m: "أفر", val: 60, active: false },
                    { m: "ماي", val: 95, active: true },
                    { m: "جوان", val: 80, active: false }
                  ].map((bar) => (
                    <div key={bar.m} className="flex-grow flex flex-col items-center">
                      <div className="w-6 bg-zinc-900 rounded-t-lg h-24 flex items-end relative overflow-hidden">
                        <div 
                          className={`w-full rounded-t-lg transition-all ${bar.active ? 'bg-[#5c61ec]' : 'bg-zinc-700/60 hover:bg-[#5c61ec]/65'}`} 
                          style={{ height: `${bar.val}%` }} 
                        />
                      </div>
                      <span className="text-[9px] text-zinc-400 font-bold mt-1.5">{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Ledger header */}
              <div className="text-right">
                <span className="text-[10.5px] text-zinc-500 font-black block uppercase tracking-wider mb-3">أرشيف المعاملات الأخيرة</span>
                <div className="space-y-3 font-sans">
                  <div className="bg-zinc-900 border border-zinc-850 p-4 text-right rounded-2xl flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-xs font-black text-white block">تحويل بنكي CCP (بريد الجزائر)</span>
                      <span className="text-[9.5px] text-zinc-500 block mt-1">عملية معالجة تحويل الحساب #1142512</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-sans leading-none">+18,400 دج</span>
                  </div>
                  
                  <div className="bg-zinc-900 border border-zinc-850 p-4 text-right rounded-2xl flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-xs font-black text-white block">حجز مسترد - تأمين الضمانة</span>
                      <span className="text-[9.5px] text-zinc-500 block mt-1 font-medium">تسوية حافز الضمان مع الزبون عبد الكريم</span>
                    </div>
                    <span className="text-xs font-black text-zinc-500 font-sans leading-none">-20,000 دج</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : subView === "docs" ? (
          /* DOCUMENTS UPLOADS SUBVIEW : السجل التجاري والبطاقة الجبائية والتأمين */
          <motion.div 
            key="docs-sub"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col overflow-y-auto no-scrollbar pb-24"
          >
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0" dir="rtl">
              <button onClick={() => setSubView("menu")} className="p-1 px-2.5 flex items-center justify-center gap-1 text-zinc-400 hover:text-white bg-transparent border-none cursor-pointer active:scale-95 transition-all">
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black text-white">الملفات والوثائق القانونية</h2>
              <div className="w-6" />
            </div>

            <div className="p-5 space-y-5 text-right" dir="rtl">
              <span className="text-[10px] text-[#5c61ec] uppercase font-black block leading-none select-none tracking-widest">التدقيق والاعتماد للوكالات</span>
              <p className="text-[11px] text-zinc-400 font-bold leading-relaxed select-none">يرجى توفير ورفع الوثائق المنصوص عليها لتعزيز ثقة المكتتبين وتفعيل الفاتورة التأمينية المعتمدة لواردات كراء السيارات.</p>

              {showDocUploadedAlert && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-xs font-black text-right shadow-sm select-none">
                  🎉 تم رفع ملف الورقة الثبوتية بنجاح! يتم التدقيق والتحقق منها وتنشيط حسابك الآن.
                </div>
              )}

              {/* Upload checklist lists */}
              <div className="space-y-4 font-sans">
                {/* doc 1 */}
                <div 
                  onClick={() => handleUploadDoc("السجل التجاري للوكالة (Registre de Commerce)")}
                  className="bg-zinc-900 border border-zinc-850 hover:border-[#5c61ec]/40 p-4.5 rounded-[22px] flex justify-between items-center cursor-pointer transition-all active:scale-98 group shadow-sm"
                >
                  <div className="text-right">
                    <span className="text-xs font-black text-white block group-hover:text-[#5c61ec] transition-colors">السجل التجاري الجزائري (RC)</span>
                    <span className="text-[9.5px] text-zinc-500 block mt-1.5 font-sans font-semibold">مكتمل ومرفوع للاعتماد المباشر بالمنصة.</span>
                  </div>
                  <div className="p-2.5 bg-[#5c61ec]/10 border border-[#5c61ec]/20 rounded-xl text-[#5c61ec] shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                </div>

                {/* doc 2 */}
                <div 
                  onClick={() => handleUploadDoc("بطاقة الرقم الجبائي (NIF)")}
                  className="bg-zinc-900 border border-zinc-850 hover:border-[#5c61ec]/40 p-4.5 rounded-[22px] flex justify-between items-center cursor-pointer transition-all active:scale-98 group shadow-sm"
                >
                  <div className="text-right">
                    <span className="text-xs font-black text-white block group-hover:text-[#5c61ec] transition-colors">بطاقة التعريف الجبائي (NIF)</span>
                    <span className="text-[9.5px] text-zinc-500 block mt-1.5 font-sans font-semibold">لم يتم المزامنة الرفع بعد. اضغط للاستيراد والرفع الفوري.</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-500 shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                </div>

                {/* doc 3 */}
                <div 
                  onClick={() => handleUploadDoc("عقد التأمين الفئوي (Assurance Multi-Risques)")}
                  className="bg-zinc-900 border border-zinc-850 hover:border-[#5c61ec]/40 p-4.5 rounded-[22px] flex justify-between items-center cursor-pointer transition-all active:scale-98 group shadow-sm"
                >
                  <div className="text-right">
                    <span className="text-xs font-black text-white block group-hover:text-[#5c61ec] transition-colors">دفتر شروط تأمين المركبة الكلي</span>
                    <span className="text-[9.5px] text-zinc-500 block mt-1.5 font-sans font-semibold">تغطية الأضرار وتوصيل الزبون الموثق بالجزائر.</span>
                  </div>
                  <div className="p-2.5 bg-[#5c61ec]/10 border border-[#5c61ec]/20 rounded-xl text-[#5c61ec] shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* SETTINGS SUBVIEW */
          <motion.div 
            key="settings-sub"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col overflow-y-auto no-scrollbar pb-24"
          >
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0" dir="rtl">
              <button onClick={() => setSubView("menu")} className="p-1 px-2.5 flex items-center justify-center gap-1 text-zinc-400 hover:text-white bg-transparent border-none cursor-pointer active:scale-95 transition-all">
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black text-white">الإعدادات والخصوصية</h2>
              <div className="w-6" />
            </div>

            <div className="p-5 space-y-5 text-right leading-relaxed font-sans text-xs" dir="rtl">
              <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-[24px]">
                <span className="text-xs font-black text-white block mb-2 select-none">تلقي تنبيهات وعوائد الكراء الفورية</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">يتم تحويل الأرباح مباشرة ومزامنتها عبر خدمات CCP بريد الجزائر أسبوعياً عند انتهاء الحجوزات بنجاح وثبوت خلو الأسطول من الحوادث.</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-[24px]">
                <span className="text-xs font-black text-white block mb-2 select-none">شروط وقوانين المسؤولية المدنية</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">يكون المضيف مسؤولاً عن نظافة وسير ميكانيك السيارة بشكل تام. ويضمن تورو كراء الجزائر تسوية أضرار التصادم وسرقة الهيكل مع التعويض المالي المناسب.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
