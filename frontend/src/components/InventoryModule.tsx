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
  X,
  CheckCircle2
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

  // Custom bundle sizes per product name (default: 1 Bando = 10 Pcs, just like the user's shoe/bundle example!)
  const [bundleSizes, setBundleSizes] = useState<{ [prodName: string]: number }>({
    "Nivea Nourishing Body Milk 400ml": 10,
    "Maybelline Matte Lip Gloss Velvet": 10,
    "CeraVe Hydrating Facial Cleanser 236ml": 10,
    "Garnier Micellar Cleansing Water 400ml": 10,
  });

  // Unified Stock IN / Stock OUT Modal Form State (User types product name directly)
  const [movProductName, setMovProductName] = useState("");
  const [movQuantity, setMovQuantity] = useState("");
  const [movInputMode, setMovInputMode] = useState<"PCS" | "BUNDLE">("PCS");
  const [movUnitsPerBundle, setMovUnitsPerBundle] = useState("10");
  const [movCategory, setMovCategory] = useState("Bidhaa za Dukani");
  const [movUnit, setMovUnit] = useState("Pcs");
  const [movReason, setMovReason] = useState("Mzigo Mpya Ulioingia Stoo");
  const [movBuyingPrice, setMovBuyingPrice] = useState("");
  const [movSellingPrice, setMovSellingPrice] = useState("");
  const [movNotes, setMovNotes] = useState("");

  const validSales = (sales || []).filter((s) => s.status !== "REFUNDED");

  // Per-product calculation including Smart Bundle/Carton Auto-Reconciliation
  const getProductStockBreakdown = (p: typeof products[0]) => {
    const unitsPerBundle = bundleSizes[p.name] || 10;

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

    const totalEnteredIn = Math.max(recordedIn, p.stockQuantity + totalOut);

    // SMART BUNDLE / CARTON RECONCILIATION (Stoo vs Dukani):
    // How many bundles had to be opened from Store to satisfy totalSoldOut?
    const bundlesOpenedBySales =
      totalSoldOut > 0 ? Math.ceil(totalSoldOut / unitsPerBundle) : 0;

    // How many bundles were manually recorded as taken out from Store?
    const manuallyRecordedBundlesOut = Math.floor(manualOut / unitsPerBundle);

    // If sales crossed into a new bundle (e.g. 10 pcs per bundle, 11 sold -> 2nd bundle opened without manual record)
    const unrecordedBundlesFromStore = Math.max(
      0,
      bundlesOpenedBySales - manuallyRecordedBundlesOut
    );

    // Full unopened bundles remaining in Back Store vs loose pieces in opened bundle at Shop Counter
    const fullBundlesRemainingInStore = Math.floor(p.stockQuantity / unitsPerBundle);
    const loosePiecesInOpenedBundle = p.stockQuantity % unitsPerBundle;
    const totalBundlesEntered = (totalEnteredIn / unitsPerBundle).toFixed(1).replace(/\.0$/, "");

    return {
      unitsPerBundle,
      totalEnteredIn,
      totalBundlesEntered,
      totalSoldOut,
      manualOut,
      totalOut,
      currentStock: p.stockQuantity,
      bundlesOpenedBySales,
      unrecordedBundlesFromStore,
      fullBundlesRemainingInStore,
      loosePiecesInOpenedBundle,
    };
  };

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

  const totalUnrecordedBundlesAlert = allBreakdowns.filter(
    (b) => b.unrecordedBundlesFromStore > 0 && b.totalSoldOut > 0
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
      setMovUnitsPerBundle(String(bundleSizes[prefillProduct.name] || 10));
    } else {
      setMovProductName("");
      setMovCategory("Bidhaa za Dukani");
      setMovUnit("Pcs");
      setMovBuyingPrice("");
      setMovSellingPrice("");
      setMovUnitsPerBundle("10");
    }
    setMovInputMode("PCS");
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
    const rawQty = parseInt(movQuantity);
    const uPerBundle = Math.max(1, parseInt(movUnitsPerBundle) || 10);
    if (!cleanName || !rawQty || rawQty <= 0) return;

    // Save bundle size for this product
    setBundleSizes((prev) => ({
      ...prev,
      [cleanName]: uPerBundle,
    }));

    // If user entered in BANDO mode, convert Bando -> Pcs automatically
    const finalQtyInPcs = movInputMode === "BUNDLE" ? rawQty * uPerBundle : rawQty;

    const existingProd = products.find((p) => p.name.toLowerCase() === cleanName.toLowerCase());
    const enteredCost = parseFloat(movBuyingPrice) || (existingProd ? existingProd.buyingPrice : 0);
    const enteredSell =
      parseFloat(movSellingPrice) ||
      (existingProd ? existingProd.sellingPrice : Math.round(enteredCost * 1.3));

    if (existingProd) {
      if (movementType === "OUT" && movReason === "Mauzo ya Siku (Imeuzwa)") {
        const salePrice = enteredSell > 0 ? enteredSell : existingProd.sellingPrice;
        processSale({
          branchId: currentBranch?.id || "br-01",
          items: [
            {
              productId: existingProd.id,
              productName: existingProd.name,
              quantity: finalQtyInPcs,
              price: salePrice,
              total: finalQtyInPcs * salePrice,
            },
          ],
          subtotal: finalQtyInPcs * salePrice,
          tax: 0,
          discount: 0,
          total: finalQtyInPcs * salePrice,
          paidAmount: finalQtyInPcs * salePrice,
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
          quantity: finalQtyInPcs,
          reason: movReason,
          unitCost: cost,
          totalValue: finalQtyInPcs * cost,
          recordedBy: user?.name || "Baraka Mushi",
          notes:
            movNotes ||
            (movInputMode === "BUNDLE"
              ? `Bando ${rawQty} (×${uPerBundle} pcs = ${finalQtyInPcs} pcs)`
              : undefined),
        });
      }
    } else {
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
        minStock: uPerBundle,
        maxStock: 500,
        unit: movUnit.trim() || "Pcs",
      });

      if (newProd) {
        recordStockMovement({
          branchId: currentBranch?.id || "br-01",
          productId: newProd.id,
          productName: newProd.name,
          type: movementType,
          quantity: finalQtyInPcs,
          reason: movReason,
          unitCost: enteredCost,
          totalValue: finalQtyInPcs * enteredCost,
          recordedBy: user?.name || "Baraka Mushi",
          notes:
            movNotes ||
            `Bidhaa mpya (${movInputMode === "BUNDLE" ? `Bando ${rawQty}` : `${finalQtyInPcs} pcs`})`,
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
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Datalist for optional autocomplete when typing product name */}
      <datalist id="inventory-products-datalist">
        {products.map((p) => (
          <option key={p.id} value={p.name}>
            Stoo Iliyopo: {p.stockQuantity} {p.unit} | Bei: TZS {p.sellingPrice.toLocaleString()}
          </option>
        ))}
      </datalist>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#172709] tracking-tight">
            {language === "sw"
              ? "4. Stoo & Bidhaa: Kuweka/Kutoa Stock & Hesabu ya Bando za Stoo"
              : "4. Store Stock: In/Out & Automatic Bundle Reconciliation"}
          </h2>
          <p className="text-xs text-[#52654c]">
            {language === "sw"
              ? "Mfumo unahesabu stock kwa Vipande na kwa Bando/Katoni. Kama bando imefunguliwa stoo bila kuandikwa, mfumo unagundua moja kwa moja kupitia mauzo!"
              : "Tracks both units and bundles. Automatically detects when a store bundle is opened via sales even if not manually recorded."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openQuickModal("IN")}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Weka Stock Stoo (Bando / Pcs)</span>
          </button>

          <button
            onClick={() => openQuickModal("OUT")}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Toa Stock Stoo Mwenyewe</span>
          </button>
        </div>
      </div>

      {/* SMART BUNDLE / CARTON RECONCILIATION BANNER (Explains & Alerts when Sales Open a Store Bundle Automatically) */}
      <div className="p-3.5 rounded-2xl bg-[#F6FAF0] border-2 border-[#BFE973] flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="font-black text-[#162709] uppercase flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-[#3A6112]" />
            <span>Ukaguzi wa Bando za Stoo vs Mauzo ya Dukani (Auto-Detection):</span>
          </span>
          <p className="text-[#4B613F]">
            Mfano Bando 1 ina vipande/viatu <strong>10</strong>. Kama dukani kulikuwa na bando zikaisha na mfanyakazi akafungua bando nyingine kutoka stoo bila kuandika (mfano akauza kipande cha <strong>11</strong>), mfumo unapiga hesabu moja kwa moja na kuonyesha kuwa <strong>Bando imetoka Stoo</strong> na kupunguza stoo!
          </p>
        </div>

        {totalUnrecordedBundlesAlert.length > 0 && (
          <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 shrink-0 font-bold">
            ! Bidhaa {totalUnrecordedBundlesAlert.length} zimefunguliwa Bando kutoka Stoo kupitia Mauzo (imekaguliwa auto)
          </div>
        )}
      </div>

      {/* 3 UNIFIED SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="neu-card-flat p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 uppercase">
              1. Stock Iliyoingizwa Stoo (+ IN)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl font-black text-emerald-950 mt-1">
            +{totalStockInQty} <span className="text-xs font-bold">Vipande</span>
          </p>
          <span className="text-[11px] font-semibold text-emerald-800">
            {!user || user.role === "OWNER" || user.role === "SUPER_ADMIN"
              ? `Thamani ya Mtaji (Boss): TZS ${totalStockInValue.toLocaleString()}`
              : `Aina ${products.length} za bidhaa zilizopo stoo`}
          </span>
        </div>

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
            Mauzo: {totalSoldOutQty} pcs | Iliyotolewa Mkononi: {totalManualOutQty} pcs
          </span>
        </div>

        <div className="neu-card-flat p-3.5 rounded-2xl border-2 border-[#b2e269] bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#172709] uppercase">
              3. Stock Iliyobaki Sasa (Bando & Pcs)
            </span>
            <Boxes className="w-4 h-4 text-[#253f0e]" />
          </div>
          <p className="text-xl font-black text-[#152508] mt-1">
            {totalCurrentStockUnits} <span className="text-xs font-bold text-[#52654c]">Vipande</span>
          </p>
          <span className="text-[11px] font-semibold text-[#42553a]">
            Iliyoingizwa ({totalStockInQty}) - Iliyotoka ({totalStockOutQty}) ={" "}
            <strong>{totalCurrentStockUnits} pcs</strong>
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

      {/* UNIFIED STORE TABLE WITH SMART BUNDLE / CARTON RECONCILIATION */}
      <div className="flex-1 overflow-x-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
        <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
          <thead className="bg-[#F8FAF4] font-bold text-[#44573d]">
            <tr>
              <th className="py-3 px-4">Bidhaa & Kipimo cha Bando</th>
              <th className="py-3 px-4">
                {!user || user.role === "OWNER" || user.role === "SUPER_ADMIN"
                  ? "Bei (Kununua / Kuuza)"
                  : "Bei ya Kuuza"}
              </th>
              <th className="py-3 px-4 text-center">Iliyoingizwa (+ IN)</th>
              <th className="py-3 px-4 text-center">Iliyotoka (Mauzo & Manual)</th>
              <th className="py-3 px-4">Ukaguzi wa Bando (Stoo vs Mauzo)</th>
              <th className="py-3 px-4 text-center">Stock Iliyobaki Sasa</th>
              <th className="py-3 px-4 text-right">Weka / Toa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
            {filteredBreakdowns.map(
              ({
                product: p,
                unitsPerBundle,
                totalEnteredIn,
                totalBundlesEntered,
                totalSoldOut,
                manualOut,
                totalOut,
                currentStock,
                bundlesOpenedBySales,
                unrecordedBundlesFromStore,
                fullBundlesRemainingInStore,
                loosePiecesInOpenedBundle,
              }) => {
                const isLow = currentStock <= p.minStock;
                const isOwnerView = !user || user.role === "OWNER" || user.role === "SUPER_ADMIN";
                return (
                  <tr key={p.id} className="hover:bg-[#FAFCF7] transition">
                    {/* 1. Product Name & Bundle Size */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#162709] block">{p.name}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[#EDF3E6] text-[#263E12] font-bold text-[10px]">
                        Bando 1 = {unitsPerBundle} {p.unit}
                      </span>
                    </td>

                    {/* 2. Prices (Buying Price hidden from Sellers for Boss Privacy) */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#162709]">
                        Kuuza: TZS {p.sellingPrice.toLocaleString()}
                      </div>
                      {isOwnerView && (
                        <div className="text-[11px] text-[#5B714F]">
                          Kununua (Boss): TZS {p.buyingPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* 3. Stock IN (Pcs & Bundles) */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-black">
                        +{totalEnteredIn} {p.unit}
                      </span>
                      <span className="block text-[10px] text-emerald-800 font-bold mt-0.5">
                        (Bando {totalBundlesEntered})
                      </span>
                    </td>

                    {/* 4. Stock OUT (Sales + Manual) */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 font-black">
                        -{totalOut} {p.unit}
                      </span>
                      <span className="block text-[10px] text-[#5C7250] font-semibold mt-0.5">
                        Mauzo: {totalSoldOut} | Manual: {manualOut}
                      </span>
                    </td>

                    {/* 5. Smart Bundle Auto-Reconciliation */}
                    <td className="py-3 px-4 max-w-[250px]">
                      {unrecordedBundlesFromStore > 0 && totalSoldOut > 0 ? (
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-950">
                          <span className="font-black block">
                            ! Bando {unrecordedBundlesFromStore} imefunguliwa Stoo (Auto)
                          </span>
                          <span className="text-[10px] block text-amber-900">
                            Mauzo ({totalSoldOut} {p.unit}) yamefungua Bando {bundlesOpenedBySales} bila kuandikwa manual. Stoo imepunguzwa auto!
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#4A613E] font-semibold">
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hesabu ya Bando iko sawa
                          </span>
                          <span className="text-[10px] text-[#637B56] block">
                            Bando zilizofunguliwa kwa mauzo: {bundlesOpenedBySales}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 6. Remaining Stock (Full Bundles in Store + Loose in Shop) */}
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
                      <span className="block text-[10px] font-bold text-[#3D542E] mt-1">
                        Stoo: <strong>Bando {fullBundlesRemainingInStore}</strong>
                        {loosePiecesInOpenedBundle > 0
                          ? ` + Dukani: ${loosePiecesInOpenedBundle} ${p.unit}`
                          : ""}
                      </span>
                    </td>

                    {/* 7. Quick Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openQuickModal("IN", p)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] transition cursor-pointer"
                        >
                          + Weka
                        </button>
                        <button
                          onClick={() => openQuickModal("OUT", p)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] transition cursor-pointer"
                        >
                          - Toa
                        </button>
                        {isOwnerView && (
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FOR STOCK IN / STOCK OUT (SUPPORTS BOTH BANDO & PCS) */}
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
                    ? "Weka Stock Stoo (Kwa Bando au Vipande)"
                    : "Toa Stock Stoo Mwenyewe (Bando au Vipande)"}
                </h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3 text-xs mt-3">
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
                      setMovUnitsPerBundle(String(bundleSizes[matched.name] || 10));
                    }
                  }}
                  placeholder="Mfano: Viatu vya Ngozi au Nivea..."
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
                />
              </div>

              {/* Choose whether entering by Bando/Carton or Individual Pieces */}
              <div className="p-2.5 rounded-xl bg-[#F4F8EC] border border-[#C6DDA8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#253C12]">Unaingiza/Kutoa kwa:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setMovInputMode("BUNDLE")}
                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] cursor-pointer ${
                        movInputMode === "BUNDLE"
                          ? "bg-[#1C320A] text-[#E1FFAC]"
                          : "bg-white text-[#35482c] border border-[#C6DDA8]"
                      }`}
                    >
                      Kwa Bando / Katoni
                    </button>
                    <button
                      type="button"
                      onClick={() => setMovInputMode("PCS")}
                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] cursor-pointer ${
                        movInputMode === "PCS"
                          ? "bg-[#1C320A] text-[#E1FFAC]"
                          : "bg-white text-[#35482c] border border-[#C6DDA8]"
                      }`}
                    >
                      Kwa Vipande (Pcs)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-[#35482c] mb-1">
                      {movInputMode === "BUNDLE" ? "Idadi ya Bando" : "Idadi ya Vipande (Pcs)"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={movQuantity}
                      onChange={(e) => setMovQuantity(e.target.value)}
                      placeholder={movInputMode === "BUNDLE" ? "Mfano: 10 (Bando)" : "Mfano: 20"}
                      className="w-full py-2 px-3 rounded-xl neu-input font-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#35482c] mb-1">
                      Bando 1 Ina Vipande Ngapi?
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={movUnitsPerBundle}
                      onChange={(e) => setMovUnitsPerBundle(e.target.value)}
                      placeholder="10"
                      className="w-full py-2 px-3 rounded-xl neu-input font-black"
                    />
                  </div>
                </div>

                {movQuantity && (
                  <span className="block text-[11px] font-bold text-emerald-800">
                    Hesabu ya Mfumo:{" "}
                    {movInputMode === "BUNDLE"
                      ? `Bando ${movQuantity} × ${movUnitsPerBundle || 10} = Vipande ${
                          (parseInt(movQuantity) || 0) * (parseInt(movUnitsPerBundle) || 10)
                        } (Pcs)`
                      : `Vipande ${movQuantity} (Sawa na Bando ${(
                          (parseInt(movQuantity) || 0) /
                          Math.max(1, parseInt(movUnitsPerBundle) || 10)
                        ).toFixed(1)})`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(!user || user.role === "OWNER" || user.role === "SUPER_ADMIN") && (
                  <div>
                    <label className="block font-bold text-[#35482c] mb-1">
                      Bei ya Kununua 1 Pc (TZS)
                    </label>
                    <input
                      type="number"
                      value={movBuyingPrice}
                      onChange={(e) => setMovBuyingPrice(e.target.value)}
                      placeholder="15000"
                      className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                    />
                  </div>
                )}
                <div className={!user || user.role === "OWNER" || user.role === "SUPER_ADMIN" ? "" : "col-span-2"}>
                  <label className="block font-bold text-[#35482c] mb-1">
                    Bei ya Kuuza 1 Pc (TZS)
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
                    </>
                  ) : (
                    <>
                      <option value="Imetolewa Stoo Kwenda Dukani">
                        Imetolewa Stoo Kwenda Dukani
                      </option>
                      <option value="Mauzo ya Siku (Imeuzwa)">Mauzo ya Siku (Imeuzwa)</option>
                      <option value="Imeharibika (Damage)">Imeharibika (Damage)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-black text-white shadow-md cursor-pointer ${
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
