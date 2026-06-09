"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SERVICE_REVISION_TYPES } from "@/lib/garagem/service-record-display";
import { formatInviteError, inviteRedirectUrl, resolveSiteUrl } from "@/lib/site-url";
import type { AttachmentKind, ServiceRevisionType } from "@/types/database";

export type ActionState = {
  error?: string;
  ok?: boolean;
  /** Mensagem informativa ao operador. */
  info?: string;
  /** Email da conta criada (para confirmar ao operador). */
  createdEmail?: string;
};

/**
 * Memoizado por request: várias server actions encadeadas no mesmo request
 * partilham o mesmo `getUser` + `select role` (em vez de 2 RTTs por action).
 */
const loadAdminContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: "anon" as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return {
    kind: "user" as const,
    supabase,
    userId: user.id,
    role: profile?.role ?? null,
  };
});

export async function requireAdmin() {
  const ctx = await loadAdminContext();
  if (ctx.kind === "anon") {
    redirect("/login?next=/admin");
  }
  if (ctx.role !== "admin") {
    redirect("/garagem");
  }
  return { supabase: ctx.supabase, userId: ctx.userId };
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

/**
 * Cria a conta do cliente e envia convite por email — o cliente define a
 * própria palavra-passe via `/onboarding/set-password`. O admin nunca toca
 * em credenciais.
 *
 * O trigger `handle_new_user` cria automaticamente o perfil `client`;
 * a seguir actualizamos `full_name` e `phone`.
 */
export async function createClientUser(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!fullName) {
    return { error: "O nome é obrigatório." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Indica um email válido." };
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

  const { url: siteUrl, fellBack } = resolveSiteUrl();
  if (fellBack && process.env.NODE_ENV === "production") {
    return {
      error:
        "Define NEXT_PUBLIC_SITE_URL no ambiente (URL público da app). Sem ele, o link do email não consegue voltar a este site.",
    };
  }
  const redirectTo = inviteRedirectUrl(siteUrl);

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo,
    });

  if (inviteError || !invited.user) {
    const raw = inviteError?.message ?? "Não foi possível enviar o convite.";
    return { error: formatInviteError(raw) };
  }

  const userId = invited.user.id;

  // O trigger handle_new_user já criou a linha em `profiles`; só falta
  // completar nome e telefone.
  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", userId);

  if (profileError) {
    // Convite já foi enviado e o utilizador existe — não vale a pena fazer
    // rollback. Reporta para o operador completar manualmente se preciso.
    return {
      error: `Convite enviado mas falhou ao gravar o perfil: ${profileError.message}`,
    };
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  return {
    ok: true,
    createdEmail: email,
    info: "Convite enviado. Se o link no email só mostrar scuderiaittech.pt (sem /auth/callback), adiciona https://scuderiaittech.pt/** em Supabase → Authentication → Redirect URLs e reenvia o convite.",
  };
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
      .select("id, brand, model, year_start, year_end")
      .eq("id", catalogEntryId)
      .maybeSingle();
    if (catErr || !entry) {
      return { error: "Entrada do catálogo inválida ou já não existe." };
    }
    brand = String(entry.brand).trim();
    model = String(entry.model).trim();
    const ys = entry.year_start as number;
    const ye = (entry.year_end as number | null) ?? ys;
    if (ye === ys) {
      // Modelo com ano único — usa esse mesmo ano.
      year = ys;
    } else {
      // Modelo com intervalo — o admin tem de indicar o ano específico desta mota.
      if (year === null) {
        return { error: `Indica o ano da mota (entre ${ys} e ${ye}).` };
      }
      if (year < ys || year > ye) {
        return { error: `O ano da mota tem de estar entre ${ys} e ${ye}.` };
      }
    }
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

export async function updateClientProfile(
  userId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!fullName) {
    return { error: "O nome é obrigatório." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  revalidatePath("/admin/motas");
  return { ok: true };
}

export async function deleteClientProfile(userId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  if (!userId) {
    return { error: "Cliente inválido." };
  }

  // Bloquear se ainda houver motas como dono atual — força a transferência primeiro
  // para preservar histórico (motorcycles.current_owner_id é NOT NULL sem cascade).
  const { count: motaCount, error: motaErr } = await supabase
    .from("motorcycles")
    .select("id", { count: "exact", head: true })
    .eq("current_owner_id", userId);

  if (motaErr) {
    return { error: motaErr.message };
  }
  if ((motaCount ?? 0) > 0) {
    return {
      error: `Cliente ainda tem ${motaCount} mota(s) como dono atual. Transfere a propriedade antes de apagar.`,
    };
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

  // Remover auth user — o trigger/CASCADE apaga o profile correspondente.
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    return { error: delErr.message };
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateMotorcycle(
  motorcycleId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim() || null;
  const vin = String(formData.get("vin") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const yearRaw = String(formData.get("year") ?? "").trim();
  const year: number | null =
    yearRaw === "" ? null : Number.parseInt(yearRaw, 10);

  if (!brand || !model) {
    return { error: "Marca e modelo são obrigatórios." };
  }
  if (year !== null && (Number.isNaN(year) || year < 1900 || year > 2100)) {
    return { error: "Ano inválido." };
  }

  const { error } = await supabase
    .from("motorcycles")
    .update({ brand, model, year, plate, vin, notes })
    .eq("id", motorcycleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/motas");
  revalidatePath(`/admin/motas/${motorcycleId}`);
  revalidatePath("/admin/clientes");
  revalidatePath("/garagem");
  return { ok: true };
}

export async function deleteMotorcycle(motorcycleId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  if (!motorcycleId) {
    return { error: "Mota inválida." };
  }

  // Service records, tasks, attachments e ownership periods são removidos por
  // cascade (ver migrations 20260421120000_initial.sql).
  const { error } = await supabase.from("motorcycles").delete().eq("id", motorcycleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/motas");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  revalidatePath("/garagem");
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

  // Toda a transferência (fechar período, abrir novo, actualizar
  // current_owner_id) corre numa única transacção atómica em Postgres —
  // ver `supabase/migrations/20260514120000_transfer_motorcycle_rpc.sql`.
  const { error: rpcErr } = await supabase.rpc("transfer_motorcycle", {
    p_motorcycle_id: motorcycleId,
    p_new_owner_id: newOwnerId,
    p_transfer_note: transferNote,
  });

  if (rpcErr) {
    if (rpcErr.code === "22023" && rpcErr.message.includes("equals current owner")) {
      return { error: "O novo dono é igual ao atual." };
    }
    if (rpcErr.code === "P0002") {
      return { error: "Mota não encontrada." };
    }
    if (rpcErr.code === "42501") {
      return { error: "Sem permissões para transferir." };
    }
    return { error: rpcErr.message };
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

  // Checkbox "Não mostrar ao próximo dono" no formulário: marcado → shop_service.
  const record_kind = formData.has("record_kind_shop") ? "shop_service" : "maintenance";

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
  // Checkbox "Não mostrar ao próximo dono": presente → shop_service, ausente → maintenance.
  const record_kind = formData.has("record_kind_shop") ? "shop_service" : "maintenance";

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

/** Remove várias tarefas de uma só vez (modo de seleção do checklist). */
export async function deleteServiceTasks(taskIds: string[], recordId: string) {
  const { supabase } = await requireAdmin();
  const ids = taskIds.filter((id) => typeof id === "string" && id.length > 0);
  if (ids.length === 0) {
    return { error: "Nenhuma tarefa selecionada." };
  }
  const { error } = await supabase.from("service_tasks").delete().in("id", ids);
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

