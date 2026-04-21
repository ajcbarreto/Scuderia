import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminDocumentosPage() {
  const supabase = await createClient();
  const { data: files } = await supabase
    .from("service_attachments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">
          Faturas e documentos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Metadados dos uploads no bucket privado{" "}
          <code className="text-xs">service-files</code>. A leitura por URL
          assinada segue as regras em{" "}
          <code className="text-xs">service_attachments</code> (não é obrigatório
          o path começar pela pasta do utilizador).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#131313]">
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
                  Sem anexos. Usa o bucket `service-files` e insere linhas em
                  `service_attachments` após upload.
                </TableCell>
              </TableRow>
            ) : (
              files.map((f) => (
                <TableRow key={f.id} className="border-white/5">
                  <TableCell>
                    <Badge variant="secondary">{f.kind}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate font-mono text-xs">
                    {f.storage_path}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
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
    </div>
  );
}
