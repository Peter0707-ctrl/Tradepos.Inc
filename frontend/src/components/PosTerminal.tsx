"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  Smartphone,
  PauseCircle,
  RotateCcw,
  Printer,
  CheckCircle2,
  UserPlus,
  Calculator,
  Banknote,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  Delete,
  Check
} from "lucide-react";
import { Product, CartItem } from "@/types";

export const PosTerminal: React.FC = () => {
  const { products, processSale, customers, t } = useApp();
  
  // Mode switcher: "quick_cash" (Njia A - Calculator) vs "catalog" (Full Product Catalog)
  const [posMode, setPosMode] = useState<"quick_cash" | "catalog">("quick_cash");

  // Njia A: Quick Cash Calculator State
  const [quickAmount, setQuickAmount] = useState<string>("0");
  const [quickCategory, setQuickCategory] = useState<string>("Mauzo ya Kawaida");
  const [quickNotes, setQuickNotes] = useState<string>("");
  const [quickTendered, setQuickTendered] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("Walk-in Customer");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MPESA" | "AIRTEL_MONEY" | "MIXX" | "HALOPESA" | "CARD" | "CREDIT"
  >("CASH");
  const [amountPaidInput, setAmountPaidInput] = useState<string>("");
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  // Extract categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // Quick categories presets for Njia A (Kikokotoo cha Mauzo ya Haraka)
  const quickCategories = [
    "Mauzo ya Kawaida",
    "Vinywaji na Soda",
    "Vyakula na Nafaka",
    "Vipodozi na Mafuta",
    "Sabuni na Usafi",
    "Nguo na Viatu",
    "Vifaa na Zana",
    "Mengineyo"
  ];

  // Keypad logic for Njia A
  const handleKeypadPress = (val: string) => {
    if (val === "C") {
      setQuickAmount("0");
      setQuickTendered("");
      return;
    }
    if (val === "BACK") {
      setQuickAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      return;
    }
    setQuickAmount((prev) => {
      if (prev === "0") return val === "00" ? "0" : val;
      return prev + val;
    });
  };

  const handleAddPreset = (amount: number) => {
    setQuickAmount((prev) => {
      const current = parseInt(prev) || 0;
      return (current + amount).toString();
    });
  };

  const quickTotal = parseInt(quickAmount) || 0;
  const parsedQuickTendered = parseFloat(quickTendered) || 0;
  const quickChange = Math.max(0, parsedQuickTendered - quickTotal);

  const handleCompleteQuickCashSale = () => {
    if (quickTotal <= 0) {
      alert("Tafadhali weka kiasi cha mauzo kwanza!");
      return;
    }

    const paid = parsedQuickTendered > 0 ? parsedQuickTendered : quickTotal;
    const sale = processSale({
      branchId: "br-01",
      items: [
        {
          productId: "quick-cash-sale",
          productName: quickCategory + (quickNotes ? ` - ${quickNotes}` : ""),
          quantity: 1,
          price: quickTotal,
          total: quickTotal,
        },
      ],
      subtotal: quickTotal,
      tax: 0,
      discount: 0,
      total: quickTotal,
      paidAmount: paid,
      balance: Math.max(0, quickTotal - paid),
      paymentMethod: "CASH",
      customerName: selectedCustomer !== "Walk-in Customer" ? selectedCustomer : "Mteja wa Dukani",
      customerPhone: customerPhone || undefined,
      cashierName: "Baraka Mushi",
      status: "COMPLETED",
    });

    setCompletedSale(sale);
    setQuickAmount("0");
    setQuickTendered("");
    setQuickNotes("");
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      alert("This item is currently out of stock!");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert(`Cannot exceed available stock of ${product.stockQuantity} units!`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQuantity) {
              alert(`Cannot exceed available stock of ${item.product.stockQuantity} units!`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Subtotal calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.sellingPrice * item.quantity,
    0
  );
  const discountTotal = cart.reduce((acc, item) => acc + item.discount, 0);
  const taxTotal = 0; // standard inclusive VAT
  const total = Math.max(0, subtotal - discountTotal + taxTotal);

  const parsedPaid = parseFloat(amountPaidInput) || (paymentMethod === "CREDIT" ? 0 : total);
  const changeDue = Math.max(0, parsedPaid - total);
  const balanceRemaining = Math.max(0, total - parsedPaid);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const sale = processSale({
      branchId: "br-01",
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        quantity: c.quantity,
        price: c.product.sellingPrice,
        total: c.product.sellingPrice * c.quantity,
      })),
      subtotal,
      tax: taxTotal,
      discount: discountTotal,
      total,
      paidAmount: parsedPaid,
      balance: balanceRemaining,
      paymentMethod,
      customerName: selectedCustomer !== "Walk-in Customer" ? selectedCustomer : undefined,
      cashierName: "Baraka Mushi",
      status: "COMPLETED",
    });

    setCompletedSale(sale);
    setCart([]);
    setAmountPaidInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 lg:p-5 gap-3">
      {/* TOP BAR: Mode Selector (Njia A vs Full Catalog) */}
      <div className="neu-card-flat bg-white/90 p-2.5 rounded-2xl border border-[#cfe2b6] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#E1FFAC] border border-[#a6de4c] flex items-center justify-center text-[#1c300c] shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-[#142607] tracking-tight">
              TradePOS Terminal • Kituo cha Mauzo
            </h2>
            <p className="text-[10px] text-[#55694b]">
              Chagua mtindo unaokufaa: Kikokotoo cha Haraka cha Cash au Orodha Kamili
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 bg-[#EEF4E5] rounded-xl border border-[#d2e4bb] gap-1 w-full sm:w-auto">
          <button
            onClick={() => setPosMode("quick_cash")}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
              posMode === "quick_cash"
                ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
                : "text-[#536749] hover:text-[#182c0b]"
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-[#304f14]" />
            <span>Kikokotoo cha Cash</span>
            <span className="hidden md:inline-block px-1.5 py-0.2 text-[9px] bg-[#E1FFAC] text-[#1c300c] rounded-full font-bold">
              Haraka
            </span>
          </button>

          <button
            onClick={() => setPosMode("catalog")}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
              posMode === "catalog"
                ? "bg-white text-[#182c0b] shadow-neu-flat border border-[#b2e269]"
                : "text-[#536749] hover:text-[#182c0b]"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#304f14]" />
            <span>Orodha & Scanner</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: NJIA A - QUICK CASH CALCULATOR */}
      {posMode === "quick_cash" ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-y-auto">
          {/* LEFT: Numeric Keypad & Quick Presets */}
          <div className="flex-1 neu-card-flat bg-white/95 p-4 sm:p-5 rounded-2xl border border-[#cfe2b6] flex flex-col justify-between shadow-xs">
            <div>
              {/* Category selector */}
              <div className="mb-3">
                <span className="text-[11px] font-bold text-[#4e6245] block mb-1.5">
                  1. Chagua Aina ya Mauzo / Bidhaa:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setQuickCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${
                        quickCategory === cat
                          ? "bg-[#E1FFAC] text-[#1a2f09] border-[#9fd843] shadow-xs"
                          : "bg-white text-[#516548] border-[#d8e8c5] hover:bg-[#F3F8EC]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Numeric Screen Display */}
              <div className="bg-[#142308] text-[#E1FFAC] p-4 sm:p-5 rounded-2xl border border-[#233a0d] shadow-inner mb-3">
                <div className="flex justify-between items-center text-[11px] text-[#9bb77b] font-mono mb-1">
                  <span>KIASI CHA MAUZO (TZS):</span>
                  <span>{quickCategory}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-right text-white">
                  TZS {quickTotal.toLocaleString()}
                </div>
              </div>

              {/* Preset Quick Add Buttons */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-[#55694c] uppercase tracking-wider block mb-1">
                  Ongeza Haraka:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-xs font-black">
                  {[500, 1000, 2000, 5000, 10000, 20000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddPreset(amt)}
                      className="py-1.5 rounded-lg bg-[#F4F8EC] border border-[#d3e5bf] text-[#1b2f0a] hover:bg-[#E1FFAC] transition active:scale-95 text-center font-bold text-[11px]"
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="mb-3">
                <input
                  type="text"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Maelezo ya hiari (Mfano: Soda 3 za baridi, au Unga kg 5)..."
                  className="w-full py-2 px-3 text-xs rounded-xl neu-input font-medium text-[#1c300c]"
                />
              </div>
            </div>

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "00"].map((key) => {
                const isClear = key === "C";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className={`py-3.5 sm:py-4 rounded-xl text-lg font-black transition active:scale-95 shadow-neu-flat border ${
                      isClear
                        ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        : "bg-white text-[#152709] border-[#d2e4bb] hover:bg-[#F3F8EC]"
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Cash Tendered, Chenji (Change) & Kamilisha Mauzo */}
          <div className="w-full lg:w-96 neu-card bg-white p-5 rounded-2xl border-2 border-[#b5ea62] shadow-neu-card flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#dde8d2] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-[#182c0b]">Malipo ya Cash Dukani</h3>
                  <p className="text-[10px] text-[#5b6f52]">Hesabu chenji ya mteja kiotomatiki</p>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-[#E1FFAC] text-xs font-black text-[#1c300c]">
                  Njia A
                </div>
              </div>

              {/* Customer Phone (Optional for WhatsApp) */}
              <div>
                <label className="block text-[11px] font-bold text-[#4a5f42] mb-1">
                  Namba ya Simu ya Mteja (Hiari):
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="07XXXXXXXX (Kwa ajili ya risiti ya WhatsApp)"
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs font-medium text-[#182a0b]"
                />
              </div>

              {/* Cash Given Presets */}
              <div>
                <label className="block text-[11px] font-bold text-[#4a5f42] mb-1.5">
                  2. Pesa Aliyotoa Mteja (Cash Tendered):
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold mb-2">
                  <button
                    type="button"
                    onClick={() => setQuickTendered(quickTotal.toString())}
                    className="py-1.5 px-2 rounded-lg bg-[#E1FFAC] text-[#1c300c] border border-[#a2df43] text-center font-black"
                  >
                    Pesa Kamili
                  </button>
                  {[2000, 5000, 10000, 20000, 50000].map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setQuickTendered(note.toString())}
                      className="py-1.5 px-2 rounded-lg bg-[#F5F8EF] hover:bg-[#E8F1DC] text-[#203410] border border-[#d2e4bb] text-center"
                    >
                      {note.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#627757]">
                    TZS
                  </span>
                  <input
                    type="number"
                    value={quickTendered}
                    onChange={(e) => setQuickTendered(e.target.value)}
                    placeholder={quickTotal > 0 ? quickTotal.toString() : "Weka fedha aliyotoa"}
                    className="w-full py-2.5 pl-12 pr-3 rounded-xl neu-input text-sm font-black text-[#152709]"
                  />
                </div>
              </div>

              {/* Automatic Change Calculation Card */}
              <div className="p-4 rounded-xl border bg-[#F8FAF4] border-[#d3e5bf]">
                <div className="flex justify-between text-xs text-[#526649] mb-1">
                  <span>Jumla ya Mauzo:</span>
                  <span className="font-bold text-[#142607]">TZS {quickTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-[#526649] mb-2">
                  <span>Pesa Aliyotoa Mteja:</span>
                  <span className="font-bold text-[#142607]">
                    TZS {(parsedQuickTendered > 0 ? parsedQuickTendered : quickTotal).toLocaleString()}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-[#d8e7c6] flex items-center justify-between">
                  <span className="text-xs font-black text-[#16290a]">Chenji ya Kurudisha:</span>
                  <span
                    className={`text-base font-black font-mono ${
                      quickChange > 0 ? "text-emerald-700" : "text-[#55694d]"
                    }`}
                  >
                    TZS {quickChange.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCompleteQuickCashSale}
                disabled={quickTotal <= 0}
                className="w-full py-4 rounded-2xl neu-btn text-sm font-black tracking-wide uppercase shadow-neu-flat flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <CheckCircle2 className="w-5 h-5 text-[#20360a]" />
                <span>Kamilisha Mauzo (TZS {quickTotal.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: FULL PRODUCT CATALOG & BARCODE SCANNER (Existing layout) */
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden gap-5">
          {/* LEFT: Product Catalog & Fast Search */}
          <div className="flex-1 flex flex-col h-full neu-card-flat bg-white/70 p-4 border border-[#d3e5b8] overflow-hidden">
            {/* Search Bar & Barcode input */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5e7156]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product name, SKU or barcode (F2)..."
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
                />
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#cbdeb0] text-xs font-semibold text-[#485c3f]">
                <Barcode className="w-4 h-4 text-[#304e14]" />
                <span>Barcode Scanner Active</span>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 text-xs scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                    selectedCategory === cat
                      ? "bg-[#E1FFAC] text-[#1b2f0a] border border-[#aae056] shadow-sm"
                      : "bg-white/80 text-[#4c5f43] border border-[#d4e4c2] hover:bg-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
              {filteredProducts.map((prod) => {
                const isLow = prod.stockQuantity <= prod.minStock;
                return (
                  <div
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="group p-3.5 rounded-xl bg-white border border-[#d6e5c5] hover:border-[#8ed428] hover:shadow-neu-flat transition flex flex-col justify-between cursor-pointer relative"
                  >
                    {isLow && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Low: {prod.stockQuantity}
                      </span>
                    )}
                    <div>
                      <span className="text-[10px] font-semibold text-[#6d8065] uppercase">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#172709] line-clamp-2 mt-0.5 group-hover:text-emerald-800">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] text-[#819478] font-mono mt-1 block">
                        {prod.barcode}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#edf3e6] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-[#192b0b]">
                          TZS {prod.sellingPrice.toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-[#6d8164]">
                          Stock: {prod.stockQuantity} {prod.unit}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-[#E1FFAC] flex items-center justify-center text-[#21350a] group-hover:scale-105 transition shadow-sm">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Active Cart & Checkout Panel */}
          <div className="w-full lg:w-96 flex flex-col h-full neu-card bg-white p-5 border-2 border-[#cbeaa0] shadow-neu-card justify-between">
            <div>
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#dde8d2]">
                <h3 className="font-extrabold text-sm text-[#18290b] flex items-center gap-2">
                  <span>{t.cart}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E1FFAC] text-xs font-black text-[#20360a]">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Customer Selection */}
              <div className="py-2.5">
                <label className="block text-[11px] font-bold text-[#45573e] mb-1">
                  Select Customer / Debt CRM
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg neu-input text-xs font-medium text-[#1c2c0e]"
                >
                  <option value="Walk-in Customer">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.phone}) {c.debtBalance > 0 ? `• Debt: TZS ${c.debtBalance.toLocaleString()}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items list */}
              <div className="overflow-y-auto max-h-56 divide-y divide-[#edf3e6] my-2 pr-1">
                {cart.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#7c8f74]">
                    {t.emptyCart}
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-[#192b0b] truncate">{item.product.name}</h5>
                        <span className="text-[11px] text-[#63775b]">
                          TZS {item.product.sellingPrice.toLocaleString()} × {item.quantity}
                        </span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-md bg-[#EDF2E8] hover:bg-[#DEE7D4] flex items-center justify-center text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-md bg-[#EDF2E8] hover:bg-[#DEE7D4] flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-[#192b0b] w-16 text-right">
                        {(item.product.sellingPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totals & Payments */}
            <div className="pt-3 border-t border-[#dde8d2] space-y-2.5">
              <div className="flex justify-between text-xs text-[#52644a]">
                <span>{t.subtotal}:</span>
                <span className="font-bold">TZS {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-[#172909] pt-1 border-t border-[#e5edd8]">
                <span>{t.totalPayable}:</span>
                <span className="text-base text-emerald-800">TZS {total.toLocaleString()}</span>
              </div>

              {/* Payment Method selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#4c6044] mb-1">
                  Payment Gateway
                </label>
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  {(["CASH", "MPESA", "AIRTEL_MONEY", "CREDIT"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 rounded-lg font-bold border transition ${
                        paymentMethod === method
                          ? "bg-[#E1FFAC] text-[#1c2e0e] border-[#93dc2a] shadow-sm"
                          : "bg-[#F4F7EE] text-[#55694c] border-[#d8e6cb]"
                      }`}
                    >
                      {method === "AIRTEL_MONEY" ? "Airtel" : method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tendered Amount input */}
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  placeholder={`Paid: TZS ${total.toLocaleString()}`}
                  className="flex-1 py-2 px-3 rounded-xl neu-input text-xs font-bold text-[#1a2c0c]"
                />
                {changeDue > 0 && (
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-right">
                    <span className="text-[10px] block text-emerald-800">Change:</span>
                    <span className="text-xs font-black text-emerald-950">
                      TZS {changeDue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3.5 rounded-xl neu-btn text-xs font-extrabold tracking-wide uppercase shadow-neu-flat flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Sale (TZS {total.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED RECEIPT MODAL WITH WHATSAPP RECEIPT */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up">
            <div className="text-center pb-4 border-b border-dashed border-[#ccd9be]">
              <div className="w-12 h-12 rounded-2xl bg-[#E1FFAC] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7 text-[#21350a]" />
              </div>
              <h3 className="font-black text-base text-[#192b0c]">Mauzo Yamekamilika!</h3>
              <p className="text-xs text-[#5f7358]">Risiti No: {completedSale.saleNumber}</p>
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-dashed border-[#ccd9be]">
              {completedSale.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.productName} × {it.quantity}</span>
                  <span className="font-bold">TZS {it.total.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t font-black text-sm text-[#182a0b]">
                <span>Jumla ({completedSale.paymentMethod}):</span>
                <span>TZS {completedSale.total.toLocaleString()}</span>
              </div>
              {completedSale.paidAmount > completedSale.total && (
                <div className="flex justify-between text-xs text-emerald-700 font-bold">
                  <span>Chenji Iliyorudishwa:</span>
                  <span>TZS {(completedSale.paidAmount - completedSale.total).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4">
              {/* WhatsApp Receipt Button */}
              <a
                href={`https://wa.me/${completedSale.customerPhone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(
                  `*TRADEPOS RECEIPT*\nRisiti No: ${completedSale.saleNumber}\nTarehe: ${new Date(completedSale.createdAt).toLocaleString()}\nJumla: TZS ${completedSale.total.toLocaleString()}\nNjia ya Malipo: ${completedSale.paymentMethod}\nAsante kwa kununua nasi!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Tuma Risiti WhatsApp</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Chapisha</span>
                </button>
                <button
                  onClick={() => setCompletedSale(null)}
                  className="flex-1 py-2.5 rounded-xl neu-btn text-xs font-bold"
                >
                  Mauzo Mapya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
