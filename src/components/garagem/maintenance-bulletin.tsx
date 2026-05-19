import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  Calendar,
  CheckCircle2,
  CircleDot,
  Download,
  FileText,
  Info,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { Motorcycle, ServiceRecord, ServiceTask } from "@/types/database";
import type { BoletimHistoryRow } from "@/types/boletim";
import {
  formatBoletimDisplayDate,
  formatNextServiceSummary,
  formatOdometerKm,
  formatRepairOrderRef,
  formatRevisionAndTitle,
} from "@/lib/garagem/service-record-display";
import { BoletimFooterActions } from "@/components/garagem/boletim-footer-actions";
import { BoletimPassportPrint } from "@/components/garagem/boletim-passport-print";
import { BoletimServiceHistoryTable } from "@/components/garagem/boletim-service-history-table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { parseShopNotes, type NoteColor } from "@/lib/garagem/shop-notes";

export type { BoletimHistoryRow as HistoryRow } from "@/types/boletim";

const NOTE_COLOR_CONFIG: Record<
  NoteColor,
  { iconBg: string; textColor: string; Icon: typeof CheckCircle2 }
> = {
  green: {
    iconBg:
      "rounded-md bg-emerald-100 p-1.5 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
    textColor: "text-emerald-900 dark:text-emerald-300",
    Icon: CheckCircle2,
  },
  red: {
    iconBg:
      "rounded-md bg-red-100 p-1.5 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    textColor: "text-red-900 dark:text-red-300",
    Icon: AlertTriangle,
  },
  orange: {
    iconBg:
      "rounded-md bg-orange-100 p-1.5 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    textColor: "text-orange-900 dark:text-orange-300",
    Icon: AlertTriangle,
  },
  blue: {
    iconBg:
      "rounded-md bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    textColor: "text-blue-900 dark:text-blue-300",
    Icon: Info,
  },
  default: {
    iconBg: "rounded-md bg-muted p-1.5 text-muted-foreground",
    textColor: "text-muted-foreground",
    Icon: CircleDot,
  },
};

const ENGINE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCSDKQVpb9MjJndC53F3QIcjh1SJKCZ03HKBbbTpRgtMVCeuzV6v4mzwlVOQx85KKQ7j4LjXiNjzCYjr4gxjrXo9M0wpRdkT-JUjBA5UgDkvwne0_DbygXUoygfalM0mS1VOI8SPmUK_pPJ0XZdRu7IN32nXYw5pIWnnn7Jv7Mu0wgQeM5ROEmjRdRfjMLpycugWo1y9pcUPTTFJ4QhHvofPs5oeNpq2_JJA89QIalBClcH86vxImSN7feTLeHSQmcKQvBCInqVRa4";

function formatBulletinId(recordId: string, openedAt: string) {
  const y = new Date(openedAt).getFullYear();
  const compact = recordId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `#SLT-${compact}-${y}`;
}

function formatMotoRefId(motorcycleId: string, updatedAt: string) {
  const y = new Date(updatedAt).getFullYear();
  const compact = motorcycleId.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `#MOT-${compact}-${y}`;
}

