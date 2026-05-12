import type { ServiceRecord, ServiceRevisionType } from "@/types/database";

export const SERVICE_REVISION_TYPES: readonly ServiceRevisionType[] = [
  "Serviço Anual",
  "Serviço de Oleo",
  "Serviço Desmo",
  "Serviço de Verificação de Válvulas",
];

const dayFmt = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Data do serviço explícita, ou data de fecho / abertura do registo. */
export function formatBoletimDisplayDate(
  record: Pick<ServiceRecord, "service_date" | "opened_at" | "closed_at">,
): string {
  if (record.service_date) {
    return dayFmt.format(new Date(`${record.service_date}T12:00:00`));
  }
  const when = record.closed_at ?? record.opened_at;
  return dayFmt.format(new Date(when));
}

export function formatOdometerKm(
  record: Pick<ServiceRecord, "odometer_km">,
): string {
  if (record.odometer_km == null) return "—";
  return `${new Intl.NumberFormat("pt-PT").format(record.odometer_km)} km`;
}

export function formatRepairOrderRef(
  record: Pick<ServiceRecord, "repair_order_ref">,
): string {
  const s = record.repair_order_ref?.trim();
  return s ? s : "—";
}

/** Coluna «serviço»: tipo de revisão e título quando ambos existem. */
export function formatRevisionAndTitle(
  record: Pick<ServiceRecord, "revision_type" | "title">,
): string {
  const parts = [record.revision_type, record.title].filter(
    (x): x is string => Boolean(x && String(x).trim()),
  );
  return parts.join(" · ") || "Manutenção";
}

const nextDateFmt = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Resumo «próxima revisão» em km e/ou data; null se ambos vazios. */
export function formatNextServiceSummary(
  record: Pick<ServiceRecord, "next_service_due_date" | "next_service_due_km">,
): string | null {
  const parts: string[] = [];
  if (record.next_service_due_km != null) {
    parts.push(
      `${new Intl.NumberFormat("pt-PT").format(record.next_service_due_km)} km`,
    );
  }
  if (record.next_service_due_date) {
    parts.push(
      nextDateFmt.format(
        new Date(`${record.next_service_due_date}T12:00:00`),
      ),
    );
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
