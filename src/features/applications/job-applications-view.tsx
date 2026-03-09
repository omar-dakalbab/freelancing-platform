"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, DollarSign, Clock, Star, X, CheckCircle, User, FileText, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import { track, EVENTS } from "@/lib/analytics";
import { CreateContractForm } from "@/features/contracts/create-contract-form";
import type {
  Job, JobApplication, FreelancerProfile, PortfolioItem, Skill, User as PrismaUser, ClientProfile, Conversation
} from "@prisma/client";

type Application = JobApplication & {
  freelancerProfile: FreelancerProfile & {
    user: Pick<PrismaUser, "id" | "email" | "avatar">;
    skills: Skill[];
    portfolioItems: PortfolioItem[];
  };
  conversation: Conversation | null;
};

type JobWithApplications = Job & {
  clientProfile: ClientProfile;
  skills: Skill[];
  _count: { applications: number };
  applications: Application[];
};

interface JobApplicationsViewProps {
  job: JobWithApplications;
}

const statusConfig: Record<string, { variant: "default" | "success" | "secondary" | "warning" | "destructive"; label: string }> = {
  SUBMITTED: { variant: "secondary", label: "Submitted" },
  SHORTLISTED: { variant: "success", label: "Shortlisted" },
  REJECTED: { variant: "destructive", label: "Rejected" },
  HIRED: { variant: "default", label: "Hired" },
};

