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
  RefreshCw,
  Sliders,
  Building2,
  Server,
  BookOpen,
  Receipt,
  Printer,
  Check,
  X,
  Smartphone,
  Lock,
} from "lucide-react";

type PlanType = "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE" | "CUSTOM";
type BillingCycle = 1 | 6 | 12;
type MobileCarrier = "mpesa" | "tigopesa" | "airtel" | "halopesa";

interface CustomConfig {
  branches: number;
  traFiscalSync: boolean;
  dedicatedDb: boolean;
  staffTraining: boolean;
}

interface InvoiceRecord {
  invoice: string;
  date: string;
  plan: PlanType;
  durationMonths: number;
  amount: number;
  paymentMethod: string;
  status: "PAID" | "PENDING";
  taxVat: number;
  payerPhone?: string;
  payerEmail?: string;
}

const detectCarrier = (phoneStr: string): MobileCarrier => {
  const clean = phoneStr.replace(/\D/g, "");
  let p = clean;
  if (p.startsWith("255")) {
    p = "0" + p.slice(3);
  }
  const prefix = p.substring(0, 3);
  if (["074", "075", "076"].includes(prefix)) return "mpesa";
  if (["071", "065", "067", "077"].includes(prefix)) return "tigopesa";
  if (["078", "068", "069"].includes(prefix)) return "airtel";
  if (["062", "061"].includes(prefix)) return "halopesa";
  return "mpesa";
};

