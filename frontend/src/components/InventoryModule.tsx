"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Boxes,
  CheckCircle2,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { Product } from "@/types";

export const InventoryModule: React.FC = () => {
  const { products, addProduct, deleteProduct, stockMovements, recordStockMovement, t } = useApp();
  const [activeTab, setActiveTab] = useState<"catalog" | "movements">("catalog");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");

  // Stock Movement Modal Form State
  const [movProductId, setMovProductId] = useState("");
  const [movQuantity, setMovQuantity] = useState("");
  const [movReason, setMovReason] = useState("Mzigo Mpya (Ununuzi)");
  const [movUnitCost, setMovUnitCost] = useState("");
  const [movNotes, setMovNotes] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [brand, setBrand] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minStock, setMinStock] = useState("10");
  const [maxStock, setMaxStock] = useState("100");
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
  const totalCurrentStockValue = products.reduce((acc, p) => acc + (p.stockQuantity * p.buyingPrice), 0);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMovements = (stockMovements || []).filter(
    (m) =>
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.recordedBy.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(movQuantity);
    if (!movProductId || !qty || qty <= 0) return;

    const prod = products.find((p) => p.id === movProductId);
    if (!prod) return;

    const cost = parseFloat(movUnitCost) || (movementType === "IN" ? prod.buyingPrice : prod.sellingPrice);

    recordStockMovement({
      branchId: "br-01",
      productId: prod.id,
      productName: prod.name,
      type: movementType,
      quantity: qty,
      reason: movReason,
      unitCost: cost,
      totalValue: qty * cost,
      recordedBy: "Baraka Mushi (Admin)",
      notes: movNotes || undefined,
    });

    setIsMovementModalOpen(false);
    setMovQuantity("");
    setMovNotes("");
    setMovUnitCost("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice || !stockQuantity) return;

    const initialQty = parseInt(stockQuantity) || 0;
    const bPrice = parseFloat(buyingPrice) || 0;

    const newProd = addProduct({
      branchId: "br-01",
      name,
      sku: sku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
      barcode: barcode || "600" + Math.floor(1000000000 + Math.random() * 9000000000),
      category,
      brand: brand || "General",
      buyingPrice: bPrice,
      sellingPrice: parseFloat(sellingPrice) || 0,
      wholesalePrice: parseFloat(wholesalePrice) || parseFloat(sellingPrice),
      stockQuantity: initialQty,
      minStock: parseInt(minStock) || 5,
      maxStock: parseInt(maxStock) || 100,
      unit,
    });

    // Also record initial stock movement IN
    if (initialQty > 0) {
      recordStockMovement({
        branchId: "br-01",
        productId: newProd.id,
        productName: newProd.name,
        type: "IN",
        quantity: initialQty,
        reason: "Stock ya Mwanzo (Initial)",
        unitCost: bPrice,
        totalValue: initialQty * bPrice,
        recordedBy: "Baraka Mushi (Admin)",
      });
    }

    setIsAddModalOpen(false);
    setName("");
    setSku("");
    setBarcode("");
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
            <span>Usimamizi wa Stoo & Mzunguko wa Bidhaa</span>
          </h2>
          <p className="text-xs text-[#52654c]">
            Ripoti kamili ya Boss: Fuatilia bidhaa zilizopo, mzigo ulioingia (Stock IN) na uliotoka (Stock OUT).
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
            <span>1. Bidhaa Zilizopo ({products.length})</span>
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
            <span>2. Mzunguko wa Stoo (IN & OUT)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#E1FFAC] text-[9px] font-bold text-[#1a2f0a]">
              Ripoti ya Boss
            </span>
          </button>
        </div>
      </div>

      {/* BOSS SUMMARY CARDS (High Visibility Stock In / Stock Out Overview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#d5e5c3] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-[#63795b] uppercase">Stoo Iliyopo Sasa</span>
            <Boxes className="w-4 h-4 text-[#304d16]" />
          </div>
          <div className="text-lg font-black text-[#172b0a]">
            {totalCurrentStockUnits.toLocaleString()} <span className="text-xs font-normal text-[#657a5d]">Units</span>
          </div>
          <div className="text-[10px] text-[#55694d] mt-0.5">
            Thamani: TZS {totalCurrentStockValue.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
              Mzigo Ulioingia (Stock IN)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-black text-emerald-950">
            +{totalStockInQty.toLocaleString()} <span className="text-xs font-normal text-emerald-800">Units</span>
          </div>
          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
            Thamani: TZS {totalStockInValue.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-rose-800 uppercase flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-rose-700" />
              Mzigo Uliotoka (Stock OUT)
            </span>
            <TrendingDown className="w-4 h-4 text-rose-700" />
          </div>
          <div className="text-lg font-black text-rose-950">
            -{totalStockOutQty.toLocaleString()} <span className="text-xs font-normal text-rose-800">Units</span>
          </div>
          <div className="text-[10px] text-rose-800 font-semibold mt-0.5">
            Thamani: TZS {totalStockOutValue.toLocaleString()} (Mauzo & Uharibifu)
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#d5e5c3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#63795b] uppercase">Rekodi Haraka</span>
            <Package className="w-4 h-4 text-[#304d16]" />
          </div>
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => {
                setMovementType("IN");
                setMovReason("Mzigo Mpya (Ununuzi)");
                setIsMovementModalOpen(true);
              }}
              className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] text-center shadow-xs transition"
            >
              + Stock IN
            </button>
            <button
              onClick={() => {
                setMovementType("OUT");
                setMovReason("Marekebisho / Uharibifu");
                setIsMovementModalOpen(true);
              }}
              className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] text-center shadow-xs transition"
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
                ? "Tafuta jina la bidhaa, SKU, au barcode..."
                : "Tafuta mzigo ulioingia/toka, sababu, au jina la aliyerekodi..."
            }
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>
        {activeTab === "catalog" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-neu-flat shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Sajili Bidhaa Mpya</span>
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
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Kundi</th>
                <th className="py-3 px-4">Bei ya Kununua</th>
                <th className="py-3 px-4">Bei ya Kuuza</th>
                <th className="py-3 px-4">Faida %</th>
                <th className="py-3 px-4">Hali ya Stoo</th>
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
                    <td className="py-3 px-4 font-mono text-[11px] text-[#55694d]">
                      {p.sku} <span className="block text-[#829679]">{p.barcode}</span>
                    </td>
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
              Inarekodi kiotomatiki kila mauzo ya cash yanapofanyika na mzigo mpya unapoingia
            </span>
          </div>

          <table className="w-full text-left text-xs divide-y divide-[#e8f0df]">
            <thead className="bg-[#FAFDF6] font-bold text-[#44573d] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Tarehe & Saa</th>
                <th className="py-3 px-4">Aina ya Mzunguko</th>
                <th className="py-3 px-4">Jina la Bidhaa</th>
                <th className="py-3 px-4">Idadi (Units)</th>
                <th className="py-3 px-4">Sababu / Maelezo</th>
                <th className="py-3 px-4">Thamani (TZS)</th>
                <th className="py-3 px-4">Aliyerekodi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff5e9] text-[#1c2c0e]">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6e8265]">
                    Hakuna rekodi ya mzunguko wa stoo kwa sasa.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isIn = mov.type === "IN";
                  return (
                    <tr key={mov.id} className="hover:bg-[#FAFCF7] transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#55694d]">
                        {new Date(mov.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isIn
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-rose-100 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {isIn ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                              <span>INGIA (IN)</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-rose-700" />
                              <span>TOKA (OUT)</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#142609]">{mov.productName}</td>
                      <td className="py-3 px-4 font-black">
                        <span className={isIn ? "text-emerald-800" : "text-rose-800"}>
                          {isIn ? "+" : "-"}
                          {mov.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{mov.reason}</span>
                        {mov.notes && (
                          <span className="block text-[10px] text-[#718568]">{mov.notes}</span>
                        )}
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
              Sajili Bidhaa Mpya Kwenye Stoo
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">Jina la Bidhaa</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mfano: Sukari ya Bakhresa 1kg"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Itajaza kiotomatiki"
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Skani au acha ijazwe"
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Kundi (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Cosmetics">Cosmetics</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Kipimo (Unit)</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Mfano: Pcs, Box, Kg, Btl"
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
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Idadi ya Mwanzo</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Mfano: 50"
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Kiwango cha Chini</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35482c] mb-1">Kiwango cha Juu</label>
                  <input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
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

      {/* MODAL 2: RECORD STOCK MOVEMENT (IN / OUT) */}
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
                    <span>Rekodi Mzigo Uliotoka (Stock OUT)</span>
                  </>
                )}
              </h3>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#35482c] mb-1">Chagua Bidhaa:</label>
                <select
                  required
                  value={movProductId}
                  onChange={(e) => setMovProductId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input font-medium text-[#16270b]"
                >
                  <option value="">-- Chagua Bidhaa --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stoo Iliyopo: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
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
                        <option value="Marekebisho ya Hesabu">Marekebisho ya Hesabu</option>
                        <option value="Bidhaa Iliyoharibika (Damaged)">Bidhaa Iliyoharibika</option>
                        <option value="Imepita Muda wa Matumizi (Expired)">Imepita Muda (Expired)</option>
                        <option value="Wizi au Upotevu (Theft/Loss)">Wizi au Upotevu</option>
                        <option value="Sampuli / Matumizi ya Dukani">Sampuli ya Dukani</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">
                  Gharama / Thamani kwa Kila Unit (TZS - Hiari):
                </label>
                <input
                  type="number"
                  value={movUnitCost}
                  onChange={(e) => setMovUnitCost(e.target.value)}
                  placeholder="Itatumia bei ya bidhaa kiotomatiki"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#35482c] mb-1">Maelezo ya Ziada (Hiari):</label>
                <input
                  type="text"
                  value={movNotes}
                  onChange={(e) => setMovNotes(e.target.value)}
                  placeholder="Mfano: Risiti namba 849 au imevunjika wakati wa kupakua"
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
