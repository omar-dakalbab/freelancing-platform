import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendPaymentReceivedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

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
        { error: { code: "FORBIDDEN", message: "Only clients can capture payments" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "orderId is required" } },
        { status: 400 }
      );
    }

    // Find the payment by PayPal order ID
    const payment = await prisma.payment.findUnique({
      where: { paypalOrderId: orderId },
      include: {
        contract: {
          include: {
            job: { select: { title: true } },
            freelancerProfile: {
              include: { user: { select: { email: true } } },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Payment not found for this order" } },
        { status: 404 }
      );
    }

    // Already captured — idempotent
    if (payment.status === "COMPLETED") {
      return NextResponse.json({ data: { status: "already_completed" } });
    }

    const captureResult = await capturePayPalOrder(orderId);

    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture || capture.status !== "COMPLETED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: { code: "CAPTURE_FAILED", message: "PayPal payment capture failed" } },
        { status: 422 }
      );
    }

    // Mark payment as completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paypalCaptureId: capture.id,
      },
    });

    // Notify freelancer
    try {
      await sendPaymentReceivedEmail({
        toEmail: payment.contract.freelancerProfile.user.email,
        jobTitle: payment.contract.job.title,
        contractId: payment.contract.id,
        amount: payment.amount,
        platformFee: payment.platformFee,
      });
    } catch (err) {
      console.error("[PayPal capture] Failed to send payment notification:", err);
    }

    console.log(`[PayPal capture] Payment ${payment.id} completed for contract ${payment.contractId}`);

    return NextResponse.json({ data: { status: "completed" } });
  } catch (error) {
    console.error("[POST /api/paypal/capture]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to capture PayPal payment" } },
      { status: 500 }
    );
  }
}
