"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Business,
  Branch,
  User,
  Product,
  Sale,
  Customer,
  Expense,
  Supplier,
  PurchaseOrder,
  OnlineOrder,
  DeliveryItem,
  Warehouse,
  CashRegister,
  AppNotification,
  AuditLog,
  StockMovement,
  EmployeeAccount,
  DailyShiftReport,
} from "@/types";
import { en, sw } from "@/locales/translations";

interface AppContextType {
  language: "en" | "sw";
  setLanguage: (lang: "en" | "sw") => void;
  t: typeof en;
  user: User | null;
  business: Business | null;
  availableBusinesses: Business[];
  switchBusiness: (businessId: string) => void;
  updateBusinessProfile: (updates: Partial<Business>) => void;
  addBranch: (branchData: { name: string; location: string; phone?: string }) => void;
  addWarehouse: (whData: { name: string; location: string; manager: string }) => void;
  currentBranch: Branch | null;
  setCurrentBranch: (branch: Branch) => void;
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  onlineOrders: OnlineOrder[];
  deliveries: DeliveryItem[];
  warehouses: Warehouse[];
  cashRegister: CashRegister;
  stockMovements: StockMovement[];
  employees: EmployeeAccount[];
  dailyReports: DailyShiftReport[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  auditLogs: AuditLog[];
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  // Methods
  loginUser: (emailOrPhone: string, role?: string) => boolean;
  logoutUser: () => void;
  registerBusiness: (accountData: any, businessData: any, plan: any) => void;
  addEmployee: (emp: Omit<EmployeeAccount, "id" | "tenantId" | "status" | "lastActive">) => void;
  switchEmployeeAccount: (employeeId: string) => void;
  submitDailyReport: (notes?: string, actualCashCounted?: number) => DailyShiftReport | undefined;
  closeDayAndSendToBoss: (notes?: string) => DailyShiftReport | undefined;
  startNewDay: () => void;
  isDayClosed: boolean;
  activeDayLabel: string;
  approveDailyReport: (reportId: string) => void;
  addProduct: (product: Omit<Product, "id" | "tenantId">) => Product | undefined;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  processSale: (saleData: Omit<Sale, "id" | "tenantId" | "createdAt" | "saleNumber">) => Sale;
  refundSale: (saleId: string) => void;
  recordStockMovement: (movement: Omit<StockMovement, "id" | "tenantId" | "createdAt">) => void;
  addExpense: (expense: Omit<Expense, "id" | "tenantId">) => void;
  addCustomer: (
    customer: Omit<Customer, "id" | "tenantId" | "totalSpent" | "debtBalance" | "loyaltyPoints"> & {
      initialDebt?: number;
    }
  ) => void;
  payCustomerDebt: (customerId: string, amount: number, method?: string) => void;
  addCustomerDebt: (customerId: string, amount: number) => void;
  addSupplier: (supplier: Omit<Supplier, "id" | "tenantId" | "totalPurchased" | "amountOwed">) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => void;
  createOnlineOrder: (order: Omit<OnlineOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => OnlineOrder;
  updateOrderStatus: (orderId: string, status: OnlineOrder["status"]) => void;
  updateDeliveryDetails: (orderId: string, updates: Partial<OnlineOrder>) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryItem["status"]) => void;
  updateCashRegister: (data: Partial<CashRegister>) => void;
  renewSubscription: (details?: {
    planName?: "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE" | "CUSTOM";
    durationMonths?: number;
    amount?: number;
    paymentMethod?: string;
    invoiceNumber?: string;
  }) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isHydrated: boolean;
  viewState: "landing" | "app";
  setViewState: (v: "landing" | "app") => void;
  activeModule: string;
  setActiveModule: (m: string) => void;
  centerPopup: {
    id: string;
    title: string;
    message: string;
    type: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null;
  notifyCenter: (
    title: string,
    message: string,
    type?: "SUCCESS" | "ERROR" | "WARNING" | "INFO"
  ) => void;
  dismissCenterPopup: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getOffsetDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const emptyCashRegister: CashRegister = {
  openingBalance: 0,
  cashSales: 0,
  cashExpenses: 0,
  cashDeposits: 0,
  cashWithdrawals: 0,
  actualCash: 0,
  isOpen: true,
  openedAt: `${getOffsetDateStr(0)} 08:00`,
};

const PROD_STORAGE_KEY = "tradepos_prod_store_v1";
const PROD_USER_KEY = "tradepos_prod_user_v1";
const PROD_VIEW_KEY = "tradepos_prod_view_v1";
const PROD_MODULE_KEY = "tradepos_prod_module_v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "sw">("sw");
  const [user, setUser] = useState<User | null>(null);
  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegister>(emptyCashRegister);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [employees, setEmployees] = useState<EmployeeAccount[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyShiftReport[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);
  const [activeDayLabel, setActiveDayLabel] = useState<string>(getOffsetDateStr(0));
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [viewState, setViewStateInternal] = useState<"landing" | "app">("landing");
  const [activeModule, setActiveModuleInternal] = useState<string>("dashboard");
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [centerPopup, setCenterPopup] = useState<{
    id: string;
    title: string;
    message: string;
    type: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null>(null);

  const setViewState = (v: "landing" | "app") => {
    setViewStateInternal(v);
    try {
      localStorage.setItem(PROD_VIEW_KEY, v);
    } catch (e) {}
  };

  const setActiveModule = (m: string) => {
    setActiveModuleInternal(m);
    try {
      localStorage.setItem(PROD_MODULE_KEY, m);
    } catch (e) {}
  };

  const notifyCenter = (
    title: string,
    message: string,
    type: "SUCCESS" | "ERROR" | "WARNING" | "INFO" = "INFO"
  ) => {
    const popupId = "pop-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    setCenterPopup({ id: popupId, title, message, type });
    const newNotif: AppNotification = {
      id: "notif-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      title,
      message,
      type: type === "ERROR" || type === "WARNING" ? "SYSTEM" : "PAYMENT",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
  };

  const dismissCenterPopup = () => {
    setCenterPopup(null);
  };

  // Auto-dismiss centered notification box after 3.2 seconds
  useEffect(() => {
    if (!centerPopup) return;
    const timer = setTimeout(() => {
      setCenterPopup((cur) => (cur?.id === centerPopup.id ? null : cur));
    }, 3200);
    return () => clearTimeout(timer);
  }, [centerPopup]);

  // Intercept window.alert, window.onerror, and unhandledrejection so all notifications & errors appear as a centered little box
  useEffect(() => {
    if (typeof window === "undefined") return;

    const origAlert = window.alert;
    window.alert = (msg?: any) => {
      const text = String(msg ?? "");
      const lower = text.toLowerCase();
      const isErr =
        lower.includes("error") ||
        lower.includes("kosa") ||
        lower.includes("tafadhali") ||
        lower.includes("shida") ||
        lower.includes("cannot") ||
        lower.includes("out of stock") ||
        lower.includes("si sahihi") ||
        lower.includes("haijakamilika");
      notifyCenter(
        isErr ? "Ilani ya Mfumo" : "Taarifa ya Mfumo",
        text,
        isErr ? "ERROR" : "INFO"
      );
    };

    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();
      notifyCenter(
        "Taarifa ya Mfumo",
        "Tafadhali hakikisha umejaza taarifa zote kwa usahihi.",
        "ERROR"
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      notifyCenter(
        "Taarifa ya Mtandao",
        "Ombi halikukamilika kwa wakati. Mfumo unaendelea kufanya kazi salama.",
        "ERROR"
      );
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.alert = origAlert;
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Clean up legacy demo localStorage keys and restore production store state on mount in ONE single synchronous batch
  useEffect(() => {
    try {
      // Remove any legacy demo keys from previous development iterations
      localStorage.removeItem("tradepos_store_data_v1");
      localStorage.removeItem("tradepos_store_data_v2");
      localStorage.removeItem("tradepos_store_data_v3");
      localStorage.removeItem("tradepos_store_data_v4");
      localStorage.removeItem("tradepos_session_user");
      localStorage.removeItem("tradepos_view_state");
      localStorage.removeItem("tradepos_current_biz");

      const storedLang = localStorage.getItem("tradepos_lang") as "en" | "sw" | null;
      if (storedLang === "en" || storedLang === "sw") {
        setLanguage(storedLang);
      }

      const savedStore = localStorage.getItem(PROD_STORAGE_KEY);
      if (savedStore) {
        const parsed = JSON.parse(savedStore);
        if (Array.isArray(parsed.availableBusinesses)) setAvailableBusinesses(parsed.availableBusinesses);
        if (parsed.business) setBusiness(parsed.business);
        if (parsed.currentBranch) setCurrentBranch(parsed.currentBranch);
        if (Array.isArray(parsed.products)) setProducts(parsed.products);
        if (Array.isArray(parsed.sales)) setSales(parsed.sales);
        if (Array.isArray(parsed.customers)) setCustomers(parsed.customers);
        if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
        if (Array.isArray(parsed.suppliers)) setSuppliers(parsed.suppliers);
        if (Array.isArray(parsed.purchaseOrders)) setPurchaseOrders(parsed.purchaseOrders);
        if (Array.isArray(parsed.onlineOrders)) setOnlineOrders(parsed.onlineOrders);
        if (Array.isArray(parsed.deliveries)) setDeliveries(parsed.deliveries);
        if (Array.isArray(parsed.warehouses)) setWarehouses(parsed.warehouses);
        if (parsed.cashRegister) setCashRegister(parsed.cashRegister);
        if (Array.isArray(parsed.stockMovements)) setStockMovements(parsed.stockMovements);
        if (Array.isArray(parsed.employees)) setEmployees(parsed.employees);
        if (Array.isArray(parsed.dailyReports)) setDailyReports(parsed.dailyReports);
        if (Array.isArray(parsed.notifications)) setNotifications(parsed.notifications);
        if (Array.isArray(parsed.auditLogs)) setAuditLogs(parsed.auditLogs);
        if (typeof parsed.isDayClosed === "boolean") setIsDayClosed(parsed.isDayClosed);
        if (typeof parsed.activeDayLabel === "string") setActiveDayLabel(parsed.activeDayLabel);
      }

      const storedUser = localStorage.getItem(PROD_USER_KEY);
      const storedView = localStorage.getItem(PROD_VIEW_KEY);
      const storedModule = localStorage.getItem(PROD_MODULE_KEY);

      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        if (storedView === "app" || !storedView) {
          setViewStateInternal("app");
        }
        if (storedModule) {
          setActiveModuleInternal(storedModule);
        } else {
          const isBoss = parsedUser.role === "OWNER" || parsedUser.role === "SUPER_ADMIN";
          setActiveModuleInternal(isBoss ? "dashboard" : "sales");
        }
      } else {
        setViewStateInternal("landing");
      }
    } catch (e) {
      // safe fallback
    }
    setIsHydrated(true);
  }, []);

  // Automatically persist production store data to localStorage whenever records change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        PROD_STORAGE_KEY,
        JSON.stringify({
          availableBusinesses,
          business,
          currentBranch,
          products,
          sales,
          customers,
          expenses,
          suppliers,
          purchaseOrders,
          onlineOrders,
          deliveries,
          warehouses,
          cashRegister,
          stockMovements,
          employees,
          dailyReports,
          notifications,
          auditLogs,
          isDayClosed,
          activeDayLabel,
        })
      );
    } catch (e) {}
  }, [
    isHydrated,
    availableBusinesses,
    business,
    currentBranch,
    products,
    sales,
    customers,
    expenses,
    suppliers,
    purchaseOrders,
    onlineOrders,
    deliveries,
    warehouses,
    cashRegister,
    stockMovements,
    employees,
    dailyReports,
    notifications,
    auditLogs,
    isDayClosed,
    activeDayLabel,
  ]);

  const appendAuditLog = (action: string, details: string, actorName?: string) => {
    const newLog: AuditLog = {
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      tenantId: business?.id || "tenant-default",
      userName: actorName || user?.name || "System",
      action,
      details,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const changeLanguage = (lang: "en" | "sw") => {
    setLanguage(lang);
    try {
      localStorage.setItem("tradepos_lang", lang);
    } catch (e) {}
  };

  const switchBusiness = (businessId: string) => {
    const target = availableBusinesses.find((b) => b.id === businessId);
    if (!target) return;
    setBusiness(target);
    setCurrentBranch(target.branches[0] || null);
    if (user) {
      const updatedUser = {
        ...user,
        businessId: target.id,
        branchId: target.branches[0]?.id || "",
      };
      setUser(updatedUser);
      try {
        localStorage.setItem(PROD_USER_KEY, JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  const updateBusinessProfile = (updates: Partial<Business>) => {
    if (!business) return;
    const updatedBiz: Business = { ...business, ...updates };
    setBusiness(updatedBiz);
    setAvailableBusinesses((prev) =>
      prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b))
    );
    appendAuditLog("SETTINGS_UPDATED", `Updated business profile for ${updatedBiz.name}`);
  };

  const addBranch = (branchData: { name: string; location: string; phone?: string }) => {
    if (!business) return;
    const newBranch: Branch = {
      id: "br-" + Date.now(),
      name: branchData.name.trim(),
      location: branchData.location.trim(),
      isMain: business.branches.length === 0,
      phone: branchData.phone || business.phone || "",
    };
    const updatedBiz: Business = {
      ...business,
      branches: [...business.branches, newBranch],
    };
    setBusiness(updatedBiz);
    setAvailableBusinesses((prev) =>
      prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b))
    );
    if (!currentBranch) {
      setCurrentBranch(newBranch);
    }
    appendAuditLog("BRANCH_CREATED", `Added branch ${newBranch.name}`);
  };

  const addWarehouse = (whData: { name: string; location: string; manager: string }) => {
    if (!business) return;
    const newWh: Warehouse = {
      id: "wh-" + Date.now(),
      tenantId: business.id,
      name: whData.name.trim(),
      location: whData.location.trim(),
      manager: whData.manager.trim(),
      stockValue: 0,
      totalItems: 0,
    };
    setWarehouses((prev) => [...prev, newWh]);
    appendAuditLog("WAREHOUSE_CREATED", `Added warehouse ${newWh.name}`);
  };

  const loginUser = (emailOrPhone: string, role = "OWNER") => {
    const cleanInput = emailOrPhone.trim();
    if (!cleanInput) return false;

    if (cleanInput.toLowerCase() === "admin@tradepos.cloud") {
      const superAdminUser: User = {
        id: "usr-admin",
        name: "Platform Super Admin",
        email: cleanInput,
        phone: "",
        role: "SUPER_ADMIN",
        businessId: "system",
        branchId: "global",
      };
      setUser(superAdminUser);
      setViewState("app");
      setActiveModule("super-admin");
      appendAuditLog("LOGIN_SUCCESS", "Super Admin signed in", "Platform Super Admin");
      notifyCenter("Super Admin", "Umeingia kama Platform Super Admin.", "SUCCESS");
      try {
        localStorage.setItem(PROD_USER_KEY, JSON.stringify(superAdminUser));
        localStorage.setItem(PROD_VIEW_KEY, "app");
        localStorage.setItem(PROD_MODULE_KEY, "super-admin");
      } catch (e) {}
      return true;
    }

    const lowerInput = cleanInput.toLowerCase();
    const matchedEmployee = employees.find(
      (e) =>
        e.email.toLowerCase() === lowerInput ||
        e.phone.replace(/\s+/g, "") === lowerInput.replace(/\s+/g, "") ||
        e.name.toLowerCase() === lowerInput
    );

    // Ensure a business and main branch exist if logging in for the first time
    let activeBiz = business;
    let activeBr = currentBranch;
    if (!activeBiz) {
      const derivedName = cleanInput.includes("@")
        ? cleanInput.split("@")[0].replace(/[._-]/g, " ")
        : "Biashara Yangu";
      const mainBr: Branch = {
        id: "br-" + Date.now(),
        name: "Tawi Kuu (HQ)",
        location: "Tanzania",
        isMain: true,
        phone: cleanInput.includes("@") ? "" : cleanInput,
      };
      activeBiz = {
        id: "tenant-" + Date.now(),
        name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
        businessType: "Duka la Rejareja",
        location: "Tanzania",
        currency: "TZS",
        taxRate: 18,
        phone: cleanInput.includes("@") ? "" : cleanInput,
        email: cleanInput.includes("@") ? cleanInput : "",
        subscriptionPlan: "PROFESSIONAL",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        branches: [mainBr],
      };
      activeBr = mainBr;
      setBusiness(activeBiz);
      setAvailableBusinesses([activeBiz]);
      setCurrentBranch(mainBr);
    }

    let loggedUser: User;
    if (matchedEmployee) {
      loggedUser = {
        id: matchedEmployee.id,
        name: matchedEmployee.name,
        email: matchedEmployee.email,
        phone: matchedEmployee.phone,
        role: matchedEmployee.role,
        businessId: activeBiz.id,
        branchId: activeBr?.id || activeBiz.branches[0]?.id || "",
      };
    } else {
      const displayName = cleanInput.includes("@")
        ? cleanInput.split("@")[0]
        : cleanInput;
      loggedUser = {
        id: "usr-" + Date.now(),
        name: displayName,
        email: cleanInput.includes("@") ? cleanInput : "",
        phone: cleanInput.includes("@") ? "" : cleanInput,
        role: (role as any) || "OWNER",
        businessId: activeBiz.id,
        branchId: activeBr?.id || activeBiz.branches[0]?.id || "",
      };

      // Also register this owner in the employees list if employees is empty
      if (employees.length === 0) {
        const ownerEmp: EmployeeAccount = {
          id: loggedUser.id,
          tenantId: activeBiz.id,
          name: loggedUser.name,
          email: loggedUser.email,
          phone: loggedUser.phone,
          pin: "1234",
          role: "OWNER",
          branch: activeBr?.name || "Tawi Kuu (HQ)",
          status: "Active",
          lastActive: "Sasa hivi",
        };
        setEmployees([ownerEmp]);
      }
    }

    setUser(loggedUser);
    setViewState("app");
    const isBoss = loggedUser.role === "OWNER" || loggedUser.role === "SUPER_ADMIN";
    const nextMod = loggedUser.role === "SUPER_ADMIN" ? "super-admin" : isBoss ? "dashboard" : "sales";
    setActiveModule(nextMod);
    appendAuditLog("LOGIN_SUCCESS", `User ${loggedUser.name} signed in`, loggedUser.name);
    notifyCenter(
      "Karibu Kwenye Mfumo",
      `Umeingia kikamilifu kama ${loggedUser.name} (${loggedUser.role}).`,
      "SUCCESS"
    );
    try {
      localStorage.setItem(PROD_USER_KEY, JSON.stringify(loggedUser));
      localStorage.setItem(PROD_VIEW_KEY, "app");
      localStorage.setItem(PROD_MODULE_KEY, nextMod);
    } catch (e) {}

    return true;
  };

  const addEmployee = (empData: Omit<EmployeeAccount, "id" | "tenantId" | "status" | "lastActive">) => {
    if (!business) return;
    const newEmp: EmployeeAccount = {
      ...empData,
      id: "emp-" + Date.now(),
      tenantId: business.id,
      status: "Active",
      lastActive: "Sasa hivi",
    };
    setEmployees((prev) => [...prev, newEmp]);
    appendAuditLog("EMPLOYEE_ADDED", `Added staff account: ${newEmp.name} (${newEmp.role})`);
    notifyCenter(
      "Mfanyakazi Ameongezwa",
      `Akaunti ya ${newEmp.name} (${newEmp.role}) imefunguliwa kikamilifu.`,
      "SUCCESS"
    );
  };

  const switchEmployeeAccount = (employeeId: string) => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) return;
    const switchedUser: User = {
      id: targetEmp.id,
      name: targetEmp.name,
      email: targetEmp.email,
      phone: targetEmp.phone,
      role: targetEmp.role,
      businessId: business?.id || "",
      branchId: currentBranch?.id || "",
    };
    setUser(switchedUser);
    const isBoss = switchedUser.role === "OWNER" || switchedUser.role === "SUPER_ADMIN";
    setActiveModule(isBoss ? "dashboard" : "sales");
    notifyCenter(
      "Akaunti Imebadilishwa",
      `Sasa unatumia akaunti ya ${switchedUser.name} (${switchedUser.role}).`,
      "INFO"
    );
    try {
      localStorage.setItem(PROD_USER_KEY, JSON.stringify(switchedUser));
    } catch (e) {}
  };

  const submitDailyReport = (notes?: string, actualCashCounted?: number) => {
    if (!business) return undefined;
    const validSales = sales.filter(
      (s) => s.status !== "REFUNDED" && s.createdAt.startsWith(activeDayLabel)
    );
    const todayExpenses = expenses.filter((e) => e.date === activeDayLabel);

    const totalSalesVal = validSales.reduce((a, b) => a + b.total, 0);
    const cashSalesVal = validSales
      .filter((s) => s.paymentMethod === "CASH")
      .reduce((a, b) => a + b.total, 0);
    const mobileSalesVal = validSales
      .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
      .reduce((a, b) => a + b.total, 0);
    const creditSalesVal = validSales
      .filter((s) => s.paymentMethod === "CREDIT")
      .reduce((a, b) => a + b.total, 0);

    const totalExpensesVal = todayExpenses.reduce((a, b) => a + b.amount, 0);
    const expectedCashVal =
      cashRegister.openingBalance +
      (cashSalesVal > 0 ? cashSalesVal : cashRegister.cashSales) +
      cashRegister.cashDeposits -
      cashRegister.cashExpenses -
      cashRegister.cashWithdrawals;
    const countedCash = actualCashCounted !== undefined ? actualCashCounted : cashRegister.actualCash;
    const varianceVal = countedCash - expectedCashVal;

    const soldMap: { [name: string]: { name: string; quantity: number; revenue: number } } = {};
    validSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!soldMap[item.productName]) {
          soldMap[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        soldMap[item.productName].quantity += item.quantity;
        soldMap[item.productName].revenue += item.total;
      });
    });
    const soldItemsList = Object.values(soldMap).sort((a, b) => b.quantity - a.quantity);
    const totalUnits = soldItemsList.reduce((a, b) => a + b.quantity, 0);

    const totalUnitsInStore = products.reduce((a, b) => a + b.stockQuantity, 0);
    const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStock).length;

