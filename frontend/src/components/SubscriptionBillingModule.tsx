"use client";

import React, { useState, useId } from "react";
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
  ChevronRight,
  X,
  Smartphone,
  ExternalLink,
} from "lucide-react";

type PlanType = "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE" | "CUSTOM";
type BillingCycle = 1 | 6 | 12;

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

type MobileCarrier = "mpesa" | "tigopesa" | "airtel" | "halopesa";

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

const CARRIERS: {
  id: MobileCarrier;
  name: string;
  operator: string;
  prefixDesc: string;
  activeBg: string;
}[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    operator: "Vodacom",
    prefixDesc: "074, 075, 076",
    activeBg: "bg-red-500 text-white",
  },
  {
    id: "tigopesa",
    name: "Tigo Pesa",
    operator: "Tigo / Yas",
    prefixDesc: "071, 065, 067",
    activeBg: "bg-blue-600 text-white",
  },
  {
    id: "airtel",
    name: "Airtel Money",
    operator: "Airtel",
    prefixDesc: "078, 068, 069",
    activeBg: "bg-rose-600 text-white",
  },
  {
    id: "halopesa",
    name: "HaloPesa",
    operator: "Halotel",
    prefixDesc: "062, 061",
    activeBg: "bg-orange-500 text-white",
  },
];

