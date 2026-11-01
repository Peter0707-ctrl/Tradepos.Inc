import { NextRequest, NextResponse } from "next/server";

// Common exploit scanner paths (PHP scripts, WordPress, environment files, git dumps, source maps, etc.)
const BLOCKED_PATH_PATTERNS = [
  /\.env(\..+)?$/i,
  /\.git(\/.*)?$/i,
  /\.aws(\/.*)?$/i,
  /\.ssh(\/.*)?$/i,
  /\.php(\/.*)?$/i,
  /\.js\.map$/i,
  /\.css\.map$/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/xmlrpc\.php/i,
  /\/phpmyadmin/i,
  /\/pma/i,
  /\/adminer/i,
  /\/cgi-bin/i,
  /\/actuator/i,
  /\/eval-stdin/i,
  /\/vendor\/phpunit/i,
  /\/\.ds_store/i,
];

// Allowed HTTP methods for web traffic
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // 1. Enforce allowed HTTP methods
  if (!ALLOWED_METHODS.has(method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // 2. Reject malicious path traversal attacks (e.g. /../../etc/passwd, %2e%2e)
  const rawPath = request.url;
  if (
    rawPath.includes("..") ||
    rawPath.includes("%2e%2e") ||
    rawPath.includes("%2E%2E") ||
    rawPath.includes("%00")
  ) {
    return new NextResponse("Forbidden: Invalid Path Traversal", { status: 403 });
  }

  // 3. Block automated vulnerability scanners probing for PHP, WP, .env, .git, .map
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse("Forbidden: Access Denied", { status: 403 });
    }
  }

  // 4. API Request Hardening & CORS protection for /api/*
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || "";

    // If an external origin is specified, verify it matches our host or trusted domains
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;

        const isLocalhost =
          originHost.startsWith("localhost:") ||
          originHost.startsWith("127.0.0.1:") ||
          originHost === "localhost";

        const isTradePosDomain =
          originHost === host ||
          originHost.endsWith(".up.railway.app") ||
          originHost.endsWith("tradepos.co.tz") ||
          originHost.endsWith("tradepos.cloud");

        if (!isLocalhost && !isTradePosDomain) {
          return NextResponse.json(
            { error: "Forbidden: Untrusted Cross-Origin Request" },
            { status: 403 }
          );
        }
      } catch {
        return new NextResponse("Bad Request: Malformed Origin Header", { status: 400 });
      }
    }

    if (method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.headers.set("Access-Control-Max-Age", "86400");
      }
      return response;
    }
  }

  // 5. Proceed with request and inject hardened response headers
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js).*)"],
};
