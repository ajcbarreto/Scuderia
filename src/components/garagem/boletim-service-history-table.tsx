"use client";

import { Fragment, useEffect, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
} from "lucide-react";
import type { BoletimHistoryRow } from "@/types/boletim";
import type { ServiceRecord } from "@/types/database";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

function formatPtDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function statusShort(s: ServiceRecord["status"]): string {
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

function statusBadgeClass(s: ServiceRecord["status"]): string {
  switch (s) {
    case "completed":
      return "bg-emerald-950/50 text-[#90e98b] border-emerald-800/40";
    case "in_progress":
      return "bg-amber-950/50 text-amber-200 border-amber-800/40";
    case "draft":
      return "bg-zinc-800/80 text-zinc-300 border-zinc-600/40";
    case "cancelled":
      return "bg-red-950/40 text-red-300 border-red-900/40";
    default:
      return "bg-zinc-800 text-zinc-300";
  }
}

function splitShopNotes(text: string | null): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

type Props = {
  motorcycleId: string;
  historyRows: BoletimHistoryRow[];
  highlightRecordId?: string | null;
  interactive?: boolean;
};

export function BoletimServiceHistoryTable({
  motorcycleId,
  historyRows,
  highlightRecordId,
  interactive = true,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    highlightRecordId ?? null,
  );

  useEffect(() => {
    setExpandedId(highlightRecordId ?? null);
  }, [highlightRecordId]);

  if (historyRows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 bg-[#141414]/80 px-6 py-10 text-center text-sm text-muted-foreground">
        Ainda não há serviços registados. Quando a oficina abrir uma intervenção,
        o histórico aparece aqui.
      </p>
    );
  }

  const toggle = (id: string) => {
    if (!interactive) return;
    setExpandedId((cur) => (cur === id ? null : id));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <th className="w-8 px-2 py-3" aria-hidden />
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">KM</th>
            <th className="px-4 py-3">Serviço</th>
            <th className="hidden px-4 py-3 md:table-cell">Peças / tarefas</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Oficina</th>
            <th className="px-4 py-3 text-right">Fatura</th>
          </tr>
        </thead>
        <tbody>
          {historyRows.map(({ record: row, tasks, invoiceHref, photoHrefs }, i) => {
            const when = row.closed_at ?? row.opened_at;
            const parts = tasks.map((t) => t.label).join(", ") || "—";
            const isHi = highlightRecordId != null && row.id === highlightRecordId;
            const open = expandedId === row.id;
            const detailHref = `/garagem/motas/${motorcycleId}/manutencao/${row.id}`;
            const noteBlocks = splitShopNotes(row.shop_notes);

            const stop = (e: MouseEvent) => {
              e.stopPropagation();
            };

            return (
              <Fragment key={row.id}>
                <tr
                  aria-expanded={interactive ? open : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={interactive ? () => toggle(row.id) : undefined}
                  onKeyDown={
                    interactive
                      ? (e: KeyboardEvent<HTMLTableRowElement>) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(row.id);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "border-b border-white/5 transition-colors",
                    i % 2 === 0 ? "bg-[#1a1a1a]/80" : "bg-[#141414]/80",
                    interactive &&
                      "cursor-pointer hover:bg-[#252525]/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/60",
                    open && "bg-[#222]/90",
                  )}
                >
                  <td className="px-2 py-4 align-middle text-muted-foreground">
                    <ChevronDown
                      className={cn(
                        "mx-auto size-4 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 font-medium",
                      isHi && "border-l-2 border-l-primary",
                    )}
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
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-block rounded-md border px-2 py-0.5 text-xs font-semibold",
                        statusBadgeClass(row.status),
                      )}
                    >
                      {statusShort(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-heading text-sm font-bold text-primary">
                    Scuderia itTECH
                  </td>
                  <td className="px-4 py-4 text-right" onClick={stop}>
                    {invoiceHref ? (
                      <a
                        href={invoiceHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
                        title="Abrir fatura"
                        onClick={stop}
                      >
                        <FileText className="size-5" aria-hidden />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
                {open ? (
                  <tr
                    key={`${row.id}-detail`}
                    className={cn(
                      "border-b border-white/5",
                      i % 2 === 0 ? "bg-[#1a1a1a]/80" : "bg-[#141414]/80",
                    )}
                  >
                    <td colSpan={8} className="px-4 pb-6 pt-0">
                      <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-5 shadow-inner">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                              Detalhe da intervenção
                            </p>
                            <p className="mt-1 font-heading text-lg font-semibold">
                              {row.title ?? "Manutenção"}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            Progresso na oficina
                            <div className="mt-2 w-40">
                              <Progress
                                value={row.progress_percent}
                                className="h-2"
                              />
                            </div>
                            <span className="text-xs">{row.progress_percent}%</span>
                          </div>
                        </div>

                        {noteBlocks.length > 0 ? (
                          <div className="mb-5 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              Notas deste serviço
                            </p>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              {noteBlocks.map((block, idx) => (
                                <p
                                  key={idx}
                                  className="whitespace-pre-wrap rounded-lg border border-white/5 bg-black/30 px-3 py-2"
                                >
                                  {block}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="mb-5">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Checklist
                          </p>
                          {tasks.length > 0 ? (
                            <ul className="space-y-2">
                              {tasks.map((t) => (
                                <li key={t.id} className="flex gap-2 text-sm">
                                  <CheckCircle2
                                    className={cn(
                                      "mt-0.5 size-4 shrink-0",
                                      t.completed
                                        ? "text-[#90e98b]"
                                        : "text-muted-foreground",
                                    )}
                                  />
                                  <span
                                    className={
                                      t.completed
                                        ? "text-muted-foreground line-through"
                                        : ""
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

                        {photoHrefs.length > 0 ? (
                          <div className="mb-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              Fotos
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {photoHrefs.map((src, pi) => (
                                <a
                                  key={pi}
                                  href={src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative h-20 w-28 overflow-hidden rounded-lg border border-white/10"
                                >
                                  <Image
                                    src={src}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="112px"
                                    unoptimized
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
                          <Link
                            href={detailHref}
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Abrir página deste serviço
                            <ExternalLink className="size-3.5" aria-hidden />
                          </Link>
                          {invoiceHref ? (
                            <a
                              href={invoiceHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-primary"
                              onClick={stop}
                            >
                              Fatura PDF
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
