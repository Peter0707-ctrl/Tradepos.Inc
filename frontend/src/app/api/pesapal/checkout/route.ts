import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      plan = "PROFESSIONAL",
      durationMonths = 1,
      amount = 150000,
      currency = "TZS",
      customerName = "TradePOS Merchant",
      customerPhone = "255700000000",
      customerEmail = "billing@tradepos.co.tz",
      customDetails,
    } = body;

    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const pesapalEnv = process.env.PESAPAL_ENV || "sandbox";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // If Pesapal credentials are fully configured in environment, call the real Pesapal v3 API
    if (consumerKey && consumerSecret && !consumerKey.includes("your_pesapal")) {
      const baseUrl =
        pesapalEnv === "production"
          ? "https://pay.pesapal.com/v3/api"
          : "https://cybqa.pesapal.com/pesapalv3/api";

      // 1. Authenticate with Pesapal to get access token
      const authRes = await fetch(`${baseUrl}/Auth/RequestToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
        }),
      });

      if (!authRes.ok) {
        const authErr = await authRes.text();
        console.error("Pesapal Auth Error:", authErr);
        return NextResponse.json(
          { error: "Failed to authenticate with Pesapal gateway", details: authErr },
          { status: 502 }
        );
      }

      const authData = await authRes.json();
      const token = authData.token;

      // 2. Submit order request to Pesapal
      const description = `TradePOS ${plan} Plan - ${durationMonths} Month(s) License`;
      const nameParts = customerName.trim().split(" ");
      const firstName = nameParts[0] || "Valued";
      const lastName = nameParts.slice(1).join(" ") || "Client";

      const orderPayload: any = {
        id: invoiceNumber,
        currency,
        amount: Number(amount),
        description,
        callback_url: `${appUrl}/api/pesapal/callback`,
        notification_id: process.env.PESAPAL_IPN_ID || undefined,
        billing_address: {
          email_address: customerEmail,
          phone_number: customerPhone,
          country_code: "TZ",
          first_name: firstName,
          last_name: lastName,
          line_1: "Tanzania",
        },
      };

      const orderRes = await fetch(`${baseUrl}/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const orderErr = await orderRes.text();
        console.error("Pesapal Order Submit Error:", orderErr);
        return NextResponse.json(
          { error: "Failed to register order with Pesapal", details: orderErr },
          { status: 502 }
        );
      }

      const orderData = await orderRes.json();

      return NextResponse.json({
        success: true,
        mode: "live",
        orderTrackingId: orderData.order_tracking_id,
        merchantReference: orderData.merchant_reference || invoiceNumber,
        redirectUrl: orderData.redirect_url,
        invoiceNumber,
        amount,
        currency,
        plan,
        durationMonths,
      });
    }

    // Otherwise, simulate a seamless instant STK push & real invoice generation
    // This allows complete offline / localhost test of Pesapal before Railway deployment
    const simulatedTrackingId = `pesa-test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      mode: "simulation",
      orderTrackingId: simulatedTrackingId,
      merchantReference: invoiceNumber,
      invoiceNumber,
      amount,
      currency,
      plan,
      durationMonths,
      customerPhone,
      message: "Order initiated. Ready for automated verification or STK push prompt.",
    });
  } catch (error: any) {
    console.error("Checkout API handler error:", error);
    return NextResponse.json(
      { error: "Internal checkout server error", message: error?.message },
      { status: 500 }
    );
  }
}
