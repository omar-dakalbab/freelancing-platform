import { Suspense } from "react";
import { JobListingPage } from "@/features/jobs/job-listing-page";
import { CardSkeleton } from "@/components/ui/loading";

export const metadata = { title: "Browse Jobs" };

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <JobListingPage />
    </Suspense>
  );
}
