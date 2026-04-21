import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { loadBoletimDataForMotorcycle } from "@/lib/garagem/boletim-data";
import { MaintenanceBulletin } from "@/components/garagem/maintenance-bulletin";
import { buttonVariants } from "@/components/ui/button";

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
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
              Estado da frota, histórico de serviços na oficina e acesso ao detalhe
              de cada intervenção.
            </p>
          </div>
          <Link
            href={`/api/garagem/motas/${m.id}/livro`}
            prefetch={false}
            className={buttonVariants({
              variant: "outline",
              className:
                "shrink-0 border-white/15 bg-[#1a1a1a] hover:bg-[#222]",
            })}
          >
            <FileDown className="size-4" aria-hidden />
            Livro (PDF)
          </Link>
        </div>
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
