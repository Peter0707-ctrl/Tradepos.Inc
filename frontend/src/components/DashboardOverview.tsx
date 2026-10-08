"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  AlertTriangle,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Package,
  FileText,
  Printer,
  Eye,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Boxes,
  ArrowDownLeft,
  History
} from "lucide-react";

interface DashboardOverviewProps {
  onNavigate: (module: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const {
    user,
    business,
    currentBranch,
    sales,
    products,
    expenses,
    customers,
    onlineOrders,
    cashRegister,
    refundSale,
    stockMovements,
    t
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<"Today" | "7 Days" | "30 Days">("Today");

  // Live Metric Aggregations
  const todaysSales = sales.reduce((acc, s) => acc + s.total, 0);
  const todaysExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalOrdersCount = sales.length + onlineOrders.length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStock);
  const totalDebts = customers.reduce((acc, c) => acc + c.debtBalance, 0);

  // Stock In / Stock Out metrics for the Boss
  const totalStockInQty = (stockMovements || [])
    .filter((m) => m.type === "IN")
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalStockInValue = (stockMovements || [])
    .filter((m) => m.type === "IN")
    .reduce((acc, m) => acc + m.totalValue, 0);
  const totalStockOutQty = (stockMovements || [])
    .filter((m) => m.type === "OUT")
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalStockOutValue = (stockMovements || [])
    .filter((m) => m.type === "OUT")
    .reduce((acc, m) => acc + m.totalValue, 0);
  
  // Real Financial Margins:
  // Approximate COGS from sold products or 65% base
  const estCogs = Math.round(todaysSales * 0.62);
  const grossProfit = todaysSales - estCogs;
  const netProfit = grossProfit - todaysExpenses;
  const avgOrderValue = sales.length > 0 ? Math.round(todaysSales / sales.length) : 0;

  // Top Products sold
  const topProducts = [
    { name: "Nivea Nourishing Body Milk 400ml", units: 28, revenue: 616000, profit: 196000 },
    { name: "CeraVe Hydrating Cleanser 236ml", units: 18, revenue: 684000, profit: 180000 },
    { name: "Maybelline Matte Lip Gloss Velvet", units: 24, revenue: 444000, profit: 156000 },
    { name: "Vaseline Petroleum Jelly 250g", units: 35, revenue: 262500, profit: 87500 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 lg:p-6 space-y-6">
      
      {/* 1. Header & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#D8E6CC]">
        <div>
          <h2 className="text-2xl font-black text-[#152508] tracking-tight">
            Good morning, {user?.name ? user.name.split(" ")[0] : "Peter"}
          </h2>
          <p className="text-xs text-[#526848] font-semibold mt-0.5">
            Here&apos;s what&apos;s happening with your business today at <strong className="text-[#192D0A]">{currentBranch?.name}</strong>.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate("pos")}
            className="px-3.5 py-2 rounded-xl bg-[#E1FFAC] border border-[#9EDE31] hover:bg-[#D5F98A] text-xs font-black text-[#172A08] shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 text-[#20360A]" />
            <span>New Sale</span>
          </button>

          <button
            onClick={() => onNavigate("products")}
            className="px-3 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#426117]" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onNavigate("customers")}
            className="px-3 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#426117]" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={() => onNavigate("expenses")}
            className="px-3 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#426117]" />
            <span>Record Expense</span>
          </button>

          <button
            onClick={() => onNavigate("purchases")}
            className="px-3 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#426117]" />
            <span>Add Purchase</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (8 Key Business Vitals) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Today&apos;s Sales</span>
          <p className="text-xl lg:text-2xl font-black text-[#162709] mt-1">
            TZS {todaysSales.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.5% vs yesterday</span>
          </div>
        </div>

        {/* Today's Profit */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Today&apos;s Profit</span>
          <p className="text-xl lg:text-2xl font-black text-emerald-800 mt-1">
            TZS {grossProfit.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>38% gross margin</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Today&apos;s Orders</span>
          <p className="text-xl lg:text-2xl font-black text-[#162709] mt-1">
            {totalOrdersCount} Orders
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#4B623F] mt-1">
            <span>Avg ticket: TZS {avgOrderValue.toLocaleString()}</span>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Today&apos;s Expenses</span>
          <p className="text-xl lg:text-2xl font-black text-rose-700 mt-1">
            TZS {todaysExpenses.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#667D59] mt-1">
            <span>Store lease & utility tokens</span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Active Customers</span>
          <p className="text-xl lg:text-2xl font-black text-[#162709] mt-1">
            {customers.length} Accounts
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+2 registered today</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Low Stock Alerts</span>
          <p className="text-xl lg:text-2xl font-black text-amber-700 mt-1">
            {lowStockProducts.length} Items
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Below safety buffer</span>
          </div>
        </div>

        {/* Outstanding Debts */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Outstanding Debts</span>
          <p className="text-xl lg:text-2xl font-black text-rose-700 mt-1">
            TZS {totalDebts.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#637C55] mt-1">
            <span>Receivables ledger</span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">Cash Balance</span>
          <p className="text-xl lg:text-2xl font-black text-[#152709] mt-1">
            TZS {cashRegister.actualCash.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <span>Drawer Open • Verified</span>
          </div>
        </div>
      </div>

      {/* 2.5. TAARIFA YA BOSS: HALI YA BIASHARA (FAIDA/HASARA) NA MZUNGUKO WA STOO (STOCK IN & OUT) */}
      <div className="neu-card-flat bg-white/90 p-4 sm:p-5 rounded-2xl border-2 border-[#b8ea66] shadow-neu-card flex flex-col lg:flex-row items-stretch justify-between gap-4">
        {/* Left: Profit / Loss Executive Verdict */}
        <div className="flex-1 flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
              netProfit >= 0 ? "bg-emerald-600 text-white shadow-sm" : "bg-rose-600 text-white shadow-sm"
            }`}
          >
            {netProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  netProfit >= 0
                    ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                    : "bg-rose-100 text-rose-950 border border-rose-300"
                }`}
              >
                {netProfit >= 0 ? "★ BIASHARA INATENGENEZA FAIDA" : "⚠ TAHADHARI: BIASHARA INAPATA HASARA"}
              </span>
              <span className="text-xs font-bold text-[#455b38]">
                Faida Halisi: <strong className={netProfit >= 0 ? "text-emerald-800" : "text-rose-700"}>
                  TZS {netProfit.toLocaleString()}
                </strong>
              </span>
            </div>
            <p className="text-xs text-[#52664a] leading-relaxed">
              {netProfit >= 0
                ? `Baada ya kutoa gharama za kununua bidhaa (COGS: TZS ${estCogs.toLocaleString()}) na matumizi ya uendeshaji (TZS ${todaysExpenses.toLocaleString()}), faida ya wavu ya biashara ni chanya.`
                : `Gharama za ununuzi na matumizi zimezidi mauzo ya leo. Hakiki matumizi au ongeza bei za mauzo.`}
            </p>
          </div>
        </div>

        {/* Right: Quick Stock In / Stock Out Vitals & Direct Links */}
        <div className="flex items-center gap-3 pt-3 lg:pt-0 lg:pl-4 border-t lg:border-t-0 lg:border-l border-[#dbe8cb] shrink-0">
          <div className="flex gap-2">
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left min-w-[110px]">
              <span className="text-[10px] font-black text-emerald-800 block uppercase flex items-center gap-0.5">
                <ArrowDownLeft className="w-3 h-3" /> Mzigo Ulioingia
              </span>
              <span className="text-sm font-black text-emerald-950">+{totalStockInQty} pcs</span>
              <span className="block text-[9px] text-emerald-700 font-bold">TZS {totalStockInValue.toLocaleString()}</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-left min-w-[110px]">
              <span className="text-[10px] font-black text-rose-800 block uppercase flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Mzigo Uliotoka
              </span>
              <span className="text-sm font-black text-rose-950">-{totalStockOutQty} pcs</span>
              <span className="block text-[9px] text-rose-700 font-bold">TZS {totalStockOutValue.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("inventory")}
            className="px-3 py-2 rounded-xl bg-[#E1FFAC] hover:bg-[#d4f98d] text-[#1c300c] text-xs font-black border border-[#a0dc46] shadow-xs flex items-center gap-1 transition"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Mzunguko wa Stoo</span>
          </button>
        </div>
      </div>

      {/* 3. Sales Analytics & Profit Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Sales Trend Graph Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#EDF4E4] gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-[#162709]">Sales Trend & Volume</h3>
              <p className="text-xs text-[#5F7553]">Revenue curve, transaction counts, and avg ticket size</p>
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#EDF3E6] text-xs font-bold">
              {(["Today", "7 Days", "30 Days"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-3 py-1 rounded-lg transition ${
                    timeFilter === period
                      ? "bg-[#E1FFAC] text-[#162A08] shadow-xs font-black"
                      : "text-[#4A613E] hover:text-[#182B0A]"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Graphical Analytics Bars */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: "Mon", val: 55, rev: "1.2M", count: 18 },
              { day: "Tue", val: 40, rev: "950k", count: 14 },
              { day: "Wed", val: 75, rev: "1.8M", count: 26 },
              { day: "Thu", val: 60, rev: "1.4M", count: 21 },
              { day: "Fri", val: 85, rev: "2.1M", count: 32 },
              { day: "Sat", val: 100, rev: "2.6M", count: 42 },
              { day: "Today", val: 78, rev: "1.9M", count: 29 },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="text-[10px] font-bold text-[#4B623F] opacity-0 group-hover:opacity-100 transition text-center whitespace-nowrap">
                  <span>{bar.rev}</span>
                  <span className="block text-[9px] text-[#718865]">({bar.count} sales)</span>
                </div>
                <div
                  className="w-full bg-[#E1FFAC] rounded-t-xl hover:bg-[#C8F572] transition duration-200 border-t-2 border-[#82CB1A]"
                  style={{ height: `${bar.val}%` }}
                />
                <span className="text-[11px] font-bold text-[#354B25]">{bar.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EDF4E4] flex items-center justify-between text-xs text-[#526846]">
            <span>Average Order Value: <strong className="text-[#192D0A]">TZS {avgOrderValue.toLocaleString()}</strong></span>
            <span>Completed Checkout Velocity: <strong className="text-[#192D0A]">99.4%</strong></span>
          </div>
        </div>

        {/* Profit Analytics Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#162709]">Profit & Loss Breakdown</h3>
            <p className="text-xs text-[#5F7553] mb-4">Gross profit, acquisition COGS & operating surplus</p>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4]">
                <span className="text-[#4E6441] font-semibold">Revenue (Sales)</span>
                <span className="font-black text-[#152709]">TZS 18,500,000</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4]">
                <span className="text-[#4E6441] font-semibold">Cost of Goods (COGS)</span>
                <span className="font-bold text-[#6A815E]">-TZS 11,000,000</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4] bg-[#F7FCEE] px-2 rounded-lg">
                <span className="font-bold text-[#182C09]">Gross Profit</span>
                <span className="font-black text-emerald-800">TZS 7,500,000</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4]">
                <span className="text-[#4E6441] font-semibold">Operating Expenses</span>
                <span className="font-bold text-rose-700">-TZS 2,000,000</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-sm text-[#162A08]">Net Profit</span>
                <span className="font-black text-base text-emerald-800">TZS 5,500,000</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#EDF3E6] text-[11px] text-[#3B522C] font-semibold">
            Profit Margin: <strong className="text-[#152808]">29.7%</strong> • Target budget aligned with zero deficit.
          </div>
        </div>
      </div>

      {/* 4. Top Products, Low Stock Alerts & Business Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Top Selling Products */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E4]">
            <h3 className="font-extrabold text-sm text-[#162709]">Top Selling Products</h3>
            <button
              onClick={() => onNavigate("reports")}
              className="text-xs font-bold text-[#3B6414] hover:underline"
            >
              View Full Report
            </button>
          </div>

          <div className="divide-y divide-[#EDF4E4] my-2">
            {topProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#17290A]">{idx + 1}. {p.name}</h4>
                  <span className="text-[11px] text-[#657C58]">{p.units} units sold</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#152708] block">TZS {p.revenue.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-emerald-700">+TZS {p.profit.toLocaleString()} margin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E4]">
              <h3 className="font-extrabold text-sm text-[#162709]">Low Stock Thresholds</h3>
              <button
                onClick={() => onNavigate("inventory")}
                className="text-xs font-bold text-[#3B6414] hover:underline"
              >
                View Inventory
              </button>
            </div>

            <div className="divide-y divide-[#EDF4E4] my-2">
              {lowStockProducts.map((prod) => (
                <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#182B0B]">{prod.name}</h4>
                    <span className="text-[11px] text-[#69815D]">
                      Stock: <strong className="text-amber-800">{prod.stockQuantity}</strong> • Min required: {prod.minStock}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    LOW STOCK
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate("purchases")}
            className="w-full py-2.5 rounded-xl bg-[#EDF3E6] hover:bg-[#E1FFAC] border border-[#C5D8B8] text-xs font-bold text-[#20360A] transition"
          >
            Create Supplier Purchase Order
          </button>
        </div>

        {/* Business Health Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#F7FCF0] border-2 border-[#BFE973] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#DDE8D2]">
              <span className="text-xs font-black text-[#1C320A] uppercase tracking-wider">
                Business Health
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-[#E1FFAC] px-2 py-0.5 rounded-md">
                Grade: A
              </span>
            </div>

            <div className="text-center py-4">
              <span className="text-5xl font-black text-[#162A08]">82</span>
              <span className="text-base font-bold text-[#556D47]"> / 100</span>
              <p className="text-xs text-[#415833] font-semibold mt-1">
                Robust working capital & strong customer repeat retention.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-[#475E39] pt-2 border-t border-[#E3EDD9]">
              <div className="flex justify-between">
                <span>Sales Growth:</span>
                <strong className="text-[#192E0B]">Positive (+14.5%)</strong>
              </div>
              <div className="flex justify-between">
                <span>Inventory Health:</span>
                <strong className="text-[#192E0B]">92% stocked</strong>
              </div>
              <div className="flex justify-between">
                <span>Receivables Risk:</span>
                <strong className="text-emerald-700">Low (&lt;4% debt)</strong>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#D5E5C4] text-[11px] text-[#344B26]">
            💡 <strong>Action:</strong> Order 40 units of Garnier Micellar Water to prevent stockout before Saturday.
          </div>
        </div>
      </div>

      {/* 5. Recent Sales Transactions Table */}
      <div className="bg-white rounded-2xl p-5 border border-[#D8E6CC] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-sm text-[#162709]">Recent Sales Ledger</h3>
            <p className="text-xs text-[#5D7351]">Latest completed transactions and customer receipts</p>
          </div>
          <button
            onClick={() => onNavigate("sales")}
            className="text-xs font-bold text-[#3B6414] hover:underline"
          >
            View All Sales
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
            <thead>
              <tr className="font-bold text-[#516744]">
                <th className="py-2.5 px-3">Invoice</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Cashier</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F6EB] text-[#1B2F0B]">
              {sales.slice(0, 5).map((s) => (
                <tr key={s.id} className="hover:bg-[#F9FBF6] transition">
                  <td className="py-3 px-3 font-bold">{s.saleNumber}</td>
                  <td className="py-3 px-3">{s.customerName || "Walk-in Customer"}</td>
                  <td className="py-3 px-3 text-[#4A613E]">{s.cashierName}</td>
                  <td className="py-3 px-3 font-black">TZS {s.total.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#EDF3E6] font-bold text-[#20360B]">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        s.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => window.print()}
                      className="px-2 py-1 rounded-lg bg-[#EDF3E6] hover:bg-[#E1FFAC] text-[#1A2E09] font-bold text-[11px] transition"
                    >
                      Print Receipt
                    </button>
                    {s.status === "COMPLETED" && (
                      <button
                        onClick={() => refundSale(s.id)}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
