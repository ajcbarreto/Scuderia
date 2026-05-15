import Link from "next/link";
import { Bike } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function GaragemNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bike className="size-6" aria-hidden />
        </span>
        <div className="space-y-2">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            404
          </p>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
            Mota não encontrada
          </h2>
          <p className="text-sm text-muted-foreground">
            Esta mota pode ter sido transferida ou ainda não está na tua garagem.
          </p>
        </div>
        <Link href="/garagem" className={buttonVariants({ className: "font-heading" })}>
          Voltar à garagem
        </Link>
      </div>
    </div>
  );
}
