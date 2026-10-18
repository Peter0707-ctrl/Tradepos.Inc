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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const SWAHILI_DAYS_SHORT = ["Jumapili", "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi"];
const SWAHILI_MONTHS_SHORT = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"];
const SWAHILI_MONTHS_FULL = [
  "Januari",
  "Februari",
  "Machi",
  "Aprili",
  "Mei",
  "Juni",
  "Julai",
  "Agosti",
  "Septemba",
  "Oktoba",
  "Novemba",
  "Desemba",
];

// Helper: parse YYYY-MM-DD safely in local time without timezone shift
const parseDateParts = (dateStr: string): Date => {
  const parts = (dateStr || "").split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
};

const toDateString = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addDaysToDateStr = (dateStr: string, deltaDays: number): string => {
  const d = parseDateParts(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return toDateString(d);
};

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

  const todayStr = activeDayLabel || toDateString(new Date());
  const yesterdayStr = addDaysToDateStr(todayStr, -1);

  // Selected single calendar date (default: Today)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  // End date of the 7-day horizontal calendar strip (shifts with < and >)
  const [stripEndDate, setStripEndDate] = useState<string>(todayStr);
  // Toggle full month calendar grid view
  const [showMonthGrid, setShowMonthGrid] = useState<boolean>(false);
  // Currently viewed month in the full month grid (YYYY-MM-01)
  const [viewMonthDate, setViewMonthDate] = useState<string>(todayStr);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Direct Sale Entry Form State
  const [prodName, setProdName] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA" | "CREDIT">("CASH");
  const [customerName, setCustomerName] = useState("");
  const [justClosedReport, setJustClosedReport] = useState<boolean>(false);

  const isOwner = !user || user.role === "OWNER" || user.role === "SUPER_ADMIN";

  // Helper to get total sales for any specific YYYY-MM-DD date
  const getSalesTotalForDate = (dateStr: string) => {
    return sales
      .filter((s) => s.status !== "REFUNDED" && (s.createdAt || "").split("T")[0] === dateStr)
      .reduce((acc, s) => acc + s.total, 0);
  };

  const getSalesCountForDate = (dateStr: string) => {
    return sales.filter((s) => s.status !== "REFUNDED" && (s.createdAt || "").split("T")[0] === dateStr).length;
  };

  // Shift selected date by N days and keep strip window containing the selected date
  const handleShiftSelectedDate = (deltaDays: number) => {
    const nextDate = addDaysToDateStr(selectedDate, deltaDays);
    setSelectedDate(nextDate);
    setViewMonthDate(nextDate);

    // Ensure the 7-day strip includes nextDate
    const stripStart = addDaysToDateStr(stripEndDate, -6);
    if (nextDate < stripStart) {
      setStripEndDate(addDaysToDateStr(nextDate, 6));
    } else if (nextDate > stripEndDate) {
      setStripEndDate(nextDate);
    }
  };

  // Shift the 7-day calendar strip window left/right (e.g., -7 or +7 days)
  const handleShiftCalendarStrip = (deltaDays: number) => {
    const newStripEnd = addDaysToDateStr(stripEndDate, deltaDays);
    setStripEndDate(newStripEnd);
    const newSelected = addDaysToDateStr(selectedDate, deltaDays);
    setSelectedDate(newSelected);
    setViewMonthDate(newSelected);
  };

  const handleSelectCalendarDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setViewMonthDate(dateStr);
    const stripStart = addDaysToDateStr(stripEndDate, -6);
    if (dateStr < stripStart) {
      setStripEndDate(addDaysToDateStr(dateStr, 6));
    } else if (dateStr > stripEndDate) {
      setStripEndDate(dateStr);
    }
  };

  // Build the 7 days for the horizontal shifting calendar strip (oldest on left -> newest on right)
  const calendarStripDays = Array.from({ length: 7 }, (_, idx) => {
    const offset = 6 - idx;
    const dStr = addDaysToDateStr(stripEndDate, -offset);
    const dObj = parseDateParts(dStr);
    return {
      dateStr: dStr,
      dayName: SWAHILI_DAYS_SHORT[dObj.getDay()],
      dayNumber: dObj.getDate(),
      monthShort: SWAHILI_MONTHS_SHORT[dObj.getMonth()],
      isToday: dStr === todayStr,
      isYesterday: dStr === yesterdayStr,
      isSelected: dStr === selectedDate,
      totalSales: getSalesTotalForDate(dStr),
      salesCount: getSalesCountForDate(dStr),
    };
  });

  // Build Full Month Calendar Grid for viewMonthDate
  const monthDateObj = parseDateParts(viewMonthDate);
  const viewYear = monthDateObj.getFullYear();
  const viewMonth = monthDateObj.getMonth();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun ... 6 = Sat
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleShiftMonth = (deltaMonths: number) => {
    const d = new Date(viewYear, viewMonth + deltaMonths, 1, 12, 0, 0);
    setViewMonthDate(toDateString(d));
  };

  // Format human-readable label for the selected date
  const formatSelectedDateTitle = (dateStr: string) => {
    const dObj = parseDateParts(dateStr);
    const dayName = SWAHILI_DAYS_SHORT[dObj.getDay()];
    const dayNum = dObj.getDate();
    const monthName = SWAHILI_MONTHS_FULL[dObj.getMonth()];
    const yearNum = dObj.getFullYear();

    if (dateStr === todayStr) {
      return `Leo — ${dayName}, ${dayNum} ${monthName} ${yearNum}`;
    }
    if (dateStr === yesterdayStr) {
      return `Jana — ${dayName}, ${dayNum} ${monthName} ${yearNum}`;
    }
    const diffDays = Math.round(
      (parseDateParts(todayStr).getTime() - dObj.getTime()) / (1000 * 60 * 60 * 24)
    );
    const relText =
      diffDays > 0 ? `(Siku ${diffDays} zilizopita)` : diffDays < 0 ? `(Siku ${Math.abs(diffDays)} mbele)` : "";
    return `${dayName}, ${dayNum} ${monthName} ${yearNum} ${relText}`;
  };

  // Automatic calculation preview for current form input
  const parsedQty = parseInt(qty) || 0;
  const matchedProduct = products.find(
    (p) => p.name.toLowerCase() === prodName.trim().toLowerCase()
  );
  const parsedUnitPrice =
    parseFloat(unitPrice) || (matchedProduct ? matchedProduct.sellingPrice : 0);
  const autoLineTotal = parsedQty * parsedUnitPrice;

  // Filter sales for the exact selected calendar date
  const selectedDateSales = sales.filter(
    (s) => s.status !== "REFUNDED" && (s.createdAt || "").split("T")[0] === selectedDate
  );

  const totalSalesAmount = selectedDateSales.reduce((acc, s) => acc + s.total, 0);
  const totalCashSales = selectedDateSales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((acc, s) => acc + s.total, 0);
  const totalMobileSales = selectedDateSales
    .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
    .reduce((acc, s) => acc + s.total, 0);
  const totalCreditSales = selectedDateSales
    .filter((s) => s.paymentMethod === "CREDIT")
    .reduce((acc, s) => acc + s.total, 0);

  const totalUnitsSold = selectedDateSales.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );

  // Today's totals for the End-of-Day banner
  const todaySalesTotal = getSalesTotalForDate(todayStr);
  const todayExpensesTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);
  const totalStoreStockRemaining = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  const filteredSales = selectedDateSales.filter((s) => {
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
      cashierName: user?.name || "Mhudumu",
      status: "COMPLETED",
    });

    setProdName("");
    setQty("1");
    setUnitPrice("");
    setCustomerName("");
    handleSelectCalendarDate(todayStr);
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

      {/* Top Header + Compact Small Calendar Box + "Funga Mauzo ya Siku" Action */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#162709] tracking-tight">
            {language === "sw" ? "Mauzo ya Siku" : "Daily Sales"}
          </h2>
          <p className="text-xs text-[#526848]">
            {formatSelectedDateTitle(selectedDate)}
          </p>
        </div>

        {/* Right Controls: Compact Small Calendar Box + Funga Mauzo Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* SMALL COMPACT CALENDAR BOX */}
          <div className="relative">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border-2 border-[#C2E880] shadow-xs">
              <button
                onClick={() => handleShiftSelectedDate(-1)}
                className="w-7 h-7 rounded-lg bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#1B2F09] flex items-center justify-center transition cursor-pointer"
                title="Siku Iliyopita"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMonthGrid((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg bg-[#1B2F09] text-[#E1FFAC] font-black text-xs flex items-center gap-1.5 cursor-pointer"
                title="Fungua Kalenda Ndogo"
              >
                <Calendar className="w-3.5 h-3.5 text-[#A6DF52]" />
                <span>
                  {selectedDate === todayStr
                    ? `Leo (${selectedDate})`
                    : selectedDate === yesterdayStr
                    ? `Jana (${selectedDate})`
                    : selectedDate}
                </span>
              </button>

              <button
                onClick={() => handleShiftSelectedDate(1)}
                className="w-7 h-7 rounded-lg bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#1B2F09] flex items-center justify-center transition cursor-pointer"
                title="Siku Inayofuata"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {selectedDate !== todayStr && (
                <button
                  onClick={() => handleSelectCalendarDate(todayStr)}
                  className="px-2 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d2f88c] text-[#162709] font-black text-[11px] transition cursor-pointer"
                >
                  Leo
                </button>
              )}
            </div>

            {/* POPUP SMALL CALENDAR BOX */}
            {showMonthGrid && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white border-2 border-[#C2E880] shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#EDF4E4]">
                  <button
                    onClick={() => handleShiftMonth(-1)}
                    className="w-6 h-6 rounded-lg bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#162709] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-black text-xs text-[#162709]">
                    {SWAHILI_MONTHS_FULL[viewMonth]} {viewYear}
                  </span>
                  <button
                    onClick={() => handleShiftMonth(1)}
                    className="w-6 h-6 rounded-lg bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#162709] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-black text-[#58704A] mb-1">
                  <div>Jp</div>
                  <div>Jt</div>
                  <div>Jn</div>
                  <div>Ju</div>
                  <div>Al</div>
                  <div>Ij</div>
                  <div>Jm</div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, emptyIdx) => (
                    <div key={`empty-${emptyIdx}`} className="h-7" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, dIdx) => {
                    const dayNum = dIdx + 1;
                    const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const daySales = getSalesTotalForDate(dStr);
                    const isSel = dStr === selectedDate;
                    const isTod = dStr === todayStr;
                    return (
                      <button
                        key={dStr}
                        onClick={() => {
                          handleSelectCalendarDate(dStr);
                          setShowMonthGrid(false);
                        }}
                        className={`h-7 rounded-lg text-[11px] font-black flex flex-col items-center justify-center relative transition cursor-pointer ${
                          isSel
                            ? "bg-[#1B2F09] text-[#E1FFAC] border border-[#8ECE28]"
                            : isTod
                            ? "bg-[#E1FFAC] text-[#162709] border border-[#9CE034]"
                            : daySales > 0
                            ? "bg-[#F4FAEC] hover:bg-[#E1FFAC]/60 text-[#162709]"
                            : "hover:bg-gray-100 text-[#4E6440]"
                        }`}
                      >
                        <span>{dayNum}</span>
                        {daySales > 0 && (
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isSel ? "bg-[#A6DF52]" : "bg-emerald-600"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#EDF4E4]">
                  <button
                    onClick={() => {
                      handleSelectCalendarDate(todayStr);
                      setShowMonthGrid(false);
                    }}
                    className="text-[11px] font-black text-[#355B0F] hover:underline cursor-pointer"
                  >
                    Rudi Leo ({todayStr})
                  </button>
                  <button
                    onClick={() => setShowMonthGrid(false)}
                    className="px-2.5 py-1 rounded-lg bg-[#F4F7EE] text-[#162709] text-[10px] font-black cursor-pointer"
                  >
                    Funga
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prominent "Funga Mauzo ya Siku" Button */}
          {!isDayClosed ? (
            <button
              onClick={handleCloseDaySales}
              className="px-3.5 py-2 rounded-xl bg-[#1B2F09] hover:bg-[#27430D] text-[#E1FFAC] border-2 border-[#A6DF52] text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Funga Mauzo ya Siku</span>
            </button>
          ) : (
            <button
              onClick={() => {
                startNewDay();
                handleSelectCalendarDate(todayStr);
                setJustClosedReport(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fungua Siku Mpya</span>
            </button>
          )}
        </div>
      </div>

      {/* BANNER WHEN "FUNGA MAUZO YA SIKU" IS CLICKED */}
      {(isDayClosed || justClosedReport) && (
        <div className="p-3.5 rounded-2xl bg-emerald-950 text-[#E1FFAC] border-2 border-[#A6DF52] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#A6DF52] shrink-0" />
            <span>
              Siku Imefungwa ({todayStr}) — Mauzo: TZS {todaySalesTotal.toLocaleString()} | Matumizi: TZS {todayExpensesTotal.toLocaleString()} | Stoo: {totalStoreStockRemaining} pcs
            </span>
          </div>
          <button
            onClick={() => {
              startNewDay();
              handleSelectCalendarDate(todayStr);
              setJustClosedReport(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#E1FFAC] text-[#162708] font-black text-xs shrink-0 hover:bg-white transition cursor-pointer"
          >
            Anza Siku Mpya
          </button>
        </div>
      )}

      {/* 4 AUTOMATIC CALCULATION SUMMARY CARDS FOR THE SELECTED CALENDAR DATE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-[#b2e269] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Jumla ya Mauzo ({selectedDate === todayStr ? "Leo" : selectedDate === yesterdayStr ? "Jana" : selectedDate})
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {totalSalesAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            {totalUnitsSold} pcs ({selectedDateSales.length} mauzo)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Cash
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {totalCashSales.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Simu (M-Pesa)
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {totalMobileSales.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Mkopo
          </span>
          <p className="text-xl font-black text-amber-700 mt-0.5">
            TZS {totalCreditSales.toLocaleString()}
          </p>
        </div>
      </div>

      {/* MAIN WORKSPACE: LEFT = ENTER TODAY'S SALES | RIGHT = SELECTED DATE SALES TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left: Enter Today's Sales Form */}
        <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
          <h3 className="font-black text-sm text-[#162709] mb-3 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#3A6112]" />
            <span>Andika Mauzo</span>
          </h3>

          <form onSubmit={handleRecordSale} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Bidhaa Iliyouzwa:
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
                placeholder="Jina la bidhaa..."
                className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
              />
              {matchedProduct && (
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                  Stoo: {matchedProduct.stockQuantity} {matchedProduct.unit} | Bei: TZS{" "}
                  {matchedProduct.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Idadi
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
                  Bei (TZS)
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
                <span>Jumla:</span>
              </div>
              <span className="text-base font-black text-emerald-800">
                TZS {autoLineTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">Malipo</label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "CASH" | "MPESA" | "CREDIT")
                  }
                  className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa / Simu</option>
                  <option value="CREDIT">Mkopo (Deni)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Mteja {paymentMethod === "CREDIT" ? "*" : "(Hiari)"}
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
              + Hifadhi Mauzo
            </button>
          </form>
        </div>

        {/* Right: Selected Calendar Date Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] p-4 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
            <h3 className="font-black text-sm text-[#162709] flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#233F0D]" />
              <span>Mauzo ({selectedDate})</span>
            </h3>

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
                      Hakuna mauzo ({selectedDate}).
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
                            {isSaleToday ? "Leo" : isSaleYesterday ? "Jana" : "Kalenda"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-[#162709]">
                          {s.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
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
