import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CalendarClock, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBoletimDisplayDate, formatNextServiceSummary } from "@/lib/garagem/service-record-display";
import { cn } from "@/lib/utils";
import type { Motorcycle, ServiceRecord, ServiceRecordStatus } from "@/types/database";

const CARD_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCSDKQVpb9MjJndC53F3QIcjh1SJKCZ03HKBbbTpRgtMVCeuzV6v4mzwlVOQx85KKQ7j4LjXiNjzCYjr4gxjrXo9M0wpRdkT-JUjBA5UgDkvwne0_DbygXUoygfalM0mS1VOI8SPmUK_pPJ0XZdRu7IN32nXYw5pIWnnn7Jv7Mu0wgQeM5ROEmjRdRfjMLpycugWo1y9pcUPTTFJ4QhHvofPs5oeNpq2_JJA89QIalBClcH86vxImSN7feTLeHSQmcKQvBCInqVRa4";

function statusLabelPt(s: ServiceRecordStatus): string {
  switch (s) {
    case "completed":
      return "Concluído";
    case "in_progress":
      return "Em curso";
    case "draft":
      return "Rascunho";
    case "cancelled":
      return "Cancelado";
    default:
      return s;
  }
}

export default async function GaragemPage() {
  const supabase = await createClient();
  const { data: motas, error } = await supabase
    .from("motorcycles")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (motas ?? []) as Motorcycle[];
  const ids = list.map((m) => m.id);

  type LastRow = Pick<
    ServiceRecord,
    | "motorcycle_id"
    | "opened_at"
    | "closed_at"
    | "service_date"
    | "status"
    | "title"
    | "odometer_km"
    | "next_service_due_date"
    | "next_service_due_km"
  >;

  let latestByMoto = new Map<string, LastRow>();
  if (ids.length > 0) {
    const { data: recRows } = await supabase
      .from("service_records")
      .select(
        "motorcycle_id, opened_at, closed_at, service_date, status, title, odometer_km, next_service_due_date, next_service_due_km",
      )
      .in("motorcycle_id", ids)
      .eq("record_kind", "maintenance")
      .order("opened_at", { ascending: false })
      .limit(200);

    for (const r of (recRows ?? []) as LastRow[]) {
      if (!latestByMoto.has(r.motorcycle_id)) {
        latestByMoto.set(r.motorcycle_id, r);
      }
    }
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="border-b border-border/60 pb-6">
        <h1 className="font-heading text-3xl font-extrabold uppercase leading-none tracking-tight text-foreground md:text-4xl">
          Minha garagem
        </h1>
        <p className="mt-2 font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Gestão de frota · Scuderia itTECH
        </p>
      </header>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/40">
        <div className="absolute inset-0">
          <Image
            src={CARD_IMAGE}
            alt=""
            fill
            className="object-cover opacity-[0.18]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/55" />
        </div>
        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Garagem digital
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            As tuas motas
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Abre cada unidade para ver o boletim de manutenção, o histórico de
            serviços na oficina e o detalhe de cada intervenção.
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar dados. Confirma as variáveis Supabase e a
          migração SQL.
        </p>
      ) : null}

      {list.length === 0 ? (
        <Card className="border-border bg-muted">
          <CardHeader>
            <CardTitle className="font-heading">Ainda sem motas</CardTitle>
            <CardDescription>
              Quando a oficina registar a tua mota na frota, ela aparece aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/agendamento"
              className={buttonVariants({
                variant: "outline",
                className: "border-border",
              })}
            >
              Pedir primeiro agendamento
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul
          className={cn(
            "grid gap-5 sm:gap-6",
            list.length === 1
              ? "mx-auto w-full max-w-md sm:max-w-lg"
              : "sm:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {list.map((m) => {
            const last = latestByMoto.get(m.id);
            const lastWhen = last
              ? formatBoletimDisplayDate(last)
              : null;
            const lastKm =
              last?.odometer_km != null
                ? `${new Intl.NumberFormat("pt-PT").format(last.odometer_km)} km`
                : null;
            const nextDueLine = last ? formatNextServiceSummary(last) : null;

            return (
              <li key={m.id}>
                <Link
                  href={`/garagem/motas/${m.id}`}
                  className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <article className="relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-border bg-neutral-950 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                    <div className="absolute inset-0">
                      <Image
                        src={CARD_IMAGE}
                        alt=""
                        fill
                        className="object-cover opacity-35 transition-opacity duration-500 group-hover:opacity-45"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/88 to-black/20" />
                    </div>
                    <div className="relative mt-auto flex flex-1 flex-col justify-end p-5 text-white sm:p-7">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="border border-white/25 bg-black/55 font-medium text-white backdrop-blur-sm"
                        >
                          {m.year != null ? String(m.year) : "Ano —"}
                        </Badge>
                        {m.plate ? (
                          <Badge
                            variant="outline"
                            className="border-white/35 bg-black/45 font-mono text-xs text-white backdrop-blur-sm"
                          >
                            {m.plate}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-white/25 bg-black/40 text-xs text-white/80 backdrop-blur-sm"
                          >
                            Sem matrícula
                          </Badge>
                        )}
                      </div>
                      <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-3xl">
                        {m.brand} {m.model}
                      </h2>

                      {last ? (
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/85">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="size-3.5 shrink-0 text-white/70" aria-hidden />
                            <span className="font-medium">{lastWhen}</span>
                            <span className="text-white/50">·</span>
                            <span>{statusLabelPt(last.status)}</span>
                            {lastKm ? (
                              <>
                                <span className="text-white/50">·</span>
                                <span>{lastKm}</span>
                              </>
                            ) : null}
                          </span>
                          {last.title ? (
                            <span className="w-full truncate text-white/70" title={last.title}>
                              {last.title}
                            </span>
                          ) : null}
                          {nextDueLine ? (
                            <span className="w-full text-white/75">
                              Próx. revisão: <span className="font-medium text-white">{nextDueLine}</span>
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-white/65">
                          Ainda sem intervenções de manutenção registadas.
                        </p>
                      )}

                      <p className="mt-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                          Ver boletim de manutenção
                          <ChevronRight
                            className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </span>
                      </p>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