function formatPtDate(iso: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function statusLabel(status: ServiceRecord["status"]): {
  text: string;
  variant: "ok" | "warn" | "muted";
} {
  switch (status) {
    case "completed":
      return { text: "Nominal", variant: "ok" };
    case "in_progress":
      return { text: "Em intervenção", variant: "warn" };
    case "draft":
      return { text: "Rascunho", variant: "muted" };
    case "cancelled":
      return { text: "Cancelado", variant: "muted" };
    default:
      return { text: status, variant: "muted" };
  }
}

function mapHistoryToPassportRows(rows: BoletimHistoryRow[]) {
  return rows.map(({ record, tasks }) => {
    const parts =
      tasks
        .filter((t) => t.completed)
        .map((t) => t.label)
        .join(", ") || "—";
    const nextDue = formatNextServiceSummary(record);
    return {
      date: formatBoletimDisplayDate(record),
      orderRef: formatRepairOrderRef(record),
      km: formatOdometerKm(record),
      service: formatRevisionAndTitle(record),
      nextDue: nextDue ?? undefined,
      parts,
      technician: "Scuderia itTECH",
    };
  });
}

function pickAntesDepoisPhotos(
  variant: "overview" | "detail",
  historyRows: BoletimHistoryRow[],
  currentRecordId: string | null,
  placeholderSrc: string,
): { antesSrc: string; depoisSrc: string } {
  if (variant === "detail" && currentRecordId) {
    const row = historyRows.find((h) => h.record.id === currentRecordId);
    const ph = row?.photoHrefs ?? [];
    return {
      antesSrc: ph[0] ?? placeholderSrc,
      depoisSrc: ph[1] ?? ph[0] ?? placeholderSrc,
    };
  }
  for (const hr of historyRows) {
    if (hr.photoHrefs.length >= 2) {
      return { antesSrc: hr.photoHrefs[0], depoisSrc: hr.photoHrefs[1] };
    }
    if (hr.photoHrefs.length === 1) {
      return { antesSrc: hr.photoHrefs[0], depoisSrc: placeholderSrc };
    }
  }
  return { antesSrc: placeholderSrc, depoisSrc: placeholderSrc };
}

function aggregateFleetStatus(rows: BoletimHistoryRow[]): {
  text: string;
  variant: "ok" | "warn" | "muted";
} {
  const inProg = rows.find((x) => x.record.status === "in_progress");
  if (inProg) {
    return { text: "Intervenção em curso", variant: "warn" };
  }
  const latest = rows[0]?.record;
  if (!latest) {
    return { text: "Sem intervenções registadas", variant: "muted" };
  }
  return statusLabel(latest.status);
}

type Common = {
  motorcycle: Motorcycle;
  ownerName: string | null;
  historyRows: BoletimHistoryRow[];
  allInvoiceHrefs: { label: string; href: string }[];
  motorcycleId: string;
};

export type MaintenanceBulletinProps =
  | (Common & { variant: "overview" })
  | (Common & {
      variant: "detail";
      currentRecord: ServiceRecord;
      currentTasks: ServiceTask[];
      /** Página só do serviço: sem hero nem título grande do boletim */
      detailPresentation?: "boletim" | "standalone";
    });

export function MaintenanceBulletin(props: MaintenanceBulletinProps) {
  const { motorcycle: m, ownerName, historyRows, allInvoiceHrefs, motorcycleId } =
    props;
  const isDetail = props.variant === "detail";
  const r = isDetail ? props.currentRecord : null;
  const currentTasks = isDetail ? props.currentTasks : [];
  const clientVisibleTasks = currentTasks.filter((t) => t.completed);
  const standalone =
    props.variant === "detail" &&
    "detailPresentation" in props &&
    props.detailPresentation === "standalone";

  const generatedLabel = formatPtDate(new Date().toISOString());
  const vehicleTitle = `${m.brand} ${m.model}`.trim();
  const lastService = historyRows[0]?.record;
  const lastServiceLabel = lastService
    ? formatBoletimDisplayDate(lastService)
    : "—";
  const nextRevisionPlanned = lastService
    ? formatNextServiceSummary(lastService)
    : null;

  const _today = new Date();
  _today.setHours(0, 0, 0, 0);
  const _nextServiceDate = lastService?.next_service_due_date
    ? new Date(`${lastService.next_service_due_date}T12:00:00`)
    : null;
  const daysUntilService = _nextServiceDate
    ? Math.ceil((_nextServiceDate.getTime() - _today.getTime()) / 86_400_000)
    : null;

  const fleetStatus = aggregateFleetStatus(historyRows);
  const detailStatus = r ? statusLabel(r.status) : fleetStatus;
  const estado = isDetail ? detailStatus : fleetStatus;

  const headerRef = isDetail && r
    ? formatBulletinId(r.id, r.opened_at)
    : formatMotoRefId(m.id, m.updated_at);

  const lastRevisionNotes = parseShopNotes(lastService?.shop_notes);

  const passportRows = mapHistoryToPassportRows(historyRows);
  const { antesSrc, depoisSrc } = pickAntesDepoisPhotos(
    isDetail ? "detail" : "overview",
    historyRows,
    isDetail && r ? r.id : null,
    ENGINE_IMAGE,
  );

  const passportNotes =
    lastRevisionNotes.length > 0
      ? lastRevisionNotes.flatMap((note) =>
          note.text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        )
      : isDetail && r && clientVisibleTasks.length > 0
        ? clientVisibleTasks.map((t) => t.label).filter(Boolean)
        : [
            "Histórico digital disponível na garagem Scuderia.",
            "Recomendamos calendarizar a próxima revisão com a equipa.",
          ];

  const nextServiceHeadline =
    isDetail && r
      ? `${formatBulletinId(r.id, r.opened_at)} · Estado: ${estado.text}`
      : "Próxima revisão a planear com a oficina Scuderia itTECH";

  const currentHistoryRow =
    isDetail && r
      ? historyRows.find((h) => h.record.id === r.id)
      : undefined;
  const servicePhotoHrefs = currentHistoryRow?.photoHrefs ?? [];
  const serviceNotes = isDetail && r ? parseShopNotes(r.shop_notes) : [];

  return (
    <>
    <div
      id="maintenance-bulletin-print"
      className="carbon-texture text-foreground print:hidden"
    >
      {!standalone ? (
        <>
          <div className="mb-8 border-b border-border pb-6 print:mb-6">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Boletim de manutenção
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {vehicleTitle}
              {m.plate && <> · {m.plate}</>}
              {m.year && <> · {m.year}</>}
            </p>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3 print:mb-6">
            <div className="relative overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
              <div className="absolute inset-0 z-0">
                <Image
                  src={ENGINE_IMAGE}
                  alt=""
                  fill
                  className="object-cover opacity-30 grayscale transition-all duration-700 hover:grayscale-0"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-8">
                <div>
                  <span className="mb-4 inline-block bg-primary px-3 py-1 text-xs font-black uppercase tracking-widest text-primary-foreground">
                    Unidade ativa
                  </span>
                  <h2 className="font-heading text-3xl font-bold md:text-4xl">
                    {vehicleTitle}
                  </h2>
                  <p className="mt-1 font-medium tracking-wide text-muted-foreground">
                    Placa: {m.plate ?? "—"} | VIN: {m.vin ?? "—"}
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 border-t border-border pt-8 md:grid-cols-4">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        Proprietário
                      </p>
                      <p className="text-lg font-bold">{ownerName ?? "—"}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        Quilometragem
                      </p>
                      <p className="text-lg font-bold text-muted-foreground">
                        {lastService ? formatOdometerKm(lastService) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        Última revisão
                      </p>
                      <p className="text-lg font-bold">{lastServiceLabel}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        Estado geral
                      </p>
                      <p
                        className={cn(
                          "flex items-center gap-1.5 text-base font-semibold sm:text-lg",
                          estado.variant === "ok" &&
                            "text-emerald-800 dark:text-emerald-400",
                          estado.variant === "warn" &&
                            "text-amber-900 dark:text-amber-300",
                          estado.variant === "muted" && "text-muted-foreground",
                        )}
                      >
                        {estado.variant === "ok" ? (
                          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                        ) : estado.variant === "warn" ? (
                          <Info className="size-4 shrink-0" aria-hidden />
                        ) : (
                          <CircleDot className="size-4 shrink-0" aria-hidden />
                        )}
                        {estado.text}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border px-4 py-4 sm:px-5 transition-colors",
                      nextRevisionPlanned
                        ? "border-primary/30 bg-primary/10"
                        : "border-border bg-muted/40",
                    )}
                  >
                    <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                      Próxima revisão planeada
                    </p>
                    {nextRevisionPlanned ? (
                      <p className="mt-2 text-lg font-bold text-primary sm:text-xl">
                        {nextRevisionPlanned}
                      </p>
                    ) : (
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Quando a oficina indicar no fecho de um serviço a data ou os km da
                        próxima revisão, o plano aparece aqui, na tabela de histórico e no
                        passaporte impresso.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex flex-col gap-5 overflow-hidden rounded-xl border-2 border-primary/25 bg-card p-6 shadow-lg sm:p-8 lg:min-h-[280px]">
              {/* Red accent bar */}
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-primary" aria-hidden />

              <p className="flex items-center gap-2 pt-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <Calendar className="size-3.5 shrink-0" aria-hidden />
                Próxima revisão
              </p>

              <div className="flex-1">
                {nextRevisionPlanned ? (
                  <div className="space-y-4">
                    {lastService?.next_service_due_date ? (
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          Data prevista
                        </p>
                        <p
                          className={cn(
                            "font-heading text-2xl font-bold sm:text-3xl",
                            daysUntilService !== null && daysUntilService < 7
                              ? "text-red-600 dark:text-red-400"
                              : daysUntilService !== null && daysUntilService < 30
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-primary",
                          )}
                        >
                          {new Intl.DateTimeFormat("pt-PT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(
                            new Date(`${lastService.next_service_due_date}T12:00:00`),
                          )}
                        </p>
                        {daysUntilService !== null && (
                          <p
                            className={cn(
                              "mt-1 text-sm font-semibold",
                              daysUntilService < 0
                                ? "text-red-600 dark:text-red-400"
                                : daysUntilService < 7
                                  ? "text-red-600 dark:text-red-400"
                                  : daysUntilService < 30
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground",
                            )}
                          >
                            {daysUntilService < 0
                              ? `Há ${Math.abs(daysUntilService)} dias`
                              : daysUntilService === 0
                                ? "Hoje"
                                : daysUntilService === 1
                                  ? "Amanhã"
                                  : `Daqui a ${daysUntilService} dias`}
                          </p>
                        )}
                      </div>
                    ) : null}

                    {lastService?.next_service_due_km != null ? (
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          Quilometragem alvo
                        </p>
                        <p className="font-heading text-xl font-bold text-foreground">
                          {new Intl.NumberFormat("pt-PT").format(
                            lastService.next_service_due_km,
                          )}{" "}
                          km
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <p className="font-heading text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
                      Agendar com a oficina
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Planeie a manutenção preventiva e o desempenho contínuo da
                      sua unidade. A equipa Scuderia itTECH acompanha cada detalhe.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/30">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400"
                  aria-hidden
                />
                <span className="text-xs font-medium leading-snug text-amber-950 dark:text-amber-100">
                  Revisões desmo conforme programa Ducati — confirma datas com a
                  equipa.
                </span>
              </div>

              <Link
                href="/agendamento"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Agendar agora
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </>
      ) : isDetail && r ? (
        <header className="mb-8 space-y-4 border-b border-border pb-6 print:hidden">
          <nav
            className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted-foreground"
            aria-label="Navegação"
          >
            <Link href="/garagem" className="transition-colors hover:text-foreground">
              Garagem
            </Link>
            <span aria-hidden className="text-border">
              /
            </span>
            <Link
              href={`/garagem/motas/${motorcycleId}`}
              className="max-w-[200px] truncate transition-colors hover:text-foreground sm:max-w-none"
            >
              {vehicleTitle}
            </Link>
            <span aria-hidden className="text-border">
              /
            </span>
            <span className="font-medium text-foreground">Serviço</span>
          </nav>
          <div>
            <h1
              id="intervencao-heading"
              className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              {r.title ?? "Manutenção"}
            </h1>
            {r.revision_type ? (
              <p className="mt-1 text-sm font-medium text-primary">{r.revision_type}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted-foreground">
              {formatBulletinId(r.id, r.opened_at)} · {formatBoletimDisplayDate(r)}
              {r.repair_order_ref?.trim()
                ? ` · Ordem ${r.repair_order_ref.trim()}`
                : ""}
              {r.odometer_km != null ? ` · ${formatOdometerKm(r)}` : ""}
            </p>
          </div>
          <p
            className={
              estado.variant === "ok"
                ? "inline-flex w-fit items-center gap-2 rounded-full border border-emerald-800/40 bg-emerald-950/25 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                : estado.variant === "warn"
                  ? "inline-flex w-fit items-center gap-2 rounded-full border border-amber-800/40 bg-amber-950/20 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200"
                  : "inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"
            }
          >
            {estado.variant === "ok" ? (
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
            ) : estado.variant === "warn" ? (
              <Info className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <CircleDot className="size-3.5 shrink-0" aria-hidden />
            )}
            {estado.text}
          </p>
        </header>
      ) : null}

      {isDetail && r ? (
        <section
          className="mb-10 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8 print:mb-6"
          aria-labelledby={standalone ? undefined : "intervencao-panel-heading"}
          aria-label={standalone ? "Detalhe do serviço" : undefined}
        >
          {!standalone ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Este serviço
              </p>
              <h2
                id="intervencao-panel-heading"
                className="mt-2 font-heading text-2xl font-bold text-foreground md:text-3xl"
              >
                {r.title ?? "Manutenção"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatBulletinId(r.id, r.opened_at)} · {formatBoletimDisplayDate(r)}
                {r.repair_order_ref?.trim()
                  ? ` · Ordem ${r.repair_order_ref.trim()}`
                  : ""}
                {r.odometer_km != null ? ` · ${formatOdometerKm(r)}` : ""}
              </p>
              {r.revision_type ? (
                <p className="mt-1 text-sm font-medium text-primary">{r.revision_type}</p>
              ) : null}
            </>
          ) : (
            <h2 className="sr-only">Detalhe do serviço</h2>
          )}

          <div
            className={
              standalone
                ? "max-w-md"
                : "mt-6 max-w-md border-t border-border pt-6"
            }
          >
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Progresso na oficina
            </p>
            <div className="mt-2">
              <Progress value={r.progress_percent} className="h-2" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.progress_percent}% concluído
            </p>
          </div>

          {serviceNotes.length > 0 ? (
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Notas deste serviço
              </p>
              <ul className="space-y-2">
                {serviceNotes.map((note, idx) => {
                  const cfg = NOTE_COLOR_CONFIG[note.color];
                  const Icon = cfg.Icon;
                  return (
                    <li key={idx} className="flex gap-3">
                      <span className={cn("mt-0.5 shrink-0", cfg.iconBg)}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <p
                        className={cn(
                          "whitespace-pre-wrap text-sm leading-relaxed",
                          cfg.textColor,
                        )}
                      >
                        {note.text}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="mt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Trabalho concluído
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Só aparecem as tarefas que a oficina já marcou como feitas neste serviço.
            </p>
            {clientVisibleTasks.length > 0 ? (
              <ul className="space-y-2">
                {clientVisibleTasks.map((t) => (
                  <li key={t.id} className="flex gap-3 text-sm">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                    <span className="text-foreground">{t.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ainda não há tarefas concluídas registadas para este serviço.
              </p>
            )}
          </div>

          {servicePhotoHrefs.length > 0 ? (
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Fotos
              </p>
              <div className="flex flex-wrap gap-3">
                {servicePhotoHrefs.map((src, pi) => (
                  <a
                    key={pi}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-28 w-40 overflow-hidden rounded-xl border border-border"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 border-t border-border pt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Fatura
            </p>
            {currentHistoryRow?.invoiceHref ? (
              <a
                href={currentHistoryRow.invoiceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 w-full max-w-md items-center justify-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-6 py-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <FileText className="size-5 shrink-0" aria-hidden />
                Abrir fatura desta revisão (PDF)
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ainda não há fatura anexada a esta revisão.
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Próxima revisão
            </p>
            {(() => {
              const nextLine = formatNextServiceSummary(r);
              return nextLine ? (
                <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                  <p className="text-base font-semibold text-foreground">{nextLine}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Indicado pela oficina para planear a manutenção seguinte.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  A oficina ainda não registou aqui a próxima revisão em km ou por data.
                </p>
              );
            })()}
          </div>
        </section>
      ) : null}

      {!standalone ? (
        <>
      <section className="mb-10 print:mb-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-grow items-center gap-3">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Histórico de serviços
            </h3>
            <div className="hidden h-px min-w-[2rem] flex-1 bg-border sm:block" />
          </div>
          <p className="text-xs text-muted-foreground sm:max-w-md sm:text-right">
            Toca ou clica numa linha para abrir o detalhe completo noutro ecrã — ideal
            no telemóvel. As notas gerais da última revisão ficam na secção abaixo.
          </p>
        </div>
        <BoletimServiceHistoryTable
          motorcycleId={motorcycleId}
          historyRows={historyRows}
          highlightRecordId={isDetail && r ? r.id : null}
          interactive
        />
      </section>

      <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 print:mb-6">
        <section className="rounded-xl border border-border bg-card p-8">
          <div className="mb-2 flex items-center gap-3">
            <Wrench className="size-6 text-primary" aria-hidden />
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Notas técnicas — última revisão
            </h3>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Informação prioritária que a oficina destaca sobre a intervenção mais
            recente. O detalhe de cada serviço no histórico abre num ecrã próprio.
          </p>
          {lastRevisionNotes.length > 0 ? (
            <ul className="space-y-4">
              {lastRevisionNotes.map((note, idx) => {
                const cfg = NOTE_COLOR_CONFIG[note.color];
                const Icon = cfg.Icon;
                return (
                  <li
                    key={idx}
                    className={cn(
                      "flex gap-4",
                      idx < lastRevisionNotes.length - 1 &&
                        "border-b border-border pb-4",
                    )}
                  >
                    <span className={cn("mt-0.5 shrink-0", cfg.iconBg)}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <p
                      className={cn(
                        "whitespace-pre-wrap text-sm leading-relaxed",
                        cfg.textColor,
                      )}
                    >
                      {note.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ainda não há notas destacadas sobre a última revisão. Quando a
              oficina as registar, aparecem aqui em destaque.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border border-border bg-muted p-8 text-center">
            <div className="rounded-full bg-background p-4">
              <ShieldCheck className="size-10 text-primary" aria-hidden />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold">
                Certificação de origem Scuderia itTECH
              </h4>
              <p className="mx-auto mt-2 max-w-[280px] text-sm text-muted-foreground">
                Este boletim integra o registo digital da sua mota e pode ser
                complementado com anexos oficiais quando disponibilizados pela
                oficina.
              </p>
            </div>
          </div>

          <section
            id="anexos-faturas"
            className="scroll-mt-24 rounded-xl border border-border bg-card p-6 print:hidden"
          >
            <div className="mb-4 flex items-center gap-2">
              <Bike className="size-5 text-primary" aria-hidden />
              <h3 className="font-heading font-semibold">Faturas e documentos</h3>
            </div>
            {allInvoiceHrefs.length > 0 ? (
              <ul className="space-y-2">
                {allInvoiceHrefs.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <span>{item.label}</span>
                      <Download className="size-4 shrink-0 text-primary" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem faturas anexadas a estas intervenções.
              </p>
            )}
          </section>

          <BoletimFooterActions />
        </div>
      </div>

      <footer className="border-t border-border pt-8 print:pt-4">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Scuderia itTECH. Engineering precision.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Privacidade · Manuais · Suporte
            </span>
          </div>
        </div>
      </footer>
        </>
      ) : null}
    </div>

    {!standalone ? (
    <BoletimPassportPrint
      vehicleTitle={vehicleTitle}
      plate={m.plate ?? ""}
      vin={m.vin ?? ""}
      ownerName={ownerName ?? ""}
      bulletinRef={headerRef}
      generatedLabel={generatedLabel}
      tableRows={passportRows}
      totalRecords={historyRows.length}
      notesLines={passportNotes}
      nextServiceHeadline={nextServiceHeadline}
      recommendedLabel="Desmo & revisão geral"
      antesSrc={antesSrc}
      depoisSrc={depoisSrc}
    />
    ) : null}
    </>
  );
}
