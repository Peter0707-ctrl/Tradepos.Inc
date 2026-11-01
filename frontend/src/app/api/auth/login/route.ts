import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { resolveSecret } from "@/lib/secretVault";

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

// Constant-time string comparison to prevent timing side-channel attacks
function safeCompareHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a.trim().toLowerCase(), "utf-8");
  const bufB = Buffer.from(b.trim().toLowerCase(), "utf-8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// SHA-256 hash of platform Super Admin credential (zero plaintext password in source code)
const DEFAULT_SUPER_ADMIN_SHA256 =
  "1ac4b6d753daefd075a051d4e487171cffeeaa6054e60ed0c5125f6c4625991b";

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

    if (!identifier || typeof identifier !== "string" || identifier.length > 255) {
      return NextResponse.json(
        { success: false, error: "Tafadhali ingiza barua pepe au namba ya simu sahihi." },
        { status: 400 }
      );
    }

    if (password && (typeof password !== "string" || password.length > 255)) {
      return NextResponse.json(
        { success: false, error: "Muundo wa nenosiri si sahihi." },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    const expectedAdminEmail = (
      resolveSecret("ADMIN_EMAIL") || "crestgroup@gmail.com"
    )
      .trim()
      .toLowerCase();
    const legacyAdminEmail = "admin@tradepos.cloud";

    const envAdminPassword = resolveSecret("ADMIN_PASSWORD");
    const expectedAdminHash =
      resolveSecret("ADMIN_PASSWORD_HASH") ||
      (envAdminPassword
        ? crypto.createHash("sha256").update(envAdminPassword).digest("hex")
        : DEFAULT_SUPER_ADMIN_SHA256);

    const isSuperAdminCandidate =
      cleanInput === expectedAdminEmail || cleanInput === legacyAdminEmail;

    if (isSuperAdminCandidate) {
      if (!cleanPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "Nenosiri la Admin linahitajika.",
          },
          { status: 401 }
        );
      }

      const providedHash = crypto
        .createHash("sha256")
        .update(cleanPassword)
        .digest("hex");

      if (!safeCompareHex(providedHash, expectedAdminHash)) {
        return NextResponse.json(
          {
            success: false,
            error: "Nenosiri la Admin si sahihi. Tafadhali thibitisha nenosiri lako.",
          },
          { status: 401 }
        );
      }

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

    return NextResponse.json({
      success: true,
      isSuperAdmin: false,
      identifier: cleanInput,
    });
  } catch {
    console.error("[TradePOS Auth] Authentication handler failed");
    return NextResponse.json(
      { success: false, error: "Hitilafu ya ndani ya seva ya uthibitishaji." },
      { status: 500 }
    );
  }
}
