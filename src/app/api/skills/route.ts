import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const skills = await prisma.skill.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : {},
      orderBy: { name: "asc" },
      take: 30,
    });

    return NextResponse.json({ data: skills });
  } catch (error) {
    console.error("[GET /api/skills]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch skills" } },
      { status: 500 }
    );
  }
}