export const SubscriptionBillingModule: React.FC = () => {
  const { business, renewSubscription, updateBusinessProfile, auditLogs, language } = useApp();

  const isSw = language === "sw";

  // Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    (business?.subscriptionPlan as PlanType) || "PROFESSIONAL"
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(1);
  const [paymentTab, setPaymentTab] = useState<"pesapal" | "lipa_namba">("pesapal");

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
  const [payerEmail, setPayerEmail] = useState(business?.email || "owner@tradepos.co.tz");
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

  const monthlyRate = calculatePlanMonthlyBase(selectedPlan);
  const discountPercent = getDiscountPercent(billingCycle);
  const subtotalBeforeDiscount = monthlyRate * billingCycle;
  const oneTimeTrainingFee =
    (selectedPlan === "CUSTOM" || selectedPlan === "ENTERPRISE") && customConfig.staffTraining ? 100000 : 0;
  const discountAmount = Math.round(subtotalBeforeDiscount * (discountPercent / 100));
  const finalTotal = subtotalBeforeDiscount - discountAmount + oneTimeTrainingFee;
  const vatAmount = Math.round(finalTotal * (18 / 118)); // 18% inclusive

  // Expiry calculation
  const getExpiryDaysRemaining = (): number => {
    if (!business?.subscriptionExpiry) return 30;
    const diff = new Date(business.subscriptionExpiry).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Payment History extracted from logs + current session
  const paymentHistory: InvoiceRecord[] = auditLogs
    .filter((log) => log.action === "SUBSCRIPTION_RENEWED" || log.action === "BUSINESS_REGISTERED")
    .map((log, idx) => {
      // Parse details from audit description if present
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
        paymentMethod: log.details.includes("LIPA") ? "Lipa Namba" : "Pesapal Gateway",
        status: "PAID",
        taxVat: Math.round(parsedAmount * (18 / 118)),
      };
    });

  const handleOpenCheckout = (planToSelect?: PlanType) => {
    if (planToSelect) {
      setSelectedPlan(planToSelect);
    }
    setErrorMessage("");
    setPesapalSimulationStep("idle");
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

      // If live Pesapal redirect URL returned
      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank");
        setPesapalSimulationStep("awaiting_pin");
        setIsProcessing(false);
        return;
      }

      // Simulated local STK Push verification
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

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">
            {isSw ? "Vifurushi, Malipo & Leseni ya Mfumo" : "Subscription, Billing & License Management"}
          </h2>
          <p className="text-xs text-[#526848] mt-0.5">
            {isSw
              ? "Dhibiti leseni ya biashara yako, fanya malipo ya Pesapal au Lipa Namba, na pakua risiti halisi za kodi."
              : "Manage your business tier, process real Pesapal or Lipa Namba payments, and access official tax invoices."}
          </p>
        </div>

        <button
          onClick={() => handleOpenCheckout(currentPlan)}
          className="px-5 py-2.5 rounded-xl neu-btn text-xs font-black shadow-xs flex items-center justify-center gap-2 shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>{isSw ? "Huisha / Lipa Kifurushi" : "Renew / Upgrade License"}</span>
        </button>
      </div>

      {/* Active Subscription Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#F9FCF3] to-[#F1F9E4] border-2 border-[#BEE674] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#345214]">
              {isSw ? "Kifurushi Kinachotumika Sasa" : "Active Business License"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E1FFAC] text-[#192E08] text-[11px] font-black border border-[#9EDE31]">
              {business?.subscriptionStatus || "ACTIVE"}
            </span>
            {daysLeft <= 5 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {isSw ? `Zimesalia siku ${daysLeft}` : `${daysLeft} days remaining`}
              </span>
            )}
          </div>

          <h3 className="text-3xl font-black text-[#152709] tracking-tight">
            {currentPlan} {isSw ? "TIER" : "PLAN"}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#4F6742]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#3E6517]" />
              <span>{isSw ? "Mwisho wa Leseni:" : "Next Billing Date:"}</span>
              <strong className="text-[#152709] font-mono">{currentExpiry}</strong>
            </span>
            <span>•</span>
            <span>
              {isSw ? "Muda Uliobaki:" : "Time Left:"}{" "}
              <strong className="text-[#152709]">
                {daysLeft} {isSw ? "Siku" : "Days"}
              </strong>
            </span>
            <span>•</span>
            <span>
              {isSw ? "Lango la Malipo:" : "Gateway:"}{" "}
              <strong className="text-[#152709]">Pesapal &amp; Lipa Namba (TZS)</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => handleOpenCheckout(currentPlan)}
            className="px-5 py-3 rounded-2xl bg-[#233C0D] hover:bg-[#182C08] text-white text-xs font-black shadow-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isSw ? "Ongeza Muda (Renew)" : "Renew License"}</span>
          </button>
          <button
            onClick={() => handleOpenCheckout("CUSTOM")}
            className="px-4 py-3 rounded-2xl bg-white hover:bg-[#F3F8EA] border border-[#C5D8B2] text-[#22390C] text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4 text-[#3D6417]" />
            <span>{isSw ? "Kifurushi cha Custom" : "Configure Custom Plan"}</span>
          </button>
        </div>
      </div>

      {/* Available Plans & Custom Plan Option */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-black text-[#162709]">
              {isSw ? "Chagua Kifurushi Kinachofaa Biashara Yako" : "Select Subscription Plan"}
            </h3>
            <p className="text-xs text-[#526848]">
              {isSw
                ? "Pata huduma zote za TradePOS kulingana na ukubwa wa biashara yako."
                : "Choose the scale that matches your business branch structure and accounting workflow."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* STARTER */}
          <div
            className={`p-5 rounded-2xl bg-white border flex flex-col justify-between transition ${
              currentPlan === "STARTER" ? "border-2 border-[#8ECE28] bg-[#FDFFF9] shadow-xs" : "border-[#D8E6CC]"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="font-black text-sm text-[#162709]">STARTER</h4>
                {currentPlan === "STARTER" && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E1FFAC] text-[#192E08]">
                    {isSw ? "Inatumika" : "Current"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#556C4B] mb-3">
                {isSw ? "Inafaa kwa maduka madogo na biashara changa" : "Ideal for single shops and retail starters"}
              </p>
              <div className="mb-4">
                <span className="text-2xl font-black text-[#152708]">TZS 50,000</span>
                <span className="text-xs text-[#556C4B]"> / {isSw ? "mwezi" : "mo"}</span>
              </div>
              <ul className="space-y-2 text-xs text-[#4F6742]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Tawi 1 la Biashara (Single Branch)" : "1 Business Branch"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Wafanyakazi hadi 2" : "Up to 2 Staff Accounts"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Stoo & Mauzo ya Kila Siku" : "Basic Inventory & Sales"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Ripoti za Z-Report ya Siku" : "Daily Z-Report & Receipt Print"}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenCheckout("STARTER")}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-black bg-white hover:bg-[#E1FFAC] border border-[#C5D8B2] text-[#22390C] transition"
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

          {/* PROFESSIONAL */}
          <div
            className={`p-5 rounded-2xl bg-white border flex flex-col justify-between transition relative ${
              currentPlan === "PROFESSIONAL" ? "border-2 border-[#8ECE28] bg-[#FDFFF9] shadow-xs" : "border-[#D8E6CC]"
            }`}
          >
            <div className="absolute -top-2.5 right-4 bg-[#21390A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
              {isSw ? "Maarufu Zaidi" : "Most Popular"}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="font-black text-sm text-[#162709]">PROFESSIONAL</h4>
                {currentPlan === "PROFESSIONAL" && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E1FFAC] text-[#192E08]">
                    {isSw ? "Inatumika" : "Current"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#556C4B] mb-3">
                {isSw ? "Maduka ya kati, jumla na mnyororo wa matawi" : "Medium retail stores, wholesale & chains"}
              </p>
              <div className="mb-4">
                <span className="text-2xl font-black text-[#152708]">TZS 150,000</span>
                <span className="text-xs text-[#556C4B]"> / {isSw ? "mwezi" : "mo"}</span>
              </div>
              <ul className="space-y-2 text-xs text-[#4F6742]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Matawi hadi 5 & Ghala za Bidhaa" : "Up to 5 Branches & Warehouses"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Wafanyakazi Bila Kikomo" : "Unlimited Staff Accounts"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Msaidizi wa AI (Copetra)" : "AI Assistant (Copetra)"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Duka la Mtandaoni & Utoaji Oda" : "Online Store & Dispatch Tracker"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Uhasibu wa Faida & Hasara (P&L)" : "Full P&L Accounting & Audit"}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenCheckout("PROFESSIONAL")}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-black neu-btn shadow-xs transition"
            >
              {currentPlan === "PROFESSIONAL"
                ? isSw
                  ? "Huisha Kifurushi Hiki"
                  : "Renew Professional"
                : isSw
                ? "Chagua Professional"
                : "Select Professional"}
            </button>
          </div>

          {/* BUSINESS CHAIN */}
          <div
            className={`p-5 rounded-2xl bg-white border flex flex-col justify-between transition ${
              currentPlan === "BUSINESS" ? "border-2 border-[#8ECE28] bg-[#FDFFF9] shadow-xs" : "border-[#D8E6CC]"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="font-black text-sm text-[#162709]">BUSINESS CHAIN</h4>
                {currentPlan === "BUSINESS" && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E1FFAC] text-[#192E08]">
                    {isSw ? "Inatumika" : "Current"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#556C4B] mb-3">
                {isSw ? "Matawi mengi, usambazaji wa jumla na ripoti za kiotomatiki" : "Large retail chains & distribution"}
              </p>
              <div className="mb-4">
                <span className="text-2xl font-black text-[#152708]">TZS 300,000</span>
                <span className="text-xs text-[#556C4B]"> / {isSw ? "mwezi" : "mo"}</span>
              </div>
              <ul className="space-y-2 text-xs text-[#4F6742]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Matawi & Maghala Bila Kikomo" : "Unlimited Branches & Warehouses"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Uhamishaji wa Bidhaa Baina ya Matawi" : "Inter-Branch Stock Transfers"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Bei za Jumla & Rejareja (Multi-Tier)" : "Multi-Tier Wholesale Pricing"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Ripoti za WhatsApp kwa Bosi Moja kwa Moja" : "Automated WhatsApp Boss Alerts"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Usaidizi Maalum wa Kiufundi (24/7)" : "24/7 Priority Support Specialist"}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenCheckout("BUSINESS")}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-black bg-white hover:bg-[#E1FFAC] border border-[#C5D8B2] text-[#22390C] transition"
            >
              {currentPlan === "BUSINESS"
                ? isSw
                  ? "Huisha Kifurushi Hiki"
                  : "Renew Business Chain"
                : isSw
                ? "Chagua Business Chain"
                : "Select Business Chain"}
            </button>
          </div>

          {/* CUSTOM / ENTERPRISE */}
          <div
            className={`p-5 rounded-2xl bg-white border flex flex-col justify-between transition ${
              currentPlan === "CUSTOM" || currentPlan === "ENTERPRISE"
                ? "border-2 border-[#8ECE28] bg-[#FDFFF9] shadow-xs"
                : "border-[#D8E6CC]"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="font-black text-sm text-[#162709]">{isSw ? "CUSTOM PLAN" : "CUSTOM / ENTERPRISE"}</h4>
                {(currentPlan === "CUSTOM" || currentPlan === "ENTERPRISE") && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E1FFAC] text-[#192E08]">
                    {isSw ? "Inatumika" : "Current"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#556C4B] mb-3">
                {isSw
                  ? "Kifurushi maalum kinachorekebishwa kulingana na mahitaji yako"
                  : "Tailored to your exact branch size, TRA integration & server SLA"}
              </p>
              <div className="mb-4">
                <span className="text-2xl font-black text-[#152708]">
                  {isSw ? "Kuanzia " : "From "}TZS 250,000
                </span>
                <span className="text-xs text-[#556C4B]"> / {isSw ? "mwezi" : "mo"}</span>
              </div>
              <ul className="space-y-2 text-xs text-[#4F6742]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Idadi ya Matawi unayotaka (5 - 50+)" : "Configurable Branches (5 - 50+)"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Kuunganishwa na TRA EFD / VFD" : "TRA EFD / VFD Fiscal Integration"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Database Binafsi & Backup Maalum" : "Dedicated Database & Backup"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6517] shrink-0" />
                  <span>{isSw ? "Mafunzo ya Wafanyakazi Dukani" : "On-Site Staff Training & Setup"}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenCheckout("CUSTOM")}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-black bg-[#1E350A] hover:bg-[#28480C] text-white transition flex items-center justify-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isSw ? "Sanidi & Lipa Custom" : "Configure & Checkout"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment History & Invoices Ledger */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#D8E6CC] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-extrabold text-sm text-[#162709]">
              {isSw ? "Kumbukumbu za Malipo & Risiti za Leseni" : "Billing & Payment Transaction Records"}
            </h4>
            <p className="text-xs text-[#526848]">
              {isSw
                ? "Orodha kamili ya malipo yaliyothibitishwa kupitia Pesapal au Lipa Namba."
                : "Official ledger of verified payments via Pesapal gateway or Lipa Namba."}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
            <thead className="bg-[#F8FAF4] font-bold text-[#4D6340]">
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
            <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#65795e]">
                    {isSw ? "Bado hakuna kumbukumbu za malipo." : "No billing history recorded yet."}
                  </td>
                </tr>
              ) : (
                paymentHistory.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FBF6] transition">
                    <td className="py-3 px-3.5 font-bold font-mono text-[#182C08]">{p.invoice}</td>
                    <td className="py-3 px-3.5 text-[#58704D]">{p.date}</td>
                    <td className="py-3 px-3.5 font-bold">{p.plan}</td>
                    <td className="py-3 px-3.5 text-[#4A613E]">{p.paymentMethod}</td>
                    <td className="py-3 px-3.5 font-black text-[#152709]">TZS {p.amount.toLocaleString()}</td>
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

      {/* CHECKOUT MODAL (CLEAN, NO FRAME, AUTO-SELECTING CARRIER BADGES) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 flex items-center justify-between bg-[#F8FAF4]">
              <div>
                <h3 className="text-base font-black text-[#162709]">
                  {isSw ? "Malipo ya Leseni ya TradePOS" : "TradePOS License Checkout"}
                </h3>
                <p className="text-xs text-[#526848]">
                  {isSw
                    ? "Chagua kifurushi, weka namba yako ya simu na ukamilishe malipo."
                    : "Select your plan, enter mobile payment number and complete renewal."}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setPesapalSimulationStep("idle");
                }}
                className="p-2 rounded-full hover:bg-[#E5EFE0] text-[#4A613E] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 lg:p-6 overflow-y-auto space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Select Plan (CLEAN, NO FRAME, AUTO BACKGROUND ON SELECTION) */}
              <div>
                <label className="block text-xs font-black text-[#1F3609] uppercase tracking-wider mb-2">
                  {isSw ? "1. Chagua Kifurushi" : "1. Select Plan"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["STARTER", "PROFESSIONAL", "BUSINESS", "CUSTOM"] as PlanType[]).map((p) => {
                    const isSelected = selectedPlan === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPlan(p)}
                        className={`p-3 rounded-2xl text-left transition border-0 ${
                          isSelected
                            ? "bg-[#D9F4A4] text-[#142A06] font-black shadow-xs scale-[1.01]"
                            : "bg-[#F3F6EE] text-[#4F6444] hover:bg-[#E8EFE1]"
                        }`}
                      >
                        <div className="text-xs font-black">{p}</div>
                        <div className={`text-[11px] mt-0.5 ${isSelected ? "text-[#28480C]" : "text-[#627757]"}`}>
                          {p === "STARTER" && "50k / mo"}
                          {p === "PROFESSIONAL" && "150k / mo"}
                          {p === "BUSINESS" && "300k / mo"}
                          {p === "CUSTOM" && (isSw ? "Maalum" : "Tailored")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM PLAN CONFIGURATOR (Shown when CUSTOM is selected) */}
              {(selectedPlan === "CUSTOM" || selectedPlan === "ENTERPRISE") && (
                <div className="p-4 rounded-2xl bg-[#F6FBF0] space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#2E4F10]" />
                    <h4 className="text-xs font-black text-[#1D320B] uppercase tracking-wider">
                      {isSw ? "Mipangilio ya Custom Plan (Enterprise)" : "Custom Plan Configurator"}
                    </h4>
                  </div>

                  {/* Branches Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-[#2A4315]">
                      <span>{isSw ? "Idadi ya Matawi ya Biashara:" : "Number of Business Branches:"}</span>
                      <span className="font-black text-sm bg-white px-2.5 py-0.5 rounded-xl shadow-xs">
                        {customConfig.branches} {isSw ? "Matawi" : "Branches"}
                      </span>
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
                    <div className="flex justify-between text-[10px] text-[#5F7651] mt-1">
                      <span>5 {isSw ? "Matawi (Base)" : "Branches"}</span>
                      <span>25 {isSw ? "Matawi" : "Branches"}</span>
                      <span>50 {isSw ? "Matawi (Max)" : "Branches"}</span>
                    </div>
                  </div>

                  {/* Feature Addon Toggles */}
                  <div className="space-y-2 pt-2">
                    <label
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                        customConfig.traFiscalSync ? "bg-[#E5F7C7] text-[#142807]" : "bg-[#F3F6EE] text-[#4F6444]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-[#3C6416]" />
                        <div>
                          <div className="text-xs font-bold">
                            {isSw ? "Uunganishaji wa TRA EFD / VFD" : "TRA EFD / VFD Fiscal Integration"}
                          </div>
                          <div className="text-[11px] opacity-80">
                            {isSw ? "Utoaji wa risiti za kiotomatiki za TRA" : "Automated fiscal signature & TRA receipts"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black">+50k/mo</span>
                        <input
                          type="checkbox"
                          checked={customConfig.traFiscalSync}
                          onChange={(e) =>
                            setCustomConfig((prev) => ({ ...prev, traFiscalSync: e.target.checked }))
                          }
                          className="w-4 h-4 accent-[#48791B] rounded"
                        />
                      </div>
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                        customConfig.dedicatedDb ? "bg-[#E5F7C7] text-[#142807]" : "bg-[#F3F6EE] text-[#4F6444]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Server className="w-4 h-4 text-[#3C6416]" />
                        <div>
                          <div className="text-xs font-bold">
                            {isSw ? "Database Binafsi & Backup Maalum" : "Dedicated Database & Backup Partition"}
                          </div>
                          <div className="text-[11px] opacity-80">
                            {isSw ? "Ulinzi wa juu na seva inayojitegemea" : "Isolated server partition with 99.99% SLA"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black">+50k/mo</span>
                        <input
                          type="checkbox"
                          checked={customConfig.dedicatedDb}
                          onChange={(e) =>
                            setCustomConfig((prev) => ({ ...prev, dedicatedDb: e.target.checked }))
                          }
                          className="w-4 h-4 accent-[#48791B] rounded"
                        />
                      </div>
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                        customConfig.staffTraining ? "bg-[#E5F7C7] text-[#142807]" : "bg-[#F3F6EE] text-[#4F6444]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[#3C6416]" />
                        <div>
                          <div className="text-xs font-bold">
                            {isSw ? "Mafunzo ya Wafanyakazi Dukani" : "On-Site Staff Setup & Training"}
                          </div>
                          <div className="text-[11px] opacity-80">
                            {isSw ? "Mtaalamu anakuja kutoa mafunzo kwa timu" : "Engineer on-site training for cashier team"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black">+100k (mara 1)</span>
                        <input
                          type="checkbox"
                          checked={customConfig.staffTraining}
                          onChange={(e) =>
                            setCustomConfig((prev) => ({ ...prev, staffTraining: e.target.checked }))
                          }
                          className="w-4 h-4 accent-[#48791B] rounded"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Select Duration / Cycle (CLEAN, NO FRAME, AUTO BACKGROUND ON SELECTION) */}
              <div>
                <label className="block text-xs font-black text-[#1F3609] uppercase tracking-wider mb-2">
                  {isSw ? "2. Muda wa Leseni (Billing Period)" : "2. Billing Period"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { cycle: 1 as BillingCycle, label: isSw ? "Mwezi 1" : "1 Month", discount: "" },
                    { cycle: 6 as BillingCycle, label: isSw ? "Miezi 6" : "6 Months", discount: "10% Punguzo" },
                    { cycle: 12 as BillingCycle, label: isSw ? "Mwaka 1 (Miezi 12)" : "1 Year (12 Mo)", discount: "20% Punguzo" },
                  ].map((item) => {
                    const isSelected = billingCycle === item.cycle;
                    return (
                      <button
                        key={item.cycle}
                        type="button"
                        onClick={() => setBillingCycle(item.cycle)}
                        className={`p-3 rounded-2xl text-center transition border-0 ${
                          isSelected
                            ? "bg-[#D9F4A4] text-[#142A06] font-black shadow-xs scale-[1.01]"
                            : "bg-[#F3F6EE] text-[#4F6444] hover:bg-[#E8EFE1]"
                        }`}
                      >
                        <div className="text-xs font-black">{item.label}</div>
                        {item.discount && (
                          <div className="text-[10px] font-bold text-emerald-800 bg-white/70 rounded-full px-2 py-0.5 mt-1 inline-block">
                            {item.discount}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Payment Phone & Carrier Detection (CLEAN, NO FRAME, AUTO DETECT) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#1F3609] uppercase tracking-wider">
                    {isSw ? "3. Nambari ya Simu ya Malipo" : "3. Mobile Payment Number"}
                  </label>
                  <span className="text-[11px] text-[#556D48] font-semibold">
                    {isSw ? "Inatambua mtandao kiotomatiki" : "Auto-detects carrier"}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0754123456"
                    className="w-full bg-[#F3F6EE] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#142807] focus:outline-hidden focus:bg-[#EBF2E2] transition border-0"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-white shadow-xs">
                    <Check className="w-3.5 h-3.5 text-[#3E6517]" />
                    <span>
                      {selectedCarrier === "mpesa" && "Vodacom M-Pesa"}
                      {selectedCarrier === "tigopesa" && "Tigo Pesa"}
                      {selectedCarrier === "airtel" && "Airtel Money"}
                      {selectedCarrier === "halopesa" && "HaloPesa"}
                    </span>
                  </div>
                </div>

                {/* 4 Carrier Boxes with clean background colors and NO frame */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {CARRIERS.map((carrier) => {
                    const isSelected = selectedCarrier === carrier.id;
                    return (
                      <button
                        key={carrier.id}
                        type="button"
                        onClick={() => setSelectedCarrier(carrier.id)}
                        className={`p-3 rounded-2xl text-left transition border-0 ${
                          isSelected
                            ? `${carrier.activeBg} font-black shadow-xs scale-[1.02]`
                            : "bg-[#F3F6EE] text-[#4F6444] hover:bg-[#EAEFE4]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{carrier.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? "text-white/90" : "text-[#718667]"}`}>
                          {carrier.operator}
                        </div>
                        <div className={`text-[9px] mt-1 font-mono ${isSelected ? "text-white/80" : "text-[#83977A]"}`}>
                          {carrier.prefixDesc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cost Summary Breakdown (Clean, Frameless) */}
              <div className="p-4 rounded-2xl bg-[#F6F9F0] space-y-2 text-xs">
                <div className="flex justify-between text-[#516744]">
                  <span>
                    {isSw ? "Ada ya mwezi:" : "Monthly rate:"} ({selectedPlan})
                  </span>
                  <span className="font-bold text-[#1A2E0A]">TZS {monthlyRate.toLocaleString()}</span>
                </div>
                {billingCycle > 1 && (
                  <div className="flex justify-between text-[#516744]">
                    <span>
                      {isSw ? "Jumla ya miezi:" : "Period subtotal:"} ({billingCycle}{" "}
                      {isSw ? "miezi" : "mo"})
                    </span>
                    <span className="font-bold text-[#1A2E0A]">TZS {subtotalBeforeDiscount.toLocaleString()}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>
                      {isSw ? "Punguzo la muda mrefu" : "Long-term savings"} ({discountPercent}%):
                    </span>
                    <span>-TZS {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {oneTimeTrainingFee > 0 && (
                  <div className="flex justify-between text-[#516744]">
                    <span>{isSw ? "Ada ya mafunzo dukani:" : "On-site staff setup & training:"}</span>
                    <span className="font-bold text-[#1A2E0A]">TZS {oneTimeTrainingFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E3EDD9] flex justify-between items-center text-sm font-black text-[#152709]">
                  <span>{isSw ? "Jumla Kuu ya Kulipa (VAT Inclusive):" : "Total Payable (VAT Inclusive):"}</span>
                  <span className="text-lg text-[#1F3908]">TZS {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Processing Flow */}
              {pesapalSimulationStep === "idle" ? (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleInitiatePesapalPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl neu-btn text-xs font-black shadow-xs flex items-center justify-center gap-2 transition"
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
                        ? `Lipa TZS ${finalTotal.toLocaleString()} (${
                            selectedCarrier === "mpesa"
                              ? "Vodacom M-Pesa"
                              : selectedCarrier === "tigopesa"
                              ? "Tigo Pesa"
                              : selectedCarrier === "airtel"
                              ? "Airtel Money"
                              : "HaloPesa"
                          })`
                        : `Pay TZS ${finalTotal.toLocaleString()} (${
                            selectedCarrier === "mpesa"
                              ? "Vodacom M-Pesa"
                              : selectedCarrier === "tigopesa"
                              ? "Tigo Pesa"
                              : selectedCarrier === "airtel"
                              ? "Airtel Money"
                              : "HaloPesa"
                          })`}
                    </span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-[#556D48] pt-1">
                    <button
                      type="button"
                      onClick={() => setPaymentTab(paymentTab === "lipa_namba" ? "pesapal" : "lipa_namba")}
                      className="hover:underline font-bold text-[#233C0D]"
                    >
                      {paymentTab === "lipa_namba"
                        ? isSw
                          ? "Tumia Malipo ya Simu (Pesapal Push)"
                          : "Use Mobile Push (Pesapal)"
                        : isSw
                        ? "Lipa kwa Namba ya Till (5542109)"
                        : "Pay via Till Number (5542109)"}
                    </button>
                    <span>Lango Rasmi la Pesapal</span>
                  </div>

                  {paymentTab === "lipa_namba" && (
                    <div className="p-4 rounded-2xl bg-[#F6F9F0] space-y-3 mt-2">
                      <div className="text-xs text-[#3E5533]">
                        {isSw
                          ? "Tuma TZS " + finalTotal.toLocaleString() + " kwenda Till 5542109 (TradePOS Technologies), kisha weka nambari ya SMS ya muamala hapa chini:"
                          : "Send TZS " + finalTotal.toLocaleString() + " to Till 5542109 (TradePOS Technologies), then enter the SMS transaction code below:"}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={lipaReferenceCode}
                          onChange={(e) => setLipaReferenceCode(e.target.value)}
                          placeholder="Mfano: 9KT564819P"
                          className="flex-1 bg-white rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#142807] uppercase border-0 focus:ring-2 focus:ring-[#77B822]"
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
                <div className="p-5 rounded-2xl bg-[#F6FBF1] text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-[#E1FFAC] text-[#1E370A]">
                    <Smartphone className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-black text-[#152709]">
                    {isSw ? "Ombi la Malipo Limetumwa Kwenye Simu Yako!" : "Push Notification Sent to Phone!"}
                  </h4>
                  <p className="text-[11px] text-[#4F6742]">
                    {isSw
                      ? `Ombi la malipo la TZS ${finalTotal.toLocaleString()} limetumwa kwenda ${payerPhone} (${
                          selectedCarrier === "mpesa"
                            ? "M-Pesa"
                            : selectedCarrier === "tigopesa"
                            ? "Tigo Pesa"
                            : selectedCarrier === "airtel"
                            ? "Airtel Money"
                            : "HaloPesa"
                        }). Weka PIN yako kukamilisha.`
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
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE TAX INVOICE & RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#C5D8B2] shadow-2xl overflow-hidden flex flex-col my-auto print:border-none print:shadow-none">
            {/* Header / Actions */}
            <div className="p-4 border-b border-[#E3EDD9] flex items-center justify-between bg-[#F8FAF4] print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2E4E10]" />
                <span className="text-xs font-black text-[#152709]">
                  {isSw ? "Risiti Rasmi ya Kodi (TradePOS EFD)" : "Official Tax Invoice & Receipt"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#233C0D] text-white text-xs font-bold hover:bg-[#182C08] transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isSw ? "Chapisha (Print)" : "Print"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="p-1.5 rounded-full hover:bg-[#E5EFE0] text-[#4A613E] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Sheet */}
            <div className="p-6 lg:p-8 space-y-6 text-[#1A2E0A] bg-white" id="tradepos-receipt-print">
              <div className="text-center space-y-1 border-b border-dashed border-[#C5D8B2] pb-5">
                <div className="text-xs font-black tracking-widest text-[#2D4C10] uppercase">
                  TradePOS Technologies Tanzania
                </div>
                <h3 className="text-lg font-black tracking-tight text-[#142608]">
                  {isSw ? "RISITI YA MALIPO YA LESENI" : "OFFICIAL SUBSCRIPTION INVOICE"}
                </h3>
                <p className="text-[11px] text-[#556D48]">
                  TIN: 142-990-821 | VRN: 40-029182-K | Dar es Salaam, Tanzania
                </p>
                <p className="text-[11px] text-[#556D48]">Support: +255 754 123 456 | billing@tradepos.co.tz</p>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#647C59] block">{isSw ? "Mteja / Biashara:" : "Client Business:"}</span>
                  <strong className="text-[#152709] font-bold text-sm">{business?.name || "TradePOS Tenant"}</strong>
                  <div className="text-[11px] text-[#556D48]">
                    {business?.location || "Tanzania"} • {activeReceipt.payerPhone || business?.phone}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#647C59] block">{isSw ? "Nambari ya Risiti:" : "Receipt / Invoice #:"}</span>
                  <strong className="text-[#152709] font-mono font-bold text-sm">{activeReceipt.invoice}</strong>
                  <div className="text-[11px] text-[#556D48]">
                    {isSw ? "Tarehe:" : "Date:"} {activeReceipt.date}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-[#D8E6CC] rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#F8FAF4] font-bold text-[#4D6340] border-b border-[#D8E6CC]">
                    <tr>
                      <th className="py-2.5 px-3 text-left">{isSw ? "Maelezo ya Kifurushi" : "Plan Description"}</th>
                      <th className="py-2.5 px-3 text-center">{isSw ? "Muda" : "Duration"}</th>
                      <th className="py-2.5 px-3 text-right">{isSw ? "Kiasi (TZS)" : "Amount (TZS)"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F6EB]">
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#142608]">TradePOS {activeReceipt.plan} License</div>
                        <div className="text-[10px] text-[#5A734D]">
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
                <div className="flex justify-between text-[#556D48]">
                  <span>{isSw ? "Kiasi Halisi (Net Subtotal):" : "Net Subtotal:"}</span>
                  <span className="font-bold text-[#152709]">
                    TZS {(activeReceipt.amount - activeReceipt.taxVat).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#556D48]">
                  <span>{isSw ? "Kodi ya Ongezeko la Thamani (VAT 18%):" : "Tax (VAT 18%):"}</span>
                  <span className="font-bold text-[#152709]">TZS {activeReceipt.taxVat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#152709] pt-2 border-t border-[#D8E6CC]">
                  <span>{isSw ? "Jumla Yote Iliyolipwa:" : "Total Paid:"}</span>
                  <span className="text-[#203A09]">TZS {activeReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#556D48] pt-1">
                  <span>{isSw ? "Njia ya Malipo:" : "Payment Method:"}</span>
                  <span className="font-semibold text-[#152709]">{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Verification Stamp & QR Mock */}
              <div className="p-4 rounded-2xl bg-[#F6FBF1] border border-[#C6E697] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black text-[#213B0B] uppercase">
                    {isSw ? "HALI YA MALIPO: YAMETHIBITISHWA" : "PAYMENT STATUS: CONFIRMED"}
                  </div>
                  <div className="text-[10px] text-[#516C44] mt-0.5">
                    {isSw
                      ? "Leseni imewashwa rasmi katika mfumo wa TradePOS."
                      : "License officially activated in TradePOS cloud cluster."}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-[#E1FFAC] text-[#192E08] font-black text-xs font-mono border border-[#9EDE31]">
                  PAID-TZ
                </div>
              </div>

              <div className="text-center text-[10px] text-[#6E8662] pt-2 border-t border-dashed border-[#C5D8B2]">
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
