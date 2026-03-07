import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioItemSchema } from "@/lib/validations/profile";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = portfolioItemSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input" } },
        { status: 400 }
      );
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
    });

    const item = await prisma.portfolioItem.findUnique({ where: { id } });

    if (!item || !profile || item.freelancerProfileId !== profile.id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Portfolio item not found" } },
        { status: 404 }
      );
    }

    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: updated, message: "Portfolio item updated" });
  } catch (error) {
    console.error("[PATCH /api/profiles/freelancer/portfolio/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update portfolio item" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
    });

    const item = await prisma.portfolioItem.findUnique({ where: { id } });

    if (!item || !profile || item.freelancerProfileId !== profile.id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Portfolio item not found" } },
        { status: 404 }
      );
    }

    await prisma.portfolioItem.delete({ where: { id } });

    return NextResponse.json({ data: null, message: "Portfolio item deleted" });
  } catch (error) {
    console.error("[DELETE /api/profiles/freelancer/portfolio/[id]]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete portfolio item" } },
      { status: 500 }
    );
  }
}
