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
import { AdminDashboardModule } from "@/components/AdminDashboardModule";
import { CashierDashboardModule } from "@/components/CashierDashboardModule";
import { AdminTenantsModule } from "@/components/AdminTenantsModule";
import { AdminUsersModule } from "@/components/AdminUsersModule";
import { AdminSupportDeskModule } from "@/components/AdminSupportDeskModule";
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
  Building2,
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
  X,
  ShieldAlert,
  Activity,
  LayoutDashboard
} from "lucide-react";

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || "Hitilafu imetokea kwenye ukurasa." };
  }

  componentDidCatch() {
    // Suppress raw console error overlay
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7EE] flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-xs rounded-2xl bg-white border-2 border-rose-400 shadow-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center mx-auto mb-2.5 font-black text-sm">
              !
            </div>
            <h4 className="text-sm font-black text-rose-900">Hitilafu ya Mfumo Imerekebishwa</h4>
            <p className="text-xs font-bold text-[#495D3E] mt-1 leading-relaxed">
              Mfumoumezuia hitilafu ndogo isiharibu ukurasa wako. Bonyeza hapa chini kuendelea.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, errorMsg: "" })}
              className="mt-4 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer"
            >
              Endelea na Kazi
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const {
    user,
    isHydrated,
    viewState: view,
    setViewState: setView,
    activeModule,
    setActiveModule,
    logoutUser,
    isAiModalOpen,
    setIsAiModalOpen,
    t,
    language,
    impersonatingTenantId,
    adminExitImpersonation,
    business,
  } = useApp();

  const [showSplash, setShowSplash] = useState(true);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState<boolean>(false);

  // If already logged in, skip splash screen directly
  React.useEffect(() => {
    if (user) {
      setShowSplash(false);
    }
  }, [user]);

  const isLoggedIn = !!user;
  const isSuperAdmin = user?.role === "SUPER_ADMIN" && !impersonatingTenantId;
  const isOwner = user?.role === "OWNER" || (!user && !isSuperAdmin) || !!impersonatingTenantId;

  // Strict isolation:
  // 1. Super Admin: SaaS platform only (super-admin, admin-users, admin-support, audit-logs, notifications, settings, help)
  // 2. Boss/Owner: Full store management (dashboard, sales, expenses, inventory, customers, reports, etc.)
  // 3. Cashier/Seller: POS and daily sales only
  const superAdminModules = [
    "admin-dashboard",
    "dashboard",
    "super-admin",
    "admin-tenants",
    "admin-users",
    "admin-support",
    "audit-logs",
    "notifications",
    "settings",
    "help"
  ];
  const bossOnlyModules = ["cash-register", "reports", "employees", "settings", "subscription"];

  let effectiveModule = activeModule;
  if (isSuperAdmin) {
    if (!superAdminModules.includes(activeModule)) {
      effectiveModule = "admin-dashboard";
    }
  } else if (!isOwner && bossOnlyModules.includes(activeModule)) {
    effectiveModule = "sales";
  }

  React.useEffect(() => {
    if (isHydrated) {
      if (isSuperAdmin && !superAdminModules.includes(activeModule)) {
        setActiveModule("admin-dashboard");
      } else if (!isSuperAdmin && !isOwner && bossOnlyModules.includes(activeModule)) {
        setActiveModule("sales");
      }
    }
  }, [isHydrated, isSuperAdmin, isOwner, activeModule, setActiveModule]);


  // Human readable title lookup
  const getModuleTitle = (mod: string) => {
    switch (mod) {
      case "admin-dashboard": return language === "sw" ? "Dashibodi ya Admin" : "Admin Dashboard";
      case "dashboard": return isSuperAdmin ? (language === "sw" ? "Dashibodi ya Admin" : "Admin Dashboard") : (language === "sw" ? "Dashibodi" : t.titles.dashboard);
      case "sales": return language === "sw" ? "Mauzo ya Siku" : "Daily Sales";
      case "expenses":
      case "accounting": return language === "sw" ? "Matumizi ya Siku" : "Daily Expenses";
      case "products":
      case "inventory": return language === "sw" ? "Stoo & Bidhaa" : "Store Stock";
      case "deliveries":
      case "orders":
      case "online-store": return language === "sw" ? "Kutrack Delivery" : "Deliveries";
      case "customers": return language === "sw" ? "Wateja & Madeni" : "Customers & Debts";
      case "cash-register":
      case "reports": return language === "sw" ? "Ripoti za Siku" : "Daily Reports";
      case "purchases": return t.titles.purchases;
      case "suppliers": return t.titles.suppliers;
      case "employees": return t.titles.employees;
      case "branches": return t.titles.branches;
      case "warehouses": return t.titles.warehouses;
      case "notifications": return language === "sw" ? "Matangazo na Taarifa za Mfumo" : "System Broadcasts";
      case "settings": return language === "sw" ? "Mipangilio ya Jukwaa" : "Platform Settings";
      case "help": return t.titles.help;
      case "subscription": return t.titles.subscription;
      case "profile": return t.titles.profile;
      case "super-admin":
      case "admin-tenants": return language === "sw" ? "Maduka & Usajili" : "Stores & Subscriptions";
      case "admin-users": return language === "sw" ? "Watumiaji & Staff" : "All Users & Staff";
      case "admin-support": return language === "sw" ? "Desk ya Msaada" : "Support & Issue Desk";
      case "audit-logs": return language === "sw" ? "Kumbukumbu za Mfumo" : "Global Audit Logs";
      default: return t.titles.dashboard;
    }
  };

  return (
    <div className="min-h-screen text-[#1E241E] flex flex-col font-sans antialiased overflow-x-clip">
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
            {/* SUPPORT DIAGNOSTIC BANNER */}
            {impersonatingTenantId && (
              <div className="bg-[#1b2f09] text-white border-b-2 border-[#E1FFAC] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-50 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E1FFAC] text-[#172709] font-black text-[10px] tracking-wider uppercase">
                    SUPPORT DIAGNOSTIC MODE
                  </span>
                  <span className="text-xs text-white">
                    Unakagua na kutatua matatizo kwenye duka la: <strong className="text-[#E1FFAC]">{business?.name || "Duka la Mteja"}</strong> ({business?.phone})
                  </span>
                </div>
                <button
                  onClick={adminExitImpersonation}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d5f795] text-[#172709] font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  Rudi Super Admin Console &rarr;
                </button>
              </div>
            )}

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
              {isSuperAdmin ? (
                <>
                  {(effectiveModule === "admin-dashboard" || effectiveModule === "dashboard") && (
                    <AdminDashboardModule onNavigate={(m) => setActiveModule(m)} />
                  )}
                  {(effectiveModule === "super-admin" || effectiveModule === "admin-tenants") && <AdminTenantsModule />}
                  {effectiveModule === "admin-users" && <AdminUsersModule />}
                  {effectiveModule === "admin-support" && <AdminSupportDeskModule />}
                  {effectiveModule === "audit-logs" && <AuditLogsModule />}
                  {effectiveModule === "notifications" && <NotificationCenterModule onNavigate={(m) => setActiveModule(m)} />}
                  {effectiveModule === "settings" && <BusinessSettingsModule />}
                  {effectiveModule === "help" && <HelpSupportModule />}
                </>
              ) : (
                <>
                  {isOwner && (effectiveModule === "dashboard" || effectiveModule === "ai-assistant") && (
                    <DashboardOverview onNavigate={(m) => setActiveModule(m)} />
                  )}
                  {!isOwner && (effectiveModule === "dashboard" || effectiveModule === "ai-assistant") && (
                    <CashierDashboardModule onNavigate={(m) => setActiveModule(m)} />
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
                  {effectiveModule === "audit-logs" && <AuditLogsModule />}
                </>
              )}
            </main>

            {/* FLOATING ASK AI BUTTON (STORE MANAGEMENT ONLY) */}
            {!isSuperAdmin && (
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="fixed bottom-16 md:bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-[#1B2F09] text-[#E1FFAC] font-black text-xs shadow-xl border-2 border-[#A6DF52] flex items-center gap-2 hover:scale-105 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4 text-[#E1FFAC]" />
                <span>Ask AI</span>
              </button>
            )}

            {/* MOBILE BOTTOM NAVIGATION BAR */}
            <div className="md:hidden h-14 bg-white border-t border-[#D8E6CC] px-2 flex items-center justify-around z-30 shrink-0">
              {isSuperAdmin ? (
                <>
                  <button
                    onClick={() => setActiveModule("admin-dashboard")}
                    className={`flex flex-col items-center text-[10px] font-bold ${
                      effectiveModule === "admin-dashboard" || effectiveModule === "dashboard" ? "text-[#1C350A] font-black" : "text-[#627956]"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{language === "sw" ? "Dashibodi" : "Dashboard"}</span>
                  </button>
                  <button
                    onClick={() => setActiveModule("super-admin")}
                    className={`flex flex-col items-center text-[10px] font-bold ${
                      effectiveModule === "super-admin" || effectiveModule === "admin-tenants" ? "text-[#1C350A] font-black" : "text-[#627956]"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{language === "sw" ? "Maduka" : "Stores"}</span>
                  </button>
                  <button
                    onClick={() => setActiveModule("audit-logs")}
                    className={`flex flex-col items-center text-[10px] font-bold ${
                      effectiveModule === "audit-logs" ? "text-[#1C350A] font-black" : "text-[#627956]"
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>{language === "sw" ? "Audit" : "Logs"}</span>
                  </button>
                  <button
                    onClick={() => setActiveModule("notifications")}
                    className={`flex flex-col items-center text-[10px] font-bold ${
                      effectiveModule === "notifications" ? "text-[#1C350A] font-black" : "text-[#627956]"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>{language === "sw" ? "Taarifa" : "Notifs"}</span>
                  </button>
                  <button
                    onClick={() => setActiveModule("settings")}
                    className={`flex flex-col items-center text-[10px] font-bold ${
                      effectiveModule === "settings" ? "text-[#1C350A] font-black" : "text-[#627956]"
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>{language === "sw" ? "Mfumo" : "Settings"}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveModule("dashboard")}
                    className={`flex flex-col items-center text-[10px] font-bold ${
                      effectiveModule === "dashboard" ? "text-[#1C350A] font-black" : "text-[#627956]"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>{language === "sw" ? "Dashibodi" : "Dashboard"}</span>
                  </button>

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
                </>
              )}
            </div>
          </div>

          {/* MOBILE "MORE" DRAWER MODAL */}
          {isMobileMoreOpen && !isSuperAdmin && (
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
                    { id: "sales", label: language === "sw" ? "Mauzo ya Leo" : "Today's Sales", icon: ShoppingBag },
                    { id: "expenses", label: language === "sw" ? "Matumizi ya Leo" : "Today's Expenses", icon: DollarSign },
                    { id: "inventory", label: language === "sw" ? "Stoo & Bidhaa" : "Store Stock", icon: Layers },
                    { id: "deliveries", label: language === "sw" ? "Delivery" : "Deliveries", icon: Truck },
                    { id: "customers", label: language === "sw" ? "Wateja & Madeni" : "Customers & Debts", icon: Users },
                    ...(isOwner
                      ? [
                          { id: "cash-register", label: language === "sw" ? "Ripoti (Faida)" : "Reports (P&L)", icon: BarChart3 },
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
      <AppErrorBoundary>
        <MainApp />
      </AppErrorBoundary>
    </AppProvider>
  );
}
