"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Store,
  ShoppingBag,
  Receipt,
  Package,
  Layers,
  Truck,
  Users,
  DollarSign,
  Calculator,
  UserCheck,
  Building,
  Warehouse,
  Globe,
  ShoppingCart,
  Send,
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
  const { user, t, language } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const primaryNav = [
    { id: "dashboard", label: t.nav.dashboard, icon: Store },
    { id: "pos", label: t.nav.pos, icon: ShoppingBag, badge: "FAST" },
    { id: "sales", label: t.nav.sales, icon: Receipt },
    { id: "inventory", label: t.nav.inventory, icon: Layers },
    { id: "deliveries", label: t.nav.deliveries, icon: Truck },
    { id: "cash-register", label: t.nav.cashRegister, icon: Calculator },
    { id: "customers", label: t.nav.customers, icon: Users },
    { id: "expenses", label: t.nav.expenses, icon: DollarSign },
    { id: "accounting", label: t.nav.accounting, icon: Receipt },
    { id: "employees", label: t.nav.employees, icon: UserCheck },
    { id: "reports", label: t.nav.reports, icon: BarChart3 },
    { id: "ai-assistant", label: t.nav.aiAssistant, icon: Sparkles, badge: "COPETRA" },
    { id: "notifications", label: t.nav.notifications, icon: Bell },
  ];

  const secondaryNav = [
    { id: "settings", label: t.nav.settings, icon: Settings },
    { id: "help", label: t.nav.help, icon: HelpCircle },
    { id: "subscription", label: t.nav.subscription, icon: CreditCard },
  ];

  if (isSuperAdmin) {
    primaryNav.unshift({ id: "super-admin", label: t.nav.superAdmin, icon: ShieldAlert, badge: "ROOT" });
  }

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
                  Enterprise OS
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
        <div className="overflow-y-auto max-h-[calc(100vh-210px)] p-2.5 space-y-1">
          <div className="px-2 py-1 text-[10px] font-extrabold text-[#6E8560] uppercase tracking-wider">
            {!collapsed ? "Business Modules" : "•"}
          </div>

          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-2" : "justify-between px-3"
                } py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  isActive
                    ? "bg-[#E1FFAC] text-[#162708] border border-[#A6DF52] shadow-xs font-black"
                    : "text-[#3D5233] hover:bg-white/80 hover:text-[#182A0B]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#1C3308]" : "text-[#556D49]"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#22390C] text-[#E1FFAC]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 px-2 pb-1 text-[10px] font-extrabold text-[#6E8560] uppercase tracking-wider border-t border-[#DDE9D1] mt-2">
            {!collapsed ? (language === "sw" ? "Usimamizi" : "Management") : "•"}
          </div>

          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-2" : "justify-between px-3"
                } py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  isActive
                    ? "bg-[#E1FFAC] text-[#162708] border border-[#A6DF52] shadow-xs font-black"
                    : "text-[#3D5233] hover:bg-white/80 hover:text-[#182A0B]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#1C3308]" : "text-[#556D49]"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Controls: User profile & Logout */}
      <div className="p-3 border-t border-[#D8E6CC] bg-[#EDF3E4]">
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
