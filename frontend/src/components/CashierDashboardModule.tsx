"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  DollarSign,
  Layers,
  Users,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  Smartphone,
  ChevronRight,
  Plus,
  User
} from "lucide-react";

interface CashierDashboardModuleProps {
  onNavigate: (module: string) => void;
}

export const CashierDashboardModule: React.FC<CashierDashboardModuleProps> = ({ onNavigate }) => {
  const {
    user,
    currentBranch,
    sales,
    expenses,
    activeDayLabel,
    language,
    isDayClosed,
    closeDayAndSendToBoss,
    startNewDay,
  } = useApp();

  const cashierName = user?.name ? user.name.split(" ")[0] : (language === "sw" ? "Muuzaji" : "Cashier");

  // Dynamic typing salutation based on time of day (Good morning / afternoon / evening)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === "sw" ? `Habari za Asubuhi, ${cashierName}` : `Good morning, ${cashierName}`;
    } else if (hour < 17) {
      return language === "sw" ? `Habari za Mchana, ${cashierName}` : `Good afternoon, ${cashierName}`;
    } else {
      return language === "sw" ? `Habari za Jioni, ${cashierName}` : `Good evening, ${cashierName}`;
    }
  };

  const fullGreeting = getGreeting();
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let index = 0;
    setTypedText("");
    const interval = setInterval(() => {
      index++;
      setTypedText(fullGreeting.slice(0, index));
      if (index >= fullGreeting.length) {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [fullGreeting]);

  // Today's Date formatted
  const currentDateFormatted = new Date().toLocaleDateString(language === "sw" ? "sw-TZ" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate today's cashier metrics
  const todayStr = activeDayLabel || new Date().toISOString().slice(0, 10);
  const validSales = sales.filter((s) => s.status !== "REFUNDED");
  const todaySales = validSales.filter((s) => (s.createdAt || "").startsWith(todayStr));

  // Filter for this cashier if sales track cashier, otherwise show store daily sales
  const cashierTodaySales = todaySales.filter((s) => !s.cashierName || s.cashierName === user?.name || todaySales.length > 0);

  const totalSalesAmount = cashierTodaySales.reduce((acc, s) => acc + s.total, 0);
  const totalTransactionsCount = cashierTodaySales.length;

  const cashSalesAmount = cashierTodaySales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((acc, s) => acc + s.total, 0);

  const mobileSalesAmount = cashierTodaySales
    .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
    .reduce((acc, s) => acc + s.total, 0);

  const todayExpenses = expenses
    .filter((e) => (e.date || "").startsWith(todayStr))
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-[#F4F7EE] p-3 sm:p-5 overflow-y-auto">
      {/* 1. Dynamic Typing Salutation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#D8E6CC] shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="w-12 h-12 rounded-2xl bg-[#E1FFAC] border-2 border-[#A6DF52] flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#84C924] transition shrink-0 shadow-xs"
            title={language === "sw" ? "Wasifu & Picha Yangu" : "My Profile & Picture"}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-black text-[#193008] uppercase">
                {user?.name ? user.name.charAt(0) : "M"}
              </span>
            )}
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#152508] tracking-tight flex items-center gap-1.5">
              <span>{typedText}</span>
              <span className="w-0.5 h-6 bg-[#27460d] inline-block animate-pulse"></span>
            </h1>
            <p className="text-xs text-[#52654c] mt-0.5">
              {currentDateFormatted} • {currentBranch?.name || "Tawi Kuu"}
            </p>
          </div>
        </div>

        {/* Quick Shift Status & End Day Button */}
        <div className="flex items-center gap-2">
          {!isDayClosed ? (
            <button
              onClick={() => closeDayAndSendToBoss()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B2F09] hover:bg-[#26420D] text-[#E1FFAC] border border-[#8ECE28] text-xs font-black transition cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === "sw" ? "Funga Mauzo ya Siku" : "Close Day"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                startNewDay();
                onNavigate("sales");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === "sw" ? "Siku Imefungwa • Anza Mpya" : "Day Closed • Start New"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Today's Key Performance Metrics for Cashier */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5 shrink-0">
        {/* Metric 1: Mauzo ya Leo */}
        <div
          onClick={() => onNavigate("sales")}
          className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between cursor-pointer hover:border-[#a6c48d] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">
              {language === "sw" ? "Mauzo ya Leo" : "Today's Sales"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E1FFAC] text-[#1a2d0a] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-emerald-800">
              TZS {totalSalesAmount.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              {totalTransactionsCount} {language === "sw" ? "risiti zilizofanywa" : "sales completed"}
            </span>
          </div>
        </div>

        {/* Metric 2: Pesa Taslimu (Cash) */}
        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">
              {language === "sw" ? "Pesa Taslimu (Cash)" : "Cash Sales"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#edf5e5] text-[#2c401f] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#17280a]">
              TZS {cashSalesAmount.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              {language === "sw" ? "Pesa mkononi / drooni" : "Cash in drawer"}
            </span>
          </div>
        </div>

        {/* Metric 3: Malipo ya Simu (M-Pesa) */}
        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">
              {language === "sw" ? "Malipo ya Simu (M-Pesa)" : "Mobile Money"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#edf5e5] text-[#2c401f] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#17280a]">
              TZS {mobileSalesAmount.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              M-Pesa / Tigo Pesa / Airtel
            </span>
          </div>
        </div>

        {/* Metric 4: Matumizi ya Leo */}
        <div
          onClick={() => onNavigate("expenses")}
          className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between cursor-pointer hover:border-[#a6c48d] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">
              {language === "sw" ? "Matumizi ya Leo" : "Today's Expenses"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-rose-700">
              TZS {todayExpenses.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              {language === "sw" ? "Matumizi yaliyorekodiwa" : "Recorded expenses"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fast Actions Bar for Cashier */}
      <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-neu-card p-4 sm:p-5 mb-5 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#495f3e] mb-3">
          {language === "sw" ? "Vitendo vya Haraka vya Kila Siku" : "Quick Daily Actions"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigate("sales")}
            className="p-3.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d4f88e] border border-[#a2df4c] text-left transition cursor-pointer group shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-[#1b2f09] text-[#E1FFAC] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-[#172709]">
              {language === "sw" ? "Fanya Mauzo Mapya" : "Record New Sale"}
            </div>
            <div className="text-[10px] text-[#4d633f] mt-0.5">
              {language === "sw" ? "POS & Kata Risiti" : "POS terminal & receipts"}
            </div>
          </button>

          <button
            onClick={() => onNavigate("expenses")}
            className="p-3.5 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-[#eef5e7] text-[#294215] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-[#172709]">
              {language === "sw" ? "Rekodi Matumizi" : "Record Expense"}
            </div>
            <div className="text-[10px] text-[#6d8065] mt-0.5">
              {language === "sw" ? "Gharama za duka leo" : "Store daily costs"}
            </div>
          </button>

          <button
            onClick={() => onNavigate("inventory")}
            className="p-3.5 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-[#eef5e7] text-[#294215] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-[#172709]">
              {language === "sw" ? "Angalia Stoo" : "Check Inventory"}
            </div>
            <div className="text-[10px] text-[#6d8065] mt-0.5">
              {language === "sw" ? "Bei na idadi ya bidhaa" : "Prices and stock levels"}
            </div>
          </button>

          <button
            onClick={() => onNavigate("customers")}
            className="p-3.5 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-[#eef5e7] text-[#294215] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-[#172709]">
              {language === "sw" ? "Wateja & Madeni" : "Customers & Debts"}
            </div>
            <div className="text-[10px] text-[#6d8065] mt-0.5">
              {language === "sw" ? "Rekodi madeni na malipo" : "Track debts and payments"}
            </div>
          </button>

          <button
            onClick={() => onNavigate("profile")}
            className="p-3.5 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group shadow-xs col-span-2 sm:col-span-1"
          >
            <div className="w-7 h-7 rounded-lg bg-[#eef5e7] text-[#294215] flex items-center justify-center mb-2 group-hover:scale-105 transition overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-xs font-black text-[#172709]">
              {language === "sw" ? "Wasifu & Picha" : "Profile & Picture"}
            </div>
            <div className="text-[10px] text-[#6d8065] mt-0.5">
              {language === "sw" ? "Badili PIN & picha yako" : "Change PIN & photo"}
            </div>
          </button>
        </div>
      </div>

      {/* 4. Recent Sales Completed Today */}
      <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-neu-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#e8f0df] mb-3">
            <div>
              <h2 className="text-sm font-black text-[#172709] tracking-tight">
                {language === "sw" ? "Mauzo ya Hivi Karibuni ya Leo" : "Today's Recent Sales"}
              </h2>
              <p className="text-xs text-[#52654c]">
                {language === "sw" ? "Miamala iliyokamilika leo" : "Completed transactions today"}
              </p>
            </div>
            <button
              onClick={() => onNavigate("sales")}
              className="text-xs font-bold text-[#1a2d0b] hover:text-[#325217] flex items-center gap-1 cursor-pointer"
            >
              <span>{language === "sw" ? "Tazama Mauzo Yote" : "View All Sales"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {cashierTodaySales.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#62775b]">
              <p className="font-bold text-sm text-[#18270b]">
                {language === "sw" ? "Bado hakuna mauzo yaliyofanyika leo" : "No sales recorded yet today"}
              </p>
              <p className="text-xs text-[#62775b] mt-1">
                {language === "sw" ? "Bonyeza kitufe cha 'Fanya Mauzo Mapya' kuanza." : "Click 'Record New Sale' to get started."}
              </p>
              <button
                onClick={() => onNavigate("sales")}
                className="mt-3 px-4 py-2 rounded-xl bg-[#E1FFAC] hover:bg-[#d4f88e] text-xs font-black text-[#182a0b] border border-[#a2df4c] transition cursor-pointer"
              >
                + {language === "sw" ? "Anza Kuuza Sasa" : "Start Selling Now"}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#edf4e6]">
              {cashierTodaySales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="py-2.5 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#172709]">
                        {sale.saleNumber || sale.id.slice(0, 8)}
                      </span>
                      <span className="px-2 py-0.2 rounded-md bg-[#edf4e5] text-[10px] font-bold text-[#233516]">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6d8165] mt-0.5">
                      {sale.items.length} {language === "sw" ? "bidhaa zilizouzwa" : "items"} • {sale.customerName || (language === "sw" ? "Mteja wa Kawaida" : "Walk-in")}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-[#172709]">
                      TZS {sale.total.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {language === "sw" ? "Imekamilika" : "Completed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#edf4e6] flex items-center justify-between">
          <span className="text-xs text-[#52654c]">
            {language === "sw" ? "Jumla ya mauzo:" : "Total Sales:"} <strong>TZS {totalSalesAmount.toLocaleString()}</strong>
          </span>
          <button
            onClick={() => onNavigate("sales")}
            className="text-xs font-black text-[#1b2f09] hover:underline cursor-pointer"
          >
            {language === "sw" ? "Fungua Orodha Kamili ya Mauzo &rarr;" : "Open Full Sales Ledger &rarr;"}
          </button>
        </div>
      </div>
    </div>
  );
};
