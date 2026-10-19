import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get("orderTrackingId");

    if (!orderTrackingId) {
      return NextResponse.json({ error: "Missing orderTrackingId" }, { status: 400 });
    }

    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const pesapalEnv = process.env.PESAPAL_ENV || "production";

    // If credentials exist, query Pesapal
    if (consumerKey && consumerSecret) {
      const baseUrl =
        pesapalEnv === "production"
          ? "https://pay.pesapal.com/v3/api"
          : "https://cybqa.pesapal.com/pesapalv3/api";

      // 1. Get Token
      const authRes = await fetch(`${baseUrl}/Auth/RequestToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
      });

      if (!authRes.ok) {
        return NextResponse.json({
          completed: false,
          status: "AUTH_FAILED",
          message: "Failed to authenticate with Pesapal",
        });
      }

      const authData = await authRes.json();
      const token = authData.token;

      // 2. Query status directly from Pesapal gateway
      const statusRes = await fetch(
        `${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!statusRes.ok) {
        return NextResponse.json({
          completed: false,
          status: "PENDING",
        });
      }

      const statusData = await statusRes.json();

      // Only mark completed if Pesapal explicitly returns Completed or status_code === 1
      const isCompleted =
        statusData.payment_status_description === "Completed" || statusData.status_code === 1;

      return NextResponse.json({
        completed: isCompleted,
        status: statusData.payment_status_description || "PENDING",
        confirmationCode: statusData.confirmation_code || statusData.payment_account || "",
        paymentMethod: statusData.payment_method || "Mobile Money",
        amount: statusData.amount,
      });
    }

    return NextResponse.json({
      completed: false,
      status: "CONFIG_ERROR",
      message: "Pesapal credentials not configured",
    });
  } catch (error: any) {
    return NextResponse.json({ completed: false, error: error.message }, { status: 500 });
  }
}
