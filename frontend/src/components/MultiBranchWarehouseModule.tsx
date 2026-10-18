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
  const {
    business,
    warehouses,
    products,
    sales,
    expenses,
    employees,
    currentBranch,
    setCurrentBranch,
    addBranch,
    addWarehouse,
    recordStockMovement,
    user,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"branches" | "warehouses">("branches");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);

  const [transferProduct, setTransferProduct] = useState(products[0]?.id || "");
  const [transferQty, setTransferQty] = useState("1");
  const [targetBranch, setTargetBranch] = useState("");

  // Add Branch form state
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchLocation, setNewBranchLocation] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");

  // Add Warehouse form state
  const [newWhName, setNewWhName] = useState("");
  const [newWhLocation, setNewWhLocation] = useState("");
  const [newWhManager, setNewWhManager] = useState("");

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === transferProduct) || products[0];
    const qty = Number(transferQty) || 0;
    if (!prod || qty <= 0) return;
    recordStockMovement({
      branchId: currentBranch?.id || "br-01",
      productId: prod.id,
      productName: prod.name,
      type: "OUT",
      quantity: qty,
      reason: `Transferred to ${targetBranch || "Destination Branch"}`,
      unitCost: prod.buyingPrice,
      totalValue: qty * prod.buyingPrice,
      recordedBy: user?.name || "Owner",
    });
    setIsTransferModalOpen(false);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    addBranch({
      name: newBranchName.trim(),
      location: newBranchLocation.trim() || business?.location || "Tanzania",
      phone: newBranchPhone.trim() || business?.phone || "",
    });
    setNewBranchName("");
    setNewBranchLocation("");
    setNewBranchPhone("");
    setIsAddBranchOpen(false);
  };

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim()) return;
    addWarehouse({
      name: newWhName.trim(),
      location: newWhLocation.trim() || business?.location || "Tanzania",
      manager: newWhManager.trim() || user?.name || "Store Manager",
    });
    setNewWhName("");
    setNewWhLocation("");
    setNewWhManager("");
    setIsAddWarehouseOpen(false);
  };

  const branchesList = business?.branches || [];
  const validSales = sales.filter((s) => s.status !== "REFUNDED");
  const totalSalesAll = validSales.reduce((a, b) => a + b.total, 0);
  const totalProfitAll = validSales.reduce((a, s) => {
    const saleProfit = s.items.reduce((iAcc, item) => {
      const prod = products.find(
        (p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase()
      );
      const unitCost = prod ? prod.buyingPrice : Math.round(item.price * 0.7);
      return iAcc + (item.price - unitCost) * item.quantity;
    }, 0);
    return a + saleProfit;
  }, 0);
  const totalExpensesAll = expenses.reduce((a, b) => a + b.amount, 0);
  const totalStockUnits = products.reduce((a, b) => a + b.stockQuantity, 0);

  const branchMetrics = branchesList.map((br) => {
    const isCurrentOrMain = currentBranch ? currentBranch.id === br.id : br.isMain;
    const branchStaffCount = employees.filter(
      (emp) => emp.branch === br.name || (br.isMain && !emp.branch)
    ).length;
    const branchSalesVal = isCurrentOrMain ? totalSalesAll : 0;
    const branchExpVal = isCurrentOrMain ? totalExpensesAll : 0;
    const branchProfitVal = isCurrentOrMain ? totalProfitAll - totalExpensesAll : 0;
    const branchStockVal = isCurrentOrMain ? totalStockUnits : 0;

    return {
      id: br.id,
      branchObj: br,
      name: br.name,
      location: br.location,
      sales: `TZS ${branchSalesVal.toLocaleString()}`,
      profit: `TZS ${branchProfitVal.toLocaleString()}`,
      stock: `${branchStockVal.toLocaleString()} items`,
      employees: branchStaffCount,
      expenses: `TZS ${branchExpVal.toLocaleString()}`,
      isMain: br.isMain,
    };
  });

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">
            Multi-Branch Outlets &amp; Storage Warehouses
          </h2>
          <p className="text-xs text-[#526848]">
            Compare branch performance, transfer stock across stores, and manage centralized distribution depots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (products.length > 0 && !transferProduct) {
                setTransferProduct(products[0].id);
              }
              setIsTransferModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] flex items-center gap-1.5 shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#3C6415]" />
            <span>Inter-Branch Stock Transfer</span>
          </button>
          <button
            onClick={() => setIsAddWarehouseOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#F2F7EB] text-xs font-bold text-[#2A3E1D] flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#3C6415]" />
            <span>Add Warehouse</span>
          </button>
          <button
            onClick={() => setIsAddBranchOpen(true)}
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
          Central Warehouses &amp; Transit Depots ({warehouses.length})
        </button>
      </div>

      {/* Body View */}
      {activeTab === "branches" ? (
        branchMetrics.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#D8E6CC] p-8 text-center">
            <Store className="w-10 h-10 text-[#607853] mb-2" />
            <p className="text-sm font-black text-[#162709]">Hakuna Matawi Yaliyosajiliwa Bado</p>
            <p className="text-xs text-[#526848] mt-1 mb-4">
              Bonyeza &quot;Add New Outlet Branch&quot; kuongeza tawi la biashara yako.
            </p>
            <button
              onClick={() => setIsAddBranchOpen(true)}
              className="px-4 py-2 rounded-xl neu-btn text-xs font-bold"
            >
              + Add New Outlet Branch
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
            {branchMetrics.map((b) => (
              <div
                key={b.id}
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
                    onClick={() => setCurrentBranch(b.branchObj)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      currentBranch?.id === b.id
                        ? "bg-[#1B2F0B] text-[#E1FFAC]"
                        : "bg-[#EDF3E6] hover:bg-[#E1FFAC] text-[#1B2F0B]"
                    }`}
                  >
                    {currentBranch?.id === b.id ? "Active Branch" : "Switch Context"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : warehouses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#D8E6CC] p-8 text-center">
          <WarehouseIcon className="w-10 h-10 text-[#607853] mb-2" />
          <p className="text-sm font-black text-[#162709]">Hakuna Godown / Stoo Kuu Iliyosajiliwa Bado</p>
          <p className="text-xs text-[#526848] mt-1 mb-4">
            Bonyeza &quot;Add Warehouse&quot; kusajili stoo kuu au godown ya kuhifadhia mizigo.
          </p>
          <button
            onClick={() => setIsAddWarehouseOpen(true)}
            className="px-4 py-2 rounded-xl neu-btn text-xs font-bold"
          >
            + Add Warehouse
          </button>
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
                    <strong className="text-[#162709]">{wh.totalItems} cartons &amp; units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#516744]">Warehouse Manager:</span>
                    <strong className="text-[#162709]">{wh.manager}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#EDF4E4]">
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex-1 py-2 rounded-xl neu-btn text-xs font-bold shadow-xs"
                >
                  Dispatch to Store
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD BRANCH MODAL */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973]">
            <h3 className="text-base font-black text-[#162709] mb-4">Add New Outlet Branch</h3>
            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. Tawi la Pili"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>
              <div>
                <label className="block font-bold text-[#324925] mb-1">Location / Street</label>
                <input
                  type="text"
                  required
                  value={newBranchLocation}
                  onChange={(e) => setNewBranchLocation(e.target.value)}
                  placeholder="e.g. Dar es Salaam"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>
              <div>
                <label className="block font-bold text-[#324925] mb-1">Branch Phone</label>
                <input
                  type="text"
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  placeholder="+255 7..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl neu-btn font-bold">
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD WAREHOUSE MODAL */}
      {isAddWarehouseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973]">
            <h3 className="text-base font-black text-[#162709] mb-4">Add Central Warehouse / Depot</h3>
            <form onSubmit={handleCreateWarehouse} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  placeholder="e.g. Central Store Depot"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>
              <div>
                <label className="block font-bold text-[#324925] mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newWhLocation}
                  onChange={(e) => setNewWhLocation(e.target.value)}
                  placeholder="e.g. Industrial Area"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>
              <div>
                <label className="block font-bold text-[#324925] mb-1">Storekeeper / Manager</label>
                <input
                  type="text"
                  value={newWhManager}
                  onChange={(e) => setNewWhManager(e.target.value)}
                  placeholder="Manager Name"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl neu-btn font-bold">
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973]">
            <h3 className="text-base font-black text-[#162709] mb-4">Inter-Branch Stock Transfer</h3>
            <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Select Product</label>
                <select
                  value={transferProduct}
                  onChange={(e) => setTransferProduct(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                >
                  {products.length === 0 ? (
                    <option value="">No products in stock</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Available: {p.stockQuantity})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Quantity to Transfer</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Destination Branch / Warehouse</label>
                <input
                  type="text"
                  required
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  placeholder={branchesList[1]?.name || warehouses[0]?.name || "Enter destination branch name"}
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                />
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
                  disabled={products.length === 0}
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold disabled:opacity-50"
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
