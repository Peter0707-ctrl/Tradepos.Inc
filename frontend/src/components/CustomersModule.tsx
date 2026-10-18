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
  Receipt,
  Search,
  MessageCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { Customer } from "@/types";

export const CustomersModule: React.FC = () => {
  const { customers, addCustomer, payCustomerDebt, addCustomerDebt, business, language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Manage Customer Debt Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [debtAction, setDebtAction] = useState<"PAY" | "ADD_DEBT">("PAY");
  const [debtAmount, setDebtAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

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

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-black text-[#172709] tracking-tight">
            {language === "sw" ? "Wateja & Daftari la Madeni" : "Customer CRM & Credit Ledger"}
          </h2>
          <p className="text-xs text-[#52654c]">
            {language === "sw"
              ? "Fuatilia salio la wateja, mauzo ya mikopo, kupunguza madeni na kuwakumbusha kwa WhatsApp."
              : "Track customer balances, credit purchases, debt settlements and loyalty rewards."}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-neu-flat"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "sw" ? "+ Ongeza Mteja Mpya" : "+ Add New Customer"}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">
            {language === "sw" ? "Jumla ya Madeni ya Wateja" : "Total Outstanding Credit / Debt"}
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            TZS {totalOutstandingDebt.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065]">
            {language === "sw" ? "Pesa inayodaiwa kutoka kwa wateja" : "Receivable from credit sales"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">
            {language === "sw" ? "Wateja Waliosajiliwa" : "Registered Customers"}
          </span>
          <p className="text-2xl font-black text-[#192b0c] mt-1">{customers.length}</p>
          <span className="text-[11px] text-[#6d8065]">
            {language === "sw" ? "Wateja wote kwenye daftari" : "Active customer directory"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">
            {language === "sw" ? "Thamani Yote ya Mauzo ya Wateja" : "Total Customer Lifetime Value"}
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            TZS {customers.reduce((a, b) => a + b.totalSpent, 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#6d8065]">
            {language === "sw" ? "Mauzo yote yaliyofanyika" : "Cumulative purchases"}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-3 relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#63785a]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            language === "sw"
              ? "Tafuta jina la mteja, namba ya simu au mtaa..."
              : "Search customer name, phone number or location..."
          }
          className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">{language === "sw" ? "Mteja" : "Customer"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Mawasiliano" : "Contact"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Mahali" : "Address"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Jumla Aliyonunua" : "Total Spending"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Deni Analodaiwa" : "Credit / Debt Balance"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Pointi" : "Loyalty Points"}</th>
              <th className="py-3 px-4 text-right">{language === "sw" ? "Vitendo" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {filteredCustomers.map((c) => {
              const cleanPhone = c.phone.replace(/[^0-9]/g, "");
              const waMsg = encodeURIComponent(
                `Habari ${c.name}, tunakukumbusha kwa upendo kuhusu salio la deni lako la TZS ${c.debtBalance.toLocaleString()} dukani ${business?.name || "kwetu"}. Karibu kulipia kwa Cash au Lipa Namba. Asante sana!`
              );
              return (
                <tr key={c.id} className="hover:bg-[#FAFCF7] transition">
                  <td className="py-3 px-4 font-bold text-sm">{c.name}</td>
                  <td className="py-3 px-4 text-[#4f6347]">
                    <span className="block font-medium">{c.phone}</span>
                    <span className="text-[11px] text-[#798e72]">{c.email || "—"}</span>
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
                        {language === "sw" ? "Hana Deni" : "Clean Balance"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#2e4714]">
                    ⭐ {c.loyaltyPoints} pts
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {c.debtBalance > 0 && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[11px] font-bold text-emerald-900 transition"
                        title={language === "sw" ? "Kumbusha kwa WhatsApp" : "Send WhatsApp Reminder"}
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
                      className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d6f798] border border-[#a5df4f] text-[11px] font-black text-[#1a2d0b] transition"
                    >
                      {c.debtBalance > 0
                        ? language === "sw"
                          ? "Lipa Deni"
                          : "Settle Debt"
                        : language === "sw"
                        ? "+ Kopesha"
                        : "+ Add Credit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DEBT PAYMENT / CREDIT RECORD MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-[#17270a]">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-[#54694c]">
                  {language === "sw" ? "Deni la Sasa: " : "Current Debt: "}
                  <strong className="text-amber-700 font-black">
                    TZS {selectedCustomer.debtBalance.toLocaleString()}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full bg-[#EDF3E6] text-[#2B3F1E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F7EB] rounded-xl border border-[#D8E6CC] mb-4">
              <button
                type="button"
                onClick={() => {
                  setDebtAction("PAY");
                  setDebtAmount(selectedCustomer.debtBalance > 0 ? selectedCustomer.debtBalance.toString() : "");
                }}
                className={`py-2 rounded-lg text-xs font-black transition ${
                  debtAction === "PAY"
                    ? "bg-[#E1FFAC] text-[#172A08] border border-[#9DDD37] shadow-xs"
                    : "text-[#526848]"
                }`}
              >
                {language === "sw" ? "1. Lipa / Punguza Deni" : "1. Pay / Reduce Debt"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDebtAction("ADD_DEBT");
                  setDebtAmount("");
                }}
                className={`py-2 rounded-lg text-xs font-black transition ${
                  debtAction === "ADD_DEBT"
                    ? "bg-amber-100 text-amber-950 border border-amber-300 shadow-xs"
                    : "text-[#526848]"
                }`}
              >
                {language === "sw" ? "2. Ongeza Deni Jipya" : "2. Record New Credit"}
              </button>
            </div>

            <form onSubmit={handleDebtSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  {debtAction === "PAY"
                    ? language === "sw"
                      ? "Kiasi Anacholipa Sasa (TZS)"
                      : "Amount Being Paid Now (TZS)"
                    : language === "sw"
                    ? "Kiasi cha Mkopo / Deni Jipya (TZS)"
                    : "New Credit Amount (TZS)"}
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                  placeholder="0"
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-black text-base text-[#17280a]"
                />
              </div>

              {debtAction === "PAY" && (
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">
                    {language === "sw" ? "Amelipa Kwa Njia Gani?" : "Payment Method"}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
                  >
                    <option value="CASH">{language === "sw" ? "Cash (Inaingia kwenye Droo)" : "Cash (Adds to Drawer)"}</option>
                    <option value="MPESA">M-Pesa / Lipa Namba</option>
                    <option value="AIRTEL_MONEY">Airtel Money / Tigo Pesa</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  {language === "sw" ? "Ghairi" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-black"
                >
                  {debtAction === "PAY"
                    ? language === "sw"
                      ? "Thibitisha Malipo"
                      : "Confirm Payment"
                    : language === "sw"
                    ? "Rekodi Deni"
                    : "Save Credit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up">
            <h3 className="text-lg font-black text-[#17270a] mb-4">
              {language === "sw" ? "Sajili Mteja Mpya Kwenye Daftari" : "Add Customer to Ledger"}
            </h3>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  {language === "sw" ? "Jina Kamili la Mteja" : "Full Customer Name"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mfano: Mama Neema"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  {language === "sw" ? "Namba ya Simu" : "Phone Number"}
                </label>
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
                <label className="block font-bold text-[#35482c] mb-1">
                  {language === "sw" ? "Barua Pepe (Hiari)" : "Email Address (Optional)"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@domain.com"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  {language === "sw" ? "Mahali / Mtaa Anaokaa" : "Physical Location"}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mfano: Kinondoni Mtaa wa Morogoro"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  {language === "sw" ? "Ghairi" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold"
                >
                  {language === "sw" ? "Hifadhi Mteja" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
