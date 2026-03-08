import { NextResponse } from "next/server";
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

// GET — Check freelancer's Stripe Connect status
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
        { error: { code: "FORBIDDEN", message: "Only freelancers have payout accounts" } },
        { status: 403 }
      );
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
      },
    });

    if (!profile || !profile.stripeConnectAccountId) {
      return NextResponse.json({
        data: { connected: false, chargesEnabled: false, payoutsEnabled: false, onboarded: false },
      });
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(profile.stripeConnectAccountId);

    const chargesEnabled = account.charges_enabled ?? false;
    const payoutsEnabled = account.payouts_enabled ?? false;

    // Auto-update onboarded status if Stripe confirms capabilities
    if (chargesEnabled && payoutsEnabled && !profile.stripeConnectOnboarded) {
      await prisma.freelancerProfile.update({
        where: { userId: session.user.id },
        data: {
          stripeConnectOnboarded: true,
          stripeConnectOnboardedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      data: {
        connected: true,
        chargesEnabled,
        payoutsEnabled,
        onboarded: chargesEnabled && payoutsEnabled,
      },
    });
  } catch (error) {
    console.error("[GET /api/stripe/connect/status]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to check connect status" } },
      { status: 500 }
    );
  }
}
