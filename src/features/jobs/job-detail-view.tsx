"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  DollarSign, Clock, Users, Calendar, Briefcase, Building2,
  ExternalLink, Edit, Trash2, ArrowLeft, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import type { Job, ClientProfile, Skill, User } from "@prisma/client";
import type { Session } from "next-auth";

type JobWithRelations = Job & {
  clientProfile: ClientProfile & {
    user: Pick<User, "id" | "email" | "avatar" | "createdAt">;
  };
  skills: Skill[];
  _count: { applications: number };
};

interface JobDetailViewProps {
  job: JobWithRelations;
  session: Session | null;
  hasApplied: boolean;
  applicationId: string | null;
  isOwner: boolean;
}

const statusVariant: Record<string, "default" | "success" | "secondary" | "warning" | "destructive"> = {
  OPEN: "success",
  DRAFT: "secondary",
  CLOSED: "destructive",
  FILLED: "warning",
};

export function JobDetailView({ job, session, hasApplied, applicationId, isOwner }: JobDetailViewProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const role = session?.user?.role;

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Job deleted");
      router.push("/dashboard/my-jobs");
    } catch {
      toast.error("Failed to delete job");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <ScrollReveal direction="left"><Card>
            <CardContent className="pt-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant={statusVariant[job.status] || "secondary"}>
                      {job.status}
                    </Badge>
                    <Badge variant="outline">{job.category}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Posted {formatRelativeTime(job.createdAt)}
                  </p>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <Link href={`/dashboard/my-jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      loading={deleting}
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Budget and timeline */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                {(job.budgetMin || job.budgetMax) && (
                  <div className="flex items-center gap-1.5 font-medium text-gray-700">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {job.budgetMin && job.budgetMax
                      ? `${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
                      : job.budgetMin
                      ? `From ${formatCurrency(job.budgetMin)}`
                      : `Up to ${formatCurrency(job.budgetMax!)}`}
                  </div>
                )}
                {job.timeline && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="h-4 w-4 text-brand-600" />
                    {job.timeline}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="h-4 w-4 text-blue-500" />
                  {job._count.applications} proposal{job._count.applications !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(job.createdAt)}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">Job Description</h2>
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {/* Skills */}
              {job.skills.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill.id} variant="default">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card></ScrollReveal>
        </div>

        {/* Sidebar - shows first on mobile so Apply/Sign In CTA is prominent */}
        <ScrollReveal direction="right"><div className="space-y-5 order-1 lg:order-2">
          {/* Apply button */}
          {role === "FREELANCER" && job.status === "OPEN" && (
            <Card>
              <CardContent className="pt-6">
                {hasApplied ? (
                  <div className="text-center">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    <p className="font-medium text-gray-900 mb-1">Application Submitted</p>
                    <p className="text-sm text-gray-500 mb-4">
                      You&apos;ve already applied to this job
                    </p>
                    {applicationId && (
                      <Link href={`/dashboard/applications/${applicationId}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Application
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Interested in this project? Submit a proposal now.
                    </p>
                    <Link href={`/jobs/${job.id}/apply`}>
                      <Button className="w-full" size="lg">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!session && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Sign in to apply for this job
                </p>
                <Link href={`/login?callbackUrl=/jobs/${job.id}`}>
                  <Button className="w-full">Sign In to Apply</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <Card>
              <CardContent className="pt-6">
                <Link href={`/dashboard/my-jobs/${job.id}`}>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4" />
                    View Applications ({job._count.applications})
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={job.clientProfile.user.avatar}
                  alt={job.clientProfile.companyName || job.clientProfile.user.email}
                  email={job.clientProfile.user.email}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {job.clientProfile.companyName || job.clientProfile.user.email.split("@")[0]}
                  </p>
                  {job.clientProfile.industry && (
                    <p className="text-xs text-gray-500">{job.clientProfile.industry}</p>
                  )}
                </div>
              </div>

              {job.clientProfile.companyDescription && (
                <p className="text-sm text-gray-600">{job.clientProfile.companyDescription}</p>
              )}

              {job.clientProfile.website && (
                <a
                  href={job.clientProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-brand-800 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {job.clientProfile.website.replace(/^https?:\/\//, "")}
                </a>
              )}

              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Building2 className="h-3.5 w-3.5" />
                Member since {formatDate(job.clientProfile.user.createdAt)}
              </div>
            </CardContent>
          </Card>
        </div></ScrollReveal>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Job"
        description="Are you sure you want to delete this job? This will remove all applications and cannot be undone."
        confirmLabel="Delete Job"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
