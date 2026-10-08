"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bell,
  HelpCircle,
  Globe,
  ChevronDown,
  Building2,
  User,
  Shield,
  CreditCard,
  LogOut,
  Settings,
  Check,
  Search,
  ExternalLink
} from "lucide-react";

interface TopHeaderProps {
  pageTitle: string;
  onNavigate: (module: string) => void;
  onLogout: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ pageTitle, onNavigate, onLogout }) => {
  const {
    user,
    language,
    setLanguage,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    t
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#F4F7EE] border-b border-[#D8E6CC] px-4 lg:px-6 flex items-center justify-between z-30 select-none shadow-xs">
      {/* Left: Dynamic Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-sm sm:text-base lg:text-xl font-black text-[#17260A] tracking-tight truncate max-w-[120px] sm:max-w-[280px] lg:max-w-none">
          {pageTitle}
        </h1>
      </div>

      {/* Right Controls: Notifications, Help, Language, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* 1. Notification Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F4F7EE] flex items-center justify-center relative text-[#2B3F1E] shadow-xs transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1B2F09] text-[#E1FFAC] text-[9px] font-black flex items-center justify-center border border-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border-2 border-[#C2E880] shadow-xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDF4E4] px-1">
                <span className="text-xs font-black text-[#192A0B]">{t.header.notifications}</span>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#3D6612] font-bold hover:underline"
                  >
                    {t.header.markAllRead}
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#EDF4E4] max-h-72 overflow-y-auto my-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#718765]">{t.header.noNotifications}</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.actionUrl) onNavigate(n.actionUrl);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition ${
                        !n.read ? "bg-[#F7FCEE]" : "hover:bg-[#F9FBF6]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#1B2D0C]">{n.title}</h4>
                        <span className="text-[10px] text-[#718765] shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#4F6444] mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#EDF4E4] text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigate("notifications");
                  }}
                  className="text-xs font-bold text-[#355B0F] hover:underline"
                >
                  {language === "sw" ? "Ona Taarifa Zote" : "View All Notifications"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Help & Docs */}
        <button
          onClick={() => onNavigate("help")}
          className="w-9 h-9 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F4F7EE] hidden sm:flex items-center justify-center text-[#2B3F1E] shadow-xs transition"
          title={t.header.helpCenter}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* 4. Language Selector */}
        <button
          onClick={() => setLanguage(language === "en" ? "sw" : "en")}
          className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F4F7EE] text-xs font-black text-[#2A3E1D] flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          title={language === "sw" ? "Badili kwenda Kiingereza (Switch to English)" : "Badili kwenda Kiswahili (Switch to Swahili)"}
        >
          <Globe className="w-3.5 h-3.5 text-[#406214]" />
          <span>{language === "en" ? "SW" : "EN"}</span>
        </button>

        {/* 5. User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white border border-[#D5E5C4] hover:border-[#8ECE28] shadow-xs transition"
          >
            <div className="w-7 h-7 rounded-lg bg-[#E1FFAC] border border-[#A6DF52] flex items-center justify-center font-black text-xs text-[#1F3609]">
              {user?.name ? user.name.charAt(0) : "P"}
            </div>
            <div className="hidden lg:block text-left pr-1">
              <span className="block text-xs font-black text-[#172709] leading-tight">{user?.name || "Peter Joseph"}</span>
              <span className="block text-[10px] font-bold text-[#5C724F]">{user?.role || "Mwenye Duka"}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#5B6F50]" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border-2 border-[#C2E880] shadow-xl p-2 z-50 animate-fade-in text-xs font-bold text-[#2C401E]">
              <div className="px-3 py-2 border-b border-[#EDF4E4]">
                <span className="block font-black text-[#162708]">{user?.name}</span>
                <span className="block text-[11px] text-[#697E5D] font-normal">{user?.email}</span>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate("profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F2F7EB] transition text-left"
                >
                  <User className="w-4 h-4 text-[#476517]" />
                  <span>{language === "sw" ? "Wasifu Wangu" : "My Profile"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate("settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F2F7EB] transition text-left"
                >
                  <Settings className="w-4 h-4 text-[#476517]" />
                  <span>{language === "sw" ? "Mipangilio ya Biashara" : "Business Settings"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate("subscription");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F2F7EB] transition text-left"
                >
                  <CreditCard className="w-4 h-4 text-[#476517]" />
                  <span>{language === "sw" ? "Vifurushi & Malipo" : "Subscription & Billing"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate("settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F2F7EB] transition text-left"
                >
                  <Shield className="w-4 h-4 text-[#476517]" />
                  <span>{language === "sw" ? "Usalama & Ukaguzi" : "Security & Audits"}</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#EDF4E4]">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 6. Direct Top Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 hover:text-rose-800 text-xs font-black shadow-xs transition"
          title={language === "sw" ? "Toka Nje ya Mfumo" : "Sign out of TradePOS"}
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">{t.logout}</span>
        </button>
      </div>
    </header>
  );
};
