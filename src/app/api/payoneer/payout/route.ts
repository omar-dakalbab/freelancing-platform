import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayoneerPayout } from "@/lib/payoneer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
        { error: { code: "FORBIDDEN", message: "Only freelancers can request payouts" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "paymentId is required" } },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          include: {
            freelancerProfile: true,
            job: { select: { title: true } },
          },
        },
        payouts: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Payment not found" } },
        { status: 404 }
      );
    }

    if (payment.contract.freelancerProfile.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: "Payment must be completed before requesting a payout" } },
        { status: 422 }
      );
    }

    if (payment.contract.status !== "COMPLETED") {
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: "Contract must be completed before requesting a payout" } },
        { status: 422 }
      );
    }

    const existingPayout = payment.payouts.find(
      (p) => p.status === "COMPLETED" || p.status === "PROCESSING"
    );
    if (existingPayout) {
      return NextResponse.json(
        { error: { code: "ALREADY_EXISTS", message: "A payout is already in progress or completed for this payment" } },
        { status: 409 }
      );
    }

    const profile = payment.contract.freelancerProfile;
    if (!profile.payoneerEmail) {
      return NextResponse.json(
        { error: { code: "NOT_ONBOARDED", message: "Please add your Payoneer email in payout settings before requesting a payout" } },
        { status: 422 }
      );
    }

    const netAmount = payment.amount - payment.platformFee;

    const payout = await prisma.payout.create({
      data: {
        paymentId: payment.id,
        freelancerProfileId: profile.id,
        amount: netAmount,
        gateway: "PAYONEER",
        status: "PROCESSING",
      },
    });

    try {
      const result = await createPayoneerPayout({
        payeeEmail: profile.payoneerEmail,
        amount: netAmount,
        description: `Payout for: ${payment.contract.job.title}`,
        paymentId: payout.id,
      });

      const completedPayout = await prisma.payout.update({
        where: { id: payout.id },
        data: {
          payoneerPayoutId: result.payment_id,
          status: "COMPLETED",
        },
      });

      return NextResponse.json({
        data: completedPayout,
        message: "Payoneer payout initiated successfully",
      });
    } catch (payoneerError) {
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: "FAILED",
          failureReason: payoneerError instanceof Error ? payoneerError.message : "Payoneer payout failed",
        },
      });

      console.error("[POST /api/payoneer/payout] Payout failed:", payoneerError);
      return NextResponse.json(
        { error: { code: "TRANSFER_FAILED", message: "Payoneer payout failed. Please try again later." } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[POST /api/payoneer/payout]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
