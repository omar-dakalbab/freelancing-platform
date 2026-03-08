import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateMilestoneStatusSchema } from "@/lib/validations/contract";

type RouteParams = { params: Promise<{ id: string; milestoneId: string }> };

// PATCH /api/contracts/[id]/milestones/[milestoneId] — update milestone status
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: contractId, milestoneId } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        clientProfile: true,
        freelancerProfile: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Contract not found" } },
        { status: 404 }
      );
    }

    const isClient = contract.clientProfile.userId === session.user.id;
    const isFreelancer = contract.freelancerProfile.userId === session.user.id;

    if (!isClient && !isFreelancer && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    if (contract.status !== "ACTIVE") {
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: "Contract must be active to update milestones" } },
        { status: 422 }
      );
    }

    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, contractId },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Milestone not found" } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateMilestoneStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid status", details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { status: newStatus } = parsed.data;
    const currentStatus = milestone.status;

    // Transition rules
    const transitions: Record<string, { roles: string[]; from: string[] }> = {
      IN_PROGRESS: { roles: ["FREELANCER"], from: ["PENDING"] },
      SUBMITTED: { roles: ["FREELANCER"], from: ["IN_PROGRESS"] },
      APPROVED: { roles: ["CLIENT"], from: ["SUBMITTED"] },
    };

    const rule = transitions[newStatus];
    if (!rule) {
      return NextResponse.json(
        { error: { code: "INVALID_TRANSITION", message: `Cannot transition to ${newStatus}` } },
        { status: 422 }
      );
    }

    const userRole = isClient ? "CLIENT" : "FREELANCER";
    if (!rule.roles.includes(userRole)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: `You cannot set milestone status to ${newStatus}` } },
        { status: 403 }
      );
    }

    if (!rule.from.includes(currentStatus)) {
      return NextResponse.json(
        { error: { code: "INVALID_TRANSITION", message: `Cannot transition from ${currentStatus} to ${newStatus}` } },
        { status: 422 }
      );
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: newStatus },
    });

    return NextResponse.json({ data: updated, message: `Milestone status updated to ${newStatus}` });
  } catch (error) {
    console.error("[PATCH /api/contracts/[id]/milestones/[milestoneId]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update milestone" } },
      { status: 500 }
    );
  }
}
