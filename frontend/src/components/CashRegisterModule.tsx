"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Wallet,
  Package,
  CheckCircle2,
  MessageCircle,
  Send,
  PlusCircle,
  Boxes,
  Receipt,
  UserCheck,
  Clock,
  ArrowDownLeft,
  Eye,
  X
} from "lucide-react";
import { DailyShiftReport } from "@/types";

export const CashRegisterModule: React.FC = () => {
  const {
    user,
    employees,
    switchEmployeeAccount,
    cashRegister,
    updateCashRegister,
    currentBranch,
    sales,
    processSale,
    expenses,
    addExpense,
    products,
    addProduct,
    recordStockMovement,
    dailyReports,
    submitDailyReport,
    approveDailyReport,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"summary" | "sold_products" | "daily_expenses" | "remaining_stock">("summary");
  const [amountInput, setAmountInput] = useState("");
  const [modalMode, setModalMode] = useState<"DEPOSIT" | "WITHDRAW" | "COUNT" | null>(null);

  // Submit Daily Report to Owner Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState("");
  const [shiftNotes, setShiftNotes] = useState("");
  const [submitSuccessBanner, setSubmitSuccessBanner] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyShiftReport | null>(null);

  // Direct Sale Entry Form State (Tab 2: Wameuza Nini Leo — User types product name directly)
  const [saleProdName, setSaleProdName] = useState("");
  const [saleQty, setSaleQty] = useState("1");
  const [saleUnitPrice, setSaleUnitPrice] = useState("");
  const [salePaymentMethod, setSalePaymentMethod] = useState<"CASH" | "MPESA" | "CREDIT">("CASH");
  const [saleCustomerName, setSaleCustomerName] = useState("");

  // Quick Expense Form State (Tab 3: Matumizi ya Siku)
  const [expCategory, setExpCategory] = useState("Usafiri & Bodaboda");
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMethod, setExpMethod] = useState<"CASH" | "MPESA">("CASH");

  // Direct Stock IN Form State (Tab 4: Stock Iliyobaki Stoo — User types product name directly)
  const [stockProdName, setStockProdName] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [stockBuyPrice, setStockBuyPrice] = useState("");
  const [stockSellPrice, setStockSellPrice] = useState("");
  const [stockNote, setStockNote] = useState("");

  const handleDepositOrWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput) || 0;
    if (val <= 0) return;

    if (modalMode === "DEPOSIT") {
      updateCashRegister({
        cashDeposits: cashRegister.cashDeposits + val,
        actualCash: cashRegister.actualCash + val,
      });
    } else if (modalMode === "WITHDRAW") {
      updateCashRegister({
        cashWithdrawals: cashRegister.cashWithdrawals + val,
        actualCash: Math.max(0, cashRegister.actualCash - val),
      });
    } else if (modalMode === "COUNT") {
      updateCashRegister({
        actualCash: val,
      });
    }

    setModalMode(null);
    setAmountInput("");
  };

  // Financial Breakdown by Payment Method (excluding refunded)
  const validSales = sales.filter((s) => s.status !== "REFUNDED");
  const totalSalesAll = validSales.reduce((a, b) => a + b.total, 0);
  const totalCashSales = validSales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((a, b) => a + b.total, 0);
  const totalMobileSales = validSales
    .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
    .reduce((a, b) => a + b.total, 0);
  const totalCreditSales = validSales
    .filter((s) => s.paymentMethod === "CREDIT")
    .reduce((a, b) => a + b.total, 0);

  const totalExpensesToday = expenses.reduce((a, b) => a + b.amount, 0);

  // Automatic Daily Profit & Loss (Faida na Hasara ya Kila Siku) Calculation
  const totalCogsToday = Math.round(
    validSales.reduce((accSale, s) => {
      const saleCost = s.items.reduce((accItem, it) => {
        const matchedProd = products.find(
          (p) => p.id === it.productId || p.name.toLowerCase() === it.productName.toLowerCase()
        );
        if (matchedProd && matchedProd.buyingPrice > 0) {
          return accItem + matchedProd.buyingPrice * it.quantity;
        }
        return accItem + it.total * 0.7;
      }, 0);
      return accSale + saleCost;
    }, 0)
  );
  const grossProfitToday = totalSalesAll - totalCogsToday;
  const netProfitToday = grossProfitToday - totalExpensesToday;

  const expectedCash =
    cashRegister.openingBalance +
    (totalCashSales > 0 ? totalCashSales : cashRegister.cashSales) +
    cashRegister.cashDeposits -
    cashRegister.cashExpenses -
    cashRegister.cashWithdrawals;

  const variance = cashRegister.actualCash - expectedCash;

  // Breakdown of all Products Sold Today + Remaining Stock in Store
  const soldProductsMap: {
    [name: string]: { name: string; quantity: number; revenue: number; lastCashier: string; remainingInStore: number; unit: string };
  } = {};
  validSales.forEach((s) => {
    s.items.forEach((item) => {
      const matchedProd = products.find(
        (p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase()
      );
      if (!soldProductsMap[item.productName]) {
        soldProductsMap[item.productName] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          lastCashier: s.cashierName || "Mhudumu",
          remainingInStore: matchedProd ? matchedProd.stockQuantity : 0,
          unit: matchedProd ? matchedProd.unit : "Pcs",
        };
      }
      soldProductsMap[item.productName].quantity += item.quantity;
      soldProductsMap[item.productName].revenue += item.total;
      if (matchedProd) {
        soldProductsMap[item.productName].remainingInStore = matchedProd.stockQuantity;
      }
    });
  });
  const soldProductsList = Object.values(soldProductsMap).sort((a, b) => b.quantity - a.quantity);
  const totalUnitsSold = soldProductsList.reduce((a, b) => a + b.quantity, 0);

  // Remaining Stock Summary
  const totalUnitsRemainingInStore = products.reduce((a, b) => a + b.stockQuantity, 0);
  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStock);

  // Handler for Direct Sale Entry (Tab 2: Wameuza Nini Leo)
  const handleQuickSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typedName = saleProdName.trim();
    const qty = parseInt(saleQty) || 0;
    if (!typedName || qty <= 0) return;

    const existingProd = products.find((p) => p.name.toLowerCase() === typedName.toLowerCase());
    const unitPrice =
      parseFloat(saleUnitPrice) || (existingProd ? existingProd.sellingPrice : 0);
    if (unitPrice <= 0) return;

    let targetProdId = existingProd?.id || `prod-auto-${Date.now()}`;
    let targetProdName = existingProd?.name || typedName;

    if (!existingProd) {
      const created = addProduct({
        name: typedName,
        sku: `AUTO-${Date.now().toString().slice(-4)}`,
        barcode: "",
        category: "General",
        brand: "General",
        buyingPrice: Math.round(unitPrice * 0.7),
        sellingPrice: unitPrice,
        wholesalePrice: unitPrice,
        stockQuantity: Math.max(20, qty),
        minStock: 5,
        maxStock: 500,
        unit: "Pcs",
        branchId: currentBranch?.id || "br-01",
      });
      if (created) {
        targetProdId = created.id;
        targetProdName = created.name;
      }
    }

    const total = qty * unitPrice;
    processSale({
      branchId: currentBranch?.id || "br-01",
      items: [
        {
          productId: targetProdId,
          productName: targetProdName,
          quantity: qty,
          price: unitPrice,
          total,
        },
      ],
      subtotal: total,
      tax: 0,
      discount: 0,
      total,
      paidAmount: salePaymentMethod === "CREDIT" ? 0 : total,
      balance: salePaymentMethod === "CREDIT" ? total : 0,
      paymentMethod: salePaymentMethod,
      customerName: saleCustomerName.trim() || "Mteja wa Dukani",
      cashierName: user?.name || "Mhudumu",
      status: "COMPLETED",
    });

    setSaleProdName("");
    setSaleQty("1");
    setSaleUnitPrice("");
    setSaleCustomerName("");
  };

  // Handler for Quick Expense (Tab 3: Matumizi ya Siku)
  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount) || 0;
    if (amt <= 0 || !expDesc.trim()) return;
    addExpense({
      branchId: currentBranch?.id || "br-01",
      category: expCategory,
      title: expDesc.trim(),
      description: `${expDesc.trim()} (Imerekodiwa na ${user?.name || "Mfanyakazi"})`,
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      recordedBy: user?.name || "Mhudumu",
      paymentMethod: expMethod,
    });
    setExpDesc("");
    setExpAmount("");
  };

  // Handler for Direct Stock IN (Tab 4: Stock Iliyobaki Stoo — User types product name directly)
  const handleQuickStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const typedName = stockProdName.trim();
    const qty = parseInt(stockQty) || 0;
    if (!typedName || qty <= 0) return;

    const existingProd = products.find((p) => p.name.toLowerCase() === typedName.toLowerCase());
    const buyPrice =
      parseFloat(stockBuyPrice) || (existingProd ? existingProd.buyingPrice : 0);
    const sellPrice =
      parseFloat(stockSellPrice) ||
      (existingProd ? existingProd.sellingPrice : Math.round(buyPrice * 1.3));

    if (existingProd) {
      recordStockMovement({
        branchId: currentBranch?.id || "br-01",
        productId: existingProd.id,
        productName: existingProd.name,
        type: "IN",
        quantity: qty,
        reason: "PURCHASE",
        unitCost: buyPrice,
        totalValue: qty * buyPrice,
        recordedBy: user?.name || "Mfanyakazi",
        notes: stockNote.trim() || "Stock mpya imeingizwa dukani",
      });
    } else {
      const created = addProduct({
        name: typedName,
        sku: `AUTO-${Date.now().toString().slice(-4)}`,
        barcode: "",
        category: "General",
        brand: "General",
        buyingPrice: buyPrice,
        sellingPrice: sellPrice,
        wholesalePrice: sellPrice,
        stockQuantity: 0,
        minStock: 5,
        maxStock: 500,
        unit: "Pcs",
        branchId: currentBranch?.id || "br-01",
      });
      if (created) {
        recordStockMovement({
          branchId: currentBranch?.id || "br-01",
          productId: created.id,
          productName: created.name,
          type: "IN",
          quantity: qty,
          reason: "PURCHASE",
          unitCost: buyPrice,
          totalValue: qty * buyPrice,
          recordedBy: user?.name || "Mfanyakazi",
          notes: stockNote.trim() || "Bidhaa mpya imeingizwa stoo",
        });
      }
    }

    setStockProdName("");
    setStockQty("");
    setStockBuyPrice("");
    setStockSellPrice("");
    setStockNote("");
  };

  const handleConfirmSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = countedCashInput ? parseFloat(countedCashInput) : cashRegister.actualCash;
    if (countedCashInput) {
      updateCashRegister({ actualCash: counted });
    }
    submitDailyReport(shiftNotes, counted);
    setIsSubmitModalOpen(false);
    setShiftNotes("");
    setCountedCashInput("");
    setSubmitSuccessBanner(true);
    setTimeout(() => setSubmitSuccessBanner(false), 6000);
  };

  const zReportMessage = `*TRADEPOS: RIPOTI YA SIKU KWA MWENYE DUKA*\nTarehe: ${new Date().toLocaleDateString()}\nImewasilishwa na: ${user?.name || "Mhudumu"} (${user?.role || "CASHIER"})\nTawi: ${currentBranch?.name || "Tawi Kuu"}\n\n*1. MAUZO YA LEO:* TZS ${totalSalesAll.toLocaleString()}\n- Cash: TZS ${totalCashSales.toLocaleString()}\n- Simu (M-Pesa/Airtel): TZS ${totalMobileSales.toLocaleString()}\n- Mkopo (Credit): TZS ${totalCreditSales.toLocaleString()}\n- Bidhaa Zilizouzwa: ${totalUnitsSold} pcs\n\n*2. MATUMIZI YA SIKU HIYO:* TZS ${totalExpensesToday.toLocaleString()}\n\n*3. STOCK ILIYobaki STOO:* ${totalUnitsRemainingInStore} pcs (${lowStockItems.length} zinaisha)\n\n*4. DROO YA PESA:*\n- Inayotakiwa: TZS ${expectedCash.toLocaleString()}\n- Iliyohesabiwa: TZS ${cashRegister.actualCash.toLocaleString()}`;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Datalist for optional autocomplete while typing product names */}
      <datalist id="store-products-datalist">
        {products.map((p) => (
          <option key={p.id} value={p.name}>
            Bei: TZS {p.sellingPrice.toLocaleString()} | Stoo: {p.stockQuantity} {p.unit}
          </option>
        ))}
      </datalist>

      {/* Top Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black text-[#162709] tracking-tight">
            {language === "sw" ? "Ripoti za Siku (Faida & Hasara)" : "Daily Reports (Profit & Loss)"}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E1FFAC] text-[#172B08] border border-[#9CE034]">
            {user?.role === "OWNER" ? (language === "sw" ? "Boss" : "Owner") : user?.name}
          </span>
        </div>

        {/* Right: Quick Role Switcher + Submit to Owner Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#D4E4C3] shadow-xs text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#3F6315]" />
            <select
              value={user?.id || employees[0]?.id || ""}
              onChange={(e) => switchEmployeeAccount(e.target.value)}
              className="font-black text-[#162808] bg-transparent focus:outline-none cursor-pointer"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role === "OWNER" ? (language === "sw" ? "Boss" : "Owner") : (language === "sw" ? "Muuzaji" : "Cashier")})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setCountedCashInput(String(cashRegister.actualCash));
              setIsSubmitModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#1C320A] hover:bg-[#27460E] text-[#E1FFAC] font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === "sw" ? "Tuma Ripoti" : "Submit Report"}</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(zReportMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* DAILY PROFIT & LOSS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("sold_products")}
          className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] hover:border-[#9CE034] shadow-xs cursor-pointer transition"
        >
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "Mauzo ya Siku" : "Today's Sales"}
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {totalSalesAll.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#5B714F] font-bold">
            {language === "sw"
              ? `Mtaji (COGS): TZS ${totalCogsToday.toLocaleString()}`
              : `Cost of Goods: TZS ${totalCogsToday.toLocaleString()}`}
          </span>
        </div>

        <div
          onClick={() => setActiveTab("sold_products")}
          className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] hover:border-[#9CE034] shadow-xs cursor-pointer transition"
        >
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "Faida Ghafi" : "Gross Profit"}
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {grossProfitToday.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            {language === "sw" ? "Mauzo - Mtaji" : "Revenue - Cost"}
          </span>
        </div>

        <div
          onClick={() => setActiveTab("daily_expenses")}
          className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] hover:border-[#9CE034] shadow-xs cursor-pointer transition"
        >
          <span className="text-xs font-bold text-[#566E49] block">
            {language === "sw" ? "Matumizi ya Siku" : "Today's Expenses"}
          </span>
          <p className="text-xl font-black text-rose-700 mt-0.5">
            -TZS {totalExpensesToday.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#69825B] font-bold">
            {language === "sw" ? `Rekodi ${expenses.length}` : `${expenses.length} Records`}
          </span>
        </div>

        <div
          onClick={() => setActiveTab("summary")}
          className={`p-3.5 rounded-2xl border-2 shadow-xs cursor-pointer transition ${
            netProfitToday >= 0
              ? "bg-emerald-50/70 border-emerald-400"
              : "bg-rose-50/70 border-rose-400"
          }`}
        >
          <span className="text-xs font-black uppercase text-[#162709] block">
            {netProfitToday >= 0
              ? language === "sw"
                ? "FAIDA HALISI"
                : "NET PROFIT"
              : language === "sw"
              ? "HASARA YA SIKU"
              : "DAILY LOSS"}
          </span>
          <p
            className={`text-xl font-black mt-0.5 ${
              netProfitToday >= 0 ? "text-emerald-800" : "text-rose-700"
            }`}
          >
            {netProfitToday >= 0 ? "+" : "-"}TZS {Math.abs(netProfitToday).toLocaleString()}
          </p>
          <span
            className={`text-[11px] font-black ${
              netProfitToday >= 0 ? "text-emerald-800" : "text-rose-800"
            }`}
          >
            {netProfitToday >= 0
              ? language === "sw"
                ? "Faida Halisi"
                : "Net Profit"
              : language === "sw"
              ? "Matumizi yamezidi"
              : "Loss Incurred"}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center p-1 bg-[#EEF4E5] rounded-2xl border border-[#d2e4bb] gap-1">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === "summary"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{language === "sw" ? "Faida & Hasara" : "Profit & Loss"}</span>
        </button>

        <button
          onClick={() => setActiveTab("sold_products")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === "sold_products"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>{language === "sw" ? `Mauzo (${soldProductsList.length})` : `Sales (${soldProductsList.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab("daily_expenses")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === "daily_expenses"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{language === "sw" ? `Matumizi (${expenses.length})` : `Expenses (${expenses.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab("remaining_stock")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === "remaining_stock"
              ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
              : "text-[#536749] hover:text-[#182c0b]"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>{language === "sw" ? `Stoo (${totalUnitsRemainingInStore} pcs)` : `Stock (${totalUnitsRemainingInStore} pcs)`}</span>
        </button>
      </div>

      {/* TAB 1: DAILY PROFIT & LOSS TABLE + STAFF SHIFT REPORTS SENT TO OWNER */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          {/* DAILY PROFIT & LOSS LEDGER */}
          <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
              <h3 className="font-black text-sm text-[#162709]">
                {language === "sw" ? "Faida na Hasara kwa Tarehe" : "Profit & Loss by Date"}
              </h3>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black border ${
                  netProfitToday >= 0
                    ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                    : "bg-rose-100 text-rose-950 border-rose-300"
                }`}
              >
                {language === "sw" ? "Jumla: " : "Total: "}
                {netProfitToday >= 0 ? `+TZS ${netProfitToday.toLocaleString()}` : `-TZS ${Math.abs(netProfitToday).toLocaleString()}`}
              </span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
                <thead className="bg-[#F8FAF4] font-bold text-[#4D6340]">
                  <tr>
                    <th className="py-2.5 px-3">{language === "sw" ? "Tarehe" : "Date"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Mauzo" : "Sales"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Mtaji (COGS)" : "Cost (COGS)"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Faida Ghafi" : "Gross Profit"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Matumizi" : "Expenses"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Faida Halisi" : "Net Profit"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Hali" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                  {(() => {
                    const dateSet = new Set<string>();
                    const todayKey = new Date().toISOString().split("T")[0];
                    dateSet.add(todayKey);
                    validSales.forEach((s) => {
                      const d = (s.createdAt || "").split("T")[0];
                      if (d) dateSet.add(d);
                    });
                    expenses.forEach((e) => {
                      const d = (e.date || "").split("T")[0];
                      if (d) dateSet.add(d);
                    });
                    const sortedDates = Array.from(dateSet).sort((a, b) => (a < b ? 1 : -1));
                    return sortedDates.map((dKey) => {
                      const daySalesList = validSales.filter((s) => (s.createdAt || "").startsWith(dKey));
                      const salesVal = daySalesList.reduce((acc, s) => acc + s.total, 0);
                      const cogsVal = Math.round(
                        daySalesList.reduce((accSale, s) => {
                          const saleCost = s.items.reduce((accItem, it) => {
                            const matchedProd = products.find(
                              (p) => p.id === it.productId || p.name.toLowerCase() === it.productName.toLowerCase()
                            );
                            if (matchedProd && matchedProd.buyingPrice > 0) {
                              return accItem + matchedProd.buyingPrice * it.quantity;
                            }
                            return accItem + it.total * 0.7;
                          }, 0);
                          return accSale + saleCost;
                        }, 0)
                      );
                      const grossVal = salesVal - cogsVal;
                      const expVal = expenses
                        .filter((e) => (e.date || "").startsWith(dKey))
                        .reduce((acc, e) => acc + e.amount, 0);
                      const netVal = grossVal - expVal;
                      return {
                        date: dKey === todayKey ? (language === "sw" ? `Leo (${dKey})` : `Today (${dKey})`) : dKey,
                        salesVal,
                        cogsVal,
                        grossVal,
                        expVal,
                        netVal,
                      };
                    });
                  })().map((row, idx) => (
                    <tr key={idx} className={idx === 0 ? "bg-[#F6FAF0] font-bold" : "hover:bg-[#F9FBF6]"}>
                      <td className="py-3 px-3 font-black text-[#162709]">{row.date}</td>
                      <td className="py-3 px-3 text-right font-bold">
                        TZS {row.salesVal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-[#546949]">
                        -TZS {row.cogsVal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-800">
                        TZS {row.grossVal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-rose-700">
                        -TZS {row.expVal.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-black text-sm ${
                          row.netVal >= 0 ? "text-emerald-800" : "text-rose-700"
                        }`}
                      >
                        {row.netVal >= 0 ? "+" : "-"}TZS {Math.abs(row.netVal).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            row.netVal >= 0
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-rose-100 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {row.netVal >= 0 ? (language === "sw" ? "✓ FAIDA" : "✓ PROFIT") : (language === "sw" ? "! HASARA" : "! LOSS")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: Daily Shift Reports Sent to Owner */}
            <div className="flex-1 bg-white rounded-2xl border border-[#D8E6CC] shadow-xs p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
                <div>
                  <h3 className="font-black text-sm text-[#162709] flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#3A6112]" />
                    <span>
                      {language === "sw"
                        ? "Ripoti za Siku Zilizotumwa kwa Mwenye Duka (Kutoka kwa Wafanyakazi)"
                        : "Daily Shift Reports Sent to Store Owner"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#586E4C]">
                    {language === "sw"
                      ? "Kila mfanyakazi anapofunga mahesabu, ripoti inaonekana hapa na kwenye Dashibodi ya Mwenye Duka."
                      : "Every submitted staff shift report appears here and on the Owner's Dashboard."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCountedCashInput(String(cashRegister.actualCash));
                    setIsSubmitModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d2f987] text-[#172B08] border border-[#9CE034] text-xs font-black flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>+ {language === "sw" ? "Wasilisha Mahesabu ya Leo" : "Submit Today's Report"}</span>
                </button>
              </div>

              <div className="divide-y divide-[#EDF4E4] mt-2">
                {dailyReports.map((rep) => (
                  <div key={rep.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-[#162709]">{rep.submittedBy}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDF3E6] text-[#284112]">
                          {rep.staffRole}
                        </span>
                        <span className="text-[11px] text-[#647B58] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rep.submittedAt}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            rep.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {rep.status === "APPROVED"
                            ? language === "sw"
                              ? `✓ IMEHAKIKIWA (${rep.approvedBy})`
                              : `✓ APPROVED (${rep.approvedBy})`
                            : language === "sw"
                            ? "INASUBIRI KUHAKIKIWA NA MWENYE DUKA"
                            : "PENDING OWNER APPROVAL"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                        <span>
                          {language === "sw" ? "Mauzo: " : "Sales: "}
                          <strong className="text-emerald-800">TZS {rep.totalSales.toLocaleString()}</strong> ({rep.totalUnitsSold} pcs)
                        </span>
                        <span>
                          {language === "sw" ? "Matumizi ya Siku: " : "Expenses: "}
                          <strong className="text-rose-700">TZS {rep.totalExpenses.toLocaleString()}</strong>
                        </span>
                        <span>
                          {language === "sw" ? "Stock Iliyobaki: " : "Remaining Stock: "}
                          <strong className="text-[#162709]">{rep.remainingStockSummary.totalUnitsInStore} pcs</strong>
                        </span>
                      </div>

                      {rep.notes && (
                        <p className="text-[11px] text-[#4C6240] italic bg-[#F8FAF5] px-2.5 py-1 rounded-lg border border-[#E4EFE0]">
                          &ldquo;{rep.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="px-3 py-1.5 rounded-xl bg-[#F3F7EC] hover:bg-[#E1FFAC] border border-[#C9DFB4] text-xs font-black text-[#1B300B] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === "sw" ? "Angalia Kila Kitu" : "View Full Details"}</span>
                      </button>

                      {rep.status !== "APPROVED" && (
                        <button
                          onClick={() => approveDailyReport(rep.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === "sw" ? "Idhinisha (Boss)" : "Approve (Owner)"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: End-of-Day Shift Closeout Card */}
            <div className="w-full lg:w-80 p-4 rounded-2xl bg-white border-2 border-[#b5ea62] shadow-neu-card flex flex-col justify-between">
              <div className="space-y-3">
                <div className="pb-2 border-b border-[#dde8d2]">
                  <h4 className="font-black text-sm text-[#182d09]">
                    {language === "sw" ? "Muhtasari wa Hesabu ya Leo" : "Today's Account Summary"}
                  </h4>
                  <p className="text-[11px] text-[#556b4b]">
                    {language === "sw" ? "Hesabu ya sasa kabla ya kutuma kwa Mwenye Duka" : "Live summary before submitting to Owner"}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#506646]">
                    <span>{language === "sw" ? "Mauzo ya Cash:" : "Cash Sales:"}</span>
                    <span className="font-bold text-[#192f0b]">TZS {totalCashSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>{language === "sw" ? "Mauzo ya Simu (M-Pesa):" : "Mobile Money Sales:"}</span>
                    <span className="font-bold text-[#192f0b]">TZS {totalMobileSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>{language === "sw" ? "Mauzo ya Mkopo (Madeni):" : "Credit Sales (Debts):"}</span>
                    <span className="font-bold text-amber-800">TZS {totalCreditSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>{language === "sw" ? "Matumizi ya Siku Hiyo:" : "Today's Expenses:"}</span>
                    <span className="font-bold text-rose-700">-TZS {totalExpensesToday.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#506646]">
                    <span>{language === "sw" ? "Stock Iliyobaki Stoo:" : "Remaining Stock:"}</span>
                    <span className="font-bold text-[#192f0b]">{totalUnitsRemainingInStore} pcs</span>
                  </div>
                  <div className="pt-2 border-t border-[#e2edd7] flex justify-between font-black text-sm text-[#152a08]">
                    <span>{language === "sw" ? "Jumla ya Mauzo Leo:" : "Total Sales Today:"}</span>
                    <span className="text-emerald-800">TZS {totalSalesAll.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    setCountedCashInput(String(cashRegister.actualCash));
                    setIsSubmitModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl neu-btn text-xs font-black shadow-neu-flat uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === "sw" ? "Tuma Mahesabu kwa Mwenye Duka" : "Submit Report to Owner"}</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModalMode("DEPOSIT")}
                    className="py-2 rounded-xl bg-[#F4F8EC] border border-[#d2e4bb] text-[11px] font-bold text-[#273d19] hover:bg-[#E1FFAC]"
                  >
                    {language === "sw" ? "+ Weka Cash" : "+ Float In"}
                  </button>
                  <button
                    onClick={() => setModalMode("WITHDRAW")}
                    className="py-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-800 hover:bg-rose-100"
                  >
                    {language === "sw" ? "- Toa Cash" : "- Drop Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAMEUZA NINI LEO (DIRECT SALE ENTRY + PRODUCTS SOLD TODAY) */}
      {activeTab === "sold_products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Direct Sale Input Form (User types product name directly, no dropdown) */}
          <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
            <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-[#3A6112]" />
              <span>{language === "sw" ? "Andika Bidhaa Iliyouzwa Leo" : "Record Sold Product"}</span>
            </h3>
            <p className="text-[11px] text-[#5B714F] mb-3">
              {language === "sw"
                ? "Andika jina la bidhaa uliyouza moja kwa moja hapa. Stoo itapungua na mauzo yataingia kwenye mahesabu ya siku."
                : "Type sold product name directly. Stock deducts automatically and revenue adds to today's ledger."}
            </p>

            <form onSubmit={handleQuickSaleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "Andika Jina la Bidhaa Iliyouzwa:" : "Product Name Sold:"}
                </label>
                <input
                  type="text"
                  list="store-products-datalist"
                  required
                  value={saleProdName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSaleProdName(val);
                    const matched = products.find(
                      (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                    );
                    if (matched) {
                      setSaleUnitPrice(String(matched.sellingPrice));
                    }
                  }}
                  placeholder={language === "sw" ? "Mfano: Nivea Body Milk 400ml..." : "e.g. Nivea Body Milk 400ml..."}
                  className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Idadi (Pcs)" : "Quantity (Pcs)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={saleQty}
                    onChange={(e) => setSaleQty(e.target.value)}
                    placeholder="1"
                    className="w-full py-2 px-3 rounded-xl neu-input font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Bei ya Kila Moja (TZS)" : "Unit Price (TZS)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={saleUnitPrice}
                    onChange={(e) => setSaleUnitPrice(e.target.value)}
                    placeholder={language === "sw" ? "Mfano: 15000" : "e.g. 15000"}
                    className="w-full py-2 px-3 rounded-xl neu-input font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Malipo" : "Payment"}
                  </label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value as "CASH" | "MPESA" | "CREDIT")}
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  >
                    <option value="CASH">{language === "sw" ? "Cash (Taslimu)" : "Cash"}</option>
                    <option value="MPESA">{language === "sw" ? "M-Pesa / Simu" : "Mobile Money / M-Pesa"}</option>
                    <option value="CREDIT">{language === "sw" ? "Mkopo (Deni)" : "Credit / Debt"}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Mteja (Hiari)" : "Customer (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={saleCustomerName}
                    onChange={(e) => setSaleCustomerName(e.target.value)}
                    placeholder={language === "sw" ? "Jina la mteja..." : "Customer name..."}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl neu-btn font-black text-xs">
                {language === "sw" ? "+ Hifadhi Mauzo ya Bidhaa Hii" : "+ Save Sale Entry"}
              </button>
            </form>
          </div>

          {/* Right: Table of Products Sold Today */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] shadow-xs p-4 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EBF2E2] gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-[#162709] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#233f0d]" />
                  <span>
                    {language === "sw"
                      ? "Orodha ya Bidhaa Walizouza Leo & Stock Iliyobaki Stoo"
                      : "Products Sold Today & Remaining Store Stock"}
                  </span>
                </h3>
                <p className="text-xs text-[#546949]">
                  {language === "sw"
                    ? "Inaonyesha kila bidhaa iliyouzwa leo, nani aliuza, kiasi kilichopatikana, na idadi iliyobaki stoo."
                    : "Shows every item sold today, seller, revenue collected, and remaining store stock."}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-[#F4F8EE] px-3 py-1.5 rounded-xl border border-[#d4e6c1]">
                <span className="text-xs font-bold text-[#4a5e40]">
                  {language === "sw" ? "Jumla Iliyouzwa: " : "Total Sold: "}
                  <strong className="text-[#162709]">{totalUnitsSold} pcs</strong>
                </span>
                <span className="text-[#cbd9be]">|</span>
                <span className="text-xs font-bold text-[#4a5e40]">
                  {language === "sw" ? "Mapato: " : "Revenue: "}
                  <strong className="text-emerald-800">TZS {totalSalesAll.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
                <thead className="text-[#516744] font-bold bg-[#F9FBF6]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">{language === "sw" ? "Bidhaa Iliyouzwa" : "Product Sold"}</th>
                    <th className="py-3 px-4">{language === "sw" ? "Aliyeuza (Mfanyakazi)" : "Sold By"}</th>
                    <th className="py-3 px-4 text-center">{language === "sw" ? "Idadi Iliyouzwa Leo" : "Quantity Sold"}</th>
                    <th className="py-3 px-4 text-right">{language === "sw" ? "Jumla ya Pesa" : "Total Revenue"}</th>
                    <th className="py-3 px-4 text-right">{language === "sw" ? "Stock Iliyobaki Stoo" : "Remaining Stock"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                  {soldProductsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        {language === "sw"
                          ? "Hakuna bidhaa iliyouzwa bado kwa siku ya leo."
                          : "No products sold yet today."}
                      </td>
                    </tr>
                  ) : (
                    soldProductsList.map((item, idx) => (
                      <tr key={item.name} className="hover:bg-[#F4F8EE]/60">
                        <td className="py-3 px-4 font-bold text-[#617855]">{idx + 1}</td>
                        <td className="py-3 px-4 font-extrabold text-[#162709]">{item.name}</td>
                        <td className="py-3 px-4 text-[#4B623F] font-semibold">{item.lastCashier}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-[#E1FFAC] text-[#182d09] font-black border border-[#aae056]">
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-800">
                          TZS {item.revenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-black text-[#162709]">
                            {item.remainingInStore} {item.unit}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATUMIZI YA SIKU HIYO (DAILY SHOP EXPENSES) */}
      {activeTab === "daily_expenses" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Quick Record Daily Expense Form for Staff */}
          <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
            <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-[#3A6112]" />
              <span>{language === "sw" ? "Rekodi Matumizi ya Siku" : "Record Daily Expense"}</span>
            </h3>
            <p className="text-[11px] text-[#5B714F] mb-3">
              {language === "sw"
                ? "Andika pesa iliyotumika dukani leo (mfano: chakula, bodaboda, umeme, mifuko). Itaonekana kwa Mwenye Duka moja kwa moja."
                : "Record money spent today in the shop (e.g. transport, food, electricity, packaging)."}
            </p>

            <form onSubmit={handleQuickExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "Aina ya Matumizi" : "Expense Category"}
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                >
                  <option value="Usafiri & Bodaboda">
                    {language === "sw" ? "Usafiri & Bodaboda" : "Transport & Delivery"}
                  </option>
                  <option value="Chakula & Maji Dukani">
                    {language === "sw" ? "Chakula & Maji Dukani" : "Staff Meals & Water"}
                  </option>
                  <option value="Umeme (LUKU) & Maji">
                    {language === "sw" ? "Umeme (LUKU) & Maji" : "Electricity & Utilities"}
                  </option>
                  <option value="Vifungashio & Mifuko">
                    {language === "sw" ? "Vifungashio & Mifuko" : "Packaging & Bags"}
                  </option>
                  <option value="Usafi & Ulinzi">
                    {language === "sw" ? "Usafi & Ulinzi" : "Cleaning & Security"}
                  </option>
                  <option value="Mengineyo">
                    {language === "sw" ? "Mengineyo" : "Other Expenses"}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "Maelezo ya Matumizi" : "Expense Description"}
                </label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder={language === "sw" ? "Mfano: Nauli ya bodaboda kupeleka mzigo..." : "e.g. Transport fare for delivery..."}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Kiasi (TZS)" : "Amount (TZS)"}
                  </label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Imelipwa kwa" : "Paid Via"}
                  </label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as "CASH" | "MPESA")}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  >
                    <option value="CASH">{language === "sw" ? "Cash ya Drooni" : "Till Cash"}</option>
                    <option value="MPESA">{language === "sw" ? "M-Pesa / Simu" : "Mobile Money / M-Pesa"}</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl neu-btn font-black text-xs">
                {language === "sw" ? "+ Hifadhi Matumizi ya Leo" : "+ Save Expense"}
              </button>
            </form>
          </div>

          {/* Right: List of Today's Recorded Expenses */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBF2E2]">
              <div>
                <h3 className="font-black text-sm text-[#162709]">
                  {language === "sw" ? "Orodha ya Matumizi ya Siku" : "Daily Expenses List"}
                </h3>
                <p className="text-[11px] text-[#5B714F]">
                  {language === "sw" ? "Matumizi yote yaliyorekodiwa dukani" : "All recorded shop expenses"}
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black">
                {language === "sw" ? "Jumla: " : "Total: "}TZS {totalExpensesToday.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
                <thead className="text-[#516744] font-bold bg-[#F9FBF6]">
                  <tr>
                    <th className="py-2.5 px-3">{language === "sw" ? "Tarehe" : "Date"}</th>
                    <th className="py-2.5 px-3">{language === "sw" ? "Aina" : "Category"}</th>
                    <th className="py-2.5 px-3">{language === "sw" ? "Maelezo" : "Description"}</th>
                    <th className="py-2.5 px-3">{language === "sw" ? "Malipo" : "Payment"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Kiasi (TZS)" : "Amount (TZS)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#F9FBF6]">
                      <td className="py-2.5 px-3 font-mono text-[11px]">{exp.date}</td>
                      <td className="py-2.5 px-3 font-bold">{exp.category}</td>
                      <td className="py-2.5 px-3 text-[#4C6240]">{exp.description || exp.title}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#EDF3E6] font-bold text-[10px]">
                          {exp.paymentMethod || "CASH"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-700">
                        TZS {exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK ILIYobaki STOO & KUINGIZA STOCK (DIRECT PRODUCT TYPING, NO FORCED DROPDOWN) */}
      {activeTab === "remaining_stock" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Direct Stock IN Form for Staff/Owner */}
          <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
            <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
              <span>{language === "sw" ? "Ingiza Stock Mpya Stoo" : "Add Stock to Store"}</span>
            </h3>
            <p className="text-[11px] text-[#5B714F] mb-3">
              {language === "sw"
                ? "Andika jina la bidhaa uliyoingiza stoo moja kwa moja. Kama ni mpya itasajiliwa papo hapo."
                : "Type product name entered into store directly. Automatically registers new products."}
            </p>

            <form onSubmit={handleQuickStockIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "Andika Jina la Bidhaa:" : "Product Name:"}
                </label>
                <input
                  type="text"
                  list="store-products-datalist"
                  required
                  value={stockProdName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStockProdName(val);
                    const matched = products.find(
                      (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                    );
                    if (matched) {
                      setStockBuyPrice(String(matched.buyingPrice));
                      setStockSellPrice(String(matched.sellingPrice));
                    }
                  }}
                  placeholder={language === "sw" ? "Andika jina la bidhaa hapa..." : "Type product name here..."}
                  className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "Idadi Iliyoingia (Pcs)" : "Quantity In (Pcs)"}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder={language === "sw" ? "Mfano: 24" : "e.g. 24"}
                  className="w-full py-2 px-3 rounded-xl neu-input font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Bei ya Kununulia (TZS)" : "Cost Price (TZS)"}
                  </label>
                  <input
                    type="number"
                    value={stockBuyPrice}
                    onChange={(e) => setStockBuyPrice(e.target.value)}
                    placeholder="10000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#334A26] mb-1">
                    {language === "sw" ? "Bei ya Kuuza (TZS)" : "Selling Price (TZS)"}
                  </label>
                  <input
                    type="number"
                    value={stockSellPrice}
                    onChange={(e) => setStockSellPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  {language === "sw" ? "Maelezo / Msambazaji" : "Notes / Supplier"}
                </label>
                <input
                  type="text"
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder={language === "sw" ? "Mfano: Katoni 2 kutoka Kariakoo..." : "e.g. 2 boxes from supplier..."}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl neu-btn font-black text-xs">
                {language === "sw" ? "+ Ongeza Kwenye Stoo Sasa" : "+ Add to Store Stock"}
              </button>
            </form>
          </div>

          {/* Right: Remaining Stock Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
              <div>
                <h3 className="font-black text-sm text-[#162709]">
                  {language === "sw" ? "Hesabu ya Stock Iliyobaki Stoo Sasa Hivi" : "Current Stock Available in Store"}
                </h3>
                <p className="text-[11px] text-[#5B714F]">
                  {language === "sw"
                    ? "Idadi kamili ya kila bidhaa iliyobaki dukani baada ya mauzo ya leo"
                    : "Exact remaining count of each product in shop after sales"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#F4F8EC] border border-[#C8DFB0] text-[#172B08] text-xs font-black">
                  {language === "sw" ? "Jumla Iliyobaki: " : "Total Remaining: "}{totalUnitsRemainingInStore} pcs
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
                <thead className="text-[#516744] font-bold bg-[#F9FBF6]">
                  <tr>
                    <th className="py-2.5 px-3">{language === "sw" ? "Bidhaa" : "Product"}</th>
                    <th className="py-2.5 px-3">{language === "sw" ? "Kundi" : "Category"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Bei ya Kuuza" : "Selling Price"}</th>
                    <th className="py-2.5 px-3 text-center">{language === "sw" ? "Stock Iliyobaki Stoo" : "Remaining Stock"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "sw" ? "Hali ya Stoo" : "Stock Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                  {products.map((p) => {
                    const isLow = p.stockQuantity <= p.minStock;
                    return (
                      <tr key={p.id} className="hover:bg-[#F9FBF6]">
                        <td className="py-2.5 px-3 font-extrabold text-[#162709]">{p.name}</td>
                        <td className="py-2.5 px-3 text-[#526846]">{p.category}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          TZS {p.sellingPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-black text-sm text-[#162709]">
                            {p.stockQuantity} {p.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isLow
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            }`}
                          >
                            {isLow
                              ? language === "sw" ? "! INAISHA STOO" : "! LOW STOCK"
                              : language === "sw" ? "✓ IPO YA KUTOSHA" : "✓ IN STOCK"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT DAILY SHIFT REPORT TO OWNER */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EFE0] pb-3">
              <div>
                <h3 className="text-base font-black text-[#162709]">
                  {language === "sw" ? "Tuma Mahesabu ya Siku kwa Mwenye Duka" : "Submit Daily Report to Owner"}
                </h3>
                <p className="text-xs text-[#556B4B]">
                  {language === "sw"
                    ? "Inajumuisha: Walichouza leo, Matumizi ya siku hiyo, na Stock iliyobaki stoo."
                    : "Includes: Sales recorded today, daily expenses, and remaining store stock."}
                </p>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 bg-[#F6FAF0] p-3 rounded-2xl border border-[#D4E6C0] text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#5A704E] block">
                  {language === "sw" ? "1. Mauzo ya Leo" : "1. Today's Sales"}
                </span>
                <strong className="text-sm font-black text-emerald-800">
                  TZS {totalSalesAll.toLocaleString()}
                </strong>
                <span className="block text-[10px] text-[#5A704E]">
                  {totalUnitsSold} {language === "sw" ? "pcs zimeuzwa" : "pcs sold"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5A704E] block">
                  {language === "sw" ? "2. Matumizi ya Leo" : "2. Today's Expenses"}
                </span>
                <strong className="text-sm font-black text-rose-700">
                  TZS {totalExpensesToday.toLocaleString()}
                </strong>
                <span className="block text-[10px] text-[#5A704E]">
                  {expenses.length} {language === "sw" ? "rekodi" : "records"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5A704E] block">
                  {language === "sw" ? "3. Stock Iliyobaki" : "3. Remaining Stock"}
                </span>
                <strong className="text-sm font-black text-[#162709]">
                  {totalUnitsRemainingInStore} pcs
                </strong>
                <span className="block text-[10px] text-amber-800">
                  {lowStockItems.length} {language === "sw" ? "zinaisha" : "low stock"}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmSubmitReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2F4620] mb-1">
                  {language === "sw"
                    ? "Pesa Taslimu (Cash) Uliyohesabu Drooni Sasa Hivi (TZS)"
                    : "Actual Till Cash Counted (TZS)"}
                </label>
                <input
                  type="number"
                  required
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl neu-input font-black text-base"
                />
                <span className="text-[10px] text-[#5F7553] mt-0.5 block">
                  {language === "sw"
                    ? `Pesa inayotakiwa kuwepo drooni: TZS ${expectedCash.toLocaleString()}`
                    : `Expected cash balance: TZS ${expectedCash.toLocaleString()}`}
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#2F4620] mb-1">
                  {language === "sw"
                    ? "Maelezo / Ujumbe kwa Mwenye Duka (Hiari)"
                    : "Notes / Message to Owner (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder={
                    language === "sw"
                      ? "Mfano: Mauzo yameenda vizuri, Nivea na Garnier zimebaki chache stoo..."
                      : "e.g. Sales went smoothly, stock is running low on popular brands..."
                  }
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  {language === "sw" ? "Ghairi" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1C320A] hover:bg-[#28470E] text-[#E1FFAC] font-black flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === "sw" ? "Wasilisha kwa Mwenye Duka" : "Submit Report"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW FULL SUBMITTED REPORT DETAILS (FOR OWNER & STAFF) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EFE0] pb-3">
              <div>
                <h3 className="text-base font-black text-[#162709]">
                  {language === "sw" ? "Ripoti Kamili ya Siku — " : "Full Daily Report — "}
                  {selectedReport.submittedBy} ({selectedReport.staffRole})
                </h3>
                <p className="text-xs text-[#556B4B]">
                  {language === "sw" ? "Tarehe: " : "Date: "}{selectedReport.submittedAt} • {language === "sw" ? "Tawi: " : "Branch: "}{selectedReport.branchName}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Walichouza Leo */}
            <div className="p-3.5 rounded-2xl bg-[#F8FBF4] border border-[#D8E6CC] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#162709] uppercase">
                  {language === "sw"
                    ? `1. Walichouza Leo (${selectedReport.totalUnitsSold} pcs)`
                    : `1. Sold Items (${selectedReport.totalUnitsSold} pcs)`}
                </h4>
                <span className="text-xs font-black text-emerald-800">
                  {language === "sw" ? "Jumla: " : "Total: "}TZS {selectedReport.totalSales.toLocaleString()}
                </span>
              </div>
              <div className="divide-y divide-[#E6EFE0] text-xs">
                {selectedReport.soldItems.map((it, i) => (
                  <div key={i} className="py-1.5 flex justify-between">
                    <span className="font-bold text-[#1B2F0C]">
                      {it.name} × {it.quantity}
                    </span>
                    <span className="font-black text-emerald-800">TZS {it.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Matumizi ya Siku Hiyo */}
            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-rose-900 uppercase">
                  {language === "sw"
                    ? `2. Matumizi ya Siku Hiyo (${selectedReport.dailyExpenses.length})`
                    : `2. Daily Expenses (${selectedReport.dailyExpenses.length})`}
                </h4>
                <span className="text-xs font-black text-rose-800">
                  {language === "sw" ? "Jumla: " : "Total: "}TZS {selectedReport.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="divide-y divide-rose-100 text-xs">
                {selectedReport.dailyExpenses.map((ex, i) => (
                  <div key={i} className="py-1.5 flex justify-between">
                    <span>
                      <strong>{ex.category}:</strong> {ex.description} ({ex.paymentMethod})
                    </span>
                    <span className="font-black text-rose-800">TZS {ex.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Stock Iliyobaki Stoo */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#162709] uppercase">
                  {language === "sw"
                    ? `3. Stock Iliyobaki Stoo (${selectedReport.remainingStockSummary.totalUnitsInStore} pcs)`
                    : `3. Remaining Stock (${selectedReport.remainingStockSummary.totalUnitsInStore} pcs)`}
                </h4>
                <span className="text-xs font-bold text-amber-800">
                  {selectedReport.remainingStockSummary.lowStockCount}{" "}
                  {language === "sw" ? "bidhaa zinakaribia kuisha" : "items low on stock"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {selectedReport.remainingStockSummary.stockSnapshot.map((st) => (
                  <div
                    key={st.id}
                    className="p-2 rounded-xl bg-[#F7FAF3] border border-[#E1ECD6] flex items-center justify-between"
                  >
                    <span className="font-bold text-[#182B0A] truncate pr-2">{st.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-black shrink-0 ${
                        st.remainingQty <= st.minStock
                          ? "bg-amber-100 text-amber-900"
                          : "bg-[#E1FFAC] text-[#172B08]"
                      }`}
                    >
                      {st.remainingQty} {st.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {selectedReport.status !== "APPROVED" && (
                <button
                  onClick={() => {
                    approveDailyReport(selectedReport.id);
                    setSelectedReport({ ...selectedReport, status: "APPROVED", approvedBy: user?.name || "Owner" });
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === "sw" ? "Idhinisha Mahesabu Haya (Boss)" : "Approve This Report"}</span>
                </button>
              )}
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl neu-btn-secondary text-xs font-bold"
              >
                {language === "sw" ? "Funga" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEPOSIT / WITHDRAW / COUNT */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-1">
              {modalMode === "DEPOSIT" && (language === "sw" ? "Ongeza Pesa Kwenye Droo" : "Add Cash Float to Till")}
              {modalMode === "WITHDRAW" && (language === "sw" ? "Toa Pesa Kwenye Droo" : "Withdraw Cash from Till")}
              {modalMode === "COUNT" && (language === "sw" ? "Weka Pesa Halisi Iliyohesabiwa" : "Count Cash on Hand")}
            </h3>
            <form onSubmit={handleDepositOrWithdraw} className="space-y-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-[#354b28] mb-1">
                  {language === "sw" ? "Kiasi cha Pesa (TZS)" : "Amount (TZS)"}
                </label>
                <input
                  type="number"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Mfano: 150000"
                  className="w-full py-2.5 px-3.5 rounded-xl neu-input text-base font-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary text-xs font-bold"
                >
                  {language === "sw" ? "Ghairi" : "Cancel"}
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl neu-btn text-xs font-black">
                  {language === "sw" ? "Thibitisha Hesabu" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
