import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// In-memory rate limiting map (IP -> timestamps array)
const loginAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 10; // Max 10 attempts per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (loginAttempts.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return true;
  }

  timestamps.push(now);
  loginAttempts.set(ip, timestamps);
  return false;
}

// Constant-time string comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Majaribio mengi ya kuingia kwa muda mfupi. Tafadhali subiri sekunde 60 kabla ya kujaribu tena.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { identifier, password } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, error: "Tafadhali ingiza barua pepe au namba ya simu." },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    // Platform Super Admin Credentials (Configurable via Environment Variables)
    const expectedAdminEmail = (process.env.ADMIN_EMAIL || "crestgroup@gmail.com").trim().toLowerCase();
    const expectedAdminPassword = process.env.ADMIN_PASSWORD || "CREST@132026";
    const legacyAdminEmail = "admin@tradepos.cloud";

    const isSuperAdminCandidate =
      cleanInput === expectedAdminEmail || cleanInput === legacyAdminEmail;

    if (isSuperAdminCandidate) {
      if (!cleanPassword || !safeCompare(cleanPassword, expectedAdminPassword)) {
        return NextResponse.json(
          {
            success: false,
            error: "Nenosiri la Admin si sahihi. Tafadhali thibitisha nenosiri lako.",
          },
          { status: 401 }
        );
      }

      // Return authenticated Super Admin profile (strictly omitting passwords or secrets)
      return NextResponse.json({
        success: true,
        user: {
          id: "usr-admin",
          name: "Platform Super Admin (Crest Group)",
          email: expectedAdminEmail,
          phone: "+255 700 000 000",
          role: "SUPER_ADMIN",
          businessId: "system",
          branchId: "global",
        },
      });
    }

    // For non-admin accounts, confirm the request format is valid so client-side state validates against registered staff
    return NextResponse.json({
      success: true,
      isSuperAdmin: false,
      identifier: cleanInput,
    });
  } catch (error: any) {
    console.error("Auth login API error:", error);
    return NextResponse.json(
      { success: false, error: "Hitilafu ya ndani ya seva ya uthibitishaji." },
      { status: 500 }
    );
  }
}
