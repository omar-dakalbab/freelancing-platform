import Link from "next/link";
import { Plus, Briefcase, Users, TrendingUp, ArrowRight, Clock, FileText, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { formatCurrency } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import type { ClientProfile, Job, Skill, User } from "@prisma/client";
import type { Session } from "next-auth";

type JobWithRelations = Job & {
  skills: Skill[];
  _count: { applications: number };
};

type ProfileWithRelations = ClientProfile & {
  user: Pick<User, "id" | "email" | "avatar" | "createdAt">;
  jobs: JobWithRelations[];
};

interface ClientDashboardProps {
  profile: ProfileWithRelations | null;
  session: Session;
  stats: {
    totalJobs: number;
    totalApplications: number;
    activeJobs: number;
    activeContracts: number;
    unreadMessages: number;
  };
}

const statusVariant: Record<string, "default" | "success" | "secondary" | "warning" | "destructive"> = {
  OPEN: "success",
  DRAFT: "secondary",
  CLOSED: "destructive",
  FILLED: "warning",
};

export function ClientDashboard({ profile, session, stats }: ClientDashboardProps) {
  const completionPct = profile?.completionStatus ?? 0;
  const isProfileComplete = completionPct >= 75;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.companyName || session.user?.email?.split("@")[0]}!
          </h1>
          <p className="mt-1 text-gray-500">Manage your jobs and find the best talent</p>
        </div>
        <Link href="/dashboard/post-job" className="shrink-0">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Profile completion banner */}
      {!isProfileComplete && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your profile is {completionPct}% complete. Add more details to attract better talent.
            </p>
          </div>
          <Link href="/dashboard/profile">
            <Button size="sm" variant="warning">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <ScrollReveal>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 shrink-0">
              <Briefcase className="h-5 w-5 text-brand-800" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-xs text-gray-500">Jobs Posted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 shrink-0">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.activeJobs}</p>
              <p className="text-xs text-gray-500">Active Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Link href="/dashboard/contracts">
          <Card className="hover:border-brand-300 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-5 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 shrink-0">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.activeContracts}</p>
                <p className="text-xs text-gray-500">Active Contracts</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/messages">
          <Card className="hover:border-brand-300 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-5 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shrink-0 relative">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white">
                    {stats.unreadMessages > 9 ? "9+" : stats.unreadMessages}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.unreadMessages}</p>
                <p className="text-xs text-gray-500">Unread Messages</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      </ScrollReveal>

      {/* Recent Jobs */}
      <ErrorBoundary section="recent jobs">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Link href="/dashboard/my-jobs">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!profile?.jobs || profile.jobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No jobs posted yet</p>
              <Link href="/dashboard/post-job" className="mt-4 inline-block">
                <Button size="sm">Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-gray-900 hover:text-brand-800 truncate"
                      >
                        {job.title}
                      </Link>
                      <Badge variant={statusVariant[job.status] || "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job._count.applications} application{job._count.applications !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <TimeAgo date={job.createdAt} />
                      </span>
                      {job.budgetMin && job.budgetMax && (
                        <span>
                          {formatCurrency(job.budgetMin)} – {formatCurrency(job.budgetMax)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/dashboard/my-jobs/${job.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </ErrorBoundary>
    </div>
  );
}
