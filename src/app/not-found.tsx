import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="size-6" aria-hidden />
        </span>
        <div className="space-y-2">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            Scuderia itTECH · 404
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Página não encontrada
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            O conteúdo que procuras pode ter mudado de sítio ou já não existe.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className={buttonVariants({ className: "font-heading" })}>
            Voltar ao início
          </Link>
          <Link
            href="/garagem"
            className={buttonVariants({ variant: "outline", className: "border-border" })}
          >
            Ir para a garagem
          </Link>
        </div>
      </div>
    </div>
  );
}
