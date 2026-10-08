"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  History,
  DollarSign,
  PlusCircle,
  MinusCircle,
  FileText,
  Printer,
  Package,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  MessageCircle
} from "lucide-react";

export const CashRegisterModule: React.FC = () => {
  const { cashRegister, updateCashRegister, currentBranch, sales, language, t } = useApp();
  const [activeTab, setActiveTab] = useState<"cash" | "sold_products">("cash");
  const [amountInput, setAmountInput] = useState("");
  const [modalMode, setModalMode] = useState<"DEPOSIT" | "WITHDRAW" | "COUNT" | null>(null);

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

  // Financial Breakdown by Payment Method
  const totalSalesAll = sales.reduce((a, b) => a + b.total, 0);
  const totalCashSales = sales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((a, b) => a + b.total, 0);
  const totalMobileSales = sales
    .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
    .reduce((a, b) => a + b.total, 0);
  const totalCreditSales = sales
    .filter((s) => s.paymentMethod === "CREDIT")
    .reduce((a, b) => a + b.total, 0);

  const expectedCash =
    cashRegister.openingBalance +
    (totalCashSales > 0 ? totalCashSales : cashRegister.cashSales) +
    cashRegister.cashDeposits -
    cashRegister.cashExpenses -
    cashRegister.cashWithdrawals;

  const variance = cashRegister.actualCash - expectedCash;

  // Breakdown of all Products Sold Today
  const soldProductsMap: { [name: string]: { name: string; quantity: number; revenue: number } } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!soldProductsMap[item.productName]) {
        soldProductsMap[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      soldProductsMap[item.productName].quantity += item.quantity;
      soldProductsMap[item.productName].revenue += item.total;
    });
  });
  const soldProductsList = Object.values(soldProductsMap).sort((a, b) => b.quantity - a.quantity);
  const totalUnitsSold = soldProductsList.reduce((a, b) => a + b.quantity, 0);

  const zReportMessage = `*TRADEPOS: HESABU YA MAUZO YA LEO*\nTarehe: ${new Date().toLocaleDateString()}\nTawi: ${currentBranch?.name || "Kariakoo"}\n\nJumla ya Mauzo: TZS ${totalSalesAll.toLocaleString()}\n- Mauzo ya Cash: TZS ${totalCashSales.toLocaleString()}\n- Mauzo ya Simu (M-Pesa/Airtel): TZS ${totalMobileSales.toLocaleString()}\n- Madeni (Credit): TZS ${totalCreditSales.toLocaleString()}\n\nJumla ya Vitu Vilivyouzwa: ${totalUnitsSold} pcs\nPesa ya Kuanzia Asubuhi (Float): TZS ${cashRegister.openingBalance.toLocaleString()}\nPesa Inayotakiwa Drooni: TZS ${expectedCash.toLocaleString()}\nPesa Iliyohesabiwa: TZS ${cashRegister.actualCash.toLocaleString()}\nTofauti (Variance): TZS ${variance.toLocaleString()}`;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden gap-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight flex items-center gap-2">
            <span>{language === "sw" ? "Hesabu ya Siku, Droo ya Pesa & Mauzo" : "Daily Register, Cash Drawer & Reconciliation"}</span>
          </h2>
          <p className="text-xs text-[#526848]">
            {language === "sw"
              ? "Kagua hesabu kamili ya mauzo ya siku, orodha ya bidhaa zilizouzwa, na linganisha pesa ya drooni na mfumo."
              : "Reconcile daily sales, review products sold, and balance cash drawer against recorded sales."}
          </p>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#EEF4E5] rounded-xl border border-[#d2e4bb] gap-1">
            <button
              onClick={() => setActiveTab("cash")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
                activeTab === "cash"
                  ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
                  : "text-[#536749] hover:text-[#182c0b]"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{language === "sw" ? "1. Hesabu ya Droo (Cash)" : "1. Cash Drawer"}</span>
            </button>
            <button
              onClick={() => setActiveTab("sold_products")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
                activeTab === "sold_products"
                  ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
                  : "text-[#536749] hover:text-[#182c0b]"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{language === "sw" ? `2. Bidhaa Zilizouzwa Leo (${soldProductsList.length})` : `2. Products Sold Today (${soldProductsList.length})`}</span>
            </button>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(zReportMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{language === "sw" ? "Tuma Ripoti WhatsApp" : "Send WhatsApp Report"}</span>
          </a>
        </div>
      </div>

      {/* Register Vital Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "Pesa ya Mwanzo (Float)" : "Opening Morning Float"}
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {cashRegister.openingBalance.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#69825B]">
            {language === "sw" ? "Pesa iliyoanza asubuhi" : "Morning opening balance"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "Mauzo ya Cash Leo" : "Cash Sales Today"}
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            +TZS {totalCashSales.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {language === "sw" ? "Noti na sarafu za dukani" : "Banknotes and coins collected"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "Pesa ya Mfumo (Expected)" : "Expected in Drawer"}
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {expectedCash.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#69825B]">
            {language === "sw" ? "Float + Mauzo - Matumizi" : "Float + Sales - Expenses"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "Pesa Halisi ya Drooni" : "Actual Cash Counted"}
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {cashRegister.actualCash.toLocaleString()}
          </p>
          <span
            className={`text-[10px] font-black ${
              variance === 0 ? "text-emerald-700" : variance > 0 ? "text-emerald-800" : "text-rose-700"
            }`}
          >
            {variance === 0
              ? (language === "sw" ? "✓ Hesabu Imetimia Sawia" : "✓ 100% Balanced")
              : `${language === "sw" ? "Tofauti: TZS " : "Variance: TZS "} ${variance.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* TAB 1: CASH RECONCILIATION & ACTION BUTTONS */}
      {activeTab === "cash" ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Left: Transactions History Table */}
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBF2E2]">
              <h3 className="font-extrabold text-sm text-[#162709]">Miamala ya Pesa Taslimu ya Leo</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalMode("DEPOSIT")}
                  className="px-2.5 py-1 rounded-lg bg-[#F4F8EC] border border-[#d2e4bb] text-xs font-bold text-[#273d19] hover:bg-[#E1FFAC]"
                >
                  + Weka Pesa (Deposit)
                </button>
                <button
                  onClick={() => setModalMode("WITHDRAW")}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 hover:bg-rose-100"
                >
                  - Toa Pesa (Cash Drop)
                </button>
              </div>
            </div>

            <table className="w-full text-left text-xs divide-y divide-[#EBF2E2] mt-3">
              <thead className="text-[#516744] font-bold">
                <tr>
                  <th className="py-2.5">Saa</th>
                  <th className="py-2.5">Aina ya Muamala</th>
                  <th className="py-2.5">Msimamizi</th>
                  <th className="py-2.5">Kiasi</th>
                  <th className="py-2.5 text-right">Hali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                <tr>
                  <td className="py-2.5">08:00 AM</td>
                  <td className="py-2.5 font-bold">Pesa ya Kuanzia (Opening Float)</td>
                  <td className="py-2.5 text-[#516744]">Peter Joseph</td>
                  <td className="py-2.5 font-bold">TZS {cashRegister.openingBalance.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-emerald-800 font-bold">Imethibitishwa</td>
                </tr>
                {sales
                  .filter((s) => s.paymentMethod === "CASH")
                  .slice(0, 10)
                  .map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 font-mono text-[11px]">
                        {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2.5 font-bold text-emerald-800">Mauzo ya Cash {s.saleNumber}</td>
                      <td className="py-2.5 text-[#516744]">{s.cashierName}</td>
                      <td className="py-2.5 font-bold text-emerald-800">+TZS {s.total.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-[#556b49]">Kwenye Droo</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Right: End-of-Day Shift Closeout Card */}
          <div className="w-full lg:w-80 p-4 rounded-2xl bg-white border-2 border-[#b5ea62] shadow-neu-card flex flex-col justify-between">
            <div className="space-y-3">
              <div className="pb-2 border-b border-[#dde8d2]">
                <h4 className="font-black text-sm text-[#182d09]">Funga Hesabu ya Siku (Z-Report)</h4>
                <p className="text-[11px] text-[#556b4b]">Hesabu pesa mkononi kabla ya kufunga duka</p>
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
                  <span>Mauzo ya Madeni:</span>
                  <span className="font-bold text-rose-700">TZS {totalCreditSales.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-[#e2edd7] flex justify-between font-black text-sm text-[#152a08]">
                  <span>Jumla ya Mauzo Leo:</span>
                  <span className="text-emerald-800">TZS {totalSalesAll.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={() => setModalMode("COUNT")}
                className="w-full py-3 rounded-xl neu-btn text-xs font-black shadow-neu-flat uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hesabu Pesa & Funga Siku</span>
              </button>
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl neu-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Chapisha Ripoti ya Z-Report</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: DAILY SOLD PRODUCTS BREAKDOWN */
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs p-4 flex flex-col">
          <div className="pb-3 border-b border-[#EBF2E2] flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#162709]">
                Orodha ya Bidhaa Zote Zilizouzwa Leo ({totalUnitsSold} Pcs)
              </h3>
              <p className="text-xs text-[#526649]">
                Inaonyesha kila bidhaa, idadi iliyotoka stoo leo, na thamani ya pesa iliyoingiza.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#E1FFAC] text-xs font-black text-[#1b3109]">
              Jumla ya Thamani: TZS {totalSalesAll.toLocaleString()}
            </div>
          </div>

          <table className="w-full text-left text-xs divide-y divide-[#EBF2E2] mt-3">
            <thead className="bg-[#F8FAF4] text-[#516744] font-bold sticky top-0">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Jina la Bidhaa</th>
                <th className="py-2.5 px-3">Idadi Iliyouzwa (Units)</th>
                <th className="py-2.5 px-3">Jumla ya Mauzo (TZS)</th>
                <th className="py-2.5 px-3 text-right">Mchango wa Mauzo %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
              {soldProductsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#698061]">
                    Hakuna bidhaa iliyouzwa leo bado.
                  </td>
                </tr>
              ) : (
                soldProductsList.map((p, idx) => {
                  const share = totalSalesAll > 0 ? Math.round((p.revenue / totalSalesAll) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-[#F9FCF5]">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#698061]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-black text-[#152a09]">{p.name}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-800">
                        {p.quantity} pcs
                      </td>
                      <td className="py-2.5 px-3 font-black">
                        TZS {p.revenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#455d3a]">
                        {share}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP ACTION MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-3">
              {modalMode === "DEPOSIT"
                ? "Deposit Drawer Cash"
                : modalMode === "WITHDRAW"
                ? "Cash Drop / Withdrawal"
                : "Record End-of-Day Physical Cash"}
            </h3>
            <form onSubmit={handleDepositOrWithdraw} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Amount (TZS)</label>
                <input
                  type="number"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full py-2.5 px-3.5 rounded-xl neu-input text-sm font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
