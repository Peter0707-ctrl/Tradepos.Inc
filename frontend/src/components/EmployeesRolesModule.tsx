"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  UserCheck,
  Plus,
  CheckCircle2,
  ArrowRight,
  Shield,
  Key
} from "lucide-react";

interface EmployeesRolesModuleProps {
  onNavigate?: (mod: string) => void;
}

export const EmployeesRolesModule: React.FC<EmployeesRolesModuleProps> = ({ onNavigate }) => {
  const { currentBranch, business, employees, addEmployee, switchEmployeeAccount, user, language } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("1111");
  const [role, setRole] = useState<"CASHIER" | "STOREKEEPER" | "ACCOUNTANT" | "MANAGER">("CASHIER");
  const [branch, setBranch] = useState(currentBranch?.name || business?.branches[0]?.name || "Tawi Kuu (HQ)");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addEmployee({
      name,
      email,
      phone,
      pin,
      role,
      branch,
    });

    setIsModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setPin("1111");
  };

  const getRolePermissionsLabel = (r: string) => {
    if (r === "OWNER") {
      return language === "sw"
        ? "Mamlaka Yote (Dashibodi, Faida & Ripoti Zote)"
        : "Full Access (Dashboard, Profit & All Reports)";
    }
    return language === "sw"
      ? "Mauzo, Matumizi, Stoo, Delivery & Madeni pekee"
      : "Sales, Expenses, Store, Delivery & Debts only";
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto gap-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-black text-[#162709] tracking-tight">
          {language === "sw" ? "Wafanyakazi & Ruhusa" : "Employees & Roles"}
        </h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl neu-btn text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "sw" ? "+ Ongeza Mfanyakazi" : "+ Add Employee"}</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="flex-1 overflow-x-auto bg-white rounded-2xl border border-[#D8E6CC] shadow-xs">
        <table className="w-full text-left text-xs divide-y divide-[#EBF2E2]">
          <thead className="bg-[#F8FAF4] font-bold text-[#4D6340]">
            <tr>
              <th className="py-3 px-4">{language === "sw" ? "Jina" : "Employee"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Cheo" : "Role"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Ruhusa" : "Permissions"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Simu & PIN" : "Phone & PIN"}</th>
              <th className="py-3 px-4">{language === "sw" ? "Hali" : "Status"}</th>
              <th className="py-3 px-4 text-right">{language === "sw" ? "Hatua" : "Action"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F6EB] text-[#1A2E0A]">
            {employees.map((emp) => {
              const isCurrent = user?.id === emp.id;
              return (
                <tr key={emp.id} className={`hover:bg-[#F9FBF6] transition ${isCurrent ? "bg-[#F6FAF0]" : ""}`}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm block">{emp.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                          IPO HEWANI SASA
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#637C56]">{emp.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${
                        emp.role === "OWNER"
                          ? "bg-[#E1FFAC] text-[#172D08] border border-[#9EDE31]"
                          : "bg-[#EDF3E6] text-[#22390C]"
                      }`}
                    >
                      {emp.role === "OWNER" ? "MWENYE DUKA (BOSS)" : emp.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#3F5632] font-semibold max-w-xs">
                    {getRolePermissionsLabel(emp.role)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div>{emp.phone}</div>
                    <div className="text-[#627B55] flex items-center gap-1">
                      <Key className="w-3 h-3" /> PIN: <strong>{emp.pin || "1234"}</strong>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{emp.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isCurrent ? (
                      <span className="text-xs font-black text-emerald-800">✓ Akaunti Inayotumika</span>
                    ) : (
                      <button
                        onClick={() => {
                          switchEmployeeAccount(emp.id);
                          if (onNavigate) {
                            onNavigate(emp.role === "OWNER" ? "dashboard" : "sales");
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#E1FFAC] hover:bg-[#d2f988] border border-[#9CE034] text-xs font-black text-[#172B08] inline-flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>
                          {emp.role === "OWNER"
                            ? "Ingia Kama Mwenye Duka"
                            : "Fungua Akaunti ya Muuzaji"}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#BFE973] animate-slide-up">
            <h3 className="text-base font-black text-[#162709] mb-1">
              {language === "sw" ? "Fungua Akaunti Mpya ya Mfanyakazi" : "Add New Employee Account"}
            </h3>
            <p className="text-xs text-[#586E4C] mb-4">
              {language === "sw"
                ? "Mfanyakazi huyu ataweza kuingiza mauzo, stock na kutuma mahesabu ya siku kwako."
                : "This employee will be able to record sales, stock, and submit daily shift reports to you."}
            </p>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Jina Kamili la Mfanyakazi</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mfano: Neema Massawe"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Barua Pepe (Email ya Kuingia)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="neema@dukalako.co.tz"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#324925] mb-1">Namba ya Simu</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+255 7..."
                    className="w-full py-2 px-3 rounded-xl neu-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#324925] mb-1">PIN ya Siri (Tarakimu 4)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1111"
                    className="w-full py-2 px-3 rounded-xl neu-input font-mono font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#324925] mb-1">Kazi / Cheo Dukani</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-xl neu-input text-xs"
                  >
                    <option value="CASHIER">Keshia / Mauzo (Cashier)</option>
                    <option value="STOREKEEPER">Mtu wa Stoo (Storekeeper)</option>
                    <option value="ACCOUNTANT">Mhasibu (Accountant)</option>
                    <option value="MANAGER">Meneja wa Duka (Manager)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#324925] mb-1">Tawi la Duka</label>
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
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-btn font-black"
                >
                  Sajili Mfanyakazi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
