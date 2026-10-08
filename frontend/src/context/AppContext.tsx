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
  StockMovement
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
  addProduct: (product: Omit<Product, "id" | "tenantId">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  processSale: (saleData: Omit<Sale, "id" | "tenantId" | "createdAt" | "saleNumber">) => Sale;
  refundSale: (saleId: string) => void;
  recordStockMovement: (movement: Omit<StockMovement, "id" | "tenantId" | "createdAt">) => void;
  addExpense: (expense: Omit<Expense, "id" | "tenantId">) => void;
  addCustomer: (customer: Omit<Customer, "id" | "tenantId" | "totalSpent" | "debtBalance" | "loyaltyPoints">) => void;
  addSupplier: (supplier: Omit<Supplier, "id" | "tenantId" | "totalPurchased" | "amountOwed">) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => void;
  createOnlineOrder: (order: Omit<OnlineOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => OnlineOrder;
  updateOrderStatus: (orderId: string, status: OnlineOrder['status']) => void;
  updateDeliveryDetails: (orderId: string, updates: Partial<OnlineOrder>) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryItem['status']) => void;
  updateCashRegister: (data: Partial<CashRegister>) => void;
  renewSubscription: () => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Preset Businesses for instant multi-business switching
const businessProfiles: Business[] = [
  {
    id: "tenant-karibu-001",
    name: "Peter Cosmetics & Beauty",
    businessType: "Cosmetics & Retail",
    location: "Kariakoo, Dar es Salaam",
    currency: "TZS",
    taxRate: 18,
    phone: "+255 712 345 678",
    email: "peter@petercosmetics.co.tz",
    subscriptionPlan: "PROFESSIONAL",
    subscriptionStatus: "ACTIVE",
    subscriptionExpiry: "2026-11-08",
    branches: [
      { id: "br-01", name: "Kariakoo Branch (HQ)", location: "Kariakoo Msimbazi", isMain: true, phone: "+255 712 345 678" },
      { id: "br-02", name: "Mbezi Beach Branch", location: "Mbezi Africana", isMain: false, phone: "+255 713 999 888" },
      { id: "br-03", name: "Masaki Peninsula Outlet", location: "Masaki Village Walk", isMain: false, phone: "+255 714 555 444" },
    ],
  },
  {
    id: "tenant-hardware-002",
    name: "Peter Hardware & Building Materials",
    businessType: "Hardware & Tools",
    location: "Buguruni, Dar es Salaam",
    currency: "TZS",
    taxRate: 18,
    phone: "+255 754 888 999",
    email: "info@peterhardware.co.tz",
    subscriptionPlan: "BUSINESS",
    subscriptionStatus: "ACTIVE",
    subscriptionExpiry: "2026-12-15",
    branches: [
      { id: "br-hw-01", name: "Buguruni Central Depot", location: "Buguruni Shell", isMain: true, phone: "+255 754 888 999" },
      { id: "br-hw-02", name: "Goba Yard Branch", location: "Goba Njia Nne", isMain: false, phone: "+255 755 111 222" },
    ],
  },
  {
    id: "tenant-restaurant-003",
    name: "Peter Gourmet Cafe & Lounge",
    businessType: "Restaurant & Cafe",
    location: "Mikocheni, Dar es Salaam",
    currency: "TZS",
    taxRate: 18,
    phone: "+255 784 333 444",
    email: "manager@petergourmet.co.tz",
    subscriptionPlan: "PROFESSIONAL",
    subscriptionStatus: "ACTIVE",
    subscriptionExpiry: "2026-11-20",
    branches: [
      { id: "br-rst-01", name: "Mikocheni Lounge", location: "Mikocheni Plaza", isMain: true, phone: "+255 784 333 444" },
    ],
  }
];

const defaultUser: User = {
  id: "usr-001",
  name: "Peter Joseph",
  email: "peter@petercosmetics.co.tz",
  phone: "+255 712 345 678",
  role: "OWNER",
  businessId: "tenant-karibu-001",
  branchId: "br-01",
};

const initialProducts: Product[] = [
  {
    id: "prod-001",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    name: "Nivea Nourishing Body Milk 400ml",
    sku: "NIV-BOD-400",
    barcode: "6001234567890",
    category: "Skin Care",
    brand: "Nivea",
    buyingPrice: 15000,
    sellingPrice: 22000,
    wholesalePrice: 19500,
    stockQuantity: 42,
    minStock: 15,
    maxStock: 100,
    unit: "Bottle",
  },
  {
    id: "prod-002",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    name: "Maybelline Matte Lip Gloss Velvet",
    sku: "MAY-LIP-VEL",
    barcode: "6009876543210",
    category: "Makeup",
    brand: "Maybelline",
    buyingPrice: 12000,
    sellingPrice: 18500,
    wholesalePrice: 16000,
    stockQuantity: 18,
    minStock: 8,
    maxStock: 60,
    unit: "Pcs",
  },
  {
    id: "prod-003",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    name: "CeraVe Hydrating Facial Cleanser 236ml",
    sku: "CER-CLE-236",
    barcode: "6003344556677",
    category: "Face Care",
    brand: "CeraVe",
    buyingPrice: 28000,
    sellingPrice: 38000,
    wholesalePrice: 34000,
    stockQuantity: 25,
    minStock: 10,
    maxStock: 80,
    unit: "Bottle",
  },
  {
    id: "prod-004",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    name: "Garnier Micellar Cleansing Water 400ml",
    sku: "GAR-MIC-400",
    barcode: "6002233445566",
    category: "Face Care",
    brand: "Garnier",
    buyingPrice: 16000,
    sellingPrice: 24000,
    wholesalePrice: 21000,
    stockQuantity: 6, // Low stock trigger
    minStock: 12,
    maxStock: 70,
    unit: "Bottle",
  },
  {
    id: "prod-005",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    name: "L'Oreal Paris Elvive Serum 100ml",
    sku: "LOR-ELV-100",
    barcode: "6004455667788",
    category: "Hair Care",
    brand: "L'Oreal",
    buyingPrice: 22000,
    sellingPrice: 32000,
    wholesalePrice: 28000,
    stockQuantity: 4, // Low stock trigger
    minStock: 10,
    maxStock: 50,
    unit: "Bottle",
  },
  {
    id: "prod-006",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    name: "Vaseline Petroleum Jelly Original 250g",
    sku: "VAS-JEL-250",
    barcode: "6005566778899",
    category: "Skin Care",
    brand: "Vaseline",
    buyingPrice: 5000,
    sellingPrice: 7500,
    wholesalePrice: 6500,
    stockQuantity: 65,
    minStock: 20,
    maxStock: 150,
    unit: "Tub",
  },
  {
    id: "prod-007",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    name: "Yardley English Rose Deodorant 150ml",
    sku: "YAR-DEO-150",
    barcode: "6006677889900",
    category: "Fragrance",
    brand: "Yardley",
    buyingPrice: 7000,
    sellingPrice: 11000,
    wholesalePrice: 9500,
    stockQuantity: 32,
    minStock: 10,
    maxStock: 60,
    unit: "Can",
  }
];

const initialSales: Sale[] = [
  {
    id: "sale-1024",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    saleNumber: "INV-1024",
    items: [
      { productId: "prod-001", productName: "Nivea Nourishing Body Milk 400ml", quantity: 2, price: 22000, total: 44000 },
      { productId: "prod-003", productName: "CeraVe Hydrating Facial Cleanser 236ml", quantity: 1, price: 38000, total: 38000 },
      { productId: "prod-006", productName: "Vaseline Petroleum Jelly 250g", quantity: 1, price: 7500, total: 7500 },
    ],
    subtotal: 89500,
    tax: 0,
    discount: 4500,
    total: 85000,
    paidAmount: 85000,
    balance: 0,
    paymentMethod: "MPESA",
    customerName: "Amina Salum",
    cashierName: "John Mushi",
    createdAt: "2026-10-08T11:42:00Z",
    status: "COMPLETED",
  },
  {
    id: "sale-1023",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    saleNumber: "INV-1023",
    items: [
      { productId: "prod-002", productName: "Maybelline Matte Lip Gloss Velvet", quantity: 3, price: 18500, total: 55500 },
    ],
    subtotal: 55500,
    tax: 0,
    discount: 0,
    total: 55500,
    paidAmount: 55500,
    balance: 0,
    paymentMethod: "CASH",
    customerName: "David Kimaro",
    cashierName: "Peter Joseph",
    createdAt: "2026-10-08T10:15:00Z",
    status: "COMPLETED",
  },
  {
    id: "sale-1022",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    saleNumber: "INV-1022",
    items: [
      { productId: "prod-007", productName: "Yardley English Rose Deodorant", quantity: 2, price: 11000, total: 22000 },
      { productId: "prod-001", productName: "Nivea Nourishing Body Milk", quantity: 1, price: 22000, total: 22000 },
    ],
    subtotal: 44000,
    tax: 0,
    discount: 0,
    total: 44000,
    paidAmount: 20000,
    balance: 24000,
    paymentMethod: "CREDIT",
    customerName: "Zuhura Rashid",
    cashierName: "John Mushi",
    createdAt: "2026-10-08T09:30:00Z",
    status: "COMPLETED",
  }
];

const initialCustomers: Customer[] = [
  {
    id: "cust-01",
    tenantId: "tenant-karibu-001",
    name: "Amina Salum",
    phone: "+255 754 112 233",
    email: "amina.salum@gmail.com",
    address: "Kariakoo Mtaa wa Livingstone",
    totalSpent: 1850000,
    debtBalance: 45000,
    loyaltyPoints: 340,
    lastPurchaseDate: "2026-10-08",
  },
  {
    id: "cust-02",
    tenantId: "tenant-karibu-001",
    name: "David Kimaro",
    phone: "+255 768 445 566",
    email: "dkimaro@yahoo.com",
    address: "Sinza Mori",
    totalSpent: 920000,
    debtBalance: 0,
    loyaltyPoints: 190,
    lastPurchaseDate: "2026-10-08",
  },
  {
    id: "cust-03",
    tenantId: "tenant-karibu-001",
    name: "Zuhura Rashid",
    phone: "+255 715 778 899",
    email: "zuhura.rashid@tzmail.com",
    address: "Mikocheni B",
    totalSpent: 2640000,
    debtBalance: 120000,
    loyaltyPoints: 520,
    lastPurchaseDate: "2026-10-08",
  }
];

const initialExpenses: Expense[] = [
  {
    id: "exp-01",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    category: "Rent",
    title: "Store Monthly Lease Advance",
    amount: 1200000,
    date: "2026-10-01",
    recordedBy: "Peter Joseph",
    notes: "Kariakoo retail shop commercial rent",
  },
  {
    id: "exp-02",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    category: "Electricity",
    title: "LUKU Commercial Token Units",
    amount: 140000,
    date: "2026-10-04",
    recordedBy: "Peter Joseph",
  },
  {
    id: "exp-03",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    category: "Salary",
    title: "Cashier Shift Bi-weekly Allowance",
    amount: 320000,
    date: "2026-10-07",
    recordedBy: "Peter Joseph",
  }
];

const initialSuppliers: Supplier[] = [
  {
    id: "sup-01",
    tenantId: "tenant-karibu-001",
    name: "Cosmetic Brands Africa Distribution",
    phone: "+255 22 211 4455",
    email: "orders@cbafrica.co.tz",
    address: "Nyerere Road Industrial Area, Dar es Salaam",
    totalPurchased: 24500000,
    amountOwed: 3200000,
    lastPurchaseDate: "2026-10-02",
  },
  {
    id: "sup-02",
    tenantId: "tenant-karibu-001",
    name: "Beiersdorf East Africa Ltd",
    phone: "+255 22 286 1100",
    email: "sales@beiersdorf-tz.com",
    address: "Kariakoo Aggrey Street",
    totalPurchased: 18200000,
    amountOwed: 0,
    lastPurchaseDate: "2026-10-05",
  }
];

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-101",
    tenantId: "tenant-karibu-001",
    supplierId: "sup-01",
    supplierName: "Cosmetic Brands Africa Distribution",
    orderNumber: "PO-2026-089",
    items: [
      { productName: "Garnier Micellar Water 400ml", quantity: 60, buyingPrice: 16000, total: 960000 },
      { productName: "L'Oreal Paris Elvive Serum 100ml", quantity: 40, buyingPrice: 22000, total: 880000 }
    ],
    totalAmount: 1840000,
    paidAmount: 1840000,
    status: "RECEIVED",
    dueDate: "2026-10-20",
    createdAt: "2026-10-02",
  }
];

