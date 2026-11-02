import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAccountForToken, SESSION_COOKIE } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";

  if (host.startsWith("www.")) {
    const apex = host.replace(/^www\./, "").split(":")[0];
    const url = new URL(request.url);
    url.hostname = apex;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const path = request.nextUrl.pathname;
  const protectedPage = /^\/(shop|products|search|cart|checkout|favorites|compare|v2)(\/|$)/.test(path);
  const protectedApi = /^\/api\/(catalog|products|search|orders)(\/|$)/.test(path) || /^\/api\/payments\/yookassa\/(status|config)$/.test(path) || path === "/api/notify/max-purchase";
  if (protectedPage || protectedApi) {
    const account = await getAccountForToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!account?.access) {
      if (protectedApi) return NextResponse.json({ error: "Для доступа необходимо подтверждение регистрации" }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }
  const response = NextResponse.next();
  if (protectedPage || protectedApi || path === "/" || path.startsWith("/account")) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  if (path.startsWith("/account")) response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|images/|yandex_).*)",
};
