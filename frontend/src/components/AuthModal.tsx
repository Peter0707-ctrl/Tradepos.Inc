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
  const { loginUser, registerBusiness, t } = useApp();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [step, setStep] = useState<number>(1);
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("Retail Shop");
  const [bizLocation, setBizLocation] = useState("Kariakoo, Dar es Salaam");
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "PROFESSIONAL" | "BUSINESS">("PROFESSIONAL");
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [paymentPhone, setPaymentPhone] = useState("+255 712 345 678");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier) return;
    loginUser(loginIdentifier);
    onSuccess();
  };

  const handleDemoLogin = () => {
    loginUser("demo@tradepos.co.tz");
    onSuccess();
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword) return;
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
        { name: regFullName, phone: regPhone, email: regEmail },
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
            {mode === "login" ? "Karibu Tena" : "Fungua Akaunti ya Biashara"}
          </h2>
          <p className="text-xs text-[#4e6047] mt-1 font-semibold">
            {mode === "login"
              ? "Ingia kwenye mfumo kusimamia mauzo na hesabu za biashara yako."
              : `Hatua ya ${step} ya 4`}
          </p>
        </div>

        {/* 1-CLICK DEMO ACCOUNT CALLOUT */}
        {mode === "login" && (
          <div className="mb-5 p-4 rounded-2xl auth-neu-well flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-xs text-[#162709]">Akaunti ya Majaribio (Demo)</h4>
              <p className="text-[11px] text-[#4d6144]">Bonyeza hapa kuingia moja kwa moja bila kujisajili</p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-4 py-2 rounded-xl bg-[#1b2f0a] text-[#E1FFAC] text-xs font-black shadow-md hover:bg-[#122006] transition"
            >
              Fungua Demo
            </button>
          </div>
        )}

        {/* ===================== LOGIN FORM ===================== */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2d3f23] mb-1.5">
                Barua Pepe au Namba ya Simu
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="owner@biashara.co.tz au +255 7..."
                className="w-full py-3.5 px-4 rounded-2xl auth-neu-input text-sm text-[#142308]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2d3f23]">Nenosiri (Password)</label>
                <button
                  type="button"
                  className="text-xs text-[#395e14] hover:underline font-bold"
                >
                  Umesahau Nenosiri?
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

            <button
              type="submit"
              className="w-full py-4 rounded-2xl auth-neu-btn text-sm font-black shadow-md mt-3"
            >
              Ingia Kwenye Mfumo
            </button>

            <div className="text-center pt-3 border-t border-[#d5e2cb]">
              <span className="text-xs text-[#52634d]">Huna akaunti ya biashara bado? </span>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setStep(1);
                }}
                className="text-xs font-bold text-[#1f3a07] hover:underline"
              >
                Jisajili Hapa
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
                placeholder="mf. Baraka Mushi"
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
                placeholder="+255 712 345 678"
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
                placeholder="mf. Karibu Premier Supermarket"
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
                id: "PROFESSIONAL",
                name: "Professional (Inayopendekezwa)",
                price: "TZS 150,000 / mwezi",
                desc: "Mfumo kamili wa mauzo, stoo ya bidhaa, madeni, na faida/hasara",
              },
              {
                id: "BUSINESS",
                name: "Business Chain",
                price: "TZS 300,000 / mwezi",
                desc: "Matawi mengi, usimamizi wa stoo kubwa na wauzaji wa jumla",
              },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id as any)}
                className={`p-4 rounded-2xl cursor-pointer transition flex items-center justify-between ${
                  selectedPlan === p.id
                    ? "auth-neu-option-active"
                    : "auth-neu-option"
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-xs text-[#1c2e0e]">{p.name}</h4>
                  <p className="text-[11px] text-[#4f6445]">{p.desc}</p>
                </div>
                <span className="text-xs font-black text-[#152708]">{p.price}</span>
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
                  {selectedPlan === "BUSINESS"
                    ? "TZS 300,000"
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
