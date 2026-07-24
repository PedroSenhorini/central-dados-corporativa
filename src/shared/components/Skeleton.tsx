export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border/60 ${className}`} />;
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
      <Skeleton className="h-4 w-40 mb-2" />
      <Skeleton className="h-3 w-28 mb-4" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