export const SubscriptionBillingModule: React.FC = () => {
  const { business, renewSubscription, auditLogs, language } = useApp();

  const isSw = language === "sw";

  // Modal & Selection States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    (business?.subscriptionPlan as PlanType) || "PROFESSIONAL"
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(1);
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [paymentMethodMode, setPaymentMethodMode] = useState<"mobile" | "lipa_namba">("mobile");

  // Custom Plan Configurator state
  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    branches: 10,
    traFiscalSync: true,
    dedicatedDb: true,
    staffTraining: false,
  });

  // Payer details & Mobile Carrier auto-detection
  const [payerPhone, setPayerPhone] = useState(business?.phone || "0754123456");
  const [selectedCarrier, setSelectedCarrier] = useState<MobileCarrier>(() =>
    detectCarrier(business?.phone || "0754123456")
  );
  const [payerEmail, setPayerEmail] = useState(business?.email || "billing@tradepos.co.tz");
  const [lipaReferenceCode, setLipaReferenceCode] = useState("");

  const handlePhoneChange = (val: string) => {
    setPayerPhone(val);
    const detected = detectCarrier(val);
    setSelectedCarrier(detected);
  };

  // Processing & Receipt
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<InvoiceRecord | null>(null);
  const [pesapalSimulationStep, setPesapalSimulationStep] = useState<"idle" | "awaiting_pin" | "approved">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Price calculations
  const calculatePlanMonthlyBase = (plan: PlanType): number => {
    switch (plan) {
      case "STARTER":
        return 50000;
      case "PROFESSIONAL":
        return 150000;
      case "BUSINESS":
        return 300000;
      case "ENTERPRISE":
      case "CUSTOM": {
        const baseBranches = 5;
        const extraBranches = Math.max(0, customConfig.branches - baseBranches);
        let monthly = 250000 + extraBranches * 25000;
        if (customConfig.traFiscalSync) monthly += 50000;
        if (customConfig.dedicatedDb) monthly += 50000;
        return monthly;
      }
      default:
        return 150000;
    }
  };

  const getDiscountPercent = (cycle: BillingCycle): number => {
    if (cycle === 6) return 10;
    if (cycle === 12) return 20;
    return 0;
  };

  const calculateTotal = (plan: PlanType, cycle: BillingCycle): number => {
    const base = calculatePlanMonthlyBase(plan);
    const subtotal = base * cycle;
    const discount = Math.round(subtotal * (getDiscountPercent(cycle) / 100));
    const oneTime = (plan === "CUSTOM" || plan === "ENTERPRISE") && customConfig.staffTraining ? 100000 : 0;
    return subtotal - discount + oneTime;
  };

  const finalTotal = calculateTotal(selectedPlan, billingCycle);
  const vatAmount = Math.round(finalTotal * (18 / 118));

  // Expiry calculation
  const getExpiryDaysRemaining = (): number => {
    if (!business?.subscriptionExpiry) return 30;
    const diff = new Date(business.subscriptionExpiry).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Payment History
  const paymentHistory: InvoiceRecord[] = auditLogs
    .filter((log) => log.action === "SUBSCRIPTION_RENEWED" || log.action === "BUSINESS_REGISTERED")
    .map((log, idx) => {
      const matchInvoice = log.details.match(/INV-[\w-]+/);
      const matchAmt = log.details.match(/TZS\s*([\d,]+)/);
      const invoiceNumber = matchInvoice ? matchInvoice[0] : `INV-${new Date().getFullYear()}-${100000 + idx}`;
      const parsedAmount = matchAmt ? parseInt(matchAmt[1].replace(/,/g, ""), 10) : 150000;
      const isCustom = log.details.includes("CUSTOM");
      const isBusiness = log.details.includes("BUSINESS");
      const isStarter = log.details.includes("STARTER");
      const planName: PlanType = isCustom
        ? "CUSTOM"
        : isBusiness
        ? "BUSINESS"
        : isStarter
        ? "STARTER"
        : "PROFESSIONAL";

      return {
        invoice: invoiceNumber,
        date: log.timestamp.split(" ")[0] || new Date().toISOString().split("T")[0],
        plan: planName,
        durationMonths: 1,
        amount: isNaN(parsedAmount) ? 150000 : parsedAmount,
        paymentMethod: log.details.includes("LIPA") ? "Lipa Namba" : "Pesapal Mobile Money",
        status: "PAID",
        taxVat: Math.round(parsedAmount * (18 / 118)),
      };
    });

  const handleOpenCheckout = (planToSelect: PlanType) => {
    setSelectedPlan(planToSelect);
    setErrorMessage("");
    setPesapalSimulationStep("idle");
    setSelectedCarrier(detectCarrier(payerPhone));
    setIsCheckoutOpen(true);
  };

  const handleInitiatePesapalPayment = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/pesapal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          durationMonths: billingCycle,
          amount: finalTotal,
          currency: "TZS",
          customerName: business?.name || "TradePOS Merchant",
          customerPhone: payerPhone,
          customerEmail: payerEmail,
          customDetails: selectedPlan === "CUSTOM" || selectedPlan === "ENTERPRISE" ? customConfig : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isSw ? "Hitilafu kwenye lango la malipo" : "Payment gateway error"));
      }

      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank");
        setPesapalSimulationStep("awaiting_pin");
        setIsProcessing(false);
        return;
      }

      setPesapalSimulationStep("awaiting_pin");
      setIsProcessing(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || (isSw ? "Hitilafu wakati wa kuanzisha malipo" : "Error starting payment"));
      setIsProcessing(false);
    }
  };

  const handleConfirmSuccessfulPayment = (methodName: string, refCode?: string) => {
    setIsProcessing(true);
    const invoiceNum = refCode || `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      renewSubscription({
        planName: selectedPlan,
        durationMonths: billingCycle,
        amount: finalTotal,
        paymentMethod: methodName,
        invoiceNumber: invoiceNum,
      });

      const receiptRecord: InvoiceRecord = {
        invoice: invoiceNum,
        date: new Date().toISOString().split("T")[0],
        plan: selectedPlan,
        durationMonths: billingCycle,
        amount: finalTotal,
        paymentMethod: methodName,
        status: "PAID",
        taxVat: vatAmount,
        payerPhone,
        payerEmail,
      };

      setActiveReceipt(receiptRecord);
      setIsProcessing(false);
      setIsCheckoutOpen(false);
      setPesapalSimulationStep("idle");
    }, 700);
  };

  const handleVerifyLipaCode = () => {
    if (!lipaReferenceCode.trim() || lipaReferenceCode.trim().length < 6) {
      setErrorMessage(
        isSw
          ? "Tafadhali weka nambari sahihi ya uthibitisho wa SMS (Mfano: 9KT842...)"
          : "Please enter a valid SMS confirmation transaction code (e.g. 9KT842...)"
      );
      return;
    }
    handleConfirmSuccessfulPayment("Lipa Namba Till (5542109)", lipaReferenceCode.trim().toUpperCase());
  };

  const currentPlan = (business?.subscriptionPlan as PlanType) || "PROFESSIONAL";
  const currentExpiry = business?.subscriptionExpiry || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const daysLeft = getExpiryDaysRemaining();

  const formatCycleText = (cycle: BillingCycle) => {
    if (cycle === 1) return isSw ? "Mwezi 1 (Siku 30)" : "Monthly (30 Days)";
    if (cycle === 6) return isSw ? "Miezi 6 (10% Punguzo)" : "6 Months (10% Off)";
    return isSw ? "Mwaka 1 (20% Punguzo)" : "1 Year (20% Off)";
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header (AjiraMarket Style Image 3) */}
      <div>
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
          {isSw ? "Vifurushi, Malipo & Hali ya Leseni" : "Subscription & Billing License"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isSw
            ? "Lipa mara moja na upate huduma zote za TradePOS, usimamizi wa matawi na risiti za kodi moja kwa moja."
            : "Review your business tier, billing cycles, automated mobile money receipts, and multi-branch feature quotas."}
        </p>
      </div>

      {/* Billing Cycle Switcher Pills on the Page (Image 3 Reference) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            {isSw ? "Muda wa Malipo:" : "Billing Period:"}
          </span>
          <span className="text-xs text-slate-500">
            {isSw ? "(Pata punguzo kwa kulipia miezi mingi)" : "(Save more on long-term subscriptions)"}
          </span>
        </div>

        <div className="inline-flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          {[
            { cycle: 1 as BillingCycle, label: isSw ? "Mwezi 1" : "1 Month", discount: "" },
            { cycle: 6 as BillingCycle, label: isSw ? "Miezi 6" : "6 Months", discount: "10% OFF" },
            { cycle: 12 as BillingCycle, label: isSw ? "Mwaka 1" : "1 Year", discount: "20% OFF" },
          ].map((item) => {
            const isSelected = billingCycle === item.cycle;
            return (
              <button
                key={item.cycle}
                type="button"
                onClick={() => setBillingCycle(item.cycle)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#233C0D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{item.label}</span>
                {item.discount && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                      isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {item.discount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan Cards Grid (TradePOS Brand Palette) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch pt-2">
        {/* CARD 1: STARTER */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs flex flex-col justify-between transition hover:shadow-md">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                {isSw ? "KIFURUSHI CHA AWALI" : "STARTER TIER"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {formatCycleText(billingCycle)}
              </span>
            </div>

            <h3 className="text-xl font-black text-[#152709]">
              {isSw ? "Starter POS" : "Starter POS"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {isSw ? "Inafaa kwa maduka madogo, vijiwe vya mauzo na wajasiriamali wapya." : "Ideal for single retail shops, kiosks and upcoming traders."}
            </p>

            <div className="mb-6">
              <span className="text-3xl font-black text-[#152709]">
                TZS {calculateTotal("STARTER", billingCycle).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {" "}
                / {billingCycle === 1 ? (isSw ? "mwezi" : "month") : `${billingCycle} ${isSw ? "miezi" : "months"}`}
              </span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Tawi 1 la Biashara (Single Branch)" : "1 Business Branch"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Wafanyakazi hadi 2 (Wauzaji)" : "Up to 2 Staff Accounts"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Stoo, Bidhaa & Mauzo ya Kila Siku" : "Basic Inventory & Daily Sales"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Ripoti za Z-Report ya Kufunga Siku" : "Daily Z-Report & Receipt Print"}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout("STARTER")}
            className="mt-8 w-full py-3.5 rounded-2xl bg-[#233C0D] hover:bg-[#182C08] text-white text-xs font-black tracking-wider uppercase transition shadow-xs"
          >
            {currentPlan === "STARTER"
              ? isSw
                ? "Huisha Kifurushi Hiki"
                : "Renew Starter"
              : isSw
              ? "Chagua Starter"
              : "Select Starter"}
          </button>
        </div>

        {/* CARD 2: PROFESSIONAL (TRADE POS RECOMMENDED) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#8ECE28] shadow-lg flex flex-col justify-between relative transition hover:shadow-xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#233C0D] text-white text-[11px] font-black px-4 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            {isSw ? "INAYOPENDEKEZWA" : "RECOMMENDED"}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pt-1">
              <span className="px-3 py-1 rounded-full bg-[#E1FFAC] text-[#192E08] text-[10px] font-black uppercase tracking-wider">
                {isSw ? "MPANGO WA KAWAIDA" : "STANDARD PLAN"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {formatCycleText(billingCycle)}
              </span>
            </div>

            <h3 className="text-xl font-black text-[#152709]">
              {isSw ? "Professional Retail" : "Professional Retail"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {isSw ? "Maduka ya kati, jumla na mnyororo unaokua kwa kasi." : "Medium retail stores, wholesale & fast-growing chains."}
            </p>

            <div className="mb-6">
              <span className="text-3xl font-black text-[#152709]">
                TZS {calculateTotal("PROFESSIONAL", billingCycle).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {" "}
                / {billingCycle === 1 ? (isSw ? "mwezi" : "month") : `${billingCycle} ${isSw ? "miezi" : "months"}`}
              </span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Matawi hadi 5 & Maghala ya Bidhaa" : "Up to 5 Branches & Warehouses"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Wafanyakazi Bila Kikomo" : "Unlimited Staff Accounts & Roles"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Msaidizi wa AI (Copetra AI Coach)" : "AI Business Assistant (Copetra)"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Duka la Mtandaoni & Utoaji Oda" : "Online Store & Dispatch Tracker"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Uhasibu wa Faida & Hasara (P&L)" : "Full P&L Accounting & Audit"}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout("PROFESSIONAL")}
            className="mt-8 w-full py-3.5 rounded-2xl bg-[#233C0D] hover:bg-[#182C08] text-white text-xs font-black tracking-wider uppercase transition shadow-md"
          >
            {currentPlan === "PROFESSIONAL"
              ? isSw
                ? "Huisha Professional"
                : "Renew Professional"
              : isSw
              ? "Chagua Professional"
              : "Select Professional"}
          </button>
        </div>

        {/* CARD 3: BUSINESS CHAIN (ALL-IN-ONE BADGE LIKE AJIRAMARKET IMAGE 3) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-900 shadow-lg flex flex-col justify-between relative transition hover:shadow-xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-black px-4 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            {isSw ? "MFUMO MZIMA WA MATAWI" : "ALL-IN-ONE CHAIN SUITE"}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pt-1">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                {isSw ? "MATAWI MENGI" : "CHAIN ENTERPRISE"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {formatCycleText(billingCycle)}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900">
              {isSw ? "Business Chain" : "Business Chain"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {isSw ? "Matawi mengi, usambazaji wa jumla na ripoti za WhatsApp kwa bosi." : "Large retail chains, multi-warehouse & distribution."}
            </p>

            <div className="mb-6">
              <span className="text-3xl font-black text-slate-900">
                TZS {calculateTotal("BUSINESS", billingCycle).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {" "}
                / {billingCycle === 1 ? (isSw ? "mwezi" : "month") : `${billingCycle} ${isSw ? "miezi" : "months"}`}
              </span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Matawi & Maghala Bila Kikomo" : "Unlimited Branches & Warehouses"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Uhamishaji wa Bidhaa Baina ya Matawi" : "Inter-Branch Stock Transfers"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Bei za Jumla & Rejareja (Multi-Tier)" : "Multi-Tier Wholesale Pricing"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Ripoti za WhatsApp kwa Bosi Kiotomatiki" : "Automated WhatsApp Boss Alerts"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Usaidizi Maalum wa Kiufundi (24/7)" : "24/7 Priority Support Specialist"}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout("BUSINESS")}
            className="mt-8 w-full py-3.5 rounded-2xl bg-[#233C0D] hover:bg-[#182C08] text-white text-xs font-black tracking-wider uppercase transition shadow-md"
          >
            {currentPlan === "BUSINESS"
              ? isSw
                ? "Huisha Business Chain"
                : "Renew Business Chain"
              : isSw
              ? "Chagua Business Chain"
              : "Select Business Chain"}
          </button>
        </div>

        {/* CARD 4: CUSTOM PLAN (ENTERPRISE / TRA INTEGRATION) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs flex flex-col justify-between transition hover:shadow-md">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                {isSw ? "KIFURUSHI MAALUM" : "CUSTOM ENTERPRISE"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {formatCycleText(billingCycle)}
              </span>
            </div>

            <h3 className="text-xl font-black text-[#152709]">
              {isSw ? "Custom Plan" : "Custom Plan"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {isSw ? "Sanidi matawi, muunganisho wa TRA EFD na seva binafsi." : "Tailored to your exact branch size, TRA integration & server SLA."}
            </p>

            <div className="mb-4">
              <span className="text-3xl font-black text-[#152709]">
                TZS {calculateTotal("CUSTOM", billingCycle).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {" "}
                / {billingCycle === 1 ? (isSw ? "mwezi" : "month") : `${billingCycle} ${isSw ? "miezi" : "months"}`}
              </span>
            </div>

            {/* Quick in-card branch configurator toggle */}
            <div className="mb-4 p-3 rounded-2xl bg-slate-50 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-700">
                <span>{isSw ? "Matawi ya Biashara:" : "Configured Branches:"}</span>
                <span className="text-[#233C0D] font-black">{customConfig.branches}</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={customConfig.branches}
                onChange={(e) =>
                  setCustomConfig((prev) => ({ ...prev, branches: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-[#48791B] cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 font-bold">
                  <input
                    type="checkbox"
                    checked={customConfig.traFiscalSync}
                    onChange={(e) =>
                      setCustomConfig((prev) => ({ ...prev, traFiscalSync: e.target.checked }))
                    }
                    className="w-3.5 h-3.5 accent-[#48791B] rounded"
                  />
                  <span>TRA EFD/VFD</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 font-bold">
                  <input
                    type="checkbox"
                    checked={customConfig.dedicatedDb}
                    onChange={(e) =>
                      setCustomConfig((prev) => ({ ...prev, dedicatedDb: e.target.checked }))
                    }
                    className="w-3.5 h-3.5 accent-[#48791B] rounded"
                  />
                  <span>Private DB</span>
                </label>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Matawi 5 hadi 50+ kulingana na mahitaji" : "Configurable 5 to 50+ Branches"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Muunganisho Rasmi wa TRA EFD / VFD" : "TRA EFD / VFD Fiscal Integration"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Seva Binafsi & Backup Maalum (99.99%)" : "Dedicated Database & Backup Partition"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3E6517] shrink-0 mt-0.5" />
                <span>{isSw ? "Mafunzo ya Wafanyakazi Dukani" : "On-Site Staff Setup & Training"}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout("CUSTOM")}
            className="mt-8 w-full py-3.5 rounded-2xl bg-[#233C0D] hover:bg-[#182C08] text-white text-xs font-black tracking-wider uppercase transition shadow-xs"
          >
            {isSw ? "Lipa Custom Plan" : "Checkout Custom Plan"}
          </button>
        </div>
      </div>

      {/* Payment History & Invoices Ledger */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-extrabold text-sm text-[#152709]">
              {isSw ? "Kumbukumbu za Malipo & Risiti za Leseni" : "Billing & Payment Transaction Records"}
            </h4>
            <p className="text-xs text-slate-500">
              {isSw
                ? "Orodha kamili ya malipo yaliyothibitishwa kupitia Pesapal au Lipa Namba."
                : "Official ledger of verified payments via Pesapal gateway or Lipa Namba."}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="py-3 px-3.5">{isSw ? "Nambari ya Ankara / Risiti" : "Invoice / Receipt #"}</th>
                <th className="py-3 px-3.5">{isSw ? "Tarehe" : "Billing Date"}</th>
                <th className="py-3 px-3.5">{isSw ? "Kifurushi" : "Plan"}</th>
                <th className="py-3 px-3.5">{isSw ? "Njia ya Malipo" : "Payment Method"}</th>
                <th className="py-3 px-3.5">{isSw ? "Kiasi (TZS)" : "Amount (TZS)"}</th>
                <th className="py-3 px-3.5">{isSw ? "Hali" : "Status"}</th>
                <th className="py-3 px-3.5 text-right">{isSw ? "Kitendo" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {isSw ? "Bado hakuna kumbukumbu za malipo." : "No billing history recorded yet."}
                  </td>
                </tr>
              ) : (
                paymentHistory.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3.5 font-bold font-mono text-slate-900">{p.invoice}</td>
                    <td className="py-3 px-3.5 text-slate-500">{p.date}</td>
                    <td className="py-3 px-3.5 font-bold">{p.plan}</td>
                    <td className="py-3 px-3.5 text-slate-600">{p.paymentMethod}</td>
                    <td className="py-3 px-3.5 font-black text-slate-900">TZS {p.amount.toLocaleString()}</td>
                    <td className="py-3 px-3.5">
                      <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                        {isSw ? "IMELIPWA" : "PAID"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#233C0D] hover:bg-[#EAF3DE] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{isSw ? "Tazama Risiti" : "View Receipt"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT MODAL (TRADEPOS BRAND BACKGROUND & FRAMELESS INPUT) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          {/* Modal Container with TradePOS background color (NOT light blue) */}
          <div className="bg-[#F4FAF0] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto border border-[#D5E7C2]">
            {/* Modal Header Bar */}
            <div className="p-6 pb-3 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1FFAC] text-[#192E08] text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#233C0D] animate-pulse" />
                  <span>TRADEPOS DIRECT CHECKOUT</span>
                </div>
                <h3 className="text-xl font-black text-[#152709] tracking-tight">
                  TradePOS {selectedPlan} License
                </h3>
                <p className="text-xs text-[#526848] mt-0.5">
                  {formatCycleText(billingCycle)}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setPesapalSimulationStep("idle");
                }}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-[#4A643B] hover:text-[#182C08] transition shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 pt-2 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* PAYMENT AMOUNT BOX */}
              <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black text-[#5B754E] uppercase tracking-wider block">
                      {isSw ? "KIASI CHA MALIPO" : "PAYMENT AMOUNT"}
                    </span>
                    <span className="text-3xl font-black text-[#152709] tracking-tight mt-1 block">
                      TZS {finalTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#5B754E] block">
                      {isSw ? "Kifurushi:" : "Selected:"}
                    </span>
                    <span className="text-xs font-black text-[#152709]">
                      {selectedPlan}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#F0F5EB] flex items-center justify-between text-[11px] text-[#556D48] font-semibold">
                  <span>{isSw ? "Uthibitisho Papo Hapo" : "Instant Confirmation"}</span>
                  <span className="flex items-center gap-1 text-[#3E6517] font-bold">
                    <Lock className="w-3 h-3" />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                </div>
              </div>

              {/* SELECT NETWORK BOXES (FRAMELESS WITH REALISTIC LOGOS) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1F3609]">
                    {isSw ? "Chagua Mtandao:" : "Select Network:"}
                  </span>
                  <span className="text-[11px] text-[#3E6517] font-semibold">
                    {isSw ? "Chagua au Weka Namba" : "Select or Enter Number"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* M-PESA */}
                  <button
                    type="button"
                    onClick={() => setSelectedCarrier("mpesa")}
                    className={`p-3 rounded-2xl bg-white text-center transition border-0 ${
                      selectedCarrier === "mpesa"
                        ? "ring-2 ring-[#70B419] bg-[#F7FCF0] shadow-xs"
                        : "hover:bg-[#F3F7ED]"
                    }`}
                  >
                    <div className="text-sm font-black tracking-tight leading-none mb-1">
                      <span className="text-[#00853F]">M-</span>
                      <span className="text-[#E60000]">Pesa</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Vodacom</div>
                  </button>

                  {/* TIGO PESA */}
                  <button
                    type="button"
                    onClick={() => setSelectedCarrier("tigopesa")}
                    className={`p-3 rounded-2xl bg-white text-center transition border-0 ${
                      selectedCarrier === "tigopesa"
                        ? "ring-2 ring-[#70B419] bg-[#F7FCF0] shadow-xs"
                        : "hover:bg-[#F3F7ED]"
                    }`}
                  >
                    <div className="text-sm font-black text-[#00377B] tracking-tight leading-none mb-1">
                      Tigo Pesa
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Mixx / Tigo</div>
                  </button>

                  {/* AIRTEL */}
                  <button
                    type="button"
                    onClick={() => setSelectedCarrier("airtel")}
                    className={`p-3 rounded-2xl bg-white text-center transition border-0 ${
                      selectedCarrier === "airtel"
                        ? "ring-2 ring-[#70B419] bg-[#F7FCF0] shadow-xs"
                        : "hover:bg-[#F3F7ED]"
                    }`}
                  >
                    <div className="text-sm font-black text-[#E60000] tracking-tight leading-none mb-1">
                      Airtel
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Money</div>
                  </button>

                  {/* HALOPESA */}
                  <button
                    type="button"
                    onClick={() => setSelectedCarrier("halopesa")}
                    className={`p-3 rounded-2xl bg-white text-center transition border-0 ${
                      selectedCarrier === "halopesa"
                        ? "ring-2 ring-[#70B419] bg-[#F7FCF0] shadow-xs"
                        : "hover:bg-[#F3F7ED]"
                    }`}
                  >
                    <div className="text-sm font-black text-[#FF6600] tracking-tight leading-none mb-1">
                      HaloPesa
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Halotel</div>
                  </button>
                </div>
              </div>

              {/* PAYMENT PHONE NUMBER INPUT (COMPLETELY FRAME LESS) */}
              <div>
                <label className="block text-xs font-semibold text-[#1F3609] mb-1.5">
                  {isSw
                    ? "Namba ya Simu ya Malipo (M-Pesa, Tigo Pesa, Airtel, HaloPesa)"
                    : "Payment Phone Number (M-Pesa, Tigo Pesa, Airtel, HaloPesa)"}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0754123456 / 0654123456"
                    className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm font-bold text-[#152709] placeholder:text-[#889E7E] border-0 focus:outline-hidden shadow-xs"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#233C0D]">
                    {selectedCarrier === "mpesa" && "Vodacom"}
                    {selectedCarrier === "tigopesa" && "Tigo"}
                    {selectedCarrier === "airtel" && "Airtel"}
                    {selectedCarrier === "halopesa" && "Halotel"}
                  </div>
                </div>
                <p className="text-[11px] text-[#556D48] mt-1.5">
                  {isSw
                    ? "Simu yako itapokea ujumbe wa kuweka namba yako ya siri (PIN) kukamilisha malipo."
                    : "Your phone will receive a prompt to enter your PIN to complete payment."}
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              {pesapalSimulationStep === "idle" ? (
                <div>
                  <button
                    type="button"
                    onClick={handleInitiatePesapalPayment}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-[#233C0D] hover:bg-[#182C08] text-white text-xs font-black tracking-wider uppercase shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    <span>
                      {isProcessing
                        ? isSw
                          ? "Inaunganisha na Pesapal..."
                          : "Connecting to Pesapal Gateway..."
                        : isSw
                        ? "LIPA SASA KWA SIMU (TUMA MAOMBI YA PIN)"
                        : "PAY NOW VIA MOBILE (SEND PIN REQUEST)"}
                    </span>
                  </button>

                  {/* Secondary Till toggle */}
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethodMode(paymentMethodMode === "lipa_namba" ? "mobile" : "lipa_namba")
                      }
                      className="text-[11px] font-bold text-[#556D48] hover:text-[#233C0D] transition"
                    >
                      {paymentMethodMode === "lipa_namba"
                        ? isSw
                          ? "Rudi kwenye Malipo ya Simu (STK Push)"
                          : "Back to Mobile Push"
                        : isSw
                        ? "Au Lipa kwa Namba ya Till (5542109)"
                        : "Or Pay via Till Number (5542109)"}
                    </button>
                  </div>

                  {paymentMethodMode === "lipa_namba" && (
                    <div className="p-4 rounded-2xl bg-white space-y-3 mt-2 border-0 shadow-xs">
                      <div className="text-xs text-[#4F6742]">
                        {isSw
                          ? `Tuma TZS ${finalTotal.toLocaleString()} kwenda Till 5542109 (TradePOS Technologies), kisha weka SMS code ya muamala hapa:`
                          : `Send TZS ${finalTotal.toLocaleString()} to Till 5542109 (TradePOS Technologies), then enter your SMS reference code:`}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={lipaReferenceCode}
                          onChange={(e) => setLipaReferenceCode(e.target.value)}
                          placeholder="Mfano: 9KT564819P"
                          className="flex-1 bg-[#F4FAF0] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#152709] uppercase border-0 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyLipaCode}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl bg-[#233C0D] text-white text-xs font-black hover:bg-[#182C08] transition"
                        >
                          {isSw ? "Thibitisha" : "Verify"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white text-center space-y-3 shadow-xs border-0">
                  <div className="inline-flex p-3 rounded-full bg-[#E1FFAC] text-[#1E370A]">
                    <Smartphone className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-black text-[#152709]">
                    {isSw ? "Ombi la Malipo Limetumwa Kwenye Simu Yako!" : "Push Notification Sent to Phone!"}
                  </h4>
                  <p className="text-[11px] text-[#4F6742]">
                    {isSw
                      ? `Ombi la malipo la TZS ${finalTotal.toLocaleString()} limetumwa kwenda ${payerPhone} (${selectedCarrier.toUpperCase()}). Weka PIN yako kukamilisha.`
                      : `STK push request for TZS ${finalTotal.toLocaleString()} was dispatched to ${payerPhone}. Enter PIN on your phone.`}
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleConfirmSuccessfulPayment(
                          `Pesapal (${selectedCarrier.toUpperCase()})`,
                          `PESA-${Date.now().toString().slice(-6)}`
                        )
                      }
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-[#233C0D] text-white text-xs font-black hover:bg-[#182C08] transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSw ? "Thibitisha Malipo Yamekamilika" : "Confirm Payment Received"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FOOTER NOTE */}
              <div className="text-[11px] text-[#69825C] text-center pt-1 font-medium">
                256-Bit SSL Encrypted  •  TradePOS Direct Checkout
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE TAX INVOICE & RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto print:border-none print:shadow-none">
            {/* Header / Actions */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-black text-slate-900">
                  {isSw ? "Risiti Rasmi ya Kodi (TradePOS EFD)" : "Official Tax Invoice & Receipt"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isSw ? "Chapisha (Print)" : "Print"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Sheet */}
            <div className="p-6 lg:p-8 space-y-6 text-slate-900 bg-white" id="tradepos-receipt-print">
              <div className="text-center space-y-1 border-b border-dashed border-slate-200 pb-5">
                <div className="text-xs font-black tracking-widest text-[#0284C7] uppercase">
                  TradePOS Technologies Tanzania
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  {isSw ? "RISITI YA MALIPO YA LESENI" : "OFFICIAL SUBSCRIPTION INVOICE"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  TIN: 142-990-821 | VRN: 40-029182-K | Dar es Salaam, Tanzania
                </p>
                <p className="text-[11px] text-slate-500">Support: +255 754 123 456 | billing@tradepos.co.tz</p>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">{isSw ? "Mteja / Biashara:" : "Client Business:"}</span>
                  <strong className="text-slate-900 font-bold text-sm">{business?.name || "TradePOS Tenant"}</strong>
                  <div className="text-[11px] text-slate-500">
                    {business?.location || "Tanzania"} • {activeReceipt.payerPhone || business?.phone}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">{isSw ? "Nambari ya Risiti:" : "Receipt / Invoice #:"}</span>
                  <strong className="text-slate-900 font-mono font-bold text-sm">{activeReceipt.invoice}</strong>
                  <div className="text-[11px] text-slate-500">
                    {isSw ? "Tarehe:" : "Date:"} {activeReceipt.date}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-left">{isSw ? "Maelezo ya Kifurushi" : "Plan Description"}</th>
                      <th className="py-2.5 px-3 text-center">{isSw ? "Muda" : "Duration"}</th>
                      <th className="py-2.5 px-3 text-right">{isSw ? "Kiasi (TZS)" : "Amount (TZS)"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">TradePOS {activeReceipt.plan} License</div>
                        <div className="text-[10px] text-slate-500">
                          {isSw
                            ? "Mfumo kamili wa usimamizi wa biashara, mauzo, stoo na ripoti."
                            : "Full cloud POS, multi-branch inventory, analytics and reports."}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        {activeReceipt.durationMonths} {isSw ? "Mwezi" : "Month(s)"}
                      </td>
                      <td className="py-3 px-3 text-right font-black">
                        TZS {activeReceipt.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>{isSw ? "Kiasi Halisi (Net Subtotal):" : "Net Subtotal:"}</span>
                  <span className="font-bold text-slate-900">
                    TZS {(activeReceipt.amount - activeReceipt.taxVat).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{isSw ? "Kodi ya Ongezeko la Thamani (VAT 18%):" : "Tax (VAT 18%):"}</span>
                  <span className="font-bold text-slate-900">TZS {activeReceipt.taxVat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>{isSw ? "Jumla Yote Iliyolipwa:" : "Total Paid:"}</span>
                  <span className="text-[#0284C7]">TZS {activeReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>{isSw ? "Njia ya Malipo:" : "Payment Method:"}</span>
                  <span className="font-semibold text-slate-900">{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Verification Stamp */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black text-emerald-900 uppercase">
                    {isSw ? "HALI YA MALIPO: YAMETHIBITISHWA" : "PAYMENT STATUS: CONFIRMED"}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">
                    {isSw
                      ? "Leseni imewashwa rasmi katika mfumo wa TradePOS."
                      : "License officially activated in TradePOS cloud cluster."}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-emerald-200 text-emerald-900 font-black text-xs font-mono">
                  PAID-TZ
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-200">
                {isSw
                  ? "Asante kwa kuchagua TradePOS kuwa mshirika wa biashara yako!"
                  : "Thank you for partnering with TradePOS for your retail operations!"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
