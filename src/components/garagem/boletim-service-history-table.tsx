"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import type { BoletimHistoryRow } from "@/types/boletim";
import type { ServiceRecord } from "@/types/database";
import {
  formatBoletimDisplayDate,
  formatNextServiceSummary,
  formatOdometerKm,
  formatRepairOrderRef,
  formatRevisionAndTitle,
} from "@/lib/garagem/service-record-display";
import { cn } from "@/lib/utils";

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
      return "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "in_progress":
      return "border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200";
    case "draft":
      return "border border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-200";
    case "cancelled":
      return "border border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300";
    default:
      return "border border-border bg-muted text-muted-foreground";
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
      <p className="rounded-xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center text-sm text-muted-foreground">
        Ainda não há serviços registados. Quando a oficina abrir uma intervenção,
        o histórico aparece aqui.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <th className="w-10 px-2 py-3" aria-hidden />
            <th className="px-3 py-3 sm:px-4">Data</th>
            <th className="hidden px-3 py-3 sm:table-cell sm:px-4">N.º OR</th>
            <th className="px-3 py-3 sm:px-4">KM</th>
            <th className="min-w-[140px] px-3 py-3 sm:px-4">Serviço</th>
            <th className="hidden max-w-[140px] px-3 py-3 lg:table-cell lg:px-4">
              Próx. revisão
            </th>
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
            const parts =
              tasks
                .filter((t) => t.completed)
                .map((t) => t.label)
                .join(", ") || "—";
            const isHi = highlightRecordId != null && row.id === highlightRecordId;
            const detailHref = `/garagem/motas/${motorcycleId}/manutencao/${row.id}`;
            const title = formatRevisionAndTitle(row);
            const nextDue = formatNextServiceSummary(row);

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
                  "border-b border-border/60 transition-colors",
                  i % 2 === 0 ? "bg-card/80" : "bg-muted/80",
                  interactive &&
                    "cursor-pointer hover:bg-muted focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/60",
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
                  {formatBoletimDisplayDate(row)}
                </td>
                <td className="hidden px-3 py-5 align-middle text-muted-foreground sm:table-cell sm:px-4 sm:py-4">
                  {formatRepairOrderRef(row)}
                </td>
                <td className="px-3 py-5 align-middle text-muted-foreground sm:px-4 sm:py-4">
                  {formatOdometerKm(row)}
                </td>
                <td className="px-3 py-5 align-middle font-semibold sm:px-4 sm:py-4">
                  {title}
                </td>
                <td className="hidden max-w-[140px] px-3 py-5 align-middle text-xs text-muted-foreground lg:table-cell lg:px-4 lg:py-4">
                  {nextDue ?? "—"}
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
