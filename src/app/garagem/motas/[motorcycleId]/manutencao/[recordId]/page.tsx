import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServiceRecord, ServiceTask } from "@/types/database";

type Props = {
  params: Promise<{ motorcycleId: string; recordId: string }>;
};

export default async function ManutencaoDetailPage({ params }: Props) {
  const { motorcycleId, recordId } = await params;
  const supabase = await createClient();

  const { data: record } = await supabase
    .from("service_records")
    .select("*")
    .eq("id", recordId)
    .eq("motorcycle_id", motorcycleId)
    .maybeSingle();

  if (!record) notFound();
  const r = record as ServiceRecord;

  const { data: tasks } = await supabase
    .from("service_tasks")
    .select("*")
    .eq("service_record_id", recordId)
    .order("sort_order", { ascending: true });

  const tlist = (tasks ?? []) as ServiceTask[];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href={`/garagem/motas/${motorcycleId}`} className="hover:text-foreground">
            Mota
          </Link>{" "}
          / Boletim
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          {r.title ?? "Boletim de manutenção"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Estado: <span className="text-foreground">{r.status}</span>
        </p>
      </div>

      <Card className="border-white/10 bg-[#131313]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Progresso</CardTitle>
          <CardDescription>
            {r.progress_percent}% concluído — atualizado pela oficina.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={r.progress_percent} className="h-2" />
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#131313]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Checklist</CardTitle>
          <CardDescription>
            Vista de leitura; a equipa marca as tarefas no painel interno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tlist.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem tarefas listadas.</p>
          ) : (
            <ul className="space-y-3">
              {tlist.map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <Checkbox checked={t.completed} disabled className="mt-0.5" />
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
          )}
        </CardContent>
      </Card>

      {r.shop_notes ? (
        <Card className="border-white/10 bg-[#131313]">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Notas da oficina</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {r.shop_notes}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