    const now = new Date();
    const newReport: DailyShiftReport = {
      id: "rep-" + Date.now(),
      tenantId: business.id,
      branchName: currentBranch?.name || business.branches[0]?.name || "Tawi Kuu",
      submittedBy: user?.name || "Mhudumu",
      staffRole: user?.role || "CASHIER",
      submittedAt: `${activeDayLabel} ${now.toTimeString().slice(0, 5)}`,
      date: activeDayLabel,
      totalSales: totalSalesVal,
      cashSales: cashSalesVal,
      mobileSales: mobileSalesVal,
      creditSales: creditSalesVal,
      totalExpenses: totalExpensesVal,
      expectedCash: expectedCashVal,
      actualCashCounted: countedCash,
      variance: varianceVal,
      totalUnitsSold: totalUnits,
      soldItems: soldItemsList,
      dailyExpenses: todayExpenses.slice(0, 20).map((e) => ({
        category: e.category,
        description: e.title || e.description || e.category,
        amount: e.amount,
        paymentMethod: e.paymentMethod || "CASH",
      })),
      remainingStockSummary: {
        totalProductsCount: products.length,
        totalUnitsInStore,
        lowStockCount,
        stockSnapshot: products.map((p) => ({
          id: p.id,
          name: p.name,
          remainingQty: p.stockQuantity,
          minStock: p.minStock,
          unit: p.unit,
        })),
      },
      notes:
        notes ||
        "Siku imefungwa (Funga Mauzo): Mahesabu ya mauzo, matumizi ya leo na stoo iliyobaki yametumwa automatically kwa Boss.",
      status: "PENDING_REVIEW",
    };

