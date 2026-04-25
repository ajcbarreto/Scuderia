import Link from "next/link";
import { Globe, Share2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="w-full border-t border-border/80 bg-background"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-10 md:flex-row md:px-12">
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <Link
            href="/#top"
            className="inline-block"
            aria-label="Início — Scuderia itTech"
          >
            <BrandLogo size="sm" className="h-5 max-w-[200px] sm:h-6" />
          </Link>
          <div className="font-sans text-xs tracking-widest text-muted-foreground uppercase">
            © {year} Scuderia itTech. Engenharia de precisão.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <span className="cursor-default font-sans text-xs tracking-widest text-muted-foreground uppercase">
            Privacidade
          </span>
          <span className="cursor-default font-sans text-xs tracking-widest text-muted-foreground uppercase">
            Termos de utilização
          </span>
        </div>
        <div className="flex gap-4 text-muted-foreground">
          <Globe
            className="size-5 cursor-pointer transition-colors hover:text-foreground"
            aria-hidden
          />
          <Share2
            className="size-5 cursor-pointer transition-colors hover:text-foreground"
            aria-hidden
          />
        </div>
      </div>
    </footer>
  );
}
