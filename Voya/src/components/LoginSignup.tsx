/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Mail, Lock, Phone as PhoneIcon, User as UserIcon, ArrowLeft, ArrowRight, Sparkles, AlertCircle, Check, ChevronLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRESET_USER } from "../data";
import { User as UserType } from "../types";
// @ts-ignore
import algerianHighwayBg from "../assets/images/algerian_highway_bg_1780999375268.png";

interface LoginSignupProps {
  onLogin: (user: UserType) => void;
  onClose: () => void;
  allowGuest?: boolean;
}

export default function LoginSignup({ onLogin, onClose, allowGuest = true }: LoginSignupProps) {
  const [view, setView] = useState<"landing" | "login" | "signup" | "emailsignup">("landing");
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginPhone, setLoginPhone] = useState<string>("");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  
  // Register form states
  const [registerName, setRegisterName] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPhone, setRegisterPhone] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  
  const [registerFirstName, setRegisterFirstName] = useState<string>("");
  const [registerLastName, setRegisterLastName] = useState<string>("");
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [sendPromotions, setSendPromotions] = useState<boolean>(false);
  
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Validate Email Helper
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (loginMethod === "phone") {
      if (!loginPhone.trim() || loginPhone.trim().length < 8) {
        setErrorMsg("يرجى إدخال رقم هاتف صحيح.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onLogin(PRESET_USER);
        setSuccessMsg("تم تسجيل الدخول بنجاح! أهلاً بك مجدداً ✨");
        setTimeout(() => {
          onClose();
        }, 1000);
      }, 1200);
      return;
    }

    if (!loginEmail || !loginPassword) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    if (!isValidEmail(loginEmail)) {
      setErrorMsg("صيغة البريد الإلكتروني غير صالحة.");
      return;
    }

    setLoading(true);

    // Simulated short delay for realism
    setTimeout(() => {
      setLoading(false);
      
      // If logging in as Bilal or checking preset credentials
      if (loginEmail.toLowerCase() === "bilalghouat5@gmail.com" || loginEmail.toLowerCase() === "bilal@voya.dz") {
        onLogin(PRESET_USER);
        setSuccessMsg("تم تسجيل الدخول بنجاح! أهلاً بك مجدداً ✨");
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        // Create custom user based on name derived from email prefix
        const nameFromEmail = loginEmail.split("@")[0];
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        
        const customUser: UserType = {
          id: "custom_user_" + Date.now(),
          name: formattedName,
          email: loginEmail,
          avatar: "", // Empty to trigger letter-based fallback or default placeholder
          walletBalance: 15000, // Initial free gift budget
          isDriverVerified: false,
          isHost: false,
          hasPendingVerification: false,
          registrationDate: new Date().toISOString().split("T")[0],
          phone: "+213 500 000 000",
          isGuest: false
        };
        
        onLogin(customUser);
        setSuccessMsg(`أهلاً بك ${formattedName}! تم تسجيل الدخول بنجاح.`);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }, 1200);
  };

  // Handle Signup Submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    let email = registerEmail.trim();
    let name = registerName.trim();
    let phone = registerPhone.trim();
    let password = registerPassword.trim();

    if (view === "emailsignup") {
      if (!email) {
        setErrorMsg("يرجى إدخال البريد الإلكتروني.");
        return;
      }
      if (!isValidEmail(email)) {
        setErrorMsg("صيغة البريد الإلكتروني غير صحيحة.");
        return;
      }
      if (!password || password.length < 6) {
        setErrorMsg("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
        return;
      }
      if (!registerFirstName.trim() || !registerLastName.trim()) {
        setErrorMsg("يرجى إدخال الاسم الشخصي واسم العائلة كما في الرخصة.");
        return;
      }
      if (!agreeTerms) {
        setErrorMsg("يرجى الموافقة على شروط الخدمة وسياسة الخصوصية للمتابعة.");
        return;
      }
      name = `${registerFirstName.trim()} ${registerLastName.trim()}`;
      phone = "+213 550 12 34 56";
    } else if (view === "signup") {
      if (!email) {
        setErrorMsg("يرجى إدخال البريد الإلكتروني.");
        return;
      }
      if (!isValidEmail(email)) {
        setErrorMsg("صيغة البريد الإلكتروني غير صحيحة.");
        return;
      }
      const emailPrefix = email.split("@")[0];
      name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      phone = "+213 550 12 34 56";
      password = "user12356";
    } else {
      if (!name || !email || !phone || !password) {
        setErrorMsg("يرجى ملء كافة البيانات لإنشاء الحساب.");
        return;
      }
      if (!isValidEmail(email)) {
        setErrorMsg("صيغة البريد الإلكتروني غير صحيحة.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      const newUser: UserType = {
        id: "user_registered_" + Date.now(),
        name: name,
        email: email,
        avatar: "", // Empty or custom
        walletBalance: 10000, // Free startup balance
        isDriverVerified: false,
        isHost: false,
        hasPendingVerification: false,
        registrationDate: new Date().toISOString().split("T")[0],
        phone: phone.startsWith("+") ? phone : `+213 ${phone}`,
        isGuest: false
      };

      onLogin(newUser);
      setSuccessMsg("تهانينا! تم إنشاء حسابك بنجاح ✨. تفضل بالدخول.");
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 1200);
  };

  // Fast preset login helper
  const handleFastLogin = () => {
    setLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      setLoading(false);
      onLogin(PRESET_USER);
      setSuccessMsg("أهلاً بك بلال غواط 🌟! تم تسجيل الدخول السريع بنجاح.");
      setTimeout(() => {
        onClose();
      }, 800);
    }, 600);
  };

  // Landing View (Matches Screenshot 3 perfectly)
  if (view === "landing") {
    return (
      <div 
        id="login-landing-overlay" 
        className="absolute inset-0 z-[1000] bg-black text-white flex flex-col font-sans select-none overflow-hidden"
        dir="rtl"
      >
        {/* Scenic Algerian Highway Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${algerianHighwayBg})`,
          }}
        >
          {/* Subtle Dark Linear Overlay for Premium Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/50" />
        </div>

        {/* Content Panel */}
        <div className="relative h-full w-full flex flex-col justify-between p-6 pb-12 z-10">
          
          {/* Close Button on Top Row */}
          <div className="w-full flex justify-end pt-10">
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/20 flex items-center justify-center text-white hover:bg-white/[0.18] hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              title="إغلاق"
            >
              <X className="w-5 h-5 text-white stroke-[2.5]" />
            </button>
          </div>

          {/* Centered Logo Badge & Find Your Drive Title */}
          <div className="flex flex-col items-center justify-center text-center px-4 space-y-6">
            
            {/* White Arrow Badge styled TURO Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="flex items-center justify-center"
            >
              <svg viewBox="0 0 160 52" className="w-[172px] h-[56px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 4 4 L 126 4 L 148 26 L 126 48 L 4 48 Z" 
                  stroke="white" 
                  strokeWidth="3.2" 
                  strokeLinejoin="round" 
                  fill="none"
                />
                <text 
                  x="63" 
                  y="33.5" 
                  fill="white" 
                  fontSize="23.5" 
                  fontWeight="950" 
                  fontFamily='"Space Grotesk", "Inter", sans-serif' 
                  letterSpacing="0.08em" 
                  textAnchor="middle"
                >
                  TURO
                </text>
              </svg>
            </motion.div>

            {/* Arabic Translated "Find Your Drive" */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="space-y-1.5"
            >
              <h1 className="text-3xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
                اعثر على رحلتك
              </h1>
              <span className="text-[12px] text-zinc-350 font-bold tracking-wide block max-w-xs mx-auto">
                كراء سيارات مميزة من مضيفين محليين بالجزائر
              </span>
            </motion.div>
          </div>

          {/* Bottom Call to Actions */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="w-full flex flex-col gap-3.5 max-w-sm mx-auto shrink-0"
          >
            {/* Sign up */}
            <button
              onClick={() => {
                setIsLoginMode(false);
                setView("signup");
              }}
              className="w-full h-12 bg-[#5c61ec] hover:bg-[#4b50d3] text-white font-extrabold text-[14.5px] rounded-[14px] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-[0_6px_22px_rgba(92,97,236,0.25)] flex items-center justify-center text-center"
            >
              إنشاء حساب جديد
            </button>

            {/* Log in */}
            <button
              onClick={() => {
                setIsLoginMode(true);
                setView("login");
              }}
              className="w-full h-12 bg-white/[0.04] backdrop-blur-[12px] border border-white/20 hover:bg-white/[0.08] text-white font-extrabold text-[14.5px] rounded-[14px] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center text-center"
            >
              تسجيل الدخول
            </button>

            {allowGuest && (
              <button
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-white font-bold text-center mt-3.5 transition-colors active:scale-95 cursor-pointer"
              >
                المتابعة بصفة زائر
              </button>
            )}
          </motion.div>

        </div>
      </div>
    );
  }

  // Signup View (Matches Screenshot 4 perfectly with RTL Arabic Support)
  if (view === "signup") {
    return (
      <div 
        id="signup-view-overlay" 
        className="absolute inset-0 z-[1000] bg-black text-white flex flex-col font-sans select-none overflow-hidden animate-[fadeIn_0.25s_ease-out]"
        dir="rtl"
      >
        {/* Top Header - Compact and Clean */}
        <div className="w-full px-5 pt-10 pb-4 flex items-center justify-between shrink-0 relative">
          {/* Back button on the right inside our RTL setup */}
          <button
            onClick={() => setView("landing")}
            className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/20 flex items-center justify-center text-white hover:bg-white/[0.18] hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
            title="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-zinc-300" />
          </button>
          
          {/* Centered screen title with exact medium font weight */}
          <h2 className="text-[15.5px] font-semibold text-zinc-100 tracking-wide absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            إنشاء حساب
          </h2>

          {/* Empty spacer to balance layout */}
          <div className="w-10" />
        </div>

        {/* Screen Content Container */}
        <div className="flex-1 px-6 pt-4 pb-8 flex flex-col justify-between">
          
          <div className="space-y-6">
            {/* Social Continue Buttons inside Screenshot 4 */}
            <div className="space-y-3">
              {/* Continue with Apple */}
              <button
                type="button"
                onClick={() => handleFastLogin()}
                className="w-full h-11 bg-white hover:bg-zinc-100 text-black font-semibold text-[13.5px] rounded-[10px] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {/* Apple SVG Icon */}
                <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.16-.52 2.81-1.33z" />
                </svg>
                <span>المتابعة باستخدام Apple</span>
              </button>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => handleFastLogin()}
                className="w-full h-11 bg-transparent hover:bg-white/[0.04] text-white border border-zinc-700 font-semibold text-[13.5px] rounded-[10px] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {/* Google Multi-Color SVG Icon */}
                <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>المتابعة باستخدام Google</span>
              </button>
            </div>

            {/* Email Registration Header */}
            <div className="text-right mt-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block select-none">
                التسجيل بالبريد الإلكتروني
              </span>
            </div>

            {/* ERROR AND SUCCESS ALERTS */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-[8px] p-2.5 text-xs font-bold leading-relaxed text-right"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 inline-block ml-1.5 align-middle" />
                  <span className="align-middle">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clean, Underlined Email input selector perfectly matching image */}
            <div 
              onClick={() => setView("emailsignup")}
              className="relative mt-2 border-b border-zinc-900 pb-2 text-right flex items-center justify-between cursor-pointer group"
            >
              <span className="text-[14.5px] font-normal text-zinc-400 transition-colors group-hover:text-zinc-200">
                البريد الإلكتروني
              </span>

              <ArrowLeft className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>

          {/* Legal and Privacy Policies centered on the bottom */}
          <div className="text-center pt-4 select-none">
            <button
              onClick={() => alert("سياسة الخصوصية وشروط الخدمة لمنصة Voya كراء السيارات في الجزائر.")}
              className="text-[#5c61ec] hover:text-[#7d82fc] cursor-pointer block font-normal text-[11.5px] text-center mx-auto"
            >
              شروط الخدمة وسياسة الخصوصية
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Email Sign Up Form View (Matches Screenshot 5 perfectly with RTL Arabic Support)
  if (view === "emailsignup") {
    return (
      <div 
        id="emailsignup-view-overlay" 
        className="absolute inset-0 z-[1000] bg-black text-white flex flex-col font-sans select-none overflow-hidden animate-[fadeIn_0.25s_ease-out]"
        dir="rtl"
      >
        {/* Top Header - Symmetrical and Clean */}
        <div className="w-full px-5 pt-10 pb-4 flex items-center justify-between shrink-0 relative border-b border-zinc-900/40">
          {/* Back button on the right for RTL flow */}
          <button
            onClick={() => setView("signup")}
            className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/20 flex items-center justify-center text-white hover:bg-white/[0.18] hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
            title="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-zinc-300" />
          </button>
          
          {/* Centered screen title with exact light-medium weight */}
          <h2 className="text-[15.5px] font-semibold text-zinc-100 tracking-wide absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            التسجيل بالبريد الإلكتروني
          </h2>

          {/* Spacer */}
          <div className="w-10" />
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-5 pb-8 flex flex-col justify-between">
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            
            {/* Header label exactly mirroring "EMAIL SIGN UP" in terms of proportions */}
            <div className="text-right pb-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block select-none">
                التسجيل بالبريد الإلكتروني
              </span>
            </div>

            {/* ERROR ALERTS */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-950/40 border border-red-500/20 text-red-300 rounded-[8px] p-2.5 text-xs font-bold leading-relaxed text-right"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 inline-block ml-1.5 align-middle" />
                  <span className="align-middle">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field - Ultra clean underlined input */}
            <div className="relative border-b border-zinc-800 focus-within:border-zinc-500 transition-colors py-2 text-right flex flex-col">
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => {
                  setRegisterEmail(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="البريد الإلكتروني"
                className="w-full bg-transparent text-white placeholder-zinc-500 text-[14.5px] font-normal focus:outline-none border-none focus:ring-0 p-0 text-right font-sans"
                required
              />
            </div>

            {/* Password field - Ultra clean underlined input */}
            <div className="relative border-b border-zinc-800 focus-within:border-zinc-500 transition-colors py-2 text-right flex flex-col">
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="كلمة المرور"
                className="w-full bg-transparent text-white placeholder-zinc-500 text-[14.5px] font-normal focus:outline-none border-none focus:ring-0 p-0 text-right font-sans"
                required
              />
            </div>

            {/* First Name on license - Ultra clean underlined input */}
            <div className="relative border-b border-zinc-800 focus-within:border-zinc-500 transition-colors py-2 text-right flex flex-col">
              <input
                type="text"
                value={registerFirstName}
                onChange={(e) => {
                  setRegisterFirstName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="الاسم الشخصي (كما في الرخصة)"
                className="w-full bg-transparent text-white placeholder-zinc-500 text-[14.5px] font-normal focus:outline-none border-none focus:ring-0 p-0 text-right"
                required
              />
              <span className="text-[11px] text-zinc-500 mt-1 select-none leading-normal text-right">
                يمكنك إضافة اسم مفضل لاحقاً من خلال حسابك.
              </span>
            </div>

            {/* Last Name on license - Ultra clean underlined input */}
            <div className="relative border-b border-zinc-800 focus-within:border-zinc-500 transition-colors py-2 text-right flex flex-col">
              <input
                type="text"
                value={registerLastName}
                onChange={(e) => {
                  setRegisterLastName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="اللقب / اسم العائلة (كما في الرخصة)"
                className="w-full bg-transparent text-white placeholder-zinc-500 text-[14.5px] font-normal focus:outline-none border-none focus:ring-0 p-0 text-right"
                required
              />
            </div>

            {/* Custom styled Checkboxes mirroring Screenshot 5 design perfectly with blue-purple outline */}
            <div className="space-y-4 pt-4">
              {/* Checkbox 1 */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`w-[19px] h-[19px] min-w-[19px] rounded-[4.5px] border-[1.5px] flex items-center justify-center transition-all bg-transparent focus:outline-none shrink-0 ${
                    agreeTerms ? "border-[#5c61ec] bg-[#5c61ec]" : "border-[#5c61ec]/70 hover:border-[#5c61ec]"
                  }`}
                >
                  {agreeTerms && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                  )}
                </button>
                <div className="flex flex-col text-right leading-relaxed select-none">
                  <span className="text-[12px] font-normal text-zinc-300">
                    أوافق على شروط الخدمة وسياسة الخصوصية
                  </span>
                  <button
                    type="button"
                    onClick={() => alert("شروط الخدمة وسياسة الخصوصية لمنصة Voya كراء السيارات في الجزائر.")}
                    className="text-[12px] font-medium text-[#5c61ec] hover:text-[#7d82fc] underline mt-0.5 text-right block self-start"
                  >
                    عرض شروط الخدمة وسياسة الخصوصية
                  </button>
                </div>
              </div>

              {/* Checkbox 2 */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setSendPromotions(!sendPromotions)}
                  className={`w-[19px] h-[19px] min-w-[19px] rounded-[4.5px] border-[1.5px] flex items-center justify-center transition-all bg-transparent focus:outline-none shrink-0 ${
                    sendPromotions ? "border-[#5c61ec] bg-[#5c61ec]" : "border-[#5c61ec]/70 hover:border-[#5c61ec]"
                  }`}
                >
                  {sendPromotions && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                  )}
                </button>
                <span className="text-[12px] font-normal text-zinc-300 leading-normal text-right select-none">
                  أرسل لي العروض الترويجية والإعلانات عبر البريد الإلكتروني
                </span>
              </div>
            </div>

            {/* Submit button following Screenshot 5 precisely in proportions */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-[10px] font-semibold text-[14px] transition-all duration-200 active:scale-[0.98] cursor-pointer mt-8 flex items-center justify-center shadow-lg ${
                agreeTerms && registerEmail && registerPassword && registerFirstName && registerLastName
                  ? "bg-[#5c61ec] hover:bg-[#4b50d3] text-white"
                  : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>إنشاء حساب بالبريد الإلكتروني</span>
              )}
            </button>

          </form>
        </div>
      </div>
    );
  }

  // Login Form View (Matches Screenshot from 11:02 perfectly with RTL Arabic Support)
  if (view === "login") {
    return (
      <div 
        id="login-view-overlay" 
        className="absolute inset-0 z-[1000] bg-black text-white flex flex-col font-sans select-none overflow-hidden animate-[fadeIn_0.25s_ease-out]"
        dir="rtl"
      >
        {/* Top Header - Symmetrical and Clean */}
        <div className="w-full px-5 pt-10 pb-4 flex items-center justify-between shrink-0 relative">
          {/* Back button on the right for RTL flow */}
          <button
            onClick={() => setView("landing")}
            className="w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/20 flex items-center justify-center text-white hover:bg-white/[0.18] hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
            title="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-zinc-300" />
          </button>
          
          {/* Centered screen title with exact light-medium weight */}
          <h2 className="text-[15.5px] font-semibold text-zinc-100 tracking-wide absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            تسجيل الدخول
          </h2>

          {/* Spacer */}
          <div className="w-10" />
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-5 pb-8 flex flex-col justify-between">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* ERROR ALERTS */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-950/40 border border-red-500/20 text-red-300 rounded-[8px] p-2.5 text-xs font-bold leading-relaxed text-right"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 inline-block ml-1.5 align-middle" />
                  <span className="align-middle">{errorMsg}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-emerald-950/45 border border-emerald-500/20 text-emerald-300 rounded-[8px] p-2.5 text-xs font-bold leading-relaxed text-right animate-[pulse_1.5s_infinite]"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 inline-block ml-1.5 align-middle" />
                  <span className="align-middle">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {loginMethod === "phone" ? (
              <>
                {/* Country Code Selection */}
                <div className="space-y-1.5 text-right w-full">
                  <span className="text-[12px] font-medium text-zinc-400">كود الدولة</span>
                  <div className="w-full h-11 bg-transparent border border-zinc-800 rounded-[10px] px-3.5 flex items-center justify-between text-zinc-200 text-[14px]">
                    <span className="font-sans text-zinc-500 text-[11px]">▼</span>
                    <span className="font-normal text-zinc-350">الجزائر (Algeria) +213</span>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1.5 text-right w-full">
                  <span className="text-[12px] font-medium text-zinc-400">رقم الهاتف</span>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => {
                      setLoginPhone(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="رقم الهاتف"
                    className="w-full h-11 bg-transparent border border-zinc-800 focus:border-zinc-500 rounded-[10px] px-3.5 text-zinc-100 placeholder-zinc-650 text-[14px] font-normal transition-all text-right focus:outline-none"
                    required
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block leading-normal text-right">
                    سنرسل لك رمزاً لتأكيد رقم هاتفك.
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Email Address */}
                <div className="space-y-1.5 text-right w-full">
                  <span className="text-[12px] font-medium text-zinc-400 block mb-1">البريد الإلكتروني</span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="example@voya.dz"
                    className="w-full h-11 bg-transparent border border-zinc-800 focus:border-zinc-500 rounded-[10px] px-3.5 text-zinc-100 placeholder-zinc-500 text-[14px] font-normal transition-all text-right focus:outline-none"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 text-right w-full">
                  <div className="flex justify-between items-center mb-1">
                    <button 
                      type="button" 
                      onClick={() => alert("سيتم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.")}
                      className="text-[11px] text-[#5c61ec] hover:text-[#7d82fc] font-normal"
                    >
                      نسيت كلمة المرور؟
                    </button>
                    <span className="text-[12px] font-medium text-zinc-400 block">كلمة المرور</span>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="••••••••"
                    className="w-full h-11 bg-transparent border border-zinc-800 focus:border-zinc-500 rounded-[10px] px-3.5 text-zinc-100 placeholder-zinc-500 text-[14px] font-normal transition-all text-right focus:outline-none"
                    required
                  />
                </div>
              </>
            )}

            {/* Continue Button matching precisely screenshot proportions */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 rounded-[10px] font-semibold text-[13.5px] transition-all duration-200 active:scale-[0.98] cursor-pointer mt-6 flex items-center justify-center shadow-md ${
                (loginMethod === "phone" ? loginPhone.trim() : (loginEmail && loginPassword))
                  ? "bg-[#5c61ec] hover:bg-[#4b50d3] text-white"
                  : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>المتابعة</span>
              )}
            </button>

            {/* Symmetrical divider with "أو" / "Or" */}
            <div className="flex items-center gap-3.5 pt-5 pb-1 select-none">
              <div className="flex-1 h-[1px] bg-zinc-900" />
              <span className="text-[12px] font-normal text-zinc-650 tracking-wide select-none">أو</span>
              <div className="flex-1 h-[1px] bg-zinc-900" />
            </div>

            {/* Sub-options for Social login and Mail login */}
            <div className="space-y-3">
              {/* Option 1: Toggle Method (Email vs Phone) */}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setLoginMethod(loginMethod === "phone" ? "email" : "phone");
                }}
                className="w-full h-11 bg-transparent hover:bg-white/[0.04] text-white border border-zinc-800 font-normal text-[13px] rounded-[10px] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {loginMethod === "phone" ? (
                  <>
                    <Mail className="w-4 h-4 text-zinc-300" />
                    <span>المتابعة باستخدام البريد الإلكتروني</span>
                  </>
                ) : (
                  <>
                    <PhoneIcon className="w-4 h-4 text-zinc-300" />
                    <span>المتابعة باستخدام رقم الهاتف</span>
                  </>
                )}
              </button>

              {/* Continue with Apple */}
              <button
                type="button"
                onClick={() => handleFastLogin()}
                className="w-full h-11 bg-transparent hover:bg-white/[0.04] text-white border border-zinc-800 font-normal text-[13px] rounded-[10px] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current text-white lg:scale-100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.16-.52 2.81-1.33z" />
                </svg>
                <span>المتابعة باستخدام Apple</span>
              </button>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => handleFastLogin()}
                className="w-full h-11 bg-transparent hover:bg-white/[0.04] text-white border border-zinc-800 font-normal text-[13px] rounded-[10px] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>المتابعة باستخدام Google</span>
              </button>
            </div>

            {/* Account Switcher Link */}
            <div className="text-center pt-4">
              <span className="text-[13px] text-zinc-400 select-none">ليس لديك حساب؟ </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setIsLoginMode(false);
                  setView("signup");
                }}
                className="text-[13px] font-medium text-[#5c61ec] hover:text-[#7d82fc] underline transition-colors cursor-pointer"
              >
                إنشاء حساب
              </button>
            </div>

          </form>

          {/* Legal Voya policy footer mirroring screenshot */}
          <div className="text-center pt-8 pb-3 px-4 select-none mt-auto">
            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xs mx-auto">
              بتسجيل الدخول، فإنك توافق على شروط الخدمة لشركة Voya و{" "}
              <button
                type="button"
                onClick={() => alert("سياسة الخصوصية لمنصة Voya كراء السيارات في الجزائر.")}
                className="text-zinc-400 hover:text-white underline cursor-pointer"
              >
                سياسة الخصوصية
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="login-signup-overlay" 
      className="absolute inset-0 z-[1000] bg-black text-white flex flex-col font-sans select-none"
      dir="rtl"
    >
      <div className="text-center p-12">
        <span className="text-lg text-zinc-500">جاري التحميل...</span>
      </div>
    </div>
  );
}
