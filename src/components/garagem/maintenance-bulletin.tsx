import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  CheckCircle2,
  Download,
  FileText,
  Info,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { Motorcycle, ServiceRecord, ServiceTask } from "@/types/database";
import { BoletimFooterActions } from "@/components/garagem/boletim-footer-actions";

const ENGINE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCSDKQVpb9MjJndC53F3QIcjh1SJKCZ03HKBbbTpRgtMVCeuzV6v4mzwlVOQx85KKQ7j4LjXiNjzCYjr4gxjrXo9M0wpRdkT-JUjBA5UgDkvwne0_DbygXUoygfalM0mS1VOI8SPmUK_pPJ0XZdRu7IN32nXYw5pIWnnn7Jv7Mu0wgQeM5ROEmjRdRfjMLpycugWo1y9pcUPTTFJ4QhHvofPs5oeNpq2_JJA89QIalBClcH86vxImSN7feTLeHSQmcKQvBCInqVRa4";

function formatBulletinId(recordId: string, openedAt: string) {
  const y = new Date(openedAt).getFullYear();
  const compact = recordId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `#SLT-${compact}-${y}`;
}

function formatPtDate(iso: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatPtDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
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

export type HistoryRow = {
  record: ServiceRecord;
  tasks: ServiceTask[];
  invoiceHref: string | null;
};

export type MaintenanceBulletinProps = {
  motorcycle: Motorcycle;
  ownerName: string | null;
  currentRecord: ServiceRecord;
  currentTasks: ServiceTask[];
  historyRows: HistoryRow[];
  allInvoiceHrefs: { label: string; href: string }[];
};

export function MaintenanceBulletin({
  motorcycle: m,
  ownerName,
  currentRecord: r,
  currentTasks,
  historyRows,
  allInvoiceHrefs,
}: MaintenanceBulletinProps) {
  const bulletinId = formatBulletinId(r.id, r.opened_at);
  const generatedLabel = formatPtDate(new Date().toISOString());
  const vehicleTitle = `${m.brand} ${m.model}`.trim();
  const lastService = historyRows[0]?.record;
  const lastServiceLabel = lastService
    ? formatPtDate((lastService.closed_at ?? lastService.opened_at) as string)
    : "—";

  const notesBlocks =
    r.shop_notes
      ?.split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean) ?? [];

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_URL ??
    "https://wa.me/?text=" +
      encodeURIComponent(
        `Olá Scuderia itTECH — boletim ${bulletinId} (${vehicleTitle}).`,
      );

  return (
    <div
      id="maintenance-bulletin-print"
      className="carbon-texture text-foreground"
    >
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end print:mb-6">
        <div>
          <h1 className="font-heading text-4xl font-bold uppercase tracking-tighter md:text-6xl">
            Boletim de manutenção
          </h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Relatório de controlo e manutenção
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="font-heading text-lg font-bold text-primary">{bulletinId}</p>
          <p className="text-sm text-muted-foreground">Gerado em: {generatedLabel}</p>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3 print:mb-6">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card lg:col-span-2">
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
            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
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
                    statusLabel(r.status).variant === "ok"
                      ? "flex items-center gap-1 text-lg font-bold text-[#90e98b]"
                      : "flex items-center gap-1 text-lg font-bold text-amber-200"
                  }
                >
                  {statusLabel(r.status).variant === "ok" ? (
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <Info className="size-4 shrink-0" aria-hidden />
                  )}
                  {statusLabel(r.status).text}
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

      <section className="mb-10 print:mb-6">
        <div className="mb-6 flex items-center gap-4">
          <h3 className="font-heading text-xl font-bold uppercase md:text-2xl">
            Histórico de serviços
          </h3>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">KM</th>
                <th className="px-4 py-3">Serviço realizado</th>
                <th className="hidden px-4 py-3 md:table-cell">Peças / tarefas</th>
                <th className="px-4 py-3 text-right">Oficina</th>
                <th className="px-4 py-3 text-right">Fatura</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map(({ record: row, tasks, invoiceHref }, i) => {
                const isCurrent = row.id === r.id;
                const when = row.closed_at ?? row.opened_at;
                const parts = tasks.map((t) => t.label).join(", ") || "—";
                return (
                  <tr
                    key={row.id}
                    className={
                      i % 2 === 0
                        ? "border-b border-white/5 bg-[#1a1a1a]/80"
                        : "border-b border-white/5 bg-[#141414]/80"
                    }
                  >
                    <td
                      className={
                        isCurrent
                          ? "border-l-2 border-l-primary px-4 py-4 font-medium"
                          : "px-4 py-4 font-medium"
                      }
                    >
                      {formatPtDateTime(when)}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">—</td>
                    <td className="px-4 py-4 font-semibold">
                      {row.title ?? "Manutenção"}
                    </td>
                    <td className="hidden max-w-[220px] px-4 py-4 text-xs italic text-muted-foreground md:table-cell">
                      {parts}
                    </td>
                    <td className="px-4 py-4 text-right font-heading text-sm font-bold text-primary">
                      Scuderia itTECH
                    </td>
                    <td className="px-4 py-4 text-right">
                      {invoiceHref ? (
                        <a
                          href={invoiceHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
                          title="Abrir fatura"
                        >
                          <FileText className="size-5" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 print:mb-6">
        <section className="rounded-xl border border-white/10 bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <Wrench className="size-6 text-primary" aria-hidden />
            <h3 className="font-heading text-lg font-bold uppercase tracking-tight">
              Notas técnicas da oficina
            </h3>
          </div>
          {notesBlocks.length > 0 ? (
            <ul className="space-y-4">
              {notesBlocks.map((block, idx) => (
                <li
                  key={idx}
                  className={
                    idx < notesBlocks.length - 1
                      ? "flex gap-4 border-b border-white/10 pb-4"
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
          ) : currentTasks.length > 0 ? (
            <ul className="space-y-3">
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
              Sem notas adicionais para esta intervenção.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border border-white/10 bg-[#262626] p-8 text-center">
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
            className="scroll-mt-24 rounded-xl border border-white/10 bg-[#1a1a1a] p-6 print:hidden"
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
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/5"
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

      <footer className="border-t border-white/10 pt-8 print:pt-4">
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
    </div>
  );
}
