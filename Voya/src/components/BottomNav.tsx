/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { Search, Heart, MessageSquare, MoreHorizontal, Car, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  unreadNotifications: number;
  isHostMode?: boolean;
}

// Custom crisp Road lane icon representing Trips (matching photo item 3 exactly)
function RoadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 2L5 22" />
      <path d="M14 2L19 22" />
      <path d="M12 4v4" strokeWidth="2.5" />
      <path d="M12 11v4" strokeWidth="2.5" />
      <path d="M12 18v2" strokeWidth="2.5" />
    </svg>
  );
}

export default function BottomNav({ currentTab, onChangeTab, unreadNotifications, isHostMode = false }: BottomNavProps) {
  const { t } = useLanguage();

  const guestItems = [
    { id: "explore", label: "البحث", icon: Search },
    { id: "agencies", label: "المفضلة", icon: Heart },
    { id: "bookings", label: "رحلاتي", icon: RoadIcon },
    { id: "host", label: "الرسائل", icon: MessageSquare },
    { id: "profile", label: "المزيد", icon: MoreHorizontal }
  ];

  const hostItems = [
    { id: "host_trips", label: "الرحلات", icon: RoadIcon },
    { id: "host_inbox", label: "الرسائل", icon: MessageSquare },
    { id: "host_vehicles", label: "السيارات", icon: Car },
    { id: "host_dashboard", label: "الأعمال", icon: TrendingUp },
    { id: "host_account", label: "المزيد", icon: MoreHorizontal }
  ];

  const navItems = isHostMode ? hostItems : guestItems;

  return (
    <nav className={`absolute bottom-[22px] left-1/2 -translate-x-1/2 w-[92%] max-w-[368px] backdrop-blur-[24px] rounded-[28px] h-[64px] z-[100] px-1.5 flex justify-between items-center select-none shadow-[0_12px_40px_rgba(0,0,0,0.85)] ${
      isHostMode 
        ? "bg-black/95 border border-zinc-900" 
        : "bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
    }`}>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className="flex flex-col items-center justify-center relative cursor-pointer focus:outline-none flex-1 h-[52px] rounded-[22px]"
            aria-label={t(item.label)}
          >
            {/* Smooth animated active state liquid capsule background */}
            {isActive && (
              <motion.div
                layoutId="activeBarBgCapsule"
                className={`absolute inset-x-0.5 inset-y-0.5 backdrop-blur-md rounded-[20px] z-0 ${
                  isHostMode 
                    ? "bg-[#5c61ec]/15 border border-[#5c61ec]/25 shadow-[0_4px_12px_rgba(92,97,236,0.08)]" 
                    : "bg-gradient-to-b from-white/10 to-transparent border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                }`}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
              />
            )}



            <div className={`relative z-10 flex flex-col items-center transition-all duration-300 ${
              isActive ? 'text-white scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
              <IconComponent 
                className={`transition-all duration-300 ${
                  isActive ? 'w-5 h-5 text-white stroke-[2.4]' : 'w-[18px] h-[18px] stroke-[2]'
                }`} 
              />
              
              {/* Inbox Badge indicator removed */}

              <span className="text-[10px] font-extrabold mt-1 tracking-wide leading-tight">
                {t(item.label)}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

