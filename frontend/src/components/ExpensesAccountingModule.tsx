"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  PlusCircle,
  Wallet,
  Send,
  CheckCircle2,
  Calendar,
  History
} from "lucide-react";

type PeriodFilter = "TODAY" | "YESTERDAY" | "WEEK_1" | "WEEK_2" | "ALL" | "CUSTOM";

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

  const [category, setCategory] = useState("Usafiri & Bodaboda");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA">("CASH");
  const [notes, setNotes] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("TODAY");
  const [customDate, setCustomDate] = useState<string>(activeDayLabel);

  const isOwner = !user || user.role === "OWNER" || user.role === "SUPER_ADMIN";

  const getDateDaysAgo = (daysAgo: number) => {
    const base = new Date(activeDayLabel || new Date().toISOString().split("T")[0]);
    base.setDate(base.getDate() - daysAgo);
    return base.toISOString().split("T")[0];
  };

  const todayStr = activeDayLabel;
  const yesterdayStr = getDateDaysAgo(1);
  const week1CutoffStr = getDateDaysAgo(7);
  const week2CutoffStr = getDateDaysAgo(14);

  const matchesSelectedPeriod = (dateStr: string) => {
    const cleanDate = (dateStr || "").split("T")[0];
    if (periodFilter === "TODAY") return cleanDate === todayStr;
    if (periodFilter === "YESTERDAY") return cleanDate === yesterdayStr;
    if (periodFilter === "WEEK_1") return cleanDate >= week1CutoffStr && cleanDate <= todayStr;
    if (periodFilter === "WEEK_2") return cleanDate >= week2CutoffStr && cleanDate <= todayStr;
    if (periodFilter === "CUSTOM") return cleanDate === customDate;
    return true;
  };

  const getPeriodLabel = () => {
    if (periodFilter === "TODAY") return `Leo (${todayStr})`;
    if (periodFilter === "YESTERDAY") return `Jana (${yesterdayStr})`;
    if (periodFilter === "WEEK_1") return `Wiki 1 Nyuma (Siku 7)`;
    if (periodFilter === "WEEK_2") return `Wiki 2 Nyuma (Siku 14)`;
    if (periodFilter === "CUSTOM") return `Tarehe: ${customDate}`;
    return "Historia Yote ya Matumizi";
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
      date: activeDayLabel,
      recordedBy: user?.name || "Baraka Mushi",
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    setTitle("");
    setAmount("");
    setNotes("");
    setPeriodFilter("TODAY");
  };

  const periodExpenses = expenses.filter((e) => matchesSelectedPeriod(e.date));
  const totalExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
  const cashExpenses = periodExpenses
    .filter((e) => !e.paymentMethod || e.paymentMethod === "CASH")
    .reduce((acc, e) => acc + e.amount, 0);
  const mobileExpenses = periodExpenses
    .filter((e) => e.paymentMethod && e.paymentMethod !== "CASH")
    .reduce((acc, e) => acc + e.amount, 0);

  const periodSalesTotal = sales
    .filter((s) => s.status !== "REFUNDED" && matchesSelectedPeriod(s.createdAt))
    .reduce((acc, s) => acc + s.total, 0);
  const remainingAfterExpenses = periodSalesTotal - totalExpenses;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-[#172709] tracking-tight">
              {language === "sw"
                ? isOwner
                  ? "3. Matumizi ya Siku & Historia (Leo, Jana & Wiki 2 Nyuma)"
                  : "2. Matumizi ya Leo & Historia (Leo, Jana au Wiki 2 Nyuma)"
                : "Daily Shop Expenses & History"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E1FFAC] text-[#172B08] border border-[#9CE034] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{getPeriodLabel()}</span>
            </span>
          </div>
          <p className="text-xs text-[#52654c] mt-0.5">
            {language === "sw"
              ? "Andika pesa zote zilizotumika dukani leo au kagua matumizi ya Jana na Wiki 2 Nyuma."
              : "Record all daily shop expenses or review expenses from Yesterday and 2 Weeks Ago."}
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
                setPeriodFilter("TODAY");
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
            <span>Chagua Muda wa Matumizi:</span>
          </span>

          {(
            [
              { id: "TODAY", label: "Matumizi ya Leo" },
              { id: "YESTERDAY", label: "Matumizi ya Jana" },
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

      {/* 3 Automatic Expense Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-rose-200 shadow-xs">
          <span className="text-xs font-bold text-[#5c7054] block">
            Jumla ya Matumizi ({getPeriodLabel()})
          </span>
          <p className="text-xl font-black text-rose-700 mt-0.5">
            TZS {totalExpenses.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065] font-bold">
            Rekodi {periodExpenses.length} za matumizi
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
            Mauzo Ukitoa Matumizi ({periodFilter === "TODAY" ? "Leo" : periodFilter === "YESTERDAY" ? "Jana" : "Muda Huu"})
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {remainingAfterExpenses.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            Mauzo (TZS {periodSalesTotal.toLocaleString()}) - Matumizi (TZS {totalExpenses.toLocaleString()})
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

        {/* Right: Expenses Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dce8cd] p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBF2E2]">
            <div>
              <h3 className="font-black text-sm text-[#162709] flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#233F0D]" />
                <span>Orodha ya Matumizi — {getPeriodLabel()}</span>
              </h3>
              <p className="text-[11px] text-[#5B714F]">
                Matumizi yote yaliyoandikwa kwa muda uliouchagua
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
                {periodExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Hakuna matumizi yaliyoandikwa kwa muda huu ({getPeriodLabel()}). Bonyeza &apos;Matumizi ya Jana&apos; au &apos;Wiki 2 Nyuma&apos; kuona historia.
                    </td>
                  </tr>
                ) : (
                  periodExpenses.map((exp) => (
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
