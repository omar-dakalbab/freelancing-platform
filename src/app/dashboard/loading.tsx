import { CardSkeleton } from "@/components/ui/loading";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse">
        <div className="h-7 w-48 rounded bg-gray-200 mb-2" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-8 w-12 rounded bg-gray-200 mb-2" />
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
