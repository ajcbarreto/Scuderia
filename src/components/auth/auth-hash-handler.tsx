"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Convites Supabase que caem na homepage (redirect_to = site root) devolvem
 * tokens no hash (#access_token=…), invisível ao middleware/servidor.
 * Troca por sessão e envia para definir palavra-passe ou garagem.
 */
export function AuthHashHandler() {
  const router = useRouter();
  const handling = useRef(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length <= 1 || handling.current) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));

    const hashError = params.get("error");
    if (hashError) {
      handling.current = true;
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      const code = params.get("error_code");
      router.replace(
        code === "otp_expired" ? "/login?error=expired" : "/login?error=auth",
      );
      return;
    }

    if (!hash.includes("access_token=")) return;
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return;

    handling.current = true;
    const type = params.get("type");

    void (async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        handling.current = false;
        router.replace("/login?error=auth");
        return;
      }

      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );

      const dest =
        type === "magiclink"
          ? "/garagem"
          : type === "invite" ||
              type === "recovery" ||
              type === "signup"
            ? "/onboarding/set-password"
            : "/onboarding/set-password";

      router.replace(dest);
      router.refresh();
    })();
  }, [router]);

  return null;
}
