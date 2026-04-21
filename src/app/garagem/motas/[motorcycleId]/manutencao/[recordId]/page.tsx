import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import {
  MaintenanceBulletin,
  type HistoryRow,
} from "@/components/garagem/maintenance-bulletin";
import type {
  Motorcycle,
  ServiceAttachment,
  ServiceRecord,
  ServiceTask,
} from "@/types/database";

type Props = {
  params: Promise<{ motorcycleId: string; recordId: string }>;
};

export default async function ManutencaoDetailPage({ params }: Props) {
  const { motorcycleId, recordId } = await params;
  const supabase = await createClient();
  const profile = await getProfile();

  const { data: record } = await supabase
    .from("service_records")
    .select("*")
    .eq("id", recordId)
    .eq("motorcycle_id", motorcycleId)
    .maybeSingle();

  if (!record) notFound();
  const r = record as ServiceRecord;

  const { data: mota } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", motorcycleId)
    .maybeSingle();

  if (!mota) notFound();
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

  const historyRows: HistoryRow[] = recs.map((rec) => {
    const recAtt = attachmentsByRecord.get(rec.id) ?? [];
    const invoice = recAtt.find((x) => x.kind === "invoice");
    const invoiceHref = invoice
      ? signedByAttachmentId.get(invoice.id) ?? null
      : null;
    return {
      record: rec,
      tasks: tasksByRecord.get(rec.id) ?? [],
      invoiceHref,
    };
  });

  const currentTasks = tasksByRecord.get(r.id) ?? [];

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

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <p className="text-sm text-muted-foreground">
          <Link href={`/garagem/motas/${motorcycleId}`} className="hover:text-foreground">
            Mota
          </Link>{" "}
          / Boletim
        </p>
      </div>

      <MaintenanceBulletin
        motorcycle={motorcycle}
        ownerName={profile?.full_name ?? null}
        currentRecord={r}
        currentTasks={currentTasks}
        historyRows={historyRows}
        allInvoiceHrefs={allInvoiceHrefs}
      />
    </div>
  );
}
