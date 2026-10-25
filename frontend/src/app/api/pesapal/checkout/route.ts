import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
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

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > 100_000_000) {
      return NextResponse.json(
        { error: "Kiasi cha malipo si sahihi (Invalid payment amount)." },
        { status: 400 }
      );
    }

    const durationNum = parseInt(String(durationMonths), 10);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 36) {
      return NextResponse.json(
        { error: "Muda wa leseni si sahihi (Invalid duration)." },
        { status: 400 }
      );
    }

    const cleanEmail = String(customerEmail).trim().slice(0, 150);
    const cleanPhone = String(customerPhone).replace(/[^\d+]/g, "").slice(0, 30);
    const cleanName = String(customerName).trim().slice(0, 100) || "TradePOS Merchant";

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
      const description = `TradePOS ${plan} Plan - ${durationNum} Month(s) License`;
      const nameParts = cleanName.split(" ");
      const firstName = nameParts[0] || "Valued";
      const lastName = nameParts.slice(1).join(" ") || "Client";

      const orderPayload: any = {
        id: invoiceNumber,
        currency,
        amount: amountNum,
        description,
        callback_url: `${appUrl}/api/pesapal/callback`,
        notification_id: process.env.PESAPAL_IPN_ID || "869cdf16-9dfd-4425-bd93-da0fab88203d",
        billing_address: {
          email_address: cleanEmail,
          phone_number: cleanPhone,
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

      const orderData = await orderRes.json().catch(() => ({}));

      // If Pesapal merchant account has limit / contractual verification pending or declined
      if (orderData.error) {
        console.error("Pesapal Order Submission Error:", orderData.error);
        let userMessage = orderData.error.message || "Pesapal order request was declined.";
        if (
          orderData.error.code === "amount_exceeds_default_limit" ||
          orderData.error.error_type === "contractual_error"
        ) {
          userMessage =
            "Lango la Pesapal limekataa muamala: Kiasi kinazidi kikomo cha akaunti yako ya Pesapal (amount exceeds limit). Wasiliana na support@pesapal.com ili wakuongezee kikomo cha biashara, au tumia Lipa Namba hapa chini.";
        } else if (
          orderData.error.code === "maximum_amount_limit_exceeded" ||
          orderData.error.error_type === "test_transactions_exceeded"
        ) {
          userMessage =
            "Lango la Pesapal limekataa muamala: Kikomo cha miamala ya majaribio (test limit) kimefikiwa kwenye akaunti hii. Wasiliana na support@pesapal.com, au tumia Lipa Namba.";
        }

        return NextResponse.json(
          {
            error: userMessage,
            code: orderData.error.code,
            details: orderData.error,
          },
          { status: 400 }
        );
      }

      if (orderData.redirect_url || orderData.order_tracking_id) {
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

      return NextResponse.json(
        {
          error: "Lango la Pesapal halikurudisha namba ya uthibitisho (order tracking ID). Tafadhali jaribu tena au tumia Lipa Namba.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: "Vigezo vya akaunti ya Pesapal (Consumer Key na Secret) havijawekwa kwenye mfumo.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Checkout API handler error:", error?.message || error);
    return NextResponse.json(
      { error: "Hitilafu ya seva wakati wa kuanzisha malipo. Tafadhali jaribu tena." },
      { status: 500 }
    );
  }
}
