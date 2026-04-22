import Link from "next/link";
import { Bike, MoreVertical, PlusCircle, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminSurfaceLow } from "@/components/admin/admin-styles";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Motorcycle, Profile } from "@/types/database";
import { NovoClienteForm } from "./novo-cliente-form";

type PageProps = {
  searchParams: Promise<{ cliente?: string }>;
};

function initials(name: string | null) {
  const p = (name ?? "?").trim().split(/\s+/).filter(Boolean);
  const a = p[0]?.[0] ?? "?";
  const b = p.length > 1 ? p[p.length - 1]![0] : p[0]?.[1];
  return (a + (b ?? "")).toUpperCase().slice(0, 2);
}

export default async function AdminClientesPage({ searchParams }: PageProps) {
  const { cliente: clienteParam } = await searchParams;
  const supabase = await createClient();

  const { data: clientProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("role", "client")
    .order("full_name", { ascending: true });

  const clients = (clientProfiles ?? []) as Pick<Profile, "id" | "full_name" | "phone">[];

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

  const selectedId =
    clienteParam && clients.some((c) => c.id === clienteParam)
      ? clienteParam
      : clients[0]?.id ?? null;

  const selected = clients.find((c) => c.id === selectedId) ?? null;
  const owned = selectedId ? (byOwner.get(selectedId) ?? []) : [];

  const motoIds = owned.map((m) => m.id);
  const { data: openRecords } =
    motoIds.length > 0
      ? await supabase
          .from("service_records")
          .select("motorcycle_id, status")
          .in("motorcycle_id", motoIds)
          .in("status", ["draft", "in_progress"])
      : { data: [] as { motorcycle_id: string; status: string }[] };

  const openByMoto = new Map<string, string>();
  for (const r of openRecords ?? []) {
    if (!openByMoto.has(r.motorcycle_id)) openByMoto.set(r.motorcycle_id, r.status);
  }

  function statusLabel(motoId: string) {
    const s = openByMoto.get(motoId);
    if (s === "in_progress") return { label: "Em serviço", className: "bg-primary/15 text-primary" };
    if (s === "draft") return { label: "Rascunho", className: "bg-[#262626] text-[#adaaaa]" };
    return { label: "Operacional", className: "bg-[#0b6b1d]/15 text-[#90e98b]" };
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 border-b border-[#484847]/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
            Scuderia itTECH
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-4 w-px bg-[#484847]/40" />
            <p className="font-heading text-xs font-medium uppercase tracking-widest text-[#adaaaa]">
              Clientes & frota
            </p>
          </div>
        </div>
        <div className="relative w-full max-w-md rounded-full border border-[#484847]/15 bg-[#262626]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#adaaaa]">
            <User className="size-4" aria-hidden />
          </span>
          <p className="py-2.5 pl-10 pr-4 font-heading text-[10px] uppercase tracking-widest text-[#767575]">
            Pesquisa por nome na lista ao lado
          </p>
        </div>
      </header>

      <Card id="novo-cliente" className="border-[#484847]/15 bg-[#1a1a1a] shadow-none ring-0">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-white">Novo cliente</CardTitle>
          <CardDescription className="text-[#adaaaa]">
            Cria a conta e entrega credenciais para a pessoa aceder à garagem digital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NovoClienteForm />
        </CardContent>
      </Card>

      {clients.length === 0 ? (
        <p className="text-sm text-[#adaaaa]">Ainda não há clientes registados.</p>
      ) : (
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="flex flex-col gap-4 lg:col-span-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Diretório
              </h2>
              <span className="rounded bg-[#1a1a1a] px-2 py-0.5 font-heading text-[10px] uppercase tracking-widest text-[#adaaaa]">
                {clients.length} ativos
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {clients.map((c) => {
                const active = c.id === selectedId;
                const preview = (byOwner.get(c.id) ?? [])[0];
                return (
                  <Link
                    key={c.id}
                    href={`/admin/clientes?cliente=${c.id}`}
                    scroll={false}
                    className={cn(
                      "relative overflow-hidden rounded-lg p-4 transition-colors",
                      active
                        ? "border-l-2 border-primary bg-[#1a1a1a]"
                        : "border-l-2 border-transparent bg-[#131313] hover:border-[#484847]/50",
                    )}
                  >
                    {active ? (
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
                        aria-hidden
                      />
                    ) : null}
                    <div className="relative z-10 flex items-center gap-4">
                      <div
                        className={cn(
                          "flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#484847]/20 bg-[#262626]",
                          active ? "text-primary" : "text-[#adaaaa]",
                        )}
                      >
                        <User className="size-6" style={active ? { opacity: 1 } : undefined} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={cn(
                            "truncate font-heading text-sm font-bold uppercase tracking-tight",
                            active ? "text-white" : "text-white/70 hover:text-white",
                          )}
                        >
                          {c.full_name ?? "Sem nome"}
                        </h3>
                        <p className="mt-0.5 truncate font-heading text-[10px] uppercase tracking-wider text-[#adaaaa]">
                          {preview ? `${preview.brand} ${preview.model}` : "Sem mota como dono"}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-primary">
                        #{c.id.slice(0, 6)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-8 lg:col-span-8">
            {selected ? (
              <>
                <div className="relative overflow-hidden bg-[#1a1a1a] p-6 sm:p-8">
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-[#484847]/30 bg-[#262626] font-heading text-2xl font-black text-primary">
                          {initials(selected.full_name)}
                        </div>
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-white">
                              {selected.full_name ?? "Sem nome"}
                            </h2>
                            <Badge className="border border-[#0b6b1d]/35 bg-[#0b6b1d]/15 font-heading text-[10px] font-bold uppercase tracking-widest text-[#90e98b]">
                              Frota verificada
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-[#adaaaa]">
                            Conta de cliente na garagem digital.
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/admin/motas?cliente=${selected.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "border-[#484847]/25 font-heading text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary",
                        )}
                      >
                        Adicionar mota
                      </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { k: "Telemóvel", v: selected.phone ?? "—" },
                        { k: "ID de perfil", v: `${selected.id.slice(0, 8)}…` },
                        {
                          k: "Motas como dono",
                          v: `${owned.length}`,
                        },
                      ].map((row) => (
                        <div
                          key={row.k}
                          className="rounded-lg border border-[#484847]/10 bg-[#131313] p-4"
                        >
                          <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-[#adaaaa]">
                            {row.k}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">{row.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden bg-[#1a1a1a]">
                  <div className="flex flex-col gap-3 border-b border-[#484847]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-white">
                      Frota associada
                    </h3>
                    <Link
                      href={`/admin/motas?cliente=${selected.id}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "font-heading text-[10px] font-bold uppercase tracking-widest",
                      )}
                    >
                      <PlusCircle className="size-4" />
                      Nova mota
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#484847]/10 hover:bg-transparent">
                          <TableHead className="font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-[#adaaaa]">
                            Modelo
                          </TableHead>
                          <TableHead className="font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-[#adaaaa]">
                            Matrícula
                          </TableHead>
                          <TableHead className="font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-[#adaaaa]">
                            VIN
                          </TableHead>
                          <TableHead className="font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-[#adaaaa]">
                            Ano
                          </TableHead>
                          <TableHead className="font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-[#adaaaa]">
                            Estado
                          </TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {owned.length === 0 ? (
                          <TableRow className="border-[#484847]/5 hover:bg-transparent">
                            <TableCell colSpan={6} className="text-[#adaaaa]">
                              Sem motas como dono atual. Usa &quot;Nova mota&quot; para associar.
                            </TableCell>
                          </TableRow>
                        ) : (
                          owned.map((m) => {
                            const st = statusLabel(m.id);
                            return (
                              <TableRow
                                key={m.id}
                                className="border-[#484847]/5 hover:bg-[#262626]/40"
                              >
                                <TableCell>
                                  <Link
                                    href={`/admin/motas/${m.id}`}
                                    className="flex items-center gap-3 group"
                                  >
                                    <div className="flex size-8 items-center justify-center rounded bg-[#262626] text-primary">
                                      <Bike className="size-4" aria-hidden />
                                    </div>
                                    <div>
                                      <p className="font-heading text-sm font-bold uppercase tracking-tight text-white group-hover:text-primary">
                                        {m.brand} {m.model}
                                      </p>
                                      <p className="text-[9px] font-medium uppercase tracking-wide text-[#adaaaa]">
                                        {m.notes ? `${m.notes.slice(0, 48)}…` : "—"}
                                      </p>
                                    </div>
                                  </Link>
                                </TableCell>
                                <TableCell className="font-mono text-xs uppercase text-white">
                                  {m.plate ?? "—"}
                                </TableCell>
                                <TableCell className="max-w-[140px] truncate font-mono text-xs text-[#adaaaa]">
                                  {m.vin ?? "—"}
                                </TableCell>
                                <TableCell className="text-xs font-bold text-white">
                                  {m.year ?? "—"}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-widest",
                                      st.className,
                                    )}
                                  >
                                    <span className="size-1 rounded-full bg-current opacity-80" />
                                    {st.label}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Link
                                    href={`/admin/motas/${m.id}`}
                                    className="inline-flex text-[#adaaaa] hover:text-white"
                                    aria-label="Abrir mota"
                                  >
                                    <MoreVertical className="size-5" />
                                  </Link>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className={cn(adminSurfaceLow, "p-6")}>
                    <p className="font-heading text-xs font-bold uppercase tracking-widest text-white">
                      Resumo
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#adaaaa]">
                      A ficha completa da mota, transferências e boletins vive em{" "}
                      <Link href="/admin/motas" className="text-primary hover:underline">
                        Frota
                      </Link>{" "}
                      e{" "}
                      <Link href="/admin/boletins" className="text-primary hover:underline">
                        Registos
                      </Link>
                      .
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-[#484847]/10 bg-[#1a1a1a] p-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity hover:opacity-100" />
                    <div className="relative z-10">
                      <div className="mb-6 flex items-center justify-between">
                        <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#adaaaa]">
                          Fiabilidade estimada
                        </h4>
                        <span className="font-heading text-2xl font-black text-primary">
                          {owned.length === 0 ? "—" : `${Math.min(99, 82 + (owned.length % 12))}%`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#262626]">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: owned.length === 0 ? "0%" : `${Math.min(99, 82 + (owned.length % 12))}%`,
                          }}
                        />
                      </div>
                      <p className="mt-4 text-[10px] font-medium uppercase leading-relaxed tracking-wider text-[#adaaaa]">
                        Indicador ilustrativo; cruza com inspeções reais nos boletins de manutenção.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
