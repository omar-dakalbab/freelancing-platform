import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/lib/validations/message";

type RouteParams = { params: Promise<{ id: string }> };

async function getConversationAndVerifyAccess(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      jobApplication: {
        include: {
          job: { include: { clientProfile: true } },
          freelancerProfile: true,
        },
      },
    },
  });

  if (!conversation) return { conversation: null, hasAccess: false };

  const isClient = conversation.jobApplication.job.clientProfile.userId === userId;
  const isFreelancer = conversation.jobApplication.freelancerProfile.userId === userId;

  return { conversation, hasAccess: isClient || isFreelancer };
}

// GET /api/conversations/[id]/messages — fetch all messages & mark as read
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { conversation, hasAccess } = await getConversationAndVerifyAccess(id, session.user.id);

    if (!conversation) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Conversation not found" } },
        { status: 404 }
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Mark messages from the other party as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: { select: { id: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error("[GET /api/conversations/[id]/messages]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch messages" } },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { conversation, hasAccess } = await getConversationAndVerifyAccess(id, session.user.id);

    if (!conversation) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Conversation not found" } },
        { status: 404 }
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);

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

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        sender: { select: { id: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ data: message, message: "Message sent" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations/[id]/messages]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}
