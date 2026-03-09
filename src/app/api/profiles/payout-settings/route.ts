import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
        { error: { code: "FORBIDDEN", message: "Only freelancers have payout settings" } },
        { status: 403 }
      );
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        stripeConnectOnboarded: true,
        stripeConnectAccountId: true,
        paypalEmail: true,
        payoneerEmail: true,
        preferredPayoutGateway: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Profile not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("[GET /api/profiles/payout-settings]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
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
        { error: { code: "FORBIDDEN", message: "Only freelancers have payout settings" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { paypalEmail, payoneerEmail, preferredPayoutGateway } = body;

    // Validate email formats if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (paypalEmail !== undefined && paypalEmail !== "" && !emailRegex.test(paypalEmail)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid PayPal email format" } },
        { status: 400 }
      );
    }
    if (payoneerEmail !== undefined && payoneerEmail !== "" && !emailRegex.test(payoneerEmail)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid Payoneer email format" } },
        { status: 400 }
      );
    }

    const validGateways = ["STRIPE", "PAYPAL", "PAYONEER"];
    if (preferredPayoutGateway && !validGateways.includes(preferredPayoutGateway)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid payout gateway" } },
        { status: 400 }
      );
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        stripeConnectOnboarded: true,
        paypalEmail: true,
        payoneerEmail: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Profile not found" } },
        { status: 404 }
      );
    }

    // Validate that the preferred gateway has credentials
    if (preferredPayoutGateway === "STRIPE" && !profile.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Please connect your Stripe account first" } },
        { status: 400 }
      );
    }
    if (preferredPayoutGateway === "PAYPAL" && !paypalEmail && !profile.paypalEmail) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Please add your PayPal email first" } },
        { status: 400 }
      );
    }
    if (preferredPayoutGateway === "PAYONEER" && !payoneerEmail && !profile.payoneerEmail) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Please add your Payoneer email first" } },
        { status: 400 }
      );
    }

    // Build update data — only update provided fields
    const updateData: Record<string, unknown> = {};
    if (paypalEmail !== undefined) updateData.paypalEmail = paypalEmail || null;
    if (payoneerEmail !== undefined) updateData.payoneerEmail = payoneerEmail || null;
    if (preferredPayoutGateway) updateData.preferredPayoutGateway = preferredPayoutGateway;

    const updated = await prisma.freelancerProfile.update({
      where: { id: profile.id },
      data: updateData,
      select: {
        stripeConnectOnboarded: true,
        stripeConnectAccountId: true,
        paypalEmail: true,
        payoneerEmail: true,
        preferredPayoutGateway: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/profiles/payout-settings]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
