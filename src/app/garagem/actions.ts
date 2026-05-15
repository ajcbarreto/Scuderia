"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Invalida caches que dependem da sessão (layouts protegidos têm
  // verificações de role que precisam de re-correr).
  revalidatePath("/", "layout");
  redirect("/");
}
