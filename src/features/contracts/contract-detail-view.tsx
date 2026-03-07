"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Upload,
  DollarSign,
  Clock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ReviewForm } from "@/features/reviews/review-form";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import type { Session } from "next-auth";
import type {
  Contract,
  ClientProfile,
  FreelancerProfile,
  Job,
  Payment,
  Review,
  User,
} from "@prisma/client";

type ContractReviewSummary = Pick<Review, "id" | "reviewerId" | "rating">;

type ContractWithRelations = Contract & {
  job: Pick<Job, "id" | "title" | "category">;
  clientProfile: ClientProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
  freelancerProfile: FreelancerProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
  payments: Payment[];
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
    description: "Contract accepted. Awaiting payment and work delivery.",
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

export function ContractDetailView({
  contract: initialContract,
  isClient,
  isFreelancer,
  session,
}: ContractDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentResult = searchParams.get("payment");

  const [contract, setContract] = useState(initialContract);
  const [updating, setUpdating] = useState(false);
  const [funding, setFunding] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const hasReviewed = reviewSubmitted ||
    (contract.reviews?.some((r) => r.reviewerId === session?.user?.id) ?? false);

  const status = contract.status;
  const latestPayment = contract.payments[0];
  const isPaid = latestPayment?.status === "COMPLETED";
  const statusInfo = statusConfig[status] || { variant: "secondary" as const, label: status, description: "" };

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
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update contract");
    } finally {
      setUpdating(false);
    }
  }

  async function fundContract() {
    setFunding(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to create checkout session");

      window.location.href = json.data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment");
      setFunding(false);
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

      {/* Payment result banner */}
      {paymentResult === "success" && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            Payment successful! The contract is now funded.
          </p>
        </div>
      )}
      {paymentResult === "cancelled" && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            Payment was cancelled. You can try again when ready.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - order 2 on mobile to show sidebar summary first */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {/* Status card */}
          <Card>
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
                  <div>
                    {!isPaid ? (
                      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        Waiting for the client to fund the contract before you can submit work.
                      </p>
                    ) : (
                      <Button
                        variant="default"
                        loading={updating}
                        onClick={() => updateStatus("SUBMITTED")}
                      >
                        <Upload className="h-4 w-4" />
                        Mark Work as Submitted
                      </Button>
                    )}
                  </div>
                )}

                {/* Client actions */}
                {isClient && status === "ACTIVE" && !isPaid && (
                  <Button loading={funding} onClick={fundContract}>
                    <CreditCard className="h-4 w-4" />
                    Fund Contract ({formatCurrency(contract.amount)})
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
          </Card>

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

          {/* Payment history */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.payments.length === 0 ? (
                <div className="py-6 text-center">
                  <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contract.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center ${
                            payment.status === "COMPLETED"
                              ? "bg-green-100"
                              : payment.status === "FAILED"
                              ? "bg-red-100"
                              : "bg-amber-100"
                          }`}
                        >
                          <DollarSign
                            className={`h-4 w-4 ${
                              payment.status === "COMPLETED"
                                ? "text-green-600"
                                : payment.status === "FAILED"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Platform fee: {formatCurrency(payment.platformFee)} · Net:{" "}
                            {formatCurrency(payment.amount - payment.platformFee)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            payment.status === "COMPLETED"
                              ? "success"
                              : payment.status === "FAILED"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {payment.status}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(payment.createdAt)}
                        </p>
                        {payment.status === "COMPLETED" && isFreelancer && (
                          <p className="text-xs text-amber-600 mt-0.5">Payout pending</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - order 1 on mobile so contract value shows first */}
        <div className="space-y-4 order-1 lg:order-2">
          {/* Amount */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(contract.amount)}</p>
                <p className="text-sm text-gray-500 mt-1">Contract Value</p>
                {isPaid && (
                  <Badge variant="success" className="mt-2">
                    Funded
                  </Badge>
                )}
              </div>
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
        </div>
      </div>
    </div>
  );
}
