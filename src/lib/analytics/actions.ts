"use server";

import { getProfile, getSessionUser } from "@/lib/auth";
import { logEvent } from "@/lib/analytics/log-event";

/**
 * Regista um login feito pelos forms client-side (`signInWithPassword`).
 * Nesse ponto a sessão já está nos cookies, por isso conseguimos identificar
 * o utilizador a partir do servidor. Best-effort — ver `logEvent`.
 */
export async function recordLogin(): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const profile = await getProfile();
  await logEvent({
    eventType: "login",
    userId: user.id,
    role: profile?.role ?? null,
    metadata: { method: "password" },
  });
}

/**
 * Regista a ativação de conta a partir do convite (`verifyOtp`), chamado pelo
 * form de ativação após o link de convite ser validado.
 */
export async function recordAccountActivated(): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  await logEvent({
    eventType: "account_activated",
    userId: user.id,
    role: "client",
  });
}

/** Regista a mudança voluntária de palavra-passe no perfil do cliente. */
export async function recordPasswordChanged(): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  await logEvent({
    eventType: "password_changed",
    userId: user.id,
    role: "client",
  });
}

/**
 * Regista uma visita a uma página pública (visitante anónimo ou cliente a ver
 * o site). Cookieless: o `anon` vem do `sessionStorage` do browser, não é um
 * cookie persistente nem identifica a pessoa entre sessões. Sem IP nem
 * fingerprint; o referrer é só o hostname de origem.
 */
export async function recordPageView(
  path: string,
  anon: string,
  ref: string,
): Promise<void> {
  if (typeof path !== "string" || !path || path.length > 512) return;
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;
  await logEvent({
    eventType: "page_view",
    userId: user?.id ?? null,
    role: profile?.role ?? null,
    metadata: {
      path: path.slice(0, 512),
      ref: (typeof ref === "string" && ref ? ref.slice(0, 128) : null),
      anon: (typeof anon === "string" && anon ? anon.slice(0, 64) : null),
    },
  });
}

/** Regista a visualização de um boletim pelo cliente (chamado no mount da página). */
export async function recordBoletimView(recordId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const profile = await getProfile();
  await logEvent({
    eventType: "boletim_viewed",
    userId: user.id,
    role: profile?.role ?? null,
    entityType: "service_record",
    entityId: recordId,
  });
}
