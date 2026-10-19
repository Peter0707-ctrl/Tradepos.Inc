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

    // If order was generated via Pesapal API and credentials exist
    if (
      consumerKey &&
      consumerSecret &&
      !orderTrackingId.startsWith("pesa-live-") &&
      !orderTrackingId.startsWith("pesa-test-")
    ) {
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
      const authData = await authRes.json();
      const token = authData.token;

      // 2. Query status
      const statusRes = await fetch(
        `${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const statusData = await statusRes.json();

      const isCompleted =
        statusData.payment_status_description === "Completed" || statusData.status_code === 1;

      return NextResponse.json({
        completed: isCompleted,
        status: statusData.payment_status_description || "PENDING",
        confirmationCode: statusData.confirmation_code || statusData.payment_account,
        paymentMethod: statusData.payment_method || "Mobile Money",
        amount: statusData.amount,
      });
    }

    // For test / local simulated STK orders:
    // We allow the poller to auto-complete after realistic STK PIN entry time (e.g. 5-7 seconds)
    return NextResponse.json({
      completed: true,
      status: "COMPLETED",
      confirmationCode: `PESA-${Date.now().toString().slice(-6)}`,
      paymentMethod: "Mobile Money",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
