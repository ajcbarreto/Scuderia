import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadChecklistPresetsForMoto } from "@/lib/maintenance-checklist";
import { BoletimEditor } from "./boletim-editor";
import type {
  Motorcycle,
  Profile,
  ServiceAttachment,
  ServiceRecord,
  ServiceTask,
} from "@/types/database";

type Props = { params: Promise<{ recordId: string }> };

export default async function AdminBoletimDetailPage({ params }: Props) {
  const { recordId } = await params;
  const supabase = await createClient();

  const { data: record } = await supabase
    .from("service_records")
    .select("*")
    .eq("id", recordId)
    .maybeSingle();

  if (!record) notFound();
  const r = record as ServiceRecord;

  const { data: mota } = await supabase
    .from("motorcycles")
    .select("id, brand, model, plate, year")
    .eq("id", r.motorcycle_id)
    .maybeSingle();

  if (!mota) notFound();

  const m = mota as Pick<
    Motorcycle,
    "id" | "brand" | "model" | "plate" | "year"
  >;
  const checklistPresets = await loadChecklistPresetsForMoto(
    supabase,
    m.brand,
    m.model,
    m.year ?? null,
  );

  const [{ data: tasks }, { data: attachments }, { data: clients }] =
    await Promise.all([
      supabase
        .from("service_tasks")
        .select("*")
        .eq("service_record_id", recordId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("service_attachments")
        .select("*")
        .eq("service_record_id", recordId)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("role", "client")
        .order("full_name", { ascending: true }),
    ]);

  return (
    <BoletimEditor
      record={r}
      mota={m}
      tasks={(tasks ?? []) as ServiceTask[]}
      attachments={(attachments ?? []) as ServiceAttachment[]}
      clients={(clients ?? []) as Pick<Profile, "id" | "full_name" | "phone">[]}
      checklistPresets={checklistPresets}
    />
  );
}
