import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoletimHistoryRow } from "@/types/boletim";
import type {
  Motorcycle,
  ServiceAttachment,
  ServiceRecord,
  ServiceTask,
} from "@/types/database";

export type BoletimMotorcycleContext = {
  motorcycle: Motorcycle;
  recs: ServiceRecord[];
  historyRows: BoletimHistoryRow[];
  allInvoiceHrefs: { label: string; href: string }[];
  tasksByRecord: Map<string, ServiceTask[]>;
};

export async function loadBoletimDataForMotorcycle(
  supabase: SupabaseClient,
  motorcycleId: string,
): Promise<BoletimMotorcycleContext | null> {
  const { data: mota, error: motaError } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", motorcycleId)
    .maybeSingle();

  if (motaError || !mota) return null;
  const motorcycle = mota as Motorcycle;

  const { data: historyRecords } = await supabase
    .from("service_records")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("opened_at", { ascending: false });

  const recs = (historyRecords ?? []) as ServiceRecord[];
  const recordIds = recs.map((x) => x.id);

  const [{ data: taskRows }, { data: attachmentRows }] = await Promise.all([
    recordIds.length
      ? supabase
          .from("service_tasks")
          .select("*")
          .in("service_record_id", recordIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as ServiceTask[] }),
    recordIds.length
      ? supabase
          .from("service_attachments")
          .select("*")
          .in("service_record_id", recordIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as ServiceAttachment[] }),
  ]);

  const tasksList = (taskRows ?? []) as ServiceTask[];
  const attachments = (attachmentRows ?? []) as ServiceAttachment[];

  const tasksByRecord = new Map<string, ServiceTask[]>();
  for (const t of tasksList) {
    const list = tasksByRecord.get(t.service_record_id) ?? [];
    list.push(t);
    tasksByRecord.set(t.service_record_id, list);
  }

  const attachmentsByRecord = new Map<string, ServiceAttachment[]>();
  for (const a of attachments) {
    const list = attachmentsByRecord.get(a.service_record_id) ?? [];
    list.push(a);
    attachmentsByRecord.set(a.service_record_id, list);
  }

  const signedByAttachmentId = new Map<string, string>();
  for (const a of attachments) {
    const { data: signedData, error } = await supabase.storage
      .from(a.storage_bucket)
      .createSignedUrl(a.storage_path, 3600);
    if (!error && signedData?.signedUrl) {
      signedByAttachmentId.set(a.id, signedData.signedUrl);
    }
  }

  const historyRows: BoletimHistoryRow[] = recs.map((rec) => {
    const recAtt = attachmentsByRecord.get(rec.id) ?? [];
    const invoice = recAtt.find((x) => x.kind === "invoice");
    const invoiceHref = invoice
      ? signedByAttachmentId.get(invoice.id) ?? null
      : null;
    const photoHrefs: string[] = [];
    for (const a of recAtt) {
      if (a.kind !== "photo") continue;
      const u = signedByAttachmentId.get(a.id);
      if (u) photoHrefs.push(u);
    }
    return {
      record: rec,
      tasks: tasksByRecord.get(rec.id) ?? [],
      invoiceHref,
      photoHrefs: photoHrefs.slice(0, 4),
    };
  });

  const allInvoiceHrefs: { label: string; href: string }[] = [];
  for (const rec of recs) {
    const recAtt = attachmentsByRecord.get(rec.id) ?? [];
    const invoices = recAtt.filter((x) => x.kind === "invoice");
    const when = new Date(rec.closed_at ?? rec.opened_at).toLocaleDateString(
      "pt-PT",
    );
    const title = rec.title ?? "Intervenção";
    invoices.forEach((inv, idx) => {
      const href = signedByAttachmentId.get(inv.id);
      if (!href) return;
      allInvoiceHrefs.push({
        label:
          invoices.length > 1
            ? `Fatura ${idx + 1}/${invoices.length} — ${title} — ${when}`
            : `Fatura — ${title} — ${when}`,
        href,
      });
    });
  }

  return {
    motorcycle,
    recs,
    historyRows,
    allInvoiceHrefs,
    tasksByRecord,
  };
}
