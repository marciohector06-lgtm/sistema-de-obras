import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-40" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      <Skeleton className="mb-6 h-64 rounded-lg" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-lg lg:col-span-2" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}
