"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  Store,
  Layers,
  Users,
  DollarSign,
  Truck,
  Globe,
  FileText,
  Check,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  FileCheck,
  Headphones
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
  onDemoLogin: () => void;
}

const SW_PHRASES = [
  "Simamia Biashara Yako Yote Sehemu Moja.",
  "Rahisisha Mauzo ya POS na Risiti Papo Hapo.",
  "Dhibiti Stoo, Wateja na Madeni kwa Usahihi.",
  "Fuatilia Faida Halisi na Matumizi Kila Siku."
];

const EN_PHRASES = [
  "Run Your Entire Business From One Platform.",
  "Fast POS Checkout, Mobile Money & Receipts.",
  "Real-Time Stock Control, Inventory & Debts.",
  "Track Daily Profits, Expenses & Financial Growth."
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoginClick, onDemoLogin }) => {
  const { t, language, setLanguage } = useApp();

  const phrases = language === "sw" ? SW_PHRASES : EN_PHRASES;

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState<string>(() => (language === "sw" ? SW_PHRASES[0] : EN_PHRASES[0]));
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize immediately if language changes
  useEffect(() => {
    const list = language === "sw" ? SW_PHRASES : EN_PHRASES;
    setDisplayText(list[0]);
    setPhraseIndex(0);
    setIsDeleting(false);
  }, [language]);

  // Robust typewriter timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPhrase = phrases[phraseIndex % phrases.length];

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 60);
      } else {
        // Sentence fully typed - pause for 2.5 seconds
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        }, 30);
      } else {
        // Sentence fully deleted - advance to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, phrases]);

  const features = [
    {
      title: "High-Speed POS & Sales",
      desc: "Instant barcode scanner, fast cart, receipt printing, mobile money and cash payment processing.",
      icon: ShoppingBag,
    },
    {
      title: "Real-Time Stock & Inventory",
      desc: "Low-stock notifications, batch and expiry tracking, minimum buffer controls, and supplier purchase integration.",
      icon: Layers,
    },
    {
      title: "Customer & Debt CRM",
      desc: "Manage customer credit, record installment payments, debt reminders, loyalty rewards and total spending history.",
      icon: Users,
    },
    {
      title: "Expense & Accounting",
      desc: "Track daily expenses, compute Gross Profit, COGS, Net Profit, cash flow, and generate automated P&L statements.",
      icon: DollarSign,
    },
    {
      title: "Multi-Branch Management",
      desc: "Centrally monitor Kariakoo, Masaki, Mbezi or any branch. Transfer stock effortlessly with consolidated reports.",
      icon: Store,
    },
    {
      title: "Automated Financial Reports",
      desc: "Daily sales summaries, margin tracking, profit breakdowns, expense audits and exportable PDF/Excel records.",
      icon: FileText,
    },
    {
      title: "Online Storefront",
      desc: "Launch your own online shop directly synchronized with your physical POS stock counts.",
      icon: Globe,
    },
    {
      title: "Delivery Driver Dispatch",
      desc: "Manage delivery fees, track order statuses from Packed to Delivered, and assign internal or third-party drivers.",
      icon: Truck,
    },
  ];

  const businessTypes = [
    "Retail Shops",
    "Supermarkets",
    "Cosmetics & Beauty",
    "Restaurants & Cafes",
    "Hardware Stores",
    "Electronics & Phones",
    "Clothing Boutiques",
    "Pharmacies",
    "Wholesale Depots",
    "Salons & Spas",
    "Spare Parts Dealers",
    "Food Businesses",
  ];

  const pricingPlans = [
    {
      name: "PROFESSIONAL",
      price: "TZS 150,000",
      period: "/ month",
      recommended: true,
      desc: "The complete business operating system for thriving retail and commercial establishments.",
      features: [
        "Multiple Branches & Warehouses",
        "Unlimited Staff with Granular Roles",
        "Fast POS & Cash / Mobile Money",
        "Real-Time Stock & Buffer Alerts",
        "Full Accounting & P&L Statements",
        "Customer CRM & Debt Tracking",
        "Free Online Store & Delivery Tracking",
        "Offline POS Resilient Caching",
        "Priority VIP Support & Cloud Backups",
      ],
      isPopular: true,
    },
    {
      name: "BUSINESS",
      price: "TZS 300,000",
      period: "/ month",
      desc: "For multi-chain supermarkets, wholesale distributors, and multi-branch operations.",
      features: [
        "Up to 10 Branches & Warehouses",
        "Comprehensive Inter-Branch Stock Transfers",
        "Advanced Multi-Tier Wholesale Pricing",
        "Automated WhatsApp Debt & Order Reminders",
        "Dedicated Account Specialist",
        "Custom ERP Integrations & API Access",
      ],
      isPopular: false,
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      period: "",
      desc: "Tailored private server setup with custom modules for large retail networks.",
      features: [
        "Unlimited Branches & Terminals",
        "Dedicated Database Partition",
        "Custom Financial Compliance & TRA EFD",
        "SLA 99.99% Uptime Guarantee",
        "On-Site Staff Training",
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="min-h-screen text-[#1E241E]">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#E1FFAC]/95 backdrop-blur-md border-b border-[#c8eb8e] px-6 lg:px-12 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-neu-card flex items-center justify-center border border-[#cbef92]">
              <ShoppingBag className="w-6 h-6 text-[#1f330b]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#142308]">
                TradePOS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#2f3f26]">
            <a href="#features" className="hover:text-black transition">
              {t.features}
            </a>
            <a href="#solutions" className="hover:text-black transition">
              {t.solutions}
            </a>
            <a href="#pricing" className="hover:text-black transition">
              {t.pricing}
            </a>
            <a href="#about" className="hover:text-black transition">
              {t.about}
            </a>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "sw" : "en")}
              className="px-2 sm:px-3 py-1.5 rounded-xl neu-btn-secondary text-[11px] sm:text-xs font-bold flex items-center gap-1 border border-[#cbe89a]"
            >
              <Globe className="w-3.5 h-3.5 text-[#3b591b]" />
              <span className="hidden sm:inline">{language === "en" ? "Kiswahili" : "English"}</span>
              <span className="sm:hidden">{language === "en" ? "SW" : "EN"}</span>
            </button>

            {/* DEMO ACCOUNT QUICK LOGIN BUTTON */}
            <button
              onClick={onDemoLogin}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white text-[#1f350c] border-2 border-[#8ece28] text-[11px] sm:text-xs font-black shadow-xs hover:bg-[#F2FFD6] transition"
            >
              <span className="hidden sm:inline">{t.demoAccount}</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              onClick={onLoginClick}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl neu-btn-secondary text-[11px] sm:text-xs font-bold hover:bg-white transition"
            >
              {t.login}
            </button>

            <button
              onClick={onGetStarted}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#263e10] text-[#E1FFAC] text-[11px] sm:text-xs font-bold hover:bg-[#1a2c09] shadow-sm transition"
            >
              <span className="hidden sm:inline">{t.getStarted}</span>
              <span className="sm:hidden">Anza</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          
          <h1 className="text-4xl md:text-6xl font-black text-[#142207] tracking-tight leading-tight max-w-4xl mx-auto mb-6 min-h-[120px] md:min-h-[145px] flex items-center justify-center">
            <span className="bg-white/70 backdrop-blur-md px-6 py-3 rounded-3xl border border-white/60 shadow-sm inline-block">
              {displayText}
              <span className="inline-block w-1.5 h-8 md:h-12 ml-2 bg-[#1b3009] animate-pulse align-middle" />
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#263520] max-w-3xl mx-auto font-medium mb-10 leading-relaxed bg-white/40 py-2 px-4 rounded-2xl backdrop-blur-xs">
            Manage sales, inventory, customers, expenses, accounting, branches and business intelligence from one simple platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#1f350c] text-[#E1FFAC] text-base font-bold shadow-neu-raised hover:bg-[#152507] hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-3"
            >
              <span>{t.getStarted}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onDemoLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#213812] border-2 border-[#8ecc28] text-base font-extrabold shadow-neu-flat hover:bg-[#F4FFDC] transition"
            >
              {t.demoAccount}
            </button>
          </div>

          {/* Hero POS Dashboard Preview Mockup */}
          <div className="relative max-w-5xl mx-auto rounded-3xl p-3 bg-white/90 border-2 border-[#b5eb65] shadow-neu-raised backdrop-blur-sm">
            <div className="bg-[#F8FAF4] rounded-2xl p-6 border border-[#d6e5c5] text-left">
              <div className="flex flex-wrap items-center justify-between pb-5 border-b border-[#dce8cf] gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-semibold text-[#485942]">
                    Karibu Premier Supermarket — Branch: Kariakoo Flagship
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-[#E1FFAC] font-bold text-[#1f3309] border border-[#aae056]">
                    ● LIVE ONLINE POS
                  </span>
                  <span className="text-xs font-medium text-[#485942]">Staff: Baraka Mushi</span>
                </div>
              </div>

              {/* Sample Dashboard metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-white border border-[#DCE8CD] shadow-sm">
                  <span className="text-xs text-[#52634d] font-semibold">Today&apos;s Sales</span>
                  <p className="text-2xl font-bold text-[#18290a] mt-1">TZS 1,845,000</p>
                  <span className="text-[11px] font-bold text-emerald-700">+14% vs yesterday</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE8CD] shadow-sm">
                  <span className="text-xs text-[#52634d] font-semibold">Net Profit (After Expenses)</span>
                  <p className="text-2xl font-bold text-[#18290a] mt-1">TZS 528,400</p>
                  <span className="text-[11px] font-bold text-emerald-700">28.6% margin</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE8CD] shadow-sm">
                  <span className="text-xs text-[#52634d] font-semibold">Low Stock Alerts</span>
                  <p className="text-2xl font-bold text-amber-600 mt-1">3 Products</p>
                  <span className="text-[11px] font-medium text-[#586952]">Require restock</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE8CD] shadow-sm">
                  <span className="text-xs text-[#52634d] font-semibold">Business Health Score</span>
                  <p className="text-2xl font-bold text-[#233a0b] mt-1">84 / 100</p>
                  <span className="text-[11px] font-bold text-emerald-700">Optimal Growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-white/70 backdrop-blur-md border-t border-b border-[#c8eb8e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#17260a] tracking-tight mb-4">
              Designed For High Reliability and Fast Business Execution
            </h2>
            <p className="text-[#3b4b34] text-base">
              Every tool your shop, restaurant, pharmacy or supermarket requires to operate smoothly every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-[#D8E6CC] shadow-sm hover:shadow-md hover:border-[#96D932] transition duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E1FFAC] flex items-center justify-center text-[#21350a] mb-5 border border-[#c4ec7d]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2b0b] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#4b5c43] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Solutions Section */}
      <section id="solutions" className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#17260a] tracking-tight mb-4">
            Tailored For Every Commercial Sector
          </h2>
          <p className="text-[#3b4b34] text-base max-w-2xl mx-auto mb-12">
            Whether you run a fast-paced supermarket, cosmetics boutique, hardware shop or pharmacy, TradePOS adapts to your workflow.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {businessTypes.map((biz, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/95 border border-[#c9e893] text-center shadow-neu-flat font-bold text-sm text-[#20330d] hover:bg-[#E1FFAC] transition cursor-default"
              >
                {biz}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-12 bg-white/70 backdrop-blur-md border-t border-b border-[#c8eb8e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#17260a] tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#3b4b34] text-base mb-6">
              Cancel anytime. No hidden setup fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-3xl bg-white border flex flex-col justify-between transition-all duration-200 relative ${
                  plan.isPopular
                    ? "border-2 border-[#81cc1a] shadow-neu-raised bg-[#FDFFF9]"
                    : "border-[#d8e6cb] shadow-neu-card"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#1b2f0a] text-[#E1FFAC] text-xs font-extrabold tracking-wider uppercase shadow-md">
                    Recommended Plan
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-black tracking-wide text-[#1c2e0e]">{plan.name}</h3>
                  <p className="text-xs text-[#526449] mt-1 min-h-[34px]">{plan.desc}</p>

                  <div className="my-6">
                    <span className="text-3xl font-black text-[#152508]">{plan.price}</span>
                    <span className="text-xs text-[#607457] font-semibold">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#34442b]">
                        <Check className="w-4 h-4 text-[#355f0b] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onGetStarted}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    plan.isPopular
                      ? "bg-[#1f350c] text-[#E1FFAC] hover:bg-[#152507] shadow-neu-raised"
                      : "bg-[#E1FFAC] text-[#1c2e0e] hover:bg-[#d6f798] border border-[#b2e858]"
                  }`}
                >
                  <span>Select {plan.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About TradePOS Section */}
      <section id="about" className="py-20 px-6 lg:px-12 bg-white/80 backdrop-blur-md border-t border-b border-[#c8eb8e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1FFAC] border border-[#a8e055] text-xs font-black text-[#1d320b]">
                <Sparkles className="w-3.5 h-3.5 text-[#3e6611]" />
                <span>{language === "sw" ? "KUHUSU TRADEPOS" : "ABOUT TRADEPOS"}</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-[#152508] tracking-tight leading-tight">
                {language === "sw"
                  ? "Mfumo Madhubuti wa Kisasa wa Kuendesha na Kukuza Biashara Yako."
                  : "The Modern Business Operating System Engineered For Real Growth."}
              </h2>

              <p className="text-base text-[#34462c] leading-relaxed">
                {language === "sw"
                  ? "TradePOS ni mfumo jumuishi ulioundwa mahsusi kuwawezesha wafanyabiashara wadogo, wa kati na wakubwa kusimamia mauzo ya kila siku, kudhibiti stoo ya bidhaa, kufuatilia madeni ya wateja na kujua faida halisi bila kubahatisha au kupoteza muda kwenye madaftari ya zamani."
                  : "TradePOS is a comprehensive multi-tenant retail operating system built to give ambitious business owners complete control over point-of-sale transactions, inventory tracking, customer debts, and net profitability without manual bookkeeping errors."}
              </p>

              <p className="text-base text-[#34462c] leading-relaxed">
                {language === "sw"
                  ? "Tumejenga mfumo unaofanya kazi hata intaneti ikikatika (Offline Mode), unaounganisha matawi mengi kwa urahisi, na unaolinda taarifa za biashara yako kwa siri na usalama wa hali ya juu."
                  : "Built with resilient offline-first technology and isolated multi-tenant architecture, TradePOS allows you to supervise multiple branches effortlessly while ensuring complete privacy and military-grade data protection."}
              </p>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-[#F6F9F0] border border-[#DCE8CF]">
                  <span className="block text-2xl font-black text-[#1c300c]">99.9%</span>
                  <span className="block text-xs font-bold text-[#455c39] mt-1">
                    {language === "sw" ? "Upatikanaji wa Mfumo" : "Cloud Reliability"}
                  </span>
                  <span className="block text-[11px] text-[#697f5f] mt-0.5">
                    {language === "sw" ? "Haukwami wala kusimama" : "Uninterrupted uptime"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6F9F0] border border-[#DCE8CF]">
                  <span className="block text-2xl font-black text-[#1c300c]">100%</span>
                  <span className="block text-xs font-bold text-[#455c39] mt-1">
                    {language === "sw" ? "Usiri wa Data Zako" : "Isolated Privacy"}
                  </span>
                  <span className="block text-[11px] text-[#697f5f] mt-0.5">
                    {language === "sw" ? "Data zimefungwa salama" : "Enterprise isolation"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6F9F0] border border-[#DCE8CF]">
                  <span className="block text-2xl font-black text-[#1c300c]">24 / 7</span>
                  <span className="block text-xs font-bold text-[#455c39] mt-1">
                    {language === "sw" ? "Msaada wa Moja kwa Moja" : "Dedicated Support"}
                  </span>
                  <span className="block text-[11px] text-[#697f5f] mt-0.5">
                    {language === "sw" ? "WhatsApp, Simu & Email" : "Direct human assistance"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Summary */}
            <div className="lg:col-span-5">
              <div className="p-7 rounded-3xl bg-white border-2 border-[#b5eb65] shadow-neu-raised space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E3EDD8]">
                  <div className="w-11 h-11 rounded-2xl bg-[#E1FFAC] border border-[#9fd84a] flex items-center justify-center text-[#172709] font-black">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#172608]">TradePOS Commercial Core</h3>
                    <p className="text-xs text-[#5a714e]">{language === "sw" ? "Kwa maduka na biashara za aina zote" : "Engineered for modern retail & wholesale"}</p>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs text-[#2b3c23]">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#E1FFAC] flex items-center justify-center text-[#213a0c] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>{language === "sw" ? "Urahisi Bila Ufundi:" : "Zero Learning Curve:"}</strong> {language === "sw" ? "Hakuna haja ya kuwa mtaalamu wa kompyuta; mfumo ni mwepesi sana kutumia kwa wafanyakazi wako." : "Intuitive interface ready for any cashier or store owner immediately."}</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#E1FFAC] flex items-center justify-center text-[#213a0c] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>{language === "sw" ? "Udhibiti wa Wizi na Hasara:" : "Loss & Theft Prevention:"}</strong> {language === "sw" ? "Kila mauzo, punguzo na mabadiliko ya stoo yanarekodiwa kwa wakati na jina la mhusika." : "Audit logs track every single cashier transaction, discount, and stock shift."}</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#E1FFAC] flex items-center justify-center text-[#213a0c] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>{language === "sw" ? "Ripoti za Faida Halisi (P&L):" : "Instant Profit & Loss:"}</strong> {language === "sw" ? "Ona faida halisi baada ya kutoa matumizi ya umeme, kodi, na mishahara papo hapo." : "Automated profit calculations accounting for expenses, taxes, and COGS."}</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={onGetStarted}
                    className="w-full py-3.5 rounded-2xl bg-[#1d320b] text-[#E1FFAC] text-xs font-black shadow-neu-raised hover:bg-[#132207] transition flex items-center justify-center gap-2"
                  >
                    <span>{language === "sw" ? "Anza Kutumia TradePOS Leo" : "Start With TradePOS Today"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comprehensive Professional Footer */}
      <footer className="bg-[#121E07] text-[#E1FFAC] pt-14 pb-10 px-6 lg:px-12 border-t-2 border-[#263D10]">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#23380F]">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E1FFAC] flex items-center justify-center text-[#121E07] shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">TradePOS</span>
              </div>
              <p className="text-xs text-[#98B677] leading-relaxed">
                Everything your business needs, in one place. Fast commercial POS, stock tracking, multi-branch, and financial reporting.
              </p>
            </div>

            {/* Column 2: Direct Contacts (WhatsApp, Phone Call, Email) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Wasiliana Nasi (Direct Contacts)
              </h4>
              <div className="space-y-2.5 text-xs text-[#D6F59A]">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/255673190311"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">0673190311 (WhatsApp)</span>
                </a>

                {/* Call Phone */}
                <a
                  href="tel:0779304500"
                  className="flex items-center gap-2.5 hover:text-white transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E1FFAC]/15 border border-[#E1FFAC]/30 flex items-center justify-center text-[#E1FFAC] group-hover:bg-[#E1FFAC] group-hover:text-[#121E07] transition">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">0779304500 (Piga Simu)</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:pj0040280@gmail.com"
                  className="flex items-center gap-2.5 hover:text-white transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E1FFAC]/15 border border-[#E1FFAC]/30 flex items-center justify-center text-[#E1FFAC] group-hover:bg-[#E1FFAC] group-hover:text-[#121E07] transition">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">pj0040280@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Column 3: Legal & Privacy Policies */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Sera na Vigezo (Legal & Trust)
              </h4>
              <ul className="space-y-2 text-xs text-[#B2CE8F]">
                <li>
                  <Link
                    href="/privacy"
                    className="flex items-center gap-2 hover:text-white transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#E1FFAC]" />
                    <span>Privacy Policy (Sera ya Faragha)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="flex items-center gap-2 hover:text-white transition"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#E1FFAC]" />
                    <span>Terms of Use (Masharti ya Matumizi)</span>
                  </Link>
                </li>
                <li>
                  <span className="text-[11px] text-[#789658] block pt-1">
                    Ulinzi wa 100% wa taarifa za kibiashara na risiti.
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Customer Support & Hours */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Msaada wa Wateja (Contact Support)
              </h4>
              <div className="space-y-2 text-xs text-[#B2CE8F]">
                <div className="flex items-start gap-2">
                  <Headphones className="w-4 h-4 text-[#E1FFAC] shrink-0 mt-0.5" />
                  <span>Msaada wa kiufundi na mafunzo unapatikana kila siku.</span>
                </div>
                <p className="text-[11px] text-[#86A666]">
                  Masaa: Jumatatu - Jumamosi: 08:00 AM - 10:00 PM
                </p>
                <div className="pt-1">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#1D320B] text-[#E1FFAC] text-[10px] font-bold border border-[#2F4D14]">
                    ● Huduma ya Haraka na Uhakika
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Quick Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#80A05F]">
            <p>
              © {new Date().getFullYear()} TradePOS Inc. Haki zote zimehifadhiwa.
            </p>
            <div className="flex items-center gap-6 text-[11px] text-[#B8D696]">
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Sera ya Faragha: Data za biashara yako ziko salama na zinalindwa kwa usimbaji fiche.");
                }}
                className="hover:text-white transition"
              >
                Privacy Policy
              </a>
              <span>•</span>
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Masharti ya Matumizi: Leseni na matumizi ya mfumo wa TradePOS.");
                }}
                className="hover:text-white transition"
              >
                Terms of Use
              </a>
              <span>•</span>
              <a href="tel:0779304500" className="hover:text-white transition">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
