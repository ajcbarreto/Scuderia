"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

export function LandingLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/garagem");
      router.refresh();
    } catch {
      setError("Não foi possível iniciar sessão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#131313] p-8">
      <div className="pointer-events-none absolute -top-10 -right-10 opacity-5">
        <Settings className="size-[120px]" strokeWidth={1} />
      </div>
      <h2 className="font-heading text-2xl font-bold uppercase tracking-tight">
        Área Cliente
      </h2>
      <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Acompanhe o estado da sua moto
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        O acesso usa o <span className="text-foreground">email</span> da tua
        conta (Supabase Auth).
      </p>
      <form onSubmit={onSubmit} className="flex flex-1 flex-col space-y-6">
        <div className="group">
          <label
            htmlFor="landing-email"
            className="mb-2 block text-xs font-bold uppercase text-muted-foreground group-focus-within:text-primary"
          >
            Email
          </label>
          <Input
            id="landing-email"
            type="email"
            autoComplete="email"
            required
            placeholder="nome@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-md border-0 bg-[#262626] text-white ring-primary/0 placeholder:text-white/10 focus-visible:ring-1 focus-visible:ring-[#e80f16]"
          />
        </div>
        <div className="group">
          <label
            htmlFor="landing-password"
            className="mb-2 block text-xs font-bold uppercase text-muted-foreground group-focus-within:text-primary"
          >
            Palavra-passe
          </label>
          <Input
            id="landing-password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-md border-0 bg-[#262626] text-white ring-primary/0 placeholder:text-white/10 focus-visible:ring-1 focus-visible:ring-[#e80f16]"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#e80f16] py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-red-900/20 transition-transform hover:bg-[#e80f16]/90 active:scale-95 disabled:opacity-60"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
          <Link
            href="/login"
            className="mt-6 block text-center text-xs text-muted-foreground transition-colors hover:text-white"
          >
            Esqueceu-se da sua senha?
          </Link>
          {error ? (
            <p className="mt-3 text-center text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
