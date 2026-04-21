"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Início" },
  { href: "/#empresa", label: "Empresa" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#area-cliente", label: "Área Cliente" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-neutral-950/80 shadow-2xl shadow-red-900/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tighter text-white"
        >
          SCUDERIA <span className="text-[#e80f16]">itTECH</span>
        </Link>
        <div className="hidden items-center space-x-8 font-heading text-sm uppercase tracking-widest md:flex">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === "/" && item.href.startsWith("/#");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "pb-1 transition-colors",
                  active
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-neutral-400 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <a
            href={
              process.env.NEXT_PUBLIC_WHATSAPP_URL ??
              "https://wa.me/?text=Ol%C3%A1%20Scuderia%20itTECH"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-all hover:scale-95 hover:text-white active:scale-90"
            aria-label="WhatsApp"
          >
            <MessageCircle className="size-6" strokeWidth={1.5} />
          </a>
          <button
            type="button"
            className="text-muted-foreground transition-all hover:scale-95 hover:text-white active:scale-90"
            aria-label="Partilhar"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({
                  title: "Scuderia itTECH",
                  url: typeof window !== "undefined" ? window.location.href : "",
                });
              }
            }}
          >
            <Share2 className="size-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </nav>
  );
}
