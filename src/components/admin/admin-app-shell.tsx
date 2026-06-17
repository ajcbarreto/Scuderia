"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bike,
  CalendarRange,
  ClipboardList,
  Clock,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  Library,
  ListChecks,
  Menu,
  Users,
  Wrench,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SignOutForm } from "@/components/auth/sign-out-form";
import {
  adminNavLinkActive,
  adminNavLinkBase,
  adminNavLinkIdle,
} from "@/components/admin/admin-styles";

const NAV = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: CalendarRange, exact: false },
  { href: "/admin/oficina", label: "Horários", icon: Clock, exact: false },
  { href: "/admin/clientes", label: "Clientes", icon: Users, exact: false },
  { href: "/admin/motas", label: "Frota", icon: Bike, exact: false },
  { href: "/admin/catalogo-motos", label: "Catálogo motas", icon: Library, exact: false },
  { href: "/admin/boletins", label: "Registos", icon: ClipboardList, exact: false },
  { href: "/admin/checklists", label: "Tarefas padrão", icon: ListChecks, exact: true },
  { href: "/admin/documentos", label: "Documentos", icon: FolderOpen, exact: false },
  { href: "/admin/estatisticas", label: "Estatísticas", icon: BarChart3, exact: true },
] as const;

function navActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function headerCopy(pathname: string): { title: string; badge?: string } {
  if (pathname === "/admin") return { title: "Painel operativo", badge: "Telemetria ao vivo" };
  if (pathname.startsWith("/admin/agendamentos"))
    return { title: "Agendamentos", badge: "Pedidos de marcação" };
  if (pathname.startsWith("/admin/oficina"))
    return { title: "Horários da oficina", badge: "Dias fechados" };
  if (pathname.startsWith("/admin/clientes"))
    return { title: "Scuderia itTECH", badge: "Clientes & frota" };
  if (pathname.startsWith("/admin/motas")) return { title: "Frota", badge: "Motas & transferências" };
  if (pathname.startsWith("/admin/catalogo-motos"))
    return { title: "Catálogo de motas", badge: "Marca · modelo · ano" };
  if (pathname.startsWith("/admin/servico")) return { title: "Oficina", badge: "Entrada em serviço" };
  if (pathname.startsWith("/admin/boletins")) return { title: "Registos de serviço", badge: "Boletins" };
  if (pathname.startsWith("/admin/checklists"))
    return { title: "Lista de tarefas padrão", badge: "Oficina" };
  if (pathname.startsWith("/admin/documentos")) return { title: "Faturas & anexos", badge: "Armazenamento" };
  if (pathname.startsWith("/admin/estatisticas"))
    return { title: "Estatísticas", badge: "Uso da plataforma" };
  return { title: "Backoffice", badge: "Admin" };
}

function initialsFromLabel(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1]![0] : parts[0]?.[1];
  return (a + (b ?? "")).toUpperCase().slice(0, 2);
}

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = navActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              adminNavLinkBase,
              active ? adminNavLinkActive : adminNavLinkIdle,
            )}
          >
            <Icon
              className={cn(
                "size-[22px] shrink-0",
                active ? "text-primary" : "opacity-90",
              )}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

type AdminAppShellProps = {
  children: React.ReactNode;
  userLabel: string;
};

export function AdminAppShell({ children, userLabel }: AdminAppShellProps) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = useMemo(() => initialsFromLabel(userLabel), [userLabel]);
  const { title, badge } = headerCopy(pathname);

  const headerActions = (
    <div className="flex items-center gap-2 sm:gap-4">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-muted font-heading text-[11px] font-bold text-foreground"
        title={userLabel}
        aria-label={`Sessão: ${userLabel}`}
      >
        {initials}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar py-8 shadow-[4px_0_24px_-8px_color-mix(in_oklch,var(--foreground)_6%,transparent)] lg:flex">
        <div className="px-6 pb-10">
          <p className="font-heading text-xl font-black uppercase tracking-[0.2em] text-primary">
            Scuderia BackOffice
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-0">
          <NavLinks pathname={pathname} />
        </div>
        <div className="mt-auto space-y-4 px-4 pt-6">
          <Link
            href="/admin/servico"
            className={cn(
              buttonVariants(),
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md font-heading text-xs font-bold uppercase tracking-widest",
            )}
          >
            <Wrench className="size-4" />
            Serviço rápido
          </Link>
          <div className="space-y-1 border-t border-border/80 pt-4">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full justify-start gap-2 px-2 font-heading text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground",
              )}
            >
              <HelpCircle className="size-4" />
              Site público
            </Link>
            <SignOutForm
              label="Terminar sessão"
              pendingLabel="A sair…"
              showIcon
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-2 font-heading text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground"
            />
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur-md lg:left-64">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="border-border bg-card"
                      type="button"
                    />
                  }
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Abrir menu</span>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[min(100%,20rem)] border-border bg-background p-0"
                >
                  <SheetHeader className="border-b border-border/80 px-5 py-5 text-left">
                    <SheetTitle className="font-heading text-base font-black uppercase tracking-widest text-primary">
                      Scuderia BackOffice
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
                    <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                    <Link
                      href="/admin/servico"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants(),
                        "inline-flex w-full items-center justify-center gap-2 font-heading text-xs font-bold uppercase tracking-widest",
                      )}
                    >
                      <Wrench className="size-4" />
                      Serviço rápido
                    </Link>
                    <Separator className="bg-border" />
                    <Link
                      href="/"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "justify-start gap-2 font-heading text-[10px] uppercase tracking-widest",
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      Site público
                    </Link>
                    <SignOutForm
                      label="Terminar sessão"
                      pendingLabel="A sair…"
                      variant="outline"
                      size="sm"
                      className="w-full border-border"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="min-w-0">
              <span className="truncate font-heading text-base font-bold tracking-tight text-foreground lg:text-lg">
                {title}
              </span>
              {badge ? (
                <p className="truncate font-heading text-[10px] uppercase tracking-widest text-primary lg:hidden">
                  {badge}
                </p>
              ) : null}
            </div>
            {badge ? (
              <span className="hidden shrink-0 rounded bg-muted px-2.5 py-1 font-heading text-[10px] font-semibold uppercase tracking-widest text-primary lg:inline">
                {badge}
              </span>
            ) : null}
          </div>
          {headerActions}
        </div>
      </header>

      <div className="pt-16 lg:pl-64">
        <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
