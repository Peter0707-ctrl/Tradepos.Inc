"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  TrendingDown,
  TrendingUp,
  X
} from "lucide-react";

export const InventoryModule: React.FC = () => {
  const {
    user,
    currentBranch,
    products,
     sales,
    addProduct,
    deleteProduct,
    stockMovements,
    recordStockMovement,
    processSale,
    language,
  } = useApp();

  const [search, setSearch] = useState("");
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");

  // Unified Stock IN / Stock OUT Modal Form State (User types product name directly)
  const [movProductName, setMovProductName] = useState("");
  const [movQuantity, setMovQuantity] = useState("");
  const [movCategory, setMovCategory] = useState("Bidhaa za Dukani");
  const [movUnit, setMovUnit] = useState("Pcs");
  const [movReason, setMovReason] = useState("Mzigo Mpya (Ununuzi)");
  const [movBuyingPrice, setMovBuyingPrice] = useState("");
  const [movSellingPrice, setMovSellingPrice] = useState("");
  const [movNotes, setMovNotes] = useState("");

  // Per-product calculation of:
  // 1. Stock Iliyotoka kutokana na Mauzo (Sales)
  // 2. Stock Iliyotoka kwa kutolewa mwenyewe (Manual Stock OUT)
  // 3. Stock Iliyoingizwa (Total Stock IN = Remaining + Total OUT)
  // 4. Stock Iliyopo Sasa (Remaining Stock = p.stockQuantity)
  const validSales = (sales || []).filter((s) => s.status !== "REFUNDED");

  const getProductStockBreakdown = (p: typeof products[0]) => {
    // 1. Units sold via Sales records
    let soldFromSales = 0;
    validSales.forEach((s) => {
      s.items.forEach((it) => {
        if (it.productId === p.id || it.productName.toLowerCase() === p.name.toLowerCase()) {
          soldFromSales += it.quantity;
        }
      });
    });

    // 2. Units from stockMovements OUT
    const prodOutMovements = (stockMovements || []).filter(
      (m) =>
        m.type === "OUT" &&
        (m.productId === p.id || m.productName.toLowerCase() === p.name.toLowerCase())
    );

    const movSaleOut = prodOutMovements
      .filter(
        (m) =>
          m.reason === "SALE" ||
          m.reason === "QUICK_CASH_SALE" ||
          m.reason.toLowerCase().includes("mauzo")
      )
      .reduce((acc, m) => acc + m.quantity, 0);

    const manualOut = prodOutMovements
      .filter(
        (m) =>
          m.reason !== "SALE" &&
          m.reason !== "QUICK_CASH_SALE" &&
          !m.reason.toLowerCase().includes("mauzo")
      )
      .reduce((acc, m) => acc + m.quantity, 0);

    // System automatically takes the larger of sales ledger vs sale movements so initial demo data & new sales never double-count
    const totalSoldOut = Math.max(soldFromSales, movSaleOut);
    const totalOut = totalSoldOut + manualOut;

    // Explicit IN movements recorded
    const recordedIn = (stockMovements || [])
      .filter(
        (m) =>
          m.type === "IN" &&
          (m.productId === p.id || m.productName.toLowerCase() === p.name.toLowerCase())
      )
      .reduce((acc, m) => acc + m.quantity, 0);

    // Total Stock IN that entered store (ensuring In - Out = Current Stock Iliyopo)
    const totalEnteredIn = Math.max(recordedIn, p.stockQuantity + totalOut);

    return {
      totalEnteredIn,
      totalSoldOut,
      manualOut,
      totalOut,
      currentStock: p.stockQuantity,
    };
  };

  // Global Totals across all products for Top Summary Cards
  const allBreakdowns = products.map((p) => ({
    product: p,
    ...getProductStockBreakdown(p),
  }));

  const totalCurrentStockUnits = allBreakdowns.reduce((acc, b) => acc + b.currentStock, 0);
  const totalCurrentStockValue = allBreakdowns.reduce(
    (acc, b) => acc + b.currentStock * b.product.buyingPrice,
    0
  );

  const totalStockInQty = allBreakdowns.reduce((acc, b) => acc + b.totalEnteredIn, 0);
  const totalStockInValue = allBreakdowns.reduce(
    (acc, b) => acc + b.totalEnteredIn * b.product.buyingPrice,
    0
  );

  const totalSoldOutQty = allBreakdowns.reduce((acc, b) => acc + b.totalSoldOut, 0);
  const totalManualOutQty = allBreakdowns.reduce((acc, b) => acc + b.manualOut, 0);
  const totalStockOutQty = totalSoldOutQty + totalManualOutQty;
  const totalStockOutValue = allBreakdowns.reduce(
    (acc, b) => acc + b.totalOut * b.product.sellingPrice,
    0
  );

  const filteredBreakdowns = allBreakdowns.filter(
    ({ product }) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
  );

  const openQuickModal = (type: "IN" | "OUT", prefillProduct?: typeof products[0]) => {
    setMovementType(type);
    if (prefillProduct) {
      setMovProductName(prefillProduct.name);
      setMovCategory(prefillProduct.category);
      setMovUnit(prefillProduct.unit);
      setMovBuyingPrice(String(prefillProduct.buyingPrice));
      setMovSellingPrice(String(prefillProduct.sellingPrice));
    } else {
      setMovProductName("");
      setMovCategory("Bidhaa za Dukani");
      setMovUnit("Pcs");
      setMovBuyingPrice("");
      setMovSellingPrice("");
    }
    setMovQuantity("");
    setMovReason(
      type === "IN" ? "Mzigo Mpya Ulioingia Stoo" : "Imetolewa Stoo Mwenyewe (Manual)"
    );
    setMovNotes("");
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = movProductName.trim();
    const qty = parseInt(movQuantity);
    if (!cleanName || !qty || qty <= 0) return;

    const existingProd = products.find((p) => p.name.toLowerCase() === cleanName.toLowerCase());
    const enteredCost = parseFloat(movBuyingPrice) || (existingProd ? existingProd.buyingPrice : 0);
    const enteredSell =
      parseFloat(movSellingPrice) ||
      (existingProd ? existingProd.sellingPrice : Math.round(enteredCost * 1.3));

    if (existingProd) {
      // If Stock OUT is marked as a sale, record it via processSale so sales & stock both update
      if (movementType === "OUT" && movReason === "Mauzo ya Siku (Imeuzwa)") {
        const salePrice = enteredSell > 0 ? enteredSell : existingProd.sellingPrice;
        processSale({
          branchId: currentBranch?.id || "br-01",
          items: [
            {
              productId: existingProd.id,
              productName: existingProd.name,
              quantity: qty,
              price: salePrice,
              total: qty * salePrice,
            },
          ],
          subtotal: qty * salePrice,
          tax: 0,
          discount: 0,
          total: qty * salePrice,
          paidAmount: qty * salePrice,
          balance: 0,
          paymentMethod: "CASH",
          customerName: "Mteja wa Dukani",
          cashierName: user?.name || "Baraka Mushi",
          status: "COMPLETED",
        });
      } else {
        const cost = movementType === "IN" ? enteredCost : enteredSell;
        recordStockMovement({
          branchId: currentBranch?.id || "br-01",
          productId: existingProd.id,
          productName: existingProd.name,
          type: movementType,
          quantity: qty,
          reason: movReason,
          unitCost: cost,
          totalValue: qty * cost,
          recordedBy: user?.name || "Baraka Mushi",
          notes: movNotes || undefined,
        });
      }
    } else {
      // Product typed by user doesn't exist yet -> create it automatically and log movement!
      const newProd = addProduct({
        branchId: currentBranch?.id || "br-01",
        name: cleanName,
        sku: "ITEM-" + Math.floor(1000 + Math.random() * 9000),
        barcode: "",
        category: movCategory.trim() || "Bidhaa za Dukani",
        brand: "General",
        buyingPrice: enteredCost,
        sellingPrice: enteredSell > 0 ? enteredSell : enteredCost,
        wholesalePrice: enteredSell > 0 ? enteredSell : enteredCost,
        stockQuantity: 0,
        minStock: 5,
        maxStock: 500,
        unit: movUnit.trim() || "Pcs",
      });

      if (newProd) {
        recordStockMovement({
          branchId: currentBranch?.id || "br-01",
          productId: newProd.id,
          productName: newProd.name,
          type: movementType,
          quantity: qty,
          reason: movReason,
          unitCost: enteredCost,
          totalValue: qty * enteredCost,
          recordedBy: user?.name || "Baraka Mushi",
          notes: movNotes || "Bidhaa mpya imeingizwa kwenye stoo",
        });
      }
    }

    setIsMovementModalOpen(false);
    setMovProductName("");
    setMovQuantity("");
    setMovNotes("");
    setMovBuyingPrice("");
    setMovSellingPrice("");
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden gap-4">
      {/* Datalist for optional autocomplete when typing product name */}
      <datalist id="inventory-products-datalist">
        {products.map((p) => (
          <option key={p.id} value={p.name}>
            Stoo Iliyopo: {p.stockQuantity} {p.unit} | Bei: TZS {p.sellingPrice.toLocaleString()}
          </option>
        ))}
      </datalist>

      {/* Top Header (Single Unified View — No Split Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#172709] tracking-tight">
            {language === "sw"
              ? "Stoo Kuu: Stock Iliyoingizwa, Iliyotoka (Mauzo/Manual) & Iliyobaki"
              : "Unified Store Inventory: Stock In, Stock Out (Sales/Manual) & Remaining"}
          </h2>
          <p className="text-xs text-[#52654c]">
            {language === "sw"
              ? "Sehemu moja inayoonyesha stock iliyopo, iliyoingizwa, na iliyotoka moja kwa moja kulingana na mauzo au ukitoa mwenyewe."
              : "Single unified table showing incoming stock, automatic deductions from sales or manual removal, and current remaining stock."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openQuickModal("IN")}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingiza Stock / Bidhaa</span>
          </button>

          <button
            onClick={() => openQuickModal("OUT")}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Toa Stock Mwenyewe</span>
          </button>
        </div>
      </div>

      {/* 3 UNIFIED SUMMARY CARDS: ILIYOINGIZWA vs ILIYOTOKA (MAUZO + MANUAL) vs ILIYOPO SASA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Stock Iliyoingizwa */}
        <div className="neu-card-flat p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 uppercase">
              1. Jumla ya Stock Iliyoingizwa (+ IN)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl font-black text-emerald-950 mt-1">
            +{totalStockInQty} <span className="text-xs font-bold">Vipande</span>
          </p>
          <span className="text-[11px] font-semibold text-emerald-800">
            Thamani ya Mzigo: TZS {totalStockInValue.toLocaleString()}
          </span>
        </div>

        {/* 2. Stock Iliyotoka (Mauzo + Kutolewa Mwenyewe) */}
        <div className="neu-card-flat p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-900 uppercase">
              2. Stock Iliyotoka (- OUT: Mauzo & Manual)
            </span>
            <TrendingDown className="w-4 h-4 text-rose-700" />
          </div>
          <p className="text-xl font-black text-rose-950 mt-1">
            -{totalStockOutQty} <span className="text-xs font-bold">Vipande</span>
          </p>
          <span className="text-[11px] font-bold text-rose-800">
            Mauzo: {totalSoldOutQty} pcs | Imetolewa Mkononi: {totalManualOutQty} pcs (TZS{" "}
            {totalStockOutValue.toLocaleString()})
          </span>
        </div>

        {/* 3. Stock Iliyopo Sasa (Iliyobaki Stoo) */}
        <div className="neu-card-flat p-3.5 rounded-2xl border-2 border-[#b2e269] bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#172709] uppercase">
              3. Stock Iliyopo Sasa (Iliyobaki Stoo)
            </span>
            <Boxes className="w-4 h-4 text-[#253f0e]" />
          </div>
          <p className="text-xl font-black text-[#152508] mt-1">
            {totalCurrentStockUnits} <span className="text-xs font-bold text-[#52654c]">Vipande</span>
          </p>
          <span className="text-[11px] font-semibold text-[#42553a]">
            Hesabu: Iliyoingizwa ({totalStockInQty}) - Iliyotoka ({totalStockOutQty}) ={" "}
            <strong>{totalCurrentStockUnits} pcs</strong> (TZS {totalCurrentStockValue.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65795e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta jina la bidhaa au kundi..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>
      </div>

      {/* ONE UNIFIED TABLE SHOWING: BIDHAA, BEI, STOCK ILIYOINGIZWA, STOCK ILIYOTOKA (MAUZO/MANUAL), & STOCK ILIYOPO SASA */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Jina la Bidhaa & Kundi</th>
              <th className="py-3 px-4">Bei (Kununua / Kuuza)</th>
              <th className="py-3 px-4 text-center">Iliyoingizwa (+ Stock IN)</th>
              <th className="py-3 px-4 text-center">Iliyotoka (Mauzo & Manual)</th>
              <th className="py-3 px-4 text-center">Stock Iliyopo Sasa (Iliyobaki)</th>
              <th className="py-3 px-4 text-right">Ingiza / Toa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {filteredBreakdowns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Hakuna bidhaa iliyopatikana. Bonyeza &ldquo;+ Ingiza Stock / Bidhaa&rdquo; kuingiza bidhaa.
                </td>
              </tr>
            ) : (
              filteredBreakdowns.map(
                ({ product: p, totalEnteredIn, totalSoldOut, manualOut, totalOut, currentStock }) => {
                  const isLow = currentStock <= p.minStock;
                  const margin =
                    p.sellingPrice > 0
                      ? Math.round(((p.sellingPrice - p.buyingPrice) / p.sellingPrice) * 100)
                      : 0;
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFCF7] transition">
                      {/* 1. Product Name & Category */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[#162709] block">{p.name}</span>
                        <span className="text-[11px] text-[#5B714F]">{p.category}</span>
                      </td>

                      {/* 2. Buying & Selling Price */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#162709]">
                          Kuuza: TZS {p.sellingPrice.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#5B714F]">
                          Kununua: TZS {p.buyingPrice.toLocaleString()}{" "}
                          <span className="text-emerald-800 font-bold">({margin}% faida)</span>
                        </div>
                      </td>

                      {/* 3. Stock Iliyoingizwa (+ IN) */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-black">
                          +{totalEnteredIn} {p.unit}
                        </span>
                      </td>

                      {/* 4. Stock Iliyotoka (Calculated from Sales + Manual) */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 font-black">
                          -{totalOut} {p.unit}
                        </span>
                        <span className="block text-[10px] text-[#5C7250] font-semibold mt-0.5">
                          Mauzo: {totalSoldOut} | Manual: {manualOut}
                        </span>
                      </td>

                      {/* 5. Stock Iliyopo Sasa (Remaining in Store) */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                            isLow
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-[#E1FFAC] text-[#172B08] border border-[#9CE034]"
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                          <span>
                            {currentStock} {p.unit}
                          </span>
                        </span>
                        {isLow && (
                          <span className="block text-[10px] font-bold text-amber-800 mt-0.5">
                            Inakaribia kuisha
                          </span>
                        )}
                      </td>

                      {/* 6. Direct Row Actions: + Ingiza / - Toa / Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openQuickModal("IN", p)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] transition cursor-pointer"
                            title="Ongeza Stock ya bidhaa hii"
                          >
                            + Ingiza
                          </button>
                          <button
                            onClick={() => openQuickModal("OUT", p)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] transition cursor-pointer"
                            title="Toa Stock ya bidhaa hii mwenyewe"
                          >
                            - Toa
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Futa bidhaa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* UNIFIED MODAL FOR STOCK IN (INGIZA STOCK / BIDHAA MPYA) OR STOCK OUT (TOA STOCK MWENYEWE) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black ${
                    movementType === "IN" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                >
                  {movementType === "IN" ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <h3 className="text-base font-black text-[#17270a]">
                  {movementType === "IN"
                    ? "Ingiza Stock Stoo (Stock IN)"
                    : "Toa Stock Stoo Mwenyewe (Stock OUT)"}
                </h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#54684b] mb-4">
              {movementType === "IN"
                ? "Andika jina la bidhaa na idadi inayoingia stoo. Kama bidhaa ni mpya itasajiliwa moja kwa moja."
                : "Andika jina la bidhaa na idadi unayotoa stoo. Mfumo utapunguza stock iliyopo papo hapo."}
            </p>

            <form onSubmit={handleSaveMovement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  Andika Jina la Bidhaa:
                </label>
                <input
                  type="text"
                  list="inventory-products-datalist"
                  required
                  value={movProductName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMovProductName(val);
                    const matched = products.find(
                      (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                    );
                    if (matched) {
                      setMovCategory(matched.category);
                      setMovUnit(matched.unit);
                      setMovBuyingPrice(String(matched.buyingPrice));
                      setMovSellingPrice(String(matched.sellingPrice));
                    }
                  }}
                  placeholder="Andika jina la bidhaa hapa..."
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">
                    {movementType === "IN" ? "Idadi Inayoingia" : "Idadi Inayotoka"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movQuantity}
                    onChange={(e) => setMovQuantity(e.target.value)}
                    placeholder="Mfano: 20"
                    className="w-full py-2 px-3 rounded-xl neu-input font-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Sababu</label>
                  <select
                    value={movReason}
                    onChange={(e) => setMovReason(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input font-semibold"
                  >
                    {movementType === "IN" ? (
                      <>
                        <option value="Mzigo Mpya Ulioingia Stoo">Mzigo Mpya Ulioingia Stoo</option>
                        <option value="Kurudishwa Stoo (Return)">Kurudishwa Stoo (Return)</option>
                        <option value="Marekebisho ya Hesabu">Marekebisho ya Hesabu</option>
                      </>
                    ) : (
                      <>
                        <option value="Imetolewa Stoo Mwenyewe (Manual)">
                          Imetolewa Stoo Mwenyewe (Manual)
                        </option>
                        <option value="Mauzo ya Siku (Imeuzwa)">Mauzo ya Siku (Imeuzwa)</option>
                        <option value="Imeharibika / Imemwagika (Damage)">
                          Imeharibika / Imemwagika (Damage)
                        </option>
                        <option value="Imehamishwa Tawi Jingine">Imehamishwa Tawi Jingine</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">
                    Bei ya Kununua (TZS)
                  </label>
                  <input
                    type="number"
                    value={movBuyingPrice}
                    onChange={(e) => setMovBuyingPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">
                    Bei ya Kuuza (TZS)
                  </label>
                  <input
                    type="number"
                    value={movSellingPrice}
                    onChange={(e) => setMovSellingPrice(e.target.value)}
                    placeholder="22000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  Maelezo ya Ziada (Hiari)
                </label>
                <input
                  type="text"
                  value={movNotes}
                  onChange={(e) => setMovNotes(e.target.value)}
                  placeholder="Mfano: Katoni 2 zimeingia leo..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-black text-white shadow-md ${
                    movementType === "IN"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {movementType === "IN" ? "+ Hifadhi Stock IN" : "- Hifadhi Stock OUT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
