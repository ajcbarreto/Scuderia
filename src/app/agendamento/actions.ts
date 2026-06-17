"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { logEvent } from "@/lib/analytics/log-event";
import {
  getClosedReason,
  loadWorkshopSchedule,
} from "@/lib/garagem/workshop-schedule";

export type AppointmentState = {
  error?: string;
  ok?: boolean;
};

const schema = z
  .object({
    preferred: z.string().trim().max(40).default(""),
    message: z.string().trim().max(2000).default(""),
  })
  .superRefine((data, ctx) => {
    if (!data.preferred && !data.message) {
      ctx.addIssue({
        code: "custom",
        message: "Indica uma data preferida ou descreve o que precisas.",
      });
    }
    if (data.preferred) {
      const parsed = new Date(data.preferred);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({ code: "custom", message: "Data inválida." });
      } else if (parsed.getTime() < Date.now() - 60_000) {
        ctx.addIssue({
          code: "custom",
          message: "Escolhe uma data no futuro.",
        });
      }
    }
  });

export async function submitAppointmentRequest(
  _prev: AppointmentState | undefined,
  formData: FormData,
): Promise<AppointmentState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/agendamento");
  }

  const parsed = schema.safeParse({
    preferred: String(formData.get("preferred") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { preferred, message } = parsed.data;
  const supabase = await createClient();

  // Validação contra os dias fechados da oficina (também aplicada no cliente,
  // mas reforçada aqui para evitar contornar via DevTools / API directa).
  if (preferred) {
    const schedule = await loadWorkshopSchedule(supabase);
    const reason = getClosedReason(preferred, schedule);
    if (reason) {
      return { error: `${reason} Escolhe outra data.` };
    }
  }

  const preferredStart = preferred ? new Date(preferred).toISOString() : null;

  const { data: created, error } = await supabase
    .from("appointment_requests")
    .insert({
      client_id: user.id,
      preferred_start: preferredStart,
      message: message || null,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  await logEvent({
    eventType: "appointment_requested",
    userId: user.id,
    role: "client",
    entityType: "appointment",
    entityId: created?.id ?? null,
  });

  revalidatePath("/agendamento");
  revalidatePath("/admin");
  return { ok: true };
}
