"use client";

import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { SplashScreen } from "@/components/SplashScreen";
import { LandingPage } from "@/components/LandingPage";
import { AuthModal } from "@/components/AuthModal";
import { TopHeader } from "@/components/TopHeader";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { PosTerminal } from "@/components/PosTerminal";
import { SalesLedgerModule } from "@/components/SalesLedgerModule";
import { InventoryModule } from "@/components/InventoryModule";
import { PurchasesSuppliersModule } from "@/components/PurchasesSuppliersModule";
import { CustomersModule } from "@/components/CustomersModule";
import { ExpensesAccountingModule } from "@/components/ExpensesAccountingModule";
import { CashRegisterModule } from "@/components/CashRegisterModule";
import { MultiBranchWarehouseModule } from "@/components/MultiBranchWarehouseModule";
import { EmployeesRolesModule } from "@/components/EmployeesRolesModule";
import { OnlineStoreDeliveriesModule } from "@/components/OnlineStoreDeliveriesModule";
import { ReportsCenterModule } from "@/components/ReportsCenterModule";
import { SubscriptionBillingModule } from "@/components/SubscriptionBillingModule";
import { BusinessSettingsModule } from "@/components/BusinessSettingsModule";
import { ProfileSecurityModule } from "@/components/ProfileSecurityModule";
import { HelpSupportModule } from "@/components/HelpSupportModule";
import { NotificationCenterModule } from "@/components/NotificationCenterModule";
import { SuperAdminPanel } from "@/components/SuperAdminPanel";
import { AuditLogsModule } from "@/components/AuditLogsModule";
import { AiAssistantModal } from "@/components/AiAssistantModal";
import {
  Store,
  ShoppingBag,
  Receipt,
  Package,
  Layers,
  Truck,
  Building,
  Users,
  DollarSign,
  Calculator,
  UserCheck,
  Warehouse,
  Globe,
  ShoppingCart,
  Send,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  User,
  MoreHorizontal,
  Sparkles,
  X
} from "lucide-react";

