import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { loadBoletimDataForMotorcycle } from "@/lib/garagem/boletim-data";
import { MaintenanceBulletin } from "@/components/garagem/maintenance-bulletin";
import { BoletimViewTracker } from "@/components/garagem/boletim-view-tracker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ motorcycleId: string; recordId: string }>;
};

export default async function ManutencaoDetailPage({ params }: Props) {
  const { motorcycleId, recordId } = await params;
  const supabase = await createClient();

  // Perfil e dados do boletim em paralelo.
  const [profile, ctx] = await Promise.all([
    getProfile(),
    loadBoletimDataForMotorcycle(supabase, motorcycleId),
  ]);
  if (!ctx) notFound();

  const r = ctx.recs.find((x) => x.id === recordId);
  if (!r) notFound();

  const currentTasks = ctx.tasksByRecord.get(recordId) ?? [];

  return (
    <div className="space-y-6">
      <BoletimViewTracker recordId={recordId} />
      <div className="flex justify-end print:hidden">
        <a
          href={`/api/boletim/${recordId}/pdf`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-border font-heading text-xs uppercase tracking-wide",
          )}
          download
        >
          <Download className="size-4" aria-hidden />
          Descarregar PDF
        </a>
      </div>

      <MaintenanceBulletin
        variant="detail"
        detailPresentation="standalone"
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
