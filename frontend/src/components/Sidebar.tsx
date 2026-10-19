"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Store,
  ShoppingBag,
  Layers,
  Truck,
  Users,
  DollarSign,
  UserCheck,
  Sparkles,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  Lock,
  CheckCircle2,
  Send,
  Activity,
  Building2,
  LifeBuoy
} from "lucide-react";

interface SidebarProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, onLogout }) => {
  const {
    user,
    t,
    language,
    setIsAiModalOpen,
    unreadNotificationCount,
    dailyReports,
    employees,
    availableBusinesses,
    supportTickets,
    switchEmployeeAccount,
    closeDayAndSendToBoss,
    isDayClosed,
    startNewDay,
    impersonatingTenantId,
    adminExitImpersonation,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const isSuperAdmin = user?.role === "SUPER_ADMIN" && !impersonatingTenantId;
  const isOwner = user?.role === "OWNER" || (!user && !isSuperAdmin) || !!impersonatingTenantId;
  const pendingReportsCount = (dailyReports || []).filter((r) => r.status === "PENDING_REVIEW").length;
  const openTicketsCount = (supportTickets || []).filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  // DEDICATED SAAS NAVIGATION FOR PLATFORM SUPER ADMIN (ZERO SHOP ITEMS)
  const superAdminNav: { id: string; label: string; icon: any; badge?: string }[] = [
    {
      id: "super-admin",
      label: language === "sw" ? "Maduka & Usajili" : "Stores & Subscriptions",
      icon: Building2,
      badge: String(availableBusinesses.length || 4),
    },
    {
      id: "admin-users",
      label: language === "sw" ? "Watumiaji Wote (Staff)" : "All Users & Staff",
      icon: Users,
      badge: String(employees.length || 9),
    },
    {
      id: "admin-support",
      label: language === "sw" ? "Desk ya Msaada" : "Support & Issue Desk",
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? String(openTicketsCount) : undefined,
    },
    {
      id: "audit-logs",
      label: language === "sw" ? "Kumbukumbu za Mfumo" : "Global Audit Logs",
      icon: Activity,
    },
    {
      id: "notifications",
      label: language === "sw" ? "Matangazo na Taarifa" : "System Broadcasts",
      icon: Bell,
      badge: unreadNotificationCount > 0 ? String(unreadNotificationCount) : undefined,
    },
    {
      id: "settings",
      label: language === "sw" ? "Mipangilio ya Jukwaa" : "Platform Settings",
      icon: Settings,
    },
    {
      id: "help",
      label: language === "sw" ? "Msaada & Nyaraka" : "Help & Documentation",
      icon: HelpCircle,
    },
  ];

  // SEPARATE SIDEBAR BUTTONS FOR OWNER VS SELLERS (STRICT PRIVACY):
  // - Owner sees all 7 sections (including Dashibodi Kuu & Ripoti za Faida na Hasara)
  // - Sellers ONLY see their separate daily task buttons (1. Mauzo ya Leo, 2. Matumizi ya Leo, 3. Stoo & Bidhaa, 4. Kutrack Delivery, 5. Wateja & Madeni)
  const mainDailyWorkflowNav: { id: string; label: string; icon: any; badge?: string }[] = isOwner
    ? [
        {
          id: "dashboard",
          label: language === "sw" ? "Dashibodi" : "Dashboard",
          icon: Store,
        },
        {
          id: "sales",
          label: language === "sw" ? "Mauzo ya Siku" : "Daily Sales",
          icon: ShoppingBag,
        },
        {
          id: "expenses",
          label: language === "sw" ? "Matumizi ya Siku" : "Daily Expenses",
          icon: DollarSign,
        },
        {
          id: "inventory",
          label: language === "sw" ? "Stoo & Bidhaa" : "Store Stock",
          icon: Layers,
        },
        {
          id: "deliveries",
          label: language === "sw" ? "Kutrack Delivery" : "Deliveries",
          icon: Truck,
        },
        {
          id: "customers",
          label: language === "sw" ? "Wateja & Madeni" : "Customers & Debts",
          icon: Users,
        },
        {
          id: "cash-register",
          label: language === "sw" ? "Ripoti za Siku" : "Daily Reports",
          icon: TrendingUp,
          badge: pendingReportsCount > 0 ? String(pendingReportsCount) : undefined,
        },
      ]
    : [
        {
          id: "sales",
          label: language === "sw" ? "Mauzo ya Leo" : "Today's Sales",
          icon: ShoppingBag,
        },
        {
          id: "expenses",
          label: language === "sw" ? "Matumizi ya Leo" : "Today's Expenses",
          icon: DollarSign,
        },
        {
          id: "inventory",
          label: language === "sw" ? "Stoo & Bidhaa" : "Store Stock",
          icon: Layers,
        },
        {
          id: "deliveries",
          label: language === "sw" ? "Kutrack Delivery" : "Deliveries",
          icon: Truck,
        },
        {
          id: "customers",
          label: language === "sw" ? "Wateja & Madeni" : "Customers & Debts",
          icon: Users,
        },
      ];

  // LOWER SECTION FOR OWNER ONLY: MANAGEMENT & SETTINGS
  const lowUsageNav: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: "employees", label: t.nav.employees, icon: UserCheck },
    { id: "ai-assistant", label: t.nav.aiAssistant, icon: Sparkles, badge: "AI" },
    {
      id: "notifications",
      label: t.nav.notifications,
      icon: Bell,
      badge: unreadNotificationCount > 0 ? String(unreadNotificationCount) : undefined,
    },
    { id: "settings", label: t.nav.settings, icon: Settings },
    { id: "subscription", label: t.nav.subscription, icon: CreditCard },
    { id: "help", label: t.nav.help, icon: HelpCircle },
  ];

  const handleNavClick = (id: string) => {
    if (id === "ai-assistant") {
      setIsAiModalOpen(true);
      return;
    }
    setActiveModule(id);
  };

  const handleVerifyOwnerPin = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerAcc = employees.find((emp) => emp.role === "OWNER");
    const expectedPin = ownerAcc?.pin || "1234";
    if (pinInput.trim() === expectedPin) {
      switchEmployeeAccount(ownerAcc?.id || "emp-01");
      setActiveModule("dashboard");
      setIsPinModalOpen(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError(language === "sw" ? "PIN si sahihi! Ingiza PIN ya Boss (1234)." : "Incorrect PIN! Enter Owner PIN (1234).");
    }
  };

  const renderNavItem = (item: { id: string; label: string; icon: any; badge?: string }) => {
    const Icon = item.icon;
    const isActive =
      activeModule === item.id ||
      (item.id === "expenses" && activeModule === "accounting") ||
      (item.id === "inventory" && activeModule === "products") ||
      (item.id === "cash-register" && activeModule === "reports");
    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center ${
          collapsed ? "justify-center px-2" : "justify-between px-3"
        } py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
          isActive
            ? "bg-[#E1FFAC] text-[#162708] border border-[#A6DF52] shadow-xs font-black"
            : "text-[#3D5233] hover:bg-white/80 hover:text-[#182A0B]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#1C3308]" : "text-[#556D49]"}`} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </div>
        {!collapsed && item.badge && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#22390C] text-[#E1FFAC] shrink-0">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <aside
        className={`bg-[#F4F7EE] border-r border-[#D8E6CC] flex flex-col justify-between h-screen shrink-0 select-none shadow-xs transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand & Collapse Header */}
        <div>
          <div className="p-4 border-b border-[#D8E6CC] flex items-center justify-between">
            {!collapsed ? (
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${isSuperAdmin ? "bg-[#1B2F09] border border-[#8ECE28] text-[#E1FFAC]" : "bg-[#E1FFAC] border border-[#A6DF52] text-[#182C08]"} flex items-center justify-center shadow-xs`}>
                  {isSuperAdmin ? <ShieldAlert className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#152508] tracking-tight">
                    {isSuperAdmin ? "TradePOS Cloud" : "TradePOS"}
                  </h2>
                  <span className="text-[10px] font-bold text-[#556D48] uppercase tracking-wider block">
                    {isSuperAdmin
                      ? "Super Admin (ROOT)"
                      : isOwner
                      ? language === "sw" ? "Mwenye Duka" : "Store Owner"
                      : `${language === "sw" ? "Muuzaji" : "Cashier"}: ${user?.name}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`w-9 h-9 rounded-xl ${isSuperAdmin ? "bg-[#1B2F09] border border-[#8ECE28] text-[#E1FFAC]" : "bg-[#E1FFAC] border border-[#A6DF52] text-[#182C08]"} flex items-center justify-center mx-auto shadow-xs`}>
                {isSuperAdmin ? <ShieldAlert className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 rounded-lg bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] flex items-center justify-center text-[#3B5424] transition hidden md:flex"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Scrollable Navigation Items */}
          <div className="overflow-y-auto max-h-[calc(100vh-230px)] p-2.5 space-y-1">
            {isSuperAdmin ? (
              <>
                <div className="px-2 py-1 text-[10px] font-extrabold text-[#4E683D] uppercase tracking-wider">
                  {!collapsed ? (language === "sw" ? "USIMAMIZI WA JUKWAA (SAAS)" : "PLATFORM MANAGEMENT") : "•"}
                </div>
                {superAdminNav.map(renderNavItem)}
              </>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] font-extrabold text-[#4E683D] uppercase tracking-wider">
                  {!collapsed
                    ? isOwner
                      ? language === "sw"
                        ? "Mtiririko wa Biashara (Owner)"
                        : "Owner Business Workflow"
                      : language === "sw"
                      ? "Sehemu za Muuzaji Kila Siku"
                      : "Seller Daily Tasks"
                    : "•"}
                </div>
                {mainDailyWorkflowNav.map(renderNavItem)}

                {isOwner && (
                  <>
                    <div className="pt-2 px-2 pb-1 text-[10px] font-extrabold text-[#6E8560] uppercase tracking-wider border-t border-[#DDE9D1] mt-2">
                      {!collapsed ? (language === "sw" ? "Usimamizi wa Boss" : "Owner Management") : "•"}
                    </div>
                    {lowUsageNav.map(renderNavItem)}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Controls: Funga Mauzo ya Siku + Protected Switch Owner/Staff & Logout */}
        <div className="p-3 border-t border-[#D8E6CC] bg-[#EDF3E4] space-y-1.5">
          {!isSuperAdmin && !collapsed && (
            <>
              {/* Quick "Funga Mauzo ya Siku" button so Seller/Owner can end the day and auto-send to Boss */}
              {!isDayClosed ? (
                <button
                  onClick={() => {
                    closeDayAndSendToBoss();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-black bg-[#1B2F09] hover:bg-[#26420D] text-[#E1FFAC] border border-[#8ECE28] transition cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === "sw" ? "Funga Mauzo ya Siku" : "Close Daily Sales"}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    startNewDay();
                    setActiveModule("sales");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-black bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === "sw" ? "Siku Imefungwa • Anza Mpya" : "Day Closed • Start New Day"}</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (isOwner) {
                    switchEmployeeAccount("emp-02");
                    setActiveModule("sales");
                  } else {
                    setPinInput("");
                    setPinError("");
                    setIsPinModalOpen(true);
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-white hover:bg-[#E1FFAC] text-[#182C08] border border-[#C6DDA8] transition cursor-pointer"
              >
                {isOwner ? (
                  <UserCheck className="w-3.5 h-3.5 text-[#3F6315]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#3F6315]" />
                )}
                <span>
                  {isOwner
                    ? language === "sw"
                      ? "Jaribu Akaunti ya Muuzaji"
                      : "Switch to Seller View"
                    : language === "sw"
                    ? "Ingia Akaunti ya Boss (PIN)"
                    : "Boss Account (PIN)"}
                </span>
              </button>
            </>
          )}

          <button
            onClick={onLogout}
            title={collapsed ? (language === "sw" ? "Toka Nje" : "Sign Out") : undefined}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : "gap-2.5 px-3"
            } py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200/50 transition cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{language === "sw" ? "Toka Kwenye Mfumo" : "Sign Out"}</span>}
          </button>
        </div>
      </aside>

      {/* BOSS PIN PRIVACY MODAL WHEN SWITCHING FROM SELLER TO OWNER */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-2 border-[#BFE973] shadow-2xl animate-slide-up">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#E1FFAC] border border-[#9CE034] flex items-center justify-center text-[#182C08]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#162709]">
                  {language === "sw" ? "Ulinzi wa Akaunti ya Mwenye Duka" : "Store Owner Account Security"}
                </h3>
                <p className="text-[11px] text-[#5B714F]">
                  {language === "sw"
                    ? "Wauzaji hawawezi kuona faida na ripoti za Boss bila PIN."
                    : "Staff cannot view profit and reports without the Owner PIN."}
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOwnerPin} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "Ingiza PIN ya Siri ya Boss (Tarakimu 4):" : "Enter Owner PIN (4 digits):"}
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
                  {language === "sw" ? "Kwa majaribio (Demo), PIN ya Boss ni: " : "Default owner PIN is: "}
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
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold cursor-pointer"
                >
                  {language === "sw" ? "Ghairi" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-black cursor-pointer"
                >
                  {language === "sw" ? "Fungua Akaunti ya Boss" : "Unlock Owner Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
