"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Users, Clock, DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Job, Skill } from "@prisma/client";

type JobWithRelations = Job & {
  skills: Skill[];
  _count: { applications: number };
};

interface MyJobsViewProps {
  jobs: JobWithRelations[];
}

const statusVariant: Record<string, "default" | "success" | "secondary" | "warning" | "destructive"> = {
  OPEN: "success",
  DRAFT: "secondary",
  CLOSED: "destructive",
  FILLED: "warning",
};

export function MyJobsView({ jobs: initialJobs }: MyJobsViewProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setJobs(jobs.filter((j) => j.id !== id));
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setJobs(jobs.map((j) => (j.id === id ? { ...j, status: json.data.status } : j)));
      toast.success("Job status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="mt-1 text-gray-500">{jobs.length} total job{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/post-job">
          <Button>
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No jobs posted yet</h3>
          <p className="mt-1 text-gray-500">Start by posting your first job to find great freelancers</p>
          <Link href="/dashboard/post-job" className="mt-6 inline-block">
            <Button>Post Your First Job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-brand-800 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <Badge variant={statusVariant[job.status] || "secondary"}>
                        {job.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        {job._count.applications} application{job._count.applications !== 1 ? "s" : ""}
                      </span>
                      {(job.budgetMin || job.budgetMax) && (
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-green-500" />
                          {job.budgetMin && job.budgetMax
                            ? `${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
                            : job.budgetMin
                            ? `From ${formatCurrency(job.budgetMin)}`
                            : `Up to ${formatCurrency(job.budgetMax!)}`}
                        </span>
                      )}
                      {job.timeline && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {job.timeline}
                        </span>
                      )}
                      <span className="text-gray-400">{formatRelativeTime(job.createdAt)}</span>
                    </div>

                    {job.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/my-jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Users className="h-3.5 w-3.5" />
                        Applications
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="icon-sm" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/my-jobs/${job.id}/edit`}>
                      <Button variant="ghost" size="icon-sm" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      loading={deletingId === job.id}
                      onClick={() => setConfirmDeleteId(job.id)}
                      className="text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status actions */}
                {job.status === "DRAFT" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleStatusChange(job.id, "OPEN")}
                    >
                      Publish Job
                    </Button>
                  </div>
                )}
                {job.status === "OPEN" && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStatusChange(job.id, "CLOSED")}
                    >
                      Close Job
                    </Button>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleStatusChange(job.id, "FILLED")}
                    >
                      Mark as Filled
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Delete Job"
        description="This will permanently delete the job and remove all associated applications. This action cannot be undone."
        confirmLabel="Delete Job"
        loading={!!deletingId}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
      />
    </div>
  );
}
