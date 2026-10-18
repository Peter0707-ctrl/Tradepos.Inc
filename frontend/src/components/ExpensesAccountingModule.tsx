"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  PlusCircle,
  Wallet,
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

export const ExpensesAccountingModule: React.FC = () => {
  const {
    user,
    currentBranch,
    expenses,
    addExpense,
    sales,
    language,
    closeDayAndSendToBoss,
    startNewDay,
    isDayClosed,
    activeDayLabel,
  } = useApp();

  const todayStr = activeDayLabel || toDateString(new Date());
  const yesterdayStr = addDaysToDateStr(todayStr, -1);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [stripEndDate, setStripEndDate] = useState<string>(todayStr);
  const [showMonthGrid, setShowMonthGrid] = useState<boolean>(false);
  const [viewMonthDate, setViewMonthDate] = useState<string>(todayStr);

  const [category, setCategory] = useState("Usafiri & Bodaboda");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA">("CASH");
  const [notes, setNotes] = useState("");

  const isOwner = !user || user.role === "OWNER" || user.role === "SUPER_ADMIN";

  const getExpensesTotalForDate = (dateStr: string) => {
    return expenses
      .filter((e) => (e.date || "").split("T")[0] === dateStr)
      .reduce((acc, e) => acc + e.amount, 0);
  };

  const handleShiftSelectedDate = (deltaDays: number) => {
    const nextDate = addDaysToDateStr(selectedDate, deltaDays);
    setSelectedDate(nextDate);
    setViewMonthDate(nextDate);

    const stripStart = addDaysToDateStr(stripEndDate, -6);
    if (nextDate < stripStart) {
      setStripEndDate(addDaysToDateStr(nextDate, 6));
    } else if (nextDate > stripEndDate) {
      setStripEndDate(nextDate);
    }
  };

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
      totalExpenses: getExpensesTotalForDate(dStr),
    };
  });

  const monthDateObj = parseDateParts(viewMonthDate);
  const viewYear = monthDateObj.getFullYear();
  const viewMonth = monthDateObj.getMonth();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleShiftMonth = (deltaMonths: number) => {
    const d = new Date(viewYear, viewMonth + deltaMonths, 1, 12, 0, 0);
    setViewMonthDate(toDateString(d));
  };

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

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (!title.trim() || amt <= 0) return;

    addExpense({
      branchId: currentBranch?.id || "br-01",
      title: title.trim(),
      description: title.trim(),
      category,
      amount: amt,
      date: todayStr,
      recordedBy: user?.name || "Mhudumu",
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    setTitle("");
    setAmount("");
    setNotes("");
    handleSelectCalendarDate(todayStr);
  };

  const selectedDateExpenses = expenses.filter(
    (e) => (e.date || "").split("T")[0] === selectedDate
  );
  const totalExpenses = selectedDateExpenses.reduce((acc, e) => acc + e.amount, 0);
  const cashExpenses = selectedDateExpenses
    .filter((e) => !e.paymentMethod || e.paymentMethod === "CASH")
    .reduce((acc, e) => acc + e.amount, 0);
  const mobileExpenses = selectedDateExpenses
    .filter((e) => e.paymentMethod && e.paymentMethod !== "CASH")
    .reduce((acc, e) => acc + e.amount, 0);

  const selectedDateSalesTotal = sales
    .filter((s) => s.status !== "REFUNDED" && (s.createdAt || "").split("T")[0] === selectedDate)
    .reduce((acc, s) => acc + s.total, 0);
  const remainingAfterExpenses = selectedDateSalesTotal - totalExpenses;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-[#172709] tracking-tight">
              {language === "sw"
                ? isOwner
                  ? "3. Matumizi ya Siku & Kalenda ya Matumizi"
                  : "2. Matumizi ya Leo & Kalenda ya Matumizi"
                : "Daily Shop Expenses & Calendar"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E1FFAC] text-[#172B08] border border-[#9CE034] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{selectedDate}</span>
            </span>
          </div>
          <p className="text-xs text-[#52654c] mt-0.5">
            {language === "sw"
              ? "Sogeza kalenda kushoto au kulia (< / >) na bonyeza tarehe yoyote kuona matumizi ya siku hiyo."
              : "Shift the calendar left or right (< / >) and click any date to view that day's expenses."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isDayClosed ? (
            <button
              onClick={() => closeDayAndSendToBoss()}
              className="px-4 py-2.5 rounded-xl bg-[#1B2F09] hover:bg-[#27430D] text-[#E1FFAC] border-2 border-[#A6DF52] text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Funga Mauzo ya Siku (Tuma kwa Boss Auto)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                startNewDay();
                handleSelectCalendarDate(todayStr);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Fungua Siku Mpya (Anza Siku Mpya 0)</span>
            </button>
          )}
        </div>
      </div>

      {/* INTERACTIVE CALENDAR DATE SHIFTER & SELECTOR */}
      <div className="p-3.5 rounded-2xl bg-white border-2 border-[#C2E880] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleShiftSelectedDate(-1)}
              className="px-3 py-1.5 rounded-xl bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#1B2F09] border border-[#C6DDA8] font-black text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Siku Iliyopita</span>
            </button>

            <div className="px-3.5 py-1.5 rounded-xl bg-[#1B2F09] text-[#E1FFAC] border border-[#8ECE28] font-black text-xs flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#A6DF52]" />
              <span>{formatSelectedDateTitle(selectedDate)}</span>
            </div>

            <button
              onClick={() => handleShiftSelectedDate(1)}
              className="px-3 py-1.5 rounded-xl bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#1B2F09] border border-[#C6DDA8] font-black text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <span>Siku Inayofuata</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedDate !== todayStr && (
              <button
                onClick={() => {
                  setSelectedDate(todayStr);
                  setStripEndDate(todayStr);
                  setViewMonthDate(todayStr);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d2f88c] text-[#162709] border border-[#9CE034] font-black text-xs transition cursor-pointer"
              >
                Rudi Leo ({todayStr})
              </button>
            )}

            <button
              onClick={() => setShowMonthGrid((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs border flex items-center gap-1.5 transition cursor-pointer ${
                showMonthGrid
                  ? "bg-[#1B2F09] text-[#E1FFAC] border-[#8ECE28]"
                  : "bg-[#F4F7EE] hover:bg-[#E1FFAC]/60 text-[#1B2F09] border-[#C6DDA8]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{showMonthGrid ? "Ficha Kalenda ya Mwezi" : "Fungua Kalenda ya Mwezi"}</span>
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectCalendarDate(e.target.value);
                }
              }}
              className="py-1.5 px-2.5 rounded-xl neu-input font-bold text-xs cursor-pointer"
            />
          </div>
        </div>

        {/* 7-Day Horizontal Shifting Calendar Strip */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleShiftCalendarStrip(-7)}
            className="p-2 rounded-xl bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#1B2F09] border border-[#D8E6CC] font-black text-xs flex flex-col items-center justify-center shrink-0 transition cursor-pointer"
            title="Sogeza kalenda wiki 1 nyuma"
          >
            <ChevronsLeft className="w-4 h-4" />
            <span className="text-[9px] font-extrabold mt-0.5">-7 Siku</span>
          </button>

          <div className="grid grid-cols-7 gap-1.5 flex-1">
            {calendarStripDays.map((day) => (
              <button
                key={day.dateStr}
                onClick={() => handleSelectCalendarDate(day.dateStr)}
                className={`p-2 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  day.isSelected
                    ? "bg-[#1B2F09] text-[#E1FFAC] border-2 border-[#8ECE28] shadow-sm"
                    : day.totalExpenses > 0
                    ? "bg-[#F8FBF4] hover:bg-[#E1FFAC]/50 text-[#162709] border-[#C6DDA8]"
                    : "bg-[#F4F6F1] hover:bg-[#EBF1E4] text-[#5B704E] border-[#E2EBDA]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={`text-[10px] font-bold truncate ${
                      day.isSelected ? "text-[#A6DF52]" : "text-[#58704A]"
                    }`}
                  >
                    {day.dayName}
                  </span>
                  {(day.isToday || day.isYesterday) && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                        day.isSelected
                          ? "bg-[#A6DF52] text-[#162709]"
                          : "bg-[#E1FFAC] text-[#162709]"
                      }`}
                    >
                      {day.isToday ? "LEO" : "JANA"}
                    </span>
                  )}
                </div>

                <div className="my-1">
                  <span className="text-sm sm:text-base font-black leading-none">
                    {day.dayNumber}
                  </span>{" "}
                  <span className="text-[10px] font-bold opacity-80">{day.monthShort}</span>
                </div>

                <div
                  className={`text-[10px] font-extrabold truncate ${
                    day.isSelected
                      ? "text-white"
                      : day.totalExpenses > 0
                      ? "text-rose-700"
                      : "text-gray-400"
                  }`}
                >
                  {day.totalExpenses > 0
                    ? `TZS ${day.totalExpenses.toLocaleString()}`
                    : "TZS 0"}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleShiftCalendarStrip(7)}
            className="p-2 rounded-xl bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#1B2F09] border border-[#D8E6CC] font-black text-xs flex flex-col items-center justify-center shrink-0 transition cursor-pointer"
            title="Sogeza kalenda wiki 1 mbele"
          >
            <ChevronsRight className="w-4 h-4" />
            <span className="text-[9px] font-extrabold mt-0.5">+7 Siku</span>
          </button>
        </div>

        {/* Optional Expandable Full Month Calendar Grid */}
        {showMonthGrid && (
          <div className="pt-3 border-t border-[#E6F0DA]">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => handleShiftMonth(-1)}
                className="px-3 py-1 rounded-lg bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#162709] border border-[#C6DDA8] text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Mwezi Uliopita</span>
              </button>

              <span className="font-black text-sm text-[#162709]">
                Kalenda ya {SWAHILI_MONTHS_FULL[viewMonth]} {viewYear}
              </span>

              <button
                onClick={() => handleShiftMonth(1)}
                className="px-3 py-1 rounded-lg bg-[#F4F7EE] hover:bg-[#E1FFAC] text-[#162709] border border-[#C6DDA8] text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <span>Mwezi Unaofuata</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-[#4E6440] mb-1">
              <div>Jumapili</div>
              <div>Jumatatu</div>
              <div>Jumanne</div>
              <div>Jumatano</div>
              <div>Alhamisi</div>
              <div>Ijumaa</div>
              <div>Jumamosi</div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, emptyIdx) => (
                <div key={`empty-${emptyIdx}`} className="p-2 rounded-lg bg-gray-50/50" />
              ))}
              {Array.from({ length: daysInMonth }, (_, dIdx) => {
                const dayNum = dIdx + 1;
                const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const dayExp = getExpensesTotalForDate(dStr);
                const isSel = dStr === selectedDate;
                const isTod = dStr === todayStr;
                return (
                  <button
                    key={dStr}
                    onClick={() => handleSelectCalendarDate(dStr)}
                    className={`p-1.5 rounded-lg border text-left transition cursor-pointer ${
                      isSel
                        ? "bg-[#1B2F09] text-[#E1FFAC] border-[#8ECE28] font-black"
                        : dayExp > 0
                        ? "bg-rose-50/60 hover:bg-rose-100/60 text-[#162709] border-rose-200"
                        : "bg-white hover:bg-gray-50 text-[#58704A] border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>{dayNum}</span>
                      {isTod && (
                        <span className="text-[8px] px-1 rounded bg-[#A6DF52] text-[#162709]">
                          LEO
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[9px] font-bold truncate mt-0.5 ${
                        isSel
                          ? "text-[#E1FFAC]"
                          : dayExp > 0
                          ? "text-rose-700"
                          : "text-gray-400"
                      }`}
                    >
                      {dayExp > 0 ? `TZS ${dayExp.toLocaleString()}` : "-"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3 Automatic Expense Summary Cards for Selected Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-rose-200 shadow-xs">
          <span className="text-xs font-bold text-[#5c7054] block">
            Jumla ya Matumizi ({selectedDate === todayStr ? "Leo" : selectedDate === yesterdayStr ? "Jana" : selectedDate})
          </span>
          <p className="text-xl font-black text-rose-700 mt-0.5">
            TZS {totalExpenses.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065] font-bold">
            Rekodi {selectedDateExpenses.length} za matumizi
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-xs">
          <span className="text-xs font-bold text-[#5c7054] block">
            Matumizi ya Cash vs Simu
          </span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">
            Cash: TZS {cashExpenses.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065] font-bold">
            Simu (M-Pesa): TZS {mobileExpenses.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-xs">
          <span className="text-xs font-bold text-[#5c7054] block">
            Mauzo Ukitoa Matumizi ({selectedDate})
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {remainingAfterExpenses.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            Mauzo (TZS {selectedDateSalesTotal.toLocaleString()}) - Matumizi (TZS {totalExpenses.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Main Content: Left = Enter Daily Expense | Right = Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left: Direct Expense Entry Form */}
        <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
          <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#3A6112]" />
            <span>Andika Matumizi ya Leo (Manual)</span>
          </h3>
          <p className="text-[11px] text-[#5B714F] mb-3">
            Andika umetumia nini leo na kiasi gani. Mfumo unapiga jumla moja kwa moja.
          </p>

          <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Ametumia Nini Leo? (Maelezo ya Matumizi)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mfano: Nauli ya bodaboda, Chakula, LUKU, Mifuko..."
                className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#334A26] mb-1">Kundi la Matumizi</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2 px-3 rounded-xl neu-input font-semibold"
              >
                <option value="Usafiri & Bodaboda">Usafiri & Bodaboda</option>
                <option value="Chakula & Maji Dukani">Chakula & Maji Dukani</option>
                <option value="Umeme (LUKU) & Maji">Umeme (LUKU) & Maji</option>
                <option value="Vifungashio & Mifuko">Vifungashio & Mifuko</option>
                <option value="Pango la Duka (Rent)">Pango la Duka (Rent)</option>
                <option value="Posho / Mishahara">Posho / Mishahara</option>
                <option value="Mengineyo">Mengineyo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">Kiasi (TZS)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full py-2 px-3 rounded-xl neu-input font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">Imelipwa kwa</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "CASH" | "MPESA")}
                  className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                >
                  <option value="CASH">Cash ya Drooni</option>
                  <option value="MPESA">M-Pesa / Simu</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#334A26] mb-1">Maelezo ya Ziada (Hiari)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hiari..."
                className="w-full py-2 px-3 rounded-xl neu-input"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl neu-btn font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              + Hifadhi Matumizi ya Leo
            </button>
          </form>
        </div>

        {/* Right: Expenses Table for Selected Calendar Date */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dce8cd] p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBF2E2]">
            <div>
              <h3 className="font-black text-sm text-[#162709] flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#233F0D]" />
                <span>Matumizi ya Tarehe: {formatSelectedDateTitle(selectedDate)}</span>
              </h3>
              <p className="text-[11px] text-[#5B714F]">
                Matumizi yote yaliyoandikwa kwenye tarehe uliyoichagua ({selectedDate})
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black">
              Jumla: TZS {totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto mt-3 flex-1">
            <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
              <thead className="bg-[#F8FAF4] font-bold text-[#44573d]">
                <tr>
                  <th className="py-2.5 px-3">Tarehe</th>
                  <th className="py-2.5 px-3">Ametumia Nini</th>
                  <th className="py-2.5 px-3">Kundi</th>
                  <th className="py-2.5 px-3">Malipo</th>
                  <th className="py-2.5 px-3">Aliyeandika</th>
                  <th className="py-2.5 px-3 text-right">Kiasi (TZS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
                {selectedDateExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Hakuna matumizi yaliyoandikwa kwenye tarehe hii ({selectedDate}). Sogeza kalenda (&lt; / &gt;) na bonyeza tarehe nyingine kuona matumizi yake.
                    </td>
                  </tr>
                ) : (
                  selectedDateExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#FAFCF7] transition">
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-[#2B4218]">
                        {exp.date}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#162709]">
                        {exp.description || exp.title}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#EDF2E8] font-semibold text-[#304524]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#EDF3E6] font-bold text-[10px]">
                          {exp.paymentMethod || "CASH"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#4C6240]">{exp.recordedBy}</td>
                      <td className="py-3 px-3 text-right font-black text-rose-700">
                        TZS {exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
