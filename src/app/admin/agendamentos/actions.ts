"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/app/admin/actions";
import type { AppointmentStatus } from "@/types/database";

export type AgendamentoActionState = {
  error?: string;
  ok?: boolean;
};

function revalidateAll() {
  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin");
  revalidatePath("/garagem");
  revalidatePath("/agendamento");
}

const idSchema = z.string().uuid("ID inválido.");
const noteSchema = z.string().trim().max(500).optional();

const confirmSchema = z.object({
  id: idSchema,
  confirmedStart: z
    .string()
    .trim()
    .min(1, "Indica uma data confirmada.")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), "Data inválida.")
    .refine(
      (s) => new Date(s).getTime() > Date.now() - 60_000,
      "A data confirmada não pode ser no passado.",
    ),
  note: noteSchema,
});

export async function confirmAppointment(
  _prev: AgendamentoActionState | undefined,
  formData: FormData,
): Promise<AgendamentoActionState> {
  const { supabase } = await requireAdmin();

  const parsed = confirmSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    confirmedStart: String(formData.get("confirmed_start") ?? ""),
    note: String(formData.get("admin_note") ?? "") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await supabase
    .from("appointment_requests")
    .update({
      status: "confirmed" satisfies AppointmentStatus,
      confirmed_start: new Date(parsed.data.confirmedStart).toISOString(),
      confirmed_at: new Date().toISOString(),
      admin_note: parsed.data.note ?? null,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

const rejectSchema = z.object({ id: idSchema, note: noteSchema });

export async function rejectAppointment(
  _prev: AgendamentoActionState | undefined,
  formData: FormData,
): Promise<AgendamentoActionState> {
  const { supabase } = await requireAdmin();

  const parsed = rejectSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    note: String(formData.get("admin_note") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await supabase
    .from("appointment_requests")
    .update({
      status: "rejected" satisfies AppointmentStatus,
      admin_note: parsed.data.note ?? null,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

const simpleSchema = z.object({ id: idSchema });

export async function completeAppointment(
  _prev: AgendamentoActionState | undefined,
  formData: FormData,
): Promise<AgendamentoActionState> {
  const { supabase } = await requireAdmin();

  const parsed = simpleSchema.safeParse({ id: String(formData.get("id") ?? "") });
  if (!parsed.success) return { error: "ID inválido." };

  const { error } = await supabase
    .from("appointment_requests")
    .update({ status: "completed" satisfies AppointmentStatus })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function revertToPending(
  _prev: AgendamentoActionState | undefined,
  formData: FormData,
): Promise<AgendamentoActionState> {
  const { supabase } = await requireAdmin();

  const parsed = simpleSchema.safeParse({ id: String(formData.get("id") ?? "") });
  if (!parsed.success) return { error: "ID inválido." };

  const { error } = await supabase
    .from("appointment_requests")
    .update({
      status: "pending" satisfies AppointmentStatus,
      confirmed_start: null,
      confirmed_at: null,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}
