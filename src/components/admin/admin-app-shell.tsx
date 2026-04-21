"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bike,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
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
import { signOut } from "@/app/garagem/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/clientes", label: "Clientes", icon: Users, exact: true },
  { href: "/admin/motas", label: "Motas", icon: Bike, exact: false },
  { href: "/admin/servico", label: "Oficina", icon: Wrench, exact: true },
  { href: "/admin/boletins", label: "Boletins", icon: ClipboardList, exact: false },
  { href: "/admin/documentos", label: "Documentos", icon: FolderOpen, exact: false },
] as const;

function navActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
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

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-18%,oklch(0.28_0.06_25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.12_0_0),oklch(0.145_0_0)_35%,oklch(0.145_0_0))]" />
      </div>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/[0.06] lg:bg-[#101010]/90 lg:backdrop-blur-xl">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.06] px-5">
          <Link href="/admin" className="font-heading text-lg font-semibold tracking-tight">
            Scuderia
            <span className="text-primary"> Admin</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
          <NavLinks pathname={pathname} />
          <div className="mt-auto space-y-3 pt-4">
            <Separator className="bg-white/[0.06]" />
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
              )}
            >
              <ExternalLink className="size-4" />
              Ver site
            </Link>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Sessão</p>
              <p className="truncate text-sm font-medium text-foreground">{userLabel}</p>
            </div>
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full border-white/15"
              >
                Terminar sessão
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-white/[0.06] bg-background/90 px-4 backdrop-blur-xl lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon-sm" className="border-white/15" type="button" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,20rem)] border-white/10 bg-[#101010] p-0">
            <SheetHeader className="border-b border-white/[0.06] px-4 py-4 text-left">
              <SheetTitle className="font-heading text-lg">
                Scuderia <span className="text-primary">Admin</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-4">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <Separator className="bg-white/[0.06]" />
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "justify-start gap-2",
                )}
              >
                <ExternalLink className="size-4" />
                Ver site
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm" className="w-full border-white/15">
                  Terminar sessão
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="font-heading text-base font-semibold">
          Admin
        </Link>
        <div className="w-9" aria-hidden />
      </div>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
