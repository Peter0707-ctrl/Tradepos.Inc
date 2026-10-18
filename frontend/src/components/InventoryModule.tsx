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
  History,
  Boxes,
  TrendingDown,
  TrendingUp
} from "lucide-react";

export const InventoryModule: React.FC = () => {
  const {
    user,
    currentBranch,
    products,
    addProduct,
    deleteProduct,
    stockMovements,
    recordStockMovement,
    processSale,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"catalog" | "movements">("catalog");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");

  // Stock Movement Modal Form State (User types product name directly)
  const [movProductName, setMovProductName] = useState("");
  const [movQuantity, setMovQuantity] = useState("");
  const [movReason, setMovReason] = useState("Mzigo Mpya (Ununuzi)");
  const [movUnitCost, setMovUnitCost] = useState("");
  const [movSellingPrice, setMovSellingPrice] = useState("");
  const [movNotes, setMovNotes] = useState("");

  // New Product Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Bidhaa za Dukani");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minStock, setMinStock] = useState("10");
  const [unit, setUnit] = useState("Pcs");

  // Stock IN / OUT Calculations for Boss Overview
  const totalStockInQty = (stockMovements || [])
    .filter((m) => m.type === "IN")
    .reduce((acc, m) => acc + m.quantity, 0);

  const totalStockInValue = (stockMovements || [])
    .filter((m) => m.type === "IN")
    .reduce((acc, m) => acc + m.totalValue, 0);

  const totalStockOutQty = (stockMovements || [])
    .filter((m) => m.type === "OUT")
    .reduce((acc, m) => acc + m.quantity, 0);

  const totalStockOutValue = (stockMovements || [])
    .filter((m) => m.type === "OUT")
    .reduce((acc, m) => acc + m.totalValue, 0);

  const totalCurrentStockUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalCurrentStockValue = products.reduce((acc, p) => acc + p.stockQuantity * p.buyingPrice, 0);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMovements = (stockMovements || []).filter(
    (m) =>
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.recordedBy.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = movProductName.trim();
    const qty = parseInt(movQuantity);
    if (!cleanName || !qty || qty <= 0) return;

    const existingProd = products.find((p) => p.name.toLowerCase() === cleanName.toLowerCase());
    const enteredCost = parseFloat(movUnitCost) || (existingProd ? existingProd.buyingPrice : 0);
    const enteredSell =
      parseFloat(movSellingPrice) || (existingProd ? existingProd.sellingPrice : enteredCost);

    if (existingProd) {
      // If Stock OUT is a direct sale, record the sale as well
      if (movementType === "OUT" && movReason === "Mauzo ya Siku (Imeuzwa)") {
        const salePrice = parseFloat(movUnitCost) || existingProd.sellingPrice;
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
        const cost =
          parseFloat(movUnitCost) ||
          (movementType === "IN" ? existingProd.buyingPrice : existingProd.sellingPrice);
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
        category: "Bidhaa za Dukani",
        brand: "General",
        buyingPrice: enteredCost,
        sellingPrice: enteredSell > 0 ? enteredSell : enteredCost,
        wholesalePrice: enteredSell > 0 ? enteredSell : enteredCost,
        stockQuantity: movementType === "IN" ? qty : 0,
        minStock: 5,
        maxStock: 200,
        unit: "Pcs",
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
          notes: movNotes || undefined,
        });
      }
    }

    setIsMovementModalOpen(false);
    setMovProductName("");
    setMovQuantity("");
    setMovNotes("");
    setMovUnitCost("");
    setMovSellingPrice("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sellingPrice || !stockQuantity) return;

    const initialQty = parseInt(stockQuantity) || 0;
    const bPrice = parseFloat(buyingPrice) || 0;
    const sPrice = parseFloat(sellingPrice) || 0;

    const newProd = addProduct({
      branchId: currentBranch?.id || "br-01",
      name: name.trim(),
      sku: "ITEM-" + Math.floor(1000 + Math.random() * 9000),
      barcode: "",
      category,
      brand: "General",
      buyingPrice: bPrice,
      sellingPrice: sPrice,
      wholesalePrice: sPrice,
      stockQuantity: initialQty,
      minStock: parseInt(minStock) || 5,
      maxStock: 200,
      unit,
    });

    if (initialQty > 0 && newProd) {
      recordStockMovement({
        branchId: currentBranch?.id || "br-01",
        productId: newProd.id,
        productName: newProd.name,
        type: "IN",
        quantity: initialQty,
        reason: "Stock ya Mwanzo (Initial)",
        unitCost: bPrice,
        totalValue: initialQty * bPrice,
        recordedBy: user?.name || "Baraka Mushi",
      });
    }

    setIsAddModalOpen(false);
    setName("");
    setBuyingPrice("");
    setSellingPrice("");
    setStockQuantity("");
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden gap-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#172709] tracking-tight flex items-center gap-2">
            <span>
              {language === "sw"
                ? "Usimamizi wa Stoo & Mzunguko wa Bidhaa"
                : "Inventory & Stock Movements"}
            </span>
          </h2>
          <p className="text-xs text-[#52654c]">
            {language === "sw"
              ? "Andika bidhaa inayoingia stoo (Stock IN), inayotoka/kuuzwa (Stock OUT), na uone stoo iliyobaki."
              : "Enter incoming stock (Stock IN), outgoing/sold items (Stock OUT), and view remaining stock."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-[#EEF4E5] rounded-xl border border-[#d2e4bb] gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
              activeTab === "catalog"
                ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
                : "text-[#536749] hover:text-[#182c0b]"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>
              {language === "sw"
                ? `1. Bidhaa Zilizopo Stoo (${products.length})`
                : `1. In-Stock Items (${products.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("movements")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
              activeTab === "movements"
                ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
                : "text-[#536749] hover:text-[#182c0b]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>
              {language === "sw"
                ? "2. Mzunguko wa Stoo (IN & OUT)"
                : "2. Stock Ledger (IN & OUT)"}
            </span>
          </button>
        </div>
      </div>

      {/* BOSS SUMMARY BANNER: STOCK IN vs STOCK OUT vs CURRENT STOCK */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="neu-card-flat p-3.5 rounded-2xl border border-[#d5e4c6]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#52654c] uppercase">Stoo Iliyobaki Sasa</span>
            <Boxes className="w-4 h-4 text-[#253f0e]" />
          </div>
          <p className="text-xl font-black text-[#152508] mt-1">
            {totalCurrentStockUnits} <span className="text-xs font-bold text-[#52654c]">Vipande</span>
          </p>
          <span className="text-[11px] font-semibold text-[#42553a]">
            Thamani: TZS {totalCurrentStockValue.toLocaleString()}
          </span>
        </div>

        <div className="neu-card-flat p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase">
              Mzigo Ulioingia (Stock IN)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl font-black text-emerald-900 mt-1">
            +{totalStockInQty} <span className="text-xs font-bold">Units</span>
          </p>
          <span className="text-[11px] font-semibold text-emerald-700">
            Thamani: TZS {totalStockInValue.toLocaleString()}
          </span>
        </div>

        <div className="neu-card-flat p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase">
              Mzigo Uliotoka (Stock OUT)
            </span>
            <TrendingDown className="w-4 h-4 text-rose-700" />
          </div>
          <p className="text-xl font-black text-rose-900 mt-1">
            -{totalStockOutQty} <span className="text-xs font-bold">Units</span>
          </p>
          <span className="text-[11px] font-semibold text-rose-700">
            Thamani: TZS {totalStockOutValue.toLocaleString()} (Mauzo & Uharibifu)
          </span>
        </div>

        <div className="neu-card-flat p-3.5 rounded-2xl border border-[#d5e4c6] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#52654c] uppercase">Rekodi Haraka</span>
            <Package className="w-4 h-4 text-[#304d16]" />
          </div>
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => {
                setMovementType("IN");
                setMovReason("Mzigo Mpya (Ununuzi)");
                setIsMovementModalOpen(true);
              }}
              className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] text-center shadow-xs transition cursor-pointer"
            >
              + Stock IN
            </button>
            <button
              onClick={() => {
                setMovementType("OUT");
                setMovReason("Mauzo ya Siku (Imeuzwa)");
                setIsMovementModalOpen(true);
              }}
              className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] text-center shadow-xs transition cursor-pointer"
            >
              - Stock OUT
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65795e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "catalog"
                ? "Tafuta jina la bidhaa au kundi..."
                : "Tafuta mzigo ulioingia/toka, sababu, au jina la aliyerekodi..."
            }
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>
        {activeTab === "catalog" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-neu-flat shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingiza Bidhaa Mpya</span>
          </button>
        )}
      </div>

      {/* TAB 1: PRODUCT CATALOG TABLE */}
      {activeTab === "catalog" ? (
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card">
          <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
            <thead className="bg-[#F8FAF4] font-bold text-[#44573d] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Jina la Bidhaa</th>
                <th className="py-3 px-4">Kundi</th>
                <th className="py-3 px-4">Bei ya Kununua</th>
                <th className="py-3 px-4">Bei ya Kuuza</th>
                <th className="py-3 px-4">Faida %</th>
                <th className="py-3 px-4">Stock Iliyobaki Stoo</th>
                <th className="py-3 px-4 text-right">Hatua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
              {filtered.map((p) => {
                const isLow = p.stockQuantity <= p.minStock;
                const margin =
                  p.sellingPrice > 0
                    ? Math.round(((p.sellingPrice - p.buyingPrice) / p.sellingPrice) * 100)
                    : 0;
                return (
                  <tr key={p.id} className="hover:bg-[#FAFCF7] transition">
                    <td className="py-3 px-4 font-bold">{p.name}</td>
                    <td className="py-3 px-4">{p.category}</td>
                    <td className="py-3 px-4">TZS {p.buyingPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold">TZS {p.sellingPrice.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-800">{margin}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isLow
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                        <span>
                          {p.stockQuantity} {p.unit}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* TAB 2: STOCK MOVEMENT LEDGER (Vitu vilivyoingia & vilivyotoka) */
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#dce8cd] shadow-neu-card flex flex-col">
          <div className="p-3 bg-[#F8FAF4] border-b border-[#e3edd7] flex items-center justify-between text-xs">
            <span className="font-bold text-[#354a2a]">
              Daftari Rasmi la Mzunguko wa Mzigo ({filteredMovements.length} rekodi)
            </span>
            <span className="text-[11px] text-[#5b7151]">
              Inarekodi kila mzigo ulioingia stoo na uliotoka au kuuzwa
            </span>
          </div>

          <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
            <thead className="bg-[#FAFDF6] font-bold text-[#44573d] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Tarehe & Saa</th>
                <th className="py-3 px-4">Bidhaa / Maelezo</th>
                <th className="py-3 px-4">Mwelekeo</th>
                <th className="py-3 px-4">Sababu</th>
                <th className="py-3 px-4">Idadi</th>
                <th className="py-3 px-4">Thamani (TZS)</th>
                <th className="py-3 px-4">Aliyerekodi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Hakuna rekodi za mzunguko wa stoo zilizopatikana.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isIn = mov.type === "IN";
                  return (
                    <tr key={mov.id} className="hover:bg-[#FAFCF7] transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#55694d]">
                        {new Date(mov.createdAt).toLocaleDateString()}{" "}
                        {new Date(mov.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold block text-[#18280b]">{mov.productName}</span>
                        {mov.notes && (
                          <span className="text-[10px] text-[#697e5e] block">{mov.notes}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isIn
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-rose-100 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {isIn ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span>{isIn ? "STOCK IN (INGIA)" : "STOCK OUT (TOKA)"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#3f5335]">{mov.reason}</td>
                      <td
                        className={`py-3 px-4 font-black ${
                          isIn ? "text-emerald-800" : "text-rose-800"
                        }`}
                      >
                        {isIn ? `+${mov.quantity}` : `-${mov.quantity}`}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        TZS {mov.totalValue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[#54684b] text-[11px]">{mov.recordedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-[#17270a] mb-4">
              Ingiza Bidhaa Mpya Kwenye Stoo
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">Andika Jina la Bidhaa</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mfano: Sukari ya Bakhresa 1kg au Mafuta ya Kupikia"
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Kundi la Bidhaa</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Mfano: Vipodozi, Vyakula, Vifaa"
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Kipimo (Unit)</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Mfano: Pcs, Katoni, Kg, Chupa"
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Bei ya Kununua (TZS)</label>
                  <input
                    type="number"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.value)}
                    placeholder="Mfano: 15000"
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Bei ya Kuuza (TZS)</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="Mfano: 20000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Idadi Iliyoingia Stoo</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Mfano: 50"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Kiwango cha Tahadhari (Min)</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold shadow-sm"
                >
                  Hifadhi Bidhaa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD STOCK MOVEMENT (IN / OUT) - USER TYPES PRODUCT NAME DIRECTLY */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b8ea66] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1ebd4] mb-3">
              <h3 className="text-base font-black text-[#17270a] flex items-center gap-2">
                {movementType === "IN" ? (
                  <>
                    <ArrowDownLeft className="w-5 h-5 text-emerald-700" />
                    <span>Rekodi Mzigo Ulioingia (Stock IN)</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-rose-700" />
                    <span>Rekodi Mzigo Uliotoka / Kuuzwa (Stock OUT)</span>
                  </>
                )}
              </h3>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  Andika Jina la Bidhaa:
                </label>
                <input
                  type="text"
                  required
                  list="store-products-list"
                  value={movProductName}
                  onChange={(e) => setMovProductName(e.target.value)}
                  placeholder="Andika jina la bidhaa mwenyewe..."
                  className="w-full py-2.5 px-3 rounded-xl neu-input font-bold text-[#16270b]"
                />
                <datalist id="store-products-list">
                  {products.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Idadi (Units):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={movQuantity}
                    onChange={(e) => setMovQuantity(e.target.value)}
                    placeholder="Mfano: 20"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Sababu:</label>
                  <select
                    value={movReason}
                    onChange={(e) => setMovReason(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  >
                    {movementType === "IN" ? (
                      <>
                        <option value="Mzigo Mpya (Ununuzi)">Mzigo Mpya (Ununuzi)</option>
                        <option value="Marekebisho ya Hesabu">Marekebisho ya Hesabu</option>
                        <option value="Bidhaa Iliyorudishwa (Return)">Bidhaa Iliyorudishwa</option>
                      </>
                    ) : (
                      <>
                        <option value="Mauzo ya Siku (Imeuzwa)">Mauzo ya Siku (Imeuzwa)</option>
                        <option value="Bidhaa Iliyoharibika (Damaged)">Bidhaa Iliyoharibika</option>
                        <option value="Imepita Muda wa Matumizi (Expired)">Imepita Muda (Expired)</option>
                        <option value="Marekebisho ya Hesabu">Marekebisho ya Hesabu</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {movementType === "IN" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#35482c] mb-1">
                      Bei ya Kununulia (TZS):
                    </label>
                    <input
                      type="number"
                      value={movUnitCost}
                      onChange={(e) => setMovUnitCost(e.target.value)}
                      placeholder="Mfano: 15000"
                      className="w-full py-2 px-3 rounded-xl neu-input"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#35482c] mb-1">
                      Bei ya Kuuza (TZS):
                    </label>
                    <input
                      type="number"
                      value={movSellingPrice}
                      onChange={(e) => setMovSellingPrice(e.target.value)}
                      placeholder="Mfano: 20000"
                      className="w-full py-2 px-3 rounded-xl neu-input"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">
                    Bei ya Kila Unit (TZS - Hiari):
                  </label>
                  <input
                    type="number"
                    value={movUnitCost}
                    onChange={(e) => setMovUnitCost(e.target.value)}
                    placeholder="Mfano: 20000"
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Maelezo ya Ziada (Hiari):</label>
                <input
                  type="text"
                  value={movNotes}
                  onChange={(e) => setMovNotes(e.target.value)}
                  placeholder="Mfano: Mzigo mpya kutoka Kariakoo"
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
                  className={`flex-1 py-2.5 rounded-xl font-black text-white shadow-sm ${
                    movementType === "IN"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Thibitisha {movementType === "IN" ? "Stock IN" : "Stock OUT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
