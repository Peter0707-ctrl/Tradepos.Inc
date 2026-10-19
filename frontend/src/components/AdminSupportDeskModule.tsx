"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { SupportTicket, EmployeeAccount } from "@/types";
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle,
  Phone,
  Eye,
  KeyRound,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

export const AdminSupportDeskModule: React.FC = () => {
  const {
    supportTickets,
    availableBusinesses,
    business,
    employees,
    adminUpdateTicket,
    adminCreateTicket,
    adminExtendSubscription,
    adminResetCredentials,
    adminImpersonateStore,
    notifyCenter,
  } = useApp();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal States
  const [resolveModalTicket, setResolveModalTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    tenantId: "",
    reportedBy: "",
    contactPhone: "",
    title: "",
    description: "",
    category: "LOGIN_PASSWORD" as SupportTicket["category"],
    priority: "HIGH" as SupportTicket["priority"],
  });

  // Password reset modal inside support desk
  const [resetModalUser, setResetModalUser] = useState<EmployeeAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const allBusinesses = availableBusinesses.length > 0
    ? availableBusinesses
    : business
    ? [business]
    : [];

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      ticket.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase()) ||
      ticket.contactPhone.includes(search);

    if (!matchesSearch) return false;
    if (statusFilter !== "ALL" && ticket.status !== statusFilter) return false;
    return true;
  });

  const openTickets = supportTickets.filter((t) => t.status === "OPEN").length;
  const inProgressTickets = supportTickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedTickets = supportTickets.filter((t) => t.status === "RESOLVED").length;

  const handleOpenResolveModal = (ticket: SupportTicket) => {
    setResolveModalTicket(ticket);
    setResolutionNotes(ticket.resolutionNotes || "Tatizo limetatuliwa kikamilifu baada ya mawasiliano na mteja.");
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalTicket) return;
    adminUpdateTicket(resolveModalTicket.id, {
      status: "RESOLVED",
      resolutionNotes: resolutionNotes.trim(),
    });
    setResolveModalTicket(null);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.tenantId || !newTicketForm.title || !newTicketForm.description) {
      notifyCenter("Hitilafu", "Tafadhali jaza taarifa zote muhimu.", "ERROR");
      return;
    }
    const selectedBiz = allBusinesses.find((b) => b.id === newTicketForm.tenantId);
    adminCreateTicket({
      tenantId: newTicketForm.tenantId,
      tenantName: selectedBiz?.name || "Mteja wa TradePOS",
      reportedBy: newTicketForm.reportedBy.trim() || selectedBiz?.name || "Mteja",
      contactPhone: newTicketForm.contactPhone.trim() || selectedBiz?.phone || "",
      title: newTicketForm.title.trim(),
      description: newTicketForm.description.trim(),
      category: newTicketForm.category,
      priority: newTicketForm.priority,
      status: "OPEN",
    });
    setIsNewTicketModalOpen(false);
    setNewTicketForm({
      tenantId: "",
      reportedBy: "",
      contactPhone: "",
      title: "",
      description: "",
      category: "LOGIN_PASSWORD",
      priority: "HIGH",
    });
  };

  const handleOpenResetModalForStore = (tenantId: string) => {
    const targetEmp = employees.find((e) => e.tenantId === tenantId);
    if (targetEmp) {
      setResetModalUser(targetEmp);
      setNewPassword(targetEmp.password || "TradePOS2026#");
      setNewPin(targetEmp.pin || "1234");
      setCopiedSuccess(false);
    } else {
      notifyCenter("Taarifa", "Akaunti ya mtumiaji haikupatikana kwa duka hili.", "INFO");
    }
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
    const text = `TradePOS - Taarifa Mpya za Kuingia:\nJina: ${resetModalUser.name}\nDuka: ${parentBiz?.name || "TradePOS Store"}\nSimu/Email: ${resetModalUser.phone || resetModalUser.email}\nNenosiri (Web): ${newPassword}\nPIN ya Mauzo (POS): ${newPin}`;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-[#172709] tracking-tight">
              Desk ya Msaada
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1b2f09] text-[#E1FFAC] text-[10px] font-black tracking-wider uppercase">
              SUPPORT
            </span>
          </div>
          <p className="text-xs text-[#52654c] mt-0.5">
            Utatuzi wa matatizo ya wateja (PIN, vifurushi, printi).
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[#1b2f09] hover:bg-[#253f0e] text-[#E1FFAC] font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Fungua Tiketi</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4 shrink-0">
        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Tiketi Zote</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{supportTickets.length}</p>
          <span className="text-[10px] text-[#6d8065]">Jumla</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Open</span>
          <p className={`text-xl font-black mt-0.5 ${openTickets > 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {openTickets}
          </p>
          <span className="text-[10px] text-rose-700 font-semibold">Zinazosubiri</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">In Progress</span>
          <p className="text-xl font-black text-amber-700 mt-0.5">{inProgressTickets}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Zinazoshughulikiwa</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Resolved</span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">{resolvedTickets}</p>
          <span className="text-[10px] text-emerald-700 font-bold">Zilizotatuliwa</span>
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
            placeholder="Tafuta tiketi kwa namba au duka..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "ALL", label: "Zote" },
            { id: "OPEN", label: "Open" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "RESOLVED", label: "Resolved" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === f.id
                  ? "bg-[#1b2f09] text-[#E1FFAC] shadow"
                  : "bg-white text-[#475b40] border border-[#d8e6cc] hover:bg-[#f0f6e9]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto space-y-3.5">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card text-[#65795e]">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 mb-2 opacity-80" />
            <p className="font-bold text-sm text-[#18270b]">Hakuna tiketi za matatizo kwa sasa.</p>
            <p className="text-xs text-[#62775b] mt-1">Maduka yote yanafanya kazi salama bila hitilafu zilizoripotiwa.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 rounded-2xl bg-white border border-[#dce8cd] shadow-neu-card hover:border-[#b9ce9f] transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-[#1b2f09] text-[#E1FFAC]">
                    {ticket.ticketNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      ticket.priority === "HIGH"
                        ? "bg-rose-100 text-rose-900 border border-rose-300"
                        : "bg-slate-100 text-slate-800 border border-slate-300"
                    }`}
                  >
                    {ticket.priority} PRIORITY
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#edf4e3] text-[#2b3e21] text-[10px] font-bold border border-[#d2dfc6]">
                    {ticket.category === "LOGIN_PASSWORD"
                      ? "Nenosiri & PIN"
                      : ticket.category === "SUBSCRIPTION"
                      ? "Usajili & Malipo"
                      : ticket.category === "POS_HARDWARE"
                      ? "POS & Printi"
                      : ticket.category === "STOCK_INVENTORY"
                      ? "Stoo & Bidhaa"
                      : "Jumla"}
                  </span>
                  <span className="text-[11px] text-[#718569] font-medium">• {ticket.createdAt}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider self-start ${
                    ticket.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : ticket.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-rose-100 text-rose-900 border border-rose-300"
                  }`}
                >
                  {ticket.status === "RESOLVED" ? "Resolved" : ticket.status === "IN_PROGRESS" ? "In Progress" : "Open"}
                </span>
              </div>

              <div className="mb-3">
                <h3 className="text-sm font-black text-[#172709]">{ticket.title}</h3>
                <p className="text-xs text-[#3d5135] mt-1.5 leading-relaxed bg-[#fbfdf9] p-3 rounded-xl border border-[#e4eed7]">
                  {ticket.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[#edf4e4]">
                <div className="text-xs text-[#52664c] flex items-center gap-3 flex-wrap">
                  <span>
                    Duka: <strong className="text-[#192b0c]">{ticket.tenantName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Mtoa Taarifa: <strong>{ticket.reportedBy}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-[#6c8163]" />
                    {ticket.contactPhone}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Fix: Subscription */}
                  {ticket.category === "SUBSCRIPTION" && ticket.status !== "RESOLVED" && (
                    <button
                      onClick={() => {
                        adminExtendSubscription(ticket.tenantId, 30, "ACTIVE");
                        adminUpdateTicket(ticket.id, {
                          status: "RESOLVED",
                          resolutionNotes: "Usajili umeongezwa siku 30 mara moja na duka limefunguliwa.",
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#E1FFAC] text-[#172709] font-black text-xs border border-[#9fdc46] hover:bg-[#d4f891] transition cursor-pointer"
                    >
                      Tatua: Ongeza Siku 30
                    </button>
                  )}

                  {/* Quick Fix: Login / Password */}
                  {ticket.category === "LOGIN_PASSWORD" && ticket.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleOpenResetModalForStore(ticket.tenantId)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#E1FFAC] text-[#172709] font-black text-xs border border-[#9fdc46] hover:bg-[#d4f891] transition cursor-pointer"
                    >
                      Tatua: Reset PIN / Password
                    </button>
                  )}

                  {/* Diagnostic Store Access */}
                  <button
                    onClick={() => adminImpersonateStore(ticket.tenantId)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1b2f09] hover:bg-[#253f0e] text-[#E1FFAC] font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Kagua Duka</span>
                  </button>

                  {/* Resolve Button */}
                  {ticket.status !== "RESOLVED" ? (
                    <button
                      onClick={() => handleOpenResolveModal(ticket)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow"
                    >
                      Weka Imetatuliwa
                    </button>
                  ) : (
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Imetatuliwa: {ticket.resolvedAt || "Hivi karibuni"} ({ticket.assignedTo})
                    </div>
                  )}
                </div>
              </div>

              {ticket.resolutionNotes && (
                <div className="mt-2.5 text-[11px] text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  <strong>Maelezo ya Utatuzi:</strong> {ticket.resolutionNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* RESOLVE TICKET MODAL */}
      {resolveModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-2xl w-full max-w-md p-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6f0de] mb-4">
              <div>
                <h3 className="text-base font-black text-[#172709]">Weka Tatizo Kama Limetatuliwa</h3>
                <p className="text-xs text-[#52654c]">
                  Tiketi: <strong>{resolveModalTicket.ticketNumber}</strong> ({resolveModalTicket.tenantName})
                </p>
              </div>
              <button
                onClick={() => setResolveModalTicket(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#233519] mb-1">
                  Maelezo ya Utatuzi (Resolution Notes)
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Eleza jinsi tatizo lilivyotatuliwa..."
                  required
                  className="w-full p-2.5 rounded-xl neu-input text-xs text-[#1c2e0e]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalTicket(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary text-xs font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer transition shadow"
                >
                  Thibitisha Utatuzi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TICKET MODAL */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-2xl w-full max-w-lg p-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6f0de] mb-4">
              <div>
                <h3 className="text-base font-black text-[#172709]">Fungua Tiketi Mpya ya Msaada</h3>
                <p className="text-xs text-[#52654c]">
                  Andika tatizo lililoripotiwa na mteja kupitia simu au WhatsApp.
                </p>
              </div>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#233519] mb-1">Chagua Duka la Mteja</label>
                <select
                  value={newTicketForm.tenantId}
                  onChange={(e) => {
                    const sel = allBusinesses.find((b) => b.id === e.target.value);
                    setNewTicketForm((prev) => ({
                      ...prev,
                      tenantId: e.target.value,
                      reportedBy: sel?.name || prev.reportedBy,
                      contactPhone: sel?.phone || prev.contactPhone,
                    }));
                  }}
                  required
                  className="w-full p-2.5 rounded-xl neu-input text-xs font-bold text-[#1c2e0e]"
                >
                  <option value="">-- Chagua Duka --</option>
                  {allBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.phone || b.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#233519] mb-1">Mtoa Taarifa</label>
                  <input
                    type="text"
                    value={newTicketForm.reportedBy}
                    onChange={(e) => setNewTicketForm((prev) => ({ ...prev, reportedBy: e.target.value }))}
                    placeholder="Mfano: Amina Juma (Cashier)"
                    required
                    className="w-full p-2.5 rounded-xl neu-input text-xs text-[#1c2e0e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#233519] mb-1">Namba ya Simu</label>
                  <input
                    type="text"
                    value={newTicketForm.contactPhone}
                    onChange={(e) => setNewTicketForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+255 7..."
                    required
                    className="w-full p-2.5 rounded-xl neu-input text-xs font-mono text-[#1c2e0e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#233519] mb-1">Aina ya Tatizo</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm((prev) => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl neu-input text-xs font-bold text-[#1c2e0e]"
                  >
                    <option value="LOGIN_PASSWORD">Nenosiri / PIN ya POS</option>
                    <option value="SUBSCRIPTION">Usajili & Malipo ya Kifurushi</option>
                    <option value="POS_HARDWARE">Mashine ya POS & Printer</option>
                    <option value="STOCK_INVENTORY">Stoo, Bidhaa & Mauzo</option>
                    <option value="GENERAL">Swali la Jumla / Msaada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#233519] mb-1">Kipaumbele (Priority)</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm((prev) => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl neu-input text-xs font-bold text-[#1c2e0e]"
                  >
                    <option value="HIGH">Kikubwa (High Priority)</option>
                    <option value="MEDIUM">Kawaida (Medium)</option>
                    <option value="NORMAL">Cha Chini (Normal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#233519] mb-1">Kichwa cha Habari</label>
                <input
                  type="text"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Mfano: Cashier amesahau PIN ya POS"
                  required
                  className="w-full p-2.5 rounded-xl neu-input text-xs font-bold text-[#1c2e0e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#233519] mb-1">Maelezo Kamili ya Tatizo</label>
                <textarea
                  rows={3}
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Eleza kwa ufasaha tatizo analokumbana nalo mteja..."
                  required
                  className="w-full p-2.5 rounded-xl neu-input text-xs text-[#1c2e0e]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary text-xs font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn text-xs font-black cursor-pointer"
                >
                  Sajili Tiketi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD / PIN MODAL */}
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
                    onClick={() => {
                      const randomPass = "Pass" + Math.floor(100 + Math.random() * 900) + "!";
                      setNewPassword(randomPass);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Zalisha</span>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#233519]">PIN ya Mauzo (POS 4-Digit PIN)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPin = String(Math.floor(1000 + Math.random() * 9000));
                      setNewPin(randomPin);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Zalisha PIN</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Tarakimu 4"
                  required
                  className="w-full p-2.5 rounded-xl neu-input text-xs font-mono font-black text-[#1c2e0e] tracking-widest text-center text-lg"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF4] border border-[#dce8cd] text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#203215]">Taarifa za Kumtumia Mteja:</span>
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
