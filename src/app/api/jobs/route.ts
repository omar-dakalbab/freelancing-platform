import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createJobSchema, jobFilterSchema } from "@/lib/validations/job";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawFilters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      skills: searchParams.getAll("skills"),
      budgetMin: searchParams.get("budgetMin") ? Number(searchParams.get("budgetMin")) : undefined,
      budgetMax: searchParams.get("budgetMax") ? Number(searchParams.get("budgetMax")) : undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
    };

    const parsed = jobFilterSchema.safeParse(rawFilters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid filters" } },
        { status: 400 }
      );
    }

    const { search, category, skills, budgetMin, budgetMax, status, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        // Default to OPEN jobs unless status is specified
        { status: status ?? "OPEN" },
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        category ? { category } : {},
        skills && skills.length > 0
          ? { skills: { some: { name: { in: skills } } } }
          : {},
        budgetMin !== undefined ? { budgetMax: { gte: budgetMin } } : {},
        budgetMax !== undefined ? { budgetMin: { lte: budgetMax } } : {},
      ].filter((c) => Object.keys(c).length > 0),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          clientProfile: {
            include: {
              user: {
                select: { id: true, email: true, avatar: true },
              },
            },
          },
          skills: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch jobs" } },
      { status: 500 }
    );
  }
}

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
        { error: { code: "FORBIDDEN", message: "Only clients can post jobs" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createJobSchema.safeParse(body);

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

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: { code: "PROFILE_NOT_FOUND", message: "Client profile not found" } },
        { status: 404 }
      );
    }

    const { skills, ...jobData } = parsed.data;

    // Ensure skills exist (upsert)
    const skillRecords = await Promise.all(
      skills.map((name) =>
        prisma.skill.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    const job = await prisma.job.create({
      data: {
        ...jobData,
        clientProfileId: clientProfile.id,
        skills: {
          connect: skillRecords.map((s) => ({ id: s.id })),
        },
      },
      include: {
        skills: true,
        clientProfile: {
          include: {
            user: { select: { id: true, email: true, avatar: true } },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ data: job, message: "Job posted successfully" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/jobs]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create job" } },
      { status: 500 }
    );
  }
}
