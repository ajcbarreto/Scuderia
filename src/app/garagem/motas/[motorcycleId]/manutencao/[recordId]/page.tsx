import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { loadBoletimDataForMotorcycle } from "@/lib/garagem/boletim-data";
import { MaintenanceBulletin } from "@/components/garagem/maintenance-bulletin";

type Props = {
  params: Promise<{ motorcycleId: string; recordId: string }>;
};

export default async function ManutencaoDetailPage({ params }: Props) {
  const { motorcycleId, recordId } = await params;
  const supabase = await createClient();
  const profile = await getProfile();

  const ctx = await loadBoletimDataForMotorcycle(supabase, motorcycleId);
  if (!ctx) notFound();

  const r = ctx.recs.find((x) => x.id === recordId);
  if (!r) notFound();

  const currentTasks = ctx.tasksByRecord.get(recordId) ?? [];

  return (
    <MaintenanceBulletin
      variant="detail"
      motorcycle={ctx.motorcycle}
      motorcycleId={motorcycleId}
      ownerName={profile?.full_name ?? null}
      currentRecord={r}
      currentTasks={currentTasks}
      historyRows={ctx.historyRows}
      allInvoiceHrefs={ctx.allInvoiceHrefs}
    />
  );
}
