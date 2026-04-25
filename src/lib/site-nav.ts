/** Navegação do site (marketing) — alvos na home */
export const SITE_NAV = [
  { id: "home" as const, href: "/#top", label: "Home" },
  { id: "sobre" as const, href: "/#empresa", label: "Sobre nós" },
  { id: "servicos" as const, href: "/#servicos", label: "Serviços" },
  { id: "area-cliente" as const, href: "/#area-cliente", label: "Área de Cliente" },
  { id: "contacto" as const, href: "/#contacto", label: "Contacto" },
] as const;

export type SiteNavId = (typeof SITE_NAV)[number]["id"];
