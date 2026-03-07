import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 mb-6">
        <Briefcase className="h-10 w-10 text-brand-800" />
      </div>
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-3">Page not found</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        The page you are looking for does not exist or has been moved. Let's get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button>
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
        <Link href="/jobs">
          <Button variant="outline">
            <Search className="h-4 w-4" />
            Browse Jobs
          </Button>
        </Link>
      </div>
    </div>
  );
}
