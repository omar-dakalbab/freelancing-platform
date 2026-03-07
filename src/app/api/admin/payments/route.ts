import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments — list all payments
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    const where = status
      ? { status: status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" }
      : {};

    const [payments, total, totals] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contract: {
            include: {
              job: { select: { id: true, title: true } },
              clientProfile: {
                include: { user: { select: { id: true, email: true } } },
              },
              freelancerProfile: {
                include: { user: { select: { id: true, email: true } } },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true, platformFee: true },
      }),
    ]);

    return NextResponse.json({
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      totals: {
        completedVolume: totals._sum.amount ?? 0,
        completedFees: totals._sum.platformFee ?? 0,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/payments]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch payments" } },
      { status: 500 }
    );
  }
}
