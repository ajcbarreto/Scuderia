import Link from "next/link";
import { Filter, FolderOpen, Timer, TrendingUp, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminSurfaceLow } from "@/components/admin/admin-styles";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttachmentKind, ServiceAttachment } from "@/types/database";

type PageProps = {
  searchParams: Promise<{ tipo?: string }>;
};

type AttachmentRow = ServiceAttachment & {
  service_records: {
    id: string;
    title: string | null;
    motorcycles: { brand: string; model: string; plate: string | null } | null;
  } | null;
};

function isKind(v: string | undefined): v is AttachmentKind {
  return v === "invoice" || v === "photo" || v === "other";
}

export default async function AdminDocumentosPage({ searchParams }: PageProps) {
  const { tipo } = await searchParams;
  const filterKind = tipo && isKind(tipo) ? tipo : null;

  const supabase = await createClient();

  let q = supabase
    .from("service_attachments")
    .select(
      `
      *,
      service_records (
        id,
        title,
        motorcycles ( brand, model, plate )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filterKind) {
    q = q.eq("kind", filterKind);
  }

  const { data: rawFiles } = await q;

  const files = (rawFiles ?? []) as AttachmentRow[];

  const [{ count: totalAll }, { count: inv }, { count: ph }] = await Promise.all([
    supabase.from("service_attachments").select("*", { count: "exact", head: true }),
    supabase.from("service_attachments").select("*", { count: "exact", head: true }).eq("kind", "invoice"),
    supabase.from("service_attachments").select("*", { count: "exact", head: true }).eq("kind", "photo"),
  ]);

  const tab = (key: string | null, label: string) => {
    const href =
      !key || key === "all" ? "/admin/documentos" : `/admin/documentos?tipo=${key}`;
    const active =
      (key === null || key === "all") && !filterKind
        ? true
        : key === filterKind;
    return (
      <Link
        href={href}
        className={cn(
          "rounded px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-widest transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-[#adaaaa] hover:text-white",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col gap-6 border-b border-[#484847]/10 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-black tracking-tighter text-white md:text-5xl">
            Faturas <span className="text-primary">&amp; documentos</span>
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#adaaaa]">
            Auditoria dos anexos privados da oficina, com ligação aos boletins de serviço.
          </p>
        </div>
        <div className="flex rounded-lg border border-[#484847]/10 bg-[#131313] p-1">
          {tab("all", "Todos")}
          {tab("invoice", "Faturas")}
          {tab("photo", "Fotos")}
          {tab("other", "Outros")}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#484847]/30 bg-[#131313] p-6 text-center transition-colors hover:border-primary/40 lg:col-span-4">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#262626] transition-colors group-hover:bg-primary">
            <Upload className="size-8 text-primary" aria-hidden />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Upload em contexto</h2>
          <p className="mt-2 max-w-xs text-sm text-[#adaaaa]">
            Os ficheiros são associados a um boletim. Abre um registo e usa a área de anexos.
          </p>
          <Link
            href="/admin/boletins"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-6 border-[#484847]/30 font-heading text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black",
            )}
          >
            Ir para boletins
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:col-span-8">
          <div className="relative overflow-hidden rounded-xl bg-[#1a1a1a] p-6">
            <FolderOpen className="absolute right-4 top-4 size-16 text-white/5" aria-hidden />
            <p className="font-heading text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">
              Total de anexos
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-white">{totalAll ?? 0}</p>
            <p className="mt-3 flex items-center gap-1 text-xs font-bold text-[#90e98b]">
              <TrendingUp className="size-4" />
              Histórico no armazenamento
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-[#1a1a1a] p-6">
            <FolderOpen className="absolute right-4 top-4 size-16 text-white/5" aria-hidden />
            <p className="font-heading text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">
              Faturas
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-white">{inv ?? 0}</p>
            <p className="mt-3 text-xs font-bold text-primary">Tipo invoice</p>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-[#1a1a1a] p-6">
            <Timer className="absolute right-4 top-4 size-16 text-white/5" aria-hidden />
            <p className="font-heading text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">
              Fotos técnicas
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-white">{ph ?? 0}</p>
            <p className="mt-3 text-xs font-bold text-[#adaaaa]">Evidências no boletim</p>
          </div>
        </div>

        <div className="lg:col-span-12">
          <div
            className={cn(
              adminSurfaceLow,
              "overflow-hidden rounded-xl border-[#484847]/10 shadow-2xl shadow-black/40",
            )}
          >
            <div className="flex flex-col gap-3 border-b border-[#484847]/10 bg-[#131313]/80 p-6 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-lg font-bold tracking-tight text-white">
                Registo de documentos
              </h2>
              <div className="flex gap-2">
                <span
                  className="inline-flex items-center justify-center rounded bg-[#262626] p-2 text-[#adaaaa]"
                  title="Filtros"
                >
                  <Filter className="size-5" />
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#1a1a1a] font-heading text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Motociclo / matrícula</th>
                    <th className="px-6 py-4">Boletim</th>
                    <th className="px-6 py-4">Caminho</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#484847]/10">
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-sm text-[#adaaaa]">
                        Sem anexos neste filtro.
                      </td>
                    </tr>
                  ) : (
                    files.map((f) => {
                      const rec = f.service_records;
                      const moto = rec?.motorcycles;
                      const line = moto
                        ? `${moto.brand} ${moto.model}`.toUpperCase()
                        : "—";
                      const plate = moto?.plate ?? "—";
                      const statusPaid =
                        f.kind === "invoice" && f.visible_to_owner_id ? "Partilhado" : "Interno";
                      return (
                        <tr
                          key={f.id}
                          className="transition-colors hover:bg-[#262626]/50"
                        >
                          <td className="px-6 py-4">
                            <Badge
                              variant="secondary"
                              className="border border-[#484847]/25 bg-[#262626] font-heading text-[10px] font-semibold uppercase tracking-wide"
                            >
                              {f.kind}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{line}</span>
                              <span className="mt-0.5 font-heading text-[10px] font-black uppercase tracking-tighter text-[#adaaaa]">
                                {plate}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-[#adaaaa]">
                            {rec?.id?.slice(0, 8) ?? "—"}…
                          </td>
                          <td className="max-w-[200px] truncate px-6 py-4 font-mono text-xs text-[#adaaaa]">
                            {f.storage_path}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {f.created_at?.slice(0, 10) ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {rec?.id ? (
                                <Link
                                  href={`/admin/boletins/${rec.id}`}
                                  className="rounded p-1.5 text-[#adaaaa] transition-colors hover:text-primary"
                                >
                                  Abrir
                                </Link>
                              ) : null}
                              <span className="rounded-full border border-[#484847]/20 px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-widest text-[#90e98b]">
                                {statusPaid}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <p className="rounded-lg border border-[#484847]/15 bg-[#131313] p-5 text-sm leading-relaxed text-[#adaaaa] sm:p-6">
        Armazenamento no bucket{" "}
        <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-white">service-files</code>
        . A coluna{" "}
        <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-white">
          visible_to_owner_id
        </code>{" "}
        controla se o cliente vê o anexo na garagem.
      </p>

      <Link
        href="/admin/boletins"
        className="fixed bottom-8 right-8 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
        aria-label="Novo contexto de upload nos boletins"
      >
        <Upload className="size-7" />
      </Link>
    </div>
  );
}
