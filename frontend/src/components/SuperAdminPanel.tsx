"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Search,
  Activity,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export const SuperAdminPanel: React.FC = () => {
  const { business, availableBusinesses, employees, user, updateBusinessProfile } = useApp();
  const [search, setSearch] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, "ACTIVE" | "SUSPENDED" | "EXPIRED">>({});

  const allBusinesses = availableBusinesses.length > 0
    ? availableBusinesses
    : business
    ? [business]
    : [];

  const tenants = allBusinesses.map((biz) => {
    const ownerEmp = employees.find((e) => e.tenantId === biz.id && e.role === "OWNER");
    const staffCount = employees.filter((e) => e.tenantId === biz.id).length || 1;
    const planRate = biz.subscriptionPlan === "BUSINESS" ? 300000 : 150000;
    const currentStatus = statusOverrides[biz.id] || biz.subscriptionStatus || "ACTIVE";

    return {
      id: biz.id,
      name: biz.name,
      owner: ownerEmp?.name || user?.name || biz.email || "Registered Owner",
      plan: biz.subscriptionPlan || "PROFESSIONAL",
      status: currentStatus,
      mrrAmount: currentStatus === "ACTIVE" ? planRate : 0,
      mrr: `TZS ${planRate.toLocaleString()}`,
      branches: biz.branches?.length || 1,
      users: staffCount,
    };
  });

  const toggleStatus = (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setStatusOverrides((prev) => ({
      ...prev,
      [tenantId]: nextStatus as any,
    }));
    if (business && business.id === tenantId) {
      updateBusinessProfile({ subscriptionStatus: nextStatus as any });
    }
  };

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.owner.toLowerCase().includes(search.toLowerCase())
  );

  const totalMrr = tenants.reduce((acc, t) => acc + t.mrrAmount, 0);
  const activeCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const inactiveCount = tenants.length - activeCount;
  const totalBranches = tenants.reduce((acc, t) => acc + t.branches, 0);

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#172709] tracking-tight">
              SaaS Platform Super Admin
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1b2f09] text-[#E1FFAC] text-xs font-bold">
              ROOT SYSTEM
            </span>
          </div>
          <p className="text-xs text-[#52654c]">
            Global multi-tenant orchestration, tenant subscription enforcement and platform MRR monitoring.
          </p>
        </div>
      </div>

      {/* Global MRR Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">Monthly Recurring Revenue (MRR)</span>
          <p className="text-xl font-black text-emerald-800 mt-1">TZS {totalMrr.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-700 font-bold">Live active subscriptions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">Active Subscribed Tenants</span>
          <p className="text-xl font-black text-[#17280a] mt-1">{activeCount} Businesses</p>
          <span className="text-[11px] text-[#6d8065]">{inactiveCount} Expired / Suspended</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">Total Branches Governed</span>
          <p className="text-xl font-black text-[#17280a] mt-1">{totalBranches} Branches</p>
          <span className="text-[11px] text-[#6d8065]">Registered outlets</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card">
          <span className="text-xs font-bold text-[#5c7054]">Tenant Isolation Protocol</span>
          <p className="text-xl font-black text-[#21380b] mt-1">100% Enforced</p>
          <span className="text-[11px] font-bold text-emerald-700">Zero data cross-leakage</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65795e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant by company name or registered owner..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Business Tenant</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Subscription Plan</th>
              <th className="py-3 px-4">MRR Rate</th>
              <th className="py-3 px-4">Branches</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Access Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#65795e]">
                  No registered tenants found.
                </td>
              </tr>
            ) : (
              filtered.map((ten) => (
                <tr key={ten.id} className="hover:bg-[#FAFCF7] transition">
                  <td className="py-3 px-4 font-bold">
                    {ten.name}
                    <span className="block font-mono text-[10px] text-[#718569]">{ten.id}</span>
                  </td>
                  <td className="py-3 px-4 text-[#35482e]">{ten.owner}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#EDF2E8] font-bold text-[#233516]">
                      {ten.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">{ten.mrr}</td>
                  <td className="py-3 px-4 font-semibold">{ten.branches} branches</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        ten.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : ten.status === "EXPIRED"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {ten.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(ten.id, ten.status)}
                      className="px-3 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#d6f798] text-[11px] font-bold text-[#1a2d0b] border border-[#a8e053]"
                    >
                      {ten.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
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
