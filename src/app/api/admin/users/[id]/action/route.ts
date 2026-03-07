import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminUserActionSchema } from "@/lib/validations/admin";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/admin/users/[id]/action — suspend or activate a user
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = adminUserActionSchema.safeParse(body);

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

    const { action, reason } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Prevent admins from suspending themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You cannot perform actions on your own account" } },
        { status: 403 }
      );
    }

    const suspended = action === "SUSPEND";

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { suspended },
        select: { id: true, email: true, role: true, suspended: true },
      }),
      prisma.adminAction.create({
        data: {
          adminId: session.user.id,
          targetType: "USER",
          targetId: id,
          action,
          reason,
        },
      }),
    ]);

    return NextResponse.json({
      data: updatedUser,
      message: `User ${suspended ? "suspended" : "activated"} successfully`,
    });
  } catch (error) {
    console.error("[POST /api/admin/users/[id]/action]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to perform action" } },
      { status: 500 }
    );
  }
}
