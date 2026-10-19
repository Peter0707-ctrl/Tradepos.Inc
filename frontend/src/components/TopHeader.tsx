"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bell,
  HelpCircle,
  Globe,
  ChevronDown,
  User,
  Shield,
  CreditCard,
  LogOut,
  Settings,
  Lock,
  Download
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
    employees,
    switchEmployeeAccount,
    notifyCenter,
    t,
    impersonatingTenantId,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingBossEmpId, setPendingBossEmpId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === "SUPER_ADMIN" && !impersonatingTenantId;
  const isOwner = user?.role === "OWNER" || (!user && !isSuperAdmin) || !!impersonatingTenantId;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        notifyCenter("App Imewekwa", "TradePOS imewekwa kwenye kifaa chako.", "SUCCESS");
      }
      setDeferredPrompt(null);
    } else {
      notifyCenter(
        "Install TradePOS App (PWA)",
        "Bonyeza alama ya Install kwenye browser yako (au 'Add to Home Screen' kwenye simu) kuweka TradePOS kama App.",
        "INFO"
      );
    }
  };

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

  const handleConfirmBossPin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBoss = employees.find((emp) => emp.id === pendingBossEmpId) || employees.find((emp) => emp.role === "OWNER");
    const expectedPin = targetBoss?.pin || "1234";
    if (pinInput.trim() === expectedPin) {
      switchEmployeeAccount(targetBoss?.id || "emp-01");
      setPendingBossEmpId(null);
      setPinInput("");
      setPinError("");
      onNavigate("dashboard");
    } else {
      const errMsg = "PIN ya Boss si sahihi! Tafadhali jaribu tena.";
      setPinError(errMsg);
      notifyCenter("Hitilafu ya PIN", errMsg, "ERROR");
    }
  };

  return (
    <>
      <header className="h-16 bg-[#F4F7EE] border-b border-[#D8E6CC] px-4 lg:px-6 flex items-center justify-between z-30 select-none shadow-xs">
        {/* Left: Dynamic Page Title */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-base lg:text-xl font-black text-[#17260A] tracking-tight truncate max-w-[160px] sm:max-w-[320px] lg:max-w-none">
            {isSuperAdmin
              ? language === "sw"
                ? "Paneli Kuu ya Jukwaa (TradePOS Cloud)"
                : "Platform Super Admin Console"
              : pageTitle}
          </h1>
        </div>

        {/* Right Controls: Install App (PWA), Notifications, Help, Language, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {!isStandalone && !isSuperAdmin && (
            <button
              onClick={handleInstallPwa}
              className="px-2.5 py-1.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d2f88c] border border-[#9CE034] text-[#162709] text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title={language === "sw" ? "Weka TradePOS App (PWA)" : "Install TradePOS App (PWA)"}
            >
              <Download className="w-3.5 h-3.5 text-[#1B2F09]" />
              <span className="hidden md:inline">{language === "sw" ? "Weka App" : "Install App"}</span>
            </button>
          )}

          {/* 1. Notification Center (Owner & Staff see centered little box) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-9 h-9 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F4F7EE] flex items-center justify-center relative text-[#2B3F1E] shadow-xs transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1B2F09] text-[#E1FFAC] text-[9px] font-black flex items-center justify-center border border-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-fade-in"
                onClick={() => setIsNotifOpen(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-xs sm:max-w-sm rounded-2xl bg-white border-2 border-[#C2E880] shadow-2xl p-4"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#EDF4E4]">
                    <span className="text-xs font-black text-[#192A0B]">{t.header.notifications}</span>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-[#3D6612] font-bold hover:underline cursor-pointer"
                      >
                        {t.header.markAllRead}
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#EDF4E4] max-h-64 overflow-y-auto my-1.5">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-xs font-bold text-[#718765]">{t.header.noNotifications}</div>
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
                            <h4 className="text-xs font-black text-[#1B2D0C]">{n.title}</h4>
                            <span className="text-[10px] text-[#718765] shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-[#4F6444] mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-[#EDF4E4] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        onNavigate("notifications");
                      }}
                      className="text-xs font-black text-[#355B0F] hover:underline cursor-pointer"
                    >
                      {language === "sw" ? "Ona Taarifa Zote" : "View All Notifications"}
                    </button>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="px-3 py-1 rounded-lg bg-[#1B2F09] text-[#E1FFAC] text-[11px] font-black cursor-pointer"
                    >
                      {language === "sw" ? "Funga" : "Close"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Help & Docs */}
          <button
            onClick={() => onNavigate("help")}
            className="w-9 h-9 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F4F7EE] hidden sm:flex items-center justify-center text-[#2B3F1E] shadow-xs transition"
            title={t.header.helpCenter}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* 3. Language Selector Toggle: SW | EN */}
          <div className="flex items-center rounded-xl bg-white border border-[#D5E5C4] p-0.5 shadow-xs">
            <button
              onClick={() => setLanguage("sw")}
              className={`px-2 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                language === "sw"
                  ? "bg-[#1B2F09] text-[#E1FFAC]"
                  : "text-[#556F48] hover:text-[#182C0A]"
              }`}
              title="Kiswahili"
            >
              SW
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                language === "en"
                  ? "bg-[#1B2F09] text-[#E1FFAC]"
                  : "text-[#556F48] hover:text-[#182C0A]"
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* 4. User Profile Dropdown with PIN Privacy for Boss Account */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white border border-[#D5E5C4] hover:border-[#8ECE28] shadow-xs transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#E1FFAC] border border-[#A6DF52] flex items-center justify-center font-black text-xs text-[#1F3609]">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <span className="block text-xs font-black text-[#172709] leading-tight">
                  {user?.name || (language === "sw" ? "Mmiliki wa Duka" : "Store Owner")}
                </span>
                <span className="block text-[10px] font-bold text-[#5C724F]">
                  {isSuperAdmin
                    ? "Platform Admin (ROOT)"
                    : isOwner
                    ? language === "sw"
                      ? "Mwenye Duka"
                      : "Store Owner"
                    : language === "sw"
                    ? `Muuzaji (${user?.role})`
                    : `Cashier (${user?.role})`}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#5C724F]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border-2 border-[#C2E880] shadow-xl p-2 z-50 animate-fade-in text-xs font-bold text-[#2C401E]">
                {isSuperAdmin ? (
                  <div className="px-3 py-2 border-b border-[#EDF4E4]">
                    <span className="block font-black text-[#162708]">Platform Super Admin</span>
                    <span className="block text-[11px] text-[#476B19] font-bold mt-0.5">
                      Usimamizi Mkuu wa Jukwaa &amp; Maduka (ROOT)
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 border-b border-[#EDF4E4]">
                      <span className="block font-black text-[#162708]">{user?.name}</span>
                      <span className="block text-[11px] text-[#697E5D] font-normal">
                        {isOwner ? "Mwenye Duka — Anaona Vyote" : "Akaunti ya Muuzaji — Siri ya Boss Imelindwa"}
                      </span>
                    </div>

                    {/* Quick Switch Between Owner & Staff Accounts (Protected by Boss PIN) */}
                    <div className="py-1.5 px-2 border-b border-[#EDF4E4] bg-[#F8FBF4] rounded-xl my-1">
                      <span className="block text-[10px] font-black text-[#58704A] uppercase px-1 mb-1">
                        {language === "sw" ? "Badili Akaunti ya Duka" : "Switch Shop Account"}
                      </span>
                      <div className="space-y-1">
                        {employees.map((emp) => {
                          const isActive = user?.id === emp.id;
                          const isTargetBoss = emp.role === "OWNER";
                          return (
                            <button
                              key={emp.id}
                              onClick={() => {
                                setIsProfileOpen(false);
                                if (isTargetBoss && !isOwner) {
                                  // Require Boss PIN when switching from Seller -> Owner!
                                  setPendingBossEmpId(emp.id);
                                  setPinInput("");
                                  setPinError("");
                                  return;
                                }
                                switchEmployeeAccount(emp.id);
                                onNavigate(isTargetBoss ? "dashboard" : "sales");
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] transition cursor-pointer ${
                                isActive
                                  ? "bg-[#E1FFAC] text-[#162808] font-black border border-[#9CE034]"
                                  : "hover:bg-white text-[#334A24]"
                              }`}
                            >
                              <span className="truncate flex items-center gap-1">
                                {isTargetBoss && !isOwner && <Lock className="w-3 h-3 text-[#3F6315]" />}
                                <span>{emp.name}</span>
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/80 text-[#3F582E] font-bold">
                                {isTargetBoss ? "Boss (PIN)" : emp.role}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isOwner && (
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
                            onNavigate("employees");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F2F7EB] transition text-left"
                        >
                          <Shield className="w-4 h-4 text-[#476517]" />
                          <span>{language === "sw" ? "Akaunti za Wafanyakazi" : "Staff Accounts"}</span>
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
                      </div>
                    )}
                  </>
                )}

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

          {/* 5. Direct Top Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 hover:text-rose-800 text-xs font-black shadow-xs transition cursor-pointer"
            title={language === "sw" ? "Toka Nje ya Mfumo" : "Sign out of TradePOS"}
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </header>

      {/* BOSS PIN PRIVACY MODAL WHEN SELLER CLICKS BOSS ACCOUNT */}
      {pendingBossEmpId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-2 border-[#BFE973] shadow-2xl animate-slide-up">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#E1FFAC] border border-[#9CE034] flex items-center justify-center text-[#182C08]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#162709]">
                  {language === "sw" ? "Ingiza PIN ya Mwenye Duka (Boss)" : "Enter Owner (Boss) PIN"}
                </h3>
                <p className="text-[11px] text-[#5B714F]">
                  {language === "sw"
                    ? "Akaunti ya Boss ina siri za faida na mtaji. Ingiza PIN kuendelea."
                    : "Owner account contains confidential financial reports. Enter PIN to continue."}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmBossPin} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "PIN ya Siri ya Boss (Tarakimu 4):" : "Secret Owner PIN (4 digits):"}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  placeholder="****"
                  className="w-full py-2.5 px-3 rounded-xl neu-input text-center font-mono text-lg font-black tracking-widest"
                />
                <span className="block text-[10px] text-[#637B56] mt-1">
                  {language === "sw" ? "PIN ya Majaribio: " : "Default Demo PIN: "}
                  <strong>1234</strong>
                </span>
                {pinError && (
                  <span className="block text-[11px] font-bold text-rose-600 mt-1">
                    {pinError}
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingBossEmpId(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold cursor-pointer"
                >
                  {language === "sw" ? "Ghairi" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-black cursor-pointer"
                >
                  {language === "sw" ? "Thibitisha PIN" : "Confirm PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
