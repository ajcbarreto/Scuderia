import Link from "next/link";
import { Globe, Share2 } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      id="contacto"
      className="w-full border-t border-[#484847]/20 bg-[#0e0e0e]"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-10 md:flex-row md:px-12">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="font-heading text-lg font-bold text-white">
            SCUDERIA ITTECH
          </div>
          <div className="font-sans text-xs tracking-widest text-[#adaaaa] uppercase">
            © {year} SCUDERIA ITTECH. ENGENHARIA DE PRECISÃO.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            href="/admin"
            className="font-sans text-xs tracking-widest text-[#adaaaa] uppercase transition-colors hover:text-[#e80f16]"
          >
            Documentação técnica
          </Link>
          <Link
            href="/#servicos"
            className="font-sans text-xs tracking-widest text-[#adaaaa] uppercase transition-colors hover:text-[#e80f16]"
          >
            Protocolos de serviço
          </Link>
          <span className="cursor-default font-sans text-xs tracking-widest text-[#adaaaa] uppercase">
            Privacidade
          </span>
          <span className="cursor-default font-sans text-xs tracking-widest text-[#adaaaa] uppercase">
            Termos de utilização
          </span>
        </div>
        <div className="flex gap-4 text-[#adaaaa]">
          <Globe
            className="size-5 cursor-pointer transition-colors hover:text-white"
            aria-hidden
          />
          <Share2
            className="size-5 cursor-pointer transition-colors hover:text-white"
            aria-hidden
          />
        </div>
      </div>
    </footer>
  );
}
