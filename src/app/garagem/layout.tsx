import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/app/garagem/actions";

export default async function GaragemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/garagem");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/garagem" className="font-heading text-base font-semibold">
            Minha <span className="text-primary">Garagem</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/agendamento"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Agendar
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="border-white/15">
                Sair
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="container mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
