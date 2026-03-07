import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/contracts — list all contracts
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
      ? { status: status as "PENDING" | "ACTIVE" | "SUBMITTED" | "COMPLETED" | "CANCELLED" }
      : {};

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          job: { select: { id: true, title: true } },
          clientProfile: {
            include: { user: { select: { id: true, email: true } } },
          },
          freelancerProfile: {
            include: { user: { select: { id: true, email: true } } },
          },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      data: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/contracts]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch contracts" } },
      { status: 500 }
    );
  }
}
