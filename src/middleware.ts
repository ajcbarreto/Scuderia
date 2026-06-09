import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Quando o Supabase não aceita o `redirectTo` do convite (URL fora da allowlist),
 * o link cai na homepage com `?code=`. Redireciona para `/auth/callback`.
 */
function redirectAuthCodeToCallback(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname.startsWith("/auth/callback")) return null;

  const code = searchParams.get("code");
  if (!code) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  if (!url.searchParams.get("next")) {
    url.searchParams.set("next", "/onboarding/set-password");
  }
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const authRedirect = redirectAuthCodeToCallback(request);
  if (authRedirect) return authRedirect;

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
