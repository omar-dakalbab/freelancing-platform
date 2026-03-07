import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/freelancers/[id] — public freelancer profile
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            avatar: true,
            createdAt: true,
            suspended: true,
          },
        },
        skills: true,
        portfolioItems: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!profile || profile.user.suspended) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Freelancer not found" } },
        { status: 404 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: id },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            avatar: true,
            clientProfile: { select: { companyName: true } },
          },
        },
        contract: {
          select: { job: { select: { id: true, title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      data: {
        ...profile,
        reviews,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/freelancers/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch freelancer" } },
      { status: 500 }
    );
  }
}
