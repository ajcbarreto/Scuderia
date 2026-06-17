import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { UserRole } from "@/types/database";

/**
 * Eventos de uso registados na tabela `activity_events`. Manter este union
 * sincronizado com os pontos de instrumentação — usar sempre estes literais
 * garante consistência nas queries de análise.
 */
export type ActivityEventType =
  // Visitantes (sem conta) e leads
  | "page_view"
  | "contact_submitted"
  // Autenticação
  | "login"
  | "account_activated"
  // Cliente
  | "appointment_requested"
  | "boletim_viewed"
  | "pdf_downloaded"
  | "profile_updated"
  | "password_changed"
  // Admin / oficina
  | "service_record_opened"
  | "service_record_completed"
  | "appointment_confirmed"
  | "appointment_rejected"
  | "client_created"
  | "motorcycle_created"
  | "motorcycle_transferred";

type LogEventInput = {
  eventType: ActivityEventType;
  userId?: string | null;
  role?: UserRole | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Regista um evento de uso. **Best-effort**: nunca lança exceção — se a
 * recolha de analytics falhar, a ação principal (boletim, agendamento, login…)
 * continua sem ser afetada. Escreve com a service-role key, por isso ignora RLS.
 */
export async function logEvent(input: LogEventInput): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("activity_events").insert({
      event_type: input.eventType,
      user_id: input.userId ?? null,
      role: input.role ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    });
    if (error) {
      console.error("[analytics] logEvent falhou:", error.message);
    }
  } catch (e) {
    console.error(
      "[analytics] logEvent exceção:",
      e instanceof Error ? e.message : e,
    );
  }
}
