import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createApplicationSchema } from "@/lib/validations/application";
import { sendApplicationReceivedEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    let where = {};

    if (session.user.role === "CLIENT") {
      // Client sees applications for their jobs
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!clientProfile) {
        return NextResponse.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }
      where = {
        job: { clientProfileId: clientProfile.id },
        ...(jobId ? { jobId } : {}),
      };
    } else if (session.user.role === "FREELANCER") {
      // Freelancer sees their own applications
      const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!freelancerProfile) {
        return NextResponse.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }
      where = { freelancerProfileId: freelancerProfile.id };
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return NextResponse.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch applications" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only freelancers can apply to jobs" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createApplicationSchema.safeParse(body);

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

    const { jobId, proposalText, bidAmount } = parsed.data;

    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!freelancerProfile) {
      return NextResponse.json(
        { error: { code: "PROFILE_NOT_FOUND", message: "Freelancer profile not found" } },
        { status: 404 }
      );
    }

    // Verify job exists and is open
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }
    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: { code: "JOB_CLOSED", message: "This job is no longer accepting applications" } },
        { status: 400 }
      );
    }

    // Check for existing application (unique constraint)
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_freelancerProfileId: {
          jobId,
          freelancerProfileId: freelancerProfile.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: "ALREADY_APPLIED", message: "You have already applied to this job" } },
        { status: 409 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        freelancerProfileId: freelancerProfile.id,
        proposalText,
        bidAmount,
      },
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
      },
    });

    // Notify the client that a new application has arrived
    const clientEmail = application.job.clientProfile.user.email;
    try {
      await sendApplicationReceivedEmail({
        toEmail: clientEmail,
        jobTitle: application.job.title,
        jobId: application.job.id,
        freelancerEmail: application.freelancerProfile.user.email,
        bidAmount: application.bidAmount,
      });
    } catch (err) {
      console.error("[POST /api/applications] Failed to send application notification:", err);
    }

    return NextResponse.json(
      { data: application, message: "Application submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/applications]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to submit application" } },
      { status: 500 }
    );
  }
}
