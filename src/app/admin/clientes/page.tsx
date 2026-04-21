import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminCardClass } from "@/components/admin/admin-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Motorcycle, Profile } from "@/types/database";
import { NovoClienteForm } from "./novo-cliente-form";

export default async function AdminClientesPage() {
  const supabase = await createClient();

  const { data: clientProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("role", "client")
    .order("full_name", { ascending: true });

  const clients = (clientProfiles ?? []) as Pick<
    Profile,
    "id" | "full_name" | "phone"
  >[];

  const { data: motas } = await supabase
    .from("motorcycles")
    .select("*")
    .order("brand", { ascending: true })
    .order("model", { ascending: true });

  const list = (motas ?? []) as Motorcycle[];
  const byOwner = new Map<string, Motorcycle[]>();
  for (const m of list) {
    const arr = byOwner.get(m.current_owner_id) ?? [];
    arr.push(m);
    byOwner.set(m.current_owner_id, arr);
  }

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Clientes"
        description="Contas de acesso à garagem e motas atualmente associadas a cada pessoa (dono atual)."
        actions={
          <Link
            href="/admin/motas"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-white/15",
            )}
          >
            Ir para Motas
          </Link>
        }
      />

      <Card className={cn(adminCardClass)}>
        <CardHeader>
          <CardTitle className="font-heading">Novo cliente</CardTitle>
          <CardDescription>
            Cria a conta e entrega email e palavra-passe ao cliente para ver as motas na garagem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NovoClienteForm />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Listagem</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada cartão mostra o contacto e as motas em que esta pessoa é o dono atual.
          </p>
        </div>

        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não há clientes registados.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {clients.map((c) => {
              const owned = byOwner.get(c.id) ?? [];
              return (
                <li key={c.id}>
                  <div className={cn(adminCardClass, "h-full")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-heading text-lg">
                        {c.full_name ?? "Sem nome"}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {c.phone ? (
                          <span>Tel. {c.phone}</span>
                        ) : (
                          <span>Sem telemóvel</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      {owned.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sem motas como dono atual.</p>
                      ) : (
                        <ul className="space-y-2">
                          {owned.map((m) => (
                            <li key={m.id}>
                              <Link
                                href={`/admin/motas/${m.id}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#1a1a1a] px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-[#1e1e1e]"
                              >
                                <span className="font-medium">
                                  {m.brand} {m.model}
                                </span>
                                <Badge variant="outline" className="border-white/15 font-normal">
                                  {m.plate ?? "—"}
                                </Badge>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        href={`/admin/motas?cliente=${c.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "-ml-2 text-muted-foreground",
                        )}
                      >
                        Registar mota para este cliente
                      </Link>
                    </CardContent>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
