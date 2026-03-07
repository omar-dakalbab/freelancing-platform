export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-7 w-48 rounded bg-gray-200 mb-2" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-6 w-16 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
