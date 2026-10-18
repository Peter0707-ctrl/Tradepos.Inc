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
      case "dashboard": return language === "sw" ? "1. Dashibodi Kuu ya Biashara" : t.titles.dashboard;
      case "sales": return language === "sw" ? "2. Mauzo ya Siku (Andika Mauzo & Hesabu Auto)" : "2. Daily Sales & Auto Calculation";
      case "expenses":
      case "accounting": return language === "sw" ? "3. Matumizi ya Siku Hiyo" : "3. Daily Shop Expenses";
      case "products":
      case "inventory": return language === "sw" ? "4. Stoo & Bidhaa (Bando za Stoo vs Mauzo)" : "4. Store Stock & Bundle Reconciliation";
      case "deliveries":
      case "orders":
      case "online-store": return language === "sw" ? "5. Ufuatiliaji wa Delivery za Wateja" : "5. Customer Delivery Tracking";
      case "customers": return language === "sw" ? "6. Wateja & Daftari la Madeni" : "6. Customers & Debt Ledger";
      case "cash-register":
      case "reports": return language === "sw" ? "7. Ripoti za Siku: Faida na Hasara ya Kila Siku" : "7. Daily Reports: Profit & Loss";
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
            setActiveModule(user?.role === "SUPER_ADMIN" ? "super-admin" : "dashboard");
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
              activeModule={activeModule}
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
              pageTitle={getModuleTitle(activeModule)}
              onNavigate={(mod) => setActiveModule(mod)}
              onLogout={() => {
                logoutUser();
                setView("landing");
              }}
            />

            {/* CENTER BUSINESS WORKSPACE */}
            <main className="flex-1 overflow-hidden relative">
              {(activeModule === "dashboard" || activeModule === "ai-assistant") && (
                <DashboardOverview onNavigate={(m) => setActiveModule(m)} />
              )}
              {(activeModule === "sales" || activeModule === "pos") && <SalesLedgerModule />}
              {(activeModule === "expenses" || activeModule === "accounting") && <ExpensesAccountingModule />}
              {(activeModule === "products" || activeModule === "inventory") && <InventoryModule />}
              {(activeModule === "online-store" || activeModule === "orders" || activeModule === "deliveries") && (
                <OnlineStoreDeliveriesModule />
              )}
              {activeModule === "customers" && <CustomersModule />}
              {(activeModule === "cash-register" || activeModule === "reports") && <CashRegisterModule />}
              {(activeModule === "purchases" || activeModule === "suppliers") && <PurchasesSuppliersModule />}
              {activeModule === "employees" && <EmployeesRolesModule onNavigate={(m) => setActiveModule(m)} />}
              {(activeModule === "branches" || activeModule === "warehouses") && <MultiBranchWarehouseModule />}
              {activeModule === "notifications" && <NotificationCenterModule onNavigate={(m) => setActiveModule(m)} />}
              {activeModule === "settings" && <BusinessSettingsModule />}
              {activeModule === "help" && <HelpSupportModule />}
              {activeModule === "subscription" && <SubscriptionBillingModule />}
              {activeModule === "profile" && <ProfileSecurityModule />}
              {activeModule === "super-admin" && <SuperAdminPanel />}
              {activeModule === "audit-logs" && <AuditLogsModule />}
            </main>

            {/* FLOATING ASK AI BUTTON */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="fixed bottom-16 md:bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-[#1B2F09] text-[#E1FFAC] font-black text-xs shadow-xl border-2 border-[#A6DF52] flex items-center gap-2 hover:scale-105 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-[#E1FFAC]" />
              <span>Ask AI</span>
            </button>

            {/* MOBILE BOTTOM NAVIGATION BAR (ORDERED BY HIGHEST DAILY USAGE) */}
            <div className="md:hidden h-14 bg-white border-t border-[#D8E6CC] px-2 flex items-center justify-around z-30 shrink-0">
              <button
                onClick={() => setActiveModule("dashboard")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "dashboard" ? "text-[#1C350A] font-black" : "text-[#627956]"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>{t.nav.dashboard}</span>
              </button>

              <button
                onClick={() => setActiveModule("cash-register")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "cash-register" ? "text-[#1C350A] font-black" : "text-[#627956]"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>{language === "sw" ? "Hesabu ya Siku" : "Daily Shift"}</span>
              </button>

              <button
                onClick={() => setActiveModule("inventory")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "inventory" || activeModule === "products" ? "text-[#1C350A] font-black" : "text-[#627956]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t.nav.inventory}</span>
              </button>

              <button
                onClick={() => setActiveModule("customers")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "customers" ? "text-[#1C350A] font-black" : "text-[#627956]"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t.nav.customers}</span>
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

          {/* MOBILE "MORE" DRAWER MODAL (ORDERED BY USAGE FREQUENCY) */}
          {isMobileMoreOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs md:hidden">
              <div className="w-full bg-white rounded-t-3xl p-5 border-t-2 border-[#BFE973] shadow-2xl max-h-[75vh] overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E4] mb-3">
                  <h3 className="font-black text-sm text-[#162709]">{language === "sw" ? "Menu Zote za Biashara" : "All Business Menus"}</h3>
                  <button
                    onClick={() => setIsMobileMoreOpen(false)}
                    className="p-1.5 rounded-full bg-[#EDF3E6] text-[#334A23]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {[
                    { id: "cash-register", label: t.nav.cashRegister, icon: Calculator },
                    { id: "deliveries", label: t.nav.deliveries, icon: Truck },
                    {
                      id: "expenses",
                      label: language === "sw" ? "Matumizi & Faida" : "Expenses & Profit",
                      icon: DollarSign,
                    },
                    { id: "reports", label: t.nav.reports, icon: BarChart3 },
                    { id: "ai-assistant", label: t.nav.aiAssistant, icon: Sparkles },
                    { id: "employees", label: t.nav.employees, icon: UserCheck },
                    { id: "notifications", label: t.nav.notifications, icon: Bell },
                    { id: "settings", label: t.nav.settings, icon: Settings },
                    { id: "subscription", label: t.nav.subscription, icon: CreditCard },
                    { id: "help", label: t.nav.help, icon: HelpCircle },
                  ].map((it) => {
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        onClick={() => {
                          setIsMobileMoreOpen(false);
                          if (it.id === "ai-assistant") {
                            setIsAiModalOpen(true);
                          } else {
                            setActiveModule(it.id);
                          }
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
