"use client";

import React, { useState, useRef } from "react";
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
  Save,
  Camera,
  Trash2,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

export const ProfileSecurityModule: React.FC = () => {
  const { user, business, currentBranch, updateUserProfile, employees, language } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Match current employee for existing PIN
  const matchedEmp = employees.find((e) => e.id === user?.id || e.email.toLowerCase() === user?.email.toLowerCase());

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || matchedEmp?.avatar || "");

  const [posPin, setPosPin] = useState(user?.pin || matchedEmp?.pin || "1234");
  const [showPin, setShowPin] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Handle image upload from computer / phone
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(language === "sw" ? "Picha isizidi ukubwa wa 2MB" : "Image size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatar.trim(),
      newPin: posPin.trim(),
      newPassword: newPwd.trim() || undefined,
    });

    setTimeout(() => {
      setIsSaving(false);
      setCurrentPwd("");
      setNewPwd("");
    }, 600);
  };

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Platform Super Admin"
      : user?.role === "OWNER"
      ? (language === "sw" ? "Mwenye Duka (Boss)" : "Store Owner")
      : user?.role === "MANAGER"
      ? (language === "sw" ? "Meneja wa Duka" : "Store Manager")
      : (language === "sw" ? "Muuzaji (Cashier)" : "Store Cashier");

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-5 bg-[#F4F7EE]/95">
      {/* Header */}
      <div className="pb-3 border-b border-[#D8E6CC]">
        <h2 className="text-xl sm:text-2xl font-black text-[#162709] tracking-tight">
          {language === "sw" ? "Akaunti & Wasifu Wangu" : "Account & My Profile"}
        </h2>
        <p className="text-xs text-[#526848] mt-0.5">
          {language === "sw"
            ? "Badili picha ya wasifu, taarifa zako za kazi, nenosiri, na PIN ya POS."
            : "Update your profile picture, personal information, password, and POS login PIN."}
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Profile Picture & Basic Info */}
          <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-neu-card space-y-4">
            <h3 className="font-black text-sm text-[#162709] pb-2 border-b border-[#EDF4E4] flex items-center justify-between">
              <span>{language === "sw" ? "Picha ya Wasifu & Taarifa" : "Profile Picture & Details"}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1b2f09] text-[#E1FFAC]">
                {user?.role}
              </span>
            </h3>

            {/* Profile Picture Upload & Preview */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#8ECE28] shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#E1FFAC] border-2 border-[#8ECE28] flex items-center justify-center font-black text-xl text-[#1D3508] shadow-sm">
                    {(name || user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={language === "sw" ? "Weka Picha Mpya" : "Upload Photo"}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1B2F09] text-[#E1FFAC] border-2 border-white flex items-center justify-center hover:scale-105 transition shadow cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d5f98a] border border-[#9CE034] text-xs font-black text-[#172B08] transition cursor-pointer"
                  >
                    {language === "sw" ? "Weka Picha Mpya" : "Change Photo"}
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="p-1.5 rounded-xl text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      title={language === "sw" ? "Ondoa Picha" : "Remove Photo"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="block text-[11px] text-[#6d8165] mt-1 font-medium">
                  {language === "sw" ? "Picha ya JPG, PNG au WebP (max 2MB)" : "JPG, PNG or WebP image (max 2MB)"}
                </span>
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div className="pt-2">
              <span className="block text-[10px] font-bold text-[#556D48] uppercase tracking-wider mb-1.5">
                {language === "sw" ? "Au Chagua Picha Hapa:" : "Or Choose a Preset Avatar:"}
              </span>
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition cursor-pointer hover:scale-105 ${
                      avatar === preset ? "border-[#1B2F09] ring-2 ring-[#8ECE28]" : "border-transparent"
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields: Name, Email, Phone */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">
                  {language === "sw" ? "Jina Kamili" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">
                  {language === "sw" ? "Barua Pepe (Email)" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">
                  {language === "sw" ? "Namba ya Simu" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 700 000 000"
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6FAF1] border border-[#dce8cc] text-[11px] text-[#4d6340]">
                <div>
                  <strong>{language === "sw" ? "Cheo:" : "Role:"}</strong> {roleLabel}
                </div>
                <div className="mt-0.5">
                  <strong>{language === "sw" ? "Duka & Tawi:" : "Shop & Branch:"}</strong> {business?.name || "TradePOS"} • {currentBranch?.name || "Tawi Kuu"}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Security, PIN & Password */}
          <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-neu-card space-y-4">
            <h3 className="font-black text-sm text-[#162709] pb-2 border-b border-[#EDF4E4] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3C6415]" />
              <span>{language === "sw" ? "PIN ya POS & Nenosiri" : "POS PIN & Password Security"}</span>
            </h3>

            {/* PIN ya POS (Quick Cashier / Staff Login) */}
            <div className="p-3.5 rounded-2xl bg-[#F8FBF4] border border-[#D8E6CC] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#172709]">
                    {language === "sw" ? "PIN ya Haraka ya POS (4 Digits)" : "POS Login PIN (4 Digits)"}
                  </h4>
                  <p className="text-[10px] text-[#63795b]">
                    {language === "sw"
                      ? "Inatumika kuingia kwenye POS na kubadili akaunti kwa haraka"
                      : "Used for quick POS terminal login and staff switching"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1 rounded-lg text-[#556E47] hover:bg-[#EBF3E1] transition cursor-pointer"
                  title={showPin ? "Ficha PIN" : "Onyesha PIN"}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <input
                type={showPin ? "text" : "password"}
                maxLength={6}
                value={posPin}
                onChange={(e) => setPosPin(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                className="w-full py-2.5 px-3 rounded-xl neu-input font-mono font-bold text-base text-center tracking-widest text-[#1a2d0b]"
              />
            </div>

            {/* Change Password */}
            <div className="space-y-3 pt-1 text-xs">
              <h4 className="font-black text-xs text-[#1c2e0f]">
                {language === "sw" ? "Badili Nenosiri (Password)" : "Change Account Password"}
              </h4>

              <div>
                <label className="block font-bold text-[#324925] mb-1">
                  {language === "sw" ? "Nenosiri la Sasa" : "Current Password"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">
                  {language === "sw" ? "Nenosiri Jipya" : "New Secure Password"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={language === "sw" ? "Herufi zisizopungua 6" : "Minimum 6 characters"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="checkbox"
                  id="showPwdCheck"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-[#aec49b]"
                />
                <label htmlFor="showPwdCheck" className="text-[11px] text-[#556d49] font-medium cursor-pointer">
                  {language === "sw" ? "Onyesha nenosiri" : "Show password text"}
                </label>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F7FCF0] border border-[#D2E7BD] text-[11px] text-[#4F6742]">
              <strong>{language === "sw" ? "Usalama wa Mfumo:" : "Security:"}</strong>{" "}
              {language === "sw"
                ? "Hakikisha PIN na Nenosiri lako ni siri ili kulinda hesabu zako za mauzo."
                : "Keep your credentials secure to protect your daily sales sessions."}
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl neu-btn text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? (language === "sw" ? "Inahifadhi..." : "Saving...")
                : (language === "sw" ? "Hifadhi Wasifu & Picha" : "Save Profile & Picture")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
