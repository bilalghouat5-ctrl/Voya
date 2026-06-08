/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Notification } from "../types";
import { Bell, X, Check, Trash2, Calendar, Wallet, Settings, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export default function NotificationPanel({ notifications, isOpen, onClose, onMarkAllAsRead, onClearNotifications }: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end text-right text-white">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-zinc-950 w-full max-w-xs h-full flex flex-col shadow-2xl relative p-4 border-l border-zinc-900"
      >
        {/* Header toolbar */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-900 shrink-0">
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white"
            title="إغلاق التقرير"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 font-extrabold text-white">
            <Bell className="w-4.5 h-4.5 text-purple-400" />
            <span className="text-xs">تنبيهات الهاتف 🔔</span>
          </div>
        </div>

        {/* Action controllers */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-zinc-900 shrink-0">
            <button
              onClick={onClearNotifications}
              className="text-[9px] font-bold text-rose-400 flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> مسح سجل التنبيهات
            </button>
            
            <button
              onClick={onMarkAllAsRead}
              className="text-[9px] font-bold text-purple-400 flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <Check className="w-3 h-3" /> تعليم الكل كمقروء
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 py-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-850 text-zinc-500 rounded-full flex items-center justify-center mb-2 shadow">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-zinc-500">سجل الإشعارات فارغ تماماً</p>
            </div>
          ) : (
            notifications.map((notif) => {
              // Icon selector
              let ItemIcon = Settings;
              let bgClass = "bg-zinc-900 text-zinc-400 border border-zinc-800";
              if (notif.type === "booking") {
                ItemIcon = Calendar;
                bgClass = "bg-purple-950/70 text-purple-400 border border-purple-900/30";
              } else if (notif.type === "wallet") {
                ItemIcon = Wallet;
                bgClass = "bg-emerald-950/70 text-emerald-400 border border-emerald-950";
              } else if (notif.type === "host") {
                ItemIcon = Key;
                bgClass = "bg-amber-950/70 text-amber-400 border border-amber-950";
              }

              return (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    notif.read 
                      ? 'bg-zinc-900/40 border-zinc-900 opacity-60' 
                      : 'bg-zinc-900/90 border-zinc-800 shadow-sm'
                  }`}
                >
                  <div className="flex gap-2.5 items-start">
                    <div className={`p-2 rounded-xl ${bgClass} shrink-0`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-1.5 mb-1">
                        <span className="text-[8px] text-zinc-500 whitespace-nowrap font-normal font-mono">{notif.date}</span>
                        <h4 className="text-[11px] font-extrabold text-white leading-tight truncate">{notif.title}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">{notif.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
