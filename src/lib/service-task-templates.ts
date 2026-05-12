import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceTaskTemplate } from "@/types/database";

export async function loadServiceTaskTemplates(
  supabase: SupabaseClient,
): Promise<ServiceTaskTemplate[]> {
  const { data, error } = await supabase
    .from("service_task_templates")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as ServiceTaskTemplate[];
}
