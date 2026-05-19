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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function urgencyColor(days: number): string {
  if (days <= 7) return "#c41230"; // vermelho (Ducati)
  if (days <= 14) return "#d97706"; // âmbar
  return "#475569"; // neutro
}

function reminderHtml(opts: {
  ownerName: string | null;
  vehicle: string;
  daysBefore: number;
  dueDate: string;
  agendamentoUrl: string;
}): string {
  const greeting = opts.ownerName
    ? `Olá <strong>${escapeHtml(opts.ownerName)}</strong>,`
    : "Olá,";
  const color = urgencyColor(opts.daysBefore);
  const vehicle = escapeHtml(opts.vehicle);
  const dueDate = escapeHtml(opts.dueDate);

  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1c;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f5f7;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.05);max-width:560px;width:100%;">
      <tr><td style="height:6px;background:#c41230;line-height:6px;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:36px 40px 0 40px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:3px;color:#c41230;text-transform:uppercase;">Scuderia itTECH</div>
        <h1 style="margin:14px 0 0 0;font-size:24px;font-weight:700;line-height:1.25;color:#1a1a1c;">Próxima revisão a aproximar-se</h1>
      </td></tr>
      <tr><td style="padding:20px 40px 8px 40px;font-size:15px;line-height:1.65;color:#3f3f46;">
        <p style="margin:0 0 14px 0;">${greeting}</p>
        <p style="margin:0 0 18px 0;">A revisão da tua <strong>${vehicle}</strong> está prevista para:</p>
      </td></tr>
      <tr><td style="padding:0 40px;">
        <div style="border:2px solid ${color};background:${color}0d;border-radius:10px;padding:18px 20px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#71717a;text-transform:uppercase;margin-bottom:6px;">Data prevista</div>
          <div style="font-size:22px;font-weight:700;color:${color};line-height:1.2;">${dueDate}</div>
          <div style="margin-top:6px;font-size:13px;font-weight:600;color:${color};">Daqui a cerca de ${opts.daysBefore} dia${opts.daysBefore === 1 ? "" : "s"}</div>
        </div>
      </td></tr>
      <tr><td style="padding:24px 40px 8px 40px;font-size:15px;line-height:1.65;color:#3f3f46;">
        <p style="margin:0 0 24px 0;">Agenda já a tua marcação na garagem digital — escolhe a tua data preferida e a equipa confirma por contacto.</p>
      </td></tr>
      <tr><td align="center" style="padding:0 40px 32px 40px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="background:#c41230;border-radius:8px;">
          <a href="${opts.agendamentoUrl}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.4px;">Pedir agendamento</a>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:18px 40px 28px 40px;font-size:12px;line-height:1.5;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
        <p style="margin:0;">Recebes este email porque há uma revisão registada para a tua mota.</p>
      </td></tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding:16px 0;font-size:11px;letter-spacing:2px;color:#a1a1aa;text-transform:uppercase;">© Scuderia itTECH · Engineering precision</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const agendamentoUrl = `${siteUrl}/agendamento`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: `Scuderia itTECH — revisão da ${opts.vehicle} em ${opts.daysBefore} dia${opts.daysBefore === 1 ? "" : "s"}`,
      text: [
        `Olá${greeting},`,
        "",
        `A próxima revisão da tua ${opts.vehicle} está prevista para ${opts.dueDate}`,
        `(daqui a cerca de ${opts.daysBefore} dias).`,
        "",
        "Agenda já a tua marcação na garagem digital:",
        agendamentoUrl,
        "",
        "Scuderia itTECH",
      ].join("\n"),
      html: reminderHtml({
        ownerName: opts.ownerName,
        vehicle: opts.vehicle,
        daysBefore: opts.daysBefore,
        dueDate: opts.dueDate,
        agendamentoUrl,
      }),
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
