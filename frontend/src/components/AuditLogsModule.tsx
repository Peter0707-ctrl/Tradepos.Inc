"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { FileText, ShieldCheck, UserCheck, Clock } from "lucide-react";

export const AuditLogsModule: React.FC = () => {
  const { auditLogs, business } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      <div className="mb-5">
        <h2 className="text-xl font-black text-[#172709] tracking-tight">
          Security & Audit Logs
        </h2>
        <p className="text-xs text-[#52654c]">
          Immutable activity tracking for compliance, cashier sales, inventory edits, price changes, and expense entries.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Activity Description</th>
              <th className="py-3 px-4 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#FAFCF7] transition">
                <td className="py-3 px-4 font-mono text-[11px] text-[#5d7355]">
                  {log.timestamp}
                </td>
                <td className="py-3 px-4 font-bold">{log.userName}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-[#EDF2E8] font-bold text-[#233516] text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#35482e]">{log.details}</td>
                <td className="py-3 px-4 text-right font-mono text-[11px] text-[#6b8064]">
                  {log.ipAddress || "197.250.199.14"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
