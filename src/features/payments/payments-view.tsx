"use client";

import Link from "next/link";
import { DollarSign, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Session } from "next-auth";
import type { Payment, Contract, ClientProfile, FreelancerProfile, Job, User } from "@prisma/client";

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
};

interface PaymentsViewProps {
  payments: PaymentWithRelations[];
  session: Session;
}

const statusConfig: Record<string, { variant: "default" | "success" | "secondary" | "warning" | "destructive"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  COMPLETED: { variant: "success", label: "Completed" },
  FAILED: { variant: "destructive", label: "Failed" },
  REFUNDED: { variant: "secondary", label: "Refunded" },
};

export function PaymentsView({ payments, session }: PaymentsViewProps) {
  const role = session.user.role;
  const userId = session.user.id;

  const totalPaid = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalFees = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.platformFee, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-gray-500">
          {payments.length} transaction{payments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary cards */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
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
          {payments.map((payment) => {
            const isClient = payment.contract.clientProfile.userId === userId;
            const otherParty = isClient
              ? payment.contract.freelancerProfile
              : payment.contract.clientProfile;

            return (
              <Link key={payment.id} href={`/dashboard/contracts/${payment.contract.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
                <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                        payment.status === "COMPLETED"
                          ? "bg-green-100"
                          : payment.status === "FAILED"
                          ? "bg-red-100"
                          : "bg-amber-100"
                      }`}
                    >
                      <DollarSign
                        className={`h-5 w-5 ${
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
                        {payment.status === "COMPLETED" && !isClient && (
                          <Badge variant="warning">Payout Pending</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span>
                          {isClient ? "Paid to" : "From"}: {otherParty.user.email.split("@")[0]}
                        </span>
                        <span>{formatDate(payment.createdAt)}</span>
                        <span>Fee: {formatCurrency(payment.platformFee)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      {!isClient && payment.status === "COMPLETED" && (
                        <p className="text-xs text-green-600">
                          Net: {formatCurrency(payment.amount - payment.platformFee)}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
