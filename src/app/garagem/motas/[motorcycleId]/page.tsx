import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Motorcycle, ServiceRecord } from "@/types/database";

type Props = { params: Promise<{ motorcycleId: string }> };

export default async function MotorcycleDetailPage({ params }: Props) {
  const { motorcycleId } = await params;
  const supabase = await createClient();

  const { data: mota } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", motorcycleId)
    .maybeSingle();

  if (!mota) notFound();
  const m = mota as Motorcycle;

  const { data: records } = await supabase
    .from("service_records")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("opened_at", { ascending: false });

  const recs = (records ?? []) as ServiceRecord[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/garagem" className="hover:text-foreground">
              Garagem
            </Link>{" "}
            / {m.brand} {m.model}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">
            {m.brand} {m.model}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{m.year ?? "Ano —"}</Badge>
            <Badge variant="outline" className="border-white/15">
              {m.plate ?? "Matrícula —"}
            </Badge>
          </div>
        </div>
        <Link
          href={`/api/garagem/motas/${m.id}/livro`}
          prefetch={false}
          className={buttonVariants({
            variant: "outline",
            className: "border-white/15",
          })}
        >
          Descarregar livro (PDF)
        </Link>
      </div>

      <Card className="border-white/10 bg-[#131313]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Intervenções</CardTitle>
          <CardDescription>
            Boletins de manutenção e progresso na oficina.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem registos ainda — quando existir uma intervenção, aparece aqui.
            </p>
          ) : (
            <ul className="space-y-2">
              {recs.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/garagem/motas/${m.id}/manutencao/${r.id}`}
                    className="flex items-center justify-between rounded-lg bg-[#1a1a1a] px-4 py-3 transition-colors hover:bg-[#202020]"
                  >
                    <span className="font-medium">
                      {r.title ?? "Manutenção"}
                    </span>
                    <span className="text-sm text-primary">
                      {r.progress_percent}% · {r.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
