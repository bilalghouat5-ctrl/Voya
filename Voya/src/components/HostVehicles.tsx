/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Car, 
  ChevronLeft, 
  Trash2, 
  Camera, 
  DollarSign, 
  MapPin, 
  Check, 
  X, 
  ShieldCheck, 
  HelpCircle, 
  Sliders, 
  ToggleLeft, 
  ToggleRight,
  Info
} from "lucide-react";
import { Car as CarType } from "../types";

interface HostVehiclesProps {
  cars: CarType[];
  onAddCar: (car: CarType) => void;
  onDeleteCar: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onUpdateCarDetails?: (car: CarType) => void;
  onAddNotification: (notif: any) => void;
}

export default function HostVehicles({ 
  cars, 
  onAddCar, 
  onDeleteCar, 
  onToggleAvailability, 
  onUpdateCarDetails,
  onAddNotification 
}: HostVehiclesProps) {
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editTab, setEditTab] = useState<"photos" | "desc" | "features" | "pricing" | "availability" | "location" | "prefs" | "protection">("desc");

  // Filter host cars (owned by host or simulating those from "agency_batna_auras" or starting with "host_")
  const hostCars = cars.filter(c => c.hostId === "host_current" || c.id.startsWith("host_") || c.agencyId === "agency_batna_auras" || c.hostId === "owner_1");

  // New Car Form State
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<number>(2024);
  const [pricePerDay, setPricePerDay] = useState<number>(6500);
  const [city, setCity] = useState<string>("الجزائر العاصمة");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [category, setCategory] = useState<"economy" | "luxury" | "suv" | "family">("economy");
  const [transmission, setTransmission] = useState<"automatic" | "manual">("manual");
  const [fuel, setFuel] = useState<"essence" | "diesel" | "hybrid" | "electric">("essence");
  const [plates, setPlates] = useState<string>("");

  // Quick template setups
  const templates = [
    { brand: "Hyundai", model: "i20", price: 6000, img: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400", category: "economy" as const },
    { brand: "Dacia", model: "Duster", price: 8500, img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400", category: "suv" as const },
    { brand: "Golf", model: "8 R-Line", price: 12000, img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400", category: "luxury" as const }
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !pricePerDay) {
      alert("يرجى تعبئة كافة البيانات الأساسية.");
      return;
    }

    const defaultImg = image || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600";
    const newCar: CarType = {
      id: "host_car_" + Date.now(),
      brand,
      model,
      year: Number(year) || 2024,
      image: defaultImg,
      pricePerDay: Number(pricePerDay),
      city,
      isAvailable: true,
      category,
      transmission,
      fuel,
      seats: 5,
      deposit: 20000,
      rating: 5.0,
      reviewsCount: 0,
      hostId: "host_current",
      hostName: "بلال",
      description: description || `سيارة ${brand} ${model} مريحة وممتازة للتنقل داخل الولاية وخارجها.`,
      plates: plates || "07342-124-16",
      features: ["مكيف هواء", "بلوتوث", "نظام فرامل ABS"]
    };

    onAddCar(newCar);
    setShowAddModal(false);

    // reset
    setBrand("");
    setModel("");
    setPricePerDay(6500);
    setDescription("");
    setImage("");

    onAddNotification({
      id: "notif_add_" + Date.now(),
      title: "أضيفت السيارة بنجاح 🎉",
      content: `مركبتك ${brand} ${model} منشورة الآن وقابلة للحجز الفوري للمستأجرين بالمنصة.`,
      type: "host",
      date: "الآن",
      read: false
    });
  };

  const handleUpdate = (updated: CarType) => {
    if (onUpdateCarDetails) {
      onUpdateCarDetails(updated);
    }
    setSelectedCar(updated);
    
    // update in cars context (we will proxy this in App.tsx or use simple list side effects)
    onAddNotification({
      id: "notif_update_" + Date.now(),
      title: "تم تحديث بيانات السيارة ⚙️",
      content: `تم حفظ التعديلات الجديدة بنجاح على مركبتك ${updated.brand} ${updated.model}.`,
      type: "host",
      date: "الآن",
      read: false
    });
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col overflow-hidden text-right relative" dir="rtl">
      
      <AnimatePresence mode="wait">
        {!selectedCar ? (
          /* LIST OF ALL VEHICLES */
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24 px-4 pt-4"
          >
            <div className="flex justify-between items-center mb-6 pt-2">
              <div>
                <span className="text-[10px] text-[#5c61ec] uppercase tracking-widest font-black block select-none">إدارة الأسطول</span>
                <h1 className="text-2xl font-black text-white mt-1 select-none tracking-tight">سياراتي المضافة ({hostCars.length})</h1>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="py-3 px-4 bg-[#5c61ec] hover:bg-[#4d51d9] rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all text-xs font-black gap-1.5 shadow-lg shadow-[#5c61ec]/15"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>إضافة سيارة</span>
              </button>
            </div>

            {hostCars.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-zinc-900 border border-zinc-950 rounded-[24px] p-6">
                <div className="p-4 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-950 mb-4">
                  <Car className="w-8 h-8 text-zinc-650" />
                </div>
                <h3 className="text-sm font-black text-white mb-2">لا توجد سيارات في الأسطول بعد</h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-6 select-none font-medium leading-relaxed">قم بإضافة سيارتك الخاصة للبدء في تأجيرها للمستأجرين الموثوقين بالولاية وجني مدخول إيجابي يومي.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3.5 bg-[#5c61ec] hover:bg-[#4d51d9] text-white rounded-xl text-xs font-black select-none cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#5c61ec]/10"
                >
                  أضف مركبتك الأولى الآن
                </button>
              </div>
            ) : (
              <div className="space-y-4 pb-8">
                {hostCars.map((car) => (
                  <div 
                    key={car.id}
                    className="bg-zinc-900 border border-zinc-950 hover:border-zinc-900 hover:shadow-[#5c61ec]/5 p-4 rounded-[22px] flex flex-col gap-3.5 text-right cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 relative group"
                    onClick={() => setSelectedCar(car)}
                  >
                    <div className="flex gap-4">
                      <div className="relative shrink-0 w-[110px] h-[76px] bg-zinc-950 overflow-hidden rounded-xl border border-zinc-950">
                        <img 
                          src={car.image} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-[13.5px] font-black text-white leading-tight font-sans truncate pr-0.5 group-hover:text-[#5c61ec] transition-colors font-bold">
                              {car.brand} {car.model}
                            </h3>
                            <span className={`text-[8.5px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                              car.isAvailable ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" : "bg-zinc-950 text-zinc-450 border border-zinc-950"
                            }`}>
                              {car.isAvailable ? "متاحة للحجز" : "غير متوفرة"}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-extrabold mt-1 font-sans">الصناعة: <span className="text-zinc-350">{car.year}</span> • رقم اللوحة: <span className="text-zinc-350 font-mono text-[9px]">{car.plates || "غير مدخل"}</span></p>
                        </div>
                        
                        <div className="flex justify-between items-baseline mt-1.5">
                          <span className="text-[10px] text-[#5c61ec] font-black">{car.city}</span>
                          <div className="flex items-baseline gap-0.5" dir="rtl">
                            <span className="text-[13px] font-black text-white font-sans">{car.pricePerDay.toLocaleString()} دج</span>
                            <span className="text-[8.5px] text-zinc-550">/ يوم</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-950 pt-3 mt-0.5">
                      {/* Availability Toggle button */}
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10.5px] font-bold text-zinc-400">حالة التوفر للحجز الفوري:</span>
                        <div className="flex items-center gap-1.5">
                          {car.isAvailable ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
                          )}
                          <button 
                            onClick={() => {
                              onToggleAvailability(car.id);
                              onAddNotification({
                                id: "notif_avail_" + Date.now(),
                                title: car.isAvailable ? "تم تعليق كراء السيارة 🛑" : "تفعيل كراء مركبتك 🟢",
                                content: `سيارتك ${car.brand} ${car.model} أصبحت الآن ${car.isAvailable ? "غير متاحة" : "جاهزة ومتاحة"} للاستئجار بالمنصة.`,
                                type: "host",
                                date: "الآن",
                                read: false
                              });
                            }}
                            className={`flex items-center text-xs shrink-0 cursor-pointer active:scale-95 transition-all outline-none ${car.isAvailable ? 'text-[#5c61ec]' : 'text-zinc-700'}`}
                          >
                            {car.isAvailable ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-500 font-bold group-hover:translate-x-[-2px] transition-transform">عرض الإعدادات</span>
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-650" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* INDIVIDUAL VEHICLE PAGE (HIGH FIDELITY DETAILS & SETTINGS SEGMENTS) */
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col overflow-hidden bg-black"
          >
            {/* Header sub nav */}
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0" dir="rtl">
              <button 
                onClick={() => setSelectedCar(null)}
                className="p-1 px-2 flex items-center justify-center gap-1.5 bg-transparent border-none text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xs font-black text-white select-none">إعدادات السيارة: {selectedCar.brand} {selectedCar.model}</h2>
              <div className="w-10 h-10 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-[#5c61ec] stroke-[2]" />
              </div>
            </div>

            {/* Horizontal Settings tabs Inside Car Profile */}
            <div className="w-full bg-[#111113] border-b border-zinc-900 flex shrink-0 overflow-x-auto no-scrollbar text-[11px] font-black h-12" dir="rtl">
              {[
                { id: "desc", label: "الوصف" },
                { id: "photos", label: "الصور" },
                { id: "features", label: "الميزات" },
                { id: "pricing", label: "التسعير" },
                { id: "availability", label: "التوفر" },
                { id: "location", label: "الموقع" },
                { id: "prefs", label: "تفضيلات الرحلة" },
                { id: "protection", label: "الحماية" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditTab(tab.id as any)}
                  className={`px-4 text-center shrink-0 relative transition-all duration-300 h-full flex items-center justify-center cursor-pointer select-none focus:outline-none text-xs font-bold leading-none ${
                    editTab === tab.id ? "text-[#5c61ec] font-black bg-[#5c61ec]/5" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/20"
                  }`}
                >
                  <span>{tab.label}</span>
                  {editTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabUnderline" 
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5c61ec] rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Active editing segment container */}
            <div className="flex-1 p-4 overflow-y-auto no-scrollbar pb-24 bg-black">
              <AnimatePresence mode="wait">
                {editTab === "desc" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 text-right">
                    <div>
                      <label className="text-xs text-zinc-400 font-bold block mb-1.5">وصف السيارة</label>
                      <textarea
                        value={selectedCar.description || ""}
                        onChange={(e) => handleUpdate({ ...selectedCar, description: e.target.value })}
                        className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-2xl p-3 text-xs text-white outline-none min-h-[140px] text-right font-sans leading-relaxed"
                        placeholder="اكتب وصفاً جذاباً لمركبتك مثل خصائص قيادتها، صيانتها، شروط الكراء..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-xs text-zinc-400 font-bold block mb-1">الشركة المصنعة</label>
                        <input
                          type="text"
                          value={selectedCar.brand}
                          onChange={(e) => handleUpdate({ ...selectedCar, brand: e.target.value })}
                          className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 font-bold block mb-1">الموديل</label>
                        <input
                          type="text"
                          value={selectedCar.model}
                          onChange={(e) => handleUpdate({ ...selectedCar, model: e.target.value })}
                          className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {editTab === "photos" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                    <span className="text-xs font-bold text-zinc-400 block text-right">الصور الحالية للمركبة</span>
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-zinc-900 group">
                      <img src={selectedCar.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800 p-4 rounded-2xl text-right">
                      <span className="text-xs font-black text-white block">رابط صورة جديدة</span>
                      <input
                        type="url"
                        value={selectedCar.image}
                        onChange={(e) => handleUpdate({ ...selectedCar, image: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 mt-2 text-xs text-white outline-none focus:border-[#5c61ec] font-mono text-left"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed font-bold">المرجو استخدام روابط صور ذات جودة عالية لتشجيع الحجز الفوري وزيادة تنافسية السيارة.</p>
                    </div>
                  </motion.div>
                )}

                {editTab === "features" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                    <span className="text-xs font-bold text-zinc-400 block text-right">الميزات المتوفرة بالسيارة</span>
                    
                    <div className="grid grid-cols-2 gap-2 text-right font-sans">
                      {[
                        "مكيف هواء",
                        "بلوتوث و Aux",
                        "مثبت السرعة ذكي",
                        "حساسات خلفية",
                        "كاميرا 360 درجة",
                        "ناقل حركة رياضي",
                        "سقف بانوراما",
                        "مكابح طوارئ آلية"
                      ].map((feat) => {
                        const currentFeats = selectedCar.features || [];
                        const hasFeat = currentFeats.includes(feat);
                        return (
                          <button
                            key={feat}
                            onClick={() => {
                              const updated = hasFeat 
                                ? currentFeats.filter(f => f !== feat)
                                : [...currentFeats, feat];
                              handleUpdate({ ...selectedCar, features: updated });
                            }}
                            className={`p-3 border rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                              hasFeat 
                                ? "bg-[#5c61ec]/10 border-[#5c61ec] text-white" 
                                : "bg-zinc-900/40 border-zinc-800/80 text-zinc-500"
                            }`}
                          >
                            <span>{feat}</span>
                            {hasFeat && <Check className="w-3.5 h-3.5 text-[#5c61ec]" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {editTab === "pricing" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 text-right">
                    <span className="text-xs font-bold text-zinc-400 block">إعدادات الكراء المالي</span>

                    <div className="bg-[#111113] border border-zinc-900 p-4 rounded-2xl space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white block mb-1.5">السعر الأساسي لليوم الواحد</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={selectedCar.pricePerDay}
                            onChange={(e) => handleUpdate({ ...selectedCar, pricePerDay: Number(e.target.value) })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-right text-sm font-black text-white pl-12 font-sans"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">دج / يوم</span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-900 pt-3">
                        <label className="text-xs font-bold text-[#5c61ec] block mb-1">مبلغ الضمان المسترد</label>
                        <div className="relative mt-1">
                          <input
                            type="number"
                            value={selectedCar.deposit || 20000}
                            onChange={(e) => handleUpdate({ ...selectedCar, deposit: Number(e.target.value) })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-right text-xs font-black text-zinc-300 pl-12 font-sans"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">دج</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block pt-1 leading-normal">يتم تجميد الضمان في محفظة المستأجر واسترجاعه تلقائياً عند انتهاء مدة الكراء وسلامة السيارة.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {editTab === "availability" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 text-right">
                    <h4 className="text-xs font-bold text-zinc-400">جدولة التوفر وحالة الترخيص</h4>

                    <div className="bg-[#111113] p-4 border border-zinc-900 rounded-2xl flex justify-between items-center text-right">
                      <div className="flex-1">
                        <span className="text-sm font-black text-white block">متاحة حالياً للحجز الفوري</span>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-normal">تتحكم حالة التوفر بظهور السيارة للمكتتبين بباتنة أو ولايتك الحالية.</p>
                      </div>
                      <button 
                        onClick={() => handleUpdate({ ...selectedCar, isAvailable: !selectedCar.isAvailable })}
                        className={`text-xs p-1 rounded-lg shrink-0 ${selectedCar.isAvailable ? 'text-[#5c61ec]' : 'text-zinc-650'}`}
                      >
                        {selectedCar.isAvailable ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                      </button>
                    </div>
                  </motion.div>
                )}

                {editTab === "location" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 text-right">
                    <span className="text-xs font-bold text-zinc-400 block">مكان تسليم مركبتك</span>
                    
                    <div className="bg-[#111113] border border-zinc-900 p-4 rounded-2xl space-y-3">
                      <div>
                        <label className="text-[11.5px] font-bold text-white block mb-1">الولاية الحالية</label>
                        <select
                          value={selectedCar.city}
                          onChange={(e) => handleUpdate({ ...selectedCar, city: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#5c61ec] text-right font-sans"
                        >
                          <option value="باتنة">باتنة</option>
                          <option value="الجزائر العاصمة">الجزائر العاصمة</option>
                          <option value="وهران">وهران</option>
                          <option value="قسنطينة">قسنطينة</option>
                          <option value="سطيف">سطيف</option>
                          <option value="بجاية">بجاية</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {editTab === "prefs" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 text-right">
                    <span className="text-xs font-bold text-zinc-400 block">تفضيلات شروط الكراء (Trip Preferences)</span>
                    
                    <div className="bg-[#111113] p-4 border border-zinc-900 rounded-2xl space-y-3 font-sans">
                      <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                        <span className="text-xs font-bold text-white">الحد الأدنى لعدد الأيام</span>
                        <span className="text-xs font-black text-[#5c61ec]">2 يوم</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                        <span className="text-xs font-bold text-white">إمكانية التوصيل للمطار</span>
                        <span className="text-xs font-black text-emerald-400">متاحة مجاناً</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-white">السماح بالسفر خارج الولاية</span>
                        <span className="text-xs font-black text-emerald-400 font-sans">نعم (الجزائر كافية)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {editTab === "protection" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 text-right">
                    <span className="text-xs font-bold text-zinc-400 block">خطة الحماية والتأمين (Protection Plan)</span>
                    
                    <div className="bg-gradient-to-br from-[#111113] to-indigo-950/20 border border-[#5c61ec]/15 p-4 rounded-2xl text-right">
                      <ShieldCheck className="w-8 h-8 text-[#5c61ec] mb-2" />
                      <span className="text-xs font-black text-white block">خطة حماية تورو الجزائر المعتمدة</span>
                      <p className="text-[10px] text-zinc-400 leading-normal mt-1.5 font-bold">بموجب هذه الخطة، يتم تعويض أضرار التصادم والسرقة للسيارات بقوة القانون وتغطية تصل إلى 150 مليون سنتيم، مما يحميك ويحمي المستأجرين.</p>
                      
                      <div className="mt-3.5 bg-zinc-900/80 p-2.5 rounded-xl flex items-center gap-2 justify-start border border-zinc-800">
                        <Info className="w-3.5 h-3.5 text-[#5c61ec] shrink-0" />
                        <span className="text-[9px] text-zinc-300 font-bold">%5 نسبة اقتطاع إداري من تورو الجزائر</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD CAR MODAL OVERLAY SHEET */}
      <AnimatePresence>
        {showAddModal && (
          <div className="absolute inset-0 z-[160] bg-black text-white flex flex-col font-sans" dir="rtl">
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0">
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-black text-white">إضافة مركبة للأسطول</h1>
              <div className="w-6" />
            </div>

            <form onSubmit={handleAdd} className="flex-1 p-4 overflow-y-auto space-y-4 text-right no-scrollbar pb-12">
              {/* Quick Template Picker */}
              <div className="space-y-2">
                <span className="text-[10.5px] font-black text-zinc-400 block uppercase">استخدام نموذج جاهز للتسريع</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.model}
                      type="button"
                      onClick={() => {
                        setBrand(tpl.brand);
                        setModel(tpl.model);
                        setPricePerDay(tpl.price);
                        setImage(tpl.img);
                        setCategory(tpl.category);
                      }}
                      className="px-3.5 py-2 bg-[#111113] border border-zinc-800 hover:border-[#5c61ec] rounded-xl shrink-0 text-xs text-white text-right font-bold transition-all"
                    >
                      🚗 {tpl.brand} {tpl.model}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-900 my-4" />

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">الشركة المصنعة</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none"
                  placeholder="مثال: Hyundai, Dacia, Golf"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">الموديل الفئة</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none"
                  placeholder="مثال: Accent, Lodgy, Golf 8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">سنة الصنع</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">السعر اليومي (دج)</label>
                  <input
                    type="number"
                    required
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">ولاية الكراء والتسليم</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none text-right font-sans"
                >
                  <option value="الجزائر العاصمة">الجزائر العاصمة</option>
                  <option value="باتنة">باتنة</option>
                  <option value="وهران">وهران</option>
                  <option value="قسنطينة">قسنطينة</option>
                  <option value="بجاية">بجاية</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">رابط صورة السيارة</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none font-mono text-left"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">رقم لوحة المركبة (مؤيد بالقانون)</label>
                <input
                  type="text"
                  value={plates}
                  onChange={(e) => setPlates(e.target.value)}
                  className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-2.5 text-xs text-white outline-none font-mono text-left"
                  placeholder="34512-118-16"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">وصف كافٍ للمركبة</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111113] border border-zinc-800 focus:border-[#5c61ec] rounded-xl p-3 text-xs text-white min-h-[90px] outline-none text-right font-sans"
                  placeholder="اكتب فكرة سريعة عن نظافة السيارة او اية تفاصيل للمستأجرين."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#5c61ec] text-white text-xs font-black rounded-xl active:scale-95 transition-all text-center cursor-pointer select-none shadow-[0_4px_14px_rgba(92,97,236,0.3)] mt-6"
              >
                تأكيد وإضافة السيارة للأسطول 🚀
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
