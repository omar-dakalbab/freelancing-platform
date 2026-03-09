"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, Briefcase, DollarSign, ArrowUpRight, Users, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { FreelancerBadge } from "@/components/ui/freelancer-badge";
import { formatCurrency } from "@/lib/utils";
import type { BadgeTier } from "@/lib/freelancer-badges";
import type { FreelancerProfile, Skill, User } from "@prisma/client";

type FreelancerWithRelations = FreelancerProfile & {
  user: Pick<User, "id" | "email" | "avatar">;
  skills: Skill[];
  _count: { contracts: number };
  rating: { avg: number; count: number };
  badgeTier: BadgeTier;
};

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<FreelancerWithRelations[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [page, setPage] = useState(1);

  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (skill) params.set("skill", skill);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/freelancers?${params.toString()}`);
      const data = await res.json();

      setFreelancers(data.data || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [search, skill, page]);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchFreelancers();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <Users className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Find Talent</h1>
          </div>
        </div>
        <p className="text-gray-500 mt-1">
          {loading ? "Loading..." : `${pagination.total} freelancers available`}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 relative">
            <label htmlFor="freelancer-search" className="sr-only">Search freelancers</label>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="freelancer-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, title, or skill..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <div className="relative">
            <label htmlFor="skill-filter" className="sr-only">Filter by skill</label>
            <input
              id="skill-filter"
              type="text"
              value={skill}
              onChange={(e) => { setSkill(e.target.value); setPage(1); }}
              placeholder="Filter by skill..."
              className="h-12 w-full sm:w-48 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 rounded-xl px-6">
            Search
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FreelancerCardSkeleton key={i} />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
            <Search className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No freelancers found</h3>
          <p className="mt-1 text-gray-500">Try different search terms</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((freelancer, index) => (
              <ScrollReveal key={freelancer.id} delay={index * 0.05}>
                <FreelancerCard freelancer={freelancer} />
              </ScrollReveal>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
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

function FreelancerCard({ freelancer }: { freelancer: FreelancerWithRelations }) {
  return (
    <Link
      href={`/freelancers/${freelancer.userId}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
    >
      <div className="relative h-full rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gray-300/80">
        {/* Arrow icon */}
        <div className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all duration-300 group-hover:bg-brand-800 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-start mb-4">
          <div className="relative mb-3">
            <Avatar
              src={freelancer.user.avatar}
              alt={freelancer.title || freelancer.user.email}
              email={freelancer.user.email}
              size="lg"
            />
          </div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-800 transition-colors">
            {freelancer.title || freelancer.user.email.split("@")[0]}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {freelancer.badgeTier && (
              <FreelancerBadge tier={freelancer.badgeTier} size="sm" />
            )}
            {freelancer.rating.count > 0 && (
              <div className="flex items-center gap-1">
                <StarRating value={freelancer.rating.avg} readonly size="sm" />
                <span className="text-xs font-medium text-gray-500">
                  {freelancer.rating.avg.toFixed(1)} ({freelancer.rating.count})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {freelancer.bio && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{freelancer.bio}</p>
        )}

        {/* Skills */}
        {freelancer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {freelancer.skills.slice(0, 4).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/60"
              >
                {s.name}
              </span>
            ))}
            {freelancer.skills.length > 4 && (
              <span className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400 ring-1 ring-gray-200/60">
                +{freelancer.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Divider + meta */}
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          {freelancer.hourlyRate ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(Number(freelancer.hourlyRate))}/hr
            </span>
          ) : (
            <span className="text-xs text-gray-400">Rate not set</span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Briefcase className="h-3.5 w-3.5" />
            {freelancer._count.contracts} contract{freelancer._count.contracts !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

function FreelancerCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6" aria-hidden="true">
      {/* Arrow icon */}
      <div className="flex justify-end mb-1">
        <div className="h-8 w-8 rounded-full bg-gray-100" />
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-start mb-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 mb-3" />
        <div className="h-4 w-36 rounded bg-gray-200 mb-2" />
        <div className="flex items-center gap-2 mt-1">
          <div className="h-5 w-16 rounded-full bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-4/5 rounded bg-gray-100" />
      </div>

      {/* Skills */}
      <div className="flex gap-1.5 mb-5">
        <div className="h-7 w-16 rounded-lg bg-gray-100" />
        <div className="h-7 w-20 rounded-lg bg-gray-100" />
        <div className="h-7 w-14 rounded-lg bg-gray-100" />
        <div className="h-7 w-12 rounded-lg bg-gray-100" />
      </div>

      {/* Divider + meta */}
      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
        <div className="h-8 w-24 rounded-lg bg-gray-100" />
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
    </div>
  );
}
