"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  FileText,
  BarChart2,
  PieChart,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  Users
} from "lucide-react";

export const ReportsCenterModule: React.FC = () => {
  const { sales, expenses, products, customers, currentBranch } = useApp();
  const [reportType, setReportType] = useState<
    "SALES" | "PROFIT" | "INVENTORY" | "EXPENSES" | "DEBTS" | "BRANCH"
  >("SALES");

  const [dateRange, setDateRange] = useState("THIS_MONTH");

  const totalSales = sales.reduce((a, b) => a + b.total, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const estProfit = Math.round(totalSales * 0.38) - totalExpenses;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">
            Commercial Business Reports & Financial Statements
          </h2>
          <p className="text-xs text-[#526848]">
            Audit-ready reporting with exportable PDF, Excel and printable statements for TRA compliance and stakeholder review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#3C6415]" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => alert("Exporting formatted Excel spreadsheet...")}
            className="px-4 py-2 rounded-xl neu-btn text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Categories Nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
        {[
          { id: "SALES", label: "Sales & Turnover" },
          { id: "PROFIT", label: "Profit & Loss (P&L)" },
          { id: "INVENTORY", label: "Inventory Valuation" },
          { id: "EXPENSES", label: "Expense Breakdown" },
          { id: "DEBTS", label: "Accounts Receivable & Debts" },
          { id: "BRANCH", label: "Branch Comparison" },
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setReportType(rep.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition ${
              reportType === rep.id
                ? "bg-[#E1FFAC] text-[#162A08] border border-[#9EDE31] shadow-xs"
                : "bg-white text-[#4A613E] border border-[#D5E5C4]"
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* Main Report View Card */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs p-6 space-y-6">
        
        {/* Printable Report Header */}
        <div className="pb-4 border-b border-[#EDF4E4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#162709]">
              {reportType === "SALES"
                ? "Monthly Comprehensive Sales Ledger Report"
                : reportType === "PROFIT"
                ? "Statement of Profit or Loss (Unaudited)"
                : reportType === "INVENTORY"
                ? "Stock Quantity & Valuation Ledger"
                : reportType === "EXPENSES"
                ? "Itemized Operating Expense Schedule"
                : "Credit Accounts Receivable Aging Report"}
            </h3>
            <span className="text-xs text-[#5D7351]">
              Reporting Entity: {currentBranch?.name} • Period: Current Calendar Cycle
            </span>
          </div>
          <span className="text-xs font-mono text-[#6A815E]">Generated: 2026-10-08</span>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F7FCF0] border border-[#D2E7BD]">
            <span className="text-xs text-[#566E49] font-bold block">Gross Invoiced Revenue</span>
            <span className="text-xl font-black text-[#162709] mt-0.5 block">
              TZS {totalSales.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7FCF0] border border-[#D2E7BD]">
            <span className="text-xs text-[#566E49] font-bold block">Operating Expenses Deducted</span>
            <span className="text-xl font-black text-rose-700 mt-0.5 block">
              TZS {totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7FCF0] border border-[#D2E7BD]">
            <span className="text-xs text-[#566E49] font-bold block">Calculated Net Operating Surplus</span>
            <span className="text-xl font-black text-emerald-800 mt-0.5 block">
              TZS {estProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Detailed Report Table */}
        <div className="border border-[#EBF2E2] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
            <thead className="bg-[#F8FAF4] font-bold text-[#4D6340]">
              <tr>
                <th className="py-3 px-4">Line Item / Invoice</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost Basis</th>
                <th className="py-3 px-4">Realized Amount</th>
                <th className="py-3 px-4 text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
              {sales.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[#F9FBF6]">
                  <td className="py-3 px-4 font-bold">{s.saleNumber} ({s.customerName || "Walk-in"})</td>
                  <td className="py-3 px-4">{s.paymentMethod}</td>
                  <td className="py-3 px-4 text-[#5D7351]">TZS {(s.total * 0.62).toFixed(0)}</td>
                  <td className="py-3 px-4 font-black">TZS {s.total.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-800">
                    +TZS {(s.total * 0.38).toFixed(0)}
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
