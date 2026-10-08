"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  User,
  Shield,
  Key,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Lock,
  Save
} from "lucide-react";

export const ProfileSecurityModule: React.FC = () => {
  const { user, business } = useApp();

  const [name, setName] = useState(user?.name || "Peter Joseph");
  const [email, setEmail] = useState(user?.email || "peter@petercosmetics.co.tz");
  const [phone, setPhone] = useState(user?.phone || "+255 712 345 678");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#162709] tracking-tight">
          User Account Profile & Security Controls
        </h2>
        <p className="text-xs text-[#526848]">
          Manage your personal credentials, contact phone for SMS alerts, two-factor authentication, and password security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Personal Details */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EDF4E4]">
            <div className="w-12 h-12 rounded-2xl bg-[#E1FFAC] border border-[#A6DF52] flex items-center justify-center font-black text-lg text-[#1D3508]">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-sm text-[#162709]">{name}</h3>
              <span className="text-xs text-[#556F48] font-bold">{user?.role || "Owner"} • {business?.name}</span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-[#324925] mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-[#324925] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-[#324925] mb-1">Phone Number (M-Pesa / SMS)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl neu-btn font-black shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </form>
        </div>

        {/* Password & Security */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[#162709] pb-3 border-b border-[#EDF4E4] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#3C6415]" />
            <span>Password & Security Safeguards</span>
          </h3>

          <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-[#324925] mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input"
              />
            </div>

            <div>
              <label className="block font-bold text-[#324925] mb-1">New Secure Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F7FCF0] border border-[#D2E7BD] text-[11px] text-[#4F6742]">
              🛡️ <strong>Session Security:</strong> Authenticated sessions expire automatically after 8 hours of inactivity.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl neu-btn font-black shadow-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
