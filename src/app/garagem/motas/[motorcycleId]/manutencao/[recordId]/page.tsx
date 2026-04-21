import Link from "next/link";
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
    <div className="space-y-6">
      <div className="print:hidden">
        <p className="text-sm text-muted-foreground">
          <Link href="/garagem" className="hover:text-foreground">
            Garagem
          </Link>{" "}
          /{" "}
          <Link
            href={`/garagem/motas/${motorcycleId}`}
            className="hover:text-foreground"
          >
            {ctx.motorcycle.brand} {ctx.motorcycle.model}
          </Link>{" "}
          / Serviço
        </p>
      </div>

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
    </div>
  );
}
