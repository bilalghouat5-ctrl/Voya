/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Car, User, Notification } from "../types";
import { Plus, ShieldAlert, Check, TrendingUp, DollarSign, ListFilter, AlertCircle, Sparkles, Building, Key, ToggleLeft, ToggleRight, X, Trash2, MessageSquare, Send, ArrowLeft, CheckCheck, Clock, Mail, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CAR_TEMPLATES, ALGERIAN_CITIES } from "../data";

interface HostTabProps {
  cars: Car[];
  user: User;
  onAddCar: (car: Car) => void;
  onDeleteCar: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onAddNotification: (notif: Notification) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
}

export default function HostTab({ cars, user, onAddCar, onDeleteCar, onToggleAvailability, onAddNotification, onSetHideBottomNav }: HostTabProps) {
  const [showAddCarModal, setShowAddCarModal] = useState<boolean>(false);
  
  // Custom states for the high-fidelity Inbox requested
  const [hostModeActive, setHostModeActive] = useState<boolean>(false);
  const [currentInboxTab, setCurrentInboxTab] = useState<"messages" | "notifications">("messages");
  const [activeChat, setActiveChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: "user" | "support"; text: string; time: string }>>([
    { id: "msg_init", sender: "support", text: "مرحباً يا بلال! نرحب بك في تطبيق تورو كراء السيارات الأول بالجزائر 🇩🇿. كيف يمكننا مساعدتك اليوم؟", time: "13:02" }
  ]);
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSetHideBottomNav) {
      onSetHideBottomNav(showAddCarModal || activeChat);
    }
    return () => {
      if (onSetHideBottomNav) {
        onSetHideBottomNav(false);
      }
    };
  }, [showAddCarModal, activeChat, onSetHideBottomNav]);

  // Auto scroll chat to bottom when message is sent or support typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, activeChat]);
  
  // Custom Car Form States
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [category, setCategory] = useState<"economy" | "luxury" | "suv" | "family">("economy");
  const [year, setYear] = useState<number>(2024);
  const [transmission, setTransmission] = useState<"automatic" | "manual">("manual");
  const [fuel, setFuel] = useState<"essence" | "diesel" | "hybrid" | "electric">("essence");
  const [seats, setSeats] = useState<number>(5);
  const [pricePerDay, setPricePerDay] = useState<number>(6000);
  const [deposit, setDeposit] = useState<number>(20000);
  const [city, setCity] = useState<string>("الجزائر العاصمة");
  const [plates, setPlates] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [errors, setErrors] = useState<string>("");

  // Filters Host cars belonging to current host user
  const hostCars = cars.filter(c => c.hostId === user.id || c.agencyId === "agency_batna_auras");

  // Statistics
  const activeRentalsCount = hostCars.filter(c => !c.isAvailable).length;
  const totalListings = hostCars.length;
  const simulatedEarnings = hostCars.reduce((acc, car) => {
    return acc + (car.pricePerDay * (car.reviewsCount || 4) * 0.95);
  }, 0);

  const applyTemplate = (tpl: typeof CAR_TEMPLATES [0]) => {
    setBrand(tpl.brand);
    setModel(tpl.model);
    setCategory(tpl.category);
    setTransmission(tpl.transmission);
    setFuel(tpl.fuel);
    setSeats(tpl.seats);
    setPricePerDay(tpl.pricePerDay);
    setDeposit(tpl.deposit);
    setImage(tpl.image);
    setDescription(tpl.description);
  };

  const handleCreateHostCar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !model || !pricePerDay || !city || !description) {
      setErrors("الرجاء تعبئة كافة الحقول الإلزامية لسيارتك قبل الحفظ.");
      return;
    }

    const defaultImg = image || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600";

    const newCar: Car = {
      id: "host_car_" + Date.now(),
      brand,
      model,
      year: year || 2024,
      category,
      image: defaultImg,
      pricePerDay: Number(pricePerDay),
      transmission,
      city,
      hostId: user.id,
      hostName: `${user.name} (مالك خاص)`,
      rating: 5.0,
      reviewsCount: 0,
      isAvailable: true,
      fuel,
      seats: Number(seats) || 5,
      deposit: Number(deposit) || 15000,
      description,
      plates: plates || "02451-125-05"
    };

    onAddCar(newCar);

    // Notification
    onAddNotification({
      id: "not_host_add_" + Date.now(),
      title: "أضيفت سيارتك في التطبيق للمستأجرين 🚀",
      content: `سيارتك ${brand} ${model} متاحة الآن للطلب والتأجير في ولاية ${city} بسعر ${Number(pricePerDay).toLocaleString()} دج لليوم الواحد.`,
      type: "host",
      date: "الآن",
      read: false
    });

    // Reset Form
    setBrand("");
    setModel("");
    setPricePerDay(6000);
    setCity("الجزائر العاصمة");
    setPlates("");
    setDescription("");
    setImage("");
    setErrors("");
    setShowAddCarModal(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const userMsgText = typedMessage;
    const userMsg = {
      id: "msg_user_" + Date.now(),
      sender: "user" as const,
      text: userMsgText,
      time: new Date().toLocaleTimeString("ar-DZ", { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setTypedMessage("");
    setIsTyping(true);

    // Simulate smart support replies
    setTimeout(() => {
      let replyText = "شكراً لتواصلك معنا! سيقوم أحد ممثلي دعم تورو بالرد عليك قريباً.";
      const lower = userMsgText.toLowerCase();
      if (lower.includes("سلام") || lower.includes("مرحبا") || lower.includes("أهلاً") || lower.includes("صباح") || lower.includes("مساء")) {
        replyText = "أهلاً بك بلال! فريق دعم تورو الجزائر في الخدمة. كيف يمكننا مساعدتك في حجز أو كراء سيارات اليوم؟ ✨";
      } else if (lower.includes("حجز") || lower.includes("سعر") || lower.includes("سيار") || lower.includes("كرى") || lower.includes("تأجير")) {
        replyText = "جميع عروض الإيجار والسيارات المتاحة محددة بأسعار حقيقية. بمجرد إتمام الدفع أو التأكيد من فئة 'البحث'، ستظهر تفاصيل الحجز الفوري في صفحة 'رحلاتي'. 🚗";
      } else if (lower.includes("دج") || lower.includes("محفظ") || lower.includes("رصيد")) {
        replyText = "يمكنك شحن رصيد محفظتك الرقمية بسهولة لتسريع عمليات تأكيد الحجز وإيداع مستحقات الضمان. تواصل مع مالك الماركة أو تورو للدعم.";
      } else if (lower.includes("رخصة") || lower.includes("هوية") || lower.includes("تفعيل")) {
        replyText = "لقد تم التحقق من مستندات القيادة والهوية الوطنية لبلال بنجاح! حسابك نشط ومؤهل لحجز جميع السيارات الفاخرة والمعيارية. ✔️";
      }
      
      setChatMessages(prev => [...prev, {
        id: "msg_supp_" + Date.now(),
        sender: "support" as const,
        text: replyText,
        time: new Date().toLocaleTimeString("ar-DZ", { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-black text-white relative flex flex-col overflow-hidden pb-24 text-right" dir="rtl">
      
      {/* 1. Inbox MODE */}
      <div className="flex flex-col h-full w-full select-none overflow-hidden">
        {/* Header styled matching Screenshot 3 precisely */}
        <div className="w-full bg-[#111113] h-[64px] border-b border-zinc-900/80 relative flex items-center justify-center px-4 shrink-0">
          {/* Centered screen title in Arabic */}
          <h1 className="text-[15.5px] font-black text-white tracking-wide font-sans">
            الرسائل
          </h1>
        </div>

        {/* Sub Navigation Tabs Bar (MESSAGES / NOTIFICATIONS) matching Screenshot 3 */}
        <div className="w-full bg-[#111113] border-b border-zinc-900/60 flex shrink-0 h-10">
          <button
            onClick={() => {
              setCurrentInboxTab("messages");
              setActiveChat(false);
            }}
            className="flex-1 text-center relative focus:outline-none transition-colors h-full flex items-center justify-center cursor-pointer"
          >
            <span className={`text-[10.5px] font-black tracking-widest font-sans ${
              currentInboxTab === "messages" ? "text-white" : "text-zinc-500"
            }`}>
              المحادثات
            </span>
            {currentInboxTab === "messages" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5c61ec] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => {
              setCurrentInboxTab("notifications");
              setActiveChat(false);
            }}
            className="flex-1 text-center relative focus:outline-none transition-colors h-full flex items-center justify-center cursor-pointer"
          >
            <span className={`text-[10.5px] font-black tracking-widest font-sans ${
              currentInboxTab === "notifications" ? "text-white" : "text-zinc-500"
            }`}>
              الإشعارات
            </span>
            {currentInboxTab === "notifications" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5c61ec] rounded-t-full" />
            )}
          </button>
        </div>

          {/* Tab Content Display */}
          <div className="flex-1 overflow-y-auto no-scrollbar w-full relative bg-black">
            {currentInboxTab === "messages" ? (
              activeChat ? (
                /* Dynamic Interactive Support Chat View */
                <div className="flex flex-col h-full w-full bg-zinc-950 font-sans">
                  {/* Chat header area */}
                  <div className="bg-[#111113] px-3.5 py-3 border-b border-zinc-900 flex items-center justify-between shrink-0">
                    <button 
                      onClick={() => setActiveChat(false)}
                      className="p-1 text-zinc-400 hover:text-white"
                      type="button"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-white">دعم تورو الجزائر</span>
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        نشط الآن
                      </span>
                    </div>
                    <div className="w-6" />
                  </div>

                  {/* Message bubble stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar flex flex-col justify-end bg-black">
                    <div className="flex-1" />
                    {chatMessages.map((msg) => {
                      const isUser = msg.sender === "user";
                      return (
                        <div 
                          key={msg.id}
                          className={`flex w-full ${isUser ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[78%] rounded-2xl p-3 px-4 shadow-sm relative ${
                            isUser 
                              ? 'bg-[#5c61ec] text-white rounded-br-none text-right' 
                              : 'bg-zinc-900 text-zinc-150 rounded-bl-none text-right border border-zinc-850'
                          }`}>
                            <p className="text-[11.5px] leading-relaxed font-sans">{msg.text}</p>
                            <span className="text-[8px] text-zinc-400 mt-1 block font-mono text-left">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Support typing simulation */}
                    {isTyping && (
                      <div className="flex w-full justify-end">
                        <div className="bg-zinc-900 text-zinc-150 rounded-2xl p-3 px-4 rounded-bl-none border border-zinc-850">
                          <div className="flex gap-1 items-center py-1">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="bg-[#111113] p-2.5 border-t border-zinc-900 flex gap-2 shrink-0">
                    <input 
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder="اكتب رسالتك للدعم هنا..."
                      className="flex-1 bg-zinc-900 border border-zinc-805 rounded-full p-2.5 px-4 text-xs text-white outline-none focus:border-[#5c61ec] font-sans text-right"
                    />
                    <button 
                      type="submit" 
                      className="p-2.5 bg-[#5c61ec] hover:bg-[#4a4fcf] text-white rounded-full active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4 h-4 transform rotate-180" />
                    </button>
                  </form>
                </div>
              ) : (
                /* The pristine "No messages yet" screen matching Screenshot 3 precisely */
                <div className="flex flex-col items-center justify-center h-full min-h-[420px] px-6 text-center select-none py-10">
                  {/* Outer relative block carrying envelope artwork */}
                  <div className="relative w-80 h-52 flex items-center justify-center mb-6">
                    {/* Dark radial backdrop oval */}
                    <div className="absolute w-[280px] h-[140px] bg-[#141416]/90 rounded-[50%] blur-xl opacity-80 transform -rotate-6" />

                    {/* Fine layout styling grid dots matching Screenshot 3 background */}
                    <div className="absolute top-2 left-8 grid grid-cols-5 gap-1.5 opacity-25">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="w-[3px] h-[3px] bg-zinc-300 rounded-full" />
                      ))}
                    </div>
                    <div className="absolute bottom-4 right-8 grid grid-cols-5 gap-1.5 opacity-25">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="w-[3px] h-[3px] bg-zinc-300 rounded-full" />
                      ))}
                    </div>

                    {/* Horizontal fine lines behind card */}
                    <div className="absolute left-4 right-4 h-[1.5px] bg-[#5c61ec]/15" />
                    <div className="absolute left-10 right-10 h-[1.5px] bg-[#5c61ec]/10 mt-8" />

                    {/* Rounded Envelope Card Styled */}
                    <div className="relative w-[230px] h-[146px] bg-[#5c61ec] rounded-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between p-4.5 border border-[#767bf0]/25 z-10 transform -rotate-[3deg] hover:rotate-0 transition-transform duration-300 group">
                      
                      {/* Stamp and sender lines */}
                      <div className="flex justify-between items-start">
                        {/* Fake sender description lines upper left */}
                        <div className="space-y-1.5 mt-1 text-left">
                          <div className="w-10 h-[2.5px] bg-white/70 rounded-full" />
                          <div className="w-14 h-[2px] bg-white/50 rounded-full" />
                          <div className="w-8 h-[2px] bg-white/50 rounded-full" />
                        </div>

                        {/* Beautiful Vintage Sportcar stamp top right */}
                        <div className="w-12 h-10 bg-white rounded-[6px] p-0.5 border-2 border-dashed border-[#5c61ec]/80 shadow flex items-center justify-center relative rotate-3 overflow-hidden">
                          {/* Inner car drawing representation in pink */}
                          <svg viewBox="0 0 24 24" fill="none" className="w-[28px] h-[28px] text-[#ec4899]" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                            <circle cx="7" cy="17" r="2" className="fill-white" />
                            <circle cx="17" cy="17" r="2" className="fill-white" />
                          </svg>
                        </div>
                      </div>

                      {/* Wave design line in center of card */}
                      <div className="flex justify-center my-0.5">
                        <svg className="w-16 h-3 text-white/45" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M10,12 Q24,4 38,12 T66,12 T94,12" />
                        </svg>
                      </div>

                      {/* Destination block lines down bottom */}
                      <div className="space-y-1.5 text-center flex flex-col items-center">
                        <div className="w-[104px] h-[2.5px] bg-white/70 rounded-full" />
                        <div className="w-14 h-[2px] bg-white/45 rounded-full" />
                      </div>

                    </div>
                  </div>

                  {/* Centered Heading with precise weight and sizing matching Screenshot 3 */}
                  <h2 className="text-[25.5px] font-extrabold text-white tracking-tight font-sans">
                    لا تـوجد رسـائل بـعد
                  </h2>

                  {/* Description subheading and simulation trigger button */}
                  <p className="text-zinc-500 text-[10.5px] font-bold mt-1 max-w-[240px] leading-relaxed">
                     تواصل مع الملاك والمسؤولين مباشرة من حجزك، أو استعمل الشات السريع للتجربة والمساعدة.
                  </p>

                  <button
                    onClick={() => setActiveChat(true)}
                    className="mt-6 px-4.5 py-2 w-54 bg-[#5c61ec] hover:bg-[#4c50cf] text-white text-[11px] font-extrabold rounded-full transition-all shadow-lg shadow-purple-950/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-[#8185f2]/20"
                    type="button"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>تواصل مع الدعم الفني</span>
                  </button>
                </div>
              )
            ) : (
              /* Inside Notifications tab of the Inbox - fully inline! */
              <div className="p-4 space-y-3.5 bg-black min-h-full">
                <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
                  <div className="text-right flex-1">
                    <span className="text-xs font-black text-white">مركز التنبيهات والطلبات 📬</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">تابع حالات طلبات الكراء والموافقة الفورية أولاً بأول.</span>
                  </div>
                </div>

                {/* Simulated notifications cards inside the tab */}
                <div className="space-y-3">
                  <div className="bg-[#121214] p-3.5 rounded-[16px] border border-zinc-900 flex gap-3 text-right">
                    <div className="p-2 bg-purple-950/40 border border-[#5c61ec]/40 rounded-xl h-8 w-8 flex items-center justify-center text-purple-400 shrink-0">
                      <Check className="w-4 h-4 text-[#5c61ec]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11.5px] font-black text-white block">رخصة السياقة مقبولة بنجاح ✔️</span>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-bold">تأكدت تورو من سلامة رخصة سياقتك، يمكنك حجز سيارتك والمغادرة بكل يسر.</p>
                      <span className="text-[9px] text-zinc-500 block mt-1.5 font-bold">اليوم، 11:30</span>
                    </div>
                  </div>

                  <div className="bg-[#121214] p-3.5 rounded-[16px] border border-zinc-900 flex gap-3 text-right">
                    <div className="p-2 bg-amber-950/40 border border-amber-900/60 rounded-xl h-8 w-8 flex items-center justify-center text-amber-400 shrink-0">
                      <AlertCircle className="w-4 h-4 text-amber-450" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11.5px] font-black text-white block">طلب تأمين مسترد متاح الآن</span>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-bold">مبلغ الضمان على كراء المركبة مجاني بنسبة 100% في ولاية باتنة والجزائر مع وكلائنا المعتمدين.</p>
                      <span className="text-[9px] text-zinc-500 block mt-1.5 font-bold">البارحة، 15:44</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
