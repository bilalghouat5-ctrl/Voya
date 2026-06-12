/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Send, 
  MessageSquare, 
  User, 
  CheckCheck, 
  Sparkles, 
  Headset, 
  ShieldAlert,
  Info 
} from "lucide-react";

interface HostInboxProps {
  onAddNotification: (notif: any) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
}

export default function HostInbox({ onAddNotification, onSetHideBottomNav }: HostInboxProps) {
  const [activeTab, setActiveTab] = useState<"renters" | "support">("renters");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSetHideBottomNav) {
      onSetHideBottomNav(!!activeChatId);
    }
    return () => {
      if (onSetHideBottomNav) {
        onSetHideBottomNav(false);
      }
    };
  }, [activeChatId, onSetHideBottomNav]);

  // List of active renter chats
  const [renterChats, setRenterChats] = useState([
    {
      id: "chat_renter_1",
      name: "عبد الكريم بن يحيى",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      lastMessage: "هل السيارة معقمة وجاهزة بنسبة 100%؟ ميعادنا عند المطار.",
      time: "10:32",
      unread: true,
      car: "Dacia Duster 2024",
      messages: [
        { id: "1", sender: "renter", text: "السلام عليكم يا ميكائيل، بخصوص كراء سيارة ديفندر أو داستر.", time: "09:44" },
        { id: "2", sender: "host", text: "وعليكم السلام ورحمة الله! أهلاً بك أخي عبد الكريم، نعم السيارة جاهزة تماماً.", time: "10:15" },
        { id: "3", sender: "renter", text: "ممتاز، هل السيارة معقمة وجاهزة بنسبة 100%؟ ميعادنا عند المطار.", time: "10:32" }
      ]
    },
    {
      id: "chat_renter_2",
      name: "ليلى قسنطينة",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      lastMessage: "شكراً لك على التعامل السلس والمهني، سأقوم بتقييمك بخمس نجوم.",
      time: "البارحة",
      unread: false,
      car: "Hyundai i20",
      messages: [
        { id: "1", sender: "renter", text: "مساء الخير، هل يمكن تسليم السيارة غداً عند العاشرة صباحاً؟", time: "14:22" },
        { id: "2", sender: "host", text: "أهلاً ليلى، نعم بكل تأكيد. تم غسل وتعبئة خزان المركبة بالوقود غازوال.", time: "14:40" },
        { id: "3", sender: "renter", text: "شكراً لك على التعامل السلس والمهني، سأقوم بتقييمك بخمس نجوم.", time: "البارحة" }
      ]
    }
  ]);

  // Support messages chat stream
  const [supportMessages, setSupportMessages] = useState([
    { id: "supp_1", sender: "support", text: "مرحباً بمستضيفينا الأعزاء بالجزائر 🇩🇿! فريق الدعم الفني لتورو تواصل جاهز لمساعدتكم في أي تسوية مالية أو إدارية.", time: "09:00" }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const userText = typedMessage;
    const timeNow = new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit", hour12: false });
    
    setTypedMessage("");

    if (activeTab === "renters" && activeChatId) {
      // Add message to active renter chat
      setRenterChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            lastMessage: userText,
            time: "الآن",
            messages: [
              ...chat.messages,
              { id: "msg_sent_" + Date.now(), sender: "host" as any, text: userText, time: timeNow }
            ]
          };
        }
        return chat;
      }));

      // Simulate renter reply after short delay
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setRenterChats(prev => prev.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              lastMessage: "صحيح، شكراً جزيلاً! سأتصل بك قريباً.",
              unread: true,
              messages: [
                ...chat.messages,
                { id: "msg_reply_" + Date.now(), sender: "renter" as any, text: "صحيح، شكراً جزيلاً! سأتصل بك فور وصولي للموقع المتفق عليه والمقرر بالتفاصيل.", time: timeNow }
              ]
            };
          }
          return chat;
        }));
      }, 1500);

    } else if (activeTab === "support") {
      setSupportMessages(prev => [
        ...prev,
        { id: "supp_sent_" + Date.now(), sender: "host", text: userText, time: timeNow }
      ]);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setSupportMessages(prev => [
          ...prev,
          { id: "supp_reply_" + Date.now(), sender: "support", text: "تلقينا استفسارك يا بطل! تم إعلام مشرف العمل الإقليمي وتعمل الإدارة حالياً لمراجعة التوثيق أو الرصيد.", time: timeNow }
        ]);
      }, 1500);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [renterChats, supportMessages, isTyping, activeChatId]);

  const currentRenterChat = renterChats.find(chat => chat.id === activeChatId);

  return (
    <div className="w-full h-full bg-[#030303] text-white flex flex-col overflow-hidden text-right" dir="rtl">
      
      <AnimatePresence mode="wait">
        {!activeChatId && activeTab === "renters" ? (
          /* TRIPS MESSAGES LIST */
          <motion.div 
            key="messages-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden w-full"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-2 text-right shrink-0">
              <span className="text-[10px] text-[#5c61ec] uppercase tracking-widest font-black block select-none">صندوق البريد</span>
              <h1 className="text-2xl font-black text-white mt-1 select-none tracking-tight">الرسائل والمحادثات</h1>
            </div>

            {/* Premium Capsular Segment Control matching our style consistency */}
            <div className="px-5 py-2 shrink-0">
              <div className="bg-zinc-950/80 border border-white/[0.04] p-1 rounded-2xl flex divide-x divide-zinc-900 overflow-x-auto no-scrollbar" dir="rtl">
                {[
                  { id: "renters", label: "المستأجرين الجاريين" },
                  { id: "support", label: "دعم تورو الجزائر 🇩🇿" }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === "support") {
                          setActiveTab("support");
                          setActiveChatId("chat_support");
                        } else {
                          setActiveTab("renters");
                          setActiveChatId(null);
                        }
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs font-black cursor-pointer select-none whitespace-nowrap focus:outline-none ${
                        isActive 
                          ? "bg-[#5c61ec] text-white shadow-lg shadow-[#5c61ec]/10" 
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-black space-y-4 pb-24">
              {renterChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    chat.unread = false; // mark as read
                  }}
                  className={`p-4 rounded-[22px] flex gap-4 items-center cursor-pointer transition-all duration-350 text-right border group relative hover:shadow-2xl ${
                    chat.unread 
                      ? "bg-[#5c61ec]/5 border-[#5c61ec]/45 shadow-lg shadow-[#5c61ec]/5" 
                      : "bg-zinc-900 border-zinc-850 hover:border-zinc-700"
                  }`}
                >
                  <div className="relative shrink-0 select-none">
                    <img src={chat.avatar} className="w-12 h-12 rounded-full object-cover border border-white/[0.08]" referrerPolicy="no-referrer" />
                    {chat.unread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-[#5c61ec] rounded-full border-2 border-black animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-[13px] font-black text-white leading-none font-sans group-hover:text-[#5c61ec] transition-colors">{chat.name}</h4>
                      <span className="text-[9.5px] text-zinc-550 font-bold">{chat.time}</span>
                    </div>
                    <span className="text-[9px] text-[#5c61ec] block font-black mt-1 font-sans leading-none">المركبة: {chat.car}</span>
                    <p className="text-[11px] text-zinc-400 mt-2 truncate font-sans font-medium">{chat.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* TRIPS MESSAGE CHAT DIALOG */
          <motion.div 
            key="chat-box"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden bg-black"
          >
            {/* Upper chat header nav */}
            <div className="h-16 border-b border-zinc-900 bg-[#111113] flex items-center px-4 justify-between shrink-0 font-sans">
              <button 
                onClick={() => {
                  setActiveChatId(null);
                  setActiveTab("renters");
                }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-white">
                  {activeTab === "support" ? "دعم وكلاء تورو الجزائر" : currentRenterChat?.name}
                </span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5 leading-none">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  نشط الآن
                </span>
              </div>
              <div className="w-6" />
            </div>

            {/* Message streams inside the individual component */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar flex flex-col justify-end bg-[#030303]" dir="rtl">
              <div className="flex-1" />
              {activeTab === "renters" && currentRenterChat ? (
                currentRenterChat.messages.map((msg, i) => {
                  const isHost = msg.sender === "host";
                  return (
                    <div key={i} className={`flex w-full ${isHost ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 px-4 shadow-md relative ${
                        isHost 
                          ? 'bg-[#5c61ec] text-white rounded-tr-none text-right font-sans font-bold shadow-lg shadow-[#5c61ec]/10' 
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-850 rounded-tl-none text-right font-sans font-medium'
                      }`}>
                        <p className="text-[12px] leading-relaxed">{msg.text}</p>
                        <span className="text-[8px] text-zinc-550 mt-1 block font-mono text-left">{msg.time}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                supportMessages.map((msg, i) => {
                  const isHost = msg.sender === "host";
                  return (
                    <div key={i} className={`flex w-full ${isHost ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 px-4 shadow-md relative ${
                        isHost 
                          ? 'bg-[#5c61ec] text-white rounded-tr-none text-right font-bold' 
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-850 rounded-tl-none text-right'
                      }`}>
                        <p className="text-[12px] leading-relaxed font-sans">{msg.text}</p>
                        <span className="text-[8px] text-zinc-550 mt-1 block font-mono text-left">{msg.time}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex w-full justify-end">
                  <div className="bg-zinc-900 border border-zinc-850 p-3 px-4 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1.5 items-center py-1">
                      <span className="w-1.5 h-1.5 bg-[#5c61ec] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#5c61ec] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#5c61ec] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat bottom form sender */}
            <div className="p-4 bg-[#111113] border-t border-white/[0.03] shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center rounded-2xl bg-zinc-950/80 border border-white/[0.04] p-1.5 pr-4">
                <input 
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="اكتب رسالتك وتواصل مع العميل..."
                  className="flex-grow bg-transparent border-none py-2 px-1 text-xs text-white outline-none font-sans text-right leading-none placeholder-zinc-650"
                  dir="rtl"
                />
                <button 
                  type="submit" 
                  className="w-9 h-9 bg-[#5c61ec] hover:bg-[#4a4fcf] text-white rounded-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-md shadow-[#5c61ec]/10"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
