"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ShoppingBag,
  Package,
  Calendar,
  Trash2
} from "lucide-react";

interface NotificationCenterModuleProps {
  onNavigate: (module: string) => void;
}

export const NotificationCenterModule: React.FC<NotificationCenterModuleProps> = ({ onNavigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">
            System Alerts & Business Notification Center
          </h2>
          <p className="text-xs text-[#526848]">
            Stay informed on low stock thresholds, incoming online store deliveries, invoice payments, and subscription renewals.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] shadow-xs"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationRead(n.id);
              if (n.actionUrl) onNavigate(n.actionUrl);
            }}
            className={`p-4 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-4 ${
              !n.read
                ? "bg-white border-[#BFE973] shadow-xs"
                : "bg-white/70 border-[#D8E6CC] hover:bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E1FFAC] border border-[#A6DF52] flex items-center justify-center text-[#1C3308] shrink-0 mt-0.5">
                {n.type === "STOCK" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-800" />
                ) : n.type === "PAYMENT" ? (
                  <CreditCard className="w-5 h-5 text-[#2A470C]" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-[#2A470C]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-xs text-[#162709]">{n.title}</h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#5CA812]" />
                  )}
                </div>
                <p className="text-xs text-[#4F6542] mt-1 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-[#788E6B] font-semibold mt-2 block">{n.timestamp}</span>
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-xl bg-[#EDF3E6] hover:bg-[#E1FFAC] text-xs font-bold text-[#1F3309] shrink-0">
              Open Module
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
