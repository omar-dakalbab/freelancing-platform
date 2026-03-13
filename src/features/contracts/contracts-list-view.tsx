"use client";

import Link from "next/link";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Session } from "next-auth";
import type { Contract, ClientProfile, FreelancerProfile, Job, User } from "@prisma/client";

type ContractWithRelations = Contract & {
  job: Pick<Job, "id" | "title">;
  clientProfile: ClientProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
  freelancerProfile: FreelancerProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
};

interface ContractsListViewProps {
  contracts: ContractWithRelations[];
  session: Session;
}

const statusConfig: Record<string, { variant: "default" | "success" | "secondary" | "warning" | "destructive"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  ACTIVE: { variant: "default", label: "Active" },
  SUBMITTED: { variant: "secondary", label: "Work Submitted" },
  COMPLETED: { variant: "success", label: "Completed" },
  CANCELLED: { variant: "destructive", label: "Cancelled" },
};


export function ContractsListView({ contracts, session }: ContractsListViewProps) {
  const role = session.user.role;

  const active = contracts.filter((c) => ["PENDING", "ACTIVE", "SUBMITTED"].includes(c.status));
  const completed = contracts.filter((c) => ["COMPLETED", "CANCELLED"].includes(c.status));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="mt-1 text-gray-500">
            {contracts.length} total contract{contracts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No contracts yet</h3>
          <p className="mt-1 text-gray-500">
            {role === "CLIENT"
              ? "Hire a freelancer from your job applications to create a contract."
              : "Contracts will appear here once a client hires you."}
          </p>
          {role === "CLIENT" && (
            <Link href="/dashboard/my-jobs" className="mt-4 inline-block">
              <Button>View My Jobs</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Active ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((contract, index) => (
                  <ScrollReveal key={contract.id} delay={index * 0.05}>
                    <ContractCard
                      contract={contract}
                      currentUserId={session.user.id}
                      role={role}
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                History ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((contract, index) => (
                  <ScrollReveal key={contract.id} delay={index * 0.05}>
                    <ContractCard
                      contract={contract}
                      currentUserId={session.user.id}
                      role={role}
                    />
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

function ContractCard({
  contract,
  currentUserId,
  role,
}: {
  contract: ContractWithRelations;
  currentUserId: string;
  role: string;
}) {
  const isClient = contract.clientProfile.userId === currentUserId;
  const otherParty = isClient ? contract.freelancerProfile : contract.clientProfile;
  const displayName =
    (otherParty as ClientProfile & { user: Pick<User, "email" | "avatar"> }).user.email.split("@")[0];

  return (
    <Link href={`/dashboard/contracts/${contract.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
      <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <Avatar
            src={otherParty.user.avatar}
            alt={displayName}
            email={otherParty.user.email}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 truncate">{contract.job.title}</p>
              <Badge variant={statusConfig[contract.status]?.variant || "secondary"}>
                {statusConfig[contract.status]?.label || contract.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-1">
              <span>
                {isClient ? "Freelancer" : "Client"}: {displayName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(contract.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-sm font-bold text-gray-900">{formatCurrency(contract.amount)}</p>
            <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </Link>
  );
}
