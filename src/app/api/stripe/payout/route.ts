import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

// POST — Request a payout for a completed payment
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

    // Verify the payment belongs to this freelancer and is eligible
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          include: {
            freelancerProfile: true,
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

    // Check if payout already exists
    const existingPayout = payment.payouts.find(
      (p) => p.status === "COMPLETED" || p.status === "PROCESSING"
    );
    if (existingPayout) {
      return NextResponse.json(
        { error: { code: "ALREADY_EXISTS", message: "A payout is already in progress or completed for this payment" } },
        { status: 409 }
      );
    }

    // Verify freelancer has completed Stripe Connect onboarding
    const profile = payment.contract.freelancerProfile;
    if (!profile.stripeConnectOnboarded || !profile.stripeConnectAccountId) {
      return NextResponse.json(
        { error: { code: "NOT_ONBOARDED", message: "Please connect your bank account before requesting a payout" } },
        { status: 422 }
      );
    }

    const netAmount = payment.amount - payment.platformFee;
    const amountInCents = Math.round(netAmount * 100);

    // Create a payout record
    const payout = await prisma.payout.create({
      data: {
        paymentId: payment.id,
        freelancerProfileId: profile.id,
        amount: netAmount,
        status: "PROCESSING",
      },
    });

    try {
      const stripe = getStripe();
      const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: "usd",
        destination: profile.stripeConnectAccountId,
        transfer_group: payment.contractId,
        metadata: {
          paymentId: payment.id,
          payoutId: payout.id,
          contractId: payment.contractId,
        },
      });

      // Mark payout as completed
      const completedPayout = await prisma.payout.update({
        where: { id: payout.id },
        data: {
          stripeTransferId: transfer.id,
          status: "COMPLETED",
        },
      });

      return NextResponse.json({
        data: completedPayout,
        message: "Payout initiated successfully",
      });
    } catch (stripeError) {
      // Mark payout as failed
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: "FAILED",
          failureReason: stripeError instanceof Error ? stripeError.message : "Transfer failed",
        },
      });

      console.error("[POST /api/stripe/payout] Transfer failed:", stripeError);
      return NextResponse.json(
        { error: { code: "TRANSFER_FAILED", message: "Payout transfer failed. Please try again later." } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[POST /api/stripe/payout]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

// GET — List payouts for the authenticated freelancer
export async function GET() {
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
        { error: { code: "FORBIDDEN", message: "Only freelancers have payouts" } },
        { status: 403 }
      );
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ data: [] });
    }

    const payouts = await prisma.payout.findMany({
      where: { freelancerProfileId: profile.id },
      include: {
        payment: {
          include: {
            contract: {
              include: {
                job: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: payouts });
  } catch (error) {
    console.error("[GET /api/stripe/payout]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
