"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  PlusCircle,
  Search,
  RotateCcw,
  Calculator,
  Send,
  CheckCircle2,
  Calendar,
  History
} from "lucide-react";

type PeriodFilter = "TODAY" | "YESTERDAY" | "WEEK_1" | "WEEK_2" | "ALL" | "CUSTOM";

export const SalesLedgerModule: React.FC = () => {
  const {
    user,
    sales,
    expenses,
    processSale,
    refundSale,
    products,
    addProduct,
    currentBranch,
    language,
    closeDayAndSendToBoss,
    startNewDay,
    isDayClosed,
    activeDayLabel,
  } = useApp();

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("TODAY");
  const [customDate, setCustomDate] = useState<string>(activeDayLabel);

  // Direct Sale Entry Form State (Employee or Owner types today's sale directly)
  const [prodName, setProdName] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA" | "CREDIT">("CASH");
  const [customerName, setCustomerName] = useState("");
  const [justClosedReport, setJustClosedReport] = useState<boolean>(false);

  const isOwner = !user || user.role === "OWNER" || user.role === "SUPER_ADMIN";

  // Helper to get YYYY-MM-DD for N days ago relative to activeDayLabel
  const getDateDaysAgo = (daysAgo: number) => {
    const base = new Date(activeDayLabel || new Date().toISOString().split("T")[0]);
    base.setDate(base.getDate() - daysAgo);
    return base.toISOString().split("T")[0];
  };

  const todayStr = activeDayLabel;
  const yesterdayStr = getDateDaysAgo(1);
  const week1CutoffStr = getDateDaysAgo(7);
  const week2CutoffStr = getDateDaysAgo(14);

  // Filter sales by the selected Period (Leo, Jana, Wiki 1 Nyuma, Wiki 2 Nyuma, Zote, au Tarehe Maalum)
  const matchesSelectedPeriod = (saleCreatedAt: string) => {
    const saleDate = (saleCreatedAt || "").split("T")[0];
    if (periodFilter === "TODAY") return saleDate === todayStr;
    if (periodFilter === "YESTERDAY") return saleDate === yesterdayStr;
    if (periodFilter === "WEEK_1") return saleDate >= week1CutoffStr && saleDate <= todayStr;
    if (periodFilter === "WEEK_2") return saleDate >= week2CutoffStr && saleDate <= todayStr;
    if (periodFilter === "CUSTOM") return saleDate === customDate;
    return true; // "ALL"
  };

  const getPeriodLabel = () => {
    if (periodFilter === "TODAY") return `Leo (${todayStr})`;
    if (periodFilter === "YESTERDAY") return `Jana (${yesterdayStr})`;
    if (periodFilter === "WEEK_1") return `Wiki 1 Nyuma (Siku 7: ${week1CutoffStr} → ${todayStr})`;
    if (periodFilter === "WEEK_2") return `Wiki 2 Nyuma (Siku 14: ${week2CutoffStr} → ${todayStr})`;
    if (periodFilter === "CUSTOM") return `Tarehe: ${customDate}`;
    return "Historia Yote ya Mauzo";
  };

  // Automatic calculation preview for current form input
  const parsedQty = parseInt(qty) || 0;
  const matchedProduct = products.find(
    (p) => p.name.toLowerCase() === prodName.trim().toLowerCase()
  );
  const parsedUnitPrice =
    parseFloat(unitPrice) || (matchedProduct ? matchedProduct.sellingPrice : 0);
  const autoLineTotal = parsedQty * parsedUnitPrice;

  // Automatic System Calculations across valid sales in the selected period
  const periodValidSales = sales.filter(
    (s) => s.status !== "REFUNDED" && matchesSelectedPeriod(s.createdAt)
  );
  const totalSalesAmount = periodValidSales.reduce((acc, s) => acc + s.total, 0);
  const totalCashSales = periodValidSales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((acc, s) => acc + s.total, 0);
  const totalMobileSales = periodValidSales
    .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
    .reduce((acc, s) => acc + s.total, 0);
  const totalCreditSales = periodValidSales
    .filter((s) => s.paymentMethod === "CREDIT")
    .reduce((acc, s) => acc + s.total, 0);

  const totalUnitsSold = periodValidSales.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );

  // Today's totals for the End-of-Day banner
  const todaySalesTotal = sales
    .filter((s) => s.status !== "REFUNDED" && s.createdAt.startsWith(todayStr))
    .reduce((acc, s) => acc + s.total, 0);
  const todayExpensesTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);
  const totalStoreStockRemaining = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  const filteredSales = periodValidSales.filter((s) => {
    const itemsText = s.items.map((i) => i.productName).join(" ").toLowerCase();
    const matchesSearch =
      itemsText.includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      s.cashierName.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "ALL" || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = prodName.trim();
    if (!cleanName || parsedQty <= 0 || parsedUnitPrice <= 0) return;

    let targetProdId = matchedProduct?.id || `prod-auto-${Date.now()}`;
    let targetProdName = matchedProduct?.name || cleanName;

    if (!matchedProduct) {
      const created = addProduct({
        name: cleanName,
        sku: `AUTO-${Date.now().toString().slice(-4)}`,
        barcode: "",
        category: "Bidhaa za Dukani",
        brand: "General",
        buyingPrice: Math.round(parsedUnitPrice * 0.7),
        sellingPrice: parsedUnitPrice,
        wholesalePrice: parsedUnitPrice,
        stockQuantity: Math.max(20, parsedQty),
        minStock: 5,
        maxStock: 500,
        unit: "Pcs",
        branchId: currentBranch?.id || "br-01",
      });
      if (created) {
        targetProdId = created.id;
        targetProdName = created.name;
      }
    }

    const total = parsedQty * parsedUnitPrice;
    processSale({
      branchId: currentBranch?.id || "br-01",
      items: [
        {
          productId: targetProdId,
          productName: targetProdName,
          quantity: parsedQty,
          price: parsedUnitPrice,
          total,
        },
      ],
      subtotal: total,
      tax: 0,
      discount: 0,
      total,
      paidAmount: paymentMethod === "CREDIT" ? 0 : total,
      balance: paymentMethod === "CREDIT" ? total : 0,
      paymentMethod,
      customerName:
        customerName.trim() ||
        (paymentMethod === "CREDIT" ? "Mteja wa Mkopo" : "Mteja wa Dukani"),
      cashierName: user?.name || "Baraka Mushi",
      status: "COMPLETED",
    });

    setProdName("");
    setQty("1");
    setUnitPrice("");
    setCustomerName("");
    setPeriodFilter("TODAY");
    setJustClosedReport(false);
  };

  const handleCloseDaySales = () => {
    closeDayAndSendToBoss();
    setJustClosedReport(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Datalist for optional autocomplete while typing product name */}
      <datalist id="sales-products-datalist">
        {products.map((p) => (
          <option key={p.id} value={p.name}>
            Bei: TZS {p.sellingPrice.toLocaleString()} | Stoo: {p.stockQuantity} {p.unit}
          </option>
        ))}
      </datalist>

      {/* Top Header + "Funga Mauzo ya Siku" Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-[#162709] tracking-tight">
              {language === "sw"
                ? isOwner
                  ? "2. Mauzo ya Siku & Historia (Leo, Jana & Wiki 2 Nyuma)"
                  : "1. Mauzo ya Leo & Historia (Angalia Leo, Jana au Wiki 2 Nyuma)"
                : "Daily Sales & History (Today, Yesterday & 2 Weeks Ago)"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E1FFAC] text-[#172B08] border border-[#9CE034] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{getPeriodLabel()}</span>
            </span>
          </div>
          <p className="text-xs text-[#526848] mt-0.5">
            {language === "sw"
              ? "Mwenye Duka na Mfanyakazi wanaweza kuona mauzo ya Leo, Jana, Wiki 1 Nyuma au Wiki 2 Nyuma kwa kubonyeza vitufe vya muda hapa chini."
              : "Both Shop Owner and Employee can view sales from Today, Yesterday, 1 Week Ago, or 2 Weeks Ago using the filter buttons below."}
          </p>
        </div>

        {/* Prominent "Funga Mauzo ya Siku" Button */}
        <div className="flex items-center gap-2 shrink-0">
          {!isDayClosed ? (
            <button
              onClick={handleCloseDaySales}
              className="px-4 py-2.5 rounded-xl bg-[#1B2F09] hover:bg-[#27430D] text-[#E1FFAC] border-2 border-[#A6DF52] text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Funga Mauzo ya Siku (Tuma kwa Boss Auto)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                startNewDay();
                setPeriodFilter("TODAY");
                setJustClosedReport(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Fungua Siku Mpya (Anza Siku Mpya 0)</span>
            </button>
          )}
        </div>
      </div>

      {/* PERIOD / HISTORY SELECTOR BAR (LEO, JANA, WIKI 1 NYUMA, WIKI 2 NYUMA, TAREHE MAALUM) */}
      <div className="p-3 rounded-2xl bg-white border-2 border-[#C2E880] shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-black text-[#162709] flex items-center gap-1 mr-1">
            <History className="w-4 h-4 text-[#3A6112]" />
            <span>Chagua Muda wa Mauzo:</span>
          </span>

          {(
            [
              { id: "TODAY", label: "Mauzo ya Leo" },
              { id: "YESTERDAY", label: "Mauzo ya Jana" },
              { id: "WEEK_1", label: "Wiki 1 Nyuma (Siku 7)" },
              { id: "WEEK_2", label: "Wiki 2 Nyuma (Siku 14)" },
              { id: "ALL", label: "Historia Yote" },
            ] as { id: PeriodFilter; label: string }[]
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriodFilter(btn.id)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                periodFilter === btn.id
                  ? "bg-[#1B2F09] text-[#E1FFAC] border border-[#8ECE28] shadow-xs"
                  : "bg-[#F4F7EE] hover:bg-[#E1FFAC]/60 text-[#2C421C] border border-[#D8E6CC]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Specific Date Picker */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#4D6340] text-[11px]">Au Chagua Tarehe:</span>
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setPeriodFilter("CUSTOM");
            }}
            className="py-1 px-2.5 rounded-xl neu-input font-bold text-xs cursor-pointer"
          />
        </div>
      </div>

      {/* BANNER WHEN "FUNGA MAUZO YA SIKU" IS CLICKED (DAY ENDED & SENT TO BOSS AUTOMATICALLY) */}
      {(isDayClosed || justClosedReport) && (
        <div className="p-4 rounded-2xl bg-emerald-950 text-[#E1FFAC] border-2 border-[#A6DF52] flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-md">
          <div className="space-y-1">
            <div className="font-black text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#A6DF52]" />
              <span>
                SIKU IMEFUNGWA ({todayStr}) — HESABU IMETUMWA KWA BOSS AUTOMATICALLY!
              </span>
            </div>
            <p className="text-emerald-100/90">
              Muhtasari uliotumwa kwa Mwenye Duka: <strong>Mauzo ya Leo: TZS {todaySalesTotal.toLocaleString()}</strong> |{" "}
              <strong>Matumizi ya Leo: TZS {todayExpensesTotal.toLocaleString()}</strong> |{" "}
              <strong>Stoo Iliyobaki: {totalStoreStockRemaining} pcs</strong>. Ukianzisha siku mpya, mauzo haya yatahifadhiwa kwenye <strong>Mauzo ya Jana</strong>.
            </p>
          </div>
          <button
            onClick={() => {
              startNewDay();
              setPeriodFilter("TODAY");
              setJustClosedReport(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#E1FFAC] text-[#162708] font-black text-xs shrink-0 hover:bg-white transition cursor-pointer"
          >
            Anza Siku Mpya (Leo Ianze 0, Haya Yaende Jana)
          </button>
        </div>
      )}

      {/* 4 AUTOMATIC CALCULATION SUMMARY CARDS (UPDATES FOR LEO, JANA, OR 2 WEEKS AGO) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-[#b2e269] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Jumla ya Mauzo ({periodFilter === "TODAY" ? "Leo" : periodFilter === "YESTERDAY" ? "Jana" : periodFilter === "WEEK_1" ? "Wiki 1" : periodFilter === "WEEK_2" ? "Wiki 2" : "Muda Huu"})
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {totalSalesAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            Vipande {totalUnitsSold} vimeuzwa ({periodValidSales.length} mauzo)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Cash (Taslimu)
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {totalCashSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#69825B] font-bold">
            Pesa taslimu kwa kipindi kilichochaguliwa
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Simu (M-Pesa / Airtel)
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {totalMobileSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#69825B] font-bold">
            Malipo ya Lipa Namba / Simu
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Mkopo (Madeni)
          </span>
          <p className="text-xl font-black text-amber-700 mt-0.5">
            TZS {totalCreditSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-800 font-bold">
            Inaingia kwenye Wateja & Madeni auto
          </span>
        </div>
      </div>

      {/* MAIN WORKSPACE: LEFT = ENTER TODAY'S SALES | RIGHT = LIVE & HISTORICAL SALES TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left: Enter Today's Sales Form */}
        <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
          <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#3A6112]" />
            <span>Andika Mauzo ya Leo (Manual)</span>
          </h3>
          <p className="text-[11px] text-[#5B714F] mb-3">
            Andika jina la bidhaa uliyouza na idadi yake. Mfumo unakupigia hesabu ya jumla na kupunguza stoo moja kwa moja.
          </p>

          <form onSubmit={handleRecordSale} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Andika Jina la Bidhaa Iliyouzwa:
              </label>
              <input
                type="text"
                list="sales-products-datalist"
                required
                value={prodName}
                onChange={(e) => {
                  const val = e.target.value;
                  setProdName(val);
                  const found = products.find(
                    (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                  );
                  if (found) {
                    setUnitPrice(String(found.sellingPrice));
                  }
                }}
                placeholder="Mfano: Nivea Body Milk au Viatu..."
                className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
              />
              {matchedProduct && (
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                  ✓ Ipo stoo: {matchedProduct.stockQuantity} {matchedProduct.unit} | Bei: TZS{" "}
                  {matchedProduct.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Idadi Iliyouzwa
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="1"
                  className="w-full py-2 px-3 rounded-xl neu-input font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Bei ya Kila Moja (TZS)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="15000"
                  className="w-full py-2 px-3 rounded-xl neu-input font-black text-sm"
                />
              </div>
            </div>

            {/* Automatic Calculation Box */}
            <div className="p-3 rounded-xl bg-[#F4F8EC] border border-[#C6DDA8] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#273E14] font-bold">
                <Calculator className="w-4 h-4 text-[#3F6315]" />
                <span>Jumla (Auto Hesabu):</span>
              </div>
              <span className="text-base font-black text-emerald-800">
                TZS {autoLineTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">Njia ya Malipo</label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "CASH" | "MPESA" | "CREDIT")
                  }
                  className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                >
                  <option value="CASH">Cash (Taslimu)</option>
                  <option value="MPESA">M-Pesa / Simu</option>
                  <option value="CREDIT">Mkopo (Deni la Mteja)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Jina la Mteja {paymentMethod === "CREDIT" ? "(Muhimu)" : "(Hiari)"}
                </label>
                <input
                  type="text"
                  required={paymentMethod === "CREDIT"}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jina la mteja..."
                  className="w-full py-2 px-3 rounded-xl neu-input font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl neu-btn font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              + Hifadhi Mauzo ya Leo
            </button>
          </form>
        </div>

        {/* Right: Live & Historical Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] p-4 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
            <div>
              <h3 className="font-black text-sm text-[#162709] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#233F0D]" />
                <span>Orodha ya Mauzo — {getPeriodLabel()}</span>
              </h3>
              <p className="text-[11px] text-[#546949]">
                Inaonyesha mauzo yote ya muda uliouchagua pamoja na tarehe, aliyeuza na jumla.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#657C58]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tafuta bidhaa au mteja..."
                  className="py-1.5 pl-8 pr-3 rounded-xl neu-input text-xs"
                />
              </div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-xl neu-input text-xs font-bold"
              >
                <option value="ALL">Malipo Yote</option>
                <option value="CASH">Cash</option>
                <option value="MPESA">M-Pesa</option>
                <option value="CREDIT">Mkopo</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto mt-3 flex-1">
            <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
              <thead className="bg-[#F8FAF4] font-bold text-[#4D6340]">
                <tr>
                  <th className="py-2.5 px-3">Tarehe</th>
                  <th className="py-2.5 px-3">Bidhaa Iliyouzwa</th>
                  <th className="py-2.5 px-3 text-center">Idadi</th>
                  <th className="py-2.5 px-3">Mteja</th>
                  <th className="py-2.5 px-3">Aliyeuza</th>
                  <th className="py-2.5 px-3">Malipo</th>
                  <th className="py-2.5 px-3 text-right">Jumla (TZS)</th>
                  <th className="py-2.5 px-3 text-right">Hatua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Hakuna mauzo yaliyoandikwa kwa muda huu ({getPeriodLabel()}). Bonyeza &apos;Mauzo ya Jana&apos; au &apos;Wiki 2 Nyuma&apos; kuona historia au andika mauzo ya leo kushoto.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => {
                    const totalQty = s.items.reduce((sum, i) => sum + i.quantity, 0);
                    const saleDate = (s.createdAt || "").split("T")[0];
                    const isSaleToday = saleDate === todayStr;
                    const isSaleYesterday = saleDate === yesterdayStr;
                    return (
                      <tr key={s.id} className="hover:bg-[#F9FBF6] transition">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-[11px] text-[#2B4218] block">
                            {saleDate}
                          </span>
                          <span className="text-[10px] font-bold text-[#617A54]">
                            {isSaleToday ? "Leo" : isSaleYesterday ? "Jana" : "Historia"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-[#162709]">
                          {s.items.map((i) => `${i.productName} (×${i.quantity})`).join(", ")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#E1FFAC] text-[#182D09] font-black border border-[#aae056]">
                            {totalQty} pcs
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold">
                          {s.customerName || "Mteja wa Dukani"}
                        </td>
                        <td className="py-3 px-3 text-[#48603C]">{s.cashierName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              s.paymentMethod === "CREDIT"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-[#EDF3E6] text-[#20360B]"
                            }`}
                          >
                            {s.paymentMethod === "CREDIT" ? "MKOPO (DENI)" : s.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-800 whitespace-nowrap">
                          TZS {s.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => refundSale(s.id)}
                            className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Futa / Rudisha Mauzo"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