const initialOnlineOrders: OnlineOrder[] = [
  {
    id: "ord-881",
    tenantId: "tenant-karibu-001",
    orderNumber: "ORD-99120",
    customerName: "Fatma Kassim",
    phone: "+255 788 123 456",
    address: "Mikocheni B, Plot 44",
    items: [
      { productName: "CeraVe Hydrating Facial Cleanser 236ml", quantity: 1, price: 38000 },
      { productName: "Nivea Nourishing Body Milk 400ml", quantity: 1, price: 22000 }
    ],
    total: 60000,
    deliveryFee: 5000,
    status: "OUT_FOR_DELIVERY",
    createdAt: "2026-10-08T08:15:00Z"
  }
];

const initialDeliveries: DeliveryItem[] = [
  {
    id: "del-01",
    tenantId: "tenant-karibu-001",
    orderNumber: "ORD-99120",
    customerName: "Fatma Kassim",
    phone: "+255 788 123 456",
    address: "Mikocheni B, Plot 44",
    driverName: "Rashid Bodaboda",
    fee: 5000,
    status: "OUT_FOR_DELIVERY",
    createdAt: "2026-10-08 09:30",
  },
  {
    id: "del-02",
    tenantId: "tenant-karibu-001",
    orderNumber: "ORD-99118",
    customerName: "Mariam Juma",
    phone: "+255 713 555 777",
    address: "Mbezi Beach Samaki",
    driverName: "Juma Express",
    fee: 7000,
    status: "DELIVERED",
    createdAt: "2026-10-07 14:10",
  }
];

