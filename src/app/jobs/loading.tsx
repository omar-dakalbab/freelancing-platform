import { CardSkeleton } from "@/components/ui/loading";

export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse">
        <div className="h-7 w-32 rounded bg-gray-200 mb-4" />
        <div className="flex gap-3">
          <div className="h-10 flex-1 rounded-lg bg-gray-200" />
          <div className="h-10 w-36 rounded-lg bg-gray-200" />
          <div className="h-10 w-36 rounded-lg bg-gray-200" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
