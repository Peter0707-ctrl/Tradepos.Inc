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
  ShieldAlert
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

  // EMPLOYEE / STAFF NAVIGATION (No POS machine or receipts — focused on Daily Sales/Expenses/Stock & Sending to Owner)
  const staffCoreNav: { id: string; label: string; icon: any; badge?: string }[] = [
    {
      id: "cash-register",
      label: language === "sw" ? "Mahesabu ya Siku & Mauzo" : "Daily Sales & Handover",
      icon: Calculator,
      badge: "TUMA",
    },
    {
      id: "inventory",
      label: language === "sw" ? "Stoo & Bidhaa (IN / OUT)" : "Stock (IN / OUT)",
      icon: Layers,
    },
    { id: "customers", label: t.nav.customers, icon: Users },
    { id: "deliveries", label: t.nav.deliveries, icon: Truck },
  ];

  // OWNER NAVIGATION (Ordered Most Used -> Least Used, with POS Machine & Receipts removed)
  // 1. MOST USED (Every Hour - Daily Shop Operations)
  const highUsageNav: { id: string; label: string; icon: any; badge?: string }[] = [
    {
      id: "dashboard",
      label: t.nav.dashboard,
      icon: Store,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} MPYA` : undefined,
    },
    {
      id: "cash-register",
      label: language === "sw" ? "Mahesabu ya Siku & Mauzo" : "Daily Sales & Handover",
      icon: Calculator,
      badge: pendingReportsCount > 0 ? String(pendingReportsCount) : undefined,
    },
    { id: "inventory", label: t.nav.inventory, icon: Layers },
    { id: "customers", label: t.nav.customers, icon: Users },
    { id: "deliveries", label: t.nav.deliveries, icon: Truck },
  ];

  // 2. MEDIUM USAGE (Profit/Loss & Analytics)
  const dailyFinanceNav: { id: string; label: string; icon: any; badge?: string }[] = [
    {
      id: "expenses",
      label: language === "sw" ? "Matumizi & Faida" : "Expenses & Profit",
      icon: DollarSign,
    },
    { id: "reports", label: t.nav.reports, icon: BarChart3 },
    { id: "ai-assistant", label: t.nav.aiAssistant, icon: Sparkles, badge: "COPETRA" },
  ];

  // 3. LEAST USED (Staff, Alerts, Settings & Subscription)
  const lowUsageNav: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: "employees", label: t.nav.employees, icon: UserCheck },
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
    highUsageNav.unshift({ id: "super-admin", label: t.nav.superAdmin, icon: ShieldAlert, badge: "ROOT" });
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
      (item.id === "inventory" && activeModule === "products");
    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center ${
          collapsed ? "justify-center px-2" : "justify-between px-3"
        } py-2 rounded-xl text-xs font-bold transition duration-150 ${
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
          {!isOwner ? (
            <>
              <div className="px-2 py-1 text-[10px] font-extrabold text-[#4E683D] uppercase tracking-wider">
                {!collapsed ? (language === "sw" ? "Kazi za Mfanyakazi" : "Staff Workspace") : "•"}
              </div>
              {staffCoreNav.map(renderNavItem)}
            </>
          ) : (
            <>
              {/* TIER 1: HIGH USAGE */}
              <div className="px-2 py-1 text-[10px] font-extrabold text-[#4E683D] uppercase tracking-wider">
                {!collapsed ? (language === "sw" ? "Kazi za Kila Saa" : "Daily Core") : "•"}
              </div>
              {highUsageNav.map(renderNavItem)}

              {/* TIER 2: DAILY CLOSING & FINANCE */}
              <div className="pt-2 px-2 pb-1 text-[10px] font-extrabold text-[#5F7750] uppercase tracking-wider border-t border-[#DDE9D1] mt-2">
                {!collapsed ? (language === "sw" ? "Hesabu & Faida" : "Daily Finance") : "•"}
              </div>
              {dailyFinanceNav.map(renderNavItem)}

              {/* TIER 3: LOW USAGE / ADMIN & SETTINGS */}
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
                setActiveModule("cash-register");
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
          className={`w-full flex items-center ${
            collapsed ? "justify-center" : "justify-start gap-2.5"
          } px-3 py-2 rounded-xl text-xs font-bold text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition`}
          title={t.logout}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>{t.logout}</span>}
        </button>
      </div>
    </aside>
  );
};
