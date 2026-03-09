"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, DollarSign, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/features/jobs/job-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { JOB_CATEGORIES } from "@/lib/validations/job";
import { track, EVENTS } from "@/lib/analytics";
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
    track(EVENTS.JOB_SEARCHED, { query: search, category, has_budget_filter: !!(budgetMin || budgetMax) });
    fetchJobs();
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setBudgetMin("");
    setBudgetMax("");
    setPage(1);
    track(EVENTS.JOB_FILTERS_CLEARED);
  }

  const hasActiveFilters = search || category || budgetMin || budgetMax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <Briefcase className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Browse Jobs</h1>
          </div>
        </div>
        <p className="text-gray-500 mt-1">
          {loading ? "Loading..." : `${pagination.total} jobs available`}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 relative">
            <label htmlFor="job-search" className="sr-only">Search jobs</label>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="job-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title or keyword..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" size="lg" className="h-12 rounded-xl px-6 flex-1 sm:flex-none">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 rounded-xl gap-2 flex-1 sm:flex-none"
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
        </div>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-8 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm" id="filter-panel">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); track(EVENTS.JOB_FILTERED, { filter_type: "category", value: e.target.value }); }}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
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
              className="h-11"
            />
            <Input
              label="Max Budget ($)"
              type="number"
              placeholder="10000"
              value={budgetMax}
              onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }}
              leftIcon={<DollarSign className="h-4 w-4" />}
              className="h-11"
            />
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-100">
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
        </div>
      )}

      {/* Jobs grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
            <Search className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
          <p className="mt-1 text-gray-500">Try different search terms or clear filters</p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4 rounded-xl" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <ScrollReveal key={job.id} delay={index * 0.05}>
                <JobCard job={job} />
              </ScrollReveal>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
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
                className="rounded-lg"
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

function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6" aria-hidden="true">
      {/* Top row: avatar + arrow */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-100" />
      </div>

      {/* Title */}
      <div className="h-4 w-4/5 rounded bg-gray-200 mb-2" />
      <div className="h-4 w-3/5 rounded bg-gray-200 mb-3" />

      {/* Description */}
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
      </div>

      {/* Skills */}
      <div className="flex gap-1.5 mb-5">
        <div className="h-7 w-16 rounded-lg bg-gray-100" />
        <div className="h-7 w-20 rounded-lg bg-gray-100" />
        <div className="h-7 w-14 rounded-lg bg-gray-100" />
      </div>

      {/* Divider + bottom */}
      <div className="border-t border-gray-100 pt-4">
        <div className="h-8 w-32 rounded-lg bg-gray-100 mb-3" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-16 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-3 w-12 rounded bg-gray-100 ml-auto" />
        </div>
      </div>
    </div>
  );
}
