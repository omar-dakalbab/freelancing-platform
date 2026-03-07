import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateJobSchema } from "@/lib/validations/job";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        clientProfile: {
          include: {
            user: { select: { id: true, email: true, avatar: true } },
          },
        },
        skills: true,
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: job });
  } catch (error) {
    console.error("[GET /api/jobs/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch job" } },
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

    const job = await prisma.job.findUnique({
      where: { id },
      include: { clientProfile: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    if (job.clientProfile.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You don't have permission to edit this job" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateJobSchema.safeParse(body);

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

    const { skills, ...updateData } = parsed.data;

    let skillConnect = undefined;
    if (skills) {
      const skillRecords = await Promise.all(
        skills.map((name) =>
          prisma.skill.upsert({
            where: { name },
            update: {},
            create: { name },
          })
        )
      );
      skillConnect = { set: skillRecords.map((s) => ({ id: s.id })) };
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        ...updateData,
        ...(skillConnect ? { skills: skillConnect } : {}),
      },
      include: {
        skills: true,
        clientProfile: {
          include: {
            user: { select: { id: true, email: true, avatar: true } },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ data: updated, message: "Job updated successfully" });
  } catch (error) {
    console.error("[PATCH /api/jobs/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update job" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: { clientProfile: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    if (job.clientProfile.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You don't have permission to delete this job" } },
        { status: 403 }
      );
    }

    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ data: null, message: "Job deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/jobs/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete job" } },
      { status: 500 }
    );
  }
}
