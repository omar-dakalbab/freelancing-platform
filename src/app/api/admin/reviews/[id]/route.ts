import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminReviewActionSchema } from "@/lib/validations/admin";

type RouteParams = { params: Promise<{ id: string }> };

// DELETE /api/admin/reviews/[id] — admin deletes a review
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = adminReviewActionSchema.safeParse({ action: "DELETE", ...body });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Reason is required",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { reason } = parsed.data;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Review not found" } },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.review.delete({ where: { id } }),
      prisma.adminAction.create({
        data: {
          adminId: session.user.id,
          targetType: "REVIEW",
          targetId: id,
          action: "DELETE",
          reason,
        },
      }),
    ]);

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/reviews/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete review" } },
      { status: 500 }
    );
  }
}
