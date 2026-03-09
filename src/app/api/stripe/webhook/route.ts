import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendPaymentReceivedEmail } from "@/lib/email";

// Stripe requires the raw body to verify signatures
export const dynamic = "force-dynamic";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Missing stripe-signature header" } },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[Stripe webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: { code: "WEBHOOK_ERROR", message: "Invalid signature" } },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { paymentId, contractId } = session.metadata || {};

        if (!paymentId || !contractId) {
          console.error("[Stripe webhook] Missing metadata on session:", session.id);
          break;
        }

        // Mark payment as COMPLETED
        const completedPayment = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent as string,
          },
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

        // Notify the freelancer that payment has been funded
        try {
          await sendPaymentReceivedEmail({
            toEmail: completedPayment.contract.freelancerProfile.user.email,
            jobTitle: completedPayment.contract.job.title,
            contractId,
            amount: completedPayment.amount,
            platformFee: completedPayment.platformFee,
          });
        } catch (err) {
          console.error("[Stripe webhook] Failed to send payment notification:", err);
        }

        console.log(`[Stripe webhook] Payment ${paymentId} completed for contract ${contractId}`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { paymentId } = session.metadata || {};

        if (paymentId) {
          await prisma.payment.update({
            where: { id: paymentId },
            data: { status: "FAILED" },
          });
          console.log(`[Stripe webhook] Payment ${paymentId} expired/failed`);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const chargesEnabled = account.charges_enabled ?? false;
        const payoutsEnabled = account.payouts_enabled ?? false;

        if (account.id) {
          const profile = await prisma.freelancerProfile.findUnique({
            where: { stripeConnectAccountId: account.id },
          });

          if (profile) {
            await prisma.freelancerProfile.update({
              where: { id: profile.id },
              data: {
                stripeConnectOnboarded: chargesEnabled && payoutsEnabled,
                ...(chargesEnabled && payoutsEnabled && !profile.stripeConnectOnboardedAt
                  ? { stripeConnectOnboardedAt: new Date() }
                  : {}),
              },
            });
            console.log(`[Stripe webhook] Connect account ${account.id} updated: charges=${chargesEnabled}, payouts=${payoutsEnabled}`);
          }
        }
        break;
      }

      default:
        console.log(`[Stripe webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe webhook] Handler error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Webhook handler failed" } },
      { status: 500 }
    );
  }
}
