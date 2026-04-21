import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Motorcycle } from "@/types/database";

export default async function GaragemPage() {
  const supabase = await createClient();
  const { data: motas, error } = await supabase
    .from("motorcycles")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (motas ?? []) as Motorcycle[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          As tuas motas
        </h1>
        <p className="mt-2 text-muted-foreground">
          Consulta o estado na oficina e o histórico de revisões.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar dados. Confirma as variáveis Supabase e a
          migração SQL.
        </p>
      ) : null}

      {list.length === 0 ? (
        <Card className="border-white/10 bg-[#131313]">
          <CardHeader>
            <CardTitle className="font-heading">Ainda sem motas</CardTitle>
            <CardDescription>
              Quando a oficina registar a tua mota na frota, ela aparece aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/agendamento"
              className={buttonVariants({
                variant: "outline",
                className: "border-white/15",
              })}
            >
              Pedir primeiro agendamento
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((m) => (
            <li key={m.id}>
              <Link href={`/garagem/motas/${m.id}`}>
                <Card className="h-full border-white/10 bg-[#131313] transition-colors hover:bg-[#1a1a1a]">
                  <CardHeader className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-heading text-lg">
                        {m.brand} {m.model}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        {m.year ?? "—"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Matrícula: {m.plate ?? "—"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
