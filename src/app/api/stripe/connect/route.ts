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

// POST — Create or resume Stripe Connect Express onboarding
export async function POST(_req: NextRequest) {
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
        { error: { code: "FORBIDDEN", message: "Only freelancers can connect payout accounts" } },
        { status: 403 }
      );
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { email: true } } },
    });

    if (!profile) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Freelancer profile not found" } },
        { status: 404 }
      );
    }

    if (profile.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: { code: "ALREADY_ONBOARDED", message: "Your payout account is already connected" } },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let accountId = profile.stripeConnectAccountId;

    // Create a new Express account if none exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: profile.user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      await prisma.freelancerProfile.update({
        where: { id: profile.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    // Create an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/payments?connect=refresh`,
      return_url: `${appUrl}/dashboard/payments?connect=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ data: { url: accountLink.url } });
  } catch (error) {
    console.error("[POST /api/stripe/connect]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create onboarding link" } },
      { status: 500 }
    );
  }
}
