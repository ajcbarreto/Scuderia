"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/** Navegação em português (equivalente ao layout Stitch) */
const nav = [
  { href: "/#top", label: "Oficina", id: "oficina" },
  { href: "/#servicos", label: "Performance", id: "performance" },
  { href: "/#pista", label: "Pista", id: "pista" },
  { href: "/#inventory", label: "Inventário", id: "inventory" },
  { href: "/#contacto", label: "Contacto", id: "contacto" },
] as const;

const bookHref =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "/agendamento";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-[60] w-full border-b border-white/5 bg-[#0e0e0e]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-full items-center justify-between px-6 py-4 md:px-8">
        <Link
          href="/"
          className="font-heading text-2xl font-black tracking-tighter text-white"
        >
          SCUDERIA ITTECH
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {nav.map((item) => {
            const active = item.href === "/#top" ? pathname === "/" : false;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "font-heading text-sm font-bold tracking-tight uppercase transition-all",
                  active
                    ? "border-b-2 border-[#e80f16] pb-1 text-[#e80f16]"
                    : "text-[#adaaaa] hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href={bookHref}
            {...(bookHref.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="hidden rounded-md bg-[#e80f16] px-6 py-2 font-heading text-sm font-black tracking-widest text-black transition-all hover:bg-[#ff7668] active:scale-95 sm:inline-flex"
          >
            MARCAR SERVIÇO
          </Link>
          <Link
            href="/login"
            className="text-white transition-colors hover:text-[#ff8e80]"
            aria-label="Conta — entrar"
          >
            <CircleUserRound className="size-7" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
