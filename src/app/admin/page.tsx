import Link from "next/link";
import { Bike, ClipboardList, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const stats = [
    {
      label: "Motas registadas",
      value: motas ?? 0,
      hint: "Na frota",
      icon: Bike,
    },
    {
      label: "Clientes",
      value: clientes ?? 0,
      hint: "Contas na garagem",
      icon: Users,
    },
    {
      label: "Intervenções abertas",
      value: abertos ?? 0,
      hint: "Rascunho ou em curso",
      icon: ClipboardList,
    },
  ] as const;

  const quick = [
    {
      title: "Oficina",
      desc: "Entrada em serviço e progresso das intervenções.",
      href: "/admin/servico",
      primary: true,
    },
    {
      title: "Boletins",
      desc: "Serviços em curso, nova intervenção e histórico completo.",
      href: "/admin/boletins",
      primary: false,
    },
    {
      title: "Clientes",
      desc: "Contas na garagem e motas associadas a cada pessoa.",
      href: "/admin/clientes",
      primary: false,
    },
    {
      title: "Motas",
      desc: "Frota, transferências e ficha com revisões e manutenções.",
      href: "/admin/motas",
      primary: false,
    },
    {
      title: "Documentos",
      desc: "Anexos e ficheiros carregados nos boletins.",
      href: "/admin/documentos",
      primary: false,
    },
  ] as const;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Painel"
        description="Resumo da operação: frota, clientes e trabalhos em curso na oficina."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <div
            key={label}
            className={cn(
              adminSurface,
              "relative overflow-hidden p-5 sm:p-6",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-tight">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Atalhos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesso direto às áreas mais usadas do backoffice.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quick.map(({ title, desc, href, primary }) => (
            <Link key={href} href={href} className="group block h-full">
              <Card
                className={cn(
                  "h-full border-white/[0.08] bg-[#141414] transition-colors",
                  "hover:border-primary/25 hover:bg-[#181818]",
                )}
              >
                <CardHeader>
                  <CardTitle className="font-heading text-base transition-colors group-hover:text-primary">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-[13px] leading-relaxed">
                    {desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span
                    className={buttonVariants({
                      variant: primary ? "default" : "outline",
                      size: "sm",
                      className: primary
                        ? "font-heading"
                        : "border-white/15 font-heading",
                    })}
                  >
                    Abrir
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
