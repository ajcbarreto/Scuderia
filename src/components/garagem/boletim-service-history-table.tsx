"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import type { BoletimHistoryRow } from "@/types/boletim";
import type { ServiceRecord } from "@/types/database";
import { cn } from "@/lib/utils";

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
  const router = useRouter();

  if (historyRows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 bg-[#141414]/80 px-6 py-10 text-center text-sm text-muted-foreground">
        Ainda não há serviços registados. Quando a oficina abrir uma intervenção,
        o histórico aparece aqui.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <th className="w-10 px-2 py-3" aria-hidden />
            <th className="px-3 py-3 sm:px-4">Data</th>
            <th className="px-3 py-3 sm:px-4">KM</th>
            <th className="min-w-[140px] px-3 py-3 sm:px-4">Serviço</th>
            <th className="hidden px-4 py-3 md:table-cell">Peças / tarefas</th>
            <th className="px-3 py-3 sm:px-4">Estado</th>
            <th className="hidden px-4 py-3 sm:table-cell sm:text-right">
              Oficina
            </th>
            <th className="px-3 py-3 text-right sm:px-4">Fatura</th>
          </tr>
        </thead>
        <tbody>
          {historyRows.map(({ record: row, tasks, invoiceHref }, i) => {
            const when = row.closed_at ?? row.opened_at;
            const parts = tasks.map((t) => t.label).join(", ") || "—";
            const isHi = highlightRecordId != null && row.id === highlightRecordId;
            const detailHref = `/garagem/motas/${motorcycleId}/manutencao/${row.id}`;
            const title = row.title ?? "Manutenção";

            const stop = (e: MouseEvent) => {
              e.stopPropagation();
            };

            const go = () => {
              if (interactive) router.push(detailHref);
            };

            return (
              <tr
                key={row.id}
                role={interactive ? "link" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={`Abrir detalhe: ${title}`}
                onClick={interactive ? go : undefined}
                onKeyDown={
                  interactive
                    ? (e: KeyboardEvent<HTMLTableRowElement>) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          go();
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-b border-white/5 transition-colors",
                  i % 2 === 0 ? "bg-[#1a1a1a]/80" : "bg-[#141414]/80",
                  interactive &&
                    "cursor-pointer hover:bg-[#252525]/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/60",
                  isHi && "ring-1 ring-inset ring-primary/40",
                )}
              >
                <td className="px-2 py-5 align-middle text-primary sm:py-4">
                  <ChevronRight
                    className="mx-auto size-5 shrink-0 opacity-80"
                    aria-hidden
                  />
                </td>
                <td
                  className={cn(
                    "px-3 py-5 align-middle font-medium sm:px-4 sm:py-4",
                    isHi && "border-l-2 border-l-primary",
                  )}
                >
                  {formatPtDateTime(when)}
                </td>
                <td className="px-3 py-5 align-middle text-muted-foreground sm:px-4 sm:py-4">
                  —
                </td>
                <td className="px-3 py-5 align-middle font-semibold sm:px-4 sm:py-4">
                  {title}
                </td>
                <td className="hidden max-w-[220px] px-4 py-4 text-xs italic text-muted-foreground md:table-cell">
                  {parts}
                </td>
                <td className="px-3 py-5 align-middle sm:px-4 sm:py-4">
                  <span
                    className={cn(
                      "inline-block rounded-md border px-2 py-0.5 text-xs font-semibold",
                      statusBadgeClass(row.status),
                    )}
                  >
                    {statusShort(row.status)}
                  </span>
                </td>
                <td className="hidden px-4 py-4 text-right font-heading text-sm font-bold text-primary sm:table-cell">
                  Scuderia itTECH
                </td>
                <td className="px-3 py-5 text-right sm:px-4 sm:py-4" onClick={stop}>
                  {invoiceHref ? (
                    <a
                      href={invoiceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary sm:min-h-0 sm:min-w-0 sm:p-2"
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
