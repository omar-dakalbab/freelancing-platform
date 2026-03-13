"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Upload,
  Target,
  Play,
  Check,
  Circle,
  CalendarDays,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ReviewForm } from "@/features/reviews/review-form";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { track, EVENTS } from "@/lib/analytics";
import type { Session } from "next-auth";
import type {
  Contract,
  ClientProfile,
  FreelancerProfile,
  Job,
  Payment,
  Payout,
  Review,
  User,
  Milestone,
} from "@prisma/client";

type ContractReviewSummary = Pick<Review, "id" | "reviewerId" | "rating">;

type PaymentWithPayouts = Payment & {
  payouts: Payout[];
};

type ContractWithRelations = Contract & {
  job: Pick<Job, "id" | "title" | "category">;
  clientProfile: ClientProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
  freelancerProfile: FreelancerProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
    whatsappNumber?: string | null;
    phoneNumber?: string | null;
  };
  payments: PaymentWithPayouts[];
  milestones?: Milestone[];
  reviews?: ContractReviewSummary[];
};

interface ContractDetailViewProps {
  contract: ContractWithRelations;
  isClient: boolean;
  isFreelancer: boolean;
  session: Session;
}

const statusConfig: Record<
  string,
  {
    variant: "default" | "success" | "secondary" | "warning" | "destructive";
    label: string;
    description: string;
  }
> = {
  PENDING: {
    variant: "warning",
    label: "Pending Acceptance",
    description: "Waiting for the freelancer to accept this contract.",
  },
  ACTIVE: {
    variant: "default",
    label: "Active",
    description: "Contract accepted. Awaiting work delivery.",
  },
  SUBMITTED: {
    variant: "secondary",
    label: "Work Submitted",
    description: "The freelancer has submitted their work. Review and approve to complete.",
  },
  COMPLETED: {
    variant: "success",
    label: "Completed",
    description: "This contract has been successfully completed.",
  },
  CANCELLED: {
    variant: "destructive",
    label: "Cancelled",
    description: "This contract was cancelled.",
  },
};

const milestoneStatusConfig: Record<
  string,
  {
    variant: "default" | "success" | "secondary" | "warning" | "destructive";
    label: string;
    icon: typeof Circle;
    color: string;
  }
> = {
  PENDING: { variant: "secondary", label: "Pending", icon: Circle, color: "text-gray-400" },
  IN_PROGRESS: { variant: "default", label: "In Progress", icon: Play, color: "text-blue-500" },
  SUBMITTED: { variant: "warning", label: "Submitted", icon: Upload, color: "text-amber-500" },
  APPROVED: { variant: "success", label: "Approved", icon: Check, color: "text-green-500" },
  PAID: { variant: "success", label: "Completed", icon: CheckCircle, color: "text-green-600" },
};