    setDailyReports((prev) => [newReport, ...prev]);
    setIsDayClosed(true);

    notifyCenter(
      `Siku Imefungwa (${activeDayLabel})`,
      `Ripoti ya Mauzo (TZS ${totalSalesVal.toLocaleString()}) na Matumizi (TZS ${totalExpensesVal.toLocaleString()}) imetumwa kwa Mwenye Duka.`,
      "SUCCESS"
    );
    appendAuditLog("DAY_CLOSED", `Closed daily sales for ${activeDayLabel}`);

    return newReport;
  };

  const closeDayAndSendToBoss = (notes?: string) => {
    return submitDailyReport(notes);
  };

  const startNewDay = () => {
    const yesterdayStr = getOffsetDateStr(1);
    const todayStr = getOffsetDateStr(0);
    setSales((prev) =>
      prev.map((s) =>
        s.createdAt.startsWith(activeDayLabel)
          ? { ...s, createdAt: `${yesterdayStr}T${s.createdAt.split("T")[1] || "17:30:00Z"}` }
          : s
      )
    );
    setExpenses((prev) =>
      prev.map((e) => (e.date === activeDayLabel ? { ...e, date: yesterdayStr } : e))
    );
    setActiveDayLabel(todayStr);
    setIsDayClosed(false);
    setCashRegister((prev) => ({
      ...prev,
      cashSales: 0,
      cashExpenses: 0,
      isOpen: true,
      openedAt: `${todayStr} 08:00`,
    }));
    notifyCenter(
      "Siku Mpya Imeanza",
      `Daftari la mauzo na matumizi ya leo (${todayStr}) limefunguliwa.`,
      "SUCCESS"
    );
  };

  const approveDailyReport = (reportId: string) => {
    setDailyReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "APPROVED",
              approvedBy: user?.name || "Owner",
              approvedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : r
      )
    );
    notifyCenter(
      "Ripoti Imethibitishwa",
      "Ripoti ya siku imekaguliwa na kuthibitishwa na Mwenye Duka.",
      "SUCCESS"
    );
  };

  const logoutUser = () => {
    setUser(null);
    setViewState("landing");
    try {
      localStorage.removeItem(PROD_USER_KEY);
      localStorage.setItem(PROD_VIEW_KEY, "landing");
    } catch (e) {}
  };

  const registerBusiness = (accountData: any, businessData: any, plan: any) => {
    const newTenantId = "tenant-" + Date.now();
    const mainBranch: Branch = {
      id: "br-" + Date.now(),
      name: businessData.branchName || `${businessData.location || "Main"} Branch (HQ)`,
      location: businessData.location || "Tanzania",
      isMain: true,
      phone: accountData.phone || "",
    };

    const newBusiness: Business = {
      id: newTenantId,
      name: businessData.name || "Biashara Yangu",
      businessType: businessData.type || "Retail Shop",
      location: businessData.location || "Tanzania",
      currency: "TZS",
      taxRate: 18,
      phone: accountData.phone || "",
      email: accountData.email || "",
      subscriptionPlan: plan || "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      branches: [mainBranch],
    };

    const ownerId = "emp-" + Date.now();
    const newUser: User = {
      id: ownerId,
      name: accountData.name || "Mmiliki wa Duka",
      email: accountData.email || "",
      phone: accountData.phone || "",
      role: "OWNER",
      businessId: newTenantId,
      branchId: mainBranch.id,
    };

    const ownerEmployee: EmployeeAccount = {
      id: ownerId,
      tenantId: newTenantId,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      pin: accountData.pin || "1234",
      role: "OWNER",
      branch: mainBranch.name,
      status: "Active",
      lastActive: "Sasa hivi",
    };

    // Start with clean empty data for the newly registered business
    setBusiness(newBusiness);
    setAvailableBusinesses((prev) => [newBusiness, ...prev]);
    setCurrentBranch(mainBranch);
    setUser(newUser);
    setViewState("app");
    setActiveModule("dashboard");
    setEmployees([ownerEmployee]);
    setProducts([]);
    setSales([]);
    setCustomers([]);
    setExpenses([]);
    setSuppliers([]);
    setPurchaseOrders([]);
    setOnlineOrders([]);
    setDeliveries([]);
    setWarehouses([]);
    setStockMovements([]);
    setDailyReports([]);
    setNotifications([]);
    setCashRegister(emptyCashRegister);
    setIsDayClosed(false);
    setActiveDayLabel(getOffsetDateStr(0));

    appendAuditLog("BUSINESS_REGISTERED", `Registered business ${newBusiness.name}`, newUser.name);
    notifyCenter(
      "Biashara Imesajiliwa",
      `Karibu ${newBusiness.name}! Akaunti yako imefunguliwa kikamilifu.`,
      "SUCCESS"
    );

    try {
      localStorage.setItem(PROD_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(PROD_VIEW_KEY, "app");
      localStorage.setItem(PROD_MODULE_KEY, "dashboard");
    } catch (e) {}
  };

  const addProduct = (prodData: Omit<Product, "id" | "tenantId">) => {
    const tenantId = business?.id || "tenant-default";
    const newProduct: Product = {
      ...prodData,
      id: "prod-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      tenantId,
    };
    setProducts((prev) => [newProduct, ...prev]);
    appendAuditLog("PRODUCT_ADDED", `Added product ${newProduct.name} (${newProduct.stockQuantity} ${newProduct.unit})`);
    return newProduct;
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    appendAuditLog("PRODUCT_UPDATED", `Updated product ${updated.name}`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      appendAuditLog("PRODUCT_DELETED", `Removed product ${target.name}`);
      notifyCenter("Bidhaa Imeondolewa", `${target.name} imeondolewa kwenye orodha ya stoo.`, "INFO");
    }
  };

  const processSale = (saleData: Omit<Sale, "id" | "tenantId" | "createdAt" | "saleNumber">) => {
    const tenantId = business?.id || "tenant-default";
    const saleNum = "INV-" + (1001 + sales.length);
    const nowTime = new Date().toTimeString().slice(0, 8);
    const newSale: Sale = {
      ...saleData,
      id: "sale-" + Date.now(),
      tenantId,
      saleNumber: saleNum,
      createdAt: `${activeDayLabel}T${nowTime}Z`,
    };

    // Decrease stock
    setProducts((prev) =>
      prev.map((prod) => {
        const itemSold = saleData.items.find((i) => i.productId === prod.id);
        if (itemSold) {
          const newQty = Math.max(0, prod.stockQuantity - itemSold.quantity);
          return { ...prod, stockQuantity: newQty };
        }
        return prod;
      })
    );

    // Record Stock Movement (OUT) for each sold item
    const newMovements: StockMovement[] = saleData.items.map((it) => ({
      id: "mov-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      tenantId,
      branchId: saleData.branchId,
      productId: it.productId,
      productName: it.productName,
      type: "OUT",
      quantity: it.quantity,
      reason: saleData.paymentMethod === "CASH" ? "QUICK_CASH_SALE" : "SALE",
      unitCost: it.price,
      totalValue: it.total,
      recordedBy: saleData.cashierName || user?.name || "Mhudumu",
      notes: `Mauzo ${saleNum} (${saleData.paymentMethod})`,
      createdAt: new Date().toISOString(),
    }));
    setStockMovements((prev) => [...newMovements, ...prev]);

    // Update cash register if cash
    if (saleData.paymentMethod === "CASH") {
      setCashRegister((prev) => ({
        ...prev,
        cashSales: prev.cashSales + saleData.paidAmount,
        actualCash: prev.actualCash + saleData.paidAmount,
      }));
    }

    // Update Customer spending & credit/debt balance automatically
    if (saleData.customerName && saleData.customerName.trim() !== "") {
      const custNameClean = saleData.customerName.trim();
      const debtAdded =
        saleData.paymentMethod === "CREDIT"
          ? Math.max(0, saleData.total - (saleData.paidAmount || 0))
          : 0;

      if (custNameClean !== "Mteja wa Dukani" || debtAdded > 0) {
        setCustomers((prev) => {
          const exists = prev.some(
            (c) => c.name.toLowerCase() === custNameClean.toLowerCase()
          );
          if (exists) {
            return prev.map((c) => {
              if (c.name.toLowerCase() === custNameClean.toLowerCase()) {
                return {
                  ...c,
                  totalSpent: c.totalSpent + saleData.total,
                  debtBalance: c.debtBalance + debtAdded,
                  loyaltyPoints: c.loyaltyPoints + Math.max(1, Math.floor(saleData.total / 10000)),
                  lastPurchaseDate: activeDayLabel,
                };
              }
              return c;
            });
          } else {
            const autoCust: Customer = {
              id: "cust-" + Date.now(),
              tenantId,
              name: custNameClean,
              phone: "",
              totalSpent: saleData.total,
              debtBalance: debtAdded,
              loyaltyPoints: Math.max(1, Math.floor(saleData.total / 10000)),
              lastPurchaseDate: activeDayLabel,
            };
            return [autoCust, ...prev];
          }
        });
      }
    }

    setSales((prev) => [newSale, ...prev]);
    appendAuditLog("SALE_RECORDED", `Recorded sale ${saleNum} for TZS ${newSale.total.toLocaleString()}`);
    notifyCenter(
      "Mauzo Yamerekodiwa",
      `${saleData.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")} — Jumla: TZS ${newSale.total.toLocaleString()}.`,
      "SUCCESS"
    );
    return newSale;
  };

  const refundSale = (saleId: string) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: "REFUNDED" } : s))
    );
    appendAuditLog("SALE_REFUNDED", `Refunded sale ${saleId}`);
    notifyCenter("Mauzo Yamerudishwa", "Muamala umerudishwa (Refunded).", "WARNING");
  };

  const recordStockMovement = (movData: Omit<StockMovement, "id" | "tenantId" | "createdAt">) => {
    const tenantId = business?.id || "tenant-default";
    const newMov: StockMovement = {
      ...movData,
      id: "mov-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      tenantId,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === movData.productId) {
          const updatedQty =
            movData.type === "IN"
              ? p.stockQuantity + movData.quantity
              : Math.max(0, p.stockQuantity - movData.quantity);
          return { ...p, stockQuantity: updatedQty };
        }
        return p;
      })
    );
    setStockMovements((prev) => [newMov, ...prev]);
    appendAuditLog(
      `STOCK_${movData.type}`,
      `${movData.type === "IN" ? "Added" : "Removed"} ${movData.quantity} units of ${movData.productName}`
    );
    notifyCenter(
      movData.type === "IN" ? "Stock Imeingizwa Stoo" : "Stock Imetolewa Stoo",
      `${movData.productName}: ${movData.type === "IN" ? "+" : "-"}${movData.quantity} pcs zimesasishwa stoo.`,
      "SUCCESS"
    );
  };

  const addExpense = (expenseData: Omit<Expense, "id" | "tenantId">) => {
    const tenantId = business?.id || "tenant-default";
    const newExp: Expense = {
      ...expenseData,
      id: "exp-" + Date.now(),
      tenantId,
    };
    setExpenses((prev) => [newExp, ...prev]);
    if (expenseData.paymentMethod === "CASH") {
      setCashRegister((prev) => ({
        ...prev,
        cashExpenses: prev.cashExpenses + expenseData.amount,
        actualCash: Math.max(0, prev.actualCash - expenseData.amount),
      }));
    }
    appendAuditLog("EXPENSE_RECORDED", `Recorded expense: ${expenseData.title} (TZS ${expenseData.amount.toLocaleString()})`);
    notifyCenter(
      "Matumizi Yamerekodiwa",
      `${expenseData.title}: TZS ${expenseData.amount.toLocaleString()} imerekodiwa.`,
      "SUCCESS"
    );
  };

  const addCustomer = (
    custData: Omit<Customer, "id" | "tenantId" | "totalSpent" | "debtBalance" | "loyaltyPoints"> & {
      initialDebt?: number;
    }
  ) => {
    const tenantId = business?.id || "tenant-default";
    const debt = custData.initialDebt || 0;
    const existing = customers.find(
      (c) => c.name.trim().toLowerCase() === custData.name.trim().toLowerCase()
    );
    if (existing) {
      if (debt > 0) {
        addCustomerDebt(existing.id, debt);
      }
      return;
    }
    const newCust: Customer = {
      name: custData.name,
      phone: custData.phone,
      email: custData.email,
      address: custData.address,
      id: "cust-" + Date.now(),
      tenantId,
      totalSpent: debt,
      debtBalance: debt,
      loyaltyPoints: 0,
      lastPurchaseDate: activeDayLabel,
    };
    setCustomers((prev) => [newCust, ...prev]);
    appendAuditLog("CUSTOMER_ADDED", `Added customer ${newCust.name} (Debt: TZS ${debt.toLocaleString()})`);
    notifyCenter(
      "Mteja Amesajiliwa",
      `${newCust.name} ameongezwa kwenye daftari la wateja.`,
      "SUCCESS"
    );
  };

  const payCustomerDebt = (customerId: string, amount: number, method = "CASH") => {
    if (!amount || amount <= 0) return;
    const targetCust = customers.find((c) => c.id === customerId);
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            debtBalance: Math.max(0, c.debtBalance - amount),
            lastPurchaseDate: activeDayLabel,
          };
        }
        return c;
      })
    );
    if (method === "CASH") {
      setCashRegister((prev) => ({
        ...prev,
        cashSales: prev.cashSales + amount,
        actualCash: prev.actualCash + amount,
      }));
    }
    appendAuditLog("DEBT_PAYMENT", `Customer ${customerId} paid TZS ${amount.toLocaleString()} via ${method}`);
    notifyCenter(
      "Deni Limelipwa",
      `${targetCust?.name || "Mteja"} amelipa TZS ${amount.toLocaleString()} (${method}).`,
      "SUCCESS"
    );
  };

  const addCustomerDebt = (customerId: string, amount: number) => {
    if (!amount || amount <= 0) return;
    const targetCust = customers.find((c) => c.id === customerId);
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            debtBalance: c.debtBalance + amount,
            totalSpent: c.totalSpent + amount,
            lastPurchaseDate: activeDayLabel,
          };
        }
        return c;
      })
    );
    appendAuditLog("DEBT_ADDED", `Added TZS ${amount.toLocaleString()} debt to customer ${customerId}`);
    notifyCenter(
      "Deni Limeongezwa",
      `Deni la TZS ${amount.toLocaleString()} limeongezwa kwa ${targetCust?.name || "Mteja"}.`,
      "INFO"
    );
  };

  const addSupplier = (supplierData: Omit<Supplier, "id" | "tenantId" | "totalPurchased" | "amountOwed">) => {
    const tenantId = business?.id || "tenant-default";
    const newSup: Supplier = {
      ...supplierData,
      id: "sup-" + Date.now(),
      tenantId,
      totalPurchased: 0,
      amountOwed: 0,
      lastPurchaseDate: activeDayLabel,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    notifyCenter("Msambazaji Ameongezwa", `${newSup.name} ameongezwa kikamilifu.`, "SUCCESS");
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => {
    const tenantId = business?.id || "tenant-default";
    const newPO: PurchaseOrder = {
      ...poData,
      id: "po-" + Date.now(),
      tenantId,
      orderNumber: "PO-" + new Date().getFullYear() + "-" + (101 + purchaseOrders.length),
      createdAt: activeDayLabel,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    notifyCenter("Oda ya Manunuzi Imeundwa", `${newPO.orderNumber} imehifadhiwa kikamilifu.`, "SUCCESS");
  };

  const createOnlineOrder = (orderData: Omit<OnlineOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => {
    const tenantId = business?.id || "tenant-default";
    const orderNum = "DEL-" + (1001 + onlineOrders.length);
    const newOrder: OnlineOrder = {
      ...orderData,
      id: "ord-" + Date.now(),
      tenantId,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
    };
    setOnlineOrders((prev) => [newOrder, ...prev]);
    notifyCenter("Delivery Imerekodiwa", `Mzigo ${orderNum} wa ${orderData.customerName} umeingizwa.`, "SUCCESS");
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OnlineOrder["status"]) => {
    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    notifyCenter("Hali ya Delivery Imesasishwa", `Hali ya mzigo sasa ni: ${status}.`, "INFO");
  };

  const updateDeliveryDetails = (orderId: string, updates: Partial<OnlineOrder>) => {
    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryItem["status"]) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status } : d))
    );
  };

  const updateCashRegister = (data: Partial<CashRegister>) => {
    setCashRegister((prev) => ({ ...prev, ...data }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const renewSubscription = (details?: {
    planName?: "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE" | "CUSTOM";
    durationMonths?: number;
    amount?: number;
    paymentMethod?: string;
    invoiceNumber?: string;
  }) => {
    if (!business) return;
    const months = details?.durationMonths && details.durationMonths > 0 ? details.durationMonths : 1;
    const daysToAdd = months * 30;

    const currentExpiryTime = business.subscriptionExpiry
      ? new Date(business.subscriptionExpiry).getTime()
      : Date.now();
    const baseTime = !isNaN(currentExpiryTime) && currentExpiryTime > Date.now()
      ? currentExpiryTime
      : Date.now();
    const nextDate = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const newPlan = details?.planName || business.subscriptionPlan || "PROFESSIONAL";

    const updatedBiz: Business = {
      ...business,
      subscriptionPlan: newPlan,
      subscriptionStatus: "ACTIVE",
      subscriptionExpiry: nextDate,
    };
    setBusiness(updatedBiz);
    setAvailableBusinesses((prev) =>
      prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b))
    );

    const invoice = details?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
    const method = details?.paymentMethod || "PESAPAL";
    const amountStr = details?.amount ? `TZS ${details.amount.toLocaleString()}` : "Standard";

    appendAuditLog(
      "SUBSCRIPTION_RENEWED",
      `Renewed ${newPlan} plan for ${months} mo (${invoice}, ${amountStr}, ${method}) until ${nextDate}`
    );

    notifyCenter(
      language === "sw" ? "Kifurushi Kimehuishwa" : "Subscription Activated",
      language === "sw"
        ? `Leseni ya ${newPlan} imehuishwa hadi tarehe ${nextDate}. Nambari ya ankara: ${invoice}.`
        : `License (${newPlan}) renewed until ${nextDate}. Invoice reference: ${invoice}.`,
      "SUCCESS"
    );
  };

  const t = language === "en" ? en : sw;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t,
        user,
        business,
        availableBusinesses,
        switchBusiness,
        updateBusinessProfile,
        addBranch,
        addWarehouse,
        currentBranch,
        setCurrentBranch,
        products,
        sales,
        customers,
        expenses,
        suppliers,
        purchaseOrders,
        onlineOrders,
        deliveries,
        warehouses,
        cashRegister,
        stockMovements,
        employees,
        dailyReports,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        isOffline,
        setIsOffline,
        loginUser,
        logoutUser,
        registerBusiness,
        addEmployee,
        switchEmployeeAccount,
        submitDailyReport,
        closeDayAndSendToBoss,
        startNewDay,
        isDayClosed,
        activeDayLabel,
        approveDailyReport,
        addProduct,
        updateProduct,
        deleteProduct,
        processSale,
        refundSale,
        recordStockMovement,
        addExpense,
        addCustomer,
        payCustomerDebt,
        addCustomerDebt,
        addSupplier,
        createPurchaseOrder,
        createOnlineOrder,
        updateOrderStatus,
        updateDeliveryDetails,
        updateDeliveryStatus,
        updateCashRegister,
        renewSubscription,
        isAiModalOpen,
        setIsAiModalOpen,
        isHydrated,
        viewState,
        setViewState,
        activeModule,
        setActiveModule,
        centerPopup,
        notifyCenter,
        dismissCenterPopup,
      }}
    >
      {children}

      {/* GLOBAL CENTERED LITTLE NOTIFICATION & ERROR BOX */}
      {centerPopup && (
        <div
          onClick={dismissCenterPopup}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-xs sm:max-w-sm rounded-2xl bg-white p-5 shadow-2xl border-2 text-center transition-all ${
              centerPopup.type === "ERROR"
                ? "border-rose-400"
                : centerPopup.type === "WARNING"
                ? "border-amber-400"
                : "border-[#8ECE28]"
            }`}
          >
            <div
              className={`w-10 h-10 mx-auto mb-2.5 rounded-xl flex items-center justify-center font-black text-sm border ${
                centerPopup.type === "ERROR"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : centerPopup.type === "WARNING"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-[#E1FFAC] text-[#172709] border-[#9EDE31]"
              }`}
            >
              {centerPopup.type === "ERROR" ? "!" : centerPopup.type === "WARNING" ? "!" : "✓"}
            </div>
            <h4
              className={`text-sm font-black ${
                centerPopup.type === "ERROR"
                  ? "text-rose-900"
                  : centerPopup.type === "WARNING"
                  ? "text-amber-900"
                  : "text-[#162709]"
              }`}
            >
              {centerPopup.title}
            </h4>
            <p className="text-xs text-[#4A613E] font-medium mt-1 leading-relaxed">
              {centerPopup.message}
            </p>
            <button
              type="button"
              onClick={dismissCenterPopup}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                centerPopup.type === "ERROR"
                  ? "bg-rose-700 text-white hover:bg-rose-800"
                  : "bg-[#1B2F09] text-[#E1FFAC] hover:bg-[#122006]"
              }`}
            >
              {language === "sw" ? "Sawa (Funga)" : "OK (Close)"}
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
