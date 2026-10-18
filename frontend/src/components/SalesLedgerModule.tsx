"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  PlusCircle,
  Search,
  RotateCcw,
  Calculator,
  Send,
  CheckCircle2,
  Calendar
} from "lucide-react";

export const SalesLedgerModule: React.FC = () => {
  const {
    user,
    sales,
    expenses,
    processSale,
    refundSale,
    products,
    addProduct,
    currentBranch,
    language,
    closeDayAndSendToBoss,
    startNewDay,
    isDayClosed,
    activeDayLabel,
  } = useApp();

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Direct Sale Entry Form State (Employee or Owner types today's sale directly)
  const [prodName, setProdName] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA" | "CREDIT">("CASH");
  const [customerName, setCustomerName] = useState("");
  const [justClosedReport, setJustClosedReport] = useState<boolean>(false);

  const isOwner = !user || user.role === "OWNER" || user.role === "SUPER_ADMIN";

  // Automatic calculation preview for current form input
  const parsedQty = parseInt(qty) || 0;
  const matchedProduct = products.find(
    (p) => p.name.toLowerCase() === prodName.trim().toLowerCase()
  );
  const parsedUnitPrice =
    parseFloat(unitPrice) || (matchedProduct ? matchedProduct.sellingPrice : 0);
  const autoLineTotal = parsedQty * parsedUnitPrice;

  // Automatic System Calculations across all valid sales of the active day
  const validSales = sales.filter((s) => s.status !== "REFUNDED");
  const totalSalesAmount = validSales.reduce((acc, s) => acc + s.total, 0);
  const totalCashSales = validSales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((acc, s) => acc + s.total, 0);
  const totalMobileSales = validSales
    .filter((s) => ["MPESA", "AIRTEL_MONEY", "MIXX", "HALOPESA"].includes(s.paymentMethod))
    .reduce((acc, s) => acc + s.total, 0);
  const totalCreditSales = validSales
    .filter((s) => s.paymentMethod === "CREDIT")
    .reduce((acc, s) => acc + s.total, 0);

  const totalUnitsSold = validSales.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );

  const totalExpensesToday = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalStoreStockRemaining = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  const filteredSales = validSales.filter((s) => {
    const itemsText = s.items.map((i) => i.productName).join(" ").toLowerCase();
    const matchesSearch =
      itemsText.includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      s.cashierName.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "ALL" || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = prodName.trim();
    if (!cleanName || parsedQty <= 0 || parsedUnitPrice <= 0) return;

    let targetProdId = matchedProduct?.id || `prod-auto-${Date.now()}`;
    let targetProdName = matchedProduct?.name || cleanName;

    if (!matchedProduct) {
      const created = addProduct({
        name: cleanName,
        sku: `AUTO-${Date.now().toString().slice(-4)}`,
        barcode: "",
        category: "Bidhaa za Dukani",
        brand: "General",
        buyingPrice: Math.round(parsedUnitPrice * 0.7),
        sellingPrice: parsedUnitPrice,
        wholesalePrice: parsedUnitPrice,
        stockQuantity: Math.max(20, parsedQty),
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

    const total = parsedQty * parsedUnitPrice;
    processSale({
      branchId: currentBranch?.id || "br-01",
      items: [
        {
          productId: targetProdId,
          productName: targetProdName,
          quantity: parsedQty,
          price: parsedUnitPrice,
          total,
        },
      ],
      subtotal: total,
      tax: 0,
      discount: 0,
      total,
      paidAmount: paymentMethod === "CREDIT" ? 0 : total,
      balance: paymentMethod === "CREDIT" ? total : 0,
      paymentMethod,
      customerName:
        customerName.trim() ||
        (paymentMethod === "CREDIT" ? "Mteja wa Mkopo" : "Mteja wa Dukani"),
      cashierName: user?.name || "Baraka Mushi",
      status: "COMPLETED",
    });

    setProdName("");
    setQty("1");
    setUnitPrice("");
    setCustomerName("");
    setJustClosedReport(false);
  };

  const handleCloseDaySales = () => {
    closeDayAndSendToBoss();
    setJustClosedReport(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Datalist for optional autocomplete while typing product name */}
      <datalist id="sales-products-datalist">
        {products.map((p) => (
          <option key={p.id} value={p.name}>
            Bei: TZS {p.sellingPrice.toLocaleString()} | Stoo: {p.stockQuantity} {p.unit}
          </option>
        ))}
      </datalist>

      {/* Top Header + "Funga Mauzo ya Siku" Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-[#162709] tracking-tight">
              {language === "sw"
                ? isOwner
                  ? "2. Mauzo ya Siku (Owner Anaona Mauzo & Hesabu Auto)"
                  : "1. Mauzo ya Leo (Andika Mauzo Manually & Hesabu Auto)"
                : "Daily Sales (Manual Entry & Automatic Calculation)"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E1FFAC] text-[#172B08] border border-[#9CE034] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Siku: {activeDayLabel}</span>
            </span>
          </div>
          <p className="text-xs text-[#526848] mt-0.5">
            {language === "sw"
              ? "Andika bidhaa iliyouzwa na idadi yake hapa chini; mfumo unapiga jumla ya pesa na kupunguza stoo automatically. Ukibonyeza 'Funga Mauzo ya Siku', siku inaisha na hesabu zote zinakwenda kwa Boss automatically."
              : "Type the item sold and quantity; the system calculates totals automatically. Click 'Close Day Sales' to end the day and send the report to the Boss."}
          </p>
        </div>

        {/* Prominent "Funga Mauzo ya Siku" Button */}
        <div className="flex items-center gap-2 shrink-0">
          {!isDayClosed ? (
            <button
              onClick={handleCloseDaySales}
              className="px-4 py-2.5 rounded-xl bg-[#1B2F09] hover:bg-[#27430D] text-[#E1FFAC] border-2 border-[#A6DF52] text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Funga Mauzo ya Siku (Tuma kwa Boss Auto)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                startNewDay();
                setJustClosedReport(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Fungua Siku Mpya (Anza Siku Mpya 0)</span>
            </button>
          )}
        </div>
      </div>

      {/* BANNER WHEN "FUNGA MAUZO YA SIKU" IS CLICKED (DAY ENDED & SENT TO BOSS AUTOMATICALLY) */}
      {(isDayClosed || justClosedReport) && (
        <div className="p-4 rounded-2xl bg-emerald-950 text-[#E1FFAC] border-2 border-[#A6DF52] flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-md">
          <div className="space-y-1">
            <div className="font-black text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#A6DF52]" />
              <span>
                SIKU IMEFUNGWA ({activeDayLabel}) — HESABU IMETUMWA KWA BOSS AUTOMATICALLY!
              </span>
            </div>
            <p className="text-emerald-100/90">
              Muhtasari uliotumwa kwa Mwenye Duka: <strong>Mauzo ya Leo: TZS {totalSalesAmount.toLocaleString()}</strong> ({totalUnitsSold} pcs) |{" "}
              <strong>Matumizi ya Leo: TZS {totalExpensesToday.toLocaleString()}</strong> |{" "}
              <strong>Stoo Iliyobaki: {totalStoreStockRemaining} pcs</strong>.
            </p>
          </div>
          <button
            onClick={() => {
              startNewDay();
              setJustClosedReport(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#E1FFAC] text-[#162708] font-black text-xs shrink-0 hover:bg-white transition cursor-pointer"
          >
            Anza Siku Mpya (Weka Mauzo & Matumizi 0)
          </button>
        </div>
      )}

      {/* 4 AUTOMATIC CALCULATION SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-[#b2e269] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Jumla ya Mauzo ya Leo (Auto)
          </span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            TZS {totalSalesAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">
            Vipande {totalUnitsSold} vimeuzwa ({validSales.length} mauzo)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Cash (Taslimu)
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {totalCashSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#69825B] font-bold">
            Pesa taslimu iliyoingia drooni leo
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Simu (M-Pesa / Airtel)
          </span>
          <p className="text-xl font-black text-[#162709] mt-0.5">
            TZS {totalMobileSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#69825B] font-bold">
            Malipo ya Lipa Namba / Simu leo
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-xs font-bold text-[#566E49] block">
            Mauzo ya Mkopo (Madeni ya Leo)
          </span>
          <p className="text-xl font-black text-amber-700 mt-0.5">
            TZS {totalCreditSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-800 font-bold">
            Inaingia kwenye Wateja & Madeni auto
          </span>
        </div>
      </div>

      {/* MAIN WORKSPACE: LEFT = ENTER TODAY'S SALES | RIGHT = LIVE SALES TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left: Enter Today's Sales Form */}
        <div className="bg-white rounded-2xl border-2 border-[#BFE973] p-4 shadow-xs h-fit">
          <h3 className="font-black text-sm text-[#162709] mb-1 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#3A6112]" />
            <span>Andika Mauzo ya Leo (Manual)</span>
          </h3>
          <p className="text-[11px] text-[#5B714F] mb-3">
            Andika jina la bidhaa uliyouza na idadi yake. Mfumo unakupigia hesabu ya jumla na kupunguza stoo moja kwa moja.
          </p>

          <form onSubmit={handleRecordSale} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#334A26] mb-1">
                Andika Jina la Bidhaa Iliyouzwa:
              </label>
              <input
                type="text"
                list="sales-products-datalist"
                required
                value={prodName}
                onChange={(e) => {
                  const val = e.target.value;
                  setProdName(val);
                  const found = products.find(
                    (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                  );
                  if (found) {
                    setUnitPrice(String(found.sellingPrice));
                  }
                }}
                placeholder="Mfano: Nivea Body Milk au Viatu..."
                className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
              />
              {matchedProduct && (
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                  ✓ Ipo stoo: {matchedProduct.stockQuantity} {matchedProduct.unit} | Bei: TZS{" "}
                  {matchedProduct.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Idadi Iliyouzwa
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="1"
                  className="w-full py-2 px-3 rounded-xl neu-input font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Bei ya Kila Moja (TZS)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="15000"
                  className="w-full py-2 px-3 rounded-xl neu-input font-black text-sm"
                />
              </div>
            </div>

            {/* Automatic Calculation Box */}
            <div className="p-3 rounded-xl bg-[#F4F8EC] border border-[#C6DDA8] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#273E14] font-bold">
                <Calculator className="w-4 h-4 text-[#3F6315]" />
                <span>Jumla (Auto Hesabu):</span>
              </div>
              <span className="text-base font-black text-emerald-800">
                TZS {autoLineTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#334A26] mb-1">Njia ya Malipo</label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "CASH" | "MPESA" | "CREDIT")
                  }
                  className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                >
                  <option value="CASH">Cash (Taslimu)</option>
                  <option value="MPESA">M-Pesa / Simu</option>
                  <option value="CREDIT">Mkopo (Deni la Mteja)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334A26] mb-1">
                  Jina la Mteja {paymentMethod === "CREDIT" ? "(Muhimu)" : "(Hiari)"}
                </label>
                <input
                  type="text"
                  required={paymentMethod === "CREDIT"}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jina la mteja..."
                  className="w-full py-2 px-3 rounded-xl neu-input font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl neu-btn font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              + Hifadhi Mauzo ya Leo
            </button>
          </form>
        </div>

        {/* Right: Live Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E6CC] p-4 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBF2E2]">
            <div>
              <h3 className="font-black text-sm text-[#162709] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#233F0D]" />
                <span>Orodha ya Mauzo ya Siku ({activeDayLabel})</span>
              </h3>
              <p className="text-[11px] text-[#546949]">
                Kila bidhaa iliyouzwa leo, idadi, malipo na jumla iliyopigwa na mfumo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#657C58]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tafuta bidhaa au mteja..."
                  className="py-1.5 pl-8 pr-3 rounded-xl neu-input text-xs"
                />
              </div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-xl neu-input text-xs font-bold"
              >
                <option value="ALL">Malipo Yote</option>
                <option value="CASH">Cash</option>
                <option value="MPESA">M-Pesa</option>
                <option value="CREDIT">Mkopo</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto mt-3 flex-1">
            <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
              <thead className="bg-[#F8FAF4] font-bold text-[#4D6340]">
                <tr>
                  <th className="py-2.5 px-3">Bidhaa Iliyouzwa</th>
                  <th className="py-2.5 px-3 text-center">Idadi</th>
                  <th className="py-2.5 px-3">Mteja</th>
                  <th className="py-2.5 px-3">Aliyeuza</th>
                  <th className="py-2.5 px-3">Malipo</th>
                  <th className="py-2.5 px-3 text-right">Jumla (TZS)</th>
                  <th className="py-2.5 px-3 text-right">Hatua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Siku hii haina mauzo bado (TZS 0). Tumia fomu ya kushoto kuandika mauzo ya leo.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => {
                    const totalQty = s.items.reduce((sum, i) => sum + i.quantity, 0);
                    return (
                      <tr key={s.id} className="hover:bg-[#F9FBF6] transition">
                        <td className="py-3 px-3 font-extrabold text-[#162709]">
                          {s.items.map((i) => `${i.productName} (×${i.quantity})`).join(", ")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#E1FFAC] text-[#182D09] font-black border border-[#aae056]">
                            {totalQty} pcs
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold">
                          {s.customerName || "Mteja wa Dukani"}
                        </td>
                        <td className="py-3 px-3 text-[#48603C]">{s.cashierName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              s.paymentMethod === "CREDIT"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-[#EDF3E6] text-[#20360B]"
                            }`}
                          >
                            {s.paymentMethod === "CREDIT" ? "MKOPO (DENI)" : s.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-800">
                          TZS {s.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => refundSale(s.id)}
                            className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Futa / Rudisha Mauzo"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
