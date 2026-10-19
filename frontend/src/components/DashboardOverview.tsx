"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Boxes,
  ArrowDownLeft,
} from "lucide-react";

interface DashboardOverviewProps {
  onNavigate: (module: string) => void;
}

const SWAHILI_DAYS_SHORT = ["Jumapili", "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi"];
const ENGLISH_DAYS_SHORT = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const {
    user,
    currentBranch,
    sales,
    products,
    expenses,
    customers,
    onlineOrders,
    cashRegister,
    stockMovements,
    dailyReports,
    approveDailyReport,
    activeDayLabel,
    t,
    language,
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<"Today" | "7 Days" | "30 Days">("Today");

  const validSales = sales.filter((s) => s.status !== "REFUNDED");

  // Filter sales & expenses by selected timeFilter
  const getCutoffDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = activeDayLabel || getCutoffDateStr(0);
  const yesterdayStr = getCutoffDateStr(1);

  const todaySalesList = validSales.filter((s) => (s.createdAt || "").startsWith(todayStr));
  const yesterdaySalesList = validSales.filter((s) => (s.createdAt || "").startsWith(yesterdayStr));

  const todaysSales = todaySalesList.reduce((acc, s) => acc + s.total, 0);
  const yesterdaysSales = yesterdaySalesList.reduce((acc, s) => acc + s.total, 0);

  const todaysExpenses = expenses
    .filter((e) => (e.date || "").startsWith(todayStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const totalAllSales = validSales.reduce((acc, s) => acc + s.total, 0);
  const totalAllExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const totalOrdersCount = todaySalesList.length + onlineOrders.length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStock);
  const totalDebts = customers.reduce((acc, c) => acc + c.debtBalance, 0);

  // Stock In / Stock Out metrics
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

  // Real COGS calculation from actual sold products' buyingPrice
  const computeCogsForSales = (salesList: typeof validSales) => {
    return Math.round(
      salesList.reduce((accSale, s) => {
        const saleCost = s.items.reduce((accItem, it) => {
          const matchedProd = products.find(
            (p) => p.id === it.productId || p.name.toLowerCase() === it.productName.toLowerCase()
          );
          if (matchedProd && matchedProd.buyingPrice > 0) {
            return accItem + matchedProd.buyingPrice * it.quantity;
          }
          return accItem + it.total * 0.7;
        }, 0);
        return accSale + saleCost;
      }, 0)
    );
  };

  const todayCogs = computeCogsForSales(todaySalesList);
  const todayGrossProfit = todaysSales - todayCogs;
  const todayNetProfit = todayGrossProfit - todaysExpenses;
  const avgOrderValue = todaySalesList.length > 0 ? Math.round(todaysSales / todaySalesList.length) : 0;

  // All-time / Period Profit & Loss Breakdown
  const totalCogsAll = computeCogsForSales(validSales);
  const totalGrossProfitAll = totalAllSales - totalCogsAll;
  const totalNetProfitAll = totalGrossProfitAll - totalAllExpenses;
  const overallMarginPct =
    totalAllSales > 0 ? ((totalNetProfitAll / totalAllSales) * 100).toFixed(1) : "0.0";

  // Dynamic Top Selling Products from real sales
  const productSalesMap: {
    [name: string]: { name: string; units: number; revenue: number; profit: number };
  } = {};
  validSales.forEach((s) => {
    s.items.forEach((it) => {
      const matchedProd = products.find(
        (p) => p.id === it.productId || p.name.toLowerCase() === it.productName.toLowerCase()
      );
      const unitCost =
        matchedProd && matchedProd.buyingPrice > 0 ? matchedProd.buyingPrice : it.price * 0.7;
      const itemProfit = Math.round(it.total - unitCost * it.quantity);

      if (!productSalesMap[it.productName]) {
        productSalesMap[it.productName] = {
          name: it.productName,
          units: 0,
          revenue: 0,
          profit: 0,
        };
      }
      productSalesMap[it.productName].units += it.quantity;
      productSalesMap[it.productName].revenue += it.total;
      productSalesMap[it.productName].profit += itemProfit;
    });
  });
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Dynamic 7-Day Sales Trend Bars from real sales
  const rawLast7Days = Array.from({ length: 7 }, (_, idx) => {
    const daysAgo = 6 - idx;
    const dStr = getCutoffDateStr(daysAgo);
    const dObj = new Date();
    dObj.setDate(dObj.getDate() - daysAgo);
    const daySales = validSales.filter((s) => (s.createdAt || "").startsWith(dStr));
    const revenue = daySales.reduce((acc, s) => acc + s.total, 0);
    const dayName =
      daysAgo === 0
        ? language === "sw"
          ? "Leo"
          : "Today"
        : daysAgo === 1
        ? language === "sw"
          ? "Jana"
          : "Yesterday"
        : (language === "sw" ? SWAHILI_DAYS_SHORT : ENGLISH_DAYS_SHORT)[dObj.getDay()].slice(0, 3);
    return {
      dateStr: dStr,
      dayLabel: dayName,
      revenue,
      count: daySales.length,
    };
  });
  const maxDayRev = Math.max(...rawLast7Days.map((d) => d.revenue), 1);
  const last7DaysBars = rawLast7Days.map((d) => ({
    ...d,
    heightPct: d.revenue > 0 ? Math.max(12, Math.round((d.revenue / maxDayRev) * 100)) : 4,
  }));

  // Dynamic Business Health Score
  const stockedRatio =
    products.length > 0
      ? Math.round(((products.length - lowStockProducts.length) / products.length) * 100)
      : 100;
  const debtRatioPct =
    totalAllSales > 0 ? Math.min(100, Math.round((totalDebts / Math.max(totalAllSales, 1)) * 100)) : 0;
  const healthScore =
    products.length === 0 && validSales.length === 0
      ? 100
      : Math.max(
          40,
          Math.min(
            100,
            Math.round(stockedRatio * 0.5 + (totalNetProfitAll >= 0 ? 35 : 10) + Math.max(0, 15 - debtRatioPct * 0.3))
          )
        );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 lg:p-6 space-y-6">
      {/* 1. Header & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#D8E6CC]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-[#152508] tracking-tight">
            {language === "sw" ? "Habari," : "Welcome,"}{" "}
            {user?.name ? user.name.split(" ")[0] : "Mmiliki"}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E1FFAC] text-[#172B08] border border-[#9CE034]">
            {currentBranch?.name || "Tawi Kuu"}
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate("sales")}
            className="px-3.5 py-2 rounded-xl bg-[#E1FFAC] border border-[#9EDE31] hover:bg-[#D5F98A] text-xs font-black text-[#172A08] shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#20360A]" />
            <span>{language === "sw" ? "Mauzo" : "Sales"}</span>
          </button>

          <button
            onClick={() => onNavigate("products")}
            className="px-3 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#426117]" />
            <span>{language === "sw" ? "Stoo" : "Stock"}</span>
          </button>

          <button
            onClick={() => onNavigate("customers")}
            className="px-3 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#426117]" />
            <span>{language === "sw" ? "Wateja" : "Customers"}</span>
          </button>

          <button
            onClick={() => onNavigate("expenses")}
            className="px-3 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#426117]" />
            <span>{language === "sw" ? "Matumizi" : "Expenses"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (8 Key Business Vitals) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">{t.dashboard.todaysSales}</span>
          <p className="text-xl lg:text-2xl font-black text-[#162709] mt-1">
            TZS {todaysSales.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>
              {language === "sw"
                ? `Jana: TZS ${yesterdaysSales.toLocaleString()}`
                : `Yesterday: TZS ${yesterdaysSales.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Today's Profit */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">{t.dashboard.todaysProfit}</span>
          <p className="text-xl lg:text-2xl font-black text-emerald-800 mt-1">
            TZS {todayGrossProfit.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <span>
              {language === "sw"
                ? `Faida Halisi: TZS ${todayNetProfit.toLocaleString()}`
                : `Net Profit: TZS ${todayNetProfit.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">
            {language === "sw" ? "Miamala ya Leo" : "Transactions"}
          </span>
          <p className="text-xl lg:text-2xl font-black text-[#162709] mt-1">
            {totalOrdersCount}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#4B623F] mt-1">
            <span>
              {language === "sw"
                ? `Wastani: TZS ${avgOrderValue.toLocaleString()}`
                : `Avg: TZS ${avgOrderValue.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">{t.dashboard.totalExpenses}</span>
          <p className="text-xl lg:text-2xl font-black text-rose-700 mt-1">
            TZS {todaysExpenses.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#667D59] mt-1">
            <span>
              {language === "sw"
                ? `Jumla: TZS ${totalAllExpenses.toLocaleString()}`
                : `Total: TZS ${totalAllExpenses.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">{t.dashboard.customersCount}</span>
          <p className="text-xl lg:text-2xl font-black text-[#162709] mt-1">
            {customers.length}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#4B623F] mt-1">
            <span>
              {customers.filter((c) => c.debtBalance > 0).length}{" "}
              {language === "sw" ? "wana madeni" : "with debts"}
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">{t.dashboard.lowStockItems}</span>
          <p className="text-xl lg:text-2xl font-black text-amber-700 mt-1">
            {lowStockProducts.length}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === "sw" ? "Bidhaa zinaisha" : "Low stock alert"}</span>
          </div>
        </div>

        {/* Outstanding Debts */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">{t.dashboard.outstandingDebts}</span>
          <p className="text-xl lg:text-2xl font-black text-rose-700 mt-1">
            TZS {totalDebts.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#637C55] mt-1">
            <span>{language === "sw" ? "Madeni ya wateja" : "Customer debts"}</span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#5A704E] block">{t.dashboard.cashBalance}</span>
          <p className="text-xl lg:text-2xl font-black text-[#152709] mt-1">
            TZS {cashRegister.actualCash.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <span>{language === "sw" ? "Salio la Cash" : "Cash in drawer"}</span>
          </div>
        </div>
      </div>

      {/* 2.8. RIPOTI ZA MAHESABU YA SIKU KUTOKA KWA WAFANYAKAZI */}
      {dailyReports && dailyReports.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6F0DC]">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-[#152508]">
                {language === "sw" ? "Ripoti ya Siku" : "Daily Report"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E1FFAC] text-[#172C08] border border-[#9CE034]">
                {dailyReports[0].submittedBy} • {dailyReports[0].submittedAt}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  dailyReports[0].status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
              >
                {dailyReports[0].status === "APPROVED" ? "IMEHAKIKIWA" : "MPYA"}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {dailyReports[0].status !== "APPROVED" && (
                <button
                  onClick={() => approveDailyReport(dailyReports[0].id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer"
                >
                  {language === "sw" ? "Idhinisha" : "Approve"}
                </button>
              )}
              <button
                onClick={() => onNavigate("cash-register")}
                className="px-3 py-1.5 rounded-xl bg-[#F4F8EC] hover:bg-[#E1FFAC] border border-[#C6DDA8] text-[#182C09] text-xs font-black transition cursor-pointer"
              >
                {language === "sw" ? "Ripoti Zote" : "All Reports"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F8FBF4] border border-[#D8E6CC] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EFE0]">
                  <span className="font-black text-[#162709] uppercase">
                    Mauzo ({dailyReports[0].totalUnitsSold} pcs)
                  </span>
                  <span className="font-black text-emerald-800">
                    TZS {dailyReports[0].totalSales.toLocaleString()}
                  </span>
                </div>
                <div className="divide-y divide-[#EBF2E6] my-2">
                  {dailyReports[0].soldItems.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <span className="font-bold text-[#1B2F0B] truncate pr-2">
                        {item.name} <strong className="text-emerald-800">x{item.quantity}</strong>
                      </span>
                      <span className="font-black text-[#162709] shrink-0">
                        TZS {item.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-[#E5EFE0] flex justify-between text-[11px] text-[#526846]">
                <span>
                  Cash: <strong>TZS {dailyReports[0].cashSales.toLocaleString()}</strong>
                </span>
                <span>
                  Simu: <strong>TZS {dailyReports[0].mobileSales.toLocaleString()}</strong>
                </span>
                <span>
                  Deni: <strong>TZS {dailyReports[0].creditSales.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-rose-200/70">
                  <span className="font-black text-rose-950 uppercase">
                    Matumizi ({dailyReports[0].dailyExpenses.length})
                  </span>
                  <span className="font-black text-rose-700">
                    TZS {dailyReports[0].totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="divide-y divide-rose-100 my-2">
                  {dailyReports[0].dailyExpenses.slice(0, 4).map((exp, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <span className="text-[#2C1618] truncate pr-2">
                        {exp.description}
                      </span>
                      <span className="font-black text-rose-800 shrink-0">
                        TZS {exp.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-rose-200/70 flex justify-between text-[11px] text-rose-900 font-semibold">
                <span>Cash Drooni:</span>
                <strong>TZS {dailyReports[0].actualCashCounted.toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FBF4] border border-[#D8E6CC] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EFE0]">
                  <span className="font-black text-[#162709] uppercase">
                    Stoo ({dailyReports[0].remainingStockSummary.totalUnitsInStore} pcs)
                  </span>
                  <span className="text-[11px] font-black text-amber-800">
                    {dailyReports[0].remainingStockSummary.lowStockCount} zinaisha
                  </span>
                </div>
                <div className="divide-y divide-[#EBF2E6] my-2">
                  {dailyReports[0].remainingStockSummary.stockSnapshot.slice(0, 4).map((st) => (
                    <div key={st.id} className="py-1.5 flex items-center justify-between">
                      <span className="font-bold text-[#1B2F0B] truncate pr-2">{st.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-black shrink-0 ${
                          st.remainingQty <= st.minStock
                            ? "bg-amber-100 text-amber-900"
                            : "bg-[#E1FFAC] text-[#172B08]"
                        }`}
                      >
                        {st.remainingQty} {st.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-[#E5EFE0] flex justify-between items-center text-[11px] text-[#526846]">
                <span>
                  Bidhaa: <strong>{dailyReports[0].remainingStockSummary.totalProductsCount}</strong>
                </span>
                <button
                  onClick={() => onNavigate("inventory")}
                  className="font-black text-[#2F520E] hover:underline"
                >
                  Ona Stoo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sales Analytics & Profit Analytics Section (100% Dynamic) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend Graph Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#EDF4E4] gap-2">
            <h3 className="font-extrabold text-sm text-[#162709]">
              {language === "sw" ? "Mwenendo wa Mauzo (Siku 7)" : "Sales Trend (7 Days)"}
            </h3>

            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#EDF3E6] text-xs font-bold">
              {(["Today", "7 Days", "30 Days"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    timeFilter === period
                      ? "bg-[#E1FFAC] text-[#162A08] shadow-xs font-black"
                      : "text-[#4A613E] hover:text-[#182B0A]"
                  }`}
                >
                  {period === "Today"
                    ? language === "sw"
                      ? "Leo"
                      : "Today"
                    : period === "7 Days"
                    ? language === "sw"
                      ? "Siku 7"
                      : "7 Days"
                    : language === "sw"
                    ? "Siku 30"
                    : "30 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Graphical Analytics Bars */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {last7DaysBars.map((bar) => (
              <div key={bar.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-bold text-[#4B623F] text-center whitespace-nowrap">
                  <span>TZS {bar.revenue.toLocaleString()}</span>
                </div>
                <div
                  className="w-full bg-[#E1FFAC] rounded-t-xl hover:bg-[#C8F572] transition duration-200 border-t-2 border-[#82CB1A]"
                  style={{ height: `${bar.heightPct}%` }}
                />
                <span className="text-[11px] font-bold text-[#354B25]">{bar.dayLabel}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EDF4E4] flex items-center justify-between text-xs text-[#526846]">
            <span>
              {language === "sw" ? "Wastani: " : "Average: "}
              <strong className="text-[#192D0A]">TZS {avgOrderValue.toLocaleString()}</strong>
            </span>
            <span>
              {language === "sw" ? "Miamala: " : "Transactions: "}
              <strong className="text-[#192D0A]">{validSales.length}</strong>
            </span>
          </div>
        </div>

        {/* Dynamic Profit & Loss Breakdown Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#162709] mb-4">
              {language === "sw" ? "Faida na Hasara" : "Profit & Loss"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4]">
                <span className="text-[#4E6441] font-semibold">
                  {language === "sw" ? "Mauzo Yote" : "Total Revenue"}
                </span>
                <span className="font-black text-[#152709]">
                  TZS {totalAllSales.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4]">
                <span className="text-[#4E6441] font-semibold">
                  {language === "sw" ? "Gharama ya Bidhaa (COGS)" : "Cost of Goods Sold (COGS)"}
                </span>
                <span className="font-bold text-[#6A815E]">
                  -TZS {totalCogsAll.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4] bg-[#F7FCEE] px-2 rounded-lg">
                <span className="font-bold text-[#182C09]">
                  {language === "sw" ? "Faida Ghafi" : "Gross Profit"}
                </span>
                <span className="font-black text-emerald-800">
                  TZS {totalGrossProfitAll.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#EDF4E4]">
                <span className="text-[#4E6441] font-semibold">
                  {language === "sw" ? "Matumizi ya Duka" : "Shop Expenses"}
                </span>
                <span className="font-bold text-rose-700">
                  -TZS {totalAllExpenses.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-sm text-[#162A08]">
                  {language === "sw" ? "Faida Halisi" : "Net Profit"}
                </span>
                <span
                  className={`font-black text-base ${
                    totalNetProfitAll >= 0 ? "text-emerald-800" : "text-rose-700"
                  }`}
                >
                  TZS {totalNetProfitAll.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#EDF3E6] text-[11px] text-[#3B522C] font-semibold">
            {language === "sw" ? "Kiwango cha Faida: " : "Profit Margin: "}
            <strong className="text-[#152808]">{overallMarginPct}%</strong>
          </div>
        </div>
      </div>

      {/* 4. Top Products, Low Stock Alerts & Business Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Selling Products */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E4]">
            <h3 className="font-extrabold text-sm text-[#162709]">
              {language === "sw" ? "Bidhaa Zinazouzika Zaidi" : "Top Selling Products"}
            </h3>
            <button
              onClick={() => onNavigate("sales")}
              className="text-xs font-bold text-[#3B6414] hover:underline cursor-pointer"
            >
              {language === "sw" ? "Ona Mauzo" : "View Sales"}
            </button>
          </div>

          <div className="divide-y divide-[#EDF4E4] my-2">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                {language === "sw" ? "Bado hakuna mauzo yaliyoandikwa." : "No sales recorded yet."}
              </div>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#17290A]">
                      {idx + 1}. {p.name}
                    </h4>
                    <span className="text-[11px] text-[#657C58]">
                      {p.units} {language === "sw" ? "zimeuzwa" : "sold"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#152708] block">
                      TZS {p.revenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      +TZS {p.profit.toLocaleString()} {language === "sw" ? "faida" : "profit"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E4]">
              <h3 className="font-extrabold text-sm text-[#162709]">
                {language === "sw" ? "Bidhaa Zinazoisha Stoo" : "Low Stock Thresholds"}
              </h3>
              <button
                onClick={() => onNavigate("inventory")}
                className="text-xs font-bold text-[#3B6414] hover:underline cursor-pointer"
              >
                {language === "sw" ? "Fungua Stoo" : "View Inventory"}
              </button>
            </div>

            <div className="divide-y divide-[#EDF4E4] my-2">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  {language === "sw" ? "Hakuna bidhaa iliyo chini ya kiwango cha stoo." : "All products are well stocked."}
                </div>
              ) : (
                lowStockProducts.map((prod) => (
                  <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-[#182B0B]">{prod.name}</h4>
                      <span className="text-[11px] text-[#69815D]">
                        {language === "sw" ? "Stoo: " : "Stock: "}
                        <strong className="text-amber-800">{prod.stockQuantity}</strong> •{" "}
                        {language === "sw" ? "Kiwango cha chini: " : "Min: "}{prod.minStock}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                      {language === "sw" ? "INAHITAJI STOCK" : "LOW STOCK"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate("inventory")}
            className="w-full py-2.5 rounded-xl bg-[#EDF3E6] hover:bg-[#E1FFAC] border border-[#C5D8B8] text-xs font-bold text-[#20360A] transition cursor-pointer"
          >
            {language === "sw" ? "Ingiza Mzigo Mpya Stoo" : "Add Stock to Inventory"}
          </button>
        </div>

        {/* Dynamic Business Health Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#F7FCF0] border-2 border-[#BFE973] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#DDE8D2]">
              <span className="text-xs font-black text-[#1C320A] uppercase tracking-wider">
                {language === "sw" ? "Afya ya Biashara" : "Business Health"}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-[#E1FFAC] px-2 py-0.5 rounded-md">
                {healthScore >= 80 ? "Grade: A" : healthScore >= 60 ? "Grade: B" : "Grade: C"}
              </span>
            </div>

            <div className="text-center py-4">
              <span className="text-5xl font-black text-[#162A08]">{healthScore}</span>
              <span className="text-base font-bold text-[#556D47]"> / 100</span>
              <p className="text-xs text-[#415833] font-semibold mt-1">
                {language === "sw"
                  ? "Kipimo halisi cha mzunguko wa mauzo, stoo na madeni."
                  : "Live operational score from sales, stock & receivables."}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-[#475E39] pt-2 border-t border-[#E3EDD9]">
              <div className="flex justify-between">
                <span>{language === "sw" ? "Utoshelevu wa Stoo:" : "Stock Adequacy:"}</span>
                <strong className="text-[#192E0B]">
                  {stockedRatio}% {language === "sw" ? "salama" : "safe"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{language === "sw" ? "Jumla ya Bidhaa:" : "Total Products:"}</span>
                <strong className="text-[#192E0B]">
                  {products.length} {language === "sw" ? "aina" : "items"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{language === "sw" ? "Madeni ya Wateja:" : "Customer Debts:"}</span>
                <strong className="text-emerald-700">TZS {totalDebts.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#D5E5C4] text-[11px] text-[#344B26]">
            {lowStockProducts.length > 0 ? (
              <span>
                <strong>{language === "sw" ? "Hatua: " : "Action: "}</strong>
                {language === "sw"
                  ? `Ongeza stoo ya ${lowStockProducts[0].name} (imebaki ${lowStockProducts[0].stockQuantity}).`
                  : `Restock ${lowStockProducts[0].name} (${lowStockProducts[0].stockQuantity} remaining).`}
              </span>
            ) : (
              <span>
                <strong>{language === "sw" ? "Hali: " : "Status: "}</strong>
                {language === "sw"
                  ? "Stoo na mahesabu yako yako sawa."
                  : "Inventory and daily calculations are balanced."}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
