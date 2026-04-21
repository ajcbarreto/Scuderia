import { AppointmentForm } from "@/components/appointments/appointment-form";

export default function AgendamentoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Pedido de agendamento</h1>
        <p className="mt-2 text-muted-foreground">
          Indica a data preferida e o que precisas. A oficina confirma por contacto.
        </p>
      </div>
      <AppointmentForm />
    </div>
  );
}