function MainApp() {
  const { user, loginUser, logoutUser, isAiModalOpen, setIsAiModalOpen, t, language } = useApp();

  const [showSplash, setShowSplash] = useState(false);
  const [view, setView] = useState<"landing" | "app">("landing");
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState<boolean>(false);

  // Restore authenticated session and view state on page reload
  React.useEffect(() => {
    try {
      const storedView = localStorage.getItem("tradepos_view_state");
      const storedUser = localStorage.getItem("tradepos_session_user");
      const hasSeenSplash = sessionStorage.getItem("tradepos_splash_shown");

      if (!hasSeenSplash) {
        setShowSplash(true);
        sessionStorage.setItem("tradepos_splash_shown", "true");
      }

      if (storedUser || storedView === "app") {
        setView("app");
      }
    } catch (e) {}
  }, [user]);

  const isLoggedIn = !!user;
  const isOwner = !user || user.role === "OWNER" || user.role === "SUPER_ADMIN";

  // Strict privacy guard: Sellers never see Boss pages (dashboard, cash-register/reports, employees, settings, subscription)
  const bossOnlyModules = ["dashboard", "cash-register", "reports", "employees", "settings", "subscription"];
  const effectiveModule = !isOwner && bossOnlyModules.includes(activeModule) ? "sales" : activeModule;

  React.useEffect(() => {
    if (!isOwner && bossOnlyModules.includes(activeModule)) {
      setActiveModule("sales");
    }
  }, [isOwner, activeModule]);

  const handleDemoLogin = () => {
    loginUser("peter@petercosmetics.co.tz");
    setView("app");
    setActiveModule("dashboard");
    try {
      localStorage.setItem("tradepos_view_state", "app");
    } catch (e) {}
  };

  // Human readable title lookup
  const getModuleTitle = (mod: string) => {
    switch (mod) {
      case "dashboard": return language === "sw" ? "1. Dashibodi Kuu ya Biashara (Boss)" : t.titles.dashboard;
      case "sales": return language === "sw" ? (isOwner ? "2. Mauzo ya Siku (Owner & Wafanyakazi)" : "1. Mauzo ya Leo (Andika Mauzo & Hesabu Auto)") : "Daily Sales & Auto Calculation";
      case "expenses":
      case "accounting": return language === "sw" ? (isOwner ? "3. Matumizi ya Siku Hiyo" : "2. Matumizi ya Leo Dukani") : "Daily Shop Expenses";
      case "products":
      case "inventory": return language === "sw" ? (isOwner ? "4. Stoo & Bidhaa (Bando za Stoo vs Mauzo)" : "3. Stoo & Bidhaa (Weka & Toa Stock)") : "Store Stock & Bundle Reconciliation";
      case "deliveries":
      case "orders":
      case "online-store": return language === "sw" ? (isOwner ? "5. Ufuatiliaji wa Delivery za Wateja" : "4. Kutrack Delivery za Wateja") : "Customer Delivery Tracking";
      case "customers": return language === "sw" ? (isOwner ? "6. Wateja & Daftari la Madeni" : "5. Wateja & Daftari la Madeni") : "Customers & Debt Ledger";
      case "cash-register":
      case "reports": return language === "sw" ? "7. Ripoti za Siku: Faida na Hasara ya Kila Siku (Boss)" : "7. Daily Reports: Profit & Loss";
      case "purchases": return t.titles.purchases;
      case "suppliers": return t.titles.suppliers;
      case "employees": return t.titles.employees;
      case "branches": return t.titles.branches;
      case "warehouses": return t.titles.warehouses;
      case "notifications": return t.titles.notifications;
      case "settings": return t.titles.settings;
      case "help": return t.titles.help;
      case "subscription": return t.titles.subscription;
      case "profile": return t.titles.profile;
      case "super-admin": return t.titles.superAdmin;
      default: return t.titles.dashboard;
    }
  };

  return (
    <div className="min-h-screen text-[#1E241E] flex flex-col font-sans select-none antialiased">
      {/* 5-SECOND BRANDED SPLASH SCREEN */}
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
          }}
        />
      )}

      {/* AUTHENTICATION MODAL */}
      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => {
            setAuthModal(null);
            setView("app");
            setActiveModule(user?.role === "SUPER_ADMIN" ? "super-admin" : isOwner ? "dashboard" : "sales");
          }}
        />
      )}

      {/* AI FLOATING ASSISTANT MODAL */}
      <AiAssistantModal />

      {/* VIEW CONDITIONAL: PUBLIC WEBSITE OR LOGGED-IN CUSTOMER ACCOUNT */}
      {!isLoggedIn || view === "landing" ? (
        <LandingPage
          onGetStarted={() => setAuthModal("register")}
          onLoginClick={() => setAuthModal("login")}
          onDemoLogin={handleDemoLogin}
        />
      ) : (
        /* ===================== LOGGED-IN PROFESSIONAL BUSINESS MANAGEMENT OS ===================== */
        <div className="flex h-screen overflow-hidden bg-transparent">
          {/* DESKTOP FIXED SIDEBAR */}
          <div className="hidden md:flex">
            <Sidebar
              activeModule={effectiveModule}
              setActiveModule={setActiveModule}
              onLogout={() => {
                logoutUser();
                setView("landing");
              }}
            />
          </div>

          {/* MAIN BUSINESS WORKSPACE CONTAINER */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#F4F7EE]/95">
            {/* TOP HEADER */}
            <TopHeader
              pageTitle={getModuleTitle(effectiveModule)}
              onNavigate={(mod) => setActiveModule(mod)}
              onLogout={() => {
                logoutUser();
                setView("landing");
              }}
            />

            {/* CENTER BUSINESS WORKSPACE */}
            <main className="flex-1 overflow-hidden relative">
              {isOwner && (effectiveModule === "dashboard" || effectiveModule === "ai-assistant") && (
                <DashboardOverview onNavigate={(m) => setActiveModule(m)} />
              )}
              {(effectiveModule === "sales" || effectiveModule === "pos") && <SalesLedgerModule />}
              {(effectiveModule === "expenses" || effectiveModule === "accounting") && <ExpensesAccountingModule />}
              {(effectiveModule === "products" || effectiveModule === "inventory") && <InventoryModule />}
              {(effectiveModule === "online-store" || effectiveModule === "orders" || effectiveModule === "deliveries") && (
                <OnlineStoreDeliveriesModule />
              )}
              {effectiveModule === "customers" && <CustomersModule />}
              {isOwner && (effectiveModule === "cash-register" || effectiveModule === "reports") && <CashRegisterModule />}
              {(effectiveModule === "purchases" || effectiveModule === "suppliers") && <PurchasesSuppliersModule />}
              {isOwner && effectiveModule === "employees" && <EmployeesRolesModule onNavigate={(m) => setActiveModule(m)} />}
              {(effectiveModule === "branches" || effectiveModule === "warehouses") && <MultiBranchWarehouseModule />}
              {effectiveModule === "notifications" && <NotificationCenterModule onNavigate={(m) => setActiveModule(m)} />}
              {isOwner && effectiveModule === "settings" && <BusinessSettingsModule />}
              {effectiveModule === "help" && <HelpSupportModule />}
              {isOwner && effectiveModule === "subscription" && <SubscriptionBillingModule />}
              {effectiveModule === "profile" && <ProfileSecurityModule />}
              {effectiveModule === "super-admin" && <SuperAdminPanel />}
              {effectiveModule === "audit-logs" && <AuditLogsModule />}
            </main>

            {/* FLOATING ASK AI BUTTON */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="fixed bottom-16 md:bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-[#1B2F09] text-[#E1FFAC] font-black text-xs shadow-xl border-2 border-[#A6DF52] flex items-center gap-2 hover:scale-105 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-[#E1FFAC]" />
              <span>Ask AI</span>
            </button>

            {/* MOBILE BOTTOM NAVIGATION BAR (SEPARATE BUTTONS FOR MAUZO, MATUMIZI, STOO, WATEJA) */}
            <div className="md:hidden h-14 bg-white border-t border-[#D8E6CC] px-2 flex items-center justify-around z-30 shrink-0">
              {isOwner && (
                <button
                  onClick={() => setActiveModule("dashboard")}
                  className={`flex flex-col items-center text-[10px] font-bold ${
                    effectiveModule === "dashboard" ? "text-[#1C350A] font-black" : "text-[#627956]"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Dashibodi</span>
                </button>
              )}

              <button
                onClick={() => setActiveModule("sales")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  effectiveModule === "sales" ? "text-[#1C350A] font-black" : "text-[#627956]"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === "sw" ? "Mauzo" : "Sales"}</span>
              </button>

              <button
                onClick={() => setActiveModule("expenses")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  effectiveModule === "expenses" ? "text-[#1C350A] font-black" : "text-[#627956]"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>{language === "sw" ? "Matumizi" : "Expenses"}</span>
              </button>

              <button
                onClick={() => setActiveModule("inventory")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  effectiveModule === "inventory" || effectiveModule === "products" ? "text-[#1C350A] font-black" : "text-[#627956]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{language === "sw" ? "Stoo" : "Store"}</span>
              </button>

              <button
                onClick={() => setIsMobileMoreOpen(true)}
                className="flex flex-col items-center text-[10px] font-bold text-[#627956]"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span>{t.nav.allMenu}</span>
              </button>
            </div>
          </div>

          {/* MOBILE "MORE" DRAWER MODAL (RESPECTS OWNER VS SELLER PRIVACY) */}
          {isMobileMoreOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs md:hidden">
              <div className="w-full bg-white rounded-t-3xl p-5 border-t-2 border-[#BFE973] shadow-2xl max-h-[75vh] overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E4] mb-3">
                  <h3 className="font-black text-sm text-[#162709]">{language === "sw" ? "Menu Zote" : "All Menus"}</h3>
                  <button
                    onClick={() => setIsMobileMoreOpen(false)}
                    className="p-1.5 rounded-full bg-[#EDF3E6] text-[#334A23]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {[
                    { id: "sales", label: "Mauzo ya Leo", icon: ShoppingBag },
                    { id: "expenses", label: "Matumizi ya Leo", icon: DollarSign },
                    { id: "inventory", label: "Stoo & Bidhaa", icon: Layers },
                    { id: "deliveries", label: "Delivery", icon: Truck },
                    { id: "customers", label: "Wateja & Madeni", icon: Users },
                    ...(isOwner
                      ? [
                          { id: "cash-register", label: "Ripoti (Faida)", icon: BarChart3 },
                          { id: "employees", label: t.nav.employees, icon: UserCheck },
                          { id: "settings", label: t.nav.settings, icon: Settings },
                          { id: "subscription", label: t.nav.subscription, icon: CreditCard },
                        ]
                      : []),
                    { id: "help", label: t.nav.help, icon: HelpCircle },
                  ].map((it) => {
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        onClick={() => {
                          setIsMobileMoreOpen(false);
                          setActiveModule(it.id);
                        }}
                        className="p-3 rounded-2xl bg-[#F8FAF4] hover:bg-[#E1FFAC] border border-[#D8E6CC] flex flex-col items-center gap-1.5 transition text-xs font-bold text-[#1C320A] active:scale-95"
                      >
                        <Icon className="w-5 h-5 text-[#395F12]" />
                        <span className="truncate w-full">{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
