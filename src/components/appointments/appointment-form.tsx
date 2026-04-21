"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AppointmentForm() {
  const router = useRouter();
  const [preferred, setPreferred] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão inválida.");
        return;
      }
      const preferredStart = preferred
        ? new Date(preferred).toISOString()
        : null;
      const { error: ins } = await supabase.from("appointment_requests").insert({
        client_id: user.id,
        preferred_start: preferredStart,
        message: message || null,
      });
      if (ins) {
        setError(ins.message);
        return;
      }
      setOk(true);
      router.refresh();
    } catch {
      setError("Não foi possível enviar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
        Pedido registado. A oficina entrará em contacto para confirmar a data.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="when">Preferência de data / hora</Label>
        <Input
          id="when"
          type="datetime-local"
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
          className="border-white/10 bg-[#262626]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="msg">Notas</Label>
        <Textarea
          id="msg"
          rows={4}
          placeholder="Ex.: revisão dos 20.000 km, ruído na travagem…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-white/10 bg-[#262626]"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="font-heading" disabled={loading}>
        {loading ? "A enviar…" : "Enviar pedido"}
      </Button>
    </form>
  );
}
