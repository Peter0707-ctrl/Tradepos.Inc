"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EmployeeAccount, SupportTicket } from "@/types";
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  Search,
  Activity,
  CheckCircle,
  XCircle,
  KeyRound,
  Wrench,
  LifeBuoy,
  AlertCircle,
  Clock,
  Plus,
  RefreshCw,
  Eye,
  Copy,
  Check,
  Filter,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Lock,
  Unlock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare
} from "lucide-react";

export const SuperAdminPanel: React.FC = () => {
  const {
    business,
    availableBusinesses,
    employees,
    supportTickets,
    adminUpdateEmployee,
    adminResetCredentials,
    adminExtendSubscription,
    adminUpdateTicket,
    adminCreateTicket,
    adminImpersonateStore,
    auditLogs,
    notifyCenter,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"tenants" | "users" | "support" | "audit">("tenants");
  const [search, setSearch] = useState("");

  // Sub-filters
  const [tenantFilter, setTenantFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "SUSPENDED">("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("ALL");

  // Reset Password/PIN Modal State
  const [resetModalUser, setResetModalUser] = useState<EmployeeAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Resolve Ticket Modal State
  const [resolveModalTicket, setResolveModalTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // New Ticket Modal State
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

  const allBusinesses = availableBusinesses.length > 0
    ? availableBusinesses
    : business
    ? [business]
    : [];

  // Helper to calculate days remaining
  const getSubscriptionInfo = (expiryStr?: string, status?: string) => {
    if (!expiryStr) {
      return { daysText: "Haijabainishwa", isExpired: false, daysCount: 0 };
    }
    const expiry = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffMs = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (status === "SUSPENDED") {
      return { daysText: "Akaunti Imesitishwa", isExpired: true, daysCount: diffDays };
    }
    if (diffDays < 0) {
      return {
        daysText: `Imeisha siku ${Math.abs(diffDays)} zilizopita`,
        isExpired: true,
        daysCount: diffDays,
      };
    }
    if (diffDays === 0) {
      return { daysText: "Inaisha leo!", isExpired: false, daysCount: 0 };
    }
    return {
      daysText: `Siku ${diffDays} zimebaki`,
      isExpired: false,
      daysCount: diffDays,
    };
  };

  // Map tenants with computed values
  const tenants = allBusinesses.map((biz) => {
    const ownerEmp = employees.find((e) => e.tenantId === biz.id && e.role === "OWNER");
    const staffList = employees.filter((e) => e.tenantId === biz.id);
    const planRate = biz.subscriptionPlan === "ENTERPRISE" ? 500000 : biz.subscriptionPlan === "BUSINESS" ? 300000 : 150000;
    const subInfo = getSubscriptionInfo(biz.subscriptionExpiry, biz.subscriptionStatus);
    const isActuallyExpired = subInfo.isExpired || biz.subscriptionStatus === "EXPIRED";
    const currentStatus = biz.subscriptionStatus === "SUSPENDED" ? "SUSPENDED" : isActuallyExpired ? "EXPIRED" : "ACTIVE";

    return {
      id: biz.id,
      name: biz.name,
      businessType: biz.businessType || "Biashara ya Jumla/Rejareja",
      location: biz.location || "Tanzania",
      owner: ownerEmp?.name || "Mmiliki Aliyejiandikisha",
      ownerPhone: ownerEmp?.phone || biz.phone || "",
      ownerEmail: ownerEmp?.email || biz.email || "",
      plan: biz.subscriptionPlan || "PROFESSIONAL",
      status: currentStatus,
      expiryDate: biz.subscriptionExpiry || "2026-12-31",
      daysInfo: subInfo.daysText,
      isExpired: isActuallyExpired,
      mrrAmount: currentStatus === "ACTIVE" ? planRate : 0,
      mrr: `TZS ${planRate.toLocaleString()}`,
      branches: biz.branches?.length || 1,
      staffCount: staffList.length || 1,
    };
  });

  // Filter Tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.owner.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerPhone.includes(search) ||
      t.location.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (tenantFilter === "ALL") return true;
    return t.status === tenantFilter;
  });

  // Filter Users
  const filteredUsers = employees.filter((emp) => {
    const parentBiz = allBusinesses.find((b) => b.id === emp.tenantId);
    const bizName = parentBiz?.name || "Biashara ya Mfano";
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.phone.includes(search) ||
      bizName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (userRoleFilter !== "ALL" && emp.role !== userRoleFilter) return false;
    if (userStatusFilter !== "ALL" && emp.status !== userStatusFilter) return false;
    return true;
  });

  // Filter Support Tickets
  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      ticket.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase()) ||
      ticket.contactPhone.includes(search);

    if (!matchesSearch) return false;
    if (ticketStatusFilter !== "ALL" && ticket.status !== ticketStatusFilter) return false;
    return true;
  });

  // Global Aggregate Stats
  const totalMrr = tenants.reduce((acc, t) => acc + t.mrrAmount, 0);
  const activeSubCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const expiredSubCount = tenants.filter((t) => t.status === "EXPIRED").length;
  const suspendedCount = tenants.filter((t) => t.status === "SUSPENDED").length;
  const totalUsersCount = employees.length;
  const openTicketsCount = supportTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  // Actions for Password/PIN Reset
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
    const text = `TradePOS - Taarifa za Kuingia Mfomoni:\nJina: ${resetModalUser.name}\nDuka: ${parentBiz?.name || "TradePOS Store"}\nSimu/Email: ${resetModalUser.phone || resetModalUser.email}\nNenosiri (Web): ${newPassword}\nPIN ya Mauzo (POS): ${newPin}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
      notifyCenter("Imenakiliwa", "Taarifa zimenakiliwa kwa ajili ya kumtumia mteja.", "SUCCESS");
    }
  };

  // Actions for Tickets
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

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden bg-[#F4F7EE]/95">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-[#172709] tracking-tight">
              Jopo Kuu la Usimamizi (Platform Super Admin)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1b2f09] text-[#E1FFAC] text-[10px] font-black tracking-wider uppercase">
              ROOT CONSOLE
            </span>
          </div>
          <p className="text-xs text-[#52654c] mt-0.5">
            Usimamizi wa maduka yote, usajili na vifurushi, watumiaji wote, utatuzi wa matatizo, na kurejesha nenosiri/PIN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1b2f09] hover:bg-[#253f0e] text-[#E1FFAC] font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Fungua Tiketi ya Msaada</span>
          </button>
        </div>
      </div>

      {/* Top Aggregated Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-5 shrink-0">
        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Maduka Yote</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{tenants.length} Maduka</p>
          <span className="text-[10px] text-[#6d8065]">Kwenye mfumo mzima</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Usajili Hai (Active)</span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">{activeSubCount} Maduka</p>
          <span className="text-[10px] text-emerald-700 font-bold">MRR: TZS {totalMrr.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Walioisha Muda (Expired)</span>
          <p className="text-xl font-black text-amber-700 mt-0.5">{expiredSubCount} Maduka</p>
          <span className="text-[10px] text-amber-700 font-semibold">{suspendedCount} wamesitishwa</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Watumiaji Wote</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{totalUsersCount} Akaunti</p>
          <span className="text-[10px] text-[#6d8065]">Wamiliki, Mameneja, Cashiers</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Matatizo & Tiketi</span>
          <p className={`text-xl font-black mt-0.5 ${openTicketsCount > 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {openTicketsCount} Ziko Wazi
          </p>
          <span className="text-[10px] text-[#6d8065]">Zinahitaji utatuzi</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#d8e6cc] pb-3 mb-4 shrink-0 overflow-x-auto">
        <button
          onClick={() => { setActiveTab("tenants"); setSearch(""); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "tenants"
              ? "bg-[#1b2f09] text-[#E1FFAC] shadow"
              : "bg-white text-[#384c31] border border-[#d6e5c5] hover:bg-[#edf4e4]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Maduka & Usajili (Subscriptions)</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">
            {tenants.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("users"); setSearch(""); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "users"
              ? "bg-[#1b2f09] text-[#E1FFAC] shadow"
              : "bg-white text-[#384c31] border border-[#d6e5c5] hover:bg-[#edf4e4]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Watumiaji Wote (All Users & Staff)</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("support"); setSearch(""); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "support"
              ? "bg-[#1b2f09] text-[#E1FFAC] shadow"
              : "bg-white text-[#384c31] border border-[#d6e5c5] hover:bg-[#edf4e4]"
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Desk ya Msaada & Matatizo (Support Desk)</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white text-[10px] font-black">
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("audit"); setSearch(""); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "audit"
              ? "bg-[#1b2f09] text-[#E1FFAC] shadow"
              : "bg-white text-[#384c31] border border-[#d6e5c5] hover:bg-[#edf4e4]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Kumbukumbu za Usalama (Audit Logs)</span>
        </button>
      </div>

      {/* Search and Sub-Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-3.5 shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65795e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "tenants"
                ? "Tafuta duka kwa jina, mmiliki, simu, au mahali..."
                : activeTab === "users"
                ? "Tafuta mtumiaji kwa jina, barua pepe, simu, au duka analofanyia kazi..."
                : activeTab === "support"
                ? "Tafuta tiketi kwa namba ya tiketi, duka, au maelezo ya shida..."
                : "Tafuta kumbukumbu..."
            }
            className="w-full py-2 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>

        {/* Sub-Filters specific to current tab */}
        {activeTab === "tenants" && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-[#55694f] mr-1">Hali ya Usajili:</span>
            {[
              { id: "ALL", label: "Wote" },
              { id: "ACTIVE", label: "Waliosubscribe (Hai)" },
              { id: "EXPIRED", label: "Walioisha Muda" },
              { id: "SUSPENDED", label: "Waliositishwa" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTenantFilter(f.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tenantFilter === f.id
                    ? "bg-[#1b2f09] text-[#E1FFAC]"
                    : "bg-white text-[#475b40] border border-[#d8e6cc] hover:bg-[#f0f6e9]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === "users" && (
          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-white border border-[#d8e6cc] text-xs font-bold text-[#233519]"
            >
              <option value="ALL">Vyeo Vyote</option>
              <option value="OWNER">Wamiliki (Owners)</option>
              <option value="MANAGER">Mameneja (Managers)</option>
              <option value="CASHIER">Wauzaji (Cashiers)</option>
              <option value="STOREKEEPER">Wasimamizi Stoo</option>
            </select>

            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-white border border-[#d8e6cc] text-xs font-bold text-[#233519]"
            >
              <option value="ALL">Hali Zote</option>
              <option value="Active">Akaunti Hai (Active)</option>
              <option value="Suspended">Akaunti Zilizofungwa</option>
            </select>
          </div>
        )}

        {activeTab === "support" && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: "ALL", label: "Tiketi Zote" },
              { id: "OPEN", label: "Zinazosubiri (Open)" },
              { id: "IN_PROGRESS", label: "Zinazoshughulikiwa" },
              { id: "RESOLVED", label: "Zilizotatuliwa" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTicketStatusFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  ticketStatusFilter === f.id
                    ? "bg-[#1b2f09] text-[#E1FFAC]"
                    : "bg-white text-[#475b40] border border-[#d8e6cc] hover:bg-[#f0f6e9]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: MADUKA & USAJILI (TENANTS & SUBSCRIPTIONS) */}
      {activeTab === "tenants" && (
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
          <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
            <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Duka & Mahali</th>
                <th className="py-3 px-4">Mmiliki & Mawasiliano</th>
                <th className="py-3 px-4">Kifurushi (Plan)</th>
                <th className="py-3 px-4">Mwisho wa Usajili</th>
                <th className="py-3 px-4">Hali ya Duka</th>
                <th className="py-3 px-4 text-right">Usimamizi wa Haraka (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#65795e]">
                    Hakuna maduka yaliyopatikana kwa kigezo hiki.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((ten) => (
                  <tr key={ten.id} className="hover:bg-[#FAFCF7] transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#18270b]">{ten.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6d8165] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#798e70]" />
                        <span>{ten.location}</span>
                        <span>•</span>
                        <span>{ten.branches} Matawi</span>
                        <span>•</span>
                        <span>{ten.staffCount} Watumiaji</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#233519]">{ten.owner}</div>
                      <div className="text-[11px] text-[#66795f] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#7a8f6f]" />
                          {ten.ownerPhone || "N/A"}
                        </span>
                        <span>{ten.ownerEmail}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#EDF2E8] font-black text-[#233516] text-[11px] border border-[#d2dec7]">
                        {ten.plan}
                      </span>
                      <div className="text-[10px] text-[#697d62] font-semibold mt-1">
                        {ten.mrr} / Mwezi
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-[#1c2c0f]">{ten.expiryDate}</div>
                      <div
                        className={`text-[11px] font-bold mt-0.5 ${
                          ten.status === "ACTIVE"
                            ? "text-emerald-700"
                            : ten.status === "EXPIRED"
                            ? "text-amber-700"
                            : "text-rose-700"
                        }`}
                      >
                        {ten.daysInfo}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ten.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : ten.status === "EXPIRED"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        {ten.status === "ACTIVE" ? "Hai (Subscribed)" : ten.status === "EXPIRED" ? "Imeisha Muda" : "Imesitishwa"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* +30 Days Action */}
                        <button
                          onClick={() => adminExtendSubscription(ten.id, 30, "ACTIVE")}
                          title="Ongeza siku 30 za usajili"
                          className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d5f795] text-[11px] font-black text-[#1a2d0b] border border-[#a8e053] transition cursor-pointer"
                        >
                          +30 Siku
                        </button>

                        {/* +7 Days Grace */}
                        <button
                          onClick={() => adminExtendSubscription(ten.id, 7, "ACTIVE")}
                          title="Ongeza siku 7 za msamaha (Grace period)"
                          className="px-2 py-1 rounded-lg bg-white hover:bg-[#edf5e3] text-[11px] font-bold text-[#35482e] border border-[#cbdbbc] transition cursor-pointer"
                        >
                          +7 Grace
                        </button>

                        {/* Toggle Suspend / Activate */}
                        <button
                          onClick={() =>
                            adminExtendSubscription(
                              ten.id,
                              0,
                              ten.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
                            )
                          }
                          title={ten.status === "SUSPENDED" ? "Rejesha Duka" : "Sitisha Duka"}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                            ten.status === "SUSPENDED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
                          }`}
                        >
                          {ten.status === "SUSPENDED" ? "Fungulia" : "Sitisha"}
                        </button>

                        {/* Impersonate / Support Access Mode */}
                        <button
                          onClick={() => adminImpersonateStore(ten.id)}
                          title="Ingia ndani ya duka hili kukagua matatizo"
                          className="px-2 py-1 rounded-lg bg-[#1b2f09] hover:bg-[#253f0e] text-[11px] font-bold text-[#E1FFAC] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Kagua</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: WATUMIAJI WOTE (ALL USERS & STAFF) */}
      {activeTab === "users" && (
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
          <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
            <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Mtumiaji (Jina & Email)</th>
                <th className="py-3 px-4">Namba ya Simu</th>
                <th className="py-3 px-4">Duka & Tawi</th>
                <th className="py-3 px-4">Cheo (Role)</th>
                <th className="py-3 px-4">PIN & Nenosiri</th>
                <th className="py-3 px-4">Hali ya Akaunti</th>
                <th className="py-3 px-4">Kuonekana</th>
                <th className="py-3 px-4 text-right">Usimamizi & Usalama</th>
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
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#18270b]">{emp.name}</div>
                        <div className="text-[11px] text-[#6d8165]">{emp.email}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-[#24351a]">
                        {emp.phone || "Hakuna simu"}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#233519]">{parentBiz?.name || "TradePOS Store"}</div>
                        <div className="text-[10px] text-[#6d8065]">{emp.branch}</div>
                      </td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4">
                        <div className="text-[11px] font-mono text-[#2c3d22]">
                          <span>PIN: {emp.pin ? "****" : "Haijawekwa"}</span>
                        </div>
                        <div className="text-[10px] text-[#677a5e]">
                          Password: {emp.password ? "Ipo" : "Ya Awali"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4 text-[11px] text-[#65795e]">
                        {emp.lastActive}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password / PIN Button */}
                          <button
                            onClick={() => handleOpenResetModal(emp)}
                            className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d6f798] text-[11px] font-bold text-[#1a2d0b] border border-[#a8e053] transition flex items-center gap-1 cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3" />
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
      )}

      {/* TAB 3: DESK YA MSAADA & MATATIZO (SUPPORT DESK) */}
      {activeTab === "support" && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card text-[#65795e]">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 mb-2 opacity-80" />
              <p className="font-bold text-sm text-[#18270b]">Hakuna tiketi za matatizo kwa sasa.</p>
              <p className="text-xs text-[#62775b] mt-1">Maduka yote yanafanya kazi bila hitilafu zozote zilizoripotiwa.</p>
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
                    {ticket.status === "RESOLVED" ? "Imetatuliwa" : ticket.status === "IN_PROGRESS" ? "Inashughulikiwa" : "Inasubiri"}
                  </span>
                </div>

                <div className="mb-2.5">
                  <h3 className="text-sm font-black text-[#172709]">{ticket.title}</h3>
                  <p className="text-xs text-[#3d5135] mt-1 leading-relaxed bg-[#fbfdf9] p-2.5 rounded-xl border border-[#e4eed7]">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#edf4e4]">
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
                    {/* Quick troubleshooting button depending on category */}
                    {ticket.category === "SUBSCRIPTION" && ticket.status !== "RESOLVED" && (
                      <button
                        onClick={() => {
                          adminExtendSubscription(ticket.tenantId, 30, "ACTIVE");
                          adminUpdateTicket(ticket.id, {
                            status: "RESOLVED",
                            resolutionNotes: "Usajili umeongezwa siku 30 mara moja na duka limefunguliwa.",
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] text-[#172709] font-black text-xs border border-[#9fdc46] hover:bg-[#d4f891] transition cursor-pointer"
                      >
                        Tatua: Ongeza Siku 30
                      </button>
                    )}

                    {ticket.category === "LOGIN_PASSWORD" && ticket.status !== "RESOLVED" && (
                      <button
                        onClick={() => {
                          const targetEmp = employees.find((e) => e.tenantId === ticket.tenantId);
                          if (targetEmp) {
                            handleOpenResetModal(targetEmp);
                          } else {
                            notifyCenter("Taarifa", "Tafadhali chagua mtumiaji kwenye kichupo cha Watumiaji Wote.", "INFO");
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] text-[#172709] font-black text-xs border border-[#9fdc46] hover:bg-[#d4f891] transition cursor-pointer"
                      >
                        Tatua: Reset PIN / Password
                      </button>
                    )}

                    {/* Support Diagnostic Access */}
                    <button
                      onClick={() => adminImpersonateStore(ticket.tenantId)}
                      className="px-2.5 py-1 rounded-lg bg-[#1b2f09] hover:bg-[#253f0e] text-[#E1FFAC] font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Kagua Duka</span>
                    </button>

                    {/* Mark Resolved Action */}
                    {ticket.status !== "RESOLVED" ? (
                      <button
                        onClick={() => handleOpenResolveModal(ticket)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Weka Imetatuliwa
                      </button>
                    ) : (
                      <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        Imetatuliwa: {ticket.resolvedAt || "Hivi karibuni"} ({ticket.assignedTo})
                      </div>
                    )}
                  </div>
                </div>

                {ticket.resolutionNotes && (
                  <div className="mt-2 text-[11px] text-emerald-900 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    <strong>Maelezo ya Utatuzi:</strong> {ticket.resolutionNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: KUMBUKUMBU ZA USALAMA (AUDIT TRAIL) */}
      {activeTab === "audit" && (
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card p-4">
          <div className="mb-3">
            <h3 className="text-sm font-black text-[#192b0c]">System Audit Logs & Security Overrides</h3>
            <p className="text-xs text-[#5a6e53]">Kumbukumbu ya kila mabadiliko ya nenosiri, uongezaji wa siku za usajili, na kaguzi za duka.</p>
          </div>

          <div className="space-y-2">
            {auditLogs.slice(0, 30).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#F9FBF6] border border-[#e2edd4] flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-[#1b2f09] text-[#E1FFAC]">
                      {log.action}
                    </span>
                    <span className="font-bold text-[#1f3214]">{log.userName}</span>
                  </div>
                  <p className="text-[#3c5034] mt-1 font-medium">{log.details}</p>
                </div>
                <span className="text-[10px] text-[#788c70] font-mono shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  PIN hii itatumiwa na mtumiaji kuingilia kwenye mashine ya mauzo (POS terminal).
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

      {/* MODAL: RESOLVE TICKET */}
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
                  placeholder="Eleza jinsi tatizo lilivyotatuliwa (Mfano: PIN ya mteja imewekwa upya na kujaribiwa; au Malipo ya M-Pesa yamethibitishwa na subscription kuongezwa siku 30)..."
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

      {/* MODAL: CREATE NEW TICKET */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-2xl w-full max-w-lg p-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6f0de] mb-4">
              <div>
                <h3 className="text-base font-black text-[#172709]">Fungua Tiketi Mpya ya Msaada</h3>
                <p className="text-xs text-[#52654c]">
                  Andika tatizo lililoripotiwa na mteja kupitia simu, WhatsApp, au barua pepe.
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
                  placeholder="Mfano: Akaunti imefungwa baada ya kukosea PIN mara tatu"
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
    </div>
  );
};
