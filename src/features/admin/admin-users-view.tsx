"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UserActionModal } from "./user-action-modal";
import { formatRelativeTime } from "@/lib/utils";
import { Search, ExternalLink, UserX, UserCheck } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
  suspended: boolean;
  avatar: string | null;
  createdAt: string;
  clientProfile: { companyName: string | null } | null;
  freelancerProfile: { title: string | null } | null;
}

export function AdminUsersView() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionUser, setActionUser] = useState<UserRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (res.ok) {
        setUsers(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  function handleActionSuccess(userId: string, suspended: boolean) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended } : u))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
        >
          <option value="">All roles</option>
          <option value="CLIENT">Clients</option>
          <option value="FREELANCER">Freelancers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="text-sm text-gray-500">{total} users found</div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-200 p-4 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-64 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">
            No users found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <Avatar
                src={user.avatar}
                alt={user.email}
                email={user.email}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.clientProfile?.companyName ||
                      user.freelancerProfile?.title ||
                      user.email.split("@")[0]}
                  </p>
                  <Badge
                    variant={
                      user.role === "CLIENT"
                        ? "default"
                        : user.role === "FREELANCER"
                        ? "secondary"
                        : "warning"
                    }
                  >
                    {user.role}
                  </Badge>
                  {user.suspended && (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Joined {formatRelativeTime(user.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user.role === "FREELANCER" && (
                  <Link href={`/freelancers/${user.id}`} target="_blank">
                    <Button variant="ghost" size="icon-sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
                {user.role !== "ADMIN" && (
                  <Button
                    variant={user.suspended ? "outline" : "outline"}
                    size="sm"
                    onClick={() => setActionUser(user)}
                    className={
                      user.suspended
                        ? "text-green-600 hover:bg-green-50 border-green-300"
                        : "text-red-600 hover:bg-red-50 border-red-300"
                    }
                  >
                    {user.suspended ? (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        Activate
                      </>
                    ) : (
                      <>
                        <UserX className="h-3.5 w-3.5" />
                        Suspend
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {actionUser && (
        <UserActionModal
          userId={actionUser.id}
          userEmail={actionUser.email}
          currentlySuspended={actionUser.suspended}
          onClose={() => setActionUser(null)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
