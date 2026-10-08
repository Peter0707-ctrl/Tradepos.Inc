"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  RefreshCw
} from "lucide-react";

export const SubscriptionBillingModule: React.FC = () => {
  const { business, renewSubscription } = useApp();
  const [selectedPlan, setSelectedPlan] = useState(business?.subscriptionPlan || "PROFESSIONAL");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRenewOrUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      renewSubscription();
      setIsProcessing(false);
      alert("Subscription renewed successfully for another 30 calendar days!");
    }, 1000);
  };

  const paymentHistory = [
    {
      invoice: "SUB-INV-2026-09",
      date: "2026-10-08",
      amount: "TZS 150,000",
      plan: "PROFESSIONAL",
      method: "M-Pesa Express",
      status: "SUCCESSFUL",
    },
    {
      invoice: "SUB-INV-2026-08",
      date: "2026-09-08",
      amount: "TZS 150,000",
      plan: "PROFESSIONAL",
      method: "M-Pesa Express",
      status: "SUCCESSFUL",
    },
    {
      invoice: "SUB-INV-2026-07",
      date: "2026-08-08",
      amount: "TZS 75,000",
      plan: "STARTER",
      method: "Airtel Money",
      status: "SUCCESSFUL",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#162709] tracking-tight">
          Subscription, Billing & License Management
        </h2>
        <p className="text-xs text-[#526848]">
          Review your tenant tier, renewal dates, automated mobile money receipts, and multi-branch feature quotas.
        </p>
      </div>

      {/* Active Plan Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white to-[#F7FCF0] border-2 border-[#BFE973] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black text-[#1F3609] uppercase tracking-wider">
              Current Plan
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E1FFAC] text-[#192E08] text-xs font-black border border-[#9EDE31]">
              {business?.subscriptionStatus || "ACTIVE"}
            </span>
          </div>

          <h3 className="text-3xl font-black text-[#152709]">
            {business?.subscriptionPlan || "PROFESSIONAL"} PLAN
          </h3>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#4F6742]">
            <span>Next Billing Date: <strong className="text-[#152709]">{business?.subscriptionExpiry || "2026-11-08"}</strong></span>
            <span>•</span>
            <span>Monthly Rate: <strong className="text-[#152709]">TZS 150,000 / month</strong></span>
            <span>•</span>
            <span>Branches Allowed: <strong className="text-[#152709]">Unlimited</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={handleRenewOrUpgrade}
            disabled={isProcessing}
            className="px-5 py-3 rounded-2xl neu-btn text-xs font-black shadow-xs flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            <span>Renew Subscription</span>
          </button>
        </div>
      </div>

      {/* Available Tier Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: "PROFESSIONAL",
            price: "TZS 150,000 / mo",
            current: true,
            features: [
              "Unlimited Branches & Warehouses",
              "AI Business Assistant (Copetra)",
              "Unlimited Staff & Custom Roles",
              "Online Store & Delivery Dispatch Tracker",
              "Full P&L Accounting & Stock Movements",
            ],
          },
          {
            name: "BUSINESS CHAIN",
            price: "TZS 300,000 / mo",
            features: [
              "Multi-Warehouse Automated Drops",
              "Wholesale Multi-Tier Pricing",
              "WhatsApp Automated Alerts & Reports",
              "Dedicated Account Specialist & API Access",
            ],
          },
          {
            name: "ENTERPRISE",
            price: "Custom",
            features: [
              "Dedicated Server & Database Partition",
              "Custom Integrations (TRA EFD, SAP, ERP)",
              "99.99% SLA Uptime Guarantee",
              "On-Site Support & Staff Training",
            ],
          },
        ].map((plan, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${
              plan.current ? "border-2 border-[#8ECE28] bg-[#FDFFF9]" : "border-[#D8E6CC]"
            } flex flex-col justify-between`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-black text-sm text-[#162709]">{plan.name}</h4>
                {plan.current && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E1FFAC] text-[#192E08]">
                    Current
                  </span>
                )}
              </div>
              <p className="text-lg font-black text-[#152708] mb-4">{plan.price}</p>
              <ul className="space-y-2 text-xs text-[#4F6742]">
                {plan.features.map((f, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={plan.current}
              className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition ${
                plan.current
                  ? "bg-[#EDF3E6] text-[#718866] cursor-default"
                  : "bg-white hover:bg-[#E1FFAC] border border-[#D5E5C4] text-[#22390C]"
              }`}
            >
              {plan.current ? "Active Plan" : "Switch to " + plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Payment History Ledger */}
      <div className="bg-white rounded-2xl p-5 border border-[#D8E6CC] shadow-xs">
        <h4 className="font-extrabold text-sm text-[#162709] mb-3">Billing & Payment Transaction Records</h4>
        <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
          <thead className="bg-[#F8FAF4] font-bold text-[#4D6340]">
            <tr>
              <th className="py-2.5 px-3">Receipt / Invoice #</th>
              <th className="py-2.5 px-3">Billing Date</th>
              <th className="py-2.5 px-3">Plan</th>
              <th className="py-2.5 px-3">Payment Gateway</th>
              <th className="py-2.5 px-3">Amount Paid</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
            {paymentHistory.map((p, idx) => (
              <tr key={idx} className="hover:bg-[#F9FBF6]">
                <td className="py-2.5 px-3 font-bold font-mono">{p.invoice}</td>
                <td className="py-2.5 px-3 text-[#58704D]">{p.date}</td>
                <td className="py-2.5 px-3 font-semibold">{p.plan}</td>
                <td className="py-2.5 px-3">{p.method}</td>
                <td className="py-2.5 px-3 font-black">{p.amount}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
