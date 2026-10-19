"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export const AdminTenantsModule: React.FC = () => {
  const {
    business,
    availableBusinesses,
    employees,
    adminExtendSubscription,
    adminImpersonateStore,
  } = useApp();

  const [search, setSearch] = useState("");
  const [tenantFilter, setTenantFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "SUSPENDED">("ALL");

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
      expiryDate: biz.subscriptionExpiry || "",
      daysInfo: subInfo.daysText,
      isExpired: isActuallyExpired,
      mrrAmount: currentStatus === "ACTIVE" ? planRate : 0,
      mrr: `TZS ${planRate.toLocaleString()}`,
      branches: biz.branches?.length || (biz.location ? 1 : 0),
      staffCount: staffList.length,
    };
  });

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

  const totalMrr = tenants.reduce((acc, t) => acc + t.mrrAmount, 0);
  const activeSubCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const expiredSubCount = tenants.filter((t) => t.status === "EXPIRED").length;
  const suspendedCount = tenants.filter((t) => t.status === "SUSPENDED").length;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden bg-[#F4F7EE]/95">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-[#172709] tracking-tight">
              Maduka & Usajili
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1b2f09] text-[#E1FFAC] text-[10px] font-black tracking-wider uppercase">
              STORES
            </span>
          </div>
          <p className="text-xs text-[#52654c] mt-0.5">
            Usimamizi wa maduka, hali ya usajili, na kuongeza siku za vifurushi.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4 shrink-0">
        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Maduka Yote</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">{tenants.length}</p>
          <span className="text-[10px] text-[#6d8065]">Yaliyosajiliwa</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Subscribed</span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">{activeSubCount}</p>
          <span className="text-[10px] text-emerald-700 font-bold">MRR: TZS {totalMrr.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Expired</span>
          <p className="text-xl font-black text-amber-700 mt-0.5">{expiredSubCount}</p>
          <span className="text-[10px] text-amber-700 font-semibold">{suspendedCount} wamesitishwa</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-[11px] font-bold text-[#5c7054] block">Matawi</span>
          <p className="text-xl font-black text-[#17280a] mt-0.5">
            {tenants.reduce((acc, t) => acc + t.branches, 0)}
          </p>
          <span className="text-[10px] text-[#6d8065]">Matawi yote</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65795e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta duka kwa jina, mmiliki, au simu..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "ALL", label: "Wote" },
            { id: "ACTIVE", label: "Subscribed" },
            { id: "EXPIRED", label: "Expired" },
            { id: "SUSPENDED", label: "Suspended" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTenantFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tenantFilter === f.id
                  ? "bg-[#1b2f09] text-[#E1FFAC] shadow"
                  : "bg-white text-[#475b40] border border-[#d8e6cc] hover:bg-[#f0f6e9]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Stores Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3.5 px-4">Duka</th>
              <th className="py-3.5 px-4">Mmiliki</th>
              <th className="py-3.5 px-4">Kifurushi</th>
              <th className="py-3.5 px-4">Mwisho</th>
              <th className="py-3.5 px-4">Hali</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#65795e]">
                  Hakuna maduka yaliyopatikana kwa vigezo hivi.
                </td>
              </tr>
            ) : (
              filteredTenants.map((ten) => (
                <tr key={ten.id} className="hover:bg-[#FAFCF7] transition">
                  <td className="py-3.5 px-4">
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

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#233519]">{ten.owner}</div>
                    <div className="text-[11px] text-[#66795f] flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#7a8f6f]" />
                        {ten.ownerPhone || "N/A"}
                      </span>
                      <span>{ten.ownerEmail}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#EDF2E8] font-black text-[#233516] text-[11px] border border-[#d2dec7]">
                      {ten.plan}
                    </span>
                    <div className="text-[10px] text-[#697d62] font-semibold mt-1">
                      {ten.mrr} / Mwezi
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
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

                  <td className="py-3.5 px-4">
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
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* +30 Days Action */}
                      <button
                        onClick={() => adminExtendSubscription(ten.id, 30, "ACTIVE")}
                        title="Ongeza siku 30 za usajili mara moja"
                        className="px-2.5 py-1.5 rounded-lg bg-[#E1FFAC] hover:bg-[#d5f795] text-[11px] font-black text-[#1a2d0b] border border-[#a8e053] transition cursor-pointer"
                      >
                        +30 Siku
                      </button>

                      {/* +7 Days Grace */}
                      <button
                        onClick={() => adminExtendSubscription(ten.id, 7, "ACTIVE")}
                        title="Ongeza siku 7 za msamaha"
                        className="px-2 py-1.5 rounded-lg bg-white hover:bg-[#edf5e3] text-[11px] font-bold text-[#35482e] border border-[#cbdbbc] transition cursor-pointer"
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
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                          ten.status === "SUSPENDED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
                        }`}
                      >
                        {ten.status === "SUSPENDED" ? "Fungulia" : "Sitisha"}
                      </button>

                      {/* Impersonate / Diagnostic Access Mode */}
                      <button
                        onClick={() => adminImpersonateStore(ten.id)}
                        title="Ingia ndani ya duka hili kukagua matatizo"
                        className="px-2.5 py-1.5 rounded-lg bg-[#1b2f09] hover:bg-[#253f0e] text-[11px] font-bold text-[#E1FFAC] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Kagua Duka</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
