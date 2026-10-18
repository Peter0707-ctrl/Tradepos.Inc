"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  PlusCircle,
  Search,
  MessageCircle,
  X
} from "lucide-react";
import { Customer } from "@/types";

export const CustomersModule: React.FC = () => {
  const { customers, addCustomer, payCustomerDebt, addCustomerDebt, business, language } = useApp();

  const [search, setSearch] = useState("");

  // Direct Inline Form State: Record Customer Name & Debt
  const [name, setName] = useState("");
  const [debtInput, setDebtInput] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Manage Existing Customer Debt Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [debtAction, setDebtAction] = useState<"PAY" | "ADD_DEBT">("PAY");
  const [debtAmount, setDebtAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const handleDirectRecordDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const amt = parseFloat(debtInput) || 0;

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || "+255 700 000 000",
      email: "",
      address: notes.trim() || "Mteja wa Dukani",
      initialDebt: amt,
    });

    setName("");
    setDebtInput("");
    setPhone("");
    setNotes("");
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amt = parseFloat(debtAmount);
    if (!amt || amt <= 0) return;

    if (debtAction === "PAY") {
      payCustomerDebt(selectedCustomer.id, amt, paymentMethod);
    } else {
      addCustomerDebt(selectedCustomer.id, amt);
    }

    setSelectedCustomer(null);
    setDebtAmount("");
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  const totalOutstandingDebt = customers.reduce((acc, c) => acc + c.debtBalance, 0);
  const customersWithDebtCount = customers.filter((c) => c.debtBalance > 0).length;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-black text-[#172709] tracking-tight">
          {language === "sw" ? "Wateja & Madeni" : "Customers & Debts"}
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-300 shadow-xs">
          <span className="text-xs font-bold text-[#5c7054] block">
            Jumla ya Madeni
          </span>
          <p className="text-xl font-black text-amber-800 mt-0.5">
            TZS {totalOutstandingDebt.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-900 font-bold">
            Wateja {customersWithDebtCount} wanadaiwa
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-xs">
          <span className="text-xs font-bold text-[#5c7054] block">
            Idadi ya Wateja
          </span>
          <p className="text-xl font-black text-[#192b0c] mt-0.5">{customers.length}</p>
          <span className="text-[11px] text-[#6d8065] font-bold">
            Waliosajiliwa
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-xs">
          <span className="text-xs font-bold text-[#5c7054] block">
            Jumla ya Manunuzi
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {customers.reduce((a, b) => a + b.totalSpent, 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065] font-bold">
            Thamani ya mauzo
          </span>
        </div>
      </div>

      {/* Main Grid: Left = Direct Form to Record Customer & Debt | Right = Customers & Debts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left: Direct Form to Record Customer Name & Debt */}
        <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
          <h3 className="font-black text-sm text-[#162709] mb-3 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#3A6112]" />
            <span>Andika Deni la Mteja</span>
          </h3>

          <form onSubmit={handleDirectRecordDebt} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Andika Jina la Mteja:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mfano: Mama Juma au David Kimaro..."
                className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Kiasi cha Deni Anachodaiwa (TZS):
              </label>
              <input
                type="number"
                min="0"
                required
                value={debtInput}
                onChange={(e) => setDebtInput(e.target.value)}
                placeholder="Mfano: 45000"
                className="w-full py-2.5 px-3 rounded-xl neu-input font-black text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Namba ya Simu (Hiari):
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255 7..."
                className="w-full py-2 px-3 rounded-xl neu-input"
              />
            </div>

            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Bidhaa Aliyochukua / Maelezo ya Deni:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mfano: Amechukua Nivea 2 kwa mkopo..."
                className="w-full py-2 px-3 rounded-xl neu-input"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl neu-btn font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              + Hifadhi Jina & Deni la Mteja
            </button>
          </form>
        </div>

        {/* Right: Customer & Debt Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dce8cd] p-4 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
            <div>
              <h3 className="font-black text-sm text-[#162709] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#233F0D]" />
                <span>Orodha ya Wateja & Madeni Yao</span>
              </h3>
              <p className="text-[11px] text-[#5B714F]">
                Bonyeza &ldquo;Lipa Deni&rdquo; mteja anapolipa au &ldquo;+ Kopesha&rdquo; kuongeza deni
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#63785a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tafuta jina la mteja..."
                className="py-1.5 pl-8 pr-3 rounded-xl neu-input text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto mt-3 flex-1">
            <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
              <thead className="bg-[#F8FAF4] font-bold text-[#44573d]">
                <tr>
                  <th className="py-2.5 px-3">Jina la Mteja</th>
                  <th className="py-2.5 px-3">Simu</th>
                  <th className="py-2.5 px-3">Maelezo / Mahali</th>
                  <th className="py-2.5 px-3">Deni Analodaiwa</th>
                  <th className="py-2.5 px-3 text-right">Hatua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
                {filteredCustomers.map((c) => {
                  const cleanPhone = c.phone.replace(/[^0-9]/g, "");
                  const waMsg = encodeURIComponent(
                    `Habari ${c.name}, tunakukumbusha kuhusu salio la deni lako la TZS ${c.debtBalance.toLocaleString()} dukani ${
                      business?.name || "kwetu"
                    }. Karibu kulipia. Asante!`
                  );
                  return (
                    <tr key={c.id} className="hover:bg-[#FAFCF7] transition">
                      <td className="py-3 px-3 font-extrabold text-sm text-[#162709]">{c.name}</td>
                      <td className="py-3 px-3 text-[#4f6347] font-medium">{c.phone}</td>
                      <td className="py-3 px-3 text-[#53664c]">{c.address || "—"}</td>
                      <td className="py-3 px-3">
                        {c.debtBalance > 0 ? (
                          <span className="inline-flex items-center gap-1 font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                            TZS {c.debtBalance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            Hana Deni
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {c.debtBalance > 0 && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[11px] font-bold text-emerald-900 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setDebtAction(c.debtBalance > 0 ? "PAY" : "ADD_DEBT");
                            setDebtAmount(c.debtBalance > 0 ? c.debtBalance.toString() : "");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d6f798] border border-[#a5df4f] text-[11px] font-black text-[#1a2d0b] transition cursor-pointer"
                        >
                          {c.debtBalance > 0 ? "Lipa Deni" : "+ Ongeza Deni"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DEBT PAYMENT / ADD DEBT MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-[#17270a]">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#54694c]">
                  Deni la Sasa:{" "}
                  <strong className="text-amber-700 font-black">
                    TZS {selectedCustomer.debtBalance.toLocaleString()}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setDebtAction("PAY")}
                className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer ${
                  debtAction === "PAY"
                    ? "bg-emerald-600 text-white"
                    : "bg-[#F4F8EC] text-[#35482c]"
                }`}
              >
                Punguza / Lipa Deni
              </button>
              <button
                type="button"
                onClick={() => setDebtAction("ADD_DEBT")}
                className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer ${
                  debtAction === "ADD_DEBT"
                    ? "bg-amber-600 text-white"
                    : "bg-[#F4F8EC] text-[#35482c]"
                }`}
              >
                + Ongeza Deni Jipya
              </button>
            </div>

            <form onSubmit={handleDebtSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">Kiasi (TZS)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-black text-base"
                />
              </div>

              {debtAction === "PAY" && (
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Amelipa Kwa Njia Gani?</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  >
                    <option value="CASH">Cash (Taslimu)</option>
                    <option value="MPESA">M-Pesa / Simu</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Ghairi
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl neu-btn font-black">
                  Thibitisha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
