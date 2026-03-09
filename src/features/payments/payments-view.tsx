"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { DollarSign, ArrowRight, Clock, Landmark, CheckCircle, Loader2, Settings } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { track, EVENTS } from "@/lib/analytics";
import type { Session } from "next-auth";
import type { Payment, Contract, ClientProfile, FreelancerProfile, Job, User, Payout } from "@prisma/client";

type PaymentWithRelations = Payment & {
  contract: Contract & {
    job: Pick<Job, "id" | "title">;
    clientProfile: ClientProfile & {
      user: Pick<User, "id" | "email" | "avatar">;
    };
    freelancerProfile: FreelancerProfile & {
      user: Pick<User, "id" | "email" | "avatar">;
    };
  };
  payouts: Payout[];
};

interface PayoutSettings {
  stripeConnectOnboarded: boolean;
  paypalEmail: string | null;
  payoneerEmail: string | null;
  preferredPayoutGateway: string;
}

interface PaymentsViewProps {
  payments: PaymentWithRelations[];
  session: Session;
  connectStatus: { onboarded: boolean; accountId: string | null };
  payoutSettings?: PayoutSettings | null;
}

const statusConfig: Record<string, { variant: "default" | "success" | "secondary" | "warning" | "destructive"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  COMPLETED: { variant: "success", label: "Completed" },
  FAILED: { variant: "destructive", label: "Failed" },
  REFUNDED: { variant: "secondary", label: "Refunded" },
};

function getPayoutBadge(payment: PaymentWithRelations, contractStatus: string) {
  const latestPayout = payment.payouts[0];

  if (latestPayout?.status === "COMPLETED") {
    return <Badge variant="success">Paid Out</Badge>;
  }
  if (latestPayout?.status === "PROCESSING") {
    return <Badge variant="warning">Processing</Badge>;
  }
  if (latestPayout?.status === "FAILED") {
    return <Badge variant="destructive">Payout Failed</Badge>;
  }
  if (contractStatus === "COMPLETED") {
    return <Badge variant="warning">Ready to Withdraw</Badge>;
  }
  return <Badge variant="warning">Payout Pending</Badge>;
}

