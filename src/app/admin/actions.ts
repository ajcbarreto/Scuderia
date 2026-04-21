"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AttachmentKind } from "@/types/database";

export type ActionState = { error?: string; ok?: boolean };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/admin");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    redirect("/garagem");
  }
  return { supabase, userId: user.id };
}

function sanitizeFilename(name: string) {
  const base = name.replace(/^.*[/\\]/, "");
  return base.replace(/[^\w.\-]+/g, "_").slice(0, 180) || "ficheiro";
}

export async function createMotorcycle(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const ownerId = String(formData.get("owner_id") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim() || null;
  const vin = String(formData.get("vin") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!brand || !model || !ownerId) {
    return { error: "Marca, modelo e cliente são obrigatórios." };
  }

  const year =
    yearRaw === "" ? null : Number.parseInt(yearRaw, 10);
  if (year !== null && (Number.isNaN(year) || year < 1900 || year > 2100)) {
    return { error: "Ano inválido." };
  }

  const { data: mota, error: mErr } = await supabase
    .from("motorcycles")
    .insert({
      brand,
      model,
      year,
      plate,
      vin,
      notes,
      current_owner_id: ownerId,
    })
    .select("id")
    .single();

  if (mErr || !mota) {
    return { error: mErr?.message ?? "Não foi possível criar a mota." };
  }

  const { error: pErr } = await supabase.from("motorcycle_ownership_periods").insert({
    motorcycle_id: mota.id,
    owner_id: ownerId,
    started_at: new Date().toISOString(),
    ended_at: null,
    transfer_note: null,
  });

  if (pErr) {
    return { error: pErr.message };
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  return { ok: true };
}

export async function transferMotorcycle(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const motorcycleId = String(formData.get("motorcycle_id") ?? "").trim();
  const newOwnerId = String(formData.get("new_owner_id") ?? "").trim();
  const transferNote = String(formData.get("transfer_note") ?? "").trim() || null;

  if (!motorcycleId || !newOwnerId) {
    return { error: "Mota e novo dono são obrigatórios." };
  }

  const { data: mota, error: fetchErr } = await supabase
    .from("motorcycles")
    .select("id, current_owner_id, created_at")
    .eq("id", motorcycleId)
    .maybeSingle();

  if (fetchErr || !mota) {
    return { error: "Mota não encontrada." };
  }

  if (mota.current_owner_id === newOwnerId) {
    return { error: "O novo dono é igual ao atual." };
  }

  const now = new Date().toISOString();

  const { data: openPeriod } = await supabase
    .from("motorcycle_ownership_periods")
    .select("id")
    .eq("motorcycle_id", motorcycleId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (openPeriod?.id) {
    const { error: endErr } = await supabase
      .from("motorcycle_ownership_periods")
      .update({ ended_at: now, transfer_note: transferNote })
      .eq("id", openPeriod.id);
    if (endErr) {
      return { error: endErr.message };
    }
  } else {
    const { error: insOldErr } = await supabase
      .from("motorcycle_ownership_periods")
      .insert({
        motorcycle_id: motorcycleId,
        owner_id: mota.current_owner_id,
        started_at: mota.created_at,
        ended_at: now,
        transfer_note: transferNote,
      });
    if (insOldErr) {
      return { error: insOldErr.message };
    }
  }

  const { error: insNewErr } = await supabase.from("motorcycle_ownership_periods").insert({
    motorcycle_id: motorcycleId,
    owner_id: newOwnerId,
    started_at: now,
    ended_at: null,
    transfer_note: null,
  });
  if (insNewErr) {
    return { error: insNewErr.message };
  }

  const { error: updErr } = await supabase
    .from("motorcycles")
    .update({ current_owner_id: newOwnerId })
    .eq("id", motorcycleId);
  if (updErr) {
    return { error: updErr.message };
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  revalidatePath("/garagem");
  return { ok: true };
}

export async function createServiceRecordFromMotaForm(formData: FormData) {
  const { supabase } = await requireAdmin();
  const motorcycleId = String(formData.get("motorcycle_id") ?? "").trim();
  if (!motorcycleId) {
    redirect("/admin/boletins");
  }

  const { data: mota } = await supabase
    .from("motorcycles")
    .select("id")
    .eq("id", motorcycleId)
    .maybeSingle();
  if (!mota) {
    redirect("/admin/boletins");
  }

  const { data: period } = await supabase
    .from("motorcycle_ownership_periods")
    .select("id")
    .eq("motorcycle_id", motorcycleId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: rec, error } = await supabase
    .from("service_records")
    .insert({
      motorcycle_id: motorcycleId,
      ownership_period_id: period?.id ?? null,
      status: "in_progress",
      title: "Nova intervenção",
      shop_notes: null,
    })
    .select("id")
    .single();

  if (error || !rec) {
    redirect("/admin/boletins");
  }

  revalidatePath("/admin/boletins");
  redirect(`/admin/boletins/${rec.id}`);
}

export async function updateServiceRecord(
  recordId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "").trim();
  const shopNotes = String(formData.get("shop_notes") ?? "").trim() || null;

  const allowed = ["draft", "in_progress", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return { error: "Estado inválido." };
  }

  const { error } = await supabase
    .from("service_records")
    .update({
      title,
      status: status as "draft" | "in_progress" | "completed" | "cancelled",
      shop_notes: shopNotes,
    })
    .eq("id", recordId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/boletins/${recordId}`);
  revalidatePath("/admin/boletins");
  revalidatePath("/garagem");
  return { ok: true };
}

export async function addServiceTask(recordId: string, label: string) {
  const { supabase } = await requireAdmin();
  const text = label.trim();
  if (!text) {
    return { error: "Indica a descrição da tarefa." };
  }

  const { data: last } = await supabase
    .from("service_tasks")
    .select("sort_order")
    .eq("service_record_id", recordId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (last?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("service_tasks").insert({
    service_record_id: recordId,
    label: text,
    sort_order: nextOrder,
    completed: false,
  });

  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/admin/boletins/${recordId}`);
  revalidatePath("/garagem");
  return { ok: true };
}

export async function addServiceTaskFromForm(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const recordId = String(formData.get("record_id") ?? "").trim();
  const label = String(formData.get("label") ?? "");
  return addServiceTask(recordId, label);
}

export async function setServiceTaskCompleted(
  taskId: string,
  recordId: string,
  completed: boolean,
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("service_tasks")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/admin/boletins/${recordId}`);
  revalidatePath("/garagem");
  return { ok: true };
}

export async function deleteServiceTask(taskId: string, recordId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("service_tasks").delete().eq("id", taskId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/admin/boletins/${recordId}`);
  revalidatePath("/garagem");
  return { ok: true };
}

export async function uploadServiceAttachment(
  recordId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolhe um ficheiro." };
  }

  const kind = String(formData.get("kind") ?? "").trim() as AttachmentKind;
  if (!["invoice", "photo", "other"].includes(kind)) {
    return { error: "Tipo de anexo inválido." };
  }

  const visibleRaw = String(formData.get("visible_to_owner_id") ?? "").trim();
  const visibleToOwnerId =
    kind === "invoice" ? (visibleRaw || null) : null;

  if (kind === "invoice" && !visibleToOwnerId) {
    return { error: "Para faturas, indica o cliente que pode ver o documento." };
  }

  const { data: sr } = await supabase
    .from("service_records")
    .select("id")
    .eq("id", recordId)
    .maybeSingle();
  if (!sr) {
    return { error: "Boletim não encontrado." };
  }

  const safeName = sanitizeFilename(file.name);
  const storagePath = `${recordId}/${crypto.randomUUID()}_${safeName}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("service-files")
    .upload(storagePath, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (upErr) {
    return { error: upErr.message };
  }

  const { error: insErr } = await supabase.from("service_attachments").insert({
    service_record_id: recordId,
    kind,
    storage_bucket: "service-files",
    storage_path: storagePath,
    mime_type: file.type || null,
    visible_to_owner_id: visibleToOwnerId,
    created_by: userId,
  });

  if (insErr) {
    await supabase.storage.from("service-files").remove([storagePath]);
    return { error: insErr.message };
  }

  revalidatePath(`/admin/boletins/${recordId}`);
  revalidatePath("/admin/documentos");
  revalidatePath("/garagem");
  return { ok: true };
}

export async function deleteServiceAttachment(
  attachmentId: string,
  recordId: string,
  storagePath: string,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const { error: delDb } = await supabase
    .from("service_attachments")
    .delete()
    .eq("id", attachmentId);
  if (delDb) {
    return { error: delDb.message };
  }

  await supabase.storage.from("service-files").remove([storagePath]);

  revalidatePath(`/admin/boletins/${recordId}`);
  revalidatePath("/admin/documentos");
  revalidatePath("/garagem");
  return { ok: true };
}

export async function deleteServiceAttachmentForm(formData: FormData) {
  const attachmentId = String(formData.get("attachment_id") ?? "").trim();
  const recordId = String(formData.get("record_id") ?? "").trim();
  const storagePath = String(formData.get("storage_path") ?? "").trim();
  if (!attachmentId || !recordId || !storagePath) {
    return;
  }
  await deleteServiceAttachment(attachmentId, recordId, storagePath);
}
