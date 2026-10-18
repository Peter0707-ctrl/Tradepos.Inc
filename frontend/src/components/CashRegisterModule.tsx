"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Wallet,
  Package,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Send,
  PlusCircle,
  Boxes,
  Receipt,
  UserCheck,
  Clock,
  ArrowDownLeft,
  Eye,
  X
} from "lucide-react";
import { DailyShiftReport } from "@/types";

export const CashRegisterModule: React.FC = () => {
  const {
    user,
    employees,
    switchEmployeeAccount,
    cashRegister,
    updateCashRegister,
    currentBranch,
    sales,
    expenses,
    addExpense,
    products,
    recordStockMovement,
    dailyReports,
    submitDailyReport,
    approveDailyReport,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"summary" | "sold_products" | "daily_expenses" | "remaining_stock">("summary");
  const [amountInput, setAmountInput] = useState("");
  const [modalMode, setModalMode] = useState<"DEPOSIT" | "WITHDRAW" | "COUNT" | null>(null);

  // Submit Daily Report to Owner Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState("");
  const [shiftNotes, setShiftNotes] = useState("");
  const [submitSuccessBanner, setSubmitSuccessBanner] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyShiftReport | null>(null);

  // Quick Expense Form State (for Staff)
  const [expCategory, setExpCategory] = useState("Usafiri & Bodaboda");
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMethod, setExpMethod] = useState<"CASH" | "MPESA">("CASH");

  // Quick Stock IN Form State (for Staff)
  const [stockProdId, setStockProdId] = useState(products[0]?.id || "");
  const [stockQty, setStockQty] = useState("");
  const [stockNote, setStockNote] = useState("");

  const handleDepositOrWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput) || 0;
    if (val <= 0) return;

    if (modalMode === "DEPOSIT") {
      updateCashRegister({
        cashDeposits: cashRegister.cashDeposits + val,
        actualCash: cashRegister.actualCash + val,
      });
    } else if (modalMode === "WITHDRAW") {
      updateCashRegister({
        cashWithdrawals: cashRegister.cashWithdrawals + val,
        actualCash: Math.max(0, cashRegister.actualCash - val),
      });
    } else if (modalMode === "COUNT") {
      updateCashRegister({
        actualCash: val,
      });
    }

    setModalMode(null);
    setAmountInput("");
  };

  // Financial Breakdown by Payment Method (excluding refunded)
  const validSales = sales.filter((s) => s.status !== "REFUNDED");
  const totalSalesAll = validSales.reduce((a, b) => a + b.total, 0);
  const totalCashSales = validSales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((a, b) => a + b.total, 0);
  const totalMobileSales = validSales
    .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
    .reduce((a, b) => a + b.total, 0);
  const totalCreditSales = validSales
    .filter((s) => s.paymentMethod === "CREDIT")
    .reduce((a, b) => a + b.total, 0);

  const totalExpensesToday = expenses.reduce((a, b) => a + b.amount, 0);

  const expectedCash =
    cashRegister.openingBalance +
    (totalCashSales > 0 ? totalCashSales : cashRegister.cashSales) +
    cashRegister.cashDeposits -
    cashRegister.cashExpenses -
    cashRegister.cashWithdrawals;

  const variance = cashRegister.actualCash - expectedCash;

  // Breakdown of all Products Sold Today + Remaining Stock in Store
  const soldProductsMap: {
    [name: string]: { name: string; quantity: number; revenue: number; lastCashier: string; remainingInStore: number; unit: string };
  } = {};
  validSales.forEach((s) => {
    s.items.forEach((item) => {
      const matchedProd = products.find((p) => p.id === item.productId || p.name === item.productName);
      if (!soldProductsMap[item.productName]) {
        soldProductsMap[item.productName] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          lastCashier: s.cashierName || "Baraka Mushi",
          remainingInStore: matchedProd ? matchedProd.stockQuantity : 0,
          unit: matchedProd ? matchedProd.unit : "Pcs",
        };
      }
      soldProductsMap[item.productName].quantity += item.quantity;
      soldProductsMap[item.productName].revenue += item.total;
    });
  });
  const soldProductsList = Object.values(soldProductsMap).sort((a, b) => b.quantity - a.quantity);
  const totalUnitsSold = soldProductsList.reduce((a, b) => a + b.quantity, 0);

  // Remaining Stock Summary
  const totalUnitsRemainingInStore = products.reduce((a, b) => a + b.stockQuantity, 0);
  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStock);

  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount) || 0;
    if (amt <= 0 || !expDesc.trim()) return;
    addExpense({
      branchId: currentBranch?.id || "br-01",
      category: expCategory,
      title: expDesc.trim(),
      description: `${expDesc.trim()} (Imerekodiwa na ${user?.name || "Mfanyakazi"})`,
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      recordedBy: user?.name || "Baraka Mushi",
      paymentMethod: expMethod,
    });
    setExpDesc("");
    setExpAmount("");
  };

  const handleQuickStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(stockQty) || 0;
    const prod = products.find((p) => p.id === stockProdId);
    if (qty <= 0 || !prod) return;
    recordStockMovement({
      branchId: currentBranch?.id || "br-01",
      productId: prod.id,
      productName: prod.name,
      type: "IN",
      quantity: qty,
      reason: "PURCHASE",
      unitCost: prod.buyingPrice,
      totalValue: qty * prod.buyingPrice,
      recordedBy: user?.name || "Mfanyakazi",
      notes: stockNote.trim() || "Stock mpya imeingizwa na mfanyakazi",
    });
    setStockQty("");
    setStockNote("");
  };

  const handleConfirmSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = countedCashInput ? parseFloat(countedCashInput) : cashRegister.actualCash;
    if (countedCashInput) {
      updateCashRegister({ actualCash: counted });
    }
    submitDailyReport(shiftNotes, counted);
    setIsSubmitModalOpen(false);
    setShiftNotes("");
    setCountedCashInput("");
    setSubmitSuccessBanner(true);
    setTimeout(() => setSubmitSuccessBanner(false), 6000);
  };

  const zReportMessage = `*TRADEPOS: RIPOTI YA SIKU KWA MWENYE DUKA*\nTarehe: ${new Date().toLocaleDateString()}\nImewasilishwa na: ${user?.name || "Baraka Mushi"} (${user?.role || "CASHIER"})\nTawi: ${currentBranch?.name || "Kariakoo"}\n\n*1. MAUZO YA LEO:* TZS ${totalSalesAll.toLocaleString()}\n- Cash: TZS ${totalCashSales.toLocaleString()}\n- Simu (M-Pesa/Airtel): TZS ${totalMobileSales.toLocaleString()}\n- Mkopo (Credit): TZS ${totalCreditSales.toLocaleString()}\n- Bidhaa Zilizouzwa: ${totalUnitsSold} pcs\n\n*2. MATUMIZI YA SIKU HIYO:* TZS ${totalExpensesToday.toLocaleString()}\n\n*3. STOCK ILIYobaki STOO:* ${totalUnitsRemainingInStore} pcs (${lowStockItems.length} zinaisha)\n\n*4. DROO YA PESA:*\n- Inayotakiwa: TZS ${expectedCash.toLocaleString()}\n- Iliyohesabiwa: TZS ${cashRegister.actualCash.toLocaleString()}`;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Top Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-[#162709] tracking-tight">
              {language === "sw"
                ? "Mahesabu ya Siku: Mauzo, Matumizi & Stock Iliyobaki Stoo"
                : "Daily Shift Handover: Sales, Expenses & Remaining Stock"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E1FFAC] text-[#172B08] border border-[#9CE034]">
              {user?.role === "OWNER"
                ? language === "sw"
                  ? "👑 Mwonekano wa Mwenye Duka"
                  : "👑 Owner View"
                : language === "sw"
                ? `👤 Akaunti ya Mfanyakazi: ${user?.name}`
                : `👤 Staff Account: ${user?.name}`}
            </span>
          </div>
          <p className="text-xs text-[#526848] mt-0.5">
            {language === "sw"
              ? "Sehemu ya mfanyakazi kukagua walichouza leo, matumizi ya siku hiyo, na stock iliyobaki stoo kisha kutuma moja kwa moja kwa Mwenye Duka."
              : "Staff & Owner workspace for daily sales, daily expenses, remaining store stock, and submitting shift reports to the Owner."}
          </p>
        </div>

        {/* Right: Quick Role Switcher + Submit to Owner Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Account Switcher so Owner/User can test Staff vs Owner view in 1 click */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#D4E4C3] shadow-xs text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#3F6315]" />
            <span className="font-bold text-[#4D6340] hidden sm:inline">
              {language === "sw" ? "Akaunti:" : "Account:"}
            </span>
            <select
              value={user?.id || "emp-01"}
              onChange={(e) => switchEmployeeAccount(e.target.value)}
              className="font-black text-[#162808] bg-transparent focus:outline-none cursor-pointer"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role === "OWNER" ? "Mwenye Duka" : emp.role})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setCountedCashInput(String(cashRegister.actualCash));
              setIsSubmitModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#1C320A] hover:bg-[#27460E] text-[#E1FFAC] font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {language === "sw" ? "Tuma Mahesabu kwa Mwenye Duka" : "Submit Daily Report to Owner"}
            </span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(zReportMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Success Banner when Staff submits report */}
      {submitSuccessBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {language === "sw"
                ? "✓ Mahesabu ya Siku (Mauzo, Matumizi na Stock Iliyobaki Stoo) yametumwa na kufika kwenye akaunti ya Mwenye Duka!"
                : "✓ Daily Shift Report (Sales, Expenses & Remaining Stock) has been sent to the Shop Owner!"}
            </span>
          </div>
          <button onClick={() => setSubmitSuccessBanner(false)} className="text-emerald-800 font-black">
            ✕
          </button>
        </div>
      )}

      {/* 4 Key Pillars KPI Cards (Wameuza Nini, Matumizi ya Siku, Stock Iliyobaki Stoo, Pesa Drooni) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("sold_products")}
          className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] hover:border-[#9CE034] shadow-xs cursor-pointer transition"
        >
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "1. Mauzo ya Siku (Wameuza Nini)" : "1. Today's Sales & Items"}
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {totalSalesAll.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            {totalUnitsSold} pcs zimeuzwa ({validSales.length} risiti) →
          </span>
        </div>

        <div
          onClick={() => setActiveTab("daily_expenses")}
          className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] hover:border-[#9CE034] shadow-xs cursor-pointer transition"
        >
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "2. Matumizi ya Siku Hiyo" : "2. Today's Shop Expenses"}
          </span>
          <p className="text-xl font-black text-rose-700 mt-0.5">
            TZS {totalExpensesToday.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#69825B] font-bold">
            {expenses.length} rekodi za matumizi leo →
          </span>
        </div>

        <div
          onClick={() => setActiveTab("remaining_stock")}
          className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] hover:border-[#9CE034] shadow-xs cursor-pointer transition"
        >
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "3. Stock Iliyobaki Stoo" : "3. Remaining Stock in Store"}
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            {totalUnitsRemainingInStore} pcs
          </p>
          <span className="text-[11px] text-amber-800 font-bold">
            Bidhaa {products.length} ({lowStockItems.length} zinakaribia kuisha) →
          </span>
        </div>

        <div
          onClick={() => setActiveTab("summary")}
          className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] hover:border-[#9CE034] shadow-xs cursor-pointer transition"
        >
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "4. Pesa Halisi Drooni (Cash)" : "4. Cash in Drawer"}
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {cashRegister.actualCash.toLocaleString()}
          </p>
          <span
            className={`text-[11px] font-black ${
              variance === 0 ? "text-emerald-700" : variance > 0 ? "text-emerald-800" : "text-rose-700"
            }`}
          >
            {variance === 0
              ? language === "sw"
                ? "✓ Sawia na Mfumo"
                : "✓ 100% Balanced"
              : `Tofauti: TZS ${variance.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center p-1 bg-[#EEF4E5] rounded-2xl border border-[#d2e4bb] gap-1">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
            activeTab === "summary"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{language === "sw" ? "1. Muhtasari & Ripoti za Mwenye Duka" : "1. Summary & Owner Reports"}</span>
        </button>

        <button
          onClick={() => setActiveTab("sold_products")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
            activeTab === "sold_products"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>
            {language === "sw"
              ? `2. Wameuza Nini Leo (${soldProductsList.length})`
              : `2. What Was Sold Today (${soldProductsList.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("daily_expenses")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
            activeTab === "daily_expenses"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>
            {language === "sw"
              ? `3. Matumizi ya Siku Hiyo (${expenses.length})`
              : `3. Today's Expenses (${expenses.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("remaining_stock")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
            activeTab === "remaining_stock"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>
            {language === "sw"
              ? `4. Stock Iliyobaki Stoo (${totalUnitsRemainingInStore} pcs)`
              : `4. Remaining Store Stock (${totalUnitsRemainingInStore} pcs)`}
          </span>
        </button>
      </div>

      {/* TAB 1: SUMMARY, CASH DRAWER & REPORTS SENT TO OWNER */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: Daily Shift Reports Sent to Owner */}
            <div className="flex-1 bg-white rounded-2xl border-2 border-[#C5E988] shadow-xs p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
                <div>
                  <h3 className="font-black text-sm text-[#162709] flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#3A6112]" />
                    <span>
                      {language === "sw"
                        ? "Ripoti za Siku Zilizotumwa kwa Mwenye Duka (Kutoka kwa Wafanyakazi)"
                        : "Daily Shift Reports Sent to Shop Owner"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#586E4C]">
                    {language === "sw"
                      ? "Kila mfanyakazi anapofunga mahesabu, ripoti inaonekana hapa na kwenye Dashibodi ya Mwenye Duka."
                      : "Every submitted staff shift report appears here and on the Owner's Dashboard."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCountedCashInput(String(cashRegister.actualCash));
                    setIsSubmitModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d2f987] text-[#172B08] border border-[#9CE034] text-xs font-black flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>+ {language === "sw" ? "Wasilisha Mahesabu ya Leo" : "Submit Today's Report"}</span>
                </button>
              </div>

              <div className="divide-y divide-[#EDF4E4] mt-2">
                {dailyReports.map((rep) => (
                  <div key={rep.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-[#162709]">{rep.submittedBy}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDF3E6] text-[#284112]">
                          {rep.staffRole}
                        </span>
                        <span className="text-[11px] text-[#647B58] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rep.submittedAt}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            rep.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {rep.status === "APPROVED"
                            ? `✓ IMEHAKIKIWA (${rep.approvedBy})`
                            : "⏳ INASUBIRI KUHAKIKIWA NA MWENYE DUKA"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                        <span>
                          Mauzo: <strong className="text-emerald-800">TZS {rep.totalSales.toLocaleString()}</strong> ({rep.totalUnitsSold} pcs)
                        </span>
                        <span>
                          Matumizi ya Siku: <strong className="text-rose-700">TZS {rep.totalExpenses.toLocaleString()}</strong>
                        </span>
                        <span>
                          Stock Iliyobaki Stoo:{" "}
                          <strong className="text-[#162709]">{rep.remainingStockSummary.totalUnitsInStore} pcs</strong>
                        </span>
                      </div>

                      {rep.notes && (
                        <p className="text-[11px] text-[#4C6240] italic bg-[#F8FAF5] px-2.5 py-1 rounded-lg border border-[#E4EFE0]">
                          &ldquo;{rep.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="px-3 py-1.5 rounded-xl bg-[#F3F7EC] hover:bg-[#E1FFAC] border border-[#C9DFB4] text-xs font-black text-[#1B300B] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === "sw" ? "Angalia Kila Kitu" : "View Full Details"}</span>
                      </button>

                      {rep.status !== "APPROVED" && (
                        <button
                          onClick={() => approveDailyReport(rep.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === "sw" ? "Idhinisha (Boss)" : "Approve"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: End-of-Day Shift Closeout Card */}
            <div className="w-full lg:w-80 p-4 rounded-2xl bg-white border-2 border-[#b5ea62] shadow-neu-card flex flex-col justify-between">
              <div className="space-y-3">
                <div className="pb-2 border-b border-[#dde8d2]">
                  <h4 className="font-black text-sm text-[#182d09]">Muhtasari wa Hesabu ya Leo</h4>
                  <p className="text-[11px] text-[#556b4b]">Hesabu ya sasa kabla ya kutuma kwa Mwenye Duka</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#506646]">
                    <span>Mauzo ya Cash:</span>
                    <span className="font-bold text-[#192f0b]">TZS {totalCashSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>Mauzo ya Simu (M-Pesa):</span>
                    <span className="font-bold text-[#192f0b]">TZS {totalMobileSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>Mauzo ya Mkopo (Madeni):</span>
                    <span className="font-bold text-amber-800">TZS {totalCreditSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>Matumizi ya Siku Hiyo:</span>
                    <span className="font-bold text-rose-700">-TZS {totalExpensesToday.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>Stock Iliyobaki Stoo:</span>
                    <span className="font-bold text-[#192f0b]">{totalUnitsRemainingInStore} pcs</span>
                  </div>
                  <div className="pt-2 border-t border-[#e2edd7] flex justify-between font-black text-sm text-[#152a08]">
                    <span>Jumla ya Mauzo Leo:</span>
                    <span className="text-emerald-800">TZS {totalSalesAll.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    setCountedCashInput(String(cashRegister.actualCash));
                    setIsSubmitModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl neu-btn text-xs font-black shadow-neu-flat uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Tuma Mahesabu kwa Mwenye Duka</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModalMode("DEPOSIT")}
                    className="py-2 rounded-xl bg-[#F4F8EC] border border-[#d2e4bb] text-[11px] font-bold text-[#273d19] hover:bg-[#E1FFAC]"
                  >
                    + Weka Cash
                  </button>
                  <button
                    onClick={() => setModalMode("WITHDRAW")}
                    className="py-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-800 hover:bg-rose-100"
                  >
                    - Toa Cash
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAMEUZA NINI LEO (PRODUCTS SOLD TODAY + REMAINING STOCK) */}
      {activeTab === "sold_products" && (
        <div className="bg-white rounded-2xl border border-[#D8E6CC] shadow-xs p-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EBF2E2] gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-[#162709] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#233f0d]" />
                <span>Orodha ya Bidhaa Walizouza Leo & Stock Iliyobaki Stoo</span>
              </h3>
              <p className="text-xs text-[#546949]">
                Inaonyesha kila bidhaa iliyouzwa leo, nani aliuza, kiasi kilichopatikana, na idadi iliyobaki stoo.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[#F4F8EE] px-3 py-1.5 rounded-xl border border-[#d4e6c1]">
              <span className="text-xs font-bold text-[#4a5e40]">
                Jumla Iliyouzwa: <strong className="text-[#162709]">{totalUnitsSold} pcs</strong>
              </span>
              <span className="text-[#cbd9be]">|</span>
              <span className="text-xs font-bold text-[#4a5e40]">
                Mapato: <strong className="text-emerald-800">TZS {totalSalesAll.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
              <thead className="text-[#516744] font-bold bg-[#F9FBF6]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Bidhaa Iliyouzwa</th>
                  <th className="py-3 px-4">Aliyeuza (Mfanyakazi)</th>
                  <th className="py-3 px-4 text-center">Idadi Iliyouzwa Leo</th>
                  <th className="py-3 px-4 text-right">Jumla ya Pesa</th>
                  <th className="py-3 px-4 text-right">Stock Iliyobaki Stoo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                {soldProductsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Hakuna bidhaa iliyouzwa bado kwa siku ya leo.
                    </td>
                  </tr>
                ) : (
                  soldProductsList.map((item, idx) => (
                    <tr key={item.name} className="hover:bg-[#F4F8EE]/60">
                      <td className="py-3 px-4 font-bold text-[#617855]">{idx + 1}</td>
                      <td className="py-3 px-4 font-extrabold text-[#162709]">{item.name}</td>
                      <td className="py-3 px-4 text-[#4B623F] font-semibold">{item.lastCashier}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-[#E1FFAC] text-[#182d09] font-black border border-[#aae056]">
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-800">
                        TZS {item.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-[#162709]">
                          {item.remainingInStore} {item.unit}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MATUMIZI YA SIKU HIYO (DAILY SHOP EXPENSES) */}
      {activeTab === "daily_expenses" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Quick Record Daily Expense Form for Staff */}
          <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
            <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-[#3A6112]" />
              <span>Rekodi Matumizi ya Siku Hiyo</span>
            </h3>
            <p className="text-[11px] text-[#5B714F] mb-3">
              Andika pesa iliyotumika dukani leo (mfano: chakula, bodaboda, umeme, mifuko). Itaonekana kwa Mwenye Duka moja kwa moja.
            </p>

            <form onSubmit={handleQuickExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">Aina ya Matumizi</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                >
                  <option value="Usafiri & Bodaboda">Usafiri & Bodaboda</option>
                  <option value="Chakula & Maji Dukani">Chakula & Maji Dukani</option>
                  <option value="Umeme (LUKU) & Maji">Umeme (LUKU) & Maji</option>
                  <option value="Vifungashio & Mifuko">Vifungashio & Mifuko</option>
                  <option value="Usafi & Ulinzi">Usafi & Ulinzi</option>
                  <option value="Mengineyo">Mengineyo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">Maelezo ya Matumizi</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Mfano: Nauli ya bodaboda kupeleka mzigo..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">Kiasi (TZS)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">Imelipwa kwa</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as "CASH" | "MPESA")}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  >
                    <option value="CASH">Cash ya Drooni</option>
                    <option value="MPESA">M-Pesa / Simu</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl neu-btn font-black text-xs">
                + Hifadhi Matumizi ya Leo
              </button>
            </form>
          </div>

          {/* Right: List of Today's Recorded Expenses */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBF2E2]">
              <div>
                <h3 className="font-black text-sm text-[#162709]">Orodha ya Matumizi ya Siku</h3>
                <p className="text-[11px] text-[#5B714F]">Matumizi yote yaliyorekodiwa dukani</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black">
                Jumla: TZS {totalExpensesToday.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
                <thead className="text-[#516744] font-bold bg-[#F9FBF6]">
                  <tr>
                    <th className="py-2.5 px-3">Tarehe</th>
                    <th className="py-2.5 px-3">Aina</th>
                    <th className="py-2.5 px-3">Maelezo</th>
                    <th className="py-2.5 px-3">Malipo</th>
                    <th className="py-2.5 px-3 text-right">Kiasi (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#F9FBF6]">
                      <td className="py-2.5 px-3 font-mono text-[11px]">{exp.date}</td>
                      <td className="py-2.5 px-3 font-bold">{exp.category}</td>
                      <td className="py-2.5 px-3 text-[#4C6240]">{exp.description || exp.title}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#EDF3E6] font-bold text-[10px]">
                          {exp.paymentMethod || "CASH"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-700">
                        TZS {exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK ILIYobaki STOO & KUINGIZA STOCK (REMAINING STORE STOCK & QUICK STOCK IN) */}
      {activeTab === "remaining_stock" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Quick Stock IN Form for Staff */}
          <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
            <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
              <span>Ingiza Stock Mpya Stoo (Stock IN)</span>
            </h3>
            <p className="text-[11px] text-[#5B714F] mb-3">
              Ukiletewa mzigo mpya dukani, uingize hapa ili uongezeke kwenye stoo na Mwenye Duka aone mzigo ulioingia.
            </p>

            <form onSubmit={handleQuickStockIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">Chagua Bidhaa</label>
                <select
                  value={stockProdId}
                  onChange={(e) => setStockProdId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Iliyobaki: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">Idadi Iliyoingia (Pcs/Units)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder="Mfano: 24"
                  className="w-full py-2 px-3 rounded-xl neu-input font-black"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">Maelezo / Msambazaji</label>
                <input
                  type="text"
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="Mfano: Katoni 2 kutoka Kariakoo..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl neu-btn font-black text-xs">
                + Ongeza Kwenye Stoo Sasa
              </button>
            </form>
          </div>

          {/* Right: Remaining Stock Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
              <div>
                <h3 className="font-black text-sm text-[#162709]">
                  Hesabu ya Stock Iliyobaki Stoo Sasa Hivi
                </h3>
                <p className="text-[11px] text-[#5B714F]">
                  Idadi kamili ya kila bidhaa iliyobaki dukani baada ya mauzo ya leo
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#F4F8EC] border border-[#C8DFB0] text-[#172B08] text-xs font-black">
                  Jumla Iliyobaki: {totalUnitsRemainingInStore} pcs
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
                <thead className="text-[#516744] font-bold bg-[#F9FBF6]">
                  <tr>
                    <th className="py-2.5 px-3">Bidhaa</th>
                    <th className="py-2.5 px-3">Kundi</th>
                    <th className="py-2.5 px-3 text-right">Bei ya Kuuza</th>
                    <th className="py-2.5 px-3 text-center">Stock Iliyobaki Stoo</th>
                    <th className="py-2.5 px-3 text-right">Hali ya Stoo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                  {products.map((p) => {
                    const isLow = p.stockQuantity <= p.minStock;
                    return (
                      <tr key={p.id} className="hover:bg-[#F9FBF6]">
                        <td className="py-2.5 px-3 font-extrabold text-[#162709]">{p.name}</td>
                        <td className="py-2.5 px-3 text-[#526846]">{p.category}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          TZS {p.sellingPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-black text-sm text-[#162709]">
                            {p.stockQuantity} {p.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isLow
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            }`}
                          >
                            {isLow ? "⚠ INAISHA STOO" : "✓ IPO YA KUTOSHA"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT DAILY SHIFT REPORT TO OWNER */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EFE0] pb-3">
              <div>
                <h3 className="text-base font-black text-[#162709]">
                  📤 Tuma Mahesabu ya Siku kwa Mwenye Duka
                </h3>
                <p className="text-xs text-[#556B4B]">
                  Inajumuisha: Walichouza leo, Matumizi ya siku hiyo, na Stock iliyobaki stoo.
                </p>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 bg-[#F6FAF0] p-3 rounded-2xl border border-[#D4E6C0] text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#5A704E] block">1. Mauzo ya Leo</span>
                <strong className="text-sm font-black text-emerald-800">
                  TZS {totalSalesAll.toLocaleString()}
                </strong>
                <span className="block text-[10px] text-[#5A704E]">{totalUnitsSold} pcs zimeuzwa</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5A704E] block">2. Matumizi ya Leo</span>
                <strong className="text-sm font-black text-rose-700">
                  TZS {totalExpensesToday.toLocaleString()}
                </strong>
                <span className="block text-[10px] text-[#5A704E]">{expenses.length} rekodi</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5A704E] block">3. Stock Iliyobaki</span>
                <strong className="text-sm font-black text-[#162709]">
                  {totalUnitsRemainingInStore} pcs
                </strong>
                <span className="block text-[10px] text-amber-800">{lowStockItems.length} zinaisha</span>
              </div>
            </div>

            <form onSubmit={handleConfirmSubmitReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2F4620] mb-1">
                  Pesa Taslimu (Cash) Uliyohesabu Drooni Sasa Hivi (TZS)
                </label>
                <input
                  type="number"
                  required
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl neu-input font-black text-base"
                />
                <span className="text-[10px] text-[#5F7553] mt-0.5 block">
                  Pesa inayotakiwa kuwepo drooni (Expected): TZS {expectedCash.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#2F4620] mb-1">
                  Maelezo / Ujumbe kwa Mwenye Duka (Hiari)
                </label>
                <textarea
                  rows={2}
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Mfano: Mauzo yameenda vizuri, Nivea na Garnier zimebaki chache stoo..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1C320A] hover:bg-[#28470E] text-[#E1FFAC] font-black flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Wasilisha kwa Mwenye Duka</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW FULL SUBMITTED REPORT DETAILS (FOR OWNER & STAFF) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EFE0] pb-3">
              <div>
                <h3 className="text-base font-black text-[#162709]">
                  📋 Ripoti Kamili ya Siku — {selectedReport.submittedBy} ({selectedReport.staffRole})
                </h3>
                <p className="text-xs text-[#556B4B]">
                  Tarehe: {selectedReport.submittedAt} • Tawi: {selectedReport.branchName}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Walichouza Leo */}
            <div className="p-3.5 rounded-2xl bg-[#F8FBF4] border border-[#D8E6CC] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#162709] uppercase">
                  1. Walichouza Leo ({selectedReport.totalUnitsSold} pcs)
                </h4>
                <span className="text-xs font-black text-emerald-800">
                  Jumla: TZS {selectedReport.totalSales.toLocaleString()}
                </span>
              </div>
              <div className="divide-y divide-[#E6EFE0] text-xs">
                {selectedReport.soldItems.map((it, i) => (
                  <div key={i} className="py-1.5 flex justify-between">
                    <span className="font-bold text-[#1B2F0C]">
                      {it.name} × {it.quantity}
                    </span>
                    <span className="font-black text-emerald-800">TZS {it.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Matumizi ya Siku Hiyo */}
            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-rose-900 uppercase">
                  2. Matumizi ya Siku Hiyo ({selectedReport.dailyExpenses.length})
                </h4>
                <span className="text-xs font-black text-rose-800">
                  Jumla: TZS {selectedReport.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="divide-y divide-rose-100 text-xs">
                {selectedReport.dailyExpenses.map((ex, i) => (
                  <div key={i} className="py-1.5 flex justify-between">
                    <span>
                      <strong>{ex.category}:</strong> {ex.description} ({ex.paymentMethod})
                    </span>
                    <span className="font-black text-rose-800">TZS {ex.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Stock Iliyobaki Stoo */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#162709] uppercase">
                  3. Stock Iliyobaki Stoo ({selectedReport.remainingStockSummary.totalUnitsInStore} pcs)
                </h4>
                <span className="text-xs font-bold text-amber-800">
                  {selectedReport.remainingStockSummary.lowStockCount} bidhaa zinakaribia kuisha
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {selectedReport.remainingStockSummary.stockSnapshot.map((st) => (
                  <div
                    key={st.id}
                    className="p-2 rounded-xl bg-[#F7FAF3] border border-[#E1ECD6] flex items-center justify-between"
                  >
                    <span className="font-bold text-[#182B0A] truncate pr-2">{st.name}</span>
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

            <div className="flex justify-end gap-2 pt-2">
              {selectedReport.status !== "APPROVED" && (
                <button
                  onClick={() => {
                    approveDailyReport(selectedReport.id);
                    setSelectedReport({ ...selectedReport, status: "APPROVED", approvedBy: user?.name || "Owner" });
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Idhinisha Mahesabu Haya (Boss)</span>
                </button>
              )}
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl neu-btn-secondary text-xs font-bold"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEPOSIT / WITHDRAW / COUNT */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-1">
              {modalMode === "DEPOSIT" && "Ongeza Pesa Kwenye Droo (Cash Float In)"}
              {modalMode === "WITHDRAW" && "Toa Pesa Kwenye Droo (Cash Drop Out)"}
              {modalMode === "COUNT" && "Weka Pesa Halisi Iliyohesabiwa Mkononi"}
            </h3>
            <form onSubmit={handleDepositOrWithdraw} className="space-y-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-[#354b28] mb-1">Kiasi cha Pesa (TZS)</label>
                <input
                  type="number"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Mfano: 150000"
                  className="w-full py-2.5 px-3.5 rounded-xl neu-input text-base font-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary text-xs font-bold"
                >
                  Ghairi
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl neu-btn text-xs font-black">
                  Thibitisha Hesabu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
