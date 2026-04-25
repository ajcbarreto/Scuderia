import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  CloudUpload,
  Construction,
  CreditCard,
  PlusCircle,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminGlassPanel, adminSurfaceLow } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

function startEndUtcDay() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

type MotoJoin = { brand: string; model: string; plate: string | null };

type RecentRow = {
  id: string;
  title: string | null;
  status: string;
  opened_at: string;
  record_kind: "maintenance" | "shop_service";
  /** Supabase pode devolver objeto ou array em relações 1:1 */
  motorcycles: MotoJoin | MotoJoin[] | null;
};

function motoFromRow(row: RecentRow): MotoJoin | null {
  const m = row.motorcycles;
  if (!m) return null;
  return Array.isArray(m) ? m[0] ?? null : m;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { start, end } = startEndUtcDay();

  const [
    { count: motas },
    { count: clientes },
    { count: abertos },
    { count: faturas },
    { count: agendamentosHoje },
    { data: recentRows },
    { data: timelineMotos },
  ] = await Promise.all([
    supabase.from("motorcycles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase
      .from("service_records")
      .select("*", { count: "exact", head: true })
      .in("status", ["draft", "in_progress"]),
    supabase
      .from("service_attachments")
      .select("*", { count: "exact", head: true })
      .eq("kind", "invoice"),
    supabase
      .from("appointment_requests")
      .select("*", { count: "exact", head: true })
      .gte("preferred_start", start)
      .lte("preferred_start", end),
    supabase
      .from("service_records")
      .select(
        "id, title, status, record_kind, opened_at, motorcycles (brand, model, plate)",
      )
      .order("opened_at", { ascending: false })
      .limit(6),
    supabase
      .from("motorcycles")
      .select("id, brand, model")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const recent = (recentRows ?? []) as unknown as RecentRow[];
  const fleetBars = (timelineMotos ?? []) as { id: string; brand: string; model: string }[];

  const barHeights = fleetBars.map((_, i) => 40 + ((i * 17) % 36));

  const utilization =
    typeof motas === "number" && motas > 0 && typeof abertos === "number"
      ? Math.min(100, Math.round((abertos / Math.max(motas, 1)) * 35 + 42))
      : 42;

  const quick = [
    {
      title: "Nova entrada de serviço",
      hint: "Iniciar registo",
      href: "/admin/servico",
      icon: PlusCircle,
      accent: "border-l-primary bg-card hover:bg-muted",
      iconWrap: "bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
      arrowClass: "text-primary",
    },
    {
      title: "Registar novo cliente",
      hint: "Adicionar à garagem",
      href: "/admin/clientes#novo-cliente",
      icon: UserPlus,
      accent: "border-l-emerald-600 bg-card hover:bg-muted",
      iconWrap:
        "bg-emerald-500/12 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white",
      arrowClass: "text-emerald-600",
    },
    {
      title: "Carregar fatura / anexo",
      hint: "Via boletim de serviço",
      href: "/admin/boletins",
      icon: CloudUpload,
      accent: "border-l-muted-foreground/30 bg-card hover:bg-muted",
      iconWrap:
        "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground",
      arrowClass: "text-muted-foreground",
    },
  ] as const;

  const stats = [
    {
      label: "Motas na frota",
      value: motas ?? 0,
      hint: "Unidades registadas",
      icon: Bike,
      tag: "Oficina",
      tagClass: "text-primary",
    },
    {
      label: "Intervenções abertas",
      value: abertos ?? 0,
      hint: "Rascunho ou em curso",
      icon: Construction,
      tag: "Operação",
      tagClass: "text-emerald-700",
    },
    {
      label: "Anexos tipo fatura",
      value: faturas ?? 0,
      hint: "No armazenamento",
      icon: CreditCard,
      tag: "Ledger",
      tagClass: "text-destructive",
    },
    {
      label: "Agendamentos hoje",
      value: agendamentosHoje ?? 0,
      hint: "Janela preferida",
      icon: CalendarDays,
      tag: "Agenda",
      tagClass: "text-primary",
    },
  ] as const;

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-8">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
          Scuderia itTECH
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Painel operativo
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Resumo da frota, trabalhos em curso e movimento recente — alinhado com o fluxo da oficina.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {quick.map(
          ({ title, hint, href, icon: Icon, accent, iconWrap, arrowClass }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center justify-between rounded-lg border border-transparent p-5 transition-colors duration-300",
                "border-l-4 shadow-sm shadow-foreground/8",
                accent,
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md transition-colors",
                    iconWrap,
                  )}
                >
                  <Icon className="size-6" aria-hidden />
                </div>
                <div className="text-left">
                  <p className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
                    {title}
                  </p>
                  <p className="mt-0.5 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
                    {hint}
                  </p>
                </div>
              </div>
              <ArrowRight className={cn("size-5 shrink-0 transition-transform group-hover:translate-x-0.5", arrowClass)} />
            </Link>
          ),
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, tag, tagClass }) => (
          <div
            key={label}
            className={cn(
              adminSurfaceLow,
              "p-6 transition-colors hover:border-border",
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <Icon className="size-6 text-muted-foreground" aria-hidden />
              <span className={cn("font-heading text-[10px] font-semibold uppercase tracking-widest", tagClass)}>
                {tag}
              </span>
            </div>
            <p className="font-heading text-4xl font-black tabular-nums text-foreground">{value}</p>
            <p className="mt-1 font-heading text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/80">{hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg bg-card p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
                Timeline de manutenção
              </h2>
              <p className="mt-1 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
                Marcos por modelo (ilustrativo)
              </p>
            </div>
            <div className="flex flex-wrap gap-4 font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                Desmo / crítico
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                Óleo / anual
              </span>
            </div>
          </div>
          <div className="relative min-h-[280px]">
            <div className="absolute inset-0 flex flex-col justify-between py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-px w-full bg-muted-foreground/15" />
              ))}
            </div>
            <div className="relative flex h-[260px] items-end justify-between gap-2 px-2 sm:px-4">
              {fleetBars.length === 0 ? (
                <p className="w-full pb-8 text-center text-sm text-muted-foreground">
                  Ainda sem motas na frota para visualizar barras.
                </p>
              ) : (
                fleetBars.map((m, i) => {
                  const h = barHeights[i % barHeights.length] ?? 40;
                  const fill =
                    i % 2 === 0
                      ? "bg-primary/45 border-t border-primary"
                      : "bg-emerald-500/40 border-t border-emerald-600";
                  return (
                    <div key={m.id} className="flex w-12 flex-col items-center sm:w-16">
                      <div
                        className="relative w-8 rounded-t bg-muted sm:w-10"
                        style={{ height: `${h + 40}px` }}
                      >
                        <div
                          className={cn(
                            "absolute bottom-0 w-full rounded-t transition-all group-hover:opacity-100",
                            fill,
                          )}
                          style={{ height: `${Math.max(24, h * 0.55)}px` }}
                        />
                      </div>
                      <span className="mt-3 text-center font-heading text-[10px] uppercase leading-tight text-muted-foreground">
                        {(m.model ?? m.brand).slice(0, 14)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-card p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
                Fluxo de serviço
              </h2>
              <p className="mt-1 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
                Últimas entradas
              </p>
            </div>
            <Link
              href="/admin/boletins"
              className="font-heading text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
            >
              Ver tudo
            </Link>
          </div>
          <div className="space-y-6">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem registos ainda.</p>
            ) : (
              recent.map((row, idx) => {
                const dot =
                  row.status === "completed"
                    ? "bg-muted-foreground"
                    : idx % 2 === 0
                      ? "bg-primary"
                      : "bg-emerald-500";
                const moto = motoFromRow(row);
                const asset = moto
                  ? `${moto.brand} ${moto.model}${moto.plate ? ` (${moto.plate})` : ""}`
                  : "Motociclo";
                const when = row.opened_at
                  ? new Date(row.opened_at).toLocaleString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                return (
                  <div
                    key={row.id}
                    className="relative border-l border-border pl-4"
                  >
                    <span
                      className={cn(
                        "absolute -left-[5px] top-1 size-2 rounded-full",
                        dot,
                      )}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-[11px] font-bold uppercase text-foreground">
                        {row.title?.trim() || "Intervenção"}
                      </h3>
                      <span className="shrink-0 text-[9px] uppercase tracking-wide text-muted-foreground/80">
                        {when}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Ativo: {asset}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-wide text-primary/80">
                      Estado: {row.status.replace("_", " ")}
                      {(row.record_kind ?? "maintenance") === "shop_service"
                        ? " · só oficina"
                        : " · garagem"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <div className={cn(adminGlassPanel, "p-6 lg:col-span-1")}>
          <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-foreground">
            Carga da oficina
          </h3>
          <div className="relative mt-4 pt-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-block rounded-full bg-primary/15 px-2 py-1 font-heading text-[9px] font-semibold uppercase tracking-widest text-primary">
                Utilização estimada
              </span>
              <span className="font-heading text-[10px] font-semibold text-foreground">{utilization}%</span>
            </div>
            <div className="mb-4 flex h-1.5 overflow-hidden rounded-full bg-muted text-xs">
              <div
                className="bg-primary shadow-none transition-all"
                style={{ width: `${utilization}%` }}
              />
            </div>
            <p className="text-[9px] font-medium uppercase leading-relaxed text-muted-foreground">
              Baseado em motas na frota vs. intervenções abertas. Ajusta processos reais na oficina.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-card p-6 lg:col-span-3 lg:flex lg:flex-col lg:justify-center">
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-heading text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Clientes ativos
              </p>
              <p className="mt-1 font-heading text-xl font-bold text-foreground">{clientes ?? 0}</p>
            </div>
            <div>
              <p className="font-heading text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Taxa de progresso média
              </p>
              <p className="mt-1 font-heading text-xl font-bold text-foreground">
                {typeof abertos === "number" && abertos > 0 ? "Em curso" : "—"}
              </p>
            </div>
            <div>
              <p className="font-heading text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Peças & stock
              </p>
              <p className="mt-1 font-heading text-xl font-bold text-foreground">N/D</p>
            </div>
            <div>
              <p className="font-heading text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Eficiência registo
              </p>
              <p className="mt-1 font-heading text-xl font-bold text-foreground">
                {typeof motas === "number" && motas > 0 ? `${Math.min(130, 88 + (motas % 15))}%` : "—"}
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-[11px] text-muted-foreground/80">
            Indicadores operacionais ilustrativos; liga inventário físico quando existir integração.
          </p>
        </div>
      </section>
    </div>
  );
}
