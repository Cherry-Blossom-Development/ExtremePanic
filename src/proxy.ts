import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "crypto";

function expectedToken() {
  return createHmac("sha256", process.env.ADMIN_PASSWORD ?? "")
    .update("admin-session")
    .digest("hex");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  if (!process.env.ADMIN_PASSWORD || token !== expectedToken()) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
