import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeBadgeTier } from "@/lib/freelancer-badges";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const skill = searchParams.get("skill") || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    const where = {
      user: { suspended: false },
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { bio: { contains: search, mode: "insensitive" as const } },
                { user: { email: { contains: search, mode: "insensitive" as const } } },
              ],
            }
          : {},
        skill
          ? { skills: { some: { name: { equals: skill, mode: "insensitive" as const } } } }
          : {},
      ].filter((c) => Object.keys(c).length > 0),
    };

    const [freelancers, total] = await Promise.all([
      prisma.freelancerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, avatar: true } },
          skills: true,
          _count: {
            select: {
              contracts: { where: { status: "COMPLETED" } },
            },
          },
          contracts: {
            where: { status: "COMPLETED" },
            select: { amount: true },
          },
        },
      }),
      prisma.freelancerProfile.count({ where }),
    ]);

    // Get average ratings for each freelancer
    const reviews = await prisma.review.groupBy({
      by: ["revieweeId"],
      where: { revieweeId: { in: freelancers.map((f) => f.userId) } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingsMap = new Map(
      reviews.map((r) => [r.revieweeId, { avg: r._avg.rating ?? 0, count: r._count.rating }])
    );

    const data = freelancers.map((f) => {
      const rating = ratingsMap.get(f.userId) ?? { avg: 0, count: 0 };
      const totalEarnings = f.contracts.reduce((sum, c) => sum + c.amount, 0);
      const profileComplete = !!(f.title && f.bio && f.hourlyRate);

      const badgeTier = computeBadgeTier({
        completedContracts: f._count.contracts,
        totalEarnings,
        avgRating: rating.avg,
        reviewCount: rating.count,
        profileComplete,
        skillsCount: f.skills.length,
      });

      // Remove contracts array from response (only needed for earnings calc)
      const { contracts, ...rest } = f;

      return {
        ...rest,
        rating,
        badgeTier,
        totalEarnings,
      };
    });

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/freelancers]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch freelancers" } },
      { status: 500 }
    );
  }
}
