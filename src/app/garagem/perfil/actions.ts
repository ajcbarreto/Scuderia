"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export type ProfileActionState = {
  error?: string;
  ok?: boolean;
};

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório.")
    .max(200, "Nome demasiado longo."),
  phone: z
    .string()
    .trim()
    .max(40, "Telefone demasiado longo.")
    .optional()
    .transform((s) => (s ? s : null)),
});

export async function updateOwnProfile(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/garagem/perfil");
  }

  const parsed = schema.safeParse({
    fullName: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  // RLS `profiles_update_own` garante que só se actualiza o próprio registo.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/garagem/perfil");
  revalidatePath("/garagem", "layout");
  return { ok: true };
}
