/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { Search, Heart, MessageSquare, MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  unreadNotifications: number;
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

export default function BottomNav({ currentTab, onChangeTab, unreadNotifications }: BottomNavProps) {
  const navItems = [
    { id: "explore", label: "البحث", icon: Search },
    { id: "agencies", label: "المفضلة", icon: Heart },
    { id: "bookings", label: "رحلاتي", icon: RoadIcon },
    { id: "host", label: "الرسائل", icon: MessageSquare },
    { id: "profile", label: "المزيد", icon: MoreHorizontal }
  ];

  return (
    <nav className="absolute bottom-[22px] left-1/2 -translate-x-1/2 w-[92%] max-w-[368px] bg-white/[0.04] backdrop-blur-[24px] border border-white/10 rounded-[28px] h-[64px] z-[100] px-1.5 flex justify-between items-center shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] select-none">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className="flex flex-col items-center justify-center relative cursor-pointer focus:outline-none flex-1 h-[52px] rounded-[22px]"
            aria-label={item.label}
          >
            {/* Smooth animated active state liquid capsule background */}
            {isActive && (
              <motion.div
                layoutId="activeBarBgCapsule"
                className="absolute inset-x-0.5 inset-y-0.5 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/15 rounded-[20px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] z-0"
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
              
              {/* Inbox Badge indicator */}
              {item.id === "host" && unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-2 bg-purple-600 text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-zinc-950 animate-pulse">
                  {unreadNotifications}
                </span>
              )}

              <span className="text-[10px] font-extrabold mt-1 tracking-wide leading-tight">
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

