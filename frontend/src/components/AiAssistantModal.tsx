"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  Bot,
  Send,
  X,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

export const AiAssistantModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, products, sales, expenses, customers, business, user, language } = useApp();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string; details?: any; type?: "FACT" | "PREDICTION" | "RECOMMENDATION" }[]
  >([
    {
      sender: "ai",
      text: `Habari ${user?.name || business?.name || "Mmiliki wa Duka"}! Mimi ni Copetra AI, mfumo wako mahiri wa kiintelijensia ya biashara ndani ya TradePOS. Ninafuatilia taarifa zako za mauzo ya moja kwa moja, stoo ya bidhaa, madeni, na faida halisi. Una swali gani kuhusu biashara yako leo?`,
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  if (!isAiModalOpen) return null;

  // Real data calculations for AI responses
  const validSales = sales.filter((s) => s.status !== "REFUNDED");
  const totalSalesAmount = validSales.reduce((acc, s) => acc + s.total, 0);
  const totalProfitAmount = validSales.reduce((acc, s) => {
    const saleProfit = s.items.reduce((iAcc, item) => {
      const prod = products.find(
        (p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase()
      );
      const unitCost = prod ? prod.buyingPrice : Math.round(item.price * 0.7);
      return iAcc + (item.price - unitCost) * item.quantity;
    }, 0);
    return acc + saleProfit;
  }, 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfitAmount = totalProfitAmount - totalExpensesAmount;
  const lowStockProds = products.filter((p) => p.stockQuantity <= p.minStock);
  const healthScore =
    totalSalesAmount === 0 && products.length === 0
      ? 0
      : Math.min(
          100,
          Math.max(
            20,
            70 +
              (netProfitAmount > 0 ? 15 : -15) +
              (lowStockProds.length === 0 ? 15 : -Math.min(20, lowStockProds.length * 5))
          )
        );

  const sampleQuestions = language === "sw" ? [
    "Je, nimeuza kiasi gani leo?",
    "Bidhaa zipi zinaleta faida kubwa?",
    "Bidhaa gani zinakaribia kuisha stoo?",
    "Nipe ushauri wa kuongeza faida wiki hii",
    "Je, tawi gani linafanya vizuri zaidi?",
    "Mkakati wa kubana matumizi",
  ] : [
    "How much did I sell today?",
    "Which products generated the most profit?",
    "Which products are likely to run out?",
    "How can I increase my profit margin?",
    "Which branch is performing best?",
    "Loss prevention strategy",
  ];

  const handleSend = async (textToSend?: string) => {
    const question = textToSend || query;
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setQuery("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/ai/copetra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          context: {
            businessName: business?.name || "TradePOS Merchant",
            salesTotal: totalSalesAmount,
            expensesTotal: totalExpensesAmount,
            lowStockItems: lowStockProds.map((p) => p.name),
            productsCount: products.length,
            transactionsCount: validSales.length,
            currency: business?.currency || "TZS",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.response,
            type: "RECOMMENDATION",
          },
        ]);
      } else {
        throw new Error("Failed to fetch from Copetra AI");
      }
    } catch (error) {
      // Offline / network fallback calculation
      const q = question.toLowerCase();
      let fallbackText = "";
      let type: "FACT" | "PREDICTION" | "RECOMMENDATION" = "FACT";

      if (q.includes("nimeuza") || q.includes("how much") || q.includes("leo") || q.includes("today")) {
        type = "FACT";
        fallbackText = `Kulingana na mfumo wa TradePOS, jumla ya mauzo ni TZS ${totalSalesAmount.toLocaleString()} kutokana na miamala ${validSales.length}.`;
      } else if (q.includes("kuisha") || q.includes("stock") || q.includes("run out")) {
        type = "PREDICTION";
        if (lowStockProds.length > 0) {
          fallbackText = `Tahadhari ya stoo: Bidhaa ${lowStockProds.map(p => `"${p.name}" (zimebaki ${p.stockQuantity})`).join(", ")} zinakaribia kuisha. Agiza kwa wasambazaji sasa.`;
        } else {
          fallbackText = products.length > 0
            ? `Bidhaa zote ziko juu ya kiwango cha usalama wa stoo.`
            : `Bado haujaingiza bidhaa kwenye Store Stock.`;
        }
      } else {
        type = "RECOMMENDATION";
        fallbackText = `Copetra AI inakushauri: Rekodi mauzo na matumizi ya kila siku kwa wakati ili kufuatilia faida halisi na mwenendo wa stoo yako.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: fallbackText,
          type,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-lg h-full bg-[#F4F7EE] shadow-2xl flex flex-col border-l border-[#d3e5b6] animate-slide-up">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#E1FFAC] to-[#d6fa93] border-b border-[#c2e879] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-neu-flat flex items-center justify-center text-[#21350a]">
              <Sparkles className="w-6 h-6 text-[#29420d]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-[#162409]">Copetra AI</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#20370b] text-[#E1FFAC] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82CC1A] animate-pulse" />
                  COPETRA LIVE
                </span>
              </div>
              <p className="text-xs text-[#415332] font-semibold">
                Intelligence Engine kwa ajili ya {business?.name || "Biashara Yako"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 text-[#21330e] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Health Summary Card */}
        <div className="p-4 mx-4 mt-4 bg-white/90 rounded-2xl border border-[#DCE8CD] shadow-neu-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#5a6b5a] uppercase tracking-wider">
              Business Health Score
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#1b2b0a]">{healthScore}</span>
              <span className="text-xs font-bold text-emerald-600">
                / 100 • {healthScore === 0 ? "Awaiting Data" : healthScore >= 75 ? "Strong & Liquid" : "Active"}
              </span>
            </div>
          </div>
          <div className="h-10 px-3 bg-[#E1FFAC] rounded-xl flex items-center justify-center font-bold text-xs text-[#20330a] shadow-inner">
            {validSales.length} Sales
          </div>
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-[#5e705e] uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#3e6814]" /> Quick Business Inquiries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-[#E1FFAC] text-[#2c3d23] border border-[#d6e5c5] transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  m.sender === "user"
                    ? "bg-[#25390F] text-[#E1FFAC] rounded-br-none"
                    : "bg-white text-[#1E241E] rounded-bl-none border border-[#DEE7D4]"
                }`}
              >
                {m.type && (
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 ${
                      m.type === "PREDICTION"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : m.type === "RECOMMENDATION"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-blue-100 text-blue-900 border border-blue-300"
                    }`}
                  >
                    {m.type}
                  </span>
                )}
                <div>{m.text}</div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl text-xs text-[#2a3c20] font-semibold w-fit border border-[#d6e2cb] shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#75bf13] animate-ping" />
              <span>{language === "sw" ? "Copetra AI inachambua takwimu za biashara yako..." : "Copetra AI is analyzing your real-time business ledger..."}</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 bg-white border-t border-[#DFE8D7] flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={language === "sw" ? "Uliza swali lolote kwa Copetra AI..." : "Ask Copetra AI anything about your business..."}
            className="flex-1 py-3 px-4 rounded-xl neu-input text-sm text-[#1B261B] placeholder-[#7F917F]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim()}
            className="h-11 px-4 rounded-xl neu-btn flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
