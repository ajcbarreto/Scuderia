import type { UserRole } from "@/types/database";

/** Reject open redirects; only same-origin relative paths. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\"))
    return null;
  return next;
}

/**
 * Admins vão para o backoffice; clientes seguem `?next=` ou `/garagem`.
 * Excepção: `/onboarding/*` é sempre honrado (após convite, qualquer role
 * precisa de definir a sua palavra-passe antes de continuar).
 */
export function resolvePostLoginPath(
  role: UserRole | null | undefined,
  nextParam: string | null | undefined,
): string {
  const safeNext = safeNextPath(nextParam ?? null);
  if (safeNext?.startsWith("/onboarding/")) return safeNext;
  if (role === "admin") return "/admin";
  return safeNext ?? "/garagem";
}

/** Destino do ícone «conta» no site público consoante a sessão. */
export function accountAreaHref(role: UserRole | null | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "client") return "/garagem";
  return "/login";
}

export function accountAreaLabel(role: UserRole | null | undefined): string {
  if (role === "admin") return "Backoffice";
  if (role === "client") return "Garagem";
  return "Entrar";
}
