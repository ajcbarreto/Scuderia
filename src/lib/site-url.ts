/** URL pública da app (sem barra final). Usada em convites, emails e metadados. */
export function resolveSiteUrl(): { url: string; fellBack: boolean } {
  const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return { url: stripTrailingSlash(explicit), fellBack: false };

  const prodAlias = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prodAlias) return { url: `https://${stripTrailingSlash(prodAlias)}`, fellBack: false };

  if (process.env.VERCEL_URL) {
    return {
      url: `https://${stripTrailingSlash(process.env.VERCEL_URL)}`,
      fellBack: false,
    };
  }
  return { url: "http://localhost:3000", fellBack: true };
}

/** Destino pós-convite: troca o code em `/auth/callback` e segue para definir password. */
export function inviteRedirectUrl(siteUrl: string): string {
  return `${siteUrl}/auth/callback?next=${encodeURIComponent("/onboarding/set-password")}`;
}
