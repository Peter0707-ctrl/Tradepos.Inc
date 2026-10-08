"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Plus,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle
} from "lucide-react";
import { PurchaseOrder } from "@/types";

export const PurchasesSuppliersModule: React.FC = () => {
  const { suppliers, purchaseOrders, createPurchaseOrder, addSupplier, products } = useApp();
  const [activeTab, setActiveTab] = useState<"purchases" | "suppliers">("purchases");

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // New PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || "");
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.name || "");
  const [poQuantity, setPoQuantity] = useState("50");
  const [poBuyingPrice, setPoBuyingPrice] = useState("15000");
  const [dueDate, setDueDate] = useState("2026-10-25");

  // New Supplier form state
  const [supName, setSupName] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supAddress, setSupAddress] = useState("");

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const qty = parseInt(poQuantity) || 1;
    const price = parseFloat(poBuyingPrice) || 0;
    const total = qty * price;

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      items: [{ productName: selectedProduct, quantity: qty, buyingPrice: price, total }],
      totalAmount: total,
      paidAmount: total,
      status: "ORDERED",
      dueDate,
    });

    setIsPoModalOpen(false);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supPhone) return;

    addSupplier({
      name: supName,
      phone: supPhone,
      email: supEmail,
      address: supAddress,
    });

    setIsSupplierModalOpen(false);
    setSupName("");
    setSupPhone("");
  };

  const totalOwedToSuppliers = suppliers.reduce((acc, s) => acc + s.amountOwed, 0);

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">
            Purchases & Supplier Relationship Management
          </h2>
          <p className="text-xs text-[#526848]">
            Manage purchase orders, receiving, inventory stock addition and accounts payable debts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "purchases" ? (
            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "purchases"
              ? "bg-[#E1FFAC] text-[#162A08] border border-[#9EDE31] shadow-xs"
              : "bg-white text-[#4A613E] border border-[#D5E5C4]"
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "suppliers"
              ? "bg-[#E1FFAC] text-[#162A08] border border-[#9EDE31] shadow-xs"
              : "bg-white text-[#4A613E] border border-[#D5E5C4]"
          }`}
        >
          Supplier Directory & Debts ({suppliers.length})
        </button>
      </div>

      {/* Main Content */}
      {activeTab === "purchases" ? (
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs">
          <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
            <thead className="bg-[#F8FAF4] font-bold text-[#4D6340] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Products Ordered</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-[#F9FBF6] transition">
                  <td className="py-3 px-4 font-black">{po.orderNumber}</td>
                  <td className="py-3 px-4 font-semibold">{po.supplierName}</td>
                  <td className="py-3 px-4 text-[#4E6742]">
                    {po.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                  </td>
                  <td className="py-3 px-4 font-black">TZS {po.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        po.status === "RECEIVED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#5F7852]">{po.dueDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-2.5 py-1 rounded-lg bg-[#EDF3E6] hover:bg-[#E1FFAC] text-xs font-bold text-[#1B2F0B]">
                      Receive Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs">
          <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
            <thead className="bg-[#F8FAF4] font-bold text-[#4D6340] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Phone Contact</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Total Purchased</th>
                <th className="py-3 px-4">Amount Owed (Debt)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-[#F9FBF6] transition">
                  <td className="py-3 px-4 font-black">{s.name}</td>
                  <td className="py-3 px-4 text-[#4A623E]">{s.phone}</td>
                  <td className="py-3 px-4 text-[#5B734F]">{s.address || "—"}</td>
                  <td className="py-3 px-4 font-bold">TZS {s.totalPurchased.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {s.amountOwed > 0 ? (
                      <span className="font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        TZS {s.amountOwed.toLocaleString()}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700">Settled (TZS 0)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-2.5 py-1 rounded-lg bg-[#E1FFAC] hover:bg-[#D4F888] text-xs font-bold text-[#1B2F0B]">
                      Pay Supplier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-4">Create Supplier Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Select Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Product to Restock</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name} (Cur: {p.stockQuantity})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#324925] mb-1">Quantity</label>
                  <input
                    type="number"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#324925] mb-1">Unit Buying Cost (TZS)</label>
                  <input
                    type="number"
                    value={poBuyingPrice}
                    onChange={(e) => setPoBuyingPrice(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-4">Add Supplier to Directory</h3>
            <form onSubmit={handleAddSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Supplier / Distributor Name</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Bakhresa Group Distribution"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  placeholder="+255 22..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Physical Location</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="e.g. Nyerere Road Industrial"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
