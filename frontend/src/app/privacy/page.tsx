"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, CheckCircle2, ShoppingBag } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F4F7EE] text-[#1E271B] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#D5E5C4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E1FFAC] border border-[#A6DF52] flex items-center justify-center text-[#182C08] shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#152508] tracking-tight">TradePOS</h1>
              <p className="text-xs text-[#526848] font-semibold">Enterprise Retail Operating System</p>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-white border border-[#D5E5C4] hover:bg-[#EBF3E2] text-xs font-bold text-[#1C320A] flex items-center gap-2 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Rudi Nyumbani (Back to Home)</span>
          </Link>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#D8E6CC] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EEF4E5]">
            <div className="w-12 h-12 rounded-2xl bg-[#E1FFAC] flex items-center justify-center text-[#1b300a]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#152709] tracking-tight">
                Sera ya Faragha (Privacy Policy)
              </h2>
              <p className="text-xs text-[#586E4F]">
                Ilisasishwa mwisho: Oktoba 2026 • TradePOS Tanzania
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#35482D] leading-relaxed">
            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">1. Ulinzi na Usiri wa Data Zako</h3>
              <p>
                TradePOS inaweka kipaumbele cha juu zaidi katika kulinda usiri wa taarifa za biashara yako. Taarifa zote unazosajili—ikiwemo bei za bidhaa, faida, wateja, namba za simu, na risiti za mauzo—ni mali yako binafsi na zinalindwa kwa usimbaji fiche (encryption).
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">2. Kutengwa kwa Data za Biashara (Multi-Tenant Isolation)</h3>
              <p>
                Mfumo wa TradePOS unahakikisha kila biashara (tenant) inatengwa kikamilifu. Hakuna mfanyabiashara mwingine anayeweza kuona wala kufikia mauzo, hesabu au stoo ya duka lako hata kama mnajumuika kwenye mfumo mmoja.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">3. Taarifa Tunazokusanya</h3>
              <p>
                Tunakusanya taarifa za msingi pekee zinazohitajika kuendesha akaunti yako ya biashara:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#425838]">
                <li>Jina la biashara, eneo la duka, na namba ya simu.</li>
                <li>Taarifa za akaunti ya kuingilia (jina na barua pepe).</li>
                <li>Kumbukumbu za mauzo na stoo kwa ajili ya ripoti za mmiliki.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">4. Kutoshiriki Data na Wahusika Wengine</h3>
              <p>
                Hatuuzi, hatukodishi wala hatushiriki taarifa za biashara yako na mtu yeyote, kampuni ya matangazo au mshindani wako kibiashara. Taarifa zote zimehifadhiwa salama.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">5. Wasiliana Nasi</h3>
              <p>
                Kama una swali lolote kuhusu sera hii ya faragha au usalama wa akaunti yako, wasiliana nasi:
              </p>
              <div className="p-4 rounded-2xl bg-[#F6FAF0] border border-[#DCE8D0] space-y-1 text-xs font-semibold">
                <p>• <strong>WhatsApp:</strong> 0673190311</p>
                <p>• <strong>Simu ya Mkononi:</strong> 0779304500</p>
                <p>• <strong>Barua Pepe:</strong> pj0040280@gmail.com</p>
              </div>
            </section>
          </div>

          <div className="pt-6 border-t border-[#EEF4E5] flex justify-between items-center">
            <span className="text-xs text-[#63795A]">© 2026 TradePOS. Haki zote zimehifadhiwa.</span>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-[#E1FFAC] text-[#192E09] font-black text-xs hover:bg-[#D5F98A] transition shadow-xs"
            >
              Kubali & Endelea
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
