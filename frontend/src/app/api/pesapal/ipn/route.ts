import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderTrackingId = String(searchParams.get("OrderTrackingId") || "").slice(0, 100);
  const orderMerchantReference = String(searchParams.get("OrderMerchantReference") || "").slice(0, 100);
  const orderNotificationType = String(searchParams.get("OrderNotificationType") || "").slice(0, 50);

  // Pesapal IPN expects a 200 response with confirmation JSON
  return NextResponse.json({
    orderNotificationType,
    orderTrackingId,
    orderMerchantReference,
    status: 200,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      status: 200,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 200 });
  }
}
