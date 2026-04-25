"use client";

import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/garagem/actions";

export function GaragemChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-garagem-shell
    >
      <header className="print:hidden fixed top-0 z-40 flex h-20 w-full items-center justify-between border-b border-border bg-card/95 px-6 shadow-sm backdrop-blur-md">
        <Link href="/garagem" className="font-heading text-2xl font-bold tracking-tight">
          <span className="text-primary">Scuderia</span>{" "}
          <span className="text-foreground">itTECH</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Notificações"
          >
            <Bell className="size-5" />
          </button>
          <button
            type="button"
            className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            aria-label="Definições"
          >
            <Settings className="size-5" />
          </button>
          <Link
            href="/agendamento"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "font-heading text-xs uppercase tracking-wide",
            )}
          >
            Agendar
          </Link>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-border font-heading text-xs uppercase tracking-wide"
            >
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-24">{children}</div>
    </div>
  );
}
