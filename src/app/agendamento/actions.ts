"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

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
  const preferredStart = preferred ? new Date(preferred).toISOString() : null;

  const supabase = await createClient();
  const { error } = await supabase.from("appointment_requests").insert({
    client_id: user.id,
    preferred_start: preferredStart,
    message: message || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/agendamento");
  revalidatePath("/admin");
  return { ok: true };
}
