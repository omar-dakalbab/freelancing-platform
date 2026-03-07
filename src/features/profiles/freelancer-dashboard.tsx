import Link from "next/link";
import { Search, FileText, Star, ArrowRight, Clock, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { FreelancerProfile, JobApplication, Job, ClientProfile, Skill, User } from "@prisma/client";
import type { Session } from "next-auth";

type ApplicationWithJob = JobApplication & {
  job: Job & {
    clientProfile: ClientProfile & {
      user: Pick<User, "id" | "email" | "avatar">;
    };
    skills: Skill[];
    _count: { applications: number };
  };
};

type ProfileWithRelations = FreelancerProfile & {
  user: Pick<User, "id" | "email" | "avatar" | "createdAt">;
  skills: Skill[];
  applications: ApplicationWithJob[];
};

interface FreelancerDashboardProps {
  profile: ProfileWithRelations | null;
  session: Session;
  stats: {
    totalApplications: number;
    shortlisted: number;
    openJobs: number;
    activeContracts: number;
    unreadMessages: number;
  };
}

const appStatusVariant: Record<string, "default" | "success" | "secondary" | "warning" | "destructive"> = {
  SUBMITTED: "secondary",
  SHORTLISTED: "success",
  REJECTED: "destructive",
  HIRED: "default",
};

export function FreelancerDashboard({ profile, session, stats }: FreelancerDashboardProps) {
  const completionPct = profile?.completionStatus ?? 0;
  const isProfileComplete = completionPct >= 75;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.title || session.user?.email?.split("@")[0]}!
          </h1>
          <p className="mt-1 text-gray-500">Find your next project and grow your career</p>
        </div>
        <Link href="/jobs" className="shrink-0">
          <Button>
            <Search className="h-4 w-4" aria-hidden="true" />
            Find Jobs
          </Button>
        </Link>
      </div>

      {/* Profile completion banner */}
      {!isProfileComplete && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your profile is {completionPct}% complete. A complete profile gets 3x more views.
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 shrink-0">
              <FileText className="h-5 w-5 text-brand-800" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.totalApplications}</p>
              <p className="text-xs text-gray-500">Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 shrink-0">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.shortlisted}</p>
              <p className="text-xs text-gray-500">Shortlisted</p>
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

      {/* Profile summary */}
      {profile && (
        <ErrorBoundary section="profile and applications">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile.user.avatar}
                  alt={profile.user.email}
                  email={profile.user.email}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-gray-900">{profile.title || "Add your title"}</p>
                  <p className="text-sm text-gray-500">{profile.user.email}</p>
                </div>
              </div>
              {profile.hourlyRate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  {formatCurrency(profile.hourlyRate)}/hr
                </div>
              )}
              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.slice(0, 5).map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                  {profile.skills.length > 5 && (
                    <Badge variant="outline">+{profile.skills.length - 5}</Badge>
                  )}
                </div>
              )}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Profile Completion</span>
                  <span>{completionPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-800 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
              <Link href="/dashboard/profile">
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Link href="/dashboard/applications">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {!profile.applications || profile.applications.length === 0 ? (
                  <div className="py-10 text-center">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No applications yet</p>
                    <Link href="/jobs" className="mt-4 inline-block">
                      <Button size="sm">Browse Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/jobs/${app.job.id}`}
                              className="font-medium text-gray-900 hover:text-brand-800 truncate text-sm"
                            >
                              {app.job.title}
                            </Link>
                            <Badge variant={appStatusVariant[app.status] || "secondary"}>
                              {app.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{app.job.clientProfile.companyName || app.job.clientProfile.user.email}</span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(app.bidAmount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(app.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </ErrorBoundary>
      )}
    </div>
  );
}
