export default function RootLoading() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-hidden
        />
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          A carregar
        </p>
      </div>
    </div>
  );
}
