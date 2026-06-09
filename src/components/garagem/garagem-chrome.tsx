"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignOutForm } from "@/components/auth/sign-out-form";

export function GaragemChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const onProfile = pathname.startsWith("/garagem/perfil");

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-garagem-shell
    >
      <header className="print:hidden fixed top-0 z-40 flex h-20 w-full items-center justify-between border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
        <Link href="/garagem" className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
          <span className="text-primary">Scuderia</span>{" "}
          <span className="text-foreground">itTECH</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/garagem/perfil"
            aria-current={onProfile ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              onProfile
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <UserCircle2 className="size-5" aria-hidden />
            <span className="hidden sm:inline">Perfil</span>
          </Link>
          <Link
            href="/agendamento"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "font-heading text-xs uppercase tracking-wide",
            )}
          >
            Agendar
          </Link>
          <SignOutForm
            label="Sair"
            pendingLabel="A sair…"
            variant="outline"
            size="sm"
            className="border-border font-heading text-xs uppercase tracking-wide"
          />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-24">{children}</div>
    </div>
  );
}