export function JobApplicationsView({ job }: JobApplicationsViewProps) {
  const [applications, setApplications] = useState<Application[]>(job.applications);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showContractForm, setShowContractForm] = useState(false);

  async function updateStatus(applicationId: string, status: string) {
    setUpdatingId(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const updated = await res.json();
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status: status as JobApplication["status"], conversation: updated.data?.conversation ?? a.conversation }
            : a
        )
      );
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) =>
          prev
            ? {
                ...prev,
                status: status as JobApplication["status"],
                conversation: updated.data?.conversation ?? prev.conversation,
              }
            : null
        );
      }
      toast.success(`Application ${status.toLowerCase()}`);
      if (status === "SHORTLISTED") track(EVENTS.APPLICATION_SHORTLISTED, { application_id: applicationId });
      if (status === "REJECTED") track(EVENTS.APPLICATION_REJECTED, { application_id: applicationId });
      if (status === "HIRED") track(EVENTS.APPLICATION_HIRED, { application_id: applicationId });
    } catch {
      toast.error("Failed to update application status");
    } finally {
      setUpdatingId(null);
    }
  }

  const submitted = applications.filter((a) => a.status === "SUBMITTED");
  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED");
  const others = applications.filter((a) => a.status !== "SUBMITTED" && a.status !== "SHORTLISTED");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/my-jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Jobs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
        <p className="mt-1 text-gray-500">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
          {shortlisted.length > 0 && ` · ${shortlisted.length} shortlisted`}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-gray-500">Share your job to attract freelancers</p>
          <Link href={`/jobs/${job.id}`} className="mt-4 inline-block">
            <Button variant="outline">View Job Posting</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Applications list - hidden on mobile when viewing detail */}
          <div className={`lg:col-span-2 space-y-3 ${selectedApp ? "hidden lg:block" : ""}`}>
            {shortlisted.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-2">
                  Shortlisted ({shortlisted.length})
                </p>
                {shortlisted.map((app, index) => (
                  <ScrollReveal key={app.id} delay={index * 0.05}>
                    <ApplicationCard
                      application={app}
                      isSelected={selectedApp?.id === app.id}
                      onClick={() => setSelectedApp(app)}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
            {submitted.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  New ({submitted.length})
                </p>
                {submitted.map((app, index) => (
                  <ScrollReveal key={app.id} delay={index * 0.05}>
                    <ApplicationCard
                      application={app}
                      isSelected={selectedApp?.id === app.id}
                      onClick={() => setSelectedApp(app)}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
            {others.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Other ({others.length})
                </p>
                {others.map((app, index) => (
                  <ScrollReveal key={app.id} delay={index * 0.05}>
                    <ApplicationCard
                      application={app}
                      isSelected={selectedApp?.id === app.id}
                      onClick={() => setSelectedApp(app)}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* Application detail */}
          <div className={`lg:col-span-3 ${!selectedApp ? "hidden lg:block" : ""}`}>
            {!selectedApp ? (
              <div className="py-20 text-center rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400">Select an application to view details</p>
              </div>
            ) : (
              <Card>
                <CardHeader className="space-y-3">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="lg:hidden inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to applications
                  </button>
                  <div className="flex flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={selectedApp.freelancerProfile.user.avatar}
                        alt={selectedApp.freelancerProfile.user.email}
                        email={selectedApp.freelancerProfile.user.email}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedApp.freelancerProfile.title || selectedApp.freelancerProfile.user.email.split("@")[0]}
                        </p>
                        <p className="text-sm text-gray-500">{selectedApp.freelancerProfile.user.email}</p>
                      </div>
                    </div>
                    <Badge variant={statusConfig[selectedApp.status]?.variant || "secondary"}>
                      {statusConfig[selectedApp.status]?.label || selectedApp.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Bid */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 sm:flex sm:items-center sm:gap-6">
                    <div className="text-center sm:text-left">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedApp.bidAmount)}
                      </p>
                      <p className="text-xs text-gray-500">Proposed Bid</p>
                    </div>
                    {selectedApp.freelancerProfile.hourlyRate && (
                      <div className="text-center sm:text-left sm:border-l sm:border-gray-200 sm:pl-6">
                        <p className="text-lg font-semibold text-gray-700">
                          {formatCurrency(selectedApp.freelancerProfile.hourlyRate)}/hr
                        </p>
                        <p className="text-xs text-gray-500">Hourly Rate</p>
                      </div>
                    )}
                    <div className="col-span-2 text-center sm:text-left sm:border-l sm:border-gray-200 sm:pl-6 sm:ml-auto">
                      <p className="text-sm font-medium text-gray-600">
                        <TimeAgo date={selectedApp.createdAt} />
                      </p>
                      <p className="text-xs text-gray-500">Applied</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedApp.freelancerProfile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.freelancerProfile.skills.map((skill) => (
                          <Badge key={skill.id} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proposal */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter</p>
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedApp.proposalText}
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedApp.freelancerProfile.bio && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">About</p>
                      <p className="text-sm text-gray-600">{selectedApp.freelancerProfile.bio}</p>
                    </div>
                  )}

                  {/* Portfolio */}
                  {selectedApp.freelancerProfile.portfolioItems.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Portfolio ({selectedApp.freelancerProfile.portfolioItems.length} items)
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {selectedApp.freelancerProfile.portfolioItems.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-gray-200 p-3 text-sm"
                          >
                            <p className="font-medium text-gray-900 truncate">{item.title}</p>
                            {item.description && (
                              <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                    {selectedApp.status !== "SHORTLISTED" && selectedApp.status !== "HIRED" && (
                      <Button
                        variant="success"
                        loading={updatingId === selectedApp.id}
                        onClick={() => updateStatus(selectedApp.id, "SHORTLISTED")}
                      >
                        <Star className="h-4 w-4" />
                        Shortlist
                      </Button>
                    )}
                    {selectedApp.status === "SHORTLISTED" && (
                      <Button
                        variant="default"
                        loading={updatingId === selectedApp.id}
                        onClick={() => updateStatus(selectedApp.id, "HIRED")}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Hire Freelancer
                      </Button>
                    )}
                    {selectedApp.status !== "REJECTED" && selectedApp.status !== "HIRED" && (
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        loading={updatingId === selectedApp.id}
                        onClick={() => updateStatus(selectedApp.id, "REJECTED")}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    )}
                    {selectedApp.status === "HIRED" && (
                      <>
                        <Button
                          variant="default"
                          onClick={() => setShowContractForm(true)}
                        >
                          <FileText className="h-4 w-4" />
                          Create Contract
                        </Button>
                        {selectedApp.conversation && (
                          <Link href={`/dashboard/messages/${selectedApp.conversation.id}`}>
                            <Button variant="outline">
                              <MessageSquare className="h-4 w-4" />
                              Open Chat
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                    {selectedApp.status === "SHORTLISTED" && selectedApp.conversation && (
                      <Link href={`/dashboard/messages/${selectedApp.conversation.id}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Contract creation modal */}
      {showContractForm && selectedApp && (
        <CreateContractForm
          jobId={job.id}
          freelancerProfileId={selectedApp.freelancerProfile.id}
          suggestedAmount={selectedApp.bidAmount}
          freelancerName={
            selectedApp.freelancerProfile.title ||
            selectedApp.freelancerProfile.user.email.split("@")[0]
          }
          onClose={() => setShowContractForm(false)}
        />
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  isSelected,
  onClick,
}: {
  application: Application;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={() => {
        track(EVENTS.APPLICATION_VIEWED, { application_id: application.id });
        onClick();
      }}
      className={`cursor-pointer rounded-xl border p-4 transition-all mb-2 ${
        isSelected
          ? "border-brand-400 bg-brand-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={application.freelancerProfile.user.avatar}
          alt={application.freelancerProfile.user.email}
          email={application.freelancerProfile.user.email}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {application.freelancerProfile.title || application.freelancerProfile.user.email.split("@")[0]}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-semibold text-gray-700">
              {formatCurrency(application.bidAmount)}
            </span>
            <TimeAgo date={application.createdAt} className="text-xs text-gray-400" />
          </div>
        </div>
        <Badge variant={statusConfig[application.status]?.variant || "secondary"} className="text-xs shrink-0">
          {statusConfig[application.status]?.label || application.status}
        </Badge>
      </div>
    </div>
  );
}
