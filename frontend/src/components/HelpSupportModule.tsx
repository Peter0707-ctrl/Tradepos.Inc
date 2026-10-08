"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  FileQuestion,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export const HelpSupportModule: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Hardware / POS Terminal");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setTicketSubject("");
      setTicketMessage("");
    }, 2500);
  };

  const faqs = [
    {
      q: "How does offline mode sync when internet disconnects?",
      a: "When internet disappears, TradePOS automatically switches to offline mode. All cash sales and barcode scans are cached in local IndexedDB. Once internet is restored, all transactions sync automatically without creating duplicate entries.",
    },
    {
      q: "How do I print to my Bluetooth or USB thermal receipt printer?",
      a: "TradePOS works with standard 58mm and 80mm ESC/POS thermal printers. Simply click 'Print Receipt' or press Enter on checkout, and your browser or mobile will route straight to the printer driver.",
    },
    {
      q: "Can I manage multiple branch stores from one login?",
      a: "Yes. From the top bar business switcher and sidebar, you can switch between your Kariakoo, Mbezi, or Masaki branches instantly. Data and permissions remain completely isolated per location.",
    },
    {
      q: "How are customer credit debts recorded and tracked?",
      a: "Select 'Credit' as the payment method during POS checkout or select a customer with an installment balance. You can record partial cash or M-Pesa payments anytime in the Customers module.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#162709] tracking-tight">
          Help Center & Priority Customer Support
        </h2>
        <p className="text-xs text-[#526848]">
          Find quick operational answers, user manuals, FAQs, or contact our 24/7 technical support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FAQs and Knowledgebase */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-sm text-[#162709]">Frequently Asked Questions</h3>

          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs">
                <h4 className="font-black text-xs text-[#17290A] mb-1.5 flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-[#3C6415] shrink-0" />
                  <span>{f.q}</span>
                </h4>
                <p className="text-xs text-[#4E6741] leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#F7FCF0] border border-[#D2E7BD] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#355B0F]" />
              <div>
                <h4 className="font-black text-xs text-[#162709]">Official TradePOS User Manual (PDF)</h4>
                <p className="text-[11px] text-[#556F48]">Complete operational guide for cashiers and inventory staff.</p>
              </div>
            </div>
            <button
              onClick={() => alert("Downloading User Manual PDF...")}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#C5D8B8] text-xs font-bold text-[#1C320A] shadow-xs"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Support Ticket Submission */}
        <div className="p-5 rounded-2xl bg-white border border-[#D8E6CC] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-[#162709] mb-1">Open Priority Support Ticket</h3>
            <p className="text-xs text-[#5D7350] mb-4">Our engineering agents respond within &lt;15 minutes.</p>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#324925] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Barcode scanner device setup"
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl neu-input"
                >
                  <option value="Hardware / POS Terminal">Hardware / POS Terminal</option>
                  <option value="Mobile Money Billing">Mobile Money Billing</option>
                  <option value="Inventory / Stock Count">Inventory / Stock Count</option>
                  <option value="Multi-Branch Data">Multi-Branch Data</option>
                  <option value="Other Inquiries">Other Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#324925] mb-1">Message Description</label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe the issue you are experiencing..."
                  className="w-full py-2 px-3 rounded-xl neu-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl neu-btn font-black flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>

              {isSent && (
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-center">
                  Ticket dispatched to support queue!
                </div>
              )}
            </form>
          </div>

          <div className="pt-4 border-t border-[#EDF4E4] text-xs text-[#556F48] space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#375E0F]" />
              <span>Direct Hotline: +255 712 345 678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#375E0F]" />
              <span>Email: support@tradepos.co.tz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
