"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  Users,
  LifeBuoy,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Server,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Phone,
  MapPin,
  Plus
} from "lucide-react";

interface AdminDashboardModuleProps {
  onNavigate: (module: string) => void;
}

export const AdminDashboardModule: React.FC<AdminDashboardModuleProps> = ({ onNavigate }) => {
  const {
    availableBusinesses,
    business,
    employees,
    supportTickets,
    auditLogs,
    adminExtendSubscription,
    adminImpersonateStore,
  } = useApp();

  const allBusinesses = availableBusinesses.length > 0
    ? availableBusinesses
    : business
    ? [business]
    : [];

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
      return { daysText: "Imesitishwa", isExpired: true, daysCount: diffDays };
    }
    if (diffDays < 0) {
      return {
        daysText: `Imeisha siku ${Math.abs(diffDays)} zilizopita`,
        isExpired: true,
        daysCount: diffDays,
      };
    }
    if (diffDays === 0) {
      return { daysText: "Inaisha leo", isExpired: false, daysCount: 0 };
    }
    return {
      daysText: `Zimebaki siku ${diffDays}`,
      isExpired: false,
      daysCount: diffDays,
    };
  };

  const tenantsData = allBusinesses.map((b) => {
    const ownerEmp = employees.find((e) => e.tenantId === b.id && e.role === "OWNER");
    const staffCount = employees.filter((emp) => emp.tenantId === b.id).length;
    const planRate = b.subscriptionPlan === "ENTERPRISE" ? 500000 : b.subscriptionPlan === "BUSINESS" ? 300000 : 150000;
    const subInfo = getSubscriptionInfo(b.subscriptionExpiry, b.subscriptionStatus);
    const isActuallyExpired = subInfo.isExpired || b.subscriptionStatus === "EXPIRED";
    const currentStatus = (b.subscriptionStatus === "SUSPENDED" ? "SUSPENDED" : isActuallyExpired ? "EXPIRED" : "ACTIVE") as "ACTIVE" | "EXPIRED" | "SUSPENDED";

    return {
      id: b.id,
      name: b.name,
      owner: ownerEmp?.name || "Mmiliki Aliyejiandikisha",
      ownerPhone: ownerEmp?.phone || b.phone || "",
      ownerEmail: ownerEmp?.email || b.email || "",
      location: b.location || "Dar es Salaam",
      plan: b.subscriptionPlan || "PROFESSIONAL",
      expiryDate: b.subscriptionExpiry || "2026-12-31",
      daysInfo: subInfo.daysText,
      status: currentStatus,
      mrr: currentStatus === "ACTIVE" ? planRate : 0,
      staffCount: staffCount > 0 ? staffCount : 1,
      branches: b.branches?.length || 1,
    };
  });

  const activeTenants = tenantsData.filter((t) => t.status === "ACTIVE");
  const expiredTenants = tenantsData.filter((t) => t.status === "EXPIRED");
  const suspendedTenants = tenantsData.filter((t) => t.status === "SUSPENDED");
  const totalMrr = activeTenants.reduce((acc, t) => acc + t.mrr, 0);

  const openTickets = (supportTickets || []).filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const resolvedTickets = (supportTickets || []).filter((t) => t.status === "RESOLVED");

  // Format today's date in Swahili
  const currentDateFormatted = new Date().toLocaleDateString("sw-TZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col h-full bg-[#F4F7EE] p-3 sm:p-5 overflow-y-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 shrink-0 bg-white p-4 rounded-2xl border border-[#d8e6cc] shadow-neu-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1b2f09] text-[#E1FFAC] text-[10px] font-black uppercase tracking-wider">
              ADMIN CONSOLE
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Mfumo Uko Online (100% Uptime)</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#152508] tracking-tight">
            Dashibodi Kuu ya Mfumo
          </h1>
          <p className="text-xs text-[#52654c] mt-0.5">
            Muhtasari wa maduka, watumiaji, mapato ya kila mwezi (MRR), na desk ya msaada • {currentDateFormatted}
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate("admin-tenants")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#233519] border border-[#d8e6cc] hover:bg-[#f0f6e9] text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-[#55694f]" />
            <span>Maduka ({tenantsData.length})</span>
          </button>
          <button
            onClick={() => onNavigate("admin-users")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#233519] border border-[#d8e6cc] hover:bg-[#f0f6e9] text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-[#55694f]" />
            <span>Watumiaji ({employees.length})</span>
          </button>
          <button
            onClick={() => onNavigate("admin-support")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b2f09] hover:bg-[#253e0d] text-[#E1FFAC] border border-[#8ece28] text-xs font-black transition cursor-pointer shadow-xs"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Desk ya Msaada</span>
            {openTickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {openTickets.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5 shrink-0">
        {/* KPI 1: Mapato ya Mwezi (MRR) */}
        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">Mapato ya Mwezi (MRR)</span>
            <div className="w-7 h-7 rounded-lg bg-[#E1FFAC] text-[#1a2d0a] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-emerald-800">
              TZS {totalMrr.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              Kutoka kwa maduka {activeTenants.length} yaliyosubscribe
            </span>
          </div>
        </div>

        {/* KPI 2: Maduka (Tenants) */}
        <div
          onClick={() => onNavigate("admin-tenants")}
          className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between cursor-pointer hover:border-[#a6c48d] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">Maduka Yote</span>
            <div className="w-7 h-7 rounded-lg bg-[#edf5e5] text-[#2c401f] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-black text-[#17280a]">{tenantsData.length}</p>
              <span className="text-xs font-bold text-emerald-700">{activeTenants.length} Subscribed</span>
            </div>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              {expiredTenants.length} Expired • {suspendedTenants.length} Suspended
            </span>
          </div>
        </div>

        {/* KPI 3: Watumiaji Wote (Users & Staff) */}
        <div
          onClick={() => onNavigate("admin-users")}
          className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between cursor-pointer hover:border-[#a6c48d] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">Watumiaji & Staff</span>
            <div className="w-7 h-7 rounded-lg bg-[#edf5e5] text-[#2c401f] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#17280a]">{employees.length}</p>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              Wamiliki, mameneja na wauzaji kwenye maduka yote
            </span>
          </div>
        </div>

        {/* KPI 4: Matatizo ya Wateja (Support Desk) */}
        <div
          onClick={() => onNavigate("admin-support")}
          className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col justify-between cursor-pointer hover:border-[#a6c48d] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c7054]">Tiketi za Msaada</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${openTickets.length > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <p className={`text-xl sm:text-2xl font-black ${openTickets.length > 0 ? "text-rose-700" : "text-emerald-800"}`}>
                {openTickets.length}
              </p>
              <span className="text-xs font-bold text-[#55694f]">Open</span>
            </div>
            <span className="text-[11px] text-[#55694f] font-medium block mt-0.5">
              {resolvedTickets.length} zimetatuliwa kikamilifu
            </span>
          </div>
        </div>
      </div>

      {/* Main Core Grid: Left = Stores Overview, Right = Support & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Left Column: Stores & Subscriptions (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#d8e6cc] shadow-neu-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#e8f0df] mb-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#172709] tracking-tight">
                  Maduka & Hali ya Usajili
                </h2>
                <p className="text-xs text-[#52654c]">
                  Orodha ya maduka na tarehe zao za kumaliza vifurushi
                </p>
              </div>
              <button
                onClick={() => onNavigate("admin-tenants")}
                className="text-xs font-bold text-[#1a2d0b] hover:text-[#325217] flex items-center gap-1 cursor-pointer"
              >
                <span>Tazama Yote</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#edf4e6]">
              {tenantsData.slice(0, 4).map((ten) => (
                <div key={ten.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-[#172709] truncate">{ten.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#EDF2E8] font-black text-[#233516] text-[10px] border border-[#d2dec7]">
                        {ten.plan}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#6d8165] mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#798e70]" />
                        {ten.location}
                      </span>
                      <span>•</span>
                      <span>Mmiliki: {ten.owner}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ten.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : ten.status === "EXPIRED"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        {ten.status === "ACTIVE" ? "Subscribed" : ten.status === "EXPIRED" ? "Expired" : "Suspended"}
                      </span>
                      <div className="text-[10px] text-[#6d8065] mt-0.5 font-medium">
                        {ten.daysInfo}
                      </div>
                    </div>

                    <button
                      onClick={() => adminExtendSubscription(ten.id, 30, "ACTIVE")}
                      title="Ongeza siku 30 za usajili"
                      className="px-2 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d5f795] text-[10px] font-black text-[#1a2d0b] border border-[#a8e053] transition cursor-pointer shadow-xs"
                    >
                      +30 Siku
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#edf4e6] flex items-center justify-between">
            <span className="text-xs text-[#52654c]">
              Jumla ya maduka: <strong>{tenantsData.length}</strong>
            </span>
            <button
              onClick={() => onNavigate("admin-tenants")}
              className="text-xs font-black text-[#1b2f09] hover:underline cursor-pointer"
            >
              Fungua Usimamizi Kamili wa Maduka &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Support Tickets & Quick Health (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Support Tickets Box */}
          <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-neu-card p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8f0df] mb-3">
              <div>
                <h2 className="text-sm font-black text-[#172709] tracking-tight">
                  Tiketi za Hivi Karibuni
                </h2>
                <p className="text-[11px] text-[#52654c]">
                  Matatizo ya wateja yanayohitaji utatuzi
                </p>
              </div>
              <button
                onClick={() => onNavigate("admin-support")}
                className="text-xs font-bold text-[#1a2d0b] hover:text-[#325217] flex items-center gap-1 cursor-pointer"
              >
                <span>Desk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {supportTickets.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#63775b]">
                Hakuna tiketi za matatizo kwa sasa.
              </div>
            ) : (
              <div className="space-y-2.5">
                {supportTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => onNavigate("admin-support")}
                    className="p-2.5 rounded-xl bg-[#fafdf8] border border-[#e4eed7] hover:border-[#a8c78f] transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded bg-[#1b2f09] text-[#E1FFAC]">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
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
                    <h4 className="text-xs font-bold text-[#192b0c] truncate">{ticket.title}</h4>
                    <div className="text-[10px] text-[#6d8065] mt-0.5">
                      Duka: <strong>{ticket.tenantName}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick System Diagnostics Box */}
          <div className="bg-[#1b2f09] text-white rounded-2xl p-4 sm:p-5 shadow-neu-card border border-[#8ece28]/40">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-[#E1FFAC]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#E1FFAC]">
                Afya ya Mfumo & Usalama
              </h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed mb-3">
              Huduma zote za TradePOS Cloud (Hifadhidata, POS Offline Sync, na API za Malipo) zinafanya kazi kwa 100%.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-white/10">
              <div className="p-2 rounded-xl bg-white/10">
                <span className="text-[10px] text-white/70 block">Uptime</span>
                <span className="text-xs font-black text-[#E1FFAC]">99.98%</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10">
                <span className="text-[10px] text-white/70 block">API Response</span>
                <span className="text-xs font-black text-[#E1FFAC]">28ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white rounded-2xl border border-[#d8e6cc] shadow-neu-card p-4 sm:p-5 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#495f3e] mb-3">
          Njia za Mkato za Usimamizi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("admin-tenants")}
            className="p-3 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group"
          >
            <Building2 className="w-4 h-4 text-[#2d4719] mb-1 group-hover:scale-110 transition" />
            <div className="text-xs font-black text-[#172709]">Dhibiti Maduka</div>
            <div className="text-[10px] text-[#6d8065]">Vifurushi & ongeza siku</div>
          </button>

          <button
            onClick={() => onNavigate("admin-users")}
            className="p-3 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group"
          >
            <KeyRound className="w-4 h-4 text-[#2d4719] mb-1 group-hover:scale-110 transition" />
            <div className="text-xs font-black text-[#172709]">Reset Password & PIN</div>
            <div className="text-[10px] text-[#6d8065]">Tatua matatizo ya login</div>
          </button>

          <button
            onClick={() => onNavigate("admin-support")}
            className="p-3 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group"
          >
            <LifeBuoy className="w-4 h-4 text-[#2d4719] mb-1 group-hover:scale-110 transition" />
            <div className="text-xs font-black text-[#172709]">Desk ya Utatuzi</div>
            <div className="text-[10px] text-[#6d8065]">Tatua kero za wateja</div>
          </button>

          <button
            onClick={() => onNavigate("audit-logs")}
            className="p-3 rounded-xl bg-[#F7FAF2] hover:bg-[#ebf4e1] border border-[#dbe6cf] text-left transition cursor-pointer group"
          >
            <Activity className="w-4 h-4 text-[#2d4719] mb-1 group-hover:scale-110 transition" />
            <div className="text-xs font-black text-[#172709]">Kumbukumbu za Mfumo</div>
            <div className="text-[10px] text-[#6d8065]">Tazama matukio ya kiusalama</div>
          </button>
        </div>
      </div>
    </div>
  );
};
