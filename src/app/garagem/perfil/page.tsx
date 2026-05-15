import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile, getSessionUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata = {
  title: "O meu perfil",
};

export default async function PerfilPage() {
  const [user, profile] = await Promise.all([getSessionUser(), getProfile()]);
  if (!user) {
    redirect("/login?next=/garagem/perfil");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-3 border-b border-border/60 pb-6">
        <Link
          href="/garagem"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Garagem
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          O meu perfil
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mantém os teus dados atualizados — a oficina usa-os para te contactar.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Dados de contacto
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Conta:{" "}
          <span className="font-medium text-foreground">{user.email}</span>
        </p>
        <div className="mt-6">
          <ProfileForm
            initialFullName={profile?.full_name ?? ""}
            initialPhone={profile?.phone ?? ""}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Palavra-passe
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define uma nova palavra-passe para o início de sessão.
        </p>
        <div className="mt-6">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
