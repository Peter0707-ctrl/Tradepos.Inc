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
  Calculator,
  UserCheck,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  TrendingUp
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
    switchEmployeeAccount,
  } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isOwner = !user || user.role === "OWNER" || isSuperAdmin;
  const pendingReportsCount = (dailyReports || []).filter((r) => r.status === "PENDING_REVIEW").length;

  // EXACT SIDEBAR ORDER REQUESTED BY USER:
  // 1. Dashibodi Kuu (dashboard)
  // 2. Mauzo ya Siku (sales) — Owner anaona mauzo & Mfanyakazi anaandika mauzo ya leo, mfumo unapiga mahesabu automatically
  // 3. Matumizi ya Siku (expenses) — Anaweka matumizi ya siku hiyo
  // 4. Stoo & Bidhaa (inventory) — Store stock kuweka na kutoa + hesabu ya Bando/Katoni vs Mauzo
  // 5. Ufuatiliaji wa Delivery (deliveries) — Kutrack delivery
  // 6. Wateja & Madeni (customers) — Kurekodi deni la mteja na jina
  // 7. Ripoti za Siku: Faida & Hasara (cash-register) — Kuonyesha faida na hasara ya kila siku
  const mainDailyWorkflowNav: { id: string; label: string; icon: any; badge?: string }[] = [
    ...(isOwner
      ? [
          {
            id: "dashboard",
            label: language === "sw" ? "1. Dashibodi Kuu" : "1. Main Dashboard",
            icon: Store,
          },
        ]
      : []),
    {
      id: "sales",
      label: language === "sw" ? "2. Mauzo ya Siku" : "2. Daily Sales",
      icon: ShoppingBag,
      badge: "AUTO",
    },
    {
      id: "expenses",
      label: language === "sw" ? "3. Matumizi ya Siku" : "3. Daily Expenses",
      icon: DollarSign,
    },
    {
      id: "inventory",
      label: language === "sw" ? "4. Stoo & Bidhaa (Store)" : "4. Store Stock (IN/OUT)",
      icon: Layers,
    },
    {
      id: "deliveries",
      label: language === "sw" ? "5. Kutrack Delivery" : "5. Track Deliveries",
      icon: Truck,
    },
    {
      id: "customers",
      label: language === "sw" ? "6. Wateja & Madeni" : "6. Customers & Debts",
      icon: Users,
    },
    {
      id: "cash-register",
      label: language === "sw" ? "7. Ripoti za Siku (Faida & Hasara)" : "7. Daily Reports (Profit & Loss)",
      icon: TrendingUp,
      badge: pendingReportsCount > 0 ? String(pendingReportsCount) : undefined,
    },
  ];

  // LOWER SECTION FOR OWNER: MANAGEMENT & SETTINGS
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

  if (isSuperAdmin) {
    mainDailyWorkflowNav.unshift({ id: "super-admin", label: t.nav.superAdmin, icon: ShieldAlert, badge: "ROOT" });
  }

  const handleNavClick = (id: string) => {
    if (id === "ai-assistant") {
      setIsAiModalOpen(true);
      return;
    }
    setActiveModule(id);
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
              <div className="w-9 h-9 rounded-xl bg-[#E1FFAC] border border-[#A6DF52] flex items-center justify-center text-[#182C08] shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#152508] tracking-tight">TradePOS</h2>
                <span className="text-[10px] font-bold text-[#556D48] uppercase tracking-wider block">
                  {isOwner ? "Mwenye Duka" : `${user?.role}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#E1FFAC] border border-[#A6DF52] flex items-center justify-center text-[#182C08] mx-auto shadow-xs">
              <ShoppingBag className="w-5 h-5" />
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
        <div className="overflow-y-auto max-h-[calc(100vh-170px)] p-2.5 space-y-1">
          <div className="px-2 py-1 text-[10px] font-extrabold text-[#4E683D] uppercase tracking-wider">
            {!collapsed
              ? isOwner
                ? language === "sw"
                  ? "Mtiririko wa Biashara Kila Siku"
                  : "Daily Business Workflow"
                : language === "sw"
                ? "Kazi za Mfanyakazi Kila Siku"
                : "Daily Staff Workflow"
              : "•"}
          </div>
          {mainDailyWorkflowNav.map(renderNavItem)}

          {isOwner && (
            <>
              <div className="pt-2 px-2 pb-1 text-[10px] font-extrabold text-[#6E8560] uppercase tracking-wider border-t border-[#DDE9D1] mt-2">
                {!collapsed ? (language === "sw" ? "Usimamizi & Mipangilio" : "Management & Setup") : "•"}
              </div>
              {lowUsageNav.map(renderNavItem)}
            </>
          )}
        </div>
      </div>

      {/* Footer Controls: Quick Switch Owner/Staff & Logout */}
      <div className="p-3 border-t border-[#D8E6CC] bg-[#EDF3E4] space-y-1.5">
        {!collapsed && (
          <button
            onClick={() => {
              if (isOwner) {
                switchEmployeeAccount("emp-02");
                setActiveModule("sales");
              } else {
                switchEmployeeAccount("emp-01");
                setActiveModule("dashboard");
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-white hover:bg-[#E1FFAC] text-[#182C08] border border-[#C6DDA8] transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#3F6315]" />
            <span>
              {isOwner
                ? language === "sw"
                  ? "Jaribu Akaunti ya Mfanyakazi"
                  : "Switch to Staff View"
                : language === "sw"
                ? "Rudi Akaunti ya Mwenye Duka"
                : "Back to Owner View"}
            </span>
          </button>
        )}

        <button
          onClick={onLogout}
          title={collapsed ? (language === "sw" ? "Toka Nje" : "Sign Out") : undefined}
          className={`w-full flex items-center ${
            collapsed ? "justify-center" : "gap-2.5 px-3"
          } py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{language === "sw" ? "Toka Nje" : "Sign Out"}</span>}
        </button>
      </div>
    </aside>
  );
};