export function ContractDetailView({
  contract: initialContract,
  isClient,
  isFreelancer,
  session,
}: ContractDetailViewProps) {
  const [contract, setContract] = useState(initialContract);
  const [updating, setUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);

  const hasReviewed = reviewSubmitted ||
    (contract.reviews?.some((r) => r.reviewerId === session?.user?.id) ?? false);

  const status = contract.status;
  const statusInfo = statusConfig[status] || { variant: "secondary" as const, label: status, description: "" };
  const milestones = contract.milestones || [];
  const hasMilestones = milestones.length > 0;

  const completedMilestones = milestones.filter((m) => m.status === "APPROVED" || m.status === "PAID").length;
  const milestoneProgress = hasMilestones ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update");

      setContract(json.data);
      toast.success(`Contract status updated to ${newStatus}`);
      const statusEvents: Record<string, string> = {
        ACTIVE: EVENTS.CONTRACT_ACCEPTED,
        SUBMITTED: EVENTS.CONTRACT_SUBMITTED,
        COMPLETED: EVENTS.CONTRACT_COMPLETED,
        CANCELLED: EVENTS.CONTRACT_CANCELLED,
      };
      if (statusEvents[newStatus]) track(statusEvents[newStatus], { contract_id: contract.id });
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update contract");
    } finally {
      setUpdating(false);
    }
  }

  async function updateMilestoneStatus(milestoneId: string, newStatus: string) {
    setUpdatingMilestone(milestoneId);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update milestone");

      // Update local state
      setContract((prev) => ({
        ...prev,
        milestones: prev.milestones?.map((m) =>
          m.id === milestoneId ? { ...m, status: json.data.status } : m
        ),
      }));
      toast.success(`Milestone updated`);
      if (newStatus === "IN_PROGRESS") track(EVENTS.MILESTONE_STARTED, { milestone_id: milestoneId });
      if (newStatus === "SUBMITTED") track(EVENTS.MILESTONE_SUBMITTED, { milestone_id: milestoneId });
      if (newStatus === "APPROVED") track(EVENTS.MILESTONE_APPROVED, { milestone_id: milestoneId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update milestone");
    } finally {
      setUpdatingMilestone(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/contracts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contracts
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - order 2 on mobile to show sidebar summary first */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {/* Status card */}
          <ScrollReveal direction="left"><Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{contract.job.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{contract.job.category}</p>
                </div>
                <Badge variant={statusInfo.variant} className="shrink-0 text-sm px-3 py-1">
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
                {statusInfo.description}
              </p>

              {/* Description */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Contract Description</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {contract.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                {/* Freelancer actions */}
                {isFreelancer && status === "PENDING" && (
                  <div className="flex gap-3">
                    <Button
                      variant="success"
                      loading={updating}
                      onClick={() => updateStatus("ACTIVE")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept Contract
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      loading={updating}
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )}

                {isFreelancer && status === "ACTIVE" && (
                  <Button
                    variant="default"
                    loading={updating}
                    onClick={() => updateStatus("SUBMITTED")}
                  >
                    <Upload className="h-4 w-4" />
                    Mark Work as Submitted
                  </Button>
                )}

                {isClient && status === "SUBMITTED" && (
                  <div className="flex gap-3">
                    <Button
                      variant="success"
                      loading={updating}
                      onClick={() => updateStatus("COMPLETED")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve & Complete
                    </Button>
                  </div>
                )}

                {/* Cancel button — available to both parties for PENDING/ACTIVE */}
                {["PENDING", "ACTIVE"].includes(status) && !showCancelConfirm && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Cancel contract
                  </button>
                )}

                {showCancelConfirm && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800 mb-3">
                      Are you sure you want to cancel this contract? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        loading={updating}
                        onClick={() => updateStatus("CANCELLED")}
                      >
                        Yes, Cancel Contract
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelConfirm(false)}
                      >
                        Keep Contract
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card></ScrollReveal>

          {/* Milestones */}
          {hasMilestones && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-600" />
                    <CardTitle>Milestones</CardTitle>
                  </div>
                  <span className="text-sm text-gray-500">
                    {completedMilestones}/{milestones.length} completed
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500"
                      style={{ width: `${milestoneProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{milestoneProgress}% complete</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones.map((milestone, index) => {
                    const msConfig = milestoneStatusConfig[milestone.status] || milestoneStatusConfig.PENDING;
                    const MsIcon = msConfig.icon;
                    const isUpdatingThis = updatingMilestone === milestone.id;
                    const isContractActive = status === "ACTIVE";

                    return (
                      <div
                        key={milestone.id}
                        className={cn(
                          "rounded-xl border p-4 transition-all",
                          milestone.status === "APPROVED" || milestone.status === "PAID"
                            ? "border-green-200 bg-green-50/50"
                            : milestone.status === "SUBMITTED"
                            ? "border-amber-200 bg-amber-50/50"
                            : milestone.status === "IN_PROGRESS"
                            ? "border-blue-200 bg-blue-50/50"
                            : "border-gray-200 bg-white"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Step indicator */}
                          <div className="flex flex-col items-center pt-0.5">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                                milestone.status === "APPROVED" || milestone.status === "PAID"
                                  ? "border-green-500 bg-green-500"
                                  : milestone.status === "SUBMITTED"
                                  ? "border-amber-400 bg-amber-400"
                                  : milestone.status === "IN_PROGRESS"
                                  ? "border-blue-400 bg-blue-400"
                                  : "border-gray-300 bg-white"
                              )}
                            >
                              {milestone.status === "APPROVED" || milestone.status === "PAID" ? (
                                <Check className="h-4 w-4 text-white" />
                              ) : milestone.status === "PENDING" ? (
                                <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                              ) : (
                                <MsIcon className="h-3.5 w-3.5 text-white" />
                              )}
                            </div>
                            {index < milestones.length - 1 && (
                              <div
                                className={cn(
                                  "w-0.5 h-full min-h-[20px] mt-1",
                                  milestone.status === "APPROVED" || milestone.status === "PAID"
                                    ? "bg-green-300"
                                    : "bg-gray-200"
                                )}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {milestone.title}
                                </h4>
                                {milestone.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    {milestone.description}
                                  </p>
                                )}
                              </div>
                              <Badge variant={msConfig.variant} className="shrink-0 text-xs">
                                {msConfig.label}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 mt-2.5">
                              <span className="text-sm font-bold text-gray-900">
                                {formatCurrency(milestone.amount)}
                              </span>
                              {milestone.dueDate && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <CalendarDays className="h-3 w-3" />
                                  {formatDate(milestone.dueDate)}
                                </span>
                              )}
                            </div>

                            {/* Milestone actions */}
                            {isContractActive && (
                              <div className="mt-3">
                                {isFreelancer && milestone.status === "PENDING" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    loading={isUpdatingThis}
                                    onClick={() => updateMilestoneStatus(milestone.id, "IN_PROGRESS")}
                                  >
                                    <Play className="h-3 w-3" />
                                    Start Working
                                  </Button>
                                )}
                                {isFreelancer && milestone.status === "IN_PROGRESS" && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    loading={isUpdatingThis}
                                    onClick={() => updateMilestoneStatus(milestone.id, "SUBMITTED")}
                                  >
                                    <Upload className="h-3 w-3" />
                                    Submit for Review
                                  </Button>
                                )}
                                {isClient && milestone.status === "SUBMITTED" && (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    loading={isUpdatingThis}
                                    onClick={() => updateMilestoneStatus(milestone.id, "APPROVED")}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Approve Milestone
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leave a review — client only, completed contracts */}
          {isClient && status === "COMPLETED" && !hasReviewed && (
            <ReviewForm
              contractId={contract.id}
              freelancerName={
                contract.freelancerProfile.title ||
                contract.freelancerProfile.user.email.split("@")[0]
              }
              onSuccess={() => setReviewSubmitted(true)}
            />
          )}

          {isClient && status === "COMPLETED" && hasReviewed && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                You have already submitted a review for this contract.
              </p>
            </div>
          )}

          {/* Contact Freelancer — visible to client */}
          {isClient && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Freelancer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <a
                    href={`mailto:${contract.freelancerProfile.user.email}`}
                    className="text-sm text-brand-700 hover:underline break-all"
                  >
                    {contract.freelancerProfile.user.email}
                  </a>
                </div>
                {contract.freelancerProfile.whatsappNumber && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 shrink-0">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <a
                      href={`https://wa.me/${contract.freelancerProfile.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:underline"
                    >
                      {contract.freelancerProfile.whatsappNumber}
                    </a>
                  </div>
                )}
                {contract.freelancerProfile.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <a
                      href={`tel:${contract.freelancerProfile.phoneNumber}`}
                      className="text-sm text-gray-700 hover:underline"
                    >
                      {contract.freelancerProfile.phoneNumber}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - order 1 on mobile so contract value shows first */}
        <ScrollReveal direction="right"><div className="space-y-4 order-1 lg:order-2">
          {/* Amount */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(contract.amount)}</p>
                <p className="text-sm text-gray-500 mt-1">Contract Value</p>
              </div>

              {/* Milestone summary in sidebar */}
              {hasMilestones && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Milestones
                    </span>
                  </div>
                  <div className="space-y-2">
                    {milestones.map((m, i) => {
                      const msConf = milestoneStatusConfig[m.status] || milestoneStatusConfig.PENDING;
                      return (
                        <div key={m.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                m.status === "APPROVED" || m.status === "PAID"
                                  ? "bg-green-500"
                                  : m.status === "SUBMITTED"
                                  ? "bg-amber-400"
                                  : m.status === "IN_PROGRESS"
                                  ? "bg-blue-400"
                                  : "bg-gray-300"
                              )}
                            />
                            <span className="text-gray-600 truncate">{m.title}</span>
                          </div>
                          <span className="text-gray-900 font-medium shrink-0 ml-2">
                            {formatCurrency(m.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Client</p>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={contract.clientProfile.user.avatar}
                    alt={contract.clientProfile.user.email}
                    email={contract.clientProfile.user.email}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {contract.clientProfile.companyName ||
                        contract.clientProfile.user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500">{contract.clientProfile.user.email}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Freelancer</p>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={contract.freelancerProfile.user.avatar}
                    alt={contract.freelancerProfile.user.email}
                    email={contract.freelancerProfile.user.email}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {contract.freelancerProfile.title ||
                        contract.freelancerProfile.user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500">{contract.freelancerProfile.user.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900 font-medium">{formatDate(contract.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Updated</span>
                <span className="text-gray-900 font-medium">{formatDate(contract.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick links */}
          <div className="space-y-2">
            <Link href={`/jobs/${contract.job.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                View Job Posting
              </Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button variant="outline" size="sm" className="w-full">
                Open Messages
              </Button>
            </Link>
          </div>
        </div></ScrollReveal>
      </div>
    </div>
  );
}
