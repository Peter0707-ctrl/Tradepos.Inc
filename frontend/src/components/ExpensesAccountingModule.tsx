"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  DollarSign,
  Plus,
  PieChart,
  TrendingDown,
  TrendingUp,
  FileText,
  Calendar,
  Wallet
} from "lucide-react";
import { Expense } from "@/types";

export const ExpensesAccountingModule: React.FC = () => {
  const { expenses, addExpense, sales, language, t } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("Rent");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    addExpense({
      branchId: "br-01",
      title,
      category,
      amount: parseFloat(amount) || 0,
      date: new Date().toISOString().split("T")[0],
      recordedBy: "Baraka Mushi",
      notes,
    });

    setIsModalOpen(false);
    setTitle("");
    setAmount("");
    setNotes("");
  };

  // Financial calculations
  const totalRevenue = sales.reduce((a, b) => a + b.total, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  // Approximate COGS at 70% of sales
  const cogs = Math.round(totalRevenue * 0.7);
  const grossProfit = totalRevenue - cogs;
  const netProfit = grossProfit - totalExpenses;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#172709] tracking-tight">
            {language === "sw" ? "Daftari la Fedha & Matumizi ya Biashara" : "Financial Ledger & Operating Expenses"}
          </h2>
          <p className="text-xs text-[#52654c]">
            {language === "sw"
              ? "Fuatilia gharama za uendeshaji, hesabu Faida Ghafi (Gross Profit), COGS na Faida Halisi (Net Profit)."
              : "Track daily operating costs, calculate Gross Profit, COGS and automated Net Profit."}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-neu-flat"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "sw" ? "+ Rekodi Matumizi" : "+ Record Expense"}</span>
        </button>
      </div>

      {/* BOSS DECISION BANNER: FAIDA AU HASARA */}
      <div
        className={`p-4 rounded-2xl mb-4 border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs ${
          netProfit >= 0
            ? "bg-gradient-to-r from-emerald-50 to-[#F2FBE5] border-emerald-300"
            : "bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
              netProfit >= 0
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-rose-600 text-white shadow-xs"
            }`}
          >
            {netProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                  netProfit >= 0
                    ? "bg-emerald-200 text-emerald-950"
                    : "bg-rose-200 text-rose-950"
                }`}
              >
                {netProfit >= 0
                  ? (language === "sw" ? "BIASHARA INATENGENEZA FAIDA (PROFIT)" : "BUSINESS IS PROFITABLE (NET PROFIT)")
                  : (language === "sw" ? "TAHADHARI: BIASHARA INAPATA HASARA (LOSS)" : "WARNING: OPERATING AT A LOSS")}
              </span>
              <span className="text-xs font-bold text-[#445b37]">
                {language === "sw" ? "Uwiano wa Faida: " : "Net Margin: "}
                {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
              </span>
            </div>
            <p className="text-xs text-[#425838] mt-0.5">
              {netProfit >= 0
                ? (language === "sw"
                    ? `Baada ya kutoa gharama za ununuzi wa bidhaa (COGS) na matumizi yote ya uendeshaji, biashara imebakiwa na ziada ya TZS ${netProfit.toLocaleString()}.`
                    : `After deducting cost of goods sold (COGS) and all operational expenses, business retains a net surplus of TZS ${netProfit.toLocaleString()}.`)
                : (language === "sw"
                    ? `Matumizi na gharama za ununuzi zimezidi mapato ya mauzo kwa TZS ${Math.abs(netProfit).toLocaleString()}. Inahitaji kupunguza matumizi au kuongeza mauzo.`
                    : `Operating expenses and COGS exceed sales revenue by TZS ${Math.abs(netProfit).toLocaleString()}. Requires cutting overhead or boosting sales.`)}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-[#556b49] block">
            {language === "sw" ? "Salio Halisi la Faida/Hasara:" : "Net Profit / Loss Balance:"}
          </span>
          <span
            className={`text-2xl font-black font-mono ${
              netProfit >= 0 ? "text-emerald-800" : "text-rose-700"
            }`}
          >
            {netProfit >= 0 ? "+" : "-"}TZS {Math.abs(netProfit).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Accounting Statement Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">
            {language === "sw" ? "Jumla ya Mapato (Revenue)" : "Total Revenue (Sales)"}
          </span>
          <p className="text-xl font-black text-[#17280a] mt-1">
            TZS {totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            {language === "sw" ? "Jumla ya Mauzo Yote" : "Total Gross Sales"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">
            {language === "sw" ? "Gharama za Bidhaa (COGS)" : "Cost of Goods (COGS)"}
          </span>
          <p className="text-xl font-black text-[#17280a] mt-1">
            TZS {cogs.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065]">
            {language === "sw" ? "Thamani ya mzigo uliouzwa" : "Inventory cost of sold goods"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">
            {language === "sw" ? "Matumizi ya Uendeshaji (Expenses)" : "Operating Overhead (Expenses)"}
          </span>
          <p className="text-xl font-black text-rose-700 mt-1">
            TZS {totalExpenses.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065]">
            {language === "sw" ? "Kodi, umeme, mishahara n.k." : "Rent, power, wages etc."}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">
            {language === "sw" ? "Faida / Hasara Halisi" : "Net Profit / Loss"}
          </span>
          <p
            className={`text-xl font-black mt-1 ${
              netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            TZS {netProfit.toLocaleString()}
          </p>
          <span className="text-[11px] font-bold text-[#556b49]">
            {netProfit >= 0
              ? (language === "sw" ? "Biashara Ina Faida" : "Net Operating Surplus")
              : (language === "sw" ? "Biashara Ina Hasara" : "Operating Net Loss")}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">{language === "sw" ? "Maelezo / Kusudi" : "Title / Purpose"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Aina" : "Category"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Kiasi" : "Amount"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Tarehe" : "Date"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Iliyoandikwa Na" : "Recorded By"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Maelezo ya Ziada" : "Notes"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-[#FAFCF7] transition">
                <td className="py-3 px-4 font-bold">{exp.title}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-[#EDF2E8] font-semibold text-[#304524]">
                    {exp.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-black text-rose-700">
                  TZS {exp.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-[#5b6e54]">{exp.date}</td>
                <td className="py-3 px-4">{exp.recordedBy}</td>
                <td className="py-3 px-4 text-[#798d72]">{exp.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up">
            <h3 className="text-lg font-black text-[#17270a] mb-4">
              Record New Expense
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Internet Fibre Cable"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                >
                  <option value="Rent">Rent</option>
                  <option value="Electricity">Electricity / LUKU</option>
                  <option value="Water">Water</option>
                  <option value="Salary">Salary & Staff Wages</option>
                  <option value="Transport">Transport & Fuel</option>
                  <option value="Internet">Internet & Telecom</option>
                  <option value="Repairs">Repairs & Maintenance</option>
                  <option value="Marketing">Marketing & Ads</option>
                  <option value="Delivery">Delivery & Logistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Amount (TZS)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes or receipt invoice reference..."
                  rows={2}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
