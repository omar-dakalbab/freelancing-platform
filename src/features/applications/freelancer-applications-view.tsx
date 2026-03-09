"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, DollarSign, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency, truncate } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import type { JobApplication, Job, ClientProfile, Skill, User } from "@prisma/client";

type ApplicationWithJob = JobApplication & {
  job: Job & {
    clientProfile: ClientProfile & {
      user: Pick<User, "id" | "email" | "avatar">;
    };
    skills: Skill[];
    _count: { applications: number };
  };
};

interface FreelancerApplicationsViewProps {
  applications: ApplicationWithJob[];
}

const statusConfig: Record<string, {
  variant: "default" | "success" | "secondary" | "warning" | "destructive";
  label: string;
  description: string;
}> = {
  SUBMITTED: { variant: "secondary", label: "Submitted", description: "Awaiting client review" },
  SHORTLISTED: { variant: "success", label: "Shortlisted", description: "Client is interested!" },
  REJECTED: { variant: "destructive", label: "Rejected", description: "Not selected for this role" },
  HIRED: { variant: "default", label: "Hired", description: "Congratulations! You got the job" },
};

export function FreelancerApplicationsView({ applications }: FreelancerApplicationsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED" || a.status === "HIRED");
  const submitted = applications.filter((a) => a.status === "SUBMITTED");
  const rejected = applications.filter((a) => a.status === "REJECTED");

  function ApplicationRow({ app }: { app: ApplicationWithJob }) {
    const isExpanded = expandedId === app.id;
    const config = statusConfig[app.status] || statusConfig.SUBMITTED;

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedId(isExpanded ? null : app.id)}
          >
            <Avatar
              src={app.job.clientProfile.user.avatar}
              alt={app.job.clientProfile.companyName || app.job.clientProfile.user.email}
              email={app.job.clientProfile.user.email}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/jobs/${app.job.id}`}
                  className="font-medium text-gray-900 hover:text-brand-800 transition-colors text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {app.job.title}
                </Link>
                <Badge variant={config.variant} className="text-xs">
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span>{app.job.clientProfile.companyName || app.job.clientProfile.user.email.split("@")[0]}</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(app.bidAmount)} bid
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <TimeAgo date={app.createdAt} />
                </span>
              </div>
            </div>
            <div className="shrink-0 text-gray-400">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>

          {isExpanded && (
            <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
              {/* Status message */}
              <div className={`rounded-lg p-3 text-sm ${
                app.status === "SHORTLISTED" ? "bg-green-50 text-green-700 border border-green-200" :
                app.status === "HIRED" ? "bg-brand-50 text-brand-800 border border-brand-300" :
                app.status === "REJECTED" ? "bg-red-50 text-red-700 border border-red-200" :
                "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {config.description}
              </div>

              {/* Your proposal */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Your Proposal
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.proposalText}</p>
              </div>

              {/* Job skills */}
              {app.job.skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Job Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.job.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Link href={`/jobs/${app.job.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Job
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-1 text-gray-500">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
          {shortlisted.length > 0 && ` · ${shortlisted.length} shortlisted/hired`}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-gray-500">Start applying to jobs to see your applications here</p>
          <Link href="/jobs" className="mt-6 inline-block">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {shortlisted.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">
                Shortlisted & Hired ({shortlisted.length})
              </h2>
              <div className="space-y-3">
                {shortlisted.map((app, index) => (
                  <ScrollReveal key={app.id} delay={index * 0.05}>
                    <ApplicationRow app={app} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {submitted.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Pending Review ({submitted.length})
              </h2>
              <div className="space-y-3">
                {submitted.map((app, index) => (
                  <ScrollReveal key={app.id} delay={index * 0.05}>
                    <ApplicationRow app={app} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {rejected.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Not Selected ({rejected.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {rejected.map((app, index) => (
                  <ScrollReveal key={app.id} delay={index * 0.05}>
                    <ApplicationRow app={app} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
