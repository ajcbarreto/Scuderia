import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-3 w-72" />
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </section>
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </section>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
