import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(232,15,22,0.12),transparent_55%)] px-4 py-12">
      <Link
        href="/"
        className="mb-8 font-heading text-lg font-semibold text-foreground"
      >
        Scuderia <span className="text-primary">itTECH</span>
      </Link>
      <Card className="w-full max-w-md border-white/10 bg-card/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Entrar</CardTitle>
          <CardDescription>
            Acede à tua garagem e ao estado das revisões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">A carregar…</p>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
