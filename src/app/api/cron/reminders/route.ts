import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Cron diário (ver `vercel.json`) que envia lembretes de próxima revisão.
 *
 * Para cada boletim de manutenção com `next_service_due_date` a chegar,
 * envia UM email no limiar mais próximo ainda não enviado (7/14/30 dias) e
 * regista-o em `service_reminders` para nunca duplicar.
 *
 * Protegido por `CRON_SECRET` — a Vercel injecta `Authorization: Bearer <secret>`
 * automaticamente nos crons quando a env var existe.
 */

export const dynamic = "force-dynamic";

// Ordenados do mais urgente para o menos urgente.
const THRESHOLDS = [7, 14, 30] as const;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / 86_400_000);
}

async function sendReminderEmail(opts: {
  to: string;
  ownerName: string | null;
  vehicle: string;
  daysBefore: number;
  dueDate: string;
}): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!resendKey || !from) {
    // Sem Resend configurado — em dev limitamo-nos a registar.
    if (process.env.NODE_ENV === "development") {
      console.log("[cron/reminders] (sem Resend)", opts);
    }
    return false;
  }

  const greeting = opts.ownerName ? ` ${opts.ownerName}` : "";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: `Scuderia itTech — revisão da ${opts.vehicle} a aproximar-se`,
      text: [
        `Olá${greeting},`,
        "",
        `A próxima revisão da tua ${opts.vehicle} está prevista para ${opts.dueDate}`,
        `(daqui a cerca de ${opts.daysBefore} dias).`,
        "",
        "Agenda já a tua marcação na garagem digital:",
        `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/agendamento`,
        "",
        "Scuderia itTech",
      ].join("\n"),
    }),
  });
  return r.ok;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "config" },
      { status: 500 },
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 30);

  // Boletins de manutenção com revisão prevista dentro dos próximos 30 dias.
  const { data: dueRecords, error: recErr } = await admin
    .from("service_records")
    .select("id, motorcycle_id, next_service_due_date")
    .eq("record_kind", "maintenance")
    .not("next_service_due_date", "is", null)
    .gte("next_service_due_date", today.toISOString().slice(0, 10))
    .lte("next_service_due_date", horizon.toISOString().slice(0, 10));

  if (recErr) {
    return NextResponse.json({ error: recErr.message }, { status: 500 });
  }

  const records = dueRecords ?? [];
  if (records.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, sent: 0 });
  }

  // Lembretes já enviados para estes boletins.
  const recordIds = records.map((r) => r.id);
  const { data: existing } = await admin
    .from("service_reminders")
    .select("service_record_id, days_before")
    .in("service_record_id", recordIds);

  const sentSet = new Set(
    (existing ?? []).map((r) => `${r.service_record_id}:${r.days_before}`),
  );

  // Motas referenciadas.
  const motoIds = [...new Set(records.map((r) => r.motorcycle_id))];
  const { data: motos } = await admin
    .from("motorcycles")
    .select("id, brand, model, current_owner_id")
    .in("id", motoIds);
  const motoById = new Map((motos ?? []).map((m) => [m.id, m]));

  let sent = 0;
  const errors: string[] = [];

  for (const rec of records) {
    if (!rec.next_service_due_date) continue;
    const due = new Date(`${rec.next_service_due_date}T12:00:00`);
    const daysUntil = daysBetween(today, due);

    // Limiares aplicáveis ainda não enviados.
    const applicable = THRESHOLDS.filter(
      (t) => daysUntil <= t && !sentSet.has(`${rec.id}:${t}`),
    );
    if (applicable.length === 0) continue;

    const moto = motoById.get(rec.motorcycle_id);
    if (!moto) continue;

    // Resolver email do dono atual.
    const { data: ownerData } = await admin.auth.admin.getUserById(
      moto.current_owner_id,
    );
    const email = ownerData?.user?.email;
    if (!email) continue;

    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", moto.current_owner_id)
      .maybeSingle();

    // Envia UM email no limiar mais urgente; marca todos os aplicáveis como
    // enviados para não disparar os restantes em corridas seguintes.
    const threshold = Math.min(...applicable);
    const delivered = await sendReminderEmail({
      to: email,
      ownerName: ownerProfile?.full_name ?? null,
      vehicle: `${moto.brand} ${moto.model}`,
      daysBefore: threshold,
      dueDate: due.toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });

    const { error: insErr } = await admin.from("service_reminders").insert(
      applicable.map((t) => ({ service_record_id: rec.id, days_before: t })),
    );
    if (insErr) {
      errors.push(`${rec.id}: ${insErr.message}`);
      continue;
    }
    if (delivered) sent += 1;
  }

  return NextResponse.json({
    ok: true,
    checked: records.length,
    sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
