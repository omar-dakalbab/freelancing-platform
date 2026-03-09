import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const PLATFORM_FEE_PERCENT = 0.10; // 10%

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
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

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only clients can fund contracts" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { contractId } = body;

    if (!contractId || typeof contractId !== "string") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "contractId is required" } },
        { status: 400 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        clientProfile: true,
        freelancerProfile: {
          include: { user: { select: { email: true } } },
        },
        job: { select: { title: true } },
        payments: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Contract not found" } },
        { status: 404 }
      );
    }

    // Verify the client owns this contract
    if (contract.clientProfile.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Must be ACTIVE status to fund
    if (contract.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATE",
            message: "Contract must be ACTIVE before funding. The freelancer must first accept.",
          },
        },
        { status: 422 }
      );
    }

    // Check if already paid
    const completedPayment = contract.payments.find((p) => p.status === "COMPLETED");
    if (completedPayment) {
      return NextResponse.json(
        { error: { code: "ALREADY_PAID", message: "This contract is already funded" } },
        { status: 409 }
      );
    }

    const amountInCents = Math.round(contract.amount * 100);
    const platformFee = contract.amount * PLATFORM_FEE_PERCENT;

    // Create a pending payment record first
    const payment = await prisma.payment.create({
      data: {
        contractId: contract.id,
        amount: contract.amount,
        platformFee,
        status: "PENDING",
      },
    });

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: `Contract: ${contract.job.title}`,
              description: `Payment to ${contract.freelancerProfile.user.email} · Platform fee: ${(PLATFORM_FEE_PERCENT * 100).toFixed(0)}%`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        contractId: contract.id,
        paymentId: payment.id,
      },
      success_url: `${appUrl}/dashboard/contracts/${contract.id}?payment=success`,
      cancel_url: `${appUrl}/dashboard/contracts/${contract.id}?payment=cancelled`,
    });

    // Store the session ID on the payment for webhook reconciliation
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ data: { url: checkoutSession.url } });
  } catch (error) {
    console.error("[POST /api/stripe/checkout]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create checkout session" } },
      { status: 500 }
    );
  }
}
