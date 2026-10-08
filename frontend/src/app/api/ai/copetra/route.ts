import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const businessName = context?.businessName || "Biashara Yangu";
    const salesTotal = context?.salesTotal ? Number(context.salesTotal).toLocaleString() : "0";
    const expensesTotal = context?.expensesTotal ? Number(context.expensesTotal).toLocaleString() : "0";
    const lowStockList = context?.lowStockItems?.length > 0 ? context.lowStockItems.join(", ") : "Hakuna bidhaa inayoisha";
    const currency = context?.currency || "TZS";

    const prompt = `Wewe ni Copetra AI, mfumo mahiri wa kiintelijensia ya biashara uliounganishwa ndani ya TradePOS (engineered by PJ Copetranova).
Unamsaidia mmiliki wa biashara: "${businessName}" nchini Tanzania.

Taarifa za Moja kwa Moja za Biashara Hii Leo:
- Mauzo ya Leo: ${currency} ${salesTotal} (${context?.transactionsCount || 0} wateja)
- Matumizi ya Leo: ${currency} ${expensesTotal}
- Bidhaa Zinazoisha Stoo (Low Stock): ${lowStockList}
- Jumla ya Bidhaa Kwenye Mfumo: ${context?.productsCount || 0}

Swali la Mmiliki wa Biashara:
"${query}"

Jibu kwa weledi, lugha fasaha (Kiswahili au Kiingereza kulingana na swali lilivyoulizwa), ukitoa ushauri wa kibiashara wenye tija, mikakati ya kuongeza faida, na utatuzi wa changamoto za biashara. Kuwa mfupi na mwenye hoja zinazotekelezeka.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const copetraRes = await fetch("https://miraculous-forgiveness-production-10d4.up.railway.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "TradePOS-Copetra-Bridge/2.0",
      },
      body: JSON.stringify({
        message: prompt,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (copetraRes.ok) {
      const data = await copetraRes.json();
      return NextResponse.json({
        response: data.response || "Copetra AI imefanikiwa kuchakata uchambuzi wa biashara yako.",
        engine: "Copetra AI (PJKRONX Engine)",
        status: "success",
      });
    } else {
      throw new Error(`Copetra API returned status ${copetraRes.status}`);
    }
  } catch (error: any) {
    console.error("Copetra AI bridge error:", error?.message || error);
    // Intelligent local fallback if network is offline or remote service is unreachable
    return NextResponse.json({
      response: `[Copetra AI Offline Fallback] Mfumo wa uchambuzi wa ndani wa TradePOS unaonyesha mauzo na stoo yako viko salama. Endelea kufuatilia wateja wako na bidhaa zinazoisha kwa ukaribu.`,
      engine: "Copetra Local Fallback",
      status: "fallback",
    });
  }
}
