import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AgendamentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/agendamento");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 max-w-lg items-center px-4">
          <Link href="/garagem" className="text-sm text-muted-foreground hover:text-foreground">
            ← Garagem
          </Link>
        </div>
      </header>
      <div className="container mx-auto max-w-lg px-4 py-10">{children}</div>
    </div>
  );
}
