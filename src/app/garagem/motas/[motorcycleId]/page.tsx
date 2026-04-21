import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { loadBoletimDataForMotorcycle } from "@/lib/garagem/boletim-data";
import { MaintenanceBulletin } from "@/components/garagem/maintenance-bulletin";

type Props = { params: Promise<{ motorcycleId: string }> };

export default async function MotorcycleDetailPage({ params }: Props) {
  const { motorcycleId } = await params;
  const supabase = await createClient();
  const profile = await getProfile();

  const ctx = await loadBoletimDataForMotorcycle(supabase, motorcycleId);
  if (!ctx) notFound();

  const m = ctx.motorcycle;

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <p className="text-sm text-muted-foreground">
          <Link href="/garagem" className="hover:text-foreground">
            Garagem
          </Link>{" "}
          / Boletim
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          {m.brand} {m.model}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Estado da frota, histórico de serviços na oficina e acesso ao detalhe de
          cada intervenção.
        </p>
      </div>

      <MaintenanceBulletin
        variant="overview"
        motorcycle={m}
        motorcycleId={motorcycleId}
        ownerName={profile?.full_name ?? null}
        historyRows={ctx.historyRows}
        allInvoiceHrefs={ctx.allInvoiceHrefs}
      />
    </div>
  );
}
