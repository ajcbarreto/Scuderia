"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { recordPageView } from "@/lib/analytics/actions";

const CONSENT_KEY = "sc_consent"; // "granted" | "denied"
const ANON_KEY = "sc_anon";

type Consent = "unknown" | "granted" | "denied";

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    // localStorage indisponível — trata como ainda sem decisão.
  }
  return "unknown";
}

/**
 * Banner de consentimento (opt-in) + recolha de visitas anónimas.
 * A recolha de `page_view` SÓ acontece depois de o visitante aceitar.
 * A decisão fica guardada em localStorage (guardar a própria escolha é
 * estritamente necessário, logo isento de consentimento). Para retirar o
 * consentimento mais tarde existe o atalho "Gerir cookies" no rodapé.
 */
export function AnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>("unknown");
  const [ready, setReady] = useState(false);
  const lastPath = useRef<string | null>(null);

  // Lê a decisão guardada (só no cliente, para evitar mismatch de hidratação).
  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  // Regista a visita — apenas com consentimento concedido.
  useEffect(() => {
    if (consent !== "granted") return;
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
      // sessionStorage indisponível — segue sem id de sessão.
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
  }, [consent, pathname]);

  const decide = useCallback((value: "granted" | "denied") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // sem persistência possível — aplica só nesta sessão.
    }
    setConsent(value);
  }, []);

  // Sem banner até saber o estado, e nunca depois de uma decisão.
  if (!ready || consent !== "unknown") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
          Recolhemos dados de utilização <strong>anónimos</strong> para perceber
          como o site é usado e melhorá-lo. Não usamos cookies de publicidade nem
          partilhamos dados com terceiros.{" "}
          <Link
            href="/privacidade"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Saber mais
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => decide("denied")}>
            Recusar
          </Button>
          <Button size="sm" onClick={() => decide("granted")}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
