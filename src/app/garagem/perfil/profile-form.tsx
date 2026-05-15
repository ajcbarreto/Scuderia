"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { updateOwnProfile, type ProfileActionState } from "./actions";

type Props = {
  initialFullName: string;
  initialPhone: string;
};

export function ProfileForm({ initialFullName, initialPhone }: Props) {
  const [state, action, pending] = useActionState<
    ProfileActionState | undefined,
    FormData
  >(updateOwnProfile, undefined);

  useEffect(() => {
    if (state?.ok) toast.success("Perfil atualizado.");
    else if (state?.error) toast.error(state.error, 6000);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-90">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            autoComplete="name"
            defaultValue={initialFullName}
            className="border-input bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telemóvel</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={initialPhone}
            placeholder="Ex.: 912 345 678"
            className="border-input bg-background"
          />
        </div>
        <Button type="submit" disabled={pending} className="font-heading">
          {pending ? "A guardar…" : "Guardar alterações"}
        </Button>
      </fieldset>
    </form>
  );
}
