import type { UserRole } from "@/types/database";

/** Reject open redirects; only same-origin relative paths. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

/** Admins always land in the backoffice; clients use ?next= or /garagem. */
export function resolvePostLoginPath(
  role: UserRole | null | undefined,
  nextParam: string | null | undefined,
): string {
  if (role === "admin") return "/admin";
  return safeNextPath(nextParam ?? null) ?? "/garagem";
}
