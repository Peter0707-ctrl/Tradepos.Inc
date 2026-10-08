"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  AlertTriangle,
  MessageCircle,
  Package,
  Search,
  Check,
  XCircle,
  RotateCcw
} from "lucide-react";
import { OnlineOrder } from "@/types";

export const OnlineStoreDeliveriesModule: React.FC = () => {
  const {
    products,
    onlineOrders,
    createOnlineOrder,
    updateOrderStatus,
    updateDeliveryDetails,
    user
  } = useApp();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueModalOrder, setIssueModalOrder] = useState<OnlineOrder | null>(null);
  const [issueReason, setIssueReason] = useState("");

  // Form State for New Delivery
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [customItemDesc, setCustomItemDesc] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [totalAmount, setTotalAmount] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("3000");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [packedBy, setPackedBy] = useState(user?.name || "Baraka Mushi (Cashier)");

  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      setCustomItemDesc(prod.name);
      const qty = parseInt(quantity) || 1;
      setTotalAmount((prod.sellingPrice * qty).toString());
    }
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) {
      alert("Tafadhali jaza taarifa za mteja (Jina, Simu, na Eneo)!");
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    const itemName = prod ? prod.name : customItemDesc || "Vifurushi vya Dukani";
    const qty = parseInt(quantity) || 1;
    const price = parseFloat(totalAmount) || (prod ? prod.sellingPrice * qty : 0);

    createOnlineOrder({
      customerName,
      phone,
      address,
      items: [{ productName: itemName, quantity: qty, price: price / qty }],
      total: price,
      deliveryFee: parseFloat(deliveryFee) || 0,
      driverName: driverName || undefined,
      driverPhone: driverPhone || undefined,
      packedBy: packedBy || user?.name || "Mhudumu wa Dukani",
      status: driverName ? "OUT_FOR_DELIVERY" : "PACKED",
    });

    setIsModalOpen(false);
    setCustomerName("");
    setPhone("");
    setAddress("");
    setSelectedProductId("");
    setCustomItemDesc("");
    setTotalAmount("");
    setDriverName("");
    setDriverPhone("");
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalOrder || !issueReason) return;

    updateOrderStatus(issueModalOrder.id, "CANCELLED");
    updateDeliveryDetails(issueModalOrder.id, { issueNotes: issueReason });
    setIssueModalOrder(null);
    setIssueReason("");
  };

  // Filtered orders
  const filteredOrders = onlineOrders.filter((ord) => {
    const matchesSearch =
      ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
      ord.phone.includes(search) ||
      ord.address.toLowerCase().includes(search.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (ord.driverName && ord.driverName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      filterStatus === "ALL" || ord.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalCount = onlineOrders.length;
  const pendingCount = onlineOrders.filter((o) => o.status === "PENDING" || o.status === "PACKED").length;
  const onTheWayCount = onlineOrders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
  const deliveredCount = onlineOrders.filter((o) => o.status === "DELIVERED").length;
  const issueCount = onlineOrders.filter((o) => o.status === "CANCELLED").length;

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#162709] tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#243d12]" />
              <span>Wateja wa Delivery & Ulinzi wa Mizigo</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E1FFAC] text-[#1b2d0b] font-bold border border-[#aae056]">
              Usimamizi wa Madereva
            </span>
          </div>
          <p className="text-xs text-[#52654c] mt-0.5">
            Mteja akitaka delivery mzigo wake unawekwa hapa ili kufuatilia bodaboda, kulinda biashara na kuzuia lawama kwa wafanyakazi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl neu-btn text-xs font-black flex items-center gap-1.5 shadow-neu-flat"
          >
            <Plus className="w-4 h-4 text-[#1a3109]" />
            <span>+ Weka Mteja wa Delivery</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
          <span className="text-[10px] font-bold text-[#5e7454] block uppercase">Jumla ya Mizigo</span>
          <p className="text-xl font-black text-[#162709] mt-0.5">{totalCount} Oda</p>
          <span className="text-[10px] text-[#55694c]">Mizigo yote ya delivery</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 block uppercase">Inayoandaliwa</span>
          <p className="text-xl font-black text-amber-950 mt-0.5">{pendingCount} Oda</p>
          <span className="text-[10px] text-amber-800">Dukani / Inafungwa</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-800 block uppercase">Njiani na Dereva</span>
          <p className="text-xl font-black text-blue-950 mt-0.5">{onTheWayCount} Oda</p>
          <span className="text-[10px] text-blue-700">Bodaboda anasafirisha</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 block uppercase">Imefika Salama</span>
          <p className="text-xl font-black text-emerald-950 mt-0.5">{deliveredCount} Oda</p>
          <span className="text-[10px] text-emerald-700">Imepokelewa na mteja</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-800 block uppercase">Shida / Imerudi</span>
          <p className="text-xl font-black text-rose-950 mt-0.5">{issueCount} Oda</p>
          <span className="text-[10px] text-rose-700 font-bold">Imelindwa na rekodi</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#63775c]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta jina la mteja, namba ya simu, eneo, au jina la dereva..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl neu-input text-xs font-medium text-[#18260d]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-thin">
          {[
            { id: "ALL", label: "Zote" },
            { id: "PACKED", label: "Dukani" },
            { id: "OUT_FOR_DELIVERY", label: "Njiani" },
            { id: "DELIVERED", label: "Zilizoletwa" },
            { id: "CANCELLED", label: "Shida / Zilizorudi" }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                filterStatus === st.id
                  ? "bg-[#E1FFAC] text-[#1c300c] border-[#a0da4e] shadow-xs"
                  : "bg-white text-[#52664a] border-[#d8e7cb] hover:bg-[#F3F8EC]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#63795b] bg-white rounded-2xl border border-[#d6e5c5]">
            Hakuna taarifa za delivery kwa vigezo hivi.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const riderMessage = `Habari ${ord.driverName || "Dereva"},\nUna mzigo wa kupeleka:\nMteja: ${ord.customerName}\nSimu: ${ord.phone}\nEneo: ${ord.address}\nThamani ya Mzigo: TZS ${ord.total.toLocaleString()}\nNauli yako: TZS ${ord.deliveryFee.toLocaleString()}\nOda No: ${ord.orderNumber}\nAsante!`;

            return (
              <div
                key={ord.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#d6e5c5] shadow-neu-card flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  {/* Top line badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#152709] bg-[#F1F6EA] px-2 py-0.5 rounded-md border border-[#d2e4bb]">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        ord.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                          : ord.status === "OUT_FOR_DELIVERY"
                          ? "bg-blue-100 text-blue-950 border-blue-300"
                          : ord.status === "CANCELLED"
                          ? "bg-rose-100 text-rose-950 border-rose-300"
                          : "bg-amber-100 text-amber-950 border-amber-300"
                      }`}
                    >
                      {ord.status === "DELIVERED"
                        ? "✓ IMEPOKELEWA SALAMA"
                        : ord.status === "OUT_FOR_DELIVERY"
                        ? "🚚 NJIANI NA DEREVA"
                        : ord.status === "CANCELLED"
                        ? "⚠ SHIDA / IMERUDISHWA"
                        : "📦 INAANDALIWA DUKANI"}
                    </span>
                    <span className="text-xs font-black text-emerald-800">
                      Thamani: TZS {ord.total.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#63795b]">
                      (+ Nauli TZS {ord.deliveryFee.toLocaleString()})
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-[#223611]">
                      <User className="w-3.5 h-3.5 text-[#546b45]" />
                      <span className="font-black">{ord.customerName}</span>
                      <a
                        href={`tel:${ord.phone}`}
                        className="text-[#3b5e1a] font-bold hover:underline ml-1"
                      >
                        ({ord.phone})
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#3b502e]">
                      <MapPin className="w-3.5 h-3.5 text-[#546b45] shrink-0" />
                      <span className="truncate">{ord.address}</span>
                    </div>
                  </div>

                  {/* Items in Delivery */}
                  <div className="text-xs text-[#485f39] flex items-center gap-1.5 bg-[#FAFDF7] p-2 rounded-xl border border-[#e1ebd5]">
                    <Package className="w-3.5 h-3.5 text-[#546b45] shrink-0" />
                    <span className="font-medium">
                      Vitu Vilivyomo:{" "}
                      <strong className="text-[#192f0b]">
                        {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                      </strong>
                    </span>
                  </div>

                  {/* Employee Protection & Driver Accountability Stamp */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#55694d] pt-1">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Aliyeandaa Dukani:{" "}
                        <strong className="text-[#162709]">{ord.packedBy || "Baraka Mushi"}</strong>
                      </span>
                    </div>

                    {ord.driverName && (
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-700" />
                        <span>
                          Dereva / Bodaboda:{" "}
                          <strong className="text-[#162709]">
                            {ord.driverName} {ord.driverPhone ? `(${ord.driverPhone})` : ""}
                          </strong>
                        </span>
                      </div>
                    )}

                    {ord.issueNotes && (
                      <div className="w-full text-rose-800 font-semibold bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                        Sababu ya Shida: {ord.issueNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e5edd8]">
                  {/* WhatsApp Driver / Customer */}
                  <a
                    href={`https://wa.me/${(ord.driverPhone || ord.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                      riderMessage
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 lg:w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Dereva</span>
                  </a>

                  {/* Status Progression */}
                  {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          ord.id,
                          ord.status === "PENDING"
                            ? "PACKED"
                            : ord.status === "PACKED"
                            ? "OUT_FOR_DELIVERY"
                            : "DELIVERED"
                        )
                      }
                      className="flex-1 lg:w-full px-3 py-2 rounded-xl neu-btn text-xs font-black shadow-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {ord.status === "PACKED" || ord.status === "PENDING"
                          ? "Kabidhi Dereva (Njiani)"
                          : "Imefika Salama"}
                      </span>
                    </button>
                  )}

                  {/* Report Issue Button (Protects staff & flags problems) */}
                  {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (
                    <button
                      onClick={() => setIssueModalOrder(ord)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-700" />
                      <span>Ripoti Shida</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: WEKA MTEJA WA DELIVERY MPYA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#b5ea62] animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1ebd5] mb-4">
              <div>
                <h3 className="text-base font-black text-[#152709] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#243d12]" />
                  <span>Sajili Mteja Mpya wa Delivery</span>
                </h3>
                <p className="text-[11px] text-[#55694b]">
                  Taarifa hizi zitalinda mfanyakazi na biashara iwapo mzigo utapotea au kuchelewa.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#34482b] mb-1">Jina la Mteja:</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Mfano: Fatma Kassim"
                    className="w-full py-2 px-3 rounded-xl neu-input font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#34482b] mb-1">Simu ya Mteja:</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full py-2 px-3 rounded-xl neu-input font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#34482b] mb-1">Mahali pa Kupeleka (Location / Mtaa):</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mfano: Mikocheni B, Karibu na Regency Hospital"
                  className="w-full py-2 px-3 rounded-xl neu-input font-medium"
                />
              </div>

              {/* Product Selection */}
              <div>
                <label className="block font-bold text-[#34482b] mb-1">Chagua Bidhaa kutoka Stoo (Hiari):</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input font-medium"
                >
                  <option value="">-- Chagua Bidhaa Dukani --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (TZS {p.sellingPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#34482b] mb-1">
                  Maelezo ya Bidhaa / Vitu Vilivyomo kwenye Mzigo:
                </label>
                <input
                  type="text"
                  required
                  value={customItemDesc}
                  onChange={(e) => setCustomItemDesc(e.target.value)}
                  placeholder="Mfano: Mafuta ya Nivea chupa 2 na Sabuni"
                  className="w-full py-2 px-3 rounded-xl neu-input font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#34482b] mb-1">Thamani ya Mzigo (TZS):</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="Mfano: 45000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#34482b] mb-1">Nauli ya Usafiri (TZS):</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="Mfano: 3000"
                    className="w-full py-2 px-3 rounded-xl neu-input font-bold"
                  />
                </div>
              </div>

              {/* Driver & Staff Accountability */}
              <div className="p-3 rounded-2xl bg-[#F7FAF3] border border-[#dce8d0] space-y-2.5">
                <span className="text-[11px] font-black text-[#2e471f] block uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Taarifa za Dereva & Mfanyakazi (Ulinzi wa Biashara)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#445b37] mb-1">Jina la Bodaboda / Dereva:</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Mfano: Juma Bodaboda"
                      className="w-full py-2 px-3 rounded-xl neu-input"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#445b37] mb-1">Simu ya Dereva:</label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full py-2 px-3 rounded-xl neu-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#445b37] mb-1">
                    Mfanyakazi Aliyefunga Mzigo Dukani (Staff):
                  </label>
                  <input
                    type="text"
                    value={packedBy}
                    onChange={(e) => setPackedBy(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input font-semibold text-[#182d0a]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-black shadow-sm"
                >
                  Sajili Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RIPOTI SHIDA KWENYE DELIVERY */}
      {issueModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-rose-300 animate-slide-up">
            <div className="text-center pb-3 border-b border-rose-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-rose-950">Ripoti Shida ya Delivery</h3>
              <p className="text-xs text-[#677a5e]">
                Oda {issueModalOrder.orderNumber} ({issueModalOrder.customerName})
              </p>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-[#34482b] mb-1">Sababu ya Shida / Kurudi:</label>
                <select
                  required
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input font-medium"
                >
                  <option value="">-- Chagua Sababu --</option>
                  <option value="Mteja hapatikani kwenye simu">Mteja hapatikani kwenye simu</option>
                  <option value="Mteja amekataa kupokea au kughairi">Mteja amekataa kupokea au kughairi</option>
                  <option value="Dereva amepotea eneo au hakufika">Dereva amepotea eneo au hakufika</option>
                  <option value="Mzigo umeharibika wakati wa safari">Mzigo umeharibika wakati wa safari</option>
                  <option value="Pesa ya malipo haikutimia">Pesa ya malipo haikutimia</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOrder(null)}
                  className="flex-1 py-2 rounded-xl neu-btn-secondary font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs"
                >
                  Thibitisha Shida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
