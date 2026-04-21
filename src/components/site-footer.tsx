import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-neutral-950 py-12 px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-12 md:flex-row">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="font-heading text-lg font-black text-white">
              SCUDERIA itTECH
            </div>
            <p className="font-sans text-xs text-neutral-500">
              © {year} Scuderia itTECH. Engenharia. Precisão. Confiança.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_URL ??
                "https://wa.me/?text=Ol%C3%A1%20Scuderia%20itTECH"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs uppercase tracking-widest text-neutral-500 opacity-80 transition-colors hover:text-red-500 hover:opacity-100"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs uppercase tracking-widest text-neutral-500 opacity-80 transition-colors hover:text-red-500 hover:opacity-100"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs uppercase tracking-widest text-neutral-500 opacity-80 transition-colors hover:text-red-500 hover:opacity-100"
            >
              LinkedIn
            </a>
          </div>
          <div className="flex gap-4">
            <div className="cursor-pointer rounded-full bg-white/5 p-2 transition-all hover:bg-white/10">
              <MapPin className="size-4 text-neutral-300" aria-hidden />
            </div>
            <Link
              href="mailto:info@scuderia.pt"
              className="rounded-full bg-white/5 p-2 transition-all hover:bg-white/10"
            >
              <Mail className="size-4 text-neutral-300" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
