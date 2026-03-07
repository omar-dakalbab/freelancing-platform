import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateApplicationStatusSchema } from "@/lib/validations/application";
import { sendApplicationStatusEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            clientProfile: {
              include: {
                user: { select: { id: true, email: true, avatar: true } },
              },
            },
            skills: true,
            _count: { select: { applications: true } },
          },
        },
        freelancerProfile: {
          include: {
            user: { select: { id: true, email: true, avatar: true } },
            skills: true,
            portfolioItems: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Application not found" } },
        { status: 404 }
      );
    }

    // Check access: freelancer can see their own, client can see applications to their jobs
    const isFreelancer =
      session.user.role === "FREELANCER" &&
      application.freelancerProfile.user.id === session.user.id;
    const isJobOwner =
      session.user.role === "CLIENT" &&
      application.job.clientProfile.user.id === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isFreelancer && !isJobOwner && !isAdmin) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error("[GET /api/applications/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch application" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: { include: { clientProfile: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Application not found" } },
        { status: 404 }
      );
    }

    // Only the job owner can update application status
    if (
      application.job.clientProfile.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only the job owner can update application status" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateApplicationStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid status",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        job: {
          include: {
            clientProfile: {
              include: {
                user: { select: { id: true, email: true, avatar: true } },
              },
            },
            skills: true,
            _count: { select: { applications: true } },
          },
        },
        freelancerProfile: {
          include: {
            user: { select: { id: true, email: true, avatar: true } },
            skills: true,
          },
        },
        conversation: true,
      },
    });

    // Auto-create conversation when an application is HIRED or SHORTLISTED
    if (
      (parsed.data.status === "HIRED" || parsed.data.status === "SHORTLISTED") &&
      !updated.conversation
    ) {
      try {
        await prisma.conversation.create({
          data: { jobApplicationId: id },
        });
      } catch {
        // Conversation may already exist (race condition) — ignore
      }
    }

    // Notify the freelancer of the status change (SHORTLISTED, REJECTED, or HIRED)
    const newStatus = parsed.data.status;
    if (newStatus === "SHORTLISTED" || newStatus === "REJECTED" || newStatus === "HIRED") {
      sendApplicationStatusEmail({
        toEmail: updated.freelancerProfile.user.email,
        jobTitle: updated.job.title,
        status: newStatus,
      }).catch((err) => {
        console.error("[PATCH /api/applications/[id]] Failed to send status email:", err);
      });
    }

    return NextResponse.json({ data: updated, message: "Application status updated" });
  } catch (error) {
    console.error("[PATCH /api/applications/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update application" } },
      { status: 500 }
    );
  }
}
