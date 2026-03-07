"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, Briefcase, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/loading";
import { StarRating } from "@/components/ui/star-rating";
import { formatCurrency } from "@/lib/utils";
import type { FreelancerProfile, Skill, User } from "@prisma/client";

type FreelancerWithRelations = FreelancerProfile & {
  user: Pick<User, "id" | "email" | "avatar">;
  skills: Skill[];
  _count: { contracts: number };
  rating: { avg: number; count: number };
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Talent</h1>
        <p className="mt-2 text-gray-500">
          {loading ? "Loading..." : `${pagination.total} freelancers available`}
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <label htmlFor="freelancer-search" className="sr-only">Search freelancers</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="freelancer-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, title, or skill..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 transition-colors"
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
              className="h-11 w-48 px-4 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 transition-colors"
            />
          </div>
          <Button type="submit" size="lg">
            Search
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : freelancers.length === 0 ? (
        <div className="py-20 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No freelancers found</h3>
          <p className="mt-1 text-gray-500">Try different search terms</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
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
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
    >
      <Card className="h-full hover:shadow-md hover:border-brand-300 transition-all duration-200 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={freelancer.user.avatar}
              alt={freelancer.title || freelancer.user.email}
              email={freelancer.user.email}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {freelancer.title || freelancer.user.email.split("@")[0]}
              </h3>
              {freelancer.rating.count > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarRating value={freelancer.rating.avg} readOnly size="sm" />
                  <span className="text-xs text-gray-500">
                    ({freelancer.rating.count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {freelancer.bio && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{freelancer.bio}</p>
          )}

          {freelancer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {freelancer.skills.slice(0, 5).map((s) => (
                <Badge key={s.id} variant="secondary" className="text-xs">
                  {s.name}
                </Badge>
              ))}
              {freelancer.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{freelancer.skills.length - 5}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {freelancer.hourlyRate && (
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                {formatCurrency(Number(freelancer.hourlyRate))}/hr
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {freelancer._count.contracts} contract{freelancer._count.contracts !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
