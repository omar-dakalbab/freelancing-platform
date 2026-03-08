import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateContractStatusSchema } from "@/lib/validations/contract";

type RouteParams = { params: Promise<{ id: string }> };

async function getContractWithAccess(contractId: string, userId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      job: { select: { id: true, title: true } },
      clientProfile: {
        include: { user: { select: { id: true, email: true, avatar: true } } },
      },
      freelancerProfile: {
        include: { user: { select: { id: true, email: true, avatar: true } } },
      },
      payments: { orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { order: "asc" } },
    },
  });

  if (!contract) return { contract: null, isClient: false, isFreelancer: false };

  const isClient = contract.clientProfile.userId === userId;
  const isFreelancer = contract.freelancerProfile.userId === userId;

  return { contract, isClient, isFreelancer };
}

// GET /api/contracts/[id]
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
    const { contract, isClient, isFreelancer } = await getContractWithAccess(id, session.user.id);

    if (!contract) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Contract not found" } },
        { status: 404 }
      );
    }

    if (!isClient && !isFreelancer && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: contract });
  } catch (error) {
    console.error("[GET /api/contracts/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch contract" } },
      { status: 500 }
    );
  }
}

// PATCH /api/contracts/[id] — update contract status with business rules
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
    const { contract, isClient, isFreelancer } = await getContractWithAccess(id, session.user.id);

    if (!contract) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Contract not found" } },
        { status: 404 }
      );
    }

    if (!isClient && !isFreelancer && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateContractStatusSchema.safeParse(body);

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

    const { status: newStatus } = parsed.data;
    const currentStatus = contract.status;

    // Business rules for status transitions
    const allowedTransitions: Record<string, { roles: string[]; from: string[] }> = {
      ACTIVE: { roles: ["FREELANCER"], from: ["PENDING"] },        // Freelancer accepts
      SUBMITTED: { roles: ["FREELANCER"], from: ["ACTIVE"] },      // Freelancer submits work
      COMPLETED: { roles: ["CLIENT"], from: ["SUBMITTED"] },       // Client approves
      CANCELLED: { roles: ["CLIENT", "FREELANCER"], from: ["PENDING", "ACTIVE"] }, // Either cancels
    };

    const rule = allowedTransitions[newStatus];
    if (!rule) {
      return NextResponse.json(
        { error: { code: "INVALID_TRANSITION", message: `Cannot transition to ${newStatus}` } },
        { status: 422 }
      );
    }

    const userRole = isClient ? "CLIENT" : "FREELANCER";

    if (!rule.roles.includes(userRole)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: `You cannot set status to ${newStatus}` } },
        { status: 403 }
      );
    }

    if (!rule.from.includes(currentStatus)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_TRANSITION",
            message: `Cannot transition from ${currentStatus} to ${newStatus}`,
          },
        },
        { status: 422 }
      );
    }

    // Freelancer cannot submit unless contract is funded (has a COMPLETED payment)
    if (newStatus === "SUBMITTED") {
      const completedPayment = contract.payments.find((p) => p.status === "COMPLETED");
      if (!completedPayment) {
        return NextResponse.json(
          {
            error: {
              code: "PAYMENT_REQUIRED",
              message: "Contract must be funded before work can be submitted",
            },
          },
          { status: 422 }
        );
      }
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: { status: newStatus },
      include: {
        job: { select: { id: true, title: true } },
        clientProfile: {
          include: { user: { select: { id: true, email: true, avatar: true } } },
        },
        freelancerProfile: {
          include: { user: { select: { id: true, email: true, avatar: true } } },
        },
        payments: { orderBy: { createdAt: "desc" } },
        milestones: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ data: updated, message: `Contract status updated to ${newStatus}` });
  } catch (error) {
    console.error("[PATCH /api/contracts/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update contract" } },
      { status: 500 }
    );
  }
}
