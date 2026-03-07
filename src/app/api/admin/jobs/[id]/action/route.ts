import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminJobActionSchema } from "@/lib/validations/admin";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/admin/jobs/[id]/action — remove or restore a job
export async function POST(req: NextRequest, { params }: RouteParams) {
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
    const body = await req.json();
    const parsed = adminJobActionSchema.safeParse(body);

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

    const { action, reason } = parsed.data;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    const newStatus = action === "REMOVE" ? "REMOVED" : "OPEN";

    const [updatedJob] = await prisma.$transaction([
      prisma.job.update({
        where: { id },
        data: { status: newStatus },
        select: { id: true, title: true, status: true },
      }),
      prisma.adminAction.create({
        data: {
          adminId: session.user.id,
          targetType: "JOB",
          targetId: id,
          action,
          reason,
        },
      }),
    ]);

    return NextResponse.json({
      data: updatedJob,
      message: `Job ${action === "REMOVE" ? "removed" : "restored"} successfully`,
    });
  } catch (error) {
    console.error("[POST /api/admin/jobs/[id]/action]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to perform action" } },
      { status: 500 }
    );
  }
}
