"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  UserCheck,
  Plus,
  Shield,
  Key,
  Mail,
  Phone,
  Store,
  CheckCircle2,
  XCircle,
  MoreVertical
} from "lucide-react";

export const EmployeesRolesModule: React.FC = () => {
  const { currentBranch, business } = useApp();
  const [employees, setEmployees] = useState([
    {
      id: "emp-01",
      name: "Peter Joseph",
      email: "peter@petercosmetics.co.tz",
      phone: "+255 712 345 678",
      role: "Owner",
      branch: "All Branches",
      status: "Active",
      lastActive: "Now",
    },
    {
      id: "emp-02",
      name: "John Mushi",
      email: "john.mushi@petercosmetics.co.tz",
      phone: "+255 754 991 223",
      role: "Cashier",
      branch: "Kariakoo Branch (HQ)",
      status: "Active",
      lastActive: "15 mins ago",
    },
    {
      id: "emp-03",
      name: "Amina Hassan",
      email: "amina.h@petercosmetics.co.tz",
      phone: "+255 788 334 112",
      role: "Storekeeper",
      branch: "Kariakoo Main Stock Depot",
      status: "Active",
      lastActive: "1 hour ago",
    },
    {
      id: "emp-04",
      name: "Frank Temba",
      email: "frank.temba@petercosmetics.co.tz",
      phone: "+255 713 445 667",
      role: "Accountant",
      branch: "Kariakoo Branch (HQ)",
      status: "Active",
      lastActive: "Yesterday",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Cashier");
  const [branch, setBranch] = useState(currentBranch?.name || "Kariakoo Branch (HQ)");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setEmployees((prev) => [
      ...prev,
      {
        id: "emp-" + Date.now(),
        name,
        email,
        phone,
        role,
        branch,
        status: "Active",
        lastActive: "Just added",
      },
    ]);

    setIsModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black text-[#162709] tracking-tight">
            Employee Directory & Role-Based Permissions
          </h2>
          <p className="text-xs text-[#526848]">
            Grant granular permissions to Cashiers, Storekeepers, Accountants and Store Managers across branches.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Invite New Employee</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs">
        <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
          <thead className="bg-[#F8FAF4] font-bold text-[#4D6340] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role & Access</th>
              <th className="py-3 px-4">Assigned Branch</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-[#F9FBF6] transition">
                <td className="py-3 px-4">
                  <span className="font-black text-sm block">{emp.name}</span>
                  <span className="text-[11px] text-[#637C56]">{emp.email}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      emp.role === "Owner"
                        ? "bg-[#E1FFAC] text-[#172D08] border border-[#9EDE31]"
                        : "bg-[#EDF3E6] text-[#22390C]"
                    }`}
                  >
                    {emp.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#4E6742]">{emp.branch}</td>
                <td className="py-3 px-4 font-mono text-[11px]">{emp.phone}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{emp.status}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-[#66805B]">{emp.lastActive}</td>
                <td className="py-3 px-4 text-right">
                  <button className="px-2.5 py-1 rounded-lg bg-[#EDF3E6] hover:bg-[#E1FFAC] text-xs font-bold text-[#1B2F0B]">
                    Edit Permissions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-4">Add Employee Account</h3>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Mushi"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@business.com"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 7..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#324925] mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                  >
                    <option value="Cashier">Cashier (POS Only)</option>
                    <option value="Storekeeper">Storekeeper (Inventory)</option>
                    <option value="Accountant">Accountant (Finance)</option>
                    <option value="Manager">Manager (Operations)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#324925] mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                  >
                    {business?.branches.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-btn-secondary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-bold"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
