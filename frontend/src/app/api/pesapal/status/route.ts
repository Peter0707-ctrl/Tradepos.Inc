import { NextResponse } from "next/server";
import { resolveSecret } from "@/lib/secretVault";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTrackingId = searchParams.get("orderTrackingId");

    if (
      !rawTrackingId ||
      typeof rawTrackingId !== "string" ||
      rawTrackingId.length > 100 ||
      !/^[a-zA-Z0-9_-]+$/.test(rawTrackingId)
    ) {
      return NextResponse.json(
        { error: "Muundo wa orderTrackingId si sahihi (Invalid orderTrackingId format)." },
        { status: 400 }
      );
    }

    const orderTrackingId = rawTrackingId;
    const consumerKey = resolveSecret("PESAPAL_CONSUMER_KEY");
    const consumerSecret = resolveSecret("PESAPAL_CONSUMER_SECRET");
    const pesapalEnv = resolveSecret("PESAPAL_ENV") || "production";

    if (consumerKey && consumerSecret) {
      const baseUrl =
        pesapalEnv === "production"
          ? "https://pay.pesapal.com/v3/api"
          : "https://cybqa.pesapal.com/pesapalv3/api";

      const authRes = await fetch(`${baseUrl}/Auth/RequestToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
      });

      if (!authRes.ok) {
        return NextResponse.json({
          completed: false,
          status: "AUTH_FAILED",
          message: "Failed to authenticate with payment gateway",
        });
      }

      const authData = await authRes.json();
      const token = authData.token;

      const statusRes = await fetch(
        `${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
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
      message: "Payment gateway credentials not configured",
    });
  } catch {
    console.error("[Pesapal] Status API handler error");
    return NextResponse.json(
      { completed: false, error: "Hitilafu ya kuangalia hali ya malipo." },
      { status: 500 }
    );
  }
}
