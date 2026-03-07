import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReviewSchema } from "@/lib/validations/review";
import { sendReviewReceivedEmail } from "@/lib/email";

// GET /api/reviews?freelancerId=X — get reviews for a freelancer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const freelancerUserId = searchParams.get("freelancerId");

    if (!freelancerUserId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "freelancerId is required" } },
        { status: 400 }
      );
    }

    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerUserId },
    });

    if (!freelancerProfile) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Freelancer not found" } },
        { status: 404 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: freelancerUserId },
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
          select: {
            job: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      data: reviews,
      meta: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/reviews]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch reviews" } },
      { status: 500 }
    );
  }
}

// POST /api/reviews — client leaves a review after contract is COMPLETED
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only clients can leave reviews" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { contractId, rating, comment } = parsed.data;

    // Verify the contract exists and the client owns it
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        clientProfile: { select: { userId: true } },
        freelancerProfile: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Contract not found" } },
        { status: 404 }
      );
    }

    if (contract.clientProfile.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You can only review your own contracts" } },
        { status: 403 }
      );
    }

    if (contract.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATE",
            message: "You can only review completed contracts",
          },
        },
        { status: 422 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        contractId_reviewerId: {
          contractId,
          reviewerId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "You have already reviewed this contract" } },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        contractId,
        reviewerId: session.user.id,
        revieweeId: contract.freelancerProfile.userId,
        rating,
        comment,
      },
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
          select: {
            job: { select: { id: true, title: true } },
          },
        },
      },
    });

    // Notify the freelancer that they received a review (fire-and-forget)
    sendReviewReceivedEmail({
      toEmail: contract.freelancerProfile.user.email,
      jobTitle: review.contract.job.title,
      reviewerEmail: review.reviewer.email,
      reviewerCompany: review.reviewer.clientProfile?.companyName,
      rating: review.rating,
      comment: review.comment,
    }).catch((err) => {
      console.error("[POST /api/reviews] Failed to send review notification:", err);
    });

    return NextResponse.json(
      { data: review, message: "Review submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reviews]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to submit review" } },
      { status: 500 }
    );
  }
}
