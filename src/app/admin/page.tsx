import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Star,
  TrendingUp,
  UserX,
  Activity,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const [
    totalUsers,
    clientCount,
    freelancerCount,
    suspendedCount,
    totalJobs,
    jobsByStatus,
    totalContracts,
    contractsByStatus,
    completedPayments,
    totalReviews,
    recentUsers,
    recentActions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "FREELANCER" } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.job.count(),
    prisma.job.groupBy({ by: ["status"], _count: true }),
    prisma.contract.count(),
    prisma.contract.groupBy({ by: ["status"], _count: true }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true, platformFee: true },
      _count: true,
    }),
    prisma.review.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        role: true,
        suspended: true,
        createdAt: true,
        avatar: true,
        clientProfile: { select: { companyName: true } },
        freelancerProfile: { select: { title: true } },
      },
    }),
    prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        admin: { select: { email: true } },
      },
    }),
  ]);

  const jobStatusMap = Object.fromEntries(jobsByStatus.map((j) => [j.status, j._count]));
  const contractStatusMap = Object.fromEntries(contractsByStatus.map((c) => [c.status, c._count]));

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      sub: `${clientCount} clients, ${freelancerCount} freelancers`,
      icon: Users,
      href: "/admin/users",
      color: "text-brand-800 bg-brand-50",
    },
    {
      title: "Total Jobs",
      value: totalJobs,
      sub: `${jobStatusMap["OPEN"] ?? 0} open, ${jobStatusMap["FILLED"] ?? 0} filled`,
      icon: Briefcase,
      href: "/admin/jobs",
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Total Contracts",
      value: totalContracts,
      sub: `${contractStatusMap["ACTIVE"] ?? 0} active, ${contractStatusMap["COMPLETED"] ?? 0} completed`,
      icon: FileText,
      href: "/admin/contracts",
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Platform Revenue",
      value: formatCurrency(completedPayments._sum.platformFee ?? 0),
      sub: `${formatCurrency(completedPayments._sum.amount ?? 0)} total volume`,
      icon: DollarSign,
      href: "/admin/payments",
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Total Reviews",
      value: totalReviews,
      sub: "Across all freelancers",
      icon: Star,
      href: "/admin/reviews",
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Suspended Users",
      value: suspendedCount,
      sub: "Flagged accounts",
      icon: UserX,
      href: "/admin/users",
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="mt-1 text-gray-500">Platform analytics and recent activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Signups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Signups</CardTitle>
            <Link href="/admin/users" className="text-xs text-brand-800 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    alt={user.email}
                    email={user.email}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.clientProfile?.companyName ||
                        user.freelancerProfile?.title ||
                        user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        user.role === "CLIENT"
                          ? "default"
                          : user.role === "FREELANCER"
                          ? "secondary"
                          : "warning"
                      }
                    >
                      {user.role}
                    </Badge>
                    {user.suspended && (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Admin Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Actions</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {recentActions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                No admin actions yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        action.action === "SUSPEND" || action.action === "REMOVE" || action.action === "DELETE"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {action.action[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{action.admin.email.split("@")[0]}</span>{" "}
                        <span className="text-gray-500">
                          {action.action.toLowerCase()}d{" "}
                          {action.targetType.toLowerCase()} {action.targetId.slice(0, 8)}...
                        </span>
                      </p>
                      {action.reason && (
                        <p className="text-xs text-gray-400 truncate">{action.reason}</p>
                      )}
                      <TimeAgo date={action.createdAt} className="text-xs text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract & Job status breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(["OPEN", "DRAFT", "FILLED", "CLOSED", "REMOVED"] as const).map((status) => {
                const count = jobStatusMap[status] ?? 0;
                const pct = totalJobs > 0 ? (count / totalJobs) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-20 shrink-0">{status}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contracts by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(["PENDING", "ACTIVE", "SUBMITTED", "COMPLETED", "CANCELLED"] as const).map((status) => {
                const count = contractStatusMap[status] ?? 0;
                const pct = totalContracts > 0 ? (count / totalContracts) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-24 shrink-0">{status}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
