"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, DollarSign, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";
import { JobCard } from "@/features/jobs/job-card";
import { JOB_CATEGORIES } from "@/lib/validations/job";
import type { Job, ClientProfile, Skill, User } from "@prisma/client";

type JobWithRelations = Job & {
  clientProfile: ClientProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
  skills: Skill[];
  _count: { applications: number };
};

interface PaginatedJobs {
  data: JobWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function JobListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [budgetMin, setBudgetMin] = useState(searchParams.get("budgetMin") || "");
  const [budgetMax, setBudgetMax] = useState(searchParams.get("budgetMax") || "");
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (budgetMin) params.set("budgetMin", budgetMin);
      if (budgetMax) params.set("budgetMax", budgetMax);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data: PaginatedJobs = await res.json();

      setJobs(data.data || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, budgetMin, budgetMax, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setBudgetMin("");
    setBudgetMax("");
    setPage(1);
  }

  const hasActiveFilters = search || category || budgetMin || budgetMax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="mt-2 text-gray-500">
          {loading ? "Loading..." : `${pagination.total} jobs available`}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <label htmlFor="job-search" className="sr-only">Search jobs</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="job-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title or keyword..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 transition-colors"
            />
          </div>
          <Button type="submit" size="lg">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-xs font-medium text-white" aria-label="Active filters">
                {[category, budgetMin || budgetMax ? "budget" : ""].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <Card className="mb-6" id="filter-panel">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
                >
                  <option value="">All Categories</option>
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Min Budget ($)"
                type="number"
                placeholder="0"
                value={budgetMin}
                onChange={(e) => { setBudgetMin(e.target.value); setPage(1); }}
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
              <Input
                label="Max Budget ($)"
                type="number"
                placeholder="10000"
                value={budgetMax}
                onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }}
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {category && (
                  <Badge variant="default" className="cursor-pointer" onClick={() => setCategory("")}>
                    {category} <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {(budgetMin || budgetMax) && (
                  <Badge variant="default" className="cursor-pointer" onClick={() => { setBudgetMin(""); setBudgetMax(""); }}>
                    ${budgetMin || "0"} – ${budgetMax || "any"} <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Jobs grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="mt-1 text-gray-500">Try different search terms or clear filters</p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 font-medium" aria-current="page">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
