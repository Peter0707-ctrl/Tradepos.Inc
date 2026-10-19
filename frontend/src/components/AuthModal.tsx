"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ShoppingBag, Eye, EyeOff, CheckCircle } from "lucide-react";

interface AuthModalProps {
  initialMode: "login" | "register";
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const { loginUser, registerBusiness, t, language } = useApp();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [step, setStep] = useState<number>(1);
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register fields
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPin, setRegPin] = useState("");

  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("Retail Shop");
  const [bizLocation, setBizLocation] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE">("PROFESSIONAL");
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier) return;
    setLoginError("");

    const trimmed = loginIdentifier.trim().toLowerCase();
    const isAdmin = trimmed === "crestgroup@gmail.com" || trimmed === "admin@tradepos.cloud";

    if (isAdmin) {
      if (loginPassword !== "CREST@132026") {
        setLoginError(
          language === "sw"
            ? "Nenosiri la Admin si sahihi. Tafadhali ingiza nenosiri sahihi."
            : "Invalid Admin password. Please check your credentials."
        );
        return;
      }
    }

    const ok = loginUser(loginIdentifier, "OWNER", loginPassword);
    if (ok) {
      onSuccess();
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword) return;
    if (!paymentPhone && regPhone) {
      setPaymentPhone(regPhone);
    }
    setStep(2);
  };

  const handleRegisterStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName) return;
    setStep(3);
  };

  const handleRegisterStep3 = () => {
    setStep(4);
  };

  const handleCompletePaymentAndActivate = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      registerBusiness(
        { name: regFullName, phone: regPhone, email: regEmail, pin: regPin || "1234" },
        { name: bizName, type: bizType, location: bizLocation },
        selectedPlan
      );
      setIsProcessingPayment(false);
      onSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Floating Neumorphic Authentication Card */}
      <div className="w-full max-w-md auth-neu-card p-8 sm:p-9 relative my-8">
        
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 auth-neu-badge flex items-center justify-center mb-3.5">
            <ShoppingBag className="w-8 h-8 text-[#172709]" />
          </div>
          <h2 className="text-2xl font-black text-[#152408]">
            {mode === "login"
              ? (language === "sw" ? "Karibu Tena" : "Sign In to TradePOS")
              : (language === "sw" ? "Fungua Akaunti ya Biashara" : "Register Your Business")}
          </h2>
          <p className="text-xs text-[#4e6047] mt-1 font-semibold">
            {mode === "login"
              ? (language === "sw" ? "Ingia kwenye mfumo kusimamia mauzo na hesabu za biashara yako." : "Enter your credentials to access your store dashboard.")
              : (language === "sw" ? `Hatua ya ${step} ya 4` : `Step ${step} of 4`)}
          </p>
        </div>

        {/* ===================== LOGIN FORM ===================== */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1.5">
                {language === "sw" ? "Barua Pepe au Namba ya Simu" : "Email Address or Phone Number"}
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder={language === "sw" ? "owner@biashara.co.tz au +255 7..." : "owner@store.com or +255 7..."}
                className="w-full py-3.5 px-4 rounded-2xl auth-neu-input text-sm text-[#142308]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2d3f23]">
                  {language === "sw" ? "Nenosiri (Password)" : "Password"}
                </label>
                <button
                  type="button"
                  className="text-xs text-[#395e14] hover:underline font-bold"
                >
                  {language === "sw" ? "Umesahau Nenosiri?" : "Forgot Password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3.5 px-4 rounded-2xl auth-neu-input text-sm text-[#142308] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a6e50] hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center animate-fade-in">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl auth-neu-btn text-sm font-black shadow-md mt-3 cursor-pointer"
            >
              {language === "sw" ? "Ingia Kwenye Mfumo" : "Sign In to TradePOS"}
            </button>

            <div className="text-center pt-3 border-t border-[#d5e2cb]">
              <span className="text-xs text-[#52634d]">
                {language === "sw" ? "Huna akaunti ya biashara bado? " : "Don't have an account yet? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setStep(1);
                }}
                className="text-xs font-bold text-[#1f3a07] hover:underline"
              >
                {language === "sw" ? "Jisajili Hapa" : "Register Here"}
              </button>
            </div>
          </form>
        )}

        {/* ===================== REGISTRATION WIZARD ===================== */}
        {mode === "register" && step === 1 && (
          <form onSubmit={handleRegisterStep1} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1">Jina Kamili</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Ingiza jina lako kamili"
                className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1">Namba ya Simu</label>
              <input
                type="text"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+255 7..."
                className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1">Barua Pepe</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jina@biashara.com"
                className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2d3f23] mb-1">Nenosiri</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2d3f23] mb-1">PIN ya Siri (Tarakimu 4)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="mf. 1234"
                  className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308] tracking-widest font-bold"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl auth-neu-btn text-xs font-black mt-3"
            >
              Endelea na Taarifa za Biashara
            </button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs font-bold text-[#2b441a] hover:underline"
              >
                Tayari una akaunti? Ingia
              </button>
            </div>
          </form>
        )}

        {mode === "register" && step === 2 && (
          <form onSubmit={handleRegisterStep2} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1">Jina la Biashara</label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="Ingiza jina la duka au kampuni"
                className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1">Aina ya Biashara</label>
              <select
                value={bizType}
                onChange={(e) => setBizType(e.target.value)}
                className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
              >
                <option value="Retail Shop">Duka la Rejareja (Retail Shop)</option>
                <option value="Supermarkets">Supermarket</option>
                <option value="Cosmetics & Beauty">Vipodozi (Cosmetics)</option>
                <option value="Restaurant & Cafe">Mgahawa (Restaurant & Cafe)</option>
                <option value="Hardware">Duka la Vifaa vya Ujenzi (Hardware)</option>
                <option value="Pharmacy">Duka la Dawa (Pharmacy)</option>
                <option value="Wholesale Depot">Jumla (Wholesale Depot)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1">Eneo / Mji</label>
              <input
                type="text"
                required
                value={bizLocation}
                onChange={(e) => setBizLocation(e.target.value)}
                placeholder="mf. Kariakoo, Dar es Salaam"
                className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl auth-neu-btn-secondary text-xs font-bold"
              >
                Rudi
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl auth-neu-btn text-xs font-black"
              >
                Chagua Kifurushi
              </button>
            </div>
          </form>
        )}

        {mode === "register" && step === 3 && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#2d3f23]">
              Chagua Kifurushi cha Biashara
            </label>
            {[
              {
                id: "STARTER",
                name: "Starter POS",
                price: "TZS 50,000 / mwezi",
                desc: "Duka 1 la biashara, wauzaji 2, stoo & mauzo ya siku",
              },
              {
                id: "PROFESSIONAL",
                name: "Professional Retail (Inayopendekezwa)",
                price: "TZS 150,000 / mwezi",
                desc: "Matawi hadi 5, wafanyakazi bila kikomo, AI assistant & P&L",
              },
              {
                id: "BUSINESS",
                name: "Business Chain",
                price: "TZS 300,000 / mwezi",
                desc: "Matawi mengi bila kikomo, WhatsApp alerts, bei za jumla & rejareja",
              },
              {
                id: "ENTERPRISE",
                name: "Custom Enterprise",
                price: "TZS 500,000 / mwezi",
                desc: "Matawi 10+, TRA EFD sync, seva binafsi na SLA 99.9%",
              },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id as any)}
                className={`p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-between ${
                  selectedPlan === p.id
                    ? "auth-neu-option-active"
                    : "auth-neu-option"
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-xs text-[#1c2e0e]">{p.name}</h4>
                  <p className="text-[11px] text-[#4f6445]">{p.desc}</p>
                </div>
                <span className="text-xs font-black text-[#152708] shrink-0 ml-2">{p.price}</span>
              </div>
            ))}

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl auth-neu-btn-secondary text-xs font-bold"
              >
                Rudi
              </button>
              <button
                type="button"
                onClick={handleRegisterStep3}
                className="w-2/3 py-3 rounded-xl auth-neu-btn text-xs font-black"
              >
                Endelea na Malipo
              </button>
            </div>
          </div>
        )}

        {mode === "register" && step === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl auth-neu-well text-xs space-y-1">
              <div className="flex justify-between font-bold text-[#1f330d]">
                <span>Kifurushi:</span>
                <span>{selectedPlan}</span>
              </div>
              <div className="flex justify-between font-extrabold text-[#1f330d] text-sm pt-1.5 border-t border-[#d3e2cb]">
                <span>Kiasi cha Kulipa:</span>
                <span>
                  {selectedPlan === "ENTERPRISE"
                    ? "TZS 500,000"
                    : selectedPlan === "BUSINESS"
                    ? "TZS 300,000"
                    : selectedPlan === "STARTER"
                    ? "TZS 50,000"
                    : "TZS 150,000"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1.5">
                Njia ya Malipo (Mtandao wa Simu)
              </label>
              <div className="grid grid-cols-3 gap-2.5 mb-3">
                {["MPESA", "AIRTEL", "HALOPESA"].map((gw) => (
                  <button
                    key={gw}
                    type="button"
                    onClick={() => setPaymentMethod(gw)}
                    className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
                      paymentMethod === gw
                        ? "auth-neu-option-active text-[#162708]"
                        : "auth-neu-option text-[#4a5f42]"
                    }`}
                  >
                    {gw === "MPESA" ? "M-Pesa" : gw === "AIRTEL" ? "Airtel Money" : "HaloPesa"}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="+255 7..."
                className="w-full py-3 px-4 rounded-xl auth-neu-input text-sm text-[#142308]"
              />
            </div>

            <button
              onClick={handleCompletePaymentAndActivate}
              disabled={isProcessingPayment}
              className="w-full py-4 rounded-2xl auth-neu-btn text-xs font-black shadow-md flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <span>Inathibitisha malipo na kufungua akaunti...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Kamilisha Malipo na Anza Kutumia Mfumo</span>
                </>
              )}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-bold text-[#627759] hover:text-black"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
