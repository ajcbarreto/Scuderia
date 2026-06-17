"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordPageView } from "@/lib/analytics/actions";

const ANON_KEY = "sc_anon";

/**
 * Regista visitas a páginas públicas. Cookieless e sem PII:
 * - identifica a *sessão* (não a pessoa) com um id aleatório em sessionStorage,
 *   que desaparece ao fechar o separador e não persiste entre visitas;
 * - do referrer guarda só o hostname (nunca o URL completo).
 * Renderiza nada; best-effort (erros ignorados).
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;

    let anon = "";
    try {
      anon = sessionStorage.getItem(ANON_KEY) ?? "";
      if (!anon) {
        anon = crypto.randomUUID();
        sessionStorage.setItem(ANON_KEY, anon);
      }
    } catch {
      // sessionStorage indisponível (modo privado restrito) — segue sem id.
    }

    let ref = "";
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        if (u.hostname && u.hostname !== window.location.hostname) {
          ref = u.hostname;
        }
      }
    } catch {
      // referrer ausente ou inválido — ignora.
    }

    void recordPageView(pathname, anon, ref);
  }, [pathname]);

  return null;
}
