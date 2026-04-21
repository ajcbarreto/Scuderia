import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [{ count: motas }, { count: clientes }, { count: abertos }] =
    await Promise.all([
      supabase.from("motorcycles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client"),
      supabase
        .from("service_records")
        .select("*", { count: "exact", head: true })
        .in("status", ["draft", "in_progress"]),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Backoffice
        </h1>
        <p className="mt-2 text-muted-foreground">
          Resumo da frota e trabalhos em curso.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 bg-[#131313]">
          <CardHeader>
            <CardDescription>Motas registadas</CardDescription>
            <CardTitle className="font-heading text-3xl">{motas ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/10 bg-[#131313]">
          <CardHeader>
            <CardDescription>Clientes</CardDescription>
            <CardTitle className="font-heading text-3xl">{clientes ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/10 bg-[#131313]">
          <CardHeader>
            <CardDescription>Intervenções abertas</CardDescription>
            <CardTitle className="font-heading text-3xl">{abertos ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#131313]">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading">Ações rápidas</CardTitle>
            <CardDescription>
              Gestão de clientes, boletins e ficheiros da oficina.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/admin/clientes"
            className={buttonVariants({ className: "font-heading" })}
          >
            Gestão de clientes e frota
          </Link>
          <Link
            href="/admin/boletins"
            className={buttonVariants({
              variant: "outline",
              className: "border-white/15",
            })}
          >
            Boletins de intervenção
          </Link>
          <Link
            href="/admin/documentos"
            className={buttonVariants({
              variant: "outline",
              className: "border-white/15",
            })}
          >
            Faturas e documentos
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
