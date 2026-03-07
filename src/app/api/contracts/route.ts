import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createContractSchema } from "@/lib/validations/contract";
import { sendContractCreatedEmail } from "@/lib/email";

// GET /api/contracts — list contracts for the current user
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role;

    const contracts = await prisma.contract.findMany({
      where:
        role === "CLIENT"
          ? { clientProfile: { userId } }
          : role === "FREELANCER"
          ? { freelancerProfile: { userId } }
          : {},
      include: {
        job: { select: { id: true, title: true } },
        clientProfile: {
          include: { user: { select: { id: true, email: true, avatar: true } } },
        },
        freelancerProfile: {
          include: { user: { select: { id: true, email: true, avatar: true } } },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: contracts });
  } catch (error) {
    console.error("[GET /api/contracts]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch contracts" } },
      { status: 500 }
    );
  }
}

// POST /api/contracts — client creates a contract
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
        { error: { code: "FORBIDDEN", message: "Only clients can create contracts" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createContractSchema.safeParse(body);

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

    const { jobId, freelancerProfileId, amount, description } = parsed.data;

    // Verify the client owns this job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { clientProfile: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    if (job.clientProfile.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You don't own this job" } },
        { status: 403 }
      );
    }

    // Verify the freelancer was hired for this job
    const application = await prisma.jobApplication.findUnique({
      where: {
        jobId_freelancerProfileId: {
          jobId,
          freelancerProfileId,
        },
      },
    });

    if (!application || application.status !== "HIRED") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATE",
            message: "Freelancer must be hired before creating a contract",
          },
        },
        { status: 422 }
      );
    }

    // Check there's no active/pending contract already for this job+freelancer
    const existingContract = await prisma.contract.findFirst({
      where: {
        jobId,
        freelancerProfileId,
        status: { in: ["PENDING", "ACTIVE", "SUBMITTED"] },
      },
    });

    if (existingContract) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: "An active contract already exists for this job and freelancer",
          },
        },
        { status: 409 }
      );
    }

    const contract = await prisma.contract.create({
      data: {
        jobId,
        clientProfileId: job.clientProfileId,
        freelancerProfileId,
        amount,
        description,
      },
      include: {
        job: { select: { id: true, title: true } },
        clientProfile: {
          include: { user: { select: { id: true, email: true, avatar: true } } },
        },
        freelancerProfile: {
          include: { user: { select: { id: true, email: true, avatar: true } } },
        },
        payments: true,
      },
    });

    // Notify the freelancer that a contract has been created for them
    sendContractCreatedEmail({
      toEmail: contract.freelancerProfile.user.email,
      jobTitle: contract.job.title,
      contractId: contract.id,
      amount: contract.amount,
      description: contract.description || undefined,
    }).catch((err) => {
      console.error("[POST /api/contracts] Failed to send contract notification:", err);
    });

    return NextResponse.json(
      { data: contract, message: "Contract created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/contracts]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create contract" } },
      { status: 500 }
    );
  }
}
