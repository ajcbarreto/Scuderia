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

/** Mensagens acionáveis para erros comuns do convite Supabase Auth. */
export function formatInviteError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("already registered") ||
    lower.includes("already been registered")
  ) {
    return "Este email já tem conta. No Supabase → Authentication → Users, reenvia o convite ou apaga o utilizador e tenta outra vez.";
  }
  if (
    lower.includes("error sending invite email") ||
    lower.includes("error sending confirmation email")
  ) {
    return (
      "Falha ao enviar o email (SMTP). No Supabase → Authentication → SMTP confirma: " +
      "host mail.scuderiaittech.pt (ou sv05.corporatemail.pt), port 465 (ou 587), username = email completo " +
      "(ex.: oficina@scuderiaittech.pt), sender igual ao username, password correcta. " +
      "Erro técnico em Logs → Auth."
    );
  }
  return message;
}
