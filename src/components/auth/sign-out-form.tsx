"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/app/garagem/actions";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type SignOutFormProps = {
  label?: string;
  pendingLabel?: string;
  showIcon?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
};

function SignOutSubmit({
  label = "Sair",
  pendingLabel = "A sair…",
  showIcon = false,
  variant = "outline",
  size = "sm",
  className,
}: SignOutFormProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        <>
          {showIcon ? <LogOut className="size-4" aria-hidden /> : null}
          {label}
        </>
      )}
    </Button>
  );
}

export function SignOutForm(props: SignOutFormProps) {
  return (
    <form action={signOut}>
      <SignOutSubmit {...props} />
    </form>
  );
}
