import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { loadWorkshopSchedule } from "@/lib/garagem/workshop-schedule";
import { cn } from "@/lib/utils";
import { WorkingDaysForm } from "./working-days-form";
import { ClosedDatesPanel } from "./closed-dates-panel";

export default async function AdminOficinaPage() {
  const supabase = await createClient();
  const schedule = await loadWorkshopSchedule(supabase);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Oficina · Horários"
        description="Define os dias da semana em que a oficina está fechada e adiciona feriados ou férias. Os clientes não conseguem agendar nestas datas."
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Dias semanais fechados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Marca os dias da semana em que a oficina não trabalha.
        </p>
        <WorkingDaysForm closedWeekdays={schedule.closedWeekdays} />
      </section>

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Feriados e dias fechados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Adiciona datas específicas em que a oficina está fechada (ex.: feriados, férias).
        </p>
        <ClosedDatesPanel closedDates={schedule.closedDates} />
      </section>
    </div>
  );
}
