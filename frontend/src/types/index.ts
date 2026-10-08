export interface Business {
  id: string;
  name: string;
  businessType: string;
  location: string;
  currency: string;
  taxRate: number;
  phone: string;
  email: string;
  subscriptionPlan: 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
  subscriptionStatus: 'PENDING' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'SUSPENDED';
  subscriptionExpiry: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  isMain: boolean;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'CASHIER' | 'STOREKEEPER' | 'SUPER_ADMIN';
  businessId: string;
  branchId: string;
}

export interface Product {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  buyingPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  stockQuantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplierId?: string;
  expiryDate?: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface Sale {
  id: string;
  tenantId: string;
  branchId: string;
  saleNumber: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  paymentMethod: 'CASH' | 'MPESA' | 'AIRTEL_MONEY' | 'MIXX' | 'HALOPESA' | 'CARD' | 'CREDIT' | 'SPLIT';
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  createdAt: string;
  status: 'COMPLETED' | 'REFUNDED' | 'HELD';
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  debtBalance: number;
  loyaltyPoints: number;
  lastPurchaseDate?: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  branchId: string;
  category: 'Rent' | 'Electricity' | 'Water' | 'Salary' | 'Transport' | 'Internet' | 'Repairs' | 'Marketing' | 'Delivery' | 'Other';
  title: string;
  amount: number;
  date: string;
  recordedBy: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchased: number;
  amountOwed: number;
  lastPurchaseDate?: string;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  items: {
    productName: string;
    quantity: number;
    buyingPrice: number;
    total: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'PAID';
  dueDate: string;
  createdAt: string;
}

export interface OnlineOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  deliveryFee: number;
  driverName?: string;
  driverPhone?: string;
  packedBy?: string;
  issueNotes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface DeliveryItem {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  driverName: string;
  fee: number;
  status: 'PENDING' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  createdAt: string;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  stockValue: number;
  totalItems: number;
  manager: string;
}

export interface CashRegister {
  openingBalance: number;
  cashSales: number;
  cashExpenses: number;
  cashDeposits: number;
  cashWithdrawals: number;
  actualCash: number;
  isOpen: boolean;
  openedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'STOCK' | 'PAYMENT' | 'ORDER' | 'SYSTEM' | 'DEBT';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  branchId: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: 'PURCHASE' | 'SALE' | 'DAMAGE' | 'EXPIRY' | 'ADJUSTMENT' | 'INTERNAL_USE' | 'QUICK_CASH_SALE';
  unitCost?: number;
  totalValue?: number;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