const initialWarehouses: Warehouse[] = [
  {
    id: "wh-01",
    tenantId: "tenant-karibu-001",
    name: "Kariakoo Main Stock Depot",
    location: "Kariakoo Livingstone Yard",
    stockValue: 64500000,
    totalItems: 840,
    manager: "Erick Mrema",
  },
  {
    id: "wh-02",
    tenantId: "tenant-karibu-001",
    name: "Ubungo Transit Warehouse",
    location: "Ubungo External Road",
    stockValue: 38200000,
    totalItems: 420,
    manager: "Hamza Bakari",
  }
];

const initialCashRegister: CashRegister = {
  openingBalance: 250000,
  cashSales: 55500,
  cashExpenses: 0,
  cashDeposits: 0,
  cashWithdrawals: 0,
  actualCash: 305500,
  isOpen: true,
  openedAt: "2026-10-08 08:00 AM",
};

const initialNotifications: AppNotification[] = [
  {
    id: "notif-01",
    title: "Tahadhari ya Stoo Ndogo",
    message: "Bidhaa 'Garnier Micellar Water' imebaki chupa 6 tu (Chini ya kiwango cha 12).",
    type: "STOCK",
    timestamp: "Dakika 15 zilizopita",
    read: false,
    actionUrl: "inventory",
  },
  {
    id: "notif-02",
    title: "Oda Mpya ya Mtandaoni",
    message: "Oda mpya ORD-99120 ya TZS 65,000 imethibitishwa kutoka kwa Fatma Kassim.",
    type: "ORDER",
    timestamp: "Saa 1 lililopita",
    read: false,
    actionUrl: "orders",
  },
  {
    id: "notif-03",
    title: "Malipo ya Madeni Yamepokelewa",
    message: "Amina Salum amelipa awamu ya TZS 40,000 kupitia M-Pesa.",
    type: "PAYMENT",
    timestamp: "Saa 3 zilizopita",
    read: true,
    actionUrl: "customers",
  }
];

