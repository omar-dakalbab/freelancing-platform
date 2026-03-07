import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { freelancerProfileSchema } from "@/lib/validations/profile";
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

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
        skills: true,
        portfolioItems: { orderBy: { createdAt: "desc" } },
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
    console.error("[GET /api/profiles/freelancer]", error);
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

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = freelancerProfileSchema.safeParse(body);

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

    const { skills, ...profileData } = parsed.data;

    const completion = calculateProfileCompletion({
      title: profileData.title,
      bio: profileData.bio,
      hourlyRate: profileData.hourlyRate,
      skills: skills.length > 0 ? skills : null,
    });

    // Upsert all skills
    const skillRecords = await Promise.all(
      skills.map((name) =>
        prisma.skill.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    const profile = await prisma.freelancerProfile.update({
      where: { userId: session.user.id },
      data: {
        ...profileData,
        completionStatus: completion,
        skills: {
          set: skillRecords.map((s) => ({ id: s.id })),
        },
      },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
        skills: true,
        portfolioItems: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ data: profile, message: "Profile updated successfully" });
  } catch (error) {
    console.error("[PATCH /api/profiles/freelancer]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}
