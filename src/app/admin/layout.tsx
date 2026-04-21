import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/app/garagem/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login?next=/admin");
  }
  if (profile.role !== "admin") {
    redirect("/garagem");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="font-heading text-base font-semibold">
            Painel <span className="text-primary">Admin</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/admin"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/clientes"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Clientes & frota
            </Link>
            <Link
              href="/admin/boletins"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Boletins
            </Link>
            <Link
              href="/admin/documentos"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Documentos
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="border-white/15">
                Sair
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="container mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
