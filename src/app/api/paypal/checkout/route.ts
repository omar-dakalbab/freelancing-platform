import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

const PLATFORM_FEE_PERCENT = 0.10;

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

    if (contract.clientProfile.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

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

    const completedPayment = contract.payments.find((p) => p.status === "COMPLETED");
    if (completedPayment) {
      return NextResponse.json(
        { error: { code: "ALREADY_PAID", message: "This contract is already funded" } },
        { status: 409 }
      );
    }

    const platformFee = contract.amount * PLATFORM_FEE_PERCENT;

    const payment = await prisma.payment.create({
      data: {
        contractId: contract.id,
        amount: contract.amount,
        platformFee,
        gateway: "PAYPAL",
        status: "PENDING",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const order = await createPayPalOrder({
      amount: contract.amount,
      description: `Contract: ${contract.job.title}`,
      customId: JSON.stringify({ paymentId: payment.id, contractId: contract.id }),
      returnUrl: `${appUrl}/dashboard/contracts/${contract.id}?payment=success&gateway=paypal`,
      cancelUrl: `${appUrl}/dashboard/contracts/${contract.id}?payment=cancelled`,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { paypalOrderId: order.id },
    });

    // Find the approval URL
    const approveLink = order.links.find((l) => l.rel === "payer-action");
    if (!approveLink) {
      throw new Error("PayPal order created but no approval URL found");
    }

    return NextResponse.json({ data: { url: approveLink.href, orderId: order.id } });
  } catch (error) {
    console.error("[POST /api/paypal/checkout]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create PayPal checkout" } },
      { status: 500 }
    );
  }
}
