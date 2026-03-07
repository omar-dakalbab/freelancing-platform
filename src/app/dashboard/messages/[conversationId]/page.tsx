import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessagesLayout } from "@/features/messaging/messages-layout";

export const metadata = { title: "Messages" };

type PageProps = { params: Promise<{ conversationId: string }> };

export default async function ConversationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { conversationId } = await params;

  return <MessagesLayout session={session} activeConversationId={conversationId} />;
}
