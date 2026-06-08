/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Notification } from "../types";
import { 
  User as UserIcon, 
  Sparkles, 
  Gift, 
  Compass, 
  HelpCircle, 
  FileText, 
  X, 
  Check, 
  CreditCard, 
  ChevronLeft, 
  ShieldCheck, 
  Wallet, 
  LogOut, 
  Edit2,
  Mail,
  Phone as PhoneIcon,
  Award,
  Building,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileTabProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onAddNotification: (notif: Notification) => void;
  onSetHideBottomNav?: (hide: boolean) => void;
  onChangeTab?: (tab: string) => void;
}

export default function ProfileTab({ user, onUpdateUser, onAddNotification, onSetHideBottomNav, onChangeTab }: ProfileTabProps) {
  // State variables for sub-modals
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [accountSubView, setAccountSubView] = useState<"menu" | "info" | "edit" | "notifications" | "transmission">("menu");
  const [manualTransmissionPref, setManualTransmissionPref] = useState<boolean>(false);
  
  // Notification settings switches based on uploaded screenshot
  const [smsNotifEnabled, setSmsNotifEnabled] = useState<boolean>(true);
  const [pushNotifEnabled, setPushNotifEnabled] = useState<boolean>(true);
  const [emailNotifEnabled, setEmailNotifEnabled] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showGiftCardsModal, setShowGiftCardsModal] = useState<boolean>(false);
  const [showWhyTuroModal, setShowWhyTuroModal] = useState<boolean>(false);
  const [showBecomeHostModal, setShowBecomeHostModal] = useState<boolean>(false);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [showTopUpSheet, setShowTopUpSheet] = useState<boolean>(false);
  const [showLicenseVerification, setShowLicenseVerification] = useState<boolean>(false);
  
  // Custom Car Rental Agency states
  const [showAgencyModal, setShowAgencyModal] = useState<boolean>(false);
  const [agencyName, setAgencyName] = useState<string>("");
  const [agencyManager, setAgencyManager] = useState<string>("");
  const [agencyPhone, setAgencyPhone] = useState<string>("");
  const [agencyState, setAgencyState] = useState<string>("الجزائر العاصمة");
  const [agencyFleetCount, setAgencyFleetCount] = useState<number>(5);
  const [agencyRegistrationNumber, setAgencyRegistrationNumber] = useState<string>("");
  const [isAgencySubmitted, setIsAgencySubmitted] = useState<boolean>(false);

  const isAnyModalOpen = showAccountModal || showGiftCardsModal || showWhyTuroModal || showBecomeHostModal || showLegalModal || showSupportModal || showTopUpSheet || showLicenseVerification || showAgencyModal;

  const handleOpenAccountModal = () => {
    setAccountSubView("menu");
    setShowAccountModal(true);
  };

  React.useEffect(() => {
    if (onSetHideBottomNav) {
      onSetHideBottomNav(false);
    }
    return () => {
      if (onSetHideBottomNav) {
        onSetHideBottomNav(false);
      }
    };
  }, [onSetHideBottomNav]);

  // Form states in Account Modal
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(user.name);
  const [editEmail, setEditEmail] = useState<string>(user.email);
  const [editPhone, setEditPhone] = useState<string>(user.phone);
  const [editAbout, setEditAbout] = useState<string>(user.about || "");
  const [editLives, setEditLives] = useState<string>(user.lives || "");
  const [editWorks, setEditWorks] = useState<string>(user.works || "");
  const [editSchool, setEditSchool] = useState<string>(user.school || "");
  const [editLanguages, setEditLanguages] = useState<string>(user.languages || "");

  // Support Chat states
  const [supportMessage, setSupportMessage] = useState<string>( "");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "مرحباً! أنا مساعد Voya الذكي بالجزائر 🤖. كيف يمكنني مساعدتك بخصوص كراء السيارات، شحن المحفظة، أو توثيق حسابك اليوم؟" }
  ]);

  // Wallet top up states
  const [topUpAmount, setTopUpAmount] = useState<number>(5000);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [isTopUpSuccess, setIsTopUpSuccess] = useState<boolean>(false);

  // License verification states
  const [inputLicense, setInputLicense] = useState<string>("");
  const [inputCni, setInputCni] = useState<string>("");

  // Handle support message send
  const handleSendSupportMessage = () => {
    if (!supportMessage.trim()) return;

    const userMsg = supportMessage;
    const newMsgs = [...chatMessages, { sender: "user" as const, text: userMsg }];
    setChatMessages(newMsgs);
    setSupportMessage("");

    // Automated smart Arabic answers tailored for Algeria Voya users
    setTimeout(() => {
      let botReply = "شكراً لتواصلك مع دعم Voya الجزائر. تم تحويل استفسارك إلى أحد ممثلي الخدمة في قسنطينة/الجزائر العاصمة وسيتم الرد هاتفياً خلال دقائق.";
      if (userMsg.includes("شحن") || userMsg.includes("محفظة") || userMsg.includes("رصيد") || userMsg.includes("دفع")) {
        botReply = "يمكنك شحن محفظتك الرقمية مباشرة عبر البطاقة الذهبية لبريد الجزائر أو البطاقة البنكية CIB لتسريع قبول الحجوزات ودفع الكفالة فورياً.";
      } else if (userMsg.includes("توثيق") || userMsg.includes("رخصة") || userMsg.includes("سياقة") || userMsg.includes("هوية")) {
        botReply = "لتوثيق رخصتك أو بطاقتك بنجاح، يُرجى الانتقال إلى قائمة الحساب والضغط على 'توثيق الحساب'. العملية آلية وتكتمل فورياً بمجرد إدخال البيانات المكتوبة.";
      } else if (userMsg.includes("سعر") || userMsg.includes("خصم") || userMsg.includes("زفاف")) {
        botReply = "نقدم خصومات ممتازة تصل إلى 20% على كراء سيارات الزفاف والسيارات الفاخرة للرحلات الطويلة. كما يتوفر حجز بالسائق مجاناً لولاية تيبازة وبومرداس.";
      }
      setChatMessages(prev => [...prev, { sender: "bot" as const, text: botReply }]);
    }, 1000);
  };

  // Handle wallet top up submission
  const handleWalletTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount <= 0) return;

    const updatedUser: User = {
      ...user,
      walletBalance: user.walletBalance + Number(topUpAmount)
    };
    onUpdateUser(updatedUser);

    onAddNotification({
      id: "wallet_add_" + Date.now(),
      title: "تم شحن المحفظة بنجاح 💸",
      content: `لقد قمت بإيداع مبلغ ${Number(topUpAmount).toLocaleString()} دج بنجاح باستخدام البطاقة الذهبية في رصيدك. سنرسل الفاتورة عبر بريدك الإلكتروني.`,
      type: "wallet",
      date: "الآن",
      read: false
    });

    setIsTopUpSuccess(true);
    setTimeout(() => {
      setIsTopUpSuccess(false);
      setShowTopUpSheet(false);
      setCardNumber("");
    }, 2000);
  };

  // Handle license & identity verification submission
  const handleVerifyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLicense || !inputCni) return;

    onUpdateUser({
      ...user,
      isDriverVerified: true,
      licenseNumber: inputLicense,
      identityCardNumber: inputCni
    });

    onAddNotification({
      id: "license_notif_" + Date.now(),
      title: "تم توثيق رخصتك وبطاقتك بنجاح ✨",
      content: `تمت مراجعة رخصة السياقة رقم ${inputLicense} وبطاقة التعريف الوطنية بالجزائر وتوثيق حسابك فورياً كمستأجر آمن.`,
      type: "system",
      date: "الآن",
      read: false
    });

    setShowLicenseVerification(false);
  };

  // Save account profile updates
  const handleSaveProfile = () => {
    onUpdateUser({
      ...user,
      name: editName,
      email: editEmail,
      phone: editPhone,
      about: editAbout,
      lives: editLives,
      works: editWorks,
      school: editSchool,
      languages: editLanguages
    });
    setEditMode(false);
    onAddNotification({
      id: "profile_update_" + Date.now(),
      title: "تم تحديث الملف الشخصي 👤",
      content: "تمت مزامنة بيانات حسابك وتحديث تفاصيل الاسم والاتصال بنجاح في قاعدة البيانات المحلية.",
      type: "system",
      date: "الآن",
      read: false
    });
  };

  return (
    <div id="profile-tab-view" className="flex flex-col h-full bg-[#030303] text-white overflow-y-auto no-scrollbar pb-24 text-right">
      
      {/* Hidden File Input for Changing Profile Photo */}
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === "string") {
                onUpdateUser({
                  ...user,
                  avatar: reader.result
                });
                onAddNotification({
                  id: "avatar_update_" + Date.now(),
                  title: "تم تحديث الصورة الشخصية 📸",
                  content: "تم تحميل وتعيين صورتك الشخصية الجديدة بنجاح للمستضيفين والضيوف.",
                  type: "system",
                  date: "الآن",
                  read: false
                });
              }
            };
            reader.readAsDataURL(file);
          }
        }}
      />
      
      {/* Profile Header Block matching the screenshot */}
      <div className="px-6 pt-11 pb-4 flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-4">
          {/* Circular Avatar on the right in RTL */}
          <div 
            onClick={handleOpenAccountModal}
            className="w-[58px] h-[58px] rounded-full overflow-hidden bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform shrink-0"
          >
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-zinc-200 text-lg font-bold">★</span>
            )}
          </div>
          
          {/* Name & View Profile Link */}
          <div className="text-right">
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">
              {user.name.split(" ")[1] || user.name}
            </h1>
            <button 
              onClick={handleOpenAccountModal}
              className="text-xs text-[#5c61ec] hover:text-[#7f83f2] font-semibold mt-1 transition-colors leading-none block text-right"
            >
              عرض وتعديل الملف الشخصي
            </button>
          </div>
        </div>
      </div>

      {/* Become a Host Card designed exactly like the screenshot but localized in Arabic RTL */}
      <div id="become-host-card" className="mx-6 my-2.5 bg-[#19191b] rounded-[22px] overflow-hidden flex border border-zinc-900/60 shadow-lg relative" dir="rtl">
        {/* Right Side (Text content) */}
        <div className="flex-1 p-[22px] pr-6 flex flex-col justify-between text-right z-10">
          <div>
            <h2 className="text-[17px] font-black text-white leading-snug">
              كن مضيفاً
            </h2>
            <p className="text-[11px] text-zinc-300 font-medium mt-1.5 leading-relaxed">
              انضم إلى آلاف المضيفين الذين يبنون مشاريعهم ويحققون دخلاً معتبراً على Voya.
            </p>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => {
                setShowBecomeHostModal(true);
              }}
              className="px-5 py-2.5 bg-[#5c61ec] hover:bg-[#4b50d3] active:scale-95 transition-all text-xs font-black text-white rounded-[12px] shadow-[0_4px_14px_rgba(92,97,236,0.3)] cursor-pointer border border-[#6f73f7]/20"
            >
              معرفة المزيد
            </button>
          </div>
        </div>
        
        {/* Left Side (Image crop with nice blend) */}
        <div className="w-[38%] shrink-0 relative bg-zinc-900">
          <img 
            src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=300" 
            alt="Become a Host" 
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#19191b] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-2" />

      {/* Menu Options List in RTL and matching the screenshot format */}
      <div className="flex flex-col" dir="rtl">
        {/* Account */}
        <button 
          onClick={handleOpenAccountModal}
          className="w-full px-6 py-4.5 flex items-center gap-4 hover:bg-zinc-900/30 active:bg-zinc-900/50 transition-colors text-right cursor-pointer"
        >
          <UserIcon className="w-5 h-5 text-white stroke-[2]" />
          <span className="text-sm font-bold text-white">الحساب</span>
        </button>

        {/* Divider */}
        <div className="border-b border-zinc-900/40 mx-6 my-1.5" />

        {/* Ask Voya */}
        <button 
          onClick={() => setShowSupportModal(true)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-900/30 active:bg-zinc-900/50 transition-colors text-right cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Sparkles className="w-5 h-5 text-white stroke-[2]" />
            <span className="text-sm font-bold text-white">اسأل Voya</span>
          </div>
          {/* Sparkly purple Chip */}
          <div className="flex items-center gap-1.5 bg-[#5c61ec]/10 border border-[#5c61ec]/25 px-2 py-0.5 rounded-[5px]">
            <Sparkles className="w-2.5 h-2.5 text-[#5c61ec] fill-[#5c61ec]" />
            <span className="text-[9px] font-extrabold text-[#5c61ec]">جديد</span>
          </div>
        </button>

        {/* Gift cards */}
        <button 
          onClick={() => setShowGiftCardsModal(true)}
          className="w-full px-6 py-4.5 flex items-center gap-4 hover:bg-zinc-900/30 active:bg-zinc-900/50 transition-colors text-right cursor-pointer"
        >
          <Gift className="w-5 h-5 text-white stroke-[2]" />
          <span className="text-sm font-bold text-white">بطاقات الهدايا (Voya Gift)</span>
        </button>

        {/* Why choose Voya */}
        <button 
          onClick={() => setShowWhyTuroModal(true)}
          className="w-full px-6 py-4.5 flex items-center gap-4 hover:bg-zinc-900/30 active:bg-zinc-900/50 transition-colors text-right cursor-pointer"
        >
          <Compass className="w-5 h-5 text-white stroke-[2]" />
          <span className="text-sm font-bold text-white">لماذا تختار Voya</span>
        </button>

        {/* Get help */}
        <button 
          onClick={() => setShowSupportModal(true)}
          className="w-full px-6 py-4.5 flex items-center gap-4 hover:bg-zinc-900/30 active:bg-zinc-900/50 transition-colors text-right cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-white stroke-[2]" />
          <span className="text-sm font-bold text-white">الحصول على المساعدة</span>
        </button>

        {/* Legal */}
        <button 
          onClick={() => setShowLegalModal(true)}
          className="w-full px-6 py-4.5 flex items-center gap-4 hover:bg-zinc-900/30 active:bg-zinc-900/50 transition-colors text-right cursor-pointer"
        >
          <FileText className="w-5 h-5 text-white stroke-[2]" />
          <span className="text-sm font-bold text-white">الشؤون القانونية</span>
        </button>

        {/* Divider before log out */}
        <div className="border-b border-zinc-900/40 mx-6 my-2" />

        {/* Log out */}
        <button 
          onClick={() => {
            if (window.confirm("هل ترغب حقاً في تسجيل الخروج؟")) {
              alert("تم تسجيل الخروج كمحاكاة فقط؛ ستبقى جلسة بلال نشطة.");
            }
          }}
          className="w-full px-6 py-4.5 text-right font-bold text-sm text-white hover:bg-zinc-900/20 active:bg-zinc-900/40 cursor-pointer"
        >
          تسجيل الخروج
        </button>

        {/* Version Code Label */}
        <div className="px-6 mt-4 mb-16 select-none text-right">
          <span className="text-[11px] font-medium text-zinc-600 tracking-wide font-mono">
            Version 26.22.0
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showAccountModal && (
          <div className="absolute inset-0 z-50 flex flex-col bg-black text-white text-right font-sans" dir="rtl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full flex flex-col overflow-hidden bg-black"
            >
              {accountSubView === "menu" ? (
                <div className="w-full h-full flex flex-col bg-black overflow-y-auto no-scrollbar pb-[108px]" dir="rtl">
                  {/* Top Navigation Bar with Arabic aligned circle arrow on the right */}
                  <div className="relative flex items-center justify-center w-full h-16 shrink-0 border-b border-zinc-900/10">
                    <button
                      onClick={() => setShowAccountModal(false)}
                      className="absolute right-6 w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      title="خروج"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-base font-extrabold text-[#f4f4f5]">الحساب</h1>
                  </div>

                  {/* List items exactly matching the user's screenshot format but reversed for RTL */}
                  <div className="flex-1 px-6 divide-y divide-zinc-900/40">
                    {/* Item 1: Account Info */}
                    <button 
                      onClick={() => setAccountSubView("info")}
                      className="w-full py-5 flex items-center justify-between text-right hover:bg-zinc-900/10 cursor-pointer transition-colors"
                    >
                      <span className="text-[15px] font-bold text-white">معلومات الحساب</span>
                      <ChevronLeft className="w-5 h-5 text-zinc-500" />
                    </button>

                    {/* Item 2: Notification Settings */}
                    <button 
                      onClick={() => {
                        setAccountSubView("notifications");
                      }}
                      className="w-full py-5 flex items-center justify-between text-right hover:bg-zinc-900/10 cursor-pointer transition-colors"
                    >
                      <span className="text-[15px] font-bold text-white">إعدادات الإشعارات</span>
                      <ChevronLeft className="w-5 h-5 text-zinc-500" />
                    </button>

                    {/* Item 3: Travel Credit */}
                    <div className="w-full py-5 flex items-center justify-between text-right">
                      <span className="text-[15px] font-bold text-white">رصيد السفر</span>
                      <span className="text-[15px] font-extrabold text-zinc-400 font-mono">0 دج</span>
                    </div>

                    {/* Item 4: Redeem Gift Card */}
                    <button 
                      onClick={() => {
                        setShowGiftCardsModal(true);
                      }}
                      className="w-full py-5 flex items-center justify-start text-right hover:bg-zinc-900/10 cursor-pointer"
                    >
                      <span className="text-[15px] font-bold text-indigo-400">استرداد بطاقة هدايا</span>
                    </button>

                    {/* Item 5: Add Travel Credit */}
                    <button 
                      onClick={() => {
                        setShowTopUpSheet(true);
                      }}
                      className="w-full py-5 flex items-center justify-start text-right hover:bg-zinc-900/10 cursor-pointer"
                    >
                      <span className="text-[15px] font-bold text-indigo-400">إضافة رصيد سفر</span>
                    </button>

                    {/* Item 6: Manual Transmission */}
                    <button 
                      onClick={() => setAccountSubView("transmission")}
                      className="w-full py-5 flex items-center justify-between text-right hover:bg-zinc-900/10 cursor-pointer transition-colors"
                    >
                      <span className="text-[15px] font-bold text-white">ناقل حركة يدوي</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400">
                          {manualTransmissionPref ? "نعم، قادر" : "لا، غير قادر"}
                        </span>
                        <ChevronLeft className="w-5 h-5 text-zinc-500" />
                      </div>
                    </button>
                  </div>

                  {/* Absolute Bottom Solid Indigo LOG OUT Action Button */}
                  <div className="px-6 pt-5 pb-4">
                    <button
                      onClick={() => {
                        if (window.confirm("هل ترغب حقاً في تسجيل الخروج؟")) {
                          alert("تم تسجيل الخروج كمحاكاة فقط؛ ستبقى جلسة بلال نشطة.");
                        }
                      }}
                      className="w-full py-4 bg-[#5c61ec] hover:bg-[#4b50d3] active:scale-[0.98] text-white font-extrabold text-[15px] rounded-[14px] shadow-md transition-all text-center cursor-pointer select-none"
                    >
                      تسجيل الخروج
                    </button>
                  </div>

                  {/* Absolute Bottom Red Clear My Account Link */}
                  <div className="pb-12 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm("هل أنت متأكد من رغبتك في إغلاق حسابك نهائياً؟")) {
                          alert("تم إرسال طلب إغلاق الحساب؛ ستتم معالجته خلال 24 ساعة.");
                        }
                      }}
                      className="text-red-500 hover:text-red-400 font-extrabold text-sm select-none cursor-pointer"
                    >
                      إغلاق حسابي
                    </button>
                  </div>
                </div>
              ) : accountSubView === "info" ? (
                /* SCREEN 1: ACCOUNT INFO MODE (MIRRORS THE UPLOADED SCREENSHOT PRECISELY IN ARABIC RTL) */
                <div className="w-full h-full flex flex-col bg-[#050505] overflow-y-auto no-scrollbar pb-[108px]" dir="rtl">
                  {/* Top Navigation Bar mirroring layout closely with RTL back button on right */}
                  <div className="relative flex items-center justify-center w-full h-16 shrink-0 border-b border-zinc-950 px-6">
                    {/* Back Arrow button positioned on the right wrapper for RTL */}
                    <button
                      onClick={() => {
                        setAccountSubView("menu");
                      }}
                      className="absolute right-6 w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      title="رجوع"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                    
                    {/* Header Title Centered */}
                    <h1 className="text-base font-extrabold text-[#f4f4f5] tracking-tight">معلومات الحساب</h1>
                  </div>

                  {/* Body Container */}
                  <div className="flex-1 px-6 pt-6 divide-y divide-zinc-900/60 pb-12">
                    
                    {/* Preferred first name row exactly like screenshot top item */}
                    <div className="py-4 text-right">
                      <div className="flex justify-between items-center text-right py-1">
                        <span className="text-sm font-semibold text-zinc-400">الاسم الأول المفضل</span>
                        <span className="text-base font-bold text-zinc-100">Ghouat</span>
                      </div>

                      {/* Info alert banner exactly matching the style, padding and color tone of screenshot */}
                      <div className="mt-4 bg-[#0a2540] border border-[#1b3d61]/30 rounded-[18px] p-5 flex flex-col items-start text-right">
                        <div className="flex gap-3.5 items-start">
                          {/* Symmetrical Information badge with inline i */}
                          <div className="w-[19px] h-[19px] rounded-full bg-[#1366c8] flex items-center justify-center text-white shrink-0 font-sans font-black select-none text-[10.5px]">
                            i
                          </div>
                          <span className="text-[12.5px] font-medium text-blue-200/90 leading-relaxed text-right md:text-sm">
                            نحتاج إلى المزيد من المعلومات لإكمال حسابك قبل أن تتمكن من تعديل اسمك الأول المفضل.
                          </span>
                        </div>
                        
                        {/* Inline custom submit action CTA on bottom left (as in screenshot) */}
                        <div className="w-full flex justify-end mt-4">
                          <button
                            onClick={() => {
                              setAccountSubView("edit");
                            }}
                            className="px-4 py-2 bg-[#05111f] hover:bg-[#091b30] border border-[#1b3d61]/40 text-xs font-bold text-white rounded-xl active:scale-95 transition-transform cursor-pointer"
                          >
                            إرسال المعلومات
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Email row matching the screenshot */}
                    <div 
                      onClick={() => setAccountSubView("edit")}
                      className="py-5 text-right cursor-pointer hover:bg-zinc-900/10 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-400">البريد الإلكتروني</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-zinc-200 font-sans">{user.email || "bilalghouat5@gmail.com"}</span>
                          <ChevronLeft className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                      <div className="flex justify-end mt-0.5">
                        <span className="text-[11px] font-extrabold text-indigo-400 pr-1 select-none">تم التحقق</span>
                      </div>
                    </div>

                    {/* Mobile phone row matching the screenshot */}
                    <div 
                      onClick={() => setAccountSubView("edit")}
                      className="py-5 text-right cursor-pointer hover:bg-zinc-900/10 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-400">الهاتف المحمول</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-red-500">{user.phone || "لم يتم التحقق"}</span>
                          <ChevronLeft className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                    </div>

                    {/* Password row matching the screenshot */}
                    <div 
                      onClick={() => {
                        alert("تم تأمين الجلسة بكلمة مرور نشعة. لإعادة التعيين يرجى استخدام رابط استعادة البريد الإلكتروني.");
                      }}
                      className="py-5 text-right cursor-pointer hover:bg-zinc-900/10 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-400">كلمة المرور</span>
                        <ChevronLeft className="w-5 h-5 text-zinc-500" />
                      </div>
                    </div>

                    {/* Google row matching the screenshot */}
                    <div 
                      onClick={() => {
                        alert("حساب جوجل متصل ببريدك الإلكتروني بشكل آمن لتسريع تسجيل الدخول.");
                      }}
                      className="py-5 text-right cursor-pointer hover:bg-zinc-900/10 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-400">جوجل</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-zinc-500">غير متصل</span>
                          <ChevronLeft className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : accountSubView === "notifications" ? (
                /* SCREEN 3: NOTIFICATION SETTINGS MODE (MATCHES THE SCREENSHOT PRECISELY) */
                <div className="w-full h-full flex flex-col bg-[#050505] overflow-y-auto no-scrollbar pb-[108px]" dir="rtl">
                  {/* Top Navigation Bar with back button on the right */}
                  <div className="relative flex items-center justify-center w-full h-16 shrink-0 border-b border-zinc-900/10 px-6">
                    <button
                      onClick={() => setAccountSubView("menu")}
                      className="absolute right-6 w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      title="رجوع"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-base font-extrabold text-[#f4f4f5]">إعدادات الإشعارات</h1>
                  </div>

                  {/* Body Container */}
                  <div className="flex-1 px-6 pt-5 divide-y divide-zinc-900/40 pb-12 text-right">
                    {/* Section 1: Mobile Notifications */}
                    <div className="py-4">
                      <span className="text-[11px] font-black tracking-wider text-zinc-500 block pb-3">
                        إشعارات الهاتف المحمول (MOBILE NOTIFICATIONS)
                      </span>

                      {/* Row 1: Trip and account updates (SMS) */}
                      <div className="flex justify-between items-center py-4 border-b border-zinc-900/30">
                        <span className="text-[15px] font-bold text-white">تحديثات الرحلات والحساب (SMS)</span>
                        <button
                          onClick={() => {
                            const nextState = !smsNotifEnabled;
                            setSmsNotifEnabled(nextState);
                            onAddNotification({
                              id: "sms_pref_" + Date.now(),
                              title: "تنبيهات الأس أم أس 📱",
                              content: `تم ${nextState ? "تفعيل" : "إيقاف"} تحديثات الرحلات عبر SMS لحساب بلال.`,
                              type: "system",
                              date: "الآن",
                              read: false
                            });
                          }}
                          className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                            smsNotifEnabled ? "bg-[#5c61ec] justify-start" : "bg-zinc-800 justify-end"
                          }`}
                        >
                          <motion.div
                            layout
                            className="w-5.5 h-5.5 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>

                      {/* Row 2: Push Notifications */}
                      <button
                        onClick={() => {
                          const nextState = !pushNotifEnabled;
                          setPushNotifEnabled(nextState);
                          onAddNotification({
                            id: "push_pref_" + Date.now(),
                            title: "الإشعارات الفورية 🔔",
                            content: `تم ${nextState ? "تفعيل" : "إيقاف"} الإشعارات الفورية على جهازك.`,
                            type: "system",
                            date: "الآن",
                            read: false
                          });
                        }}
                        className="w-full py-5 flex items-center justify-between text-right hover:bg-zinc-900/10 cursor-pointer"
                      >
                        <span className="text-[15px] font-bold text-white">الإشعارات الفورية</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-400">
                            {pushNotifEnabled ? "مفعلة" : "معطلة"}
                          </span>
                          <ChevronLeft className="w-5 h-5 text-zinc-500" />
                        </div>
                      </button>
                    </div>

                    {/* Section 2: Email Notifications */}
                    <div className="py-6">
                      <span className="text-[11px] font-black tracking-wider text-zinc-400 block pb-3">
                        إشعارات البريد الإلكتروني (EMAIL NOTIFICATIONS)
                      </span>

                      {/* Row 3: Promotions and announcements */}
                      <div className="flex justify-between items-center py-4">
                        <span className="text-[15px] font-bold text-white">العروض الترويجية والإعلانات</span>
                        <button
                          onClick={() => {
                            const nextState = !emailNotifEnabled;
                            setEmailNotifEnabled(nextState);
                            onAddNotification({
                              id: "email_pref_" + Date.now(),
                              title: "تنبيهات البريد الإلكتروني 📧",
                              content: `تم ${nextState ? "تفعيل" : "إيقاف"} استقبال العروض الترويجية في بريدك الإلكتروني.`,
                              type: "system",
                              date: "الآن",
                              read: false
                            });
                          }}
                          className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                            emailNotifEnabled ? "bg-[#5c61ec] justify-start" : "bg-zinc-800 justify-end"
                          }`}
                        >
                          <motion.div
                            layout
                            className="w-5.5 h-5.5 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ) : accountSubView === "transmission" ? (
                /* SCREEN 4: MANUAL TRANSMISSION OPTIONS (PRECISELY LIKE THE SCREENSHOT IN ARABIC RTL) */
                <div className="w-full h-full flex flex-col bg-[#050505] overflow-y-auto no-scrollbar pb-[108px]" dir="rtl">
                  {/* Top Navigation Bar with glassmorphic back button on the right */}
                  <div className="relative flex items-center justify-center w-full h-16 shrink-0 border-b border-zinc-900/10 px-6">
                    <button
                      onClick={() => setAccountSubView("menu")}
                      className="absolute right-6 w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      title="رجوع"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-base font-extrabold text-[#f4f4f5]">ناقل الحركة اليدوي</h1>
                  </div>

                  {/* Body Container matching layout closely */}
                  <div className="flex-1 px-6 pt-7 pb-12 text-right">
                    <p className="text-[14.5px] font-medium text-zinc-300 leading-relaxed mb-8">
                      تحتوي بعض السيارات على ناقل حركة يدوي (عادي). هل أنت قادر على قيادة سيارات مجهزة بناقل حركة عادي (عصا التحكم)؟
                    </p>

                    <div className="space-y-1">
                      {/* Option 1: Yes */}
                      <button
                        onClick={() => {
                          setManualTransmissionPref(true);
                          onAddNotification({
                            id: "transmission_yes_" + Date.now(),
                            title: "تحديث ناقل الحركة ⚙️",
                            content: "تم تعيين تفضيل ناقل الحركة اليدوي إلى (قادر على قيادة السيارات العادية).",
                            type: "system",
                            date: "الآن",
                            read: false
                          });
                        }}
                        className="w-full py-5 flex items-center justify-between text-right border-b border-zinc-900/30 hover:bg-zinc-900/10 cursor-pointer transition-colors"
                      >
                        <span className="text-[15px] font-bold text-white">نعم، أنا قادر على قيادة سيارات بناقل حركة يدوي</span>
                        <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          manualTransmissionPref 
                            ? "border-indigo-400 bg-indigo-500/10" 
                            : "border-zinc-700 bg-transparent"
                        }`}>
                          {manualTransmissionPref && (
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          )}
                        </div>
                      </button>

                      {/* Option 2: No */}
                      <button
                        onClick={() => {
                          setManualTransmissionPref(false);
                          onAddNotification({
                            id: "transmission_no_" + Date.now(),
                            title: "تحديث ناقل الحركة ⚙️",
                            content: "تم إلغاء تفعيل ناقل الحركة اليدوي (غير قادر على قيادة العادي).",
                            type: "system",
                            date: "الآن",
                            read: false
                          });
                        }}
                        className="w-full py-5 flex items-center justify-between text-right border-b border-zinc-900/30 hover:bg-zinc-900/10 cursor-pointer transition-colors"
                      >
                        <span className="text-[15px] font-bold text-white">لا، لست قادراً على قيادة سيارات بناقل حركة يدوي</span>
                        <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          !manualTransmissionPref 
                            ? "border-indigo-400 bg-indigo-500/10" 
                            : "border-zinc-700 bg-transparent"
                        }`}>
                          {!manualTransmissionPref && (
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* SCREEN 2: PROFILE EDIT MODE */
                <div className="w-full h-full flex flex-col bg-black">
                  
                  {/* Top Navigation Bar with Cancel Action on the right */}
                  <div className="relative flex items-center justify-center w-full h-16 shrink-0 border-b border-zinc-900/10 px-6">
                    <button
                      onClick={() => setAccountSubView("info")}
                      className="absolute right-6 w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      title="تراجع"
                    >
                      <ArrowRight className="w-5 h-5 text-zinc-100" />
                    </button>
                    
                    {/* Header Title displaying User's Name */}
                    <h1 className="text-base font-extrabold text-zinc-100">
                      تعديل الحساب
                    </h1>
                  </div>

                  {/* Body Area */}
                  <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 space-y-6">
                    
                    {/* Change Profile Photo Row */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer select-none"
                    >
                      <div className="border-t border-[#1c1c1e] py-4.5 flex justify-between items-center text-right hover:text-zinc-300 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                        <span className="text-[14px] font-bold text-zinc-105 group-hover:text-white">تغيير الصورة الشخصية</span>
                      </div>
                      <p className="text-[11px] text-[#8e8e93] font-medium leading-relaxed text-right mt-1">
                        يرجى إضافة صورة شخصية تظهر وجهك بوضوح. سيساعد ذلك المضيفين والضيوف على التعرف عليك في بداية الرحلة.
                      </p>
                    </div>

                    {/* Divider line */}
                    <div className="border-b border-[#1c1c1e]"></div>

                    {/* About Textarea Input */}
                    <div className="space-y-2 mt-2">
                      <label className="text-[14px] font-bold text-zinc-100 block text-right">نبذة عني</label>
                      <textarea
                        value={editAbout}
                        onChange={(e) => setEditAbout(e.target.value)}
                        placeholder="أخبر المضيفين والضيوف عن نفسك وعن اهتماماتك..."
                        rows={3}
                        className="w-full text-xs font-semibold bg-[#111112] border border-zinc-800/80 hover:border-zinc-700/80 focus:border-[#5c61ec] rounded-xl p-3.5 text-white outline-none text-right transition-all resize-none leading-relaxed"
                      />
                      <p className="text-[10px] text-[#8e8e93] font-medium leading-relaxed text-right mt-1.5">
                        أخبر المضيفين والضيوف عن نفسك ولماذا أنت شخص مسؤول وجدير بالثقة. شارك تجارب السفر المفضلة لديك، أو هواياتك، أو سيارتك المفضلة، أو خبرتك في القيادة. لا تتردد في إضافة روابط لملفاتك الشخصية على LinkedIn أو Twitter أو Facebook حتى يتعرفوا عليك بشكل أفضل.
                      </p>
                    </div>

                    {/* Symmetrical Editable List Fields */}
                    <div className="mt-8 border-t border-[#1c1c1e] divide-y divide-[#1c1c1e]">
                      {/* Lives */}
                      <div className="py-4 flex justify-between items-center text-right">
                        <span className="text-sm font-bold text-zinc-100">أعيش في</span>
                        <input
                          type="text"
                          value={editLives}
                          onChange={(e) => setEditLives(e.target.value)}
                          placeholder="أدخل مكان الإقامة"
                          className="bg-transparent border-none text-xs text-zinc-400 text-left outline-none py-1 focus:text-white max-w-[180px] text-left"
                        />
                      </div>

                      {/* Works */}
                      <div className="py-4 flex justify-between items-center text-right">
                        <span className="text-sm font-bold text-zinc-100">مكان العمل</span>
                        <input
                          type="text"
                          value={editWorks}
                          onChange={(e) => setEditWorks(e.target.value)}
                          placeholder="أدخل مكان العمل"
                          className="bg-transparent border-none text-xs text-zinc-400 text-left outline-none py-1 focus:text-white max-w-[180px] text-left"
                        />
                      </div>

                      {/* School */}
                      <div className="py-4 flex justify-between items-center text-right">
                        <span className="text-sm font-bold text-zinc-100">الدراسة</span>
                        <input
                          type="text"
                          value={editSchool}
                          onChange={(e) => setEditSchool(e.target.value)}
                          placeholder="أدخل مكان الدراسة"
                          className="bg-transparent border-none text-xs text-zinc-400 text-left outline-none py-1 focus:text-white max-w-[180px] text-left"
                        />
                      </div>

                      {/* Languages */}
                      <div className="py-4 flex justify-between items-center text-right">
                        <span className="text-sm font-bold text-zinc-100">اللغات</span>
                        <input
                          type="text"
                          value={editLanguages}
                          onChange={(e) => setEditLanguages(e.target.value)}
                          placeholder="مثال: العربية، الفرنسية"
                          className="bg-transparent border-none text-xs text-zinc-400 text-left outline-none py-1 focus:text-white max-w-[180px] text-left"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Absolute Bottom Solid Indigo SAVE Action Button */}
                  <div className="p-5 bg-black border-t border-[#1c1c1e] shrink-0">
                    <button
                      onClick={() => {
                        onUpdateUser({
                          ...user,
                          name: editName,
                          email: editEmail,
                          phone: editPhone,
                          about: editAbout,
                          lives: editLives,
                          works: editWorks,
                          school: editSchool,
                          languages: editLanguages
                        });
                        setAccountSubView("info");
                        onAddNotification({
                          id: "profile_update_" + Date.now(),
                          title: "تم تحديث الملف الشخصي 👤",
                          content: "تمت مزامنة بيانات حسابك وتحديث تفاصيل الاسم والاتصال بنجاح في قاعدة البيانات المحلية.",
                          type: "system",
                          date: "الآن",
                          read: false
                        });
                      }}
                      className="w-full py-4 bg-[#5c61ec] hover:bg-[#4b50d3] active:scale-[0.98] text-white font-extrabold text-[15px] rounded-[14px] shadow-md transition-all text-center cursor-pointer select-none"
                    >
                      حفظ
                    </button>
                  </div>

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL 2: Support Chat / Ask Turo Modal
       ***********************************************/}
      <AnimatePresence>
        {showSupportModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-white text-right font-sans" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 rounded-[28px] w-full max-w-sm h-[75%] flex flex-col overflow-hidden border border-zinc-805"
            >
              <div className="bg-zinc-900 p-4 border-b border-zinc-800/80 flex justify-between items-center shrink-0">
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="p-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white"
                  title="إغلاق التقرير"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <h3 className="text-xs font-extrabold text-white">مساعد Voya الذكي 🤖</h3>
                    <p className="text-[9px] text-[#5c61ec] font-bold">دعم فوري • الجزائر بالكامل</p>
                  </div>
                </div>
              </div>

              {/* Message Feed Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#08080a] no-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-3 max-w-[85%] rounded-[18px] text-[10.5px] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#5c61ec] text-white rounded-tr-none border border-[#6f73f7]"
                        : "bg-[#18181b] text-zinc-200 rounded-tl-none border border-zinc-850"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Inputs */}
              <div className="p-3 bg-zinc-900 border-t border-zinc-800/90 flex gap-2 shrink-0">
                <input 
                  id="support-message"
                  type="text"
                  placeholder="اكتب استفسارك هنا..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendSupportMessage();
                  }}
                  className="flex-1 text-xs bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2.5 outline-none focus:border-purple-550 text-right"
                />
                <button
                  onClick={handleSendSupportMessage}
                  className="px-4 py-2.5 bg-[#5c61ec] border border-[#6f73f7]/50 text-white text-xs font-black rounded-full hover:bg-[#4b50d3] active:scale-95 transition-all text-center cursor-pointer"
                >
                  إرسال
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL 3: Gift Cards Modal
       ***********************************************/}
      <AnimatePresence>
        {showGiftCardsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 text-white text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#101012] border border-zinc-800 rounded-[28px] w-full max-w-sm p-6 space-y-4 text-right"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setShowGiftCardsModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#5c61ec]" />
                  <h3 className="text-sm font-extrabold text-white">بطاقات الهدايا (Voya Gift)</h3>
                </div>
              </div>

              <div className="space-y-4 py-2 text-right">
                <div className="aspect-[16/9] rounded-[18px] bg-gradient-to-tr from-indigo-950 via-[#1c1d3a] to-[#401e4a] p-5 flex flex-col justify-between border border-[#5c61ec]/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#5c61ec]/10 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">Voya Algeria Gift</span>
                    <span className="text-sm font-extrabold text-[#7f83f2] font-mono">15,000 دج</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[9px] text-zinc-400 leading-none">رقم بطاقة الهدايا:</p>
                    <p className="text-xs font-mono font-black text-white mt-1 select-all tracking-wider">TU-DZ-GOLD-2026-XQ5</p>
                  </div>
                </div>

                <div className="space-y-2 text-[10.5px] leading-relaxed text-zinc-400">
                  <p>• يمكن شراء بطاقات هدايا Voya بالجزائر لشحن رصيد الأصدقاء، العائلات والمحبين لاستكشاف ولايات الجزائر الرائعة وبأسعار تنافسية.</p>
                  <p>• فئات الكوبونات متوفرة بقيم: <span className="text-white font-mono">5,000 دج</span> • <span className="text-white font-mono">10,000 دج</span> • <span className="text-white font-mono">25,000 دج</span>.</p>
                  <p>• للاستعمال، انسخ الرمز أعلاه، وتواصل مع مساعد الدعم الذكي الخاص بك لشحنها وإضافتها إلى رصيد حسابك المالي فوراً.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL 4: Why Choose Turo Modal
       ***********************************************/}
      <AnimatePresence>
        {showWhyTuroModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 text-white text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#101012] border border-zinc-800 rounded-[28px] w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setShowWhyTuroModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#5c61ec]" />
                  <h3 className="text-sm font-extrabold text-white">لماذا تختار Voya؟</h3>
                </div>
              </div>

              <div className="space-y-4 text-right text-[10.5px] leading-relaxed text-zinc-400">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white">🎖️ أمان معزز ومستندات مضمونة</h4>
                  <p>نعمل بالاتفاق والربط مع الهيئات ومصالح التحقق الجزائرية لتأمين سائق معتمد وآمن لجميع فئات كراء السلع والأعراس.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white">🚗 مئات السيارات بالتسليم الفوري</h4>
                  <p>سيارات جاهزة كلياً في المطارات وبجانبك على بعد أقل من 2 كم. لا حاجة للمعاملات الورقية؛ العملية تتم بنسبة 100% هاتفياً.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white">🛡️ شحن محلي فوري وآمن</h4>
                  <p>يمكنك حجز مركبتك الكلاسيكية أو الفان من منزلك، وشحن رصيدك بكل أمان عبر بطاقتك الذهبية لبريد الجزائر.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white">📞 خدمة عملاء متوازنة ودقيقة</h4>
                  <p>طاقم العمل المميز لدينا متواجد في كافة الولايات الـ 58 لخدمتك ومتابعة العقود وضمان سلامتك على مدار الساعة.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL: Become Host Modal
       ***********************************************/}
      <AnimatePresence>
        {showBecomeHostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 text-white text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#101012] border border-zinc-800 rounded-[28px] w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setShowBecomeHostModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-white">كيف تصبح مستضيفاً على Voya؟</h3>
                </div>
              </div>

              <div className="space-y-4 text-right text-[10.5px] leading-relaxed text-zinc-300">
                <p className="text-[11.5px] text-zinc-200">
                  انضم لآلاف الجزائريين الذين يحققون عوائد مالية مجزية شهرياً من خلال كراء سياراتهم بكل أمان وسهولة.
                </p>

                <div className="space-y-1 bg-zinc-900/30 p-3 rounded-[15px] border border-zinc-900">
                  <h4 className="font-extrabold text-white">1. أضف سيارتك مجاناً وبكل حرية 🚗</h4>
                  <p className="text-zinc-400 text-[10px]">حدد مواصفات السيارة، الولاية، السعر اليومي المناسب، والتواريخ المتاحة لك للتأجير.</p>
                </div>

                <div className="space-y-1 bg-zinc-900/30 p-3 rounded-[15px] border border-zinc-900">
                  <h4 className="font-extrabold text-white">2. استقبل طلبات الحجز الموثقة 📱</h4>
                  <p className="text-zinc-400 text-[10px]">نحن نتحقق من هوية ورخصة كل ضيف مسبقاً. وافق على الطلبات التي تناسب جدولك فحسب.</p>
                </div>

                <div className="space-y-1 bg-zinc-900/30 p-3 rounded-[15px] border border-zinc-900">
                  <h4 className="font-extrabold text-white">3. اكسب أرباحك بطريقة مضمونة 💸</h4>
                  <p className="text-zinc-400 text-[10px]">احصل على مدفوعاتك الكترونياً في محفظة Voya، وحوّلها لحسابك مباشرة مع تغطية تأمينية كاملة لعقودك.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowBecomeHostModal(false);
                    if (onChangeTab) {
                      onChangeTab("host");
                    }
                    onAddNotification({
                      id: "host_init_" + Date.now(),
                      title: "مرحباً بك كمستضيف! 🚗✨",
                      content: "يسعدنا انضمامك! لقد انتقلت إلى لوحة المستضيفين، يمكنك الآن إدراج سيارتك الأولى والبدء في تحقيق الأرباح.",
                      type: "system",
                      date: "الآن",
                      read: false
                    });
                  }}
                  className="w-full py-3 bg-[#5c61ec] hover:bg-[#4b50d3] active:scale-95 transition-all text-[11.5px] font-black text-white rounded-[12px] shadow-[0_4px_14px_rgba(92,97,236,0.3)] cursor-pointer text-center"
                >
                  ابدأ الاستضافة الآن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL 5: Legal Modal
       ***********************************************/}
      <AnimatePresence>
        {showLegalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 text-white text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#101012] border border-zinc-800 rounded-[28px] w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setShowLegalModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#5c61ec]" />
                  <h3 className="text-sm font-extrabold text-white">الشؤون القانونية والعقود</h3>
                </div>
              </div>

              <div className="space-y-3 text-right text-[10.5px] leading-relaxed text-zinc-400 max-h-[50vh] overflow-y-auto no-scrollbar">
                <p className="font-black text-white text-xs">١. الأهلية ورخص القيادة</p>
                <p>يجب على كافة مستخدمي تطبيق Voya الجزائر أن يكونوا قد تجاوزوا سن ٢١ وأكثر، مع رخصة سياقة وطنية سارية المفعول لأكثر من سنتين كاملتين.</p>
                
                <p className="font-black text-white text-xs">٢. العقود والمسؤوليات</p>
                <p>جميع عقود التوثيق تتم بصيغة رقمية متوافقة بالكامل مع القوانين والتشريعات الجزائرية، ومعتمدة من الوكالات السياحية المعنية بالمركبات.</p>

                <p className="font-black text-white text-xs">٣. الكفالة ودفع الرصيد</p>
                <p>يعمل التطبيق كمكفول ومؤمن على تعويض الكفالة للسيارات المتضررة، ويتم استخدام الرصيد المتاح بالمحفظة لتسوية أي معاملات معلقة فورياً.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL 6: Dahibya Wallet Refill Sheet
       ***********************************************/}
      <AnimatePresence>
        {showTopUpSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-xs text-white text-right" dir="rtl">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-zinc-950 w-full max-w-sm rounded-t-3xl shadow-2xl p-5 relative border-t border-zinc-850"
            >
              <button
                onClick={() => setShowTopUpSheet(false)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                title="إغلاق"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <h3 className="text-xs font-extrabold text-white mb-4 mt-1 flex items-center gap-1.5 justify-end">
                تحويل الرصيد بالبطاقة الذهبية للمركبات <CreditCard className="w-4.5 h-4.5 text-purple-400" />
              </h3>

              {isTopUpSuccess ? (
                <div className="py-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mb-2 shadow-lg animate-bounce">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-400">تم شحن رصيد محفظتك بالدينار!</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 font-semibold">يمكنك حجز السيارات الكلاسيكية والفاخرة بأمان وبساطة الآن.</p>
                </div>
              ) : (
                <form onSubmit={handleWalletTopUp} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    {[5000, 15000, 30000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 text-[10px] font-black rounded-full border transition-all ${
                          topUpAmount === amt 
                            ? 'bg-purple-650 border-purple-550 text-white shadow-md' 
                            : 'border-zinc-800 bg-zinc-900 text-zinc-450 hover:bg-zinc-850'
                        }`}
                      >
                        {amt.toLocaleString()} دج
                      </button>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="topup-amount" className="text-[9px] font-bold text-zinc-500 block mb-1">المبلغ المخصص للشحن (دج)*</label>
                    <input 
                      id="topup-amount"
                      type="number"
                      min="1000"
                      max="150000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      className="w-full text-xs font-extrabold bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-purple-400 focus:border-purple-550 outline-none text-right font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="card-number" className="text-[9px] font-bold text-zinc-500 block mb-1">رقم بطاقة الذهبية لبريد الجزائر (١٦ رقم)*</label>
                    <input 
                      id="card-number"
                      type="text"
                      required
                      placeholder="6283 07XX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 outline-none text-left"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-650 hover:bg-purple-750 text-white border border-purple-550 rounded-full text-xs font-black shadow-lg"
                  >
                    تأكيد تعبئة {Number(topUpAmount).toLocaleString()} دج
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL 7: Driver License Verification Modal
       ***********************************************/}
      <AnimatePresence>
        {showLicenseVerification && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-white text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 rounded-3xl p-5 w-full max-w-sm border border-zinc-803 max-h-[88%] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowLicenseVerification(false)}
                  className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  title="إغلاق التقرير"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xs font-extrabold text-white">توثيق رخصة السياقة الجزائرية والهوية</h3>
              </div>

              <form onSubmit={handleVerifyLicense} className="space-y-4 font-semibold">
                <div>
                  <label htmlFor="license-no" className="text-[9px] font-bold text-zinc-500 block mb-1">رقم رخصة السياقة الوطنية</label>
                  <input 
                    id="license-no"
                    type="text"
                    required
                    placeholder="مثال: DZ-2019-102938"
                    value={inputLicense}
                    onChange={(e) => setInputLicense(e.target.value)}
                    className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-xl p-3 outline-none focus:border-purple-500 text-left"
                  />
                </div>

                <div>
                  <label htmlFor="nin-no" className="text-[9px] font-bold text-zinc-500 block mb-1">رقم التعريف الوطني البيومتري (NIN)</label>
                  <input 
                    id="nin-no"
                    type="text"
                    required
                    placeholder="مثال: NIN-1029384759"
                    value={inputCni}
                    onChange={(e) => setInputCni(e.target.value)}
                    className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-xl p-3 outline-none focus:border-purple-500 text-left"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-650 hover:bg-purple-750 text-white rounded-full text-xs font-black shadow-lg border border-purple-550"
                >
                  تأكيد التوثيق والاعتماد
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/***********************************************
       * MODAL 8: Voya Car Rental Agency Registration Modal
       ***********************************************/}
      <AnimatePresence>
        {showAgencyModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-white text-right font-sans" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 rounded-[28px] w-full max-w-sm max-h-[88%] flex flex-col overflow-hidden border border-zinc-800 shadow-2xl"
            >
              <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
                <button
                  onClick={() => {
                    setShowAgencyModal(false);
                    setIsAgencySubmitted(false);
                  }}
                  className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.15] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5 font-black text-white text-xs">
                  <Building className="w-4 h-4 text-[#5c61ec]" />
                  <span>تسجيل وكالة السيارات • Voya</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 pb-12 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {isAgencySubmitted ? (
                  <div className="py-8 text-center flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Check className="w-7 h-7 stroke-[3]" />
                    </div>
                    <h4 className="text-sm font-black text-emerald-400">تم إرسال طلب وكالتك بنجاح!</h4>
                    <p className="text-[10.5px] text-zinc-300 font-medium leading-relaxed px-2">
                      مبارك! لقد تم تسجيل معلومات وكالتك <strong className="text-white">"{agencyName}"</strong> في منظومة شركاء <strong className="text-[#5c61ec]">Voya</strong>. سيقوم فريقنا بمراجعة وثائق الترخيص والاتصال بك لتفعيل حساب الوكالة ومزامنة أسطول سياراتك فورياً.
                    </p>
                    <button
                      onClick={() => {
                        setShowAgencyModal(false);
                        setIsAgencySubmitted(false);
                      }}
                      className="mt-4 px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-black text-white hover:bg-zinc-850 active:scale-95 transition-all cursor-pointer"
                    >
                      حسناً، فهمت
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!agencyName || !agencyManager || !agencyPhone || !agencyRegistrationNumber) {
                        alert("يرجى ملء جميع الحقول الإلزامية التي تحمل علامة (*)");
                        return;
                      }

                      setIsAgencySubmitted(true);
                      
                      // Add a notification so they see it in the app notifications!
                      onAddNotification({
                        id: "agency_reg_" + Date.now(),
                        title: "تم استلام طلب تسجيل وكالتك 💼",
                        content: `لقد سجلت وكالة "${agencyName}" بنجاح في نظام Voya. سيقوم مستشارينا بالاتصال برقمك ${agencyPhone} للتفعيل ومتابعة تسيير سياراتك.`,
                        type: "system",
                        date: "الآن",
                        read: false
                      });
                    }}
                    className="space-y-3 text-right"
                  >
                    <div className="bg-[#141416]/70 border border-purple-500/10 rounded-xl p-3 text-[10px] text-zinc-300 leading-relaxed font-semibold">
                      💡 انضمامك إلى <span className="text-[#5c61ec] font-extrabold">Voya</span> يسمح لك بكراء سياراتك لمواطنين ومسافرين موثقين بأمان تام، مع حماية ضد المخالفات ونظام دفع إلكتروني متكامل للضمان.
                    </div>

                    <div>
                      <label htmlFor="reg-agency-name" className="text-[9.5px] font-bold text-zinc-400 block mb-1">اسم وكالة كراء السيارات التجاري *</label>
                      <input 
                        id="reg-agency-name"
                        type="text"
                        required
                        placeholder="مثال: وكالة البهجة لكراء السيارات"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full text-xs font-bold bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#5c61ec] text-right"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-agency-manager" className="text-[9.5px] font-bold text-zinc-400 block mb-1">اسم المسير / ممثل الوكالة *</label>
                        <input 
                          id="reg-agency-manager"
                          type="text"
                          required
                          placeholder="الاسم واللقب"
                          value={agencyManager}
                          onChange={(e) => setAgencyManager(e.target.value)}
                          className="w-full text-xs font-bold bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#5c61ec] text-right"
                        />
                      </div>
                      <div>
                        <label htmlFor="reg-agency-phone" className="text-[9.5px] font-bold text-zinc-400 block mb-1">رقم الهاتف للاتصال المباشر *</label>
                        <input 
                          id="reg-agency-phone"
                          type="text"
                          required
                          placeholder="مثال: 0555125152"
                          value={agencyPhone}
                          onChange={(e) => setAgencyPhone(e.target.value)}
                          className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#5c61ec] text-left"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-agency-state" className="text-[9.5px] font-bold text-zinc-400 block mb-1">المقر الرئيسي / الولاية *</label>
                        <select
                          id="reg-agency-state"
                          value={agencyState}
                          onChange={(e) => setAgencyState(e.target.value)}
                          className="w-full text-xs font-bold bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#5c61ec] text-right appearance-none"
                        >
                          <option value="الجزائر العاصمة">الجزائر العاصمة</option>
                          <option value="وهران">وهران</option>
                          <option value="قسنطينة">قسنطينة</option>
                          <option value="عنابة">عنابة</option>
                          <option value="سطيف">سطيف</option>
                          <option value="باتنة">باتنة</option>
                          <option value="البليدة">البليدة</option>
                          <option value="تيزي وزو">تيزي وزو</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="reg-agency-fleet" className="text-[9.5px] font-bold text-zinc-400 block mb-1">عدد سيارات أسطولك الحالي</label>
                        <input 
                          id="reg-agency-fleet"
                          type="number"
                          min="1"
                          max="200"
                          value={agencyFleetCount}
                          onChange={(e) => setAgencyFleetCount(Number(e.target.value))}
                          className="w-full text-xs font-bold bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#5c61ec] text-right font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-agency-no" className="text-[9.5px] font-bold text-zinc-400 block mb-1">رقم السجل التجاري أو رخصة النشاط *</label>
                      <input 
                        id="reg-agency-no"
                        type="text"
                        required
                        placeholder="مثال: RC-16/0045981"
                        value={agencyRegistrationNumber}
                        onChange={(e) => setAgencyRegistrationNumber(e.target.value)}
                        className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#5c61ec] text-left"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-[#5c61ec] hover:bg-[#4b50d3] text-white rounded-full text-xs font-black shadow-lg border border-[#7f83f2]/30 active:scale-95 transition-all text-center cursor-pointer"
                      >
                        إرسال وثائق التسجيل وبدء العمل
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
