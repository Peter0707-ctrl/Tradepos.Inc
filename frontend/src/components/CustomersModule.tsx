"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  Plus,
  Phone,
  DollarSign,
  Award,
  Calendar,
  AlertCircle,
  Receipt
} from "lucide-react";

export const CustomersModule: React.FC = () => {
  const { customers, addCustomer } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addCustomer({
      name,
      phone,
      email,
      address,
    });
    setIsModalOpen(false);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
  };

  const totalOutstandingDebt = customers.reduce((acc, c) => acc + c.debtBalance, 0);

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#172709] tracking-tight">
            Customer CRM & Credit Ledger
          </h2>
          <p className="text-xs text-[#52654c]">
            Track customer balances, credit purchases, installment settlements and loyalty rewards.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-neu-flat"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">Total Outstanding Credit / Debt</span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            TZS {totalOutstandingDebt.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065]">Receivable from credit sales</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">Registered Customers</span>
          <p className="text-2xl font-black text-[#192b0c] mt-1">{customers.length}</p>
          <span className="text-[11px] text-[#6d8065]">Active customer directory</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">Total Customer Lifetime Value</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            TZS {customers.reduce((a, b) => a + b.totalSpent, 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065]">Cumulative purchases</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Address</th>
              <th className="py-3 px-4">Total Spending</th>
              <th className="py-3 px-4">Credit / Debt Balance</th>
              <th className="py-3 px-4">Loyalty Points</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-[#FAFCF7] transition">
                <td className="py-3 px-4 font-bold text-sm">{c.name}</td>
                <td className="py-3 px-4 text-[#4f6347]">
                  <span className="block font-medium">{c.phone}</span>
                  <span className="text-[11px] text-[#798e72]">{c.email || "No email"}</span>
                </td>
                <td className="py-3 px-4 text-[#53664c]">{c.address || "—"}</td>
                <td className="py-3 px-4 font-bold">TZS {c.totalSpent.toLocaleString()}</td>
                <td className="py-3 px-4">
                  {c.debtBalance > 0 ? (
                    <span className="inline-flex items-center gap-1 font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                      TZS {c.debtBalance.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Clean Balance
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-bold text-[#2e4714]">
                  ⭐ {c.loyaltyPoints} pts
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d6f798] text-[11px] font-bold text-[#1a2d0b]">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up">
            <h3 className="text-lg font-black text-[#17270a] mb-4">
              Add Customer to Ledger
            </h3>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">Full Customer Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mama Neema"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 7..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@domain.com"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Physical Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Kinondoni Mtaa wa Morogoro"
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
