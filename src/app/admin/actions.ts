"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SERVICE_REVISION_TYPES } from "@/lib/garagem/service-record-display";
import type { AttachmentKind, ServiceRevisionType } from "@/types/database";

export type ActionState = {
  error?: string;
  ok?: boolean;
  /** Mensagem informativa ao operador. */
  info?: string;
  /** Email da conta criada (para confirmar ao operador). */
  createdEmail?: string;
};

export async function requireAdmin() {
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

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function revalidateMotaForServiceRecord(
  supabase: SupabaseServer,
  serviceRecordId: string,
) {
  const { data } = await supabase
    .from("service_records")
    .select("motorcycle_id")
    .eq("id", serviceRecordId)
    .maybeSingle();
  revalidatePath("/admin/motas");
  if (data?.motorcycle_id) {
    revalidatePath(`/admin/motas/${data.motorcycle_id}`);
  }
}

const MIN_CLIENT_PASSWORD_LEN = 6;

export async function createClientUser(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (!fullName) {
    return { error: "O nome é obrigatório." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Indica um email válido." };
  }
  if (password.length < MIN_CLIENT_PASSWORD_LEN) {
    return {
      error: `A palavra-passe deve ter pelo menos ${MIN_CLIENT_PASSWORD_LEN} caracteres.`,
    };
  }
  if (password !== passwordConfirm) {
    return { error: "As palavras-passe não coincidem." };
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Define SUPABASE_SERVICE_ROLE_KEY no servidor (Supabase → Settings → API).";
    return { error: msg };
  }

  const { data: created, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (authError || !created.user) {
    return {
      error: authError?.message ?? "Não foi possível criar o utilizador.",
    };
  }

  const userId = created.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", userId);

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return {
      error: `Conta criada mas falhou ao atualizar o perfil: ${profileError.message}`,
    };
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  return { ok: true, createdEmail: email };
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

  const catalogEntryId = String(formData.get("catalog_entry_id") ?? "").trim();
  const ownerId = String(formData.get("owner_id") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim() || null;
  const vin = String(formData.get("vin") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  let brand = String(formData.get("brand") ?? "").trim();
  let model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  let year: number | null =
    yearRaw === "" ? null : Number.parseInt(yearRaw, 10);

  if (!ownerId) {
    return { error: "Cliente é obrigatório." };
  }

  if (catalogEntryId) {
    const { data: entry, error: catErr } = await supabase
      .from("motorcycle_catalog_entries")
      .select("id, brand, model, year")
      .eq("id", catalogEntryId)
      .maybeSingle();
    if (catErr || !entry) {
      return { error: "Entrada do catálogo inválida ou já não existe." };
    }
    brand = String(entry.brand).trim();
    model = String(entry.model).trim();
    year = entry.year as number;
  }

  if (!brand || !model) {
    return { error: "Marca e modelo são obrigatórios (escolhe do catálogo ou preenche manualmente)." };
  }

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
      catalog_entry_id: catalogEntryId || null,
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
  revalidatePath("/admin/motas");
  revalidatePath("/admin/checklists");
  revalidatePath(`/admin/motas/${mota.id}`);
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
  revalidatePath("/admin/motas");
  revalidatePath(`/admin/motas/${motorcycleId}`);
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

  const recordKindRaw = String(formData.get("record_kind") ?? "").trim();
  const record_kind =
    recordKindRaw === "shop_service" ? "shop_service" : "maintenance";

  const { data: rec, error } = await supabase
    .from("service_records")
    .insert({
      motorcycle_id: motorcycleId,
      ownership_period_id: period?.id ?? null,
      status: "in_progress",
      title: "Nova intervenção",
      shop_notes: null,
      record_kind,
    })
    .select("id")
    .single();

  if (error || !rec) {
    redirect("/admin/boletins");
  }

  const { data: tmpl } = await supabase
    .from("service_task_templates")
    .select("label, sort_order")
    .order("sort_order", { ascending: true });

  if (tmpl?.length) {
    const { error: taskInsErr } = await supabase.from("service_tasks").insert(
      tmpl.map((row) => ({
        service_record_id: rec.id,
        label: row.label,
        sort_order: row.sort_order,
        completed: false,
      })),
    );
    if (taskInsErr && process.env.NODE_ENV === "development") {
      console.error("[createServiceRecord] service_tasks insert:", taskInsErr.message);
    }
  }

  revalidatePath("/admin/boletins");
  revalidatePath("/admin/servico");
  revalidatePath("/admin/motas");
  revalidatePath(`/admin/motas/${motorcycleId}`);
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
  const recordKindRaw = String(formData.get("record_kind") ?? "").trim();
  const record_kind =
    recordKindRaw === "shop_service" ? "shop_service" : "maintenance";

  const serviceDateRaw = String(formData.get("service_date") ?? "").trim();
  const service_date =
    serviceDateRaw === ""
      ? null
      : /^\d{4}-\d{2}-\d{2}$/.test(serviceDateRaw)
        ? serviceDateRaw
        : null;
  if (serviceDateRaw !== "" && service_date === null) {
    return { error: "Data inválida." };
  }

  const repair_order_ref =
    String(formData.get("repair_order_ref") ?? "").trim() || null;

  const kmRaw = String(formData.get("odometer_km") ?? "").trim();
  let odometer_km: number | null = null;
  if (kmRaw !== "") {
    const n = Number.parseInt(kmRaw, 10);
    if (!Number.isFinite(n) || n < 0) {
      return { error: "Quilometragem inválida." };
    }
    odometer_km = n;
  }

  const revisionRaw = String(formData.get("revision_type") ?? "").trim();
  let revision_type: ServiceRevisionType | null = null;
  if (revisionRaw !== "") {
    if (!SERVICE_REVISION_TYPES.includes(revisionRaw as ServiceRevisionType)) {
      return { error: "Tipo de revisão inválido." };
    }
    revision_type = revisionRaw as ServiceRevisionType;
  }

  const nextDueDateRaw = String(formData.get("next_service_due_date") ?? "").trim();
  const next_service_due_date =
    nextDueDateRaw === ""
      ? null
      : /^\d{4}-\d{2}-\d{2}$/.test(nextDueDateRaw)
        ? nextDueDateRaw
        : null;
  if (nextDueDateRaw !== "" && next_service_due_date === null) {
    return { error: "Data da próxima revisão inválida." };
  }

  const nextDueKmRaw = String(formData.get("next_service_due_km") ?? "").trim();
  let next_service_due_km: number | null = null;
  if (nextDueKmRaw !== "") {
    const nk = Number.parseInt(nextDueKmRaw, 10);
    if (!Number.isFinite(nk) || nk < 0) {
      return { error: "Quilometragem da próxima revisão inválida." };
    }
    next_service_due_km = nk;
  }

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
      record_kind,
      service_date,
      repair_order_ref,
      odometer_km,
      revision_type,
      next_service_due_date,
      next_service_due_km,
    })
    .eq("id", recordId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/boletins/${recordId}`);
  revalidatePath("/admin/boletins");
  revalidatePath("/admin/servico");
  await revalidateMotaForServiceRecord(supabase, recordId);
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
  revalidatePath("/admin/boletins");
  revalidatePath("/admin/servico");
  await revalidateMotaForServiceRecord(supabase, recordId);
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
  revalidatePath("/admin/boletins");
  revalidatePath("/admin/servico");
  await revalidateMotaForServiceRecord(supabase, recordId);
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
  revalidatePath("/admin/boletins");
  revalidatePath("/admin/servico");
  await revalidateMotaForServiceRecord(supabase, recordId);
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
  await revalidateMotaForServiceRecord(supabase, recordId);
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
  await revalidateMotaForServiceRecord(supabase, recordId);
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
