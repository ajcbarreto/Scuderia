import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Motorcycle } from "@/types/database";

const CARD_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCSDKQVpb9MjJndC53F3QIcjh1SJKCZ03HKBbbTpRgtMVCeuzV6v4mzwlVOQx85KKQ7j4LjXiNjzCYjr4gxjrXo9M0wpRdkT-JUjBA5UgDkvwne0_DbygXUoygfalM0mS1VOI8SPmUK_pPJ0XZdRu7IN32nXYw5pIWnnn7Jv7Mu0wgQeM5ROEmjRdRfjMLpycugWo1y9pcUPTTFJ4QhHvofPs5oeNpq2_JJA89QIalBClcH86vxImSN7feTLeHSQmcKQvBCInqVRa4";

export default async function GaragemPage() {
  const supabase = await createClient();
  const { data: motas, error } = await supabase
    .from("motorcycles")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (motas ?? []) as Motorcycle[];

  return (
    <div className="space-y-10">
      <header className="mb-2">
        <h1 className="font-heading text-3xl font-extrabold uppercase leading-none tracking-tight text-white">
          Minha garagem
        </h1>
        <p className="mt-2 font-heading text-xs uppercase tracking-[0.2em] text-[#adaaaa]">
          Gestão de frota · Scuderia itTECH
        </p>
      </header>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <div className="absolute inset-0">
          <Image
            src={CARD_IMAGE}
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40" />
        </div>
        <div className="relative px-6 py-10 md:px-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Garagem digital
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight md:text-5xl">
            As tuas motas
          </h2>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Abre cada unidade para ver o boletim de manutenção, o histórico de
            serviços na oficina e o detalhe de cada intervenção.
          </p>
        </div>
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
        <ul className="grid gap-6 sm:grid-cols-2">
          {list.map((m) => (
            <li key={m.id}>
              <Link
                href={`/garagem/motas/${m.id}`}
                className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <article className="relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#131313] transition-all duration-300 hover:border-primary/35 hover:shadow-[0_0_40px_rgba(220,38,38,0.12)]">
                  <div className="absolute inset-0">
                    <Image
                      src={CARD_IMAGE}
                      alt=""
                      fill
                      className="object-cover opacity-20 transition-opacity duration-500 group-hover:opacity-35"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent" />
                  </div>
                  <div className="relative mt-auto flex flex-1 flex-col justify-end p-6 md:p-8">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="border border-white/10 bg-black/40 font-medium backdrop-blur-sm"
                      >
                        {m.year ?? "Ano —"}
                      </Badge>
                      {m.plate ? (
                        <Badge
                          variant="outline"
                          className="border-white/20 bg-black/30 font-mono text-xs backdrop-blur-sm"
                        >
                          {m.plate}
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                      {m.brand} {m.model}
                    </h2>
                    <p className="mt-2 flex items-center gap-1 text-sm font-medium text-primary">
                      Ver boletim de manutenção
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
