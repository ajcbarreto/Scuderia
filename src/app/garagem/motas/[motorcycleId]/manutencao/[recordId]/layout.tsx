import { createClient } from "@/lib/supabase/server";
import { GaragemVoltarBar } from "@/components/garagem/garagem-voltar-bar";
import type { Motorcycle } from "@/types/database";

export default async function ManutencaoServicoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ motorcycleId: string; recordId: string }>;
}) {
  const { motorcycleId } = await params;
  const supabase = await createClient();
  const { data: moto } = await supabase
    .from("motorcycles")
    .select("brand, model")
    .eq("id", motorcycleId)
    .maybeSingle();

  const m = moto as Pick<Motorcycle, "brand" | "model"> | null;
  const subtitle = m ? `${m.brand} ${m.model}`.trim() : null;

  return (
    <div className="flex flex-col">
      <GaragemVoltarBar
        href={`/garagem/motas/${motorcycleId}`}
        label="Voltar ao boletim"
        subtitle={subtitle}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
