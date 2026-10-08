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
      case "dashboard": return t.titles.dashboard;
      case "pos": return t.titles.pos;
      case "sales": return t.titles.sales;
      case "products": return t.titles.products;
      case "inventory": return t.titles.inventory;
      case "purchases": return t.titles.purchases;
      case "suppliers": return t.titles.suppliers;
      case "customers": return t.titles.customers;
      case "expenses": return t.titles.expenses;
      case "accounting": return t.titles.accounting;
      case "cash-register": return t.titles.cashRegister;
      case "employees": return t.titles.employees;
      case "branches": return t.titles.branches;
      case "warehouses": return t.titles.warehouses;
      case "online-store": return t.titles.onlineStore;
      case "orders": return t.titles.orders;
      case "deliveries": return t.titles.deliveries;
      case "reports": return t.titles.reports;
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

      {/* AI FLOATING ASSISTANT MODAL (OPENED VIA ✨ ASK AI BUTTON) */}
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
              {activeModule === "dashboard" && <DashboardOverview onNavigate={(m) => setActiveModule(m)} />}
              {activeModule === "pos" && <PosTerminal />}
              {activeModule === "sales" && <SalesLedgerModule />}
              {(activeModule === "products" || activeModule === "inventory") && <InventoryModule />}
              {(activeModule === "purchases" || activeModule === "suppliers") && <PurchasesSuppliersModule />}
              {activeModule === "customers" && <CustomersModule />}
              {(activeModule === "expenses" || activeModule === "accounting") && <ExpensesAccountingModule />}
              {activeModule === "cash-register" && <CashRegisterModule />}
              {activeModule === "employees" && <EmployeesRolesModule />}
              {(activeModule === "branches" || activeModule === "warehouses") && <MultiBranchWarehouseModule />}
              {(activeModule === "online-store" || activeModule === "orders" || activeModule === "deliveries") && (
                <OnlineStoreDeliveriesModule />
              )}
              {activeModule === "reports" && <ReportsCenterModule />}
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
              <span>✨ Ask AI</span>
            </button>

            {/* MOBILE BOTTOM NAVIGATION BAR */}
            <div className="md:hidden h-14 bg-white border-t border-[#D8E6CC] px-2 flex items-center justify-around z-30 shrink-0">
              <button
                onClick={() => setActiveModule("dashboard")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "dashboard" ? "text-[#1C350A]" : "text-[#627956]"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>{t.nav.dashboard}</span>
              </button>

              <button
                onClick={() => setActiveModule("pos")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "pos" ? "text-[#1C350A]" : "text-[#627956]"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.nav.pos}</span>
              </button>

              <button
                onClick={() => setActiveModule("sales")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "sales" ? "text-[#1C350A]" : "text-[#627956]"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{t.nav.sales}</span>
              </button>

              <button
                onClick={() => setActiveModule("inventory")}
                className={`flex flex-col items-center text-[10px] font-bold ${
                  activeModule === "inventory" || activeModule === "products" ? "text-[#1C350A]" : "text-[#627956]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t.nav.inventory}</span>
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

          {/* MOBILE "MORE" DRAWER MODAL */}
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
                    { id: "deliveries", label: t.nav.deliveries, icon: Truck },
                    { id: "cash-register", label: t.nav.cashRegister, icon: Calculator },
                    { id: "customers", label: t.nav.customers, icon: Users },
                    { id: "expenses", label: t.nav.expenses, icon: DollarSign },
                    { id: "accounting", label: t.nav.accounting, icon: Receipt },
                    { id: "employees", label: t.nav.employees, icon: UserCheck },
                    { id: "reports", label: t.nav.reports, icon: BarChart3 },
                    { id: "settings", label: t.nav.settings, icon: Settings },
                    { id: "subscription", label: t.nav.subscription, icon: CreditCard },
                    { id: "help", label: t.nav.help, icon: HelpCircle },
                  ].map((it) => {
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        onClick={() => {
                          setActiveModule(it.id);
                          setIsMobileMoreOpen(false);
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