const initialStockMovements: StockMovement[] = [
  {
    id: "mov-01",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    productId: "prod-001",
    productName: "Nivea Nourishing Body Milk 400ml",
    type: "IN",
    quantity: 50,
    reason: "PURCHASE",
    unitCost: 16000,
    totalValue: 800000,
    recordedBy: "Peter Joseph",
    notes: "Mzigo mpya kutoka kwa msambazaji mkuu",
    createdAt: "2026-10-07T10:30:00Z",
  },
  {
    id: "mov-02",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    productId: "prod-001",
    productName: "Nivea Nourishing Body Milk 400ml",
    type: "OUT",
    quantity: 8,
    reason: "SALE",
    unitCost: 16000,
    totalValue: 176000,
    recordedBy: "Baraka Mushi",
    notes: "Mauzo ya kawaida ya kaunta",
    createdAt: "2026-10-08T09:15:00Z",
  },
  {
    id: "mov-03",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    productId: "prod-002",
    productName: "Maybelline Matte Lip Gloss Velvet",
    type: "IN",
    quantity: 30,
    reason: "PURCHASE",
    unitCost: 12000,
    totalValue: 360000,
    recordedBy: "Peter Joseph",
    notes: "Ununuzi wa jumla Kariakoo",
    createdAt: "2026-10-07T14:00:00Z",
  },
  {
    id: "mov-04",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    productId: "prod-004",
    productName: "Garnier Micellar Cleansing Water 400ml",
    type: "OUT",
    quantity: 6,
    reason: "SALE",
    unitCost: 16000,
    totalValue: 144000,
    recordedBy: "Baraka Mushi",
    notes: "Mauzo ya kaunta - Stoo imebaki 6",
    createdAt: "2026-10-08T11:45:00Z",
  },
  {
    id: "mov-05",
    tenantId: "tenant-karibu-001",
    branchId: "br-01",
    productId: "prod-005",
    productName: "L'Oreal Paris Elvive Serum 100ml",
    type: "OUT",
    quantity: 1,
    reason: "DAMAGE",
    unitCost: 22000,
    totalValue: 22000,
    recordedBy: "Baraka Mushi",
    notes: "Chupa ilivunjika wakati wa kupanga rafu",
    createdAt: "2026-10-08T12:10:00Z",
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "sw">("sw");
  const [user, setUser] = useState<User | null>(defaultUser);
  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>(businessProfiles);
  const [business, setBusiness] = useState<Business | null>(businessProfiles[0]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(businessProfiles[0].branches[0]);

  // Restore authenticated session from localStorage
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("tradepos_lang") as "en" | "sw" | null;
      if (storedLang === "en" || storedLang === "sw") {
        setLanguage(storedLang);
      }
      const storedUser = localStorage.getItem("tradepos_session_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedBizId = localStorage.getItem("tradepos_current_biz");
      if (storedBizId) {
        const found = businessProfiles.find((b) => b.id === storedBizId);
        if (found) {
          setBusiness(found);
          setCurrentBranch(found.branches[0]);
        }
      }
    } catch (e) {
      // safe fallback
    }
  }, []);
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(initialOnlineOrders);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(initialDeliveries);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [cashRegister, setCashRegister] = useState<CashRegister>(initialCashRegister);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log-001",
      tenantId: "tenant-karibu-001",
      userName: "Peter Joseph",
      action: "LOGIN_SUCCESS",
      details: "Staff member Peter Joseph authenticated into Kariakoo Branch",
      timestamp: "2026-10-08 08:00",
      ipAddress: "197.250.199.14",
    }
  ]);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

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
    setCurrentBranch(target.branches[0]);
    if (user) {
      setUser({
        ...user,
        businessId: target.id,
        branchId: target.branches[0].id,
      });
    }

    // Refresh context data cleanly based on switched tenant
    if (target.id === "tenant-hardware-002") {
      setProducts([
        {
          id: "prod-hw-01",
          tenantId: "tenant-hardware-002",
          branchId: target.branches[0].id,
          name: "Twiga Cement Extra 32.5R 50kg",
          sku: "CEM-TWI-50",
          barcode: "6007788990111",
          category: "Building Supplies",
          brand: "Twiga",
          buyingPrice: 17500,
          sellingPrice: 21500,
          wholesalePrice: 20000,
          stockQuantity: 150,
          minStock: 30,
          maxStock: 500,
          unit: "Bag",
        },
        {
          id: "prod-hw-02",
          tenantId: "tenant-hardware-002",
          branchId: target.branches[0].id,
          name: "Iron Sheets Corrugated 28 Gauge (6m)",
          sku: "IRO-SHE-28G",
          barcode: "6007788990222",
          category: "Roofing",
          brand: "ALAF",
          buyingPrice: 28000,
          sellingPrice: 34500,
          wholesalePrice: 32000,
          stockQuantity: 8,
          minStock: 20,
          maxStock: 100,
          unit: "Pcs",
        }
      ]);
      setSales([
        {
          id: "sale-hw-01",
          tenantId: "tenant-hardware-002",
          branchId: target.branches[0].id,
          saleNumber: "INV-HW-5001",
          items: [{ productId: "prod-hw-01", productName: "Twiga Cement 50kg", quantity: 20, price: 21500, total: 430000 }],
          subtotal: 430000,
          tax: 0,
          discount: 0,
          total: 430000,
          paidAmount: 430000,
          balance: 0,
          paymentMethod: "MPESA",
          customerName: "Kassim Contractor",
          cashierName: "Peter Joseph",
          createdAt: "2026-10-08T09:00:00Z",
          status: "COMPLETED",
        }
      ]);
    } else {
      setProducts(initialProducts);
      setSales(initialSales);
    }
  };

  const loginUser = (emailOrPhone: string, role = "OWNER") => {
    if (emailOrPhone.toLowerCase().includes("admin")) {
      setUser({
        id: "usr-admin-999",
        name: "Platform Super Admin",
        email: "admin@tradepos.cloud",
        phone: "+255 700 000 000",
        role: "SUPER_ADMIN",
        businessId: "system",
        branchId: "global",
      });
      return true;
    }

    const loggedUser: User = {
      id: "usr-001",
      name: "Peter Joseph",
      email: emailOrPhone.includes("@") ? emailOrPhone : "peter@petercosmetics.co.tz",
      phone: emailOrPhone.includes("@") ? "+255 712 345 678" : emailOrPhone,
      role: (role as any) || "OWNER",
      businessId: business?.id || "tenant-karibu-001",
      branchId: currentBranch?.id || "br-01",
    };

    setUser(loggedUser);
    try {
      localStorage.setItem("tradepos_session_user", JSON.stringify(loggedUser));
      localStorage.setItem("tradepos_view_state", "app");
    } catch (e) {}

    return true;
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem("tradepos_session_user");
      localStorage.setItem("tradepos_view_state", "landing");
    } catch (e) {}
  };

  const registerBusiness = (accountData: any, businessData: any, plan: any) => {
    const newTenantId = "tenant-" + Math.random().toString(36).substring(2, 8);
    const mainBranch: Branch = {
      id: "br-" + Math.random().toString(36).substring(2, 6),
      name: businessData.branchName || "Main Branch",
      location: businessData.location || "Dar es Salaam",
      isMain: true,
      phone: accountData.phone || "+255 700 000 000",
    };

    const newBusiness: Business = {
      id: newTenantId,
      name: businessData.name || "My Business",
      businessType: businessData.type || "Retail Shop",
      location: businessData.location || "Dar es Salaam",
      currency: "TZS",
      taxRate: 18,
      phone: accountData.phone || "",
      email: accountData.email || "",
      subscriptionPlan: plan || "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      branches: [mainBranch],
    };

    const newUser: User = {
      id: "usr-" + Math.random().toString(36).substring(2, 8),
      name: accountData.name || "Peter Joseph",
      email: accountData.email || "",
      phone: accountData.phone || "",
      role: "OWNER",
      businessId: newTenantId,
      branchId: mainBranch.id,
    };

    setBusiness(newBusiness);
    setAvailableBusinesses((prev) => [newBusiness, ...prev]);
    setUser(newUser);
    setCurrentBranch(mainBranch);
  };

  const addProduct = (prodData: Omit<Product, "id" | "tenantId">) => {
    if (!business) return;
    const newProduct: Product = {
      ...prodData,
      id: "prod-" + Date.now(),
      tenantId: business.id,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const processSale = (saleData: Omit<Sale, "id" | "tenantId" | "createdAt" | "saleNumber">) => {
    if (!business) throw new Error("No business");
    const saleNum = "INV-" + (1025 + sales.length);
    const newSale: Sale = {
      ...saleData,
      id: "sale-" + Date.now(),
      tenantId: business.id,
      saleNumber: saleNum,
      createdAt: new Date().toISOString(),
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
      tenantId: business.id,
      branchId: saleData.branchId,
      productId: it.productId,
      productName: it.productName,
      type: "OUT",
      quantity: it.quantity,
      reason: saleData.paymentMethod === "CASH" ? "QUICK_CASH_SALE" : "SALE",
      unitCost: it.price,
      totalValue: it.total,
      recordedBy: saleData.cashierName || "Cashier",
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

    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const refundSale = (saleId: string) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: "REFUNDED" } : s))
    );
  };

  const recordStockMovement = (movData: Omit<StockMovement, "id" | "tenantId" | "createdAt">) => {
    if (!business) return;
    const newMov: StockMovement = {
      ...movData,
      id: "mov-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      tenantId: business.id,
      createdAt: new Date().toISOString(),
    };
    // Adjust stock in products catalog
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === movData.productId) {
          const updatedQty = movData.type === "IN"
            ? p.stockQuantity + movData.quantity
            : Math.max(0, p.stockQuantity - movData.quantity);
          return { ...p, stockQuantity: updatedQty };
        }
        return p;
      })
    );
    setStockMovements((prev) => [newMov, ...prev]);
  };

  const addExpense = (expenseData: Omit<Expense, "id" | "tenantId">) => {
    if (!business) return;
    const newExp: Expense = {
      ...expenseData,
      id: "exp-" + Date.now(),
      tenantId: business.id,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const addCustomer = (custData: Omit<Customer, "id" | "tenantId" | "totalSpent" | "debtBalance" | "loyaltyPoints">) => {
    if (!business) return;
    const newCust: Customer = {
      ...custData,
      id: "cust-" + Date.now(),
      tenantId: business.id,
      totalSpent: 0,
      debtBalance: 0,
      loyaltyPoints: 10,
      lastPurchaseDate: new Date().toISOString().split("T")[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  const addSupplier = (supplierData: Omit<Supplier, "id" | "tenantId" | "totalPurchased" | "amountOwed">) => {
    if (!business) return;
    const newSup: Supplier = {
      ...supplierData,
      id: "sup-" + Date.now(),
      tenantId: business.id,
      totalPurchased: 0,
      amountOwed: 0,
      lastPurchaseDate: new Date().toISOString().split("T")[0],
    };
    setSuppliers((prev) => [newSup, ...prev]);
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => {
    if (!business) return;
    const newPO: PurchaseOrder = {
      ...poData,
      id: "po-" + Date.now(),
      tenantId: business.id,
      orderNumber: "PO-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
  };

  const createOnlineOrder = (orderData: Omit<OnlineOrder, "id" | "tenantId" | "createdAt" | "orderNumber">) => {
    if (!business) return null as any;
    const orderNum = "DEL-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder: OnlineOrder = {
      ...orderData,
      id: "ord-" + Date.now(),
      tenantId: business.id,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
    };
    setOnlineOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OnlineOrder['status']) => {
    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const updateDeliveryDetails = (orderId: string, updates: Partial<OnlineOrder>) => {
    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryItem['status']) => {
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

  const renewSubscription = () => {
    if (!business) return;
    const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setBusiness({
      ...business,
      subscriptionStatus: "ACTIVE",
      subscriptionExpiry: nextDate,
    });
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
        addProduct,
        updateProduct,
        deleteProduct,
        processSale,
        refundSale,
        recordStockMovement,
        addExpense,
        addCustomer,
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
      }}
    >
      {children}
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
