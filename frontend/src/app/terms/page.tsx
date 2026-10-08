"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileCheck, CheckCircle2, ShoppingBag } from "lucide-react";

export default function TermsPage() {
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
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#152709] tracking-tight">
                Masharti ya Matumizi (Terms of Use)
              </h2>
              <p className="text-xs text-[#586E4F]">
                Ilisasishwa mwisho: Oktoba 2026 • TradePOS Tanzania
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#35482D] leading-relaxed">
            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">1. Utangulizi & Makubaliano</h3>
              <p>
                Karibu TradePOS. Kwa kutumia mfumo huu, kufungua akaunti ya biashara au kufanya mauzo, unakubaliana na masharti haya ya matumizi. Mfumo huu umeundwa kusaidia usimamizi wa maduka, mauzo ya kaunta (POS), stoo ya bidhaa, na mahesabu ya kifedha kwa wafanyabiashara.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">2. Akaunti na Usalama wa Biashara</h3>
              <p>
                Kila mtumiaji anawajibika kulinda nenosiri na uthibitisho wa akaunti yake. Mfumo wa TradePOS unatumia teknolojia ya kutenganisha data (Isolated Multi-Tenant Architecture), ambapo biashara moja haiwezi kuona wala kufikia taarifa za biashara nyingine.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">3. Usahihi wa Mauzo na Risiti</h3>
              <p>
                Watumiaji wanawajibika kuhakikisha bei za bidhaa, hesabu za kodi na taarifa za risiti zinazolipwa na wateja dukani ni sahihi. TradePOS inatoa kumbukumbu rasmi za miamala (Audit Logs) ili kulinda mmiliki wa biashara dhidi ya wizi au udanganyifu.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">4. Upatikanaji wa Mfumo & Hali ya Nje ya Mtandao (Offline)</h3>
              <p>
                TradePOS imeundwa kufanya kazi mtandaoni na pia nje ya mtandao (Offline Mode) ili kuzuia biashara kusimama pindi intaneti inapokatika. Data zote zilizorekodiwa zitasawazishwa kiotomatiki mtandao unaporejea.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">5. Malipo na Vifurushi vya Usajili</h3>
              <p>
                Huduma za TradePOS hutolewa kwa mfumo wa usajili (Subscription - Monthly au Annual). Mtumiaji ana haki ya kuboresha au kubadili kifurushi wakati wowote.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-black text-base text-[#16290A]">6. Mawasiliano na Msaada</h3>
              <p>
                Kwa maswali yoyote kuhusu masharti haya au msaada wa kiufundi, wasiliana nasi moja kwa moja kupitia:
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
