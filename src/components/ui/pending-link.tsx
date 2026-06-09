"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PendingLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  pendingText?: string;
};

export function PendingLink({
  href,
  children,
  className,
  pendingText,
  onClick,
  ...props
}: PendingLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Link
      href={href}
      aria-busy={pending}
      className={cn(className, pending && "pointer-events-none opacity-80")}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || pending) return;
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        ) {
          return;
        }
        e.preventDefault();
        startTransition(() => {
          router.push(href);
        });
      }}
      {...props}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          {pendingText !== undefined ? pendingText : children}
        </span>
      ) : (
        children
      )}
    </Link>
  );
}
