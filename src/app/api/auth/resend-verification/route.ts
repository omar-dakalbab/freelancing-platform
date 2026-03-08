import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Reuse the same email-only schema
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid email address" } },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && !user.emailVerified) {
      // Invalidate existing verification tokens
      await prisma.emailVerification.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      sendVerificationEmail(user.email, token).catch((err) => {
        console.error("[POST /api/auth/resend-verification] Failed to send verification email:", err);
      });
    }

    return NextResponse.json({
      data: null,
      message: "If an account exists with this email and is not yet verified, a new verification link has been sent.",
    });
  } catch (error) {
    console.error("[POST /api/auth/resend-verification]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
