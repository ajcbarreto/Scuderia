import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface, adminTableWrap } from "@/components/admin/admin-styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function AdminDocumentosPage() {
  const supabase = await createClient();
  const { data: files } = await supabase
    .from("service_attachments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Faturas e documentos"
        description="Lista dos anexos enviados para o armazenamento privado da oficina, com ligação aos boletins."
      />

      <div
        className={cn(
          adminSurface,
          "border-primary/15 bg-[#141414] p-5 sm:p-6",
        )}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Os ficheiros ficam no bucket{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-foreground">
            service-files
          </code>
          . A visibilidade para o cliente segue as regras em{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-foreground">
            service_attachments
          </code>{" "}
          (por exemplo, faturas com{" "}
          <code className="text-xs">visible_to_owner_id</code>).
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Últimos anexos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Até 50 entradas, da mais recente para a mais antiga.
          </p>
        </div>
        <div className={adminTableWrap}>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Tipo</TableHead>
                <TableHead>Caminho</TableHead>
                <TableHead>Visível ao dono</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!files?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Sem anexos. Os uploads feitos nos boletins aparecem aqui.
                  </TableCell>
                </TableRow>
              ) : (
                files.map((f) => (
                  <TableRow key={f.id} className="border-white/5">
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {f.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[min(100%,280px)] truncate font-mono text-xs">
                      {f.storage_path}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {f.visible_to_owner_id?.slice(0, 8) ?? "—"}…
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {f.created_at?.slice(0, 10)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
