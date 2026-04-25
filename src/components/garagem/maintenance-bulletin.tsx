import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
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
import { BoletimFooterActions } from "@/components/garagem/boletim-footer-actions";
import { BoletimPassportPrint } from "@/components/garagem/boletim-passport-print";
import { BoletimServiceHistoryTable } from "@/components/garagem/boletim-service-history-table";
import { Progress } from "@/components/ui/progress";

export type { BoletimHistoryRow as HistoryRow } from "@/types/boletim";

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
    const when = record.closed_at ?? record.opened_at;
    const dateStr = new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(when));
    const parts = tasks.map((t) => t.label).join(", ") || "—";
    return {
      date: dateStr,
      km: "—",
      service: record.title ?? "Manutenção",
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
  const standalone =
    props.variant === "detail" &&
    "detailPresentation" in props &&
    props.detailPresentation === "standalone";

  const generatedLabel = formatPtDate(new Date().toISOString());
  const vehicleTitle = `${m.brand} ${m.model}`.trim();
  const lastService = historyRows[0]?.record;
  const lastServiceLabel = lastService
    ? formatPtDate((lastService.closed_at ?? lastService.opened_at) as string)
    : "—";

  const fleetStatus = aggregateFleetStatus(historyRows);
  const detailStatus = r ? statusLabel(r.status) : fleetStatus;
  const estado = isDetail ? detailStatus : fleetStatus;

  const headerRef = isDetail && r
    ? formatBulletinId(r.id, r.opened_at)
    : formatMotoRefId(m.id, m.updated_at);

  const lastRevisionNotesBlocks =
    lastService?.shop_notes
      ?.split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean) ?? [];

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_URL ??
    "https://wa.me/?text=" +
      encodeURIComponent(
        isDetail && r
          ? `Olá Scuderia itTECH — boletim ${formatBulletinId(r.id, r.opened_at)} (${vehicleTitle}).`
          : `Olá Scuderia itTECH — garagem: ${vehicleTitle} (${m.plate ?? "sem matrícula"}).`,
      );

  const passportRows = mapHistoryToPassportRows(historyRows);
  const { antesSrc, depoisSrc } = pickAntesDepoisPhotos(
    isDetail ? "detail" : "overview",
    historyRows,
    isDetail && r ? r.id : null,
    ENGINE_IMAGE,
  );

  const passportNotes =
    lastRevisionNotesBlocks.length > 0
      ? lastRevisionNotesBlocks.flatMap((block) =>
          block
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        )
      : isDetail && r && currentTasks.length > 0
        ? currentTasks.map((t) => t.label).filter(Boolean)
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
  const serviceNotesBlocks =
    isDetail && r
      ? (r.shop_notes
          ?.split(/\n\s*\n/)
          .map((b) => b.trim())
          .filter(Boolean) ?? [])
      : [];

  return (
    <>
    <div
      id="maintenance-bulletin-print"
      className="carbon-texture text-foreground print:hidden"
    >
      {!standalone ? (
        <>
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end print:mb-6">
            <div>
              <h1 className="font-heading text-4xl font-bold uppercase tracking-tighter md:text-6xl">
                Boletim de manutenção
              </h1>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {isDetail
                  ? "Detalhe da intervenção"
                  : "Relatório de controlo e manutenção"}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-heading text-lg font-bold text-primary">{headerRef}</p>
              <p className="text-sm text-muted-foreground">Gerado em: {generatedLabel}</p>
            </div>
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
                    <p className="text-lg font-bold text-muted-foreground">—</p>
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
                      className={
                        estado.variant === "ok"
                          ? "flex items-center gap-1 text-lg font-bold text-[#90e98b]"
                          : "flex items-center gap-1 text-lg font-bold text-amber-200"
                      }
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
              </div>
            </div>

            <div className="boletim-glow-card flex flex-col gap-6 rounded-xl border border-primary/20 bg-[#121212] p-8 shadow-[0_0_40px_rgba(220,38,38,0.12)]">
              <p className="flex items-center gap-3 font-heading text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                <span className="h-px w-8 bg-primary/30" />
                Próxima revisão
              </p>
              <div>
                <p className="font-heading text-5xl font-bold leading-none tracking-tighter md:text-6xl">
                  Agendar
                </p>
                <p className="mt-2 text-xl font-bold uppercase tracking-[0.2em] text-primary/90">
                  com a oficina
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Planeie a manutenção preventiva e desempenho contínuo da sua unidade.
                A equipa Scuderia itTECH acompanha cada detalhe.
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5">
                <AlertTriangle className="size-3.5 shrink-0 text-primary" aria-hidden />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Revisões desmo conforme programa Ducati
                </span>
              </div>
              <Link
                href="/agendamento"
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#348017] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all hover:brightness-110"
              >
                Agendar agora
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </>
      ) : isDetail && r ? (
        <div className="mb-8 border-b border-border pb-6 print:hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Scuderia itTECH · serviço
          </p>
          <p className="mt-2 font-heading text-xl font-bold">{vehicleTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {m.plate ?? "—"} · {headerRef} · Gerado em {generatedLabel}
          </p>
        </div>
      ) : null}

      {isDetail && r ? (
        <section
          className="mb-10 rounded-xl border border-primary/25 bg-gradient-to-b from-[#161616] to-[#0a0a0a] p-6 md:p-8 print:mb-6"
          aria-labelledby="intervencao-heading"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Este serviço
          </p>
          <h2
            id="intervencao-heading"
            className="mt-2 font-heading text-2xl font-bold md:text-3xl"
          >
            {r.title ?? "Manutenção"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatBulletinId(r.id, r.opened_at)} ·{" "}
            {formatPtDate((r.closed_at ?? r.opened_at) as string)}
          </p>

          <div className="mt-6 max-w-md border-t border-border pt-6">
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

          {serviceNotesBlocks.length > 0 ? (
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Notas deste serviço
              </p>
              <div className="space-y-2">
                {serviceNotesBlocks.map((block, idx) => (
                  <p
                    key={idx}
                    className="whitespace-pre-wrap rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
                  >
                    {block}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Checklist
            </p>
            {currentTasks.length > 0 ? (
              <ul className="space-y-2">
                {currentTasks.map((t) => (
                  <li key={t.id} className="flex gap-3 text-sm">
                    <CheckCircle2
                      className={
                        t.completed
                          ? "mt-0.5 size-4 shrink-0 text-[#90e98b]"
                          : "mt-0.5 size-4 shrink-0 text-muted-foreground"
                      }
                    />
                    <span
                      className={
                        t.completed ? "text-muted-foreground line-through" : ""
                      }
                    >
                      {t.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem tarefas listadas para este registo.
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
        </section>
      ) : null}

      {!standalone ? (
        <>
      <section className="mb-10 print:mb-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-grow items-center gap-4">
            <h3 className="font-heading text-xl font-bold uppercase md:text-2xl">
              Histórico de serviços
            </h3>
            <div className="h-px flex-1 bg-white/10" />
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
            <h3 className="font-heading text-lg font-bold uppercase tracking-tight">
              Notas técnicas — última revisão
            </h3>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Informação prioritária que a oficina destaca sobre a intervenção mais
            recente. O detalhe de cada serviço no histórico abre num ecrã próprio.
          </p>
          {lastRevisionNotesBlocks.length > 0 ? (
            <ul className="space-y-4">
              {lastRevisionNotesBlocks.map((block, idx) => (
                <li
                  key={idx}
                  className={
                    idx < lastRevisionNotesBlocks.length - 1
                      ? "flex gap-4 border-b border-border pb-4"
                      : "flex gap-4"
                  }
                >
                  <span
                    className={
                      idx === 0
                        ? "rounded bg-red-950/40 p-1 text-red-400"
                        : "rounded bg-emerald-950/40 p-1 text-[#90e98b]"
                    }
                  >
                    {idx === 0 ? (
                      <AlertTriangle className="size-4" aria-hidden />
                    ) : (
                      <CheckCircle2 className="size-4" aria-hidden />
                    )}
                  </span>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {block}
                  </p>
                </li>
              ))}
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

          <BoletimFooterActions whatsappHref={whatsappHref} />
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
