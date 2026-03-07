import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/analytics — overview stats for admin dashboard
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      clientCount,
      freelancerCount,
      suspendedCount,
      totalJobs,
      jobsByStatus,
      totalContracts,
      contractsByStatus,
      totalPayments,
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
      prisma.payment.aggregate({ _sum: { amount: true, platformFee: true }, _count: true }),
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
        },
      }),
      prisma.adminAction.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          admin: { select: { id: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        users: {
          total: totalUsers,
          clients: clientCount,
          freelancers: freelancerCount,
          suspended: suspendedCount,
        },
        jobs: {
          total: totalJobs,
          byStatus: Object.fromEntries(jobsByStatus.map((j) => [j.status, j._count])),
        },
        contracts: {
          total: totalContracts,
          byStatus: Object.fromEntries(contractsByStatus.map((c) => [c.status, c._count])),
        },
        payments: {
          totalVolume: totalPayments._sum.amount ?? 0,
          totalFees: totalPayments._sum.platformFee ?? 0,
          count: totalPayments._count,
          completedVolume: completedPayments._sum.amount ?? 0,
          completedFees: completedPayments._sum.platformFee ?? 0,
          completedCount: completedPayments._count,
        },
        reviews: {
          total: totalReviews,
        },
        recentUsers,
        recentActions,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch analytics" } },
      { status: 500 }
    );
  }
}
