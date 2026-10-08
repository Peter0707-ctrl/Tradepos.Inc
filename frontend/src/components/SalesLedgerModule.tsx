"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Filter,
  Calendar,
  Printer,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  User,
  CreditCard,
  Eye,
  X
} from "lucide-react";
import { Sale } from "@/types";

export const SalesLedgerModule: React.FC = () => {
  const { sales, refundSale, currentBranch } = useApp();
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      s.cashierName.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "ALL" || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const totalInvoiced = filteredSales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">Sales Ledger & Invoices</h2>
          <p className="text-xs text-[#526848]">
            Complete transaction history for {currentBranch?.name}. Filter by payment methods, view breakdown or refund.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D5E5C4] text-xs font-bold text-[#2A3E1D] shadow-xs">
          Total Invoiced: <strong className="text-emerald-800 font-black">TZS {totalInvoiced.toLocaleString()}</strong>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657C58]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number, customer or cashier..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260D]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="py-2.5 px-3 rounded-xl neu-input text-xs font-bold text-[#263C16]"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="MPESA">M-Pesa</option>
            <option value="AIRTEL_MONEY">Airtel Money</option>
            <option value="CREDIT">Credit</option>
          </select>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#283D1B] flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#446517]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs">
        <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
          <thead className="bg-[#F8FAF4] font-bold text-[#4D6340] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Cashier</th>
              <th className="py-3 px-4">Items Breakdown</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
            {filteredSales.map((s) => (
              <tr key={s.id} className="hover:bg-[#F9FBF6] transition">
                <td className="py-3 px-4 font-black">{s.saleNumber}</td>
                <td className="py-3 px-4 font-medium">{s.customerName || "Walk-in Customer"}</td>
                <td className="py-3 px-4 text-[#48603C]">{s.cashierName}</td>
                <td className="py-3 px-4 text-[#536B47] max-w-[220px] truncate">
                  {s.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                </td>
                <td className="py-3 px-4 font-black">TZS {s.total.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-[#EDF3E6] font-bold text-[#20360B]">
                    {s.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      s.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-rose-100 text-rose-900 border border-rose-300"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-1.5">
                  <button
                    onClick={() => setSelectedSale(s)}
                    className="p-1.5 rounded-lg text-[#263C16] hover:bg-[#EDF3E6] transition"
                    title="View Breakdown"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg text-[#263C16] hover:bg-[#EDF3E6] transition"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {s.status === "COMPLETED" && (
                    <button
                      onClick={() => refundSale(s.id)}
                      className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition"
                      title="Issue Refund"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E4]">
              <div>
                <h3 className="font-black text-base text-[#162709]">Sale Invoice Details</h3>
                <span className="text-xs text-[#5D7351] font-mono">{selectedSale.saleNumber}</span>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="w-7 h-7 rounded-full bg-[#EDF3E6] flex items-center justify-center text-xs font-bold text-[#354D26]"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#4D6340]">
                <span>Customer:</span>
                <strong className="text-[#17290A]">{selectedSale.customerName || "Walk-in"}</strong>
              </div>
              <div className="flex justify-between text-[#4D6340]">
                <span>Processed by:</span>
                <strong className="text-[#17290A]">{selectedSale.cashierName}</strong>
              </div>
              <div className="flex justify-between text-[#4D6340]">
                <span>Payment Method:</span>
                <strong className="text-[#17290A]">{selectedSale.paymentMethod}</strong>
              </div>

              <div className="pt-2 border-t border-[#EDF4E4] font-bold text-[#162709] mb-1">Items:</div>
              {selectedSale.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 bg-[#F9FBF6] px-2 rounded-lg">
                  <span>{it.productName} × {it.quantity}</span>
                  <span className="font-black">TZS {it.total.toLocaleString()}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-[#EDF4E4] flex justify-between font-black text-sm text-[#152708]">
                <span>Total Amount:</span>
                <span>TZS {selectedSale.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl neu-btn-secondary text-xs font-bold"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="flex-1 py-2.5 rounded-xl neu-btn text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
