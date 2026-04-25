import Link from "next/link";
import { Globe, Share2 } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      id="contacto"
      className="w-full border-t border-border/80 bg-background"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-10 md:flex-row md:px-12">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="font-heading text-lg font-semibold text-foreground">
            SCUDERIA ITTECH
          </div>
          <div className="font-sans text-xs tracking-widest text-muted-foreground uppercase">
            © {year} SCUDERIA ITTECH. ENGENHARIA DE PRECISÃO.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            href="/admin"
            className="font-sans text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            Documentação técnica
          </Link>
          <Link
            href="/#servicos"
            className="font-sans text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            Protocolos de serviço
          </Link>
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
