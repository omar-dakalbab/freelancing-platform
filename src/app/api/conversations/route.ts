import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createConversationSchema } from "@/lib/validations/message";

// GET /api/conversations — list all conversations for the current user
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find conversations where the user is either the client or the freelancer on the application
    const conversations = await prisma.conversation.findMany({
      where: {
        jobApplication: {
          OR: [
            {
              job: {
                clientProfile: { userId },
              },
            },
            {
              freelancerProfile: { userId },
            },
          ],
        },
      },
      include: {
        jobApplication: {
          include: {
            job: {
              include: {
                clientProfile: {
                  include: {
                    user: { select: { id: true, email: true, avatar: true } },
                  },
                },
              },
            },
            freelancerProfile: {
              include: {
                user: { select: { id: true, email: true, avatar: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Attach unread count per conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            readAt: null,
            senderId: { not: userId },
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json({ data: conversationsWithUnread });
  } catch (error) {
    console.error("[GET /api/conversations]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch conversations" } },
      { status: 500 }
    );
  }
}

// POST /api/conversations — create a conversation for a job application
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createConversationSchema.safeParse(body);

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

    const { jobApplicationId } = parsed.data;

    // Fetch the application and verify access
    const application = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      include: {
        job: { include: { clientProfile: true } },
        freelancerProfile: true,
        conversation: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Application not found" } },
        { status: 404 }
      );
    }

    // Only the client who owns the job can initiate a conversation
    if (
      application.job.clientProfile.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only the job owner can start a conversation" } },
        { status: 403 }
      );
    }

    // Conversation already exists — return it
    if (application.conversation) {
      return NextResponse.json({ data: application.conversation });
    }

    const conversation = await prisma.conversation.create({
      data: { jobApplicationId },
      include: {
        jobApplication: {
          include: {
            job: {
              include: {
                clientProfile: {
                  include: {
                    user: { select: { id: true, email: true, avatar: true } },
                  },
                },
              },
            },
            freelancerProfile: {
              include: {
                user: { select: { id: true, email: true, avatar: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: conversation, message: "Conversation created" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create conversation" } },
      { status: 500 }
    );
  }
}
