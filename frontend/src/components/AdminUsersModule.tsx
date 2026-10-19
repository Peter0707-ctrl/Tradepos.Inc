"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EmployeeAccount } from "@/types";
import {
  Users,
  Search,
  KeyRound,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Check,
  XCircle,
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export const AdminUsersModule: React.FC = () => {
  const {
    employees,
    availableBusinesses,
    business,
    adminUpdateEmployee,
    adminResetCredentials,
    notifyCenter,
  } = useApp();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Reset Modal state
  const [resetModalUser, setResetModalUser] = useState<EmployeeAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const allBusinesses = availableBusinesses.length > 0
    ? availableBusinesses
    : business
    ? [business]
    : [];

  const filteredUsers = employees.filter((emp) => {
    const parentBiz = allBusinesses.find((b) => b.id === emp.tenantId);
    const bizName = parentBiz?.name || "Biashara";
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.phone.includes(search) ||
      bizName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter !== "ALL" && emp.role !== roleFilter) return false;
    if (statusFilter !== "ALL" && emp.status !== statusFilter) return false;
    return true;
  });

  const ownersCount = employees.filter((e) => e.role === "OWNER").length;
  const managersCount = employees.filter((e) => e.role === "MANAGER").length;
  const cashiersCount = employees.filter((e) => e.role === "CASHIER").length;
  const suspendedCount = employees.filter((e) => e.status === "Suspended").length;

  const handleOpenResetModal = (emp: EmployeeAccount) => {
    setResetModalUser(emp);
    setNewPassword(emp.password || "TradePOS2026#");
    setNewPin(emp.pin || "1234");
    setCopiedSuccess(false);
  };

  const handleGenerateRandomCredentials = () => {
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    const randomPass = "Pass" + Math.floor(100 + Math.random() * 900) + "!";
    setNewPin(randomPin);
    setNewPassword(randomPass);
  };

  const handleSaveResetCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (newPin && !/^\d{4}$/.test(newPin)) {
      notifyCenter("Hitilafu", "Tafadhali weka PIN ya tarakimu 4 pekee.", "ERROR");
      return;
    }
    adminResetCredentials(resetModalUser.id, newPassword, newPin);
    setResetModalUser(null);
  };

  const handleCopyCredentials = () => {
    if (!resetModalUser) return;
    const parentBiz = allBusinesses.find((b) => b.id === resetModalUser.tenantId);
    const text = `TradePOS - Taarifa Mpya za Kuingia Mfomoni:\nJina: ${resetModalUser.name}\nDuka: ${parentBiz?.name || "TradePOS Store"}\nSimu/Email: ${resetModalUser.phone || resetModalUser.email}\nNenosiri (Web): ${newPassword}\nPIN ya Mauzo (POS): ${newPin}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
      notifyCenter("Imenakiliwa", "Taarifa zimenakiliwa kwa ajili ya kumtumia mteja.", "SUCCESS");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden bg-[#F4F7EE]/95">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-[#172709] tracking-tight">
              Watumiaji Wote wa Mfumo (All Users & Staff Directory)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1b2f09] text-[#E1FFAC] text-[10px] font-black tracking-wider uppercase">
              USER DIRECTORY
            </span>
          </div>
          <p className="text-xs text-[#52654c] mt-0.5">
            Kagua watumiaji wote, weka upya nenosiri au PIN za POS, na dhibiti hali ya akaunti zao.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-5 shrink-0">
        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Watumiaji Wote</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{employees.length} Akaunti</p>
          <span className="text-[10px] text-[#6d8065]">Kwenye maduka yote</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Wamiliki (Owners)</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{ownersCount}</p>
          <span className="text-[10px] text-emerald-700 font-bold">Wenye maduka</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Mameneja</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{managersCount}</p>
          <span className="text-[10px] text-[#6d8065]">Wasimamizi wa matawi</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Wauzaji (Cashiers)</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{cashiersCount}</p>
          <span className="text-[10px] text-[#6d8065]">Watumiaji wa POS</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Zilizofungwa</span>
          <p className={`text-xl font-black mt-0.5 ${suspendedCount > 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {suspendedCount}
          </p>
          <span className="text-[10px] text-[#6d8065]">Akaunti zilizositishwa</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65795e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta kwa jina, barua pepe, namba ya simu, au duka analofanyia kazi..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-[#d8e6cc] text-xs font-bold text-[#233519]"
          >
            <option value="ALL">Vyeo Vyote</option>
            <option value="OWNER">Wamiliki (Owners)</option>
            <option value="MANAGER">Mameneja (Managers)</option>
            <option value="CASHIER">Wauzaji (Cashiers)</option>
            <option value="STOREKEEPER">Wasimamizi Stoo</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-[#d8e6cc] text-xs font-bold text-[#233519]"
          >
            <option value="ALL">Hali Zote</option>
            <option value="Active">Akaunti Hai (Active)</option>
            <option value="Suspended">Akaunti Zilizofungwa</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3.5 px-4">Mtumiaji (Jina & Email)</th>
              <th className="py-3.5 px-4">Namba ya Simu</th>
              <th className="py-3.5 px-4">Duka & Tawi</th>
              <th className="py-3.5 px-4">Cheo (Role)</th>
              <th className="py-3.5 px-4">PIN & Nenosiri</th>
              <th className="py-3.5 px-4">Hali ya Akaunti</th>
              <th className="py-3.5 px-4">Mara ya Mwisho Kuonekana</th>
              <th className="py-3.5 px-4 text-right">Usimamizi & Usalama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#65795e]">
                  Hakuna watumiaji waliopatikana kwa vigezo hivi.
                </td>
              </tr>
            ) : (
              filteredUsers.map((emp) => {
                const parentBiz = allBusinesses.find((b) => b.id === emp.tenantId);
                return (
                  <tr key={emp.id} className="hover:bg-[#FAFCF7] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#18270b]">{emp.name}</div>
                      <div className="text-[11px] text-[#6d8165]">{emp.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-[#24351a]">
                      {emp.phone || "Hakuna simu"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#233519]">{parentBiz?.name || "TradePOS Store"}</div>
                      <div className="text-[10px] text-[#6d8065]">{emp.branch}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${
                          emp.role === "OWNER"
                            ? "bg-[#1b2f09] text-[#E1FFAC]"
                            : emp.role === "MANAGER"
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : emp.role === "CASHIER"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] font-mono text-[#2c3d22]">
                        <span>PIN: {emp.pin ? "****" : "Haijawekwa"}</span>
                      </div>
                      <div className="text-[10px] text-[#677a5e]">
                        Password: {emp.password ? "Ipo" : "Ya Awali"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === "Active"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        {emp.status === "Active" ? "Inafanya Kazi" : "Imefungwa"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[#65795e]">
                      {emp.lastActive}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reset Password / PIN Button */}
                        <button
                          onClick={() => handleOpenResetModal(emp)}
                          className="px-3 py-1.5 rounded-lg bg-[#E1FFAC] hover:bg-[#d6f798] text-[11px] font-bold text-[#1a2d0b] border border-[#a8e053] transition flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Pass/PIN</span>
                        </button>

                        {/* Block / Unblock Toggle */}
                        <button
                          onClick={() =>
                            adminUpdateEmployee(emp.id, {
                              status: emp.status === "Active" ? "Suspended" : "Active",
                            })
                          }
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            emp.status === "Active"
                              ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                          title={emp.status === "Active" ? "Funga Akaunti" : "Fungua Akaunti"}
                        >
                          {emp.status === "Active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: RESET PASSWORD & PIN */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-2xl w-full max-w-md p-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6f0de] mb-4">
              <div>
                <h3 className="text-base font-black text-[#172709]">Weka Upya Nenosiri & PIN</h3>
                <p className="text-xs text-[#52654c]">
                  Mtumiaji: <strong>{resetModalUser.name}</strong> ({resetModalUser.role})
                </p>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetCredentials} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#233519]">Nenosiri Mpya (Web Login Password)</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCredentials}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Zalisha ya Haraka</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mfano: TradePOS2026#"
                  required
                  className="w-full p-2.5 rounded-xl neu-input text-xs font-mono font-bold text-[#1c2e0e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#233519] mb-1">
                  PIN ya Mauzo (POS 4-Digit PIN)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Tarakimu 4 (Mfano: 1234)"
                  required
                  className="w-full p-2.5 rounded-xl neu-input text-xs font-mono font-black text-[#1c2e0e] tracking-widest text-center text-lg"
                />
                <span className="text-[11px] text-[#6d8065] mt-1 block">
                  PIN hii itatumiwa na muuzaji kuingilia kwenye mashine ya mauzo (POS terminal).
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF4] border border-[#dce8cd] text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#203215]">Taarifa za Kumtumia Mteja (WhatsApp/SMS):</span>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="px-2 py-1 rounded-md bg-[#E1FFAC] hover:bg-[#d5f793] text-[11px] font-bold text-[#172709] border border-[#a2df4d] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSuccess ? "Imenakiliwa!" : "Nakili"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#55694f] font-mono leading-relaxed bg-white p-2 rounded-lg border border-[#e5efda]">
                  Simu: {resetModalUser.phone || resetModalUser.email}<br />
                  Password: {newPassword}<br />
                  POS PIN: {newPin}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary text-xs font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn text-xs font-black cursor-pointer"
                >
                  Hifadhi & Fungua Akaunti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
