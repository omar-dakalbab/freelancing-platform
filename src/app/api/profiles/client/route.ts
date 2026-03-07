import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientProfileSchema } from "@/lib/validations/profile";
import { calculateProfileCompletion } from "@/lib/utils";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const profile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
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
    console.error("[GET /api/profiles/client]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = clientProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const completion = calculateProfileCompletion({
      companyName: data.companyName,
      companyDescription: data.companyDescription,
      website: data.website,
      industry: data.industry,
    });

    const profile = await prisma.clientProfile.update({
      where: { userId: session.user.id },
      data: {
        ...data,
        website: data.website || null,
        completionStatus: completion,
      },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
      },
    });

    return NextResponse.json({ data: profile, message: "Profile updated successfully" });
  } catch (error) {
    console.error("[PATCH /api/profiles/client]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}
