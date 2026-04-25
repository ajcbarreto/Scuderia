"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/brand-logo";
import { SITE_NAV } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

const bookHref =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "/agendamento";

function isNavActive(
  itemHref: string,
  pathname: string,
  currentHash: string,
) {
  if (pathname !== "/") return false;
  if (itemHref === "/#top") {
    return currentHash === "" || currentHash === "#top";
  }
  if (!itemHref.startsWith("/#")) return false;
  return currentHash === itemHref.slice(1);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const syncHash = useCallback(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  return (
    <nav className="fixed top-0 z-[60] w-full border-b border-border bg-background/90 shadow-sm backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-full items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="border-border bg-background/80"
                    type="button"
                    aria-label="Menu"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[min(100%,20rem)] border-border bg-background p-0"
              >
                <SheetHeader className="border-b border-border/80 px-4 py-4 text-left">
                  <SheetTitle className="sr-only">Menu Scuderia itTech</SheetTitle>
                  <BrandLogo size="sm" className="pl-0.5" />
                </SheetHeader>
                <div className="flex flex-col gap-1 p-2">
                  {SITE_NAV.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "font-heading rounded-md px-3 py-2.5 text-sm font-bold tracking-tight uppercase transition-colors",
                        isNavActive(item.href, pathname, hash)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Link
            href="/#top"
            className="flex min-w-0 max-w-full shrink-0 items-center"
            aria-label="Início — Scuderia itTech"
          >
            <BrandLogo size="md" priority />
          </Link>
        </div>
        <div className="hidden min-w-0 items-center justify-center gap-2 md:flex md:gap-2 lg:gap-5">
          {SITE_NAV.map((item) => {
            const active = isNavActive(item.href, pathname, hash);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "shrink-0 font-heading text-[0.7rem] font-bold tracking-tight uppercase transition-all lg:text-xs",
                  active
                    ? "border-b-2 border-primary pb-1 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">
          <Link
            href={bookHref}
            {...(bookHref.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="hidden rounded-md bg-primary px-4 py-2 font-heading text-xs font-black tracking-widest text-primary-foreground transition-all hover:bg-primary/88 active:scale-95 sm:inline-flex lg:px-6"
          >
            MARCAR SERVIÇO
          </Link>
          <Link
            href="/login"
            className="text-foreground transition-colors hover:text-accent-warm"
            aria-label="Conta — entrar"
          >
            <CircleUserRound className="size-7" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
