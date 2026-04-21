"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

const href =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ??
  "https://wa.me/?text=Ol%C3%A1%20Scuderia%20itTECH";

export function FloatingWhatsApp() {
  return (
    <div className="floating-whatsapp fixed right-8 bottom-8 z-[100]">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-full bg-[#0b6b1d] px-6 py-4 font-heading text-sm font-bold text-[#004b0f] shadow-[0_20px_50px_rgba(11,107,29,0.3)] transition-all hover:bg-[#90e98b] active:scale-95"
      >
        <MessageCircle className="size-7 shrink-0" strokeWidth={2} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 group-hover:max-w-xs">
          MARCAR AGORA
        </span>
      </Link>
    </div>
  );
}
