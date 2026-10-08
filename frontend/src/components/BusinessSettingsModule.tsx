"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  Building,
  CreditCard,
  Shield,
  Bell,
  Globe,
  Sliders,
  Check,
  Save
} from "lucide-react";

export const BusinessSettingsModule: React.FC = () => {
  const { business, currentBranch } = useApp();

  const [bizName, setBizName] = useState(business?.name || "Peter Cosmetics & Beauty");
  const [bizType, setBizType] = useState(business?.businessType || "Cosmetics & Retail");
  const [currency, setCurrency] = useState("TZS");
  const [taxRate, setTaxRate] = useState("18");
  const [receiptFooter, setReceiptFooter] = useState("Asante kwa kufanya biashara nasi! Karibu tena.");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#162709] tracking-tight">
          Business Operating System Settings
        </h2>
        <p className="text-xs text-[#526848]">
          Configure company profile, receipt styling, VAT rates, currency formats, and security policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[#162709] pb-2 border-b border-[#EDF4E4]">
            Business Profile & Identification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#344D26] mb-1">Registered Business Name</label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-[#344D26] mb-1">Commercial Sector / Type</label>
              <input
                type="text"
                value={bizType}
                onChange={(e) => setBizType(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-[#344D26] mb-1">Currency Standard</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              >
                <option value="TZS">TZS — Tanzanian Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="KES">KES — Kenyan Shilling</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#344D26] mb-1">Standard VAT Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>
          </div>
        </div>

        {/* Receipt Settings Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[#162709] pb-2 border-b border-[#EDF4E4]">
            Thermal Receipt & Invoice Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#344D26] mb-1">Receipt Footer Message</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="printBarcode" defaultChecked className="rounded accent-[#78C218]" />
              <label htmlFor="printBarcode" className="font-semibold text-[#324B24]">
                Print transaction barcode on customer paper receipts
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="showTax" defaultChecked className="rounded accent-[#78C218]" />
              <label htmlFor="showTax" className="font-semibold text-[#324B24]">
                Display VAT breakdown separately on invoice totals
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl neu-btn text-xs font-black shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings Changes</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
