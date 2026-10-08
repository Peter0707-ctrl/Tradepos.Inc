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
  const { business, currentBranch, language, changeLanguage, t } = useApp();

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
          {language === "sw" ? "Mipangilio ya Mfumo wa Biashara" : "Business Operating System Settings"}
        </h2>
        <p className="text-xs text-[#526848]">
          {language === "sw"
            ? "Weka taarifa za kampuni, mfumo wa risiti, kodi ya VAT, lugha ya mfumo na sarafu."
            : "Configure company profile, receipt styling, VAT rates, system language, and currency formats."}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
        {/* Language Selection Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF4E4]">
            <Globe className="w-4 h-4 text-[#3A6017]" />
            <h3 className="font-black text-sm text-[#162709]">
              {language === "sw" ? "Lugha ya Mfumo (Language Preference)" : "System Language & Localization"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => changeLanguage("sw")}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition ${
                language === "sw"
                  ? "bg-[#E1FFAC] border-[#91D923] text-[#142907] shadow-xs"
                  : "bg-[#FAFCF6] border-[#D5E5C4] text-[#445B38] hover:bg-[#F0F6E8]"
              }`}
            >
              <div>
                <p className="font-black text-xs">Kiswahili (Chaguo-msingi)</p>
                <p className="text-[10px] text-[#556F48] mt-0.5">Mfumo mzima kwa Kiswahili fasaha</p>
              </div>
              {language === "sw" && <Check className="w-4 h-4 text-[#1C3608]" />}
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("en")}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition ${
                language === "en"
                  ? "bg-[#E1FFAC] border-[#91D923] text-[#142907] shadow-xs"
                  : "bg-[#FAFCF6] border-[#D5E5C4] text-[#445B38] hover:bg-[#F0F6E8]"
              }`}
            >
              <div>
                <p className="font-black text-xs">English (International)</p>
                <p className="text-[10px] text-[#556F48] mt-0.5">Full interface in English</p>
              </div>
              {language === "en" && <Check className="w-4 h-4 text-[#1C3608]" />}
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[#162709] pb-2 border-b border-[#EDF4E4]">
            {language === "sw" ? "Taarifa za Biashara & Utambulisho" : "Business Profile & Identification"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#344D26] mb-1">
                {language === "sw" ? "Jina la Biashara / Duka" : "Registered Business Name"}
              </label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-[#344D26] mb-1">
                {language === "sw" ? "Aina ya Biashara" : "Commercial Sector / Type"}
              </label>
              <input
                type="text"
                value={bizType}
                onChange={(e) => setBizType(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-[#344D26] mb-1">
                {language === "sw" ? "Sarafu ya Malipo" : "Currency Standard"}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl neu-input font-medium"
              >
                <option value="TZS">TZS — Shilingi ya Tanzania</option>
                <option value="USD">USD — US Dollar</option>
                <option value="KES">KES — Shilingi ya Kenya</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#344D26] mb-1">
                {language === "sw" ? "Kiwango cha Kodi ya VAT (%)" : "Standard VAT Tax Rate (%)"}
              </label>
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
            {language === "sw" ? "Mpangilio wa Risiti & Ujumbe" : "Thermal Receipt & Invoice Preferences"}
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#344D26] mb-1">
                {language === "sw" ? "Ujumbe wa Mwisho wa Risiti (Footer)" : "Receipt Footer Message"}
              </label>
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
                {language === "sw"
                  ? "Weka barcode kwenye risiti za karatasi za mteja"
                  : "Print transaction barcode on customer paper receipts"}
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="showTax" defaultChecked className="rounded accent-[#78C218]" />
              <label htmlFor="showTax" className="font-semibold text-[#324B24]">
                {language === "sw"
                  ? "Onyesha uchanganuzi wa kodi ya VAT kwenye jumla ya risiti"
                  : "Display VAT breakdown separately on invoice totals"}
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
            <span>{language === "sw" ? "Hifadhi Mabadiliko ya Mipangilio" : "Save Settings Changes"}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Check className="w-4 h-4" /> {language === "sw" ? "Imehifadhiwa kikamilifu" : "Saved successfully"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
