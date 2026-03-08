import { Suspense } from "react";
import { JobListingPage } from "@/features/jobs/job-listing-page";
import { CardSkeleton } from "@/components/ui/loading";

export const metadata = {
  title: "Browse Freelance Jobs — Find Remote Work",
  description:
    "Browse thousands of freelance jobs across web development, design, marketing, writing, and more. Apply to projects that match your skills and start earning on LetsWork.",
  openGraph: {
    title: "Browse Freelance Jobs on LetsWork",
    description: "Find your next freelance project. Thousands of remote jobs posted by verified clients.",
  },
};

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
