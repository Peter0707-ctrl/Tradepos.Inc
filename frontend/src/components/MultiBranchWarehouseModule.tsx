"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Store,
  Warehouse as WarehouseIcon,
  Plus,
  ArrowRightLeft,
  Building,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  CheckCircle2
} from "lucide-react";

export const MultiBranchWarehouseModule: React.FC = () => {
  const { business, warehouses, products, currentBranch, setCurrentBranch } = useApp();
  const [activeTab, setActiveTab] = useState<"branches" | "warehouses">("branches");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [transferProduct, setTransferProduct] = useState(products[0]?.name || "");
  const [transferQty, setTransferQty] = useState("10");
  const [targetBranch, setTargetBranch] = useState(business?.branches[1]?.name || "Mbezi Beach Branch");

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Successfully transferred ${transferQty} units of ${transferProduct} to ${targetBranch}!`);
    setIsTransferModalOpen(false);
  };

  const branchMetrics = [
    {
      name: "Kariakoo Branch (HQ)",
      location: "Kariakoo Msimbazi",
      sales: "TZS 14,250,000",
      profit: "TZS 4,200,000",
      stock: "1,240 items",
      employees: 5,
      expenses: "TZS 1,660,000",
      isMain: true,
    },
    {
      name: "Mbezi Beach Branch",
      location: "Mbezi Africana",
      sales: "TZS 8,400,000",
      profit: "TZS 2,450,000",
      stock: "680 items",
      employees: 3,
      expenses: "TZS 890,000",
      isMain: false,
    },
    {
      name: "Masaki Peninsula Outlet",
      location: "Masaki Village Walk",
      sales: "TZS 11,800,000",
      profit: "TZS 3,850,000",
      stock: "910 items",
      employees: 4,
      expenses: "TZS 1,420,000",
      isMain: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">
            Multi-Branch Outlets & Storage Warehouses
          </h2>
          <p className="text-xs text-[#526848]">
            Compare branch performance, transfer stock across stores, and manage centralized distribution depots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] flex items-center gap-1.5 shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#3C6415]" />
            <span>Inter-Branch Stock Transfer</span>
          </button>
          <button
            className="px-4 py-2 rounded-xl neu-btn text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Outlet Branch</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "branches"
              ? "bg-[#E1FFAC] text-[#162A08] border border-[#9EDE31] shadow-xs"
              : "bg-white text-[#4A613E] border border-[#D5E5C4]"
          }`}
        >
          Branch Outlets Comparison ({branchMetrics.length})
        </button>
        <button
          onClick={() => setActiveTab("warehouses")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "warehouses"
              ? "bg-[#E1FFAC] text-[#162A08] border border-[#9EDE31] shadow-xs"
              : "bg-white text-[#4A613E] border border-[#D5E5C4]"
          }`}
        >
          Central Warehouses & Transit Depots ({warehouses.length})
        </button>
      </div>

      {/* Body View */}
      {activeTab === "branches" ? (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {branchMetrics.map((b, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-black text-sm text-[#162709]">{b.name}</h3>
                    <span className="text-[11px] text-[#5D7451] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#446517]" />
                      <span>{b.location}</span>
                    </span>
                  </div>
                  {b.isMain && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#E1FFAC] text-[#172D08] border border-[#9EDE31]">
                      HEADQUARTERS
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 my-4 text-xs pt-3 border-t border-[#EDF4E4]">
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Total Sales Revenue:</span>
                    <strong className="text-[#162709]">{b.sales}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Net Branch Profit:</span>
                    <strong className="text-emerald-800">{b.profit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#516744]">On-Hand Stock Items:</span>
                    <strong className="text-[#162709]">{b.stock}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Active Staff:</span>
                    <strong className="text-[#162709]">{b.employees} employees</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Operating Expenses:</span>
                    <strong className="text-rose-700">{b.expenses}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EDF4E4] flex gap-2">
                <button
                  onClick={() => {
                    const br = business?.branches.find((brItem) => brItem.name.includes(b.name.split(" ")[0]));
                    if (br) setCurrentBranch(br);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#EDF3E6] hover:bg-[#E1FFAC] text-xs font-bold text-[#1B2F0B] transition"
                >
                  Switch Context
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-sm text-[#162709]">{wh.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF3E6] text-[#22380D]">
                    Storage Depot
                  </span>
                </div>
                <p className="text-xs text-[#5E7552] mb-3">{wh.location}</p>

                <div className="space-y-2 text-xs py-3 border-t border-[#EDF4E4]">
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Estimated Inventory Value:</span>
                    <strong className="text-base text-emerald-800">TZS {wh.stockValue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Total Products Stored:</span>
                    <strong className="text-[#162709]">{wh.totalItems} cartons & units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Warehouse Manager:</span>
                    <strong className="text-[#162709]">{wh.manager}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#EDF4E4]">
                <button className="flex-1 py-2 rounded-xl neu-btn text-xs font-bold shadow-xs">
                  Dispatch to Store
                </button>
                <button className="flex-1 py-2 rounded-xl neu-btn-secondary text-xs font-bold">
                  Receive Inbound Container
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STOCK TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-4">Inter-Branch Stock Transfer</h3>
            <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Select Product</label>
                <select
                  value={transferProduct}
                  onChange={(e) => setTransferProduct(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name} (Available: {p.stockQuantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Quantity to Transfer</label>
                <input
                  type="number"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Destination Branch</label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                >
                  <option value="Mbezi Beach Branch">Mbezi Beach Branch</option>
                  <option value="Masaki Peninsula Outlet">Masaki Peninsula Outlet</option>
                  <option value="Kariakoo Main Stock Depot">Kariakoo Main Stock Depot</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
