import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: { code: "MISSING_TOKEN", message: "Verification token is required" } },
        { status: 400 }
      );
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, role: true, emailVerified: true } } },
    });

    if (!verification) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Invalid or expired verification link" } },
        { status: 400 }
      );
    }

    if (verification.usedAt) {
      return NextResponse.json(
        { data: null, message: "Email already verified. You can sign in." }
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: { code: "TOKEN_EXPIRED", message: "This verification link has expired. Please request a new one." } },
        { status: 400 }
      );
    }

    // Mark token as used and set emailVerified on user
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verification.user.id },
        data: { emailVerified: new Date() },
      }),
    ]);

    // Send welcome email now that the address is verified
    try {
      await sendWelcomeEmail(
        verification.user.email,
        verification.user.role as "CLIENT" | "FREELANCER"
      );
    } catch (err) {
      console.error("[GET /api/auth/verify-email] Failed to send welcome email:", err);
    }

    return NextResponse.json({
      data: null,
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("[GET /api/auth/verify-email]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
