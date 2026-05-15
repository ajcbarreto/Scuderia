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

  // Perfil e dados do boletim em paralelo — antes corriam em série.
  const [profile, ctx] = await Promise.all([
    getProfile(),
    loadBoletimDataForMotorcycle(supabase, motorcycleId),
  ]);
  if (!ctx) notFound();

  const m = ctx.motorcycle;

  return (
    <div className="space-y-8">
      <header className="border-b border-border/60 pb-6 print:hidden">
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted-foreground">
          <Link href="/garagem" className="transition-colors hover:text-foreground">
            Garagem
          </Link>
          <span aria-hidden className="text-border">
            /
          </span>
          <span className="font-medium text-foreground">Boletim de manutenção</span>
        </nav>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {m.brand} {m.model}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{m.year != null ? `Ano ${m.year}` : "Ano —"}</span>
          <span className="hidden text-border sm:inline" aria-hidden>
            ·
          </span>
          <span className="font-mono">{m.plate ?? "Sem matrícula"}</span>
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Histórico de serviços na oficina e detalhe de cada intervenção. Toca numa
          linha do histórico para abrir o resumo desse serviço.
        </p>
      </header>

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
