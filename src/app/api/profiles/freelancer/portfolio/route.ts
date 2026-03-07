import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioItemSchema } from "@/lib/validations/profile";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = portfolioItemSchema.safeParse(body);

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

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Profile not found" } },
        { status: 404 }
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        ...parsed.data,
        url: parsed.data.url || null,
        freelancerProfileId: profile.id,
      },
    });

    return NextResponse.json({ data: item, message: "Portfolio item added" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/profiles/freelancer/portfolio]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to add portfolio item" } },
      { status: 500 }
    );
  }
}