export function PaymentsView({ payments, session, connectStatus, payoutSettings }: PaymentsViewProps) {
  const role = session.user.role;
  const userId = session.user.id;
  const isFreelancer = role === "FREELANCER";
  const searchParams = useSearchParams();
  const [connectLoading, setConnectLoading] = useState(false);
  const [payoutLoadingId, setPayoutLoadingId] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(connectStatus.onboarded);
  const [showPayoutSettings, setShowPayoutSettings] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState(payoutSettings?.paypalEmail || "");
  const [payoneerEmail, setPayoneerEmail] = useState(payoutSettings?.payoneerEmail || "");
  const [preferredGateway, setPreferredGateway] = useState(payoutSettings?.preferredPayoutGateway || "STRIPE");
  const [savingSettings, setSavingSettings] = useState(false);

  // Handle connect return params
  useEffect(() => {
    const connectParam = searchParams.get("connect");
    if (connectParam === "success") {
      // Check actual status from Stripe
      fetch("/api/stripe/connect/status")
        .then((res) => res.json())
        .then((json) => {
          if (json.data?.onboarded) {
            setOnboarded(true);
            toast.success("Bank account connected successfully!");
          } else {
            toast.success("Almost there! Your account is being reviewed by Stripe.");
          }
        })
        .catch(() => {});
    } else if (connectParam === "refresh") {
      toast.error("Onboarding was not completed. Please try again.");
    }
  }, [searchParams]);

  const totalPaid = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalFees = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.platformFee, 0);

  const totalWithdrawn = payments
    .filter((p) => p.payouts.some((po) => po.status === "COMPLETED"))
    .reduce((sum, p) => sum + (p.amount - p.platformFee), 0);

  async function handleConnect() {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.data?.url) {
        track(EVENTS.STRIPE_CONNECTED);
        window.location.href = json.data.url;
      } else {
        toast.error(json.error?.message || "Failed to start onboarding");
        setConnectLoading(false);
      }
    } catch {
      toast.error("Something went wrong");
      setConnectLoading(false);
    }
  }

  function getPayoutEndpoint(payment: PaymentWithRelations): string {
    // Route payout to the correct gateway based on preferred method or payment gateway
    const gateway = preferredGateway || (payment as unknown as { gateway?: string }).gateway || "STRIPE";
    if (gateway === "PAYPAL") return "/api/paypal/payout";
    if (gateway === "PAYONEER") return "/api/payoneer/payout";
    return "/api/stripe/payout";
  }

  async function handleRequestPayout(paymentId: string, payment: PaymentWithRelations, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPayoutLoadingId(paymentId);
    try {
      const endpoint = getPayoutEndpoint(payment);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Payout initiated successfully!");
        track(EVENTS.PAYOUT_REQUESTED, { payment_id: paymentId, gateway: preferredGateway });
        window.location.reload();
      } else {
        toast.error(json.error?.message || "Payout request failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPayoutLoadingId(null);
    }
  }

  async function handleSavePayoutSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/profiles/payout-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalEmail: paypalEmail || "",
          payoneerEmail: payoneerEmail || "",
          preferredPayoutGateway: preferredGateway,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Payout settings saved!");
        setShowPayoutSettings(false);
      } else {
        toast.error(json.error?.message || "Failed to save settings");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-gray-500">
          {payments.length} transaction{payments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Connect bank account banner for freelancers */}
      {isFreelancer && !onboarded && (
        <div className="mb-6 rounded-2xl border border-accent-200 bg-accent-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 shrink-0">
              <Landmark className="h-5 w-5 text-accent-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Connect your bank account</h3>
              <p className="mt-1 text-sm text-gray-600">
                Set up your payout method to withdraw earnings from completed contracts.
                You&apos;ll be redirected to Stripe to securely add your bank details.
              </p>
              <Button
                className="mt-3"
                size="sm"
                onClick={handleConnect}
                loading={connectLoading}
              >
                <Landmark className="h-4 w-4" />
                Connect Bank Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {isFreelancer && onboarded && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">
                <span className="font-medium">Bank account connected.</span>{" "}
                You can request payouts for completed contracts.
              </p>
            </div>
            <button
              onClick={() => setShowPayoutSettings(!showPayoutSettings)}
              className="text-green-700 hover:text-green-900 transition-colors"
              title="Payout Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Payout Settings */}
      {isFreelancer && (showPayoutSettings || (!onboarded && !showPayoutSettings)) && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Payout Settings</h3>
          <div className="space-y-4">
            {/* Preferred gateway */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferred Payout Method
              </label>
              <div className="flex gap-2 mt-2">
                {(["STRIPE", "PAYPAL", "PAYONEER"] as const).map((gw) => (
                  <button
                    key={gw}
                    type="button"
                    disabled={gw === "PAYONEER"}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      gw === "PAYONEER"
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : preferredGateway === gw
                        ? gw === "PAYPAL"
                          ? "bg-[#0070ba] text-white border-[#0070ba]"
                          : "bg-brand-800 text-white border-brand-800"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => gw !== "PAYONEER" && setPreferredGateway(gw)}
                  >
                    {gw === "STRIPE" ? "Stripe" : gw === "PAYPAL" ? "PayPal" : "Payoneer"}
                    {gw === "PAYONEER" && (
                      <span className="ml-1 text-[10px] text-gray-400">(Coming Soon)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stripe status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Stripe:</span>
              {onboarded ? (
                <span className="text-green-600 font-medium">Connected</span>
              ) : (
                <Button size="sm" variant="outline" onClick={handleConnect} loading={connectLoading}>
                  Connect Stripe
                </Button>
              )}
            </div>

            {/* PayPal email */}
            <div>
              <label htmlFor="paypal-email" className="text-sm text-gray-500">PayPal Email</label>
              <input
                id="paypal-email"
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="your-paypal@email.com"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Payoneer email — coming soon */}
            <div className="opacity-50">
              <label htmlFor="payoneer-email" className="text-sm text-gray-500">
                Payoneer Email <span className="text-xs text-gray-400">(Coming Soon)</span>
              </label>
              <input
                id="payoneer-email"
                type="email"
                disabled
                value=""
                placeholder="Coming soon..."
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>

            <Button
              size="sm"
              onClick={handleSavePayoutSettings}
              loading={savingSettings}
            >
              Save Payout Settings
            </Button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {payments.length > 0 && (
        <div className={`grid grid-cols-2 gap-4 mb-8 ${isFreelancer ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-gray-500">
                  {role === "CLIENT" ? "Total Paid" : "Total Received"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100">
                <DollarSign className="h-5 w-5 text-brand-800" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalFees)}</p>
                <p className="text-xs text-gray-500">Platform Fees</p>
              </div>
            </CardContent>
          </Card>
          {isFreelancer && (
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(totalWithdrawn)}</p>
                  <p className="text-xs text-gray-500">Withdrawn</p>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "PENDING").length}
                </p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment list */}
      {payments.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No payments yet</h3>
          <p className="mt-1 text-gray-500">
            {role === "CLIENT"
              ? "Fund a contract to see payments here."
              : "Payments will appear here once a contract is funded."}
          </p>
          <Link href="/dashboard/contracts" className="mt-4 inline-block">
            <span className="text-sm font-medium text-brand-800 hover:underline">
              View Contracts
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, index) => {
            const isClient = payment.contract.clientProfile.userId === userId;
            const otherParty = isClient
              ? payment.contract.freelancerProfile
              : payment.contract.clientProfile;
            const latestPayout = payment.payouts[0];
            const canRequestPayout =
              isFreelancer &&
              onboarded &&
              payment.status === "COMPLETED" &&
              payment.contract.status === "COMPLETED" &&
              (!latestPayout || latestPayout.status === "FAILED");

            return (
              <ScrollReveal key={payment.id} delay={index * 0.05}>
              <Link href={`/dashboard/contracts/${payment.contract.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
                <div className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <div
                      className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shrink-0 ${
                        payment.status === "COMPLETED"
                          ? "bg-green-100"
                          : payment.status === "FAILED"
                          ? "bg-red-100"
                          : "bg-amber-100"
                      }`}
                    >
                      <DollarSign
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          payment.status === "COMPLETED"
                            ? "text-green-600"
                            : payment.status === "FAILED"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {payment.contract.job.title}
                        </p>
                        <Badge
                          variant={statusConfig[payment.status]?.variant || "secondary"}
                        >
                          {statusConfig[payment.status]?.label || payment.status}
                        </Badge>
                        {(payment as unknown as { gateway?: string }).gateway && (
                          <Badge variant="secondary" className="text-[10px]">
                            {(payment as unknown as { gateway?: string }).gateway === "PAYPAL" ? "PayPal" : "Stripe"}
                          </Badge>
                        )}
                        {payment.status === "COMPLETED" && isFreelancer && (
                          getPayoutBadge(payment, payment.contract.status)
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                        <span>
                          {isClient ? "Paid to" : "From"}: {otherParty.user.email.split("@")[0]}
                        </span>
                        <span>{formatDate(payment.createdAt)}</span>
                        <span className="hidden sm:inline">Fee: {formatCurrency(payment.platformFee)}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        {isFreelancer && payment.status === "COMPLETED" && (
                          <p className="text-xs text-green-600">
                            Net: {formatCurrency(payment.amount - payment.platformFee)}
                          </p>
                        )}
                      </div>
                      {canRequestPayout ? (
                        <Button
                          size="sm"
                          onClick={(e) => handleRequestPayout(payment.id, payment, e)}
                          loading={payoutLoadingId === payment.id}
                          disabled={payoutLoadingId !== null}
                        >
                          {payoutLoadingId === payment.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Withdraw"
                          )}
                        </Button>
                      ) : (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {/* Mobile amount + action row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 sm:hidden">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      {isFreelancer && payment.status === "COMPLETED" && (
                        <p className="text-xs text-green-600">
                          Net: {formatCurrency(payment.amount - payment.platformFee)}
                        </p>
                      )}
                    </div>
                    {canRequestPayout ? (
                      <Button
                        size="sm"
                        onClick={(e) => handleRequestPayout(payment.id, payment, e)}
                        loading={payoutLoadingId === payment.id}
                        disabled={payoutLoadingId !== null}
                      >
                        {payoutLoadingId === payment.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Withdraw"
                        )}
                      </Button>
                    ) : (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </Link>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
