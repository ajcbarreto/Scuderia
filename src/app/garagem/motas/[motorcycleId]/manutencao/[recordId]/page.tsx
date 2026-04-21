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
import type {
  ServiceAttachment,
  ServiceRecord,
  ServiceTask,
} from "@/types/database";

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

  const [{ data: tasks }, { data: attachmentRows }] = await Promise.all([
    supabase
      .from("service_tasks")
      .select("*")
      .eq("service_record_id", recordId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("service_attachments")
      .select("*")
      .eq("service_record_id", recordId)
      .order("created_at", { ascending: false }),
  ]);

  const tlist = (tasks ?? []) as ServiceTask[];
  const attachments = (attachmentRows ?? []) as ServiceAttachment[];

  const withUrls: { attachment: ServiceAttachment; href: string | null }[] = [];
  for (const a of attachments) {
    const { data: signedData, error } = await supabase.storage
      .from(a.storage_bucket)
      .createSignedUrl(a.storage_path, 3600);
    withUrls.push({
      attachment: a,
      href: error ? null : signedData?.signedUrl ?? null,
    });
  }

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

      {withUrls.length > 0 ? (
        <Card className="border-white/10 bg-[#131313]">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Anexos</CardTitle>
            <CardDescription>
              Ligações temporárias (1 h). Faturas só aparecem se estiverem
              marcadas para o teu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {withUrls.map(({ attachment: a, href }) => {
              const label =
                a.kind === "invoice"
                  ? "Fatura"
                  : a.kind === "photo"
                    ? "Foto"
                    : "Documento";
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Abrir ficheiro
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Indisponível</span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
