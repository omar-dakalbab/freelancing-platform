import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal";
import { sendPaymentReceivedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("[PayPal webhook] PAYPAL_WEBHOOK_ID not configured");
    return NextResponse.json(
      { error: { code: "CONFIG_ERROR", message: "Webhook not configured" } },
      { status: 500 }
    );
  }

  // Collect verification headers
  const headers: Record<string, string> = {};
  for (const key of [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ]) {
    const value = req.headers.get(key);
    if (value) headers[key] = value;
  }

  const verified = await verifyPayPalWebhook(webhookId, headers, body);
  if (!verified) {
    console.error("[PayPal webhook] Signature verification failed");
    return NextResponse.json(
      { error: { code: "WEBHOOK_ERROR", message: "Invalid signature" } },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(body);
    const eventType = event.event_type as string;

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const capture = event.resource;
        const customId = capture?.custom_id;
        if (!customId) break;

        let meta: { paymentId?: string; contractId?: string };
        try {
          meta = JSON.parse(customId);
        } catch {
          break;
        }

        if (!meta.paymentId) break;

        // Idempotent — only update if still PENDING
        const payment = await prisma.payment.findUnique({
          where: { id: meta.paymentId },
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

        if (payment && payment.status !== "COMPLETED") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "COMPLETED",
              paypalCaptureId: capture.id,
            },
          });

          try {
            await sendPaymentReceivedEmail({
              toEmail: payment.contract.freelancerProfile.user.email,
              jobTitle: payment.contract.job.title,
              contractId: payment.contractId,
              amount: payment.amount,
              platformFee: payment.platformFee,
            });
          } catch (err) {
            console.error("[PayPal webhook] Failed to send email:", err);
          }
        }
        break;
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED": {
        const capture = event.resource;
        const customId = capture?.custom_id;
        if (!customId) break;

        let meta: { paymentId?: string };
        try {
          meta = JSON.parse(customId);
        } catch {
          break;
        }

        if (meta.paymentId) {
          const newStatus = eventType === "PAYMENT.CAPTURE.REFUNDED" ? "REFUNDED" : "FAILED";
          await prisma.payment.update({
            where: { id: meta.paymentId },
            data: { status: newStatus },
          });
        }
        break;
      }

      default:
        console.log(`[PayPal webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PayPal webhook] Handler error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Webhook handler failed" } },
      { status: 500 }
    );
  }
}
