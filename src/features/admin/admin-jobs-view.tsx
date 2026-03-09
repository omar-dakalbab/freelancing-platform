"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import { Search, ExternalLink, Trash2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

interface JobRow {
  id: string;
  title: string;
  category: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  createdAt: string;
  clientProfile: {
    user: { id: string; email: string };
    companyName: string | null;
  };
  _count: { applications: number };
}

interface ActionModal {
  job: JobRow;
  action: "REMOVE" | "RESTORE";
}

export function AdminJobsView() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState<ActionModal | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/jobs?${params}`);
      const json = await res.json();
      if (res.ok) {
        setJobs(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  async function handleAction() {
    if (!modal || !reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${modal.job.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modal.action, reason: reason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Action failed");

      toast.success(json.message);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === modal.job.id
            ? { ...j, status: modal.action === "REMOVE" ? "REMOVED" : "OPEN" }
            : j
        )
      );
      setModal(null);
      setReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubmitting(false);
    }
  }

  const statusVariantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    OPEN: "success",
    DRAFT: "secondary",
    CLOSED: "secondary",
    FILLED: "default",
    REMOVED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="DRAFT">Draft</option>
          <option value="CLOSED">Closed</option>
          <option value="FILLED">Filled</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      <div className="text-sm text-gray-500">{total} jobs found</div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-200 p-4">
              <div className="h-4 w-2/3 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">
            No jobs found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                  <Badge variant={statusVariantMap[job.status] ?? "secondary"}>
                    {job.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {job.category} •{" "}
                  {job.budgetMin && job.budgetMax
                    ? `${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
                    : "No budget"}{" "}
                  • {job._count.applications} applications
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  By {job.clientProfile.companyName || job.clientProfile.user.email} •{" "}
                  <TimeAgo date={job.createdAt} />
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/jobs/${job.id}`} target="_blank">
                  <Button variant="ghost" size="icon-sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                {job.status !== "REMOVED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 border-red-300"
                    onClick={() => setModal({ job, action: "REMOVE" })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:bg-green-50 border-green-300"
                    onClick={() => setModal({ job, action: "RESTORE" })}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Action Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-6 z-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {modal.action === "REMOVE" ? "Remove Job" : "Restore Job"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {modal.action === "REMOVE"
                ? `Are you sure you want to remove "${modal.job.title}"? It will no longer be visible to freelancers.`
                : `Restore "${modal.job.title}" and make it visible again?`}
            </p>
            <div className="space-y-4">
              <Textarea
                label="Reason"
                placeholder="Explain why..."
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  loading={submitting}
                  variant={modal.action === "REMOVE" ? "destructive" : "success"}
                  onClick={handleAction}
                >
                  {modal.action === "REMOVE" ? "Remove Job" : "Restore Job"}
                </Button>
                <Button variant="outline" onClick={() => { setModal(null); setReason(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
