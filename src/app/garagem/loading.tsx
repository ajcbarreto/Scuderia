import { Skeleton } from "@/components/ui/skeleton";

export default function GaragemLoading() {
  return (
    <div className="space-y-8 md:space-y-10">
      <header className="space-y-3 border-b border-border/60 pb-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3 w-44" />
      </header>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-[260px] w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}
